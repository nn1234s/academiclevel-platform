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
      return {
        questions: OfflineBankService.getQuestions(board, grade, subjectId, levelNode),
        source: 'CURATED_OFFLINE',
        latencyMs: Date.now() - startTime,
        notice: 'Served from Curated Syllabus Bank (Offline mode requested)'
      };
    }

    try {
      // 1. Try server backend endpoint first with a 4-second race guard
      const serverFetchPromise = fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, grade, subjectId, levelNode, count })
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return res.json();
      });

      const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 4200)
      );

      const raceResult = await Promise.race([serverFetchPromise, timeoutPromise]);

      if ('timeout' in raceResult) {
        console.warn('[HybridQuizService] Server AI call timed out; engaging syllabus bank fallback.');
        return {
          questions: OfflineBankService.getQuestions(board, grade, subjectId, levelNode),
          source: 'CURATED_OFFLINE',
          latencyMs: Date.now() - startTime,
          notice: 'AI generation timed out (Resilient bank loaded)'
        };
      }

      if (raceResult.success && Array.isArray(raceResult.questions) && raceResult.questions.length > 0) {
        return {
          questions: raceResult.questions,
          source: 'GEMINI_LIVE',
          model: raceResult.model || 'gemini-1.5-flash',
          latencyMs: Date.now() - startTime,
          notice: 'Live AI Generated via Google Gemini 1.5 Flash'
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
            model: 'gemini-1.5-flash',
            latencyMs: Date.now() - startTime,
            notice: 'Live AI Generated via Client Gemini Key'
          };
        }
      }
    } catch (err: any) {
      console.warn('[HybridQuizService] Network / AI error:', err.message);
    }

    // Default Fallback: Instant curated offline question bank
    return {
      questions: OfflineBankService.getQuestions(board, grade, subjectId, levelNode),
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
    try {
      const prompt = `Generate exactly ${count} multiple choice questions for ${board} Class ${grade} ${subjectId} at ${levelNode} level.
Return a valid JSON array of objects with keys: text, options (array of 4 strings), correctIndex (0-3), explanation, hint, difficulty ("EASY"|"MEDIUM"|"HARD"), topicTag.`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

      if (!res.ok) return null;
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) return null;

      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const list = JSON.parse(cleaned);
      if (!Array.isArray(list)) return null;

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
      return null;
    }
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
          model: data.model || 'gemini-1.5-flash'
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
      model: 'gemini-1.5-flash'
    };
  }

  /**
   * Save config to server and sync client
   */
  public static async saveConfig(
    geminiApiKey: string,
    preferLiveAi: boolean,
    adminEmail = 'naitiknanda1235@gmail.com'
  ): Promise<{ success: boolean; message: string }> {
    this.setClientStoredKey(geminiApiKey);
    this.setPreferLiveAi(preferLiveAi);

    try {
      const res = await fetch('/api/admin/ai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
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
    customApiKey?: string,
    adminEmail = 'naitiknanda1235@gmail.com'
  ): Promise<{ success: boolean; latencyMs?: number; message?: string; error?: string }> {
    const key = customApiKey || this.getClientStoredKey();

    try {
      const res = await fetch('/api/admin/ai/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
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
          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
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
            return { success: true, latencyMs, message: 'Gemini 1.5 Flash direct ping verified!' };
          }
          return { success: false, error: `Direct ping HTTP ${r.status}` };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      }
      return { success: false, error: err.message };
    }
  }
}
