import { Board, Grade, Question } from '../core/types';
import { HybridQuizService } from './hybridQuizService';

export interface NovaMessage {
  id: string;
  sender: 'STUDENT' | 'NOVA';
  text: string;
  timestamp: string;
  imageUrl?: string;
  isPhotoDoubt?: boolean;
  source?: 'GEMINI_LIVE' | 'CURATED_OFFLINE';
  metadata?: {
    board?: Board;
    grade?: Grade;
    subject?: string;
  };
}

export interface StudentAiQuota {
  dailyUsed: number;
  dailyLimit: number | typeof Infinity;
  bonusMessages: number;
  remainingToday: number;
  isExhausted: boolean;
  isSubscriber?: boolean;
  isSuperAdmin?: boolean;
  planTier?: string;
  coinBalance?: number;
  levelsCompletedToday?: number;
  isInChatBreak?: boolean;
  chatBreakRemainingSeconds?: number;
}

export const AI_CREDITS_LIMIT = 8500;

export class NovaAiService {
  private static AI_TIMEOUT_MS = 20000;
  private static CLIENT_CANDIDATES: { version: string; model: string }[] = [
    { version: 'v1beta', model: 'gemini-3.5-flash-lite' },
    { version: 'v1beta', model: 'gemini-3.1-flash-lite' },
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1beta', model: 'gemini-2.0-flash-lite' },
    { version: 'v1beta', model: 'gemma-2-27b-it' },
    { version: 'v1', model: 'gemini-1.5-flash' },
    { version: 'v1', model: 'gemini-1.5-pro' }
  ];

