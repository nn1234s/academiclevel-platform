import { Board, Grade, Question } from '../core/types';
import { HybridQuizService } from './hybridQuizService';

export interface NovaMessage {
  id: string;
  sender: 'STUDENT' | 'NOVA';
  text: string;
  timestamp: string;
  source?: 'GEMINI_LIVE' | 'CURATED_OFFLINE';
  metadata?: {
    board?: Board;
    grade?: Grade;
    subject?: string;
  };
}

export interface StudentAiQuota {
  dailyUsed: number;
  dailyLimit: number;
  bonusMessages: number;
  remainingToday: number;
  isExhausted: boolean;
  coinBalance?: number;
}

export class NovaAiService {
  private static AI_TIMEOUT_MS = 4500;
  private static CLIENT_MODEL_CHAIN = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemma-4-27b-it', 'gemini-1.5-flash'];

  /**
   * Fetches the current student's AI message quota.
   */
  public static async getStudentQuota(learnerId: string): Promise<StudentAiQuota | null> {
    try {
      const res = await fetch(`/api/ai/quota/${encodeURIComponent(learnerId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.quota || null;
    } catch {
      return null;
    }
  }

  /**
   * Unlocks extra Nova AI messages using AL Coins.
   */
  public static async buyAiMessages(learnerId: string, packType: 'PACK_5' | 'PACK_12' = 'PACK_5'): Promise<{ success: boolean; message: string; quota?: StudentAiQuota; newCoinBalance?: number }> {
    try {
      const res = await fetch('/api/ai/buy-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnerId, packType })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to buy messages.' };
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network anomaly.' };
    }
  }

  /**
   * Generates a Socratic, age-adaptive explanation for a question or mistake.
   * Tries Live Gemini AI first; falls back instantly to deterministic rubric.
   */
  public static async explainMistake(
    question: Question,
    chosenIndex: number,
    board: Board,
    grade: Grade
  ): Promise<string> {
    const wrongAnswer = question.options[chosenIndex] || 'your choice';
    const correctAnswer = question.options[question.correctIndex];

    const generateDeterministicFallback = (): string => {
      if (grade <= 4) {
        return (
          `🌟 Hi young explorer! Let's solve this together!\n\n` +
          `You picked: "${wrongAnswer}". Good try, but not quite!\n` +
          `The magic answer is: "${correctAnswer}".\n\n` +
          `💡 Here is why: ${question.explanation}\n\n` +
          `🌈 Super Tip: ${question.hint} Keep smiling and keep practicing!`
        );
      } else if (grade <= 8) {
        return (
          `🎯 Great effort! Let's understand where the logic diverted:\n\n` +
          `You selected: "${wrongAnswer}".\n` +
          `Correct answer: "${correctAnswer}".\n\n` +
          `🔍 Socratic Breakdown:\n` +
          `${question.explanation}\n\n` +
          `📌 Key Takeaway for ${board} Class ${grade}: Notice the key clue "${question.hint}". Next time you encounter this pattern, look for that pivot first!`
        );
      } else {
        return (
          `📊 Diagnostic Analysis (${board} Class ${grade} Standards):\n\n` +
          `Selected Option: [${chosenIndex + 1}] "${wrongAnswer}" (Incorrect)\n` +
          `Verified Correct: [${question.correctIndex + 1}] "${correctAnswer}"\n\n` +
          `📐 Analytical Solution & Board Marking Scheme:\n` +
          `${question.explanation}\n\n` +
          `⚠️ Common Exam Pitfall: ${question.hint}\n` +
          `Remember: In ${board} examinations, precision in units and step derivation awards full fractional credit.`
        );
      }
    };

    // If student opted out of live AI, return template immediately
    if (!HybridQuizService.getPreferLiveAi()) {
      return generateDeterministicFallback();
    }

