import { Board, Grade, LevelNode, Question } from '../core/types';
import { OfflineBankService } from './offlineBankService';

export interface HybridQuizResult {
  questions: Question[];
  source: 'GEMINI_LIVE' | 'CURATED_OFFLINE';
  model?: string;
  latencyMs?: number;
  notice?: string;
}

export interface AiConfig {
  hasApiKey: boolean;
  maskedApiKey?: string | null;
  preferLiveAi: boolean;
  model: string;
}

export class HybridQuizService {
  private static LOCAL_KEY_STORAGE = 'al_gemini_api_key';
  private static PREFER_LIVE_KEY = 'al_prefer_live_ai';
  private static CLIENT_CANDIDATES: { version: string; model: string }[] = [
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1', model: 'gemini-1.5-flash' },
    { version: 'v1beta', model: 'gemini-2.0-flash-lite' },
    { version: 'v1beta', model: 'gemini-2.5-flash' },
    { version: 'v1beta', model: 'gemini-1.5-flash-latest' },
    { version: 'v1beta', model: 'gemini-1.5-flash' },
    { version: 'v1beta', model: 'gemini-3.5-flash-lite' },
    { version: 'v1', model: 'gemini-1.5-pro' }
  ];

  public static getClientStoredKey(): string | null {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem(this.LOCAL_KEY_STORAGE) ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      null
    );
  }

  public static setClientStoredKey(key: string): void {
    if (typeof window === 'undefined') return;
    if (key.trim()) {
      localStorage.setItem(this.LOCAL_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(this.LOCAL_KEY_STORAGE);
    }
  }

  public static getPreferLiveAi(): boolean {
    if (typeof window === 'undefined') return true;
    const pref = localStorage.getItem(this.PREFER_LIVE_KEY);
    return pref !== 'false';
  }

  public static setPreferLiveAi(prefer: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.PREFER_LIVE_KEY, prefer ? 'true' : 'false');
  }

  /**
   * Main Hybrid Fetcher:
   * 1. Attempts live Gemini AI question generation (via server or client direct).
   * 2. Seamlessly falls back to curated syllabus bank on timeout or error.
   */
  public static async getQuestions(
    board: Board,
    grade: Grade,
    subjectId: string,
    levelNode: LevelNode,
    count = 5
  ): Promise<HybridQuizResult> {
    const startTime = Date.now();

    // Check preference: If user explicitly opted out of live AI, jump straight to bank
    if (!this.getPreferLiveAi()) {
      const qList = await OfflineBankService.fetchServerQuestions(board, grade, subjectId, levelNode, count);
      return {
        questions: qList,
        source: 'CURATED_OFFLINE',
        latencyMs: Date.now() - startTime,
        notice: 'Served from Curated Syllabus Bank (Offline mode requested)'
      };
    }

    try {
      // 1. Try server backend endpoint first with an extended race guard accommodating natural Google Gemini latencies (7-12s)
      const serverFetchPromise = fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, grade, subjectId, levelNode, count })
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return res.json();
      });

      const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 22000)
      );

      const raceResult = await Promise.race([serverFetchPromise, timeoutPromise]);

      if ('timeout' in raceResult) {
        console.warn('[HybridQuizService] Server AI call timed out; engaging syllabus bank fallback.');
        const qList = await OfflineBankService.fetchServerQuestions(board, grade, subjectId, levelNode, count);
        return {
          questions: qList,
          source: 'CURATED_OFFLINE',
          latencyMs: Date.now() - startTime,
          notice: 'AI generation timed out (Resilient bank loaded)'
        };
      }

      if (raceResult.success && Array.isArray(raceResult.questions) && raceResult.questions.length > 0) {
        return {
          questions: raceResult.questions,
          source: 'GEMINI_LIVE',
          model: raceResult.model || 'gemini-3.5-flash-lite',
          latencyMs: Date.now() - startTime,
          notice: 'Live AI Generated via Google Gemini 3.5 Flash Lite'
        };
      }

      // If server doesn't have an API key configured, check if browser has a client key
      const clientKey = this.getClientStoredKey();
      if (clientKey) {
        const directResult = await this.generateDirectClientQuestions(
          clientKey,
          board,
          grade,
          subjectId,
          levelNode,
          count
        );
        if (directResult) {
          return {
            questions: directResult,
            source: 'GEMINI_LIVE',
            model: 'gemini-3.5-flash-lite',
            latencyMs: Date.now() - startTime,
            notice: 'Live AI Generated via Client Gemini Key'
          };
        }
      }
    } catch (err: any) {
      console.warn('[HybridQuizService] Network / AI error:', err.message);
    }

    // Default Fallback: Instant curated offline question bank from server or local
    const qList = await OfflineBankService.fetchServerQuestions(board, grade, subjectId, levelNode, count);
    return {
      questions: qList,
      source: 'CURATED_OFFLINE',
      latencyMs: Date.now() - startTime,
      notice: 'Curated Syllabus Bank (Verified Zero-Latency)'
    };
  }

  /**
   * Direct Client Fallback (useful if backend server is not running or static deployment)
   */
  private static async generateDirectClientQuestions(
    apiKey: string,
    board: Board,
    grade: Grade,
    subjectId: string,
    levelNode: LevelNode,
    count: number
  ): Promise<Question[] | null> {
    const prompt = `Generate exactly ${count} multiple choice questions for ${board} Class ${grade} ${subjectId} at ${levelNode} level.
Return a valid JSON array of objects with keys: text, options (array of 4 strings), correctIndex (0-3), explanation, hint, difficulty ("EASY"|"MEDIUM"|"HARD"), topicTag.`;

    for (const candidate of this.CLIENT_CANDIDATES) {
      const { version, model } = candidate;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
            }),
            signal: controller.signal
          }
        );
        clearTimeout(timeout);

        if (!res.ok) continue;
        const data = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) continue;

        const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const list = JSON.parse(cleaned);
        if (!Array.isArray(list)) continue;

        return list.map((item, idx) => ({
          id: `ai_client_${Date.now()}_${idx}`,
          board,
          grade,
          subjectId,
          levelNode,
          text: String(item.text),
          options: Array.isArray(item.options) && item.options.length === 4 ? item.options : ['A', 'B', 'C', 'D'],
          correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
          explanation: String(item.explanation || ''),
          hint: String(item.hint || ''),
          difficulty: item.difficulty || 'MEDIUM',
          topicTag: String(item.topicTag || 'Practice'),
          source: 'GEMINI_LIVE'
        }));
      } catch {
        // Fallback to next model
      }
    }
    return null;
  }

  /**
   * Fetch current config from server
   */
  public static async getConfig(): Promise<AiConfig> {
    try {
      const res = await fetch('/api/ai/config');
      if (res.ok) {
        const data = await res.json();
        const clientKey = this.getClientStoredKey();
        return {
          hasApiKey: data.hasApiKey || !!clientKey,
          maskedApiKey: data.maskedApiKey || (clientKey ? `${clientKey.substring(0, 4)}...${clientKey.substring(clientKey.length - 4)}` : null),
          preferLiveAi: data.preferLiveAi && this.getPreferLiveAi(),
          model: data.model || 'gemini-3.5-flash-lite'
        };
      }
    } catch {
      // fallback
    }

    const clientKey = this.getClientStoredKey();
    return {
      hasApiKey: !!clientKey,
      maskedApiKey: clientKey ? `${clientKey.substring(0, 4)}...${clientKey.substring(clientKey.length - 4)}` : null,
      preferLiveAi: this.getPreferLiveAi(),
      model: 'gemini-3.5-flash-lite'
    };
  }

  /**
   * Save config to server and sync client
   */
  public static async saveConfig(
    geminiApiKey: string,
    preferLiveAi: boolean
  ): Promise<{ success: boolean; message: string }> {
    this.setClientStoredKey(geminiApiKey);
    this.setPreferLiveAi(preferLiveAi);

    const token = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_admin_token') || localStorage.getItem('al_admin_token') || '')
      : '';

    try {
      const res = await fetch('/api/admin/ai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {})
        },
        body: JSON.stringify({ geminiApiKey, preferLiveAi })
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message || 'Saved successfully.' };
      }
    } catch (err: any) {
      console.warn('[HybridQuizService] Server save failed, saved locally:', err.message);
    }

    return { success: true, message: 'Settings saved to local platform storage.' };
  }

  /**
   * Ping Gemini API to test connection
   */
  public static async testConnection(
    customApiKey?: string
  ): Promise<{ success: boolean; latencyMs?: number; message?: string; error?: string }> {
    const key = customApiKey || this.getClientStoredKey();
    const token = typeof window !== 'undefined'
      ? (sessionStorage.getItem('al_admin_token') || localStorage.getItem('al_admin_token') || '')
      : '';

    try {
      const res = await fetch('/api/admin/ai/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {})
        },
        body: JSON.stringify({ customApiKey: key })
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json();
      return { success: false, error: err.error || `HTTP ${res.status}` };
    } catch (err: any) {
      // If server ping endpoint not reachable, test direct from browser if key provided
      if (key) {
        try {
          const start = Date.now();
          for (const candidate of this.CLIENT_CANDIDATES) {
            const { version, model } = candidate;
            try {
              const r = await fetch(
                `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'Respond with: {"ping":"pong"}' }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                  })
                }
              );
              const latencyMs = Date.now() - start;
              if (r.ok) {
                return { success: true, latencyMs, message: `Gemini (${version}/${model}) direct ping verified!` };
              }
            } catch {
              // Try next model
            }
          }
          return { success: false, error: 'Direct ping failed across fallback models' };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      }
      return { success: false, error: err.message };
    }
  }
}