  /**
   * Fetches the current student's AI message quota.
   */
  public static async getStudentQuota(learnerId: string): Promise<StudentAiQuota | null> {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('al_student_token') || sessionStorage.getItem('al_student_token') || '') : '';
      const res = await fetch(`/api/ai/quota/${encodeURIComponent(learnerId)}`, {
        headers: token ? { 'x-session-token': token } : {}
      });
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
      const token = typeof window !== 'undefined' ? (localStorage.getItem('al_student_token') || sessionStorage.getItem('al_student_token') || '') : '';
      const res = await fetch('/api/ai/buy-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-session-token': token } : {})
        },
        body: JSON.stringify({ learnerId, packType })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to buy messages.' };
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error.' };
    }
  }

  /**
   * Generates a clear, age-appropriate explanation for a question or mistake.
   * Tries Live Gemini AI first; falls back to deterministic syllabus rubric.
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
      return (
        `**Step-by-Step Solution**\n\n` +
        `• **Your choice:** ${wrongAnswer}\n` +
        `• **Correct answer:** ${correctAnswer}\n\n` +
        `**Explanation:**\n${question.explanation || 'Review the core formula and definitions for this chapter.'}\n\n` +
        (question.hint ? `**Study Tip:** ${question.hint}` : '')
      );
    };

    if (!HybridQuizService.getPreferLiveAi()) {
      return generateDeterministicFallback();
    }

    try {
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
        return res.explanation;
      }

      const clientKey = HybridQuizService.getClientStoredKey();
      if (clientKey) {
        const directResp = await this.directClientExplain(clientKey, question, chosenIndex, board, grade);
        if (directResp) return directResp;
      }
    } catch (err) {
      console.warn('[NovaAiService] Falling back to offline syllabus rubric:', err);
    }

    return generateDeterministicFallback();
  }

  /**
   * Client-side deterministic Study Helper fallback (zero server cost when offline or fallback).
   */
  public static generateBuiltInAiResponse(
    query: string,
    board: Board,
    grade: Grade,
    subject: string,
    _learnerPlan?: string,
    _learnerId?: string
  ): string {
    const q = (query || '').toLowerCase().trim();
    const cleanAlpha = q.replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim();
    const cleanSub = (subject || 'math').toLowerCase();
    const numGrade = Number(grade) || 10;

    // Child-safe boundary guard
    const isPersonalOrRomantic = (
      cleanAlpha.includes('love') || cleanAlpha.includes('ily') ||
      cleanAlpha.includes('marry') || cleanAlpha.includes('date me') || cleanAlpha.includes('dating') ||
      cleanAlpha.includes('girlfriend') || cleanAlpha.includes('boyfriend') ||
      cleanAlpha.includes('kiss') || cleanAlpha.includes('hug') ||
      cleanAlpha.includes('crush') || cleanAlpha.includes('flirt') ||
      cleanAlpha.includes('be mine') || cleanAlpha.includes('sweetheart')
    ) && !cleanAlpha.includes('fine structure') && !cleanAlpha.includes('clover') && !cleanAlpha.includes('glove');

    if (isPersonalOrRomantic) {
      return (
        `Haha, you're too sweet! 😄✨ I'm your AI study buddy though, so my superpower is hyping you up to crush **${board} Class ${grade} ${subject}**!\n\n` +
        `*Psst...* drop any tricky question or chapter doubt right now and let's unlock those Study Coins together! 🪙🚀`
      );
    }

    if (cleanAlpha.includes('secret') || cleanAlpha.includes('psst') || cleanAlpha.includes('tell me something')) {
      return (
        `*Psst...* okay, secret study hack time! 🤫✨\n\n` +
        `Whenever you read a chapter in **${subject}**, try explaining it out loud in 2 simple sentences like you're teaching a 5-year-old — your brain remembers it 3x faster for exams!\n\n` +
        `Want another *psst...* trick for a specific topic? Drop it below! 💖`
      );
    }

    if (cleanAlpha.includes('wyd') || cleanAlpha.includes('what are you doing') || cleanAlpha.includes('whats up') || cleanAlpha.includes('how are you')) {
      return (
        `Just hanging out and waiting to help you crush **${subject}**! 😄✨\n\n` +
        `*Psst...* I've got fresh **${subject}** shortcuts ready whenever you want to speedrun a chapter and grab some Study Coins! 🪙🚀`
      );
    }

    if (/^(hi|hey|hello|yo|gm|gn|good morning|good afternoon|good evening|good night)[!.\s]*$/i.test(cleanAlpha)) {
      return (
        `Heyy! 👋✨ Ready to crush some **${subject}** together?\n\n` +
        `*Psst...* tell me any chapter doubt, weird formula, or ask for a secret memory hack — I've got your back 100%! 💖🚀`
      );
    }

    let conceptAnswer = '';
    if (q.includes('regroup') || q.includes('carry over') || q.includes('carrying') || (q.includes('add') && q.includes('+')) || q.includes('addition')) {
      conceptAnswer = `**Addition & Place Value Regrouping**\n\nEach column (ones, tens, hundreds) holds digits 0–9. When a column sums to 10 or more, write down the ones digit and carry 1 to the next column left.\n\n• Example: $47 + 38 \\rightarrow 7 + 8 = 15$ (write 5, carry 1), then $1 + 4 + 3 = 8$ tens $= \\mathbf{85}$.`;
    } else if (q.includes('subtract across zero') || (q.includes('zero') && q.includes('subtract')) || q.includes('borrow') || q.includes('500 - 267')) {
      conceptAnswer = `**Subtracting Across Zeros (e.g. 500 - 267)**\n\n1. Borrow 1 from 5 hundreds (leaving 4 hundreds) to get 10 tens.\n2. Borrow 1 from 10 tens (leaving 9 tens) to get 10 ones.\n3. Subtract: $10 - 7 = 3$, $9 - 6 = 3$, $4 - 2 = 2 \\rightarrow \\mathbf{233}$.`;
    } else if (q.includes('fraction') || q.includes('numerator') || q.includes('denominator')) {
      conceptAnswer = `**Fractions & Parts of a Whole**\n\n• **Numerator (top):** Selected parts.\n• **Denominator (bottom):** Total equal parts.\n• When denominators match, add only the numerators: $\\frac{3}{8} + \\frac{2}{8} = \\frac{5}{8}$.`;
    } else if (q.includes('pythagoras') || q.includes('hypotenuse') || q.includes('right angle')) {
      conceptAnswer = `**Pythagoras Theorem**\n\nIn a right-angled triangle: $$a^2 + b^2 = c^2$$\n• Example: If $a = 3$ and $b = 4$, then $c = \\sqrt{9 + 16} = 5$.`;
    } else if (q.includes('photosynthesis') || q.includes('chlorophyll') || q.includes('stomata')) {
      conceptAnswer = `**Photosynthesis**\n\n$$\\text{CO}_2 + \\text{H}_2\\text{O} \\xrightarrow[\\text{Chlorophyll}]{\\text{Sunlight}} \\text{Glucose} + \\text{O}_2$$`;
    } else if (q.includes('newton') || q.includes('motion') || q.includes('gravity') || q.includes('force')) {
      conceptAnswer = `**Newton's Laws of Motion**\n\n1. **1st Law:** Inertia.\n2. **2nd Law:** $F = m \\cdot a$.\n3. **3rd Law:** Every action has an equal and opposite reaction.`;
    } else if (q.includes('hardest concept') || q.includes('simplify')) {
      if (cleanSub.includes('math') && numGrade >= 9) {
        conceptAnswer = `**Trigonometric Identities & Calculus**\n\nRemember the fundamental identity: $$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$$`;
      } else {
        conceptAnswer = `**${board} Class ${grade} ${subject} Key Strategy**\n\nBreak the topic into: (1) core definition, (2) governing formula or rule, and (3) one worked example.`;
      }
    } else {
      conceptAnswer = `**${board} Class ${grade} ${subject}**\n\nTo master "${query}", list what is given, identify the core formula or principle, and solve step-by-step while checking units.`;
    }

    return `**Nova • ${subject}**\n\n${conceptAnswer}\n\n*Psst...* solve 2 quick quiz questions on this right now to lock it in your brain & grab Study Coins! 🪙💖`;
  }

  /**
   * Interactive Study Tutor chat reply.
   * Tries server /api/ai/chat; falls back cleanly to built-in deterministic study helper.
   */
  public static async answerStudentQuery(
    query: string,
    board: Board,
    grade: Grade,
    subject: string,
    history?: { role: 'user' | 'model'; text: string }[],
    learnerId?: string,
    learnerPlan?: string
  ): Promise<string> {
    const trimmed = query.trim();

    const generateDeterministicFallback = (): string => {
      return this.generateBuiltInAiResponse(trimmed, board, grade, subject, learnerPlan, learnerId);
    };

    if (!HybridQuizService.getPreferLiveAi()) {
      return generateDeterministicFallback();
    }

    try {
      const serverCall = fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, board, grade, subject, history, learnerId, learnerPlan })
      }).then(async (r) => {
        if (r.status === 429) {
          return {
            success: true,
            text: `**AI Credit Limit Reached**\n\nYou've reached your daily AI credit limit. You can unlock extra messages using AL Coins from the header.`
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

      const clientKey = HybridQuizService.getClientStoredKey();
      if (clientKey) {
        const directText = await this.directClientChat(clientKey, trimmed, board, grade, subject);
        if (directText) return directText;
      }
    } catch (err: any) {
      console.warn('[NovaAiService] Falling back to built-in study helper:', err?.message || err);
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
    const prompt = `You are Nova, a supportive, age-appropriate AI Study Tutor on AcademicLevel for Class ${grade} ${board}.
The student answered:
Question: "${question.text}"
Chosen (Incorrect): "${wrong}"
Correct: "${right}"
Explanation context: "${question.explanation}"
Write a clear, encouraging, step-by-step explanation in under 100 words.`;

    for (const candidate of this.CLIENT_CANDIDATES) {
      const { version, model } = candidate;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
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
        // Continue to fallback model
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
    const prompt = `You are Nova, a safe, supportive AI Study Tutor on AcademicLevel for Class ${grade} ${board} in ${subject}.
Student says: "${query}"
Directives:
1. Maintain a respectful, strictly educational tutor persona. Redirect any personal or off-topic prompts back to ${subject} studies.
2. Explain concepts clearly and step-by-step under 130 words.
3. Never pressure the student to buy plans.`;

    for (const candidate of this.CLIENT_CANDIDATES) {
      const { version, model } = candidate;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
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
        // Continue to fallback model
      }
    }
    return null;
  }
}