    try {
      // 1. Try server Gemini explanation endpoint with race timeout
      const serverCall = fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chosenIndex, board, grade })
      }).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });

      const timeoutCall = new Promise<{ timeout: true }>((resolve) =>
        setTimeout(() => resolve({ timeout: true }), this.AI_TIMEOUT_MS)
      );

      const res = await Promise.race([serverCall, timeoutCall]);

      if (!('timeout' in res) && res.success && res.explanation) {
        return `✨ [Nova Live AI]\n\n${res.explanation}`;
      }

      // 2. Try direct client Gemini API if client key exists
      const clientKey = HybridQuizService.getClientStoredKey();
      if (clientKey) {
        const directResp = await this.directClientExplain(clientKey, question, chosenIndex, board, grade);
        if (directResp) return `✨ [Nova Live AI]\n\n${directResp}`;
      }
    } catch (err) {
      console.warn('[NovaAiService] Falling back to offline syllabus rubric:', err);
    }

    return generateDeterministicFallback();
  }

  /**
   * Interactive Socratic chat reply
   * Tries Live Gemini AI first; falls back instantly to deterministic rubric.
   */
  public static async answerStudentQuery(
    query: string,
    board: Board,
    grade: Grade,
    subject: string,
    history?: { role: 'user' | 'model'; text: string }[],
    learnerId?: string
  ): Promise<string> {
    const trimmed = query.trim();

    const generateDeterministicFallback = (): string => {
      if (grade <= 4) {
        return (
          `🎈 Hello! In Class ${grade} ${subject}, everything is about curiosity! ` +
          `Regarding "${trimmed}": Think of it like building with bright blocks. What is the very first step you would take?`
        );
      } else if (grade <= 8) {
        return (
          `💡 That's a sharp inquiry about "${trimmed}" in ${board} ${subject}! ` +
          `Before giving the direct formula, let me ask: what happens to the result if you increase the primary variable? What rule did we discuss in our last module?`
        );
      } else {
        return (
          `📚 Analytical Guidance (${board} Class ${grade} — ${subject}):\n\n` +
          `Regarding "${trimmed}":\n` +
          `1. **Theoretical Foundation**: Start from first principles according to the official ${board} syllabus.\n` +
          `2. **Key Derivation/Application**: Identify known variables and boundary conditions.\n` +
          `3. **Exam Tip**: Examiners award partial step-marking for stating the governing law before calculating numerical answers.`
        );
      }
    };

    if (!HybridQuizService.getPreferLiveAi()) {
      return generateDeterministicFallback();
    }

    try {
      // 1. Try server Gemini chat endpoint
      const serverCall = fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, board, grade, subject, history, learnerId })
      }).then(async (r) => {
        if (r.status === 429) {
          const errData = await r.json().catch(() => ({}));
          return {
            success: true,
            text: `🪙 **Daily AI Limit Reached (8/8 Free Messages)**\n\nYou've used your 8 daily AI tutor queries! Refill instantly using your AL Coins (10 Coins = 5 Messages) by clicking the Refill button in the header.`
          };
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });

      const timeoutCall = new Promise<{ timeout: true }>((resolve) =>
        setTimeout(() => resolve({ timeout: true }), this.AI_TIMEOUT_MS)
      );

      const res = await Promise.race([serverCall, timeoutCall]);

      if (!('timeout' in res) && res.success && res.text) {
        return res.text;
      }

      // 2. Direct client Gemini call if key exists
      const clientKey = HybridQuizService.getClientStoredKey();
      if (clientKey) {
        const directText = await this.directClientChat(clientKey, trimmed, board, grade, subject);
        if (directText) return directText;
      }
    } catch (err: any) {
      console.warn('[NovaAiService] Falling back to deterministic chat response:', err?.message || err);
    }

    return generateDeterministicFallback();
  }

  private static async directClientExplain(
    apiKey: string,
    question: Question,
    chosenIndex: number,
    board: Board,
    grade: Grade
  ): Promise<string | null> {
    const wrong = question.options[chosenIndex] || 'selected choice';
    const right = question.options[question.correctIndex] || 'correct choice';
    const prompt = `You are Nova AI, a Socratic tutor on AcademicLevel. A Class ${grade} ${board} student answered:
Question: "${question.text}"
Chosen (Incorrect): "${wrong}"
Correct: "${right}"
Explanation context: "${question.explanation}"
Provide an age-appropriate Socratic breakdown under 120 words.`;

    for (const model of this.CLIENT_MODEL_CHAIN) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
            }),
            signal: controller.signal
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) return text;
        }
      } catch {
        // Continue to fallback model in chain
      }
    }
    return null;
  }

  private static async directClientChat(
    apiKey: string,
    query: string,
    board: Board,
    grade: Grade,
    subject: string
  ): Promise<string | null> {
    const prompt = `You are Nova AI, a supportive Socratic tutor for Class ${grade} ${board} in ${subject}.
Student asks: "${query}"
Guide them Socratically in under 120 words.`;

    for (const model of this.CLIENT_MODEL_CHAIN) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.5 }
            }),
            signal: controller.signal
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) return text;
        }
      } catch {
        // Continue to fallback model in chain
      }
    }
    return null;
  }
}
