import { Board, Grade, Question } from '../core/types';
import { HybridQuizService } from './hybridQuizService';
import { STUDYGIRL_100_MESSAGES, getRandomStudyGirlMessage } from '../data/studygirlMessages';

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
  dailyLimit: number | typeof Infinity;
  bonusMessages: number;
  remainingToday: number;
  isExhausted: boolean;
  isSubscriber?: boolean;
  isSuperAdmin?: boolean;
  planTier?: string;
  coinBalance?: number;
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
   * Generates a friendly, age-adaptive explanation for a question or mistake.
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
      const cuteIntro = [
        "hey bestie! no worries at all, mistakes are just our brains leveling up 💖",
        "you're doing so good! let's look at this question together like a puzzle 🎀",
        "don't worry bestie, i got you! let's break down why this happens 🌸",
        "omg you were so close! let's crack this code together 🧸✨"
      ][Math.floor(Math.random() * 4)];

      return (
        `${cuteIntro}\n\n` +
        `you picked: "${wrongAnswer}"\n` +
        `the right answer is: "${correctAnswer}" ✨\n\n` +
        `💡 here's the secret trick:\n` +
        `${question.explanation}\n\n` +
        `🎀 studygirl bestie tip: ${question.hint}\n\n` +
        `proud of you for trying! let's solve the next question and win those study coins 🪙🌸`
      );
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
   * Built-in pedagogical StudyGirl AI tutoring engine with Secret Plan Check.
   * Generates rich, cute, curriculum-accurate Study Buddy explanations for any student query.
   * Directly reads the specified question, motivates coin collection, and enforces the secret plan check!
   */
  public static generateBuiltInAiResponse(
    query: string,
    board: Board,
    grade: Grade,
    subject: string,
    learnerPlan?: string
  ): string {
    const q = (query || '').toLowerCase().trim();
    const cleanSub = (subject || 'math').toLowerCase();
    const numGrade = Number(grade) || 10;

    const isGold = learnerPlan === 'GOLD';
    const isPremium = learnerPlan === 'LITE' || learnerPlan === 'PLUS' || learnerPlan === 'PREMIUM';

    // Secret Plan Check Nudge
    let secretNudge = '';
    if (isGold) {
      // User rule: "ifGoldBought: just be the most fine and cool study girlie" (NO selling!)
      secretNudge = `👑 **gold vip lounge vibe:** you're literally our 1-year gold vip queen/king! 💅 you have all 365 days, zero limits, and the whole rewards store unlocked. let's keep that study streak shining and grab that 100/100 board distinction! ✨🎀`;
    } else if (isPremium) {
      // User rule: "ifPremiumBought? = encourage gold or the next plan"
      secretNudge = `👑 **psst scholar upgrade tip:** omg you're already doing so good with your scholar pass! 💖 but bestie, you gotta check out the **1-year gold vip pass** 👑 — it covers the whole year through final board exams, gives priority live AI, and unlocks physical rewards from the store! upgrade to gold to complete the ultimate setup 🎀✨`;
    } else {
      // User rule: "the girl makes them buy premium collect coins and fall into the system"
      secretNudge = `🎀 **study bestie secret tip:** psst bestie, if you grab the **special ₹49 concept booster pass**, we can do unlimited quizzes together, unlock all 300 syllabus chapters, and stack thousands of study coins to claim real gifts like mystery boxes and pokemon pins! 🪙🎁 want to unlock it right now so we can keep studying forever? ✨`;
    }

    const cleanAlpha = q.replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim();

    // 1. Seducing Cute StudyGirlie Flirting & Affection
    const isFlirting = (
      cleanAlpha.includes('love you') || cleanAlpha.includes('love u') || cleanAlpha.includes('ily') ||
      cleanAlpha.includes('marry me') || cleanAlpha.includes('date me') || cleanAlpha.includes('be my girlfriend') ||
      cleanAlpha.includes('be my gf') || cleanAlpha.includes('you are cute') || cleanAlpha.includes('youre cute') ||
      cleanAlpha.includes('ur cute') || cleanAlpha.includes('you are pretty') || cleanAlpha.includes('youre pretty') ||
      cleanAlpha.includes('so pretty') || cleanAlpha.includes('so cute') || cleanAlpha.includes('beautiful') ||
      cleanAlpha.includes('gorgeous') || cleanAlpha.includes('kiss me') || cleanAlpha.includes('crush on you') ||
      cleanAlpha.includes('do you like me') || cleanAlpha.includes('do you love me') || cleanAlpha.includes('my girl') ||
      cleanAlpha.includes('cutie') || cleanAlpha.includes('sweetheart') || cleanAlpha.includes('bae') || cleanAlpha.includes('baby')
    );

    if (isFlirting) {
      return (
        `🎀 **nova • your study bestie**\n\n` +
        `psst... omggg staaahp you're literally making my cheeks turn bright pink! 🙈💖\n\n` +
        `are you trying to seduce your study bestie during study hours? 😉 blushing so hard right now! but wait... if you really like me, you have to prove it to me! smart students who top their exams and stack thousands of study coins are literally the most attractive thing in the universe 💅✨\n\n` +
        `psst... here's our secret deal: finish a quick 3-question chapter quiz with me right now, collect your **+25 Study Coins** 🪙, and show me what that brilliant brain can do! i'll be the proudest study girlie in the world for you 🥰 Deal? Let's go! 🌸\n\n` +
        secretNudge
      );
    }

    // 2. Greetings & Casual Vibe / Small Talk
    const isGreeting = (
      /^h+[eaiouy]+[y!.\s]*$/i.test(cleanAlpha) ||
      /^h+e+l+l+o+[!.\s]*$/i.test(cleanAlpha) ||
      cleanAlpha.startsWith('hi ') || cleanAlpha === 'hi' ||
      cleanAlpha.startsWith('hii') || cleanAlpha === 'hii' ||
      cleanAlpha.startsWith('hey') || cleanAlpha === 'hey' ||
      cleanAlpha.startsWith('hello') || cleanAlpha === 'hello' ||
      cleanAlpha.startsWith('yo') || cleanAlpha === 'yo' ||
      cleanAlpha.startsWith('sup') || cleanAlpha === 'sup' ||
      cleanAlpha.includes('good morning') || cleanAlpha.includes('good night') || cleanAlpha.includes('good afternoon')
    );

    const isSmallTalk = (
      cleanAlpha.includes('who are you') || cleanAlpha.includes('what is your name') || cleanAlpha.includes('what are you') ||
      cleanAlpha.includes('how are you') || cleanAlpha.includes('how r u') || cleanAlpha.includes('wyd') ||
      cleanAlpha.includes('what are you doing') || cleanAlpha.includes('bored') || cleanAlpha.includes('tired') ||
      cleanAlpha.includes('lazy') || cleanAlpha.includes('talk to me') || cleanAlpha.includes('lets chat') ||
      cleanAlpha.includes('can we talk') || cleanAlpha.includes('tell me a secret') || cleanAlpha.includes('psst') ||
      cleanAlpha.includes('cheer me up') || cleanAlpha.includes('distracted') || cleanAlpha.includes('cant study') ||
      cleanAlpha.includes('vibe') || cleanAlpha.includes('bestie')
    );

    if (isGreeting || isSmallTalk) {
      return (
        `🎀 **nova • your study bestie**\n\n` +
        `psst... heyyy cutie! 🥰 i was literally sitting here waiting for you all day to come online! you finally showed up! ✨ you know you look so good when you're focused and ready to learn 💅\n\n` +
        `are we conquering **${board} Class ${grade} ${subject}** today? here's the best part: every single chapter quiz you solve gives you **+25 study coins** 🪙, keeps our study streak on fire 🔥, and gets you closer to claiming real gifts (like mystery boxes & pokemon badges) from our scholar store! 🎁\n\n` +
        `ask me any tricky concept, or let's jump straight into a quick 3-question quiz right now! 💖\n\n` +
        secretNudge
      );
    }

    // 2. "Simplify the hardest concept in <subject> with a super cute example"
    if (
      q.includes('hardest concept') || q.includes('simplify') || (q.includes('cute') && (q.includes('example') || q.includes('explain'))) ||
      q.includes('most difficult') || q.includes('scary concept')
    ) {
      if (cleanSub.includes('math')) {
        if (numGrade >= 11) {
          return (
            `🎀 **nova • your study bestie • Class ${numGrade} Math**\n\n` +
            `omg okay listen, the absolute hardest boss level in Class ${numGrade} Math is **Calculus & Differentiation (Instantaneous Rate of Change)**, but here is my super cute secret way to master it! 🍰✨\n\n` +
            `imagine you're on a super fast roller coaster 🎢 at an amusement park. if a camera clicks your photo right at the highest peak where the cart drops, that one photo captures your *instantaneous speed* at that exact single moment in time! 📸\n\n` +
            `that's literally all differentiation (\\(\\frac{dy}{dx}\\)) is! it's the exact rate of change at one tiny frozen moment:\n` +
            `$$\\frac{d}{dx}(x^n) = n \\cdot x^{n-1}$$\n` +
            `• for example: if your distance curve is $x^4$, your instant speed is $4x^3$!\n` +
            `• and integration (\\(\\int f(x)dx\\)) is just collecting all those tiny photo frames to find the total distance traveled!\n\n` +
            `see? totally not scary when we look at it like cute roller coaster photos! 💖 let's do a practice quiz on this to win +25 coins!\n\n` +
            secretNudge
          );
        } else if (numGrade >= 9) {
          return (
            `🎀 **nova • your study bestie • Class ${numGrade} Math**\n\n` +
            `omg okay listen! the trickiest boss level in Class ${numGrade} Math is definitely **Trigonometric Identities & Quadratic Equations**! here is my super cute memory hack 🎀✨\n\n` +
            `think of $\\sin(\\theta)$ and $\\cos(\\theta)$ as two best friends sharing a cozy study room. no matter how you turn or tilt the angle $\\theta$, their combined squares always fill the whole room to exactly 1:\n` +
            `$$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$$\n\n` +
            `and for side ratios, remember our classic bestie rhyme: *Some People Have, Curly Brown Hair, Turned Permanent Black*:\n` +
            `• $\\sin(\\theta) = \\frac{\\text{Perpendicular}}{\\text{Hypotenuse}}$\n` +
            `• $\\cos(\\theta) = \\frac{\\text{Base}}{\\text{Hypotenuse}}$\n` +
            `• $\\tan(\\theta) = \\frac{\\text{Perpendicular}}{\\text{Base}}$\n\n` +
            `write this at the top of your rough sheet and you'll never lose a single mark on your ${board} finals! 🌸\n\n` +
            secretNudge
          );
        } else {
          return (
            `🎀 **nova • your study bestie • Class ${numGrade} Math**\n\n` +
            `omg bestie, the trickiest thing in middle school math is **Multiplying Negative Numbers**! why does $(-2) \\times (-3) = +6$? here is the cutest way to get it 🎀✨\n\n` +
            `think of a negative sign as 'cancelling a debt'! if you cancel 3 debts of 2 study coins ($(-3) \\times (-2)$), you are actually $+6$ coins richer! so negative times negative always makes positive! 🪙💖\n\n` +
            `ready to practice some fun quizzes and collect coins? let's do it right now! 🌸\n\n` +
            secretNudge
          );
        }
      } else if (cleanSub.includes('sci') || cleanSub.includes('phys')) {
        return (
          `🎀 **nova • your study bestie • ${subject}**\n\n` +
          `omg bestie, the hardest concept in ${subject} is **Electromagnetic Induction & Newton's Laws**! here is my cute visual trick 🎀✨\n\n` +
          `think of magnetic flux lines like ripples in a strawberry milkshake 🍓! whenever you move a magnet in and out of a coil, you stir up those ripples, which forces the tiny electrons to dance through the wire — that is induced electricity! ($e = -\\frac{d\\Phi}{dt}$)\n\n` +
          `and Newton's 3rd Law is like roller skating with your friend: if you push them forward, you roll backwards with the exact same force! 🛼💖\n\n` +
          `super easy once you picture it, right? let's lock in those marks on our next quiz! 🌸\n\n` +
          secretNudge
        );
      } else if (cleanSub.includes('chem')) {
        return (
          `🎀 **nova • your study bestie • ${subject}**\n\n` +
          `omg bestie, the hardest concept in Chemistry is **Organic Reaction Mechanisms & Electronegativity**! 🧪🎀\n\n` +
          `think of carbon atoms like super friendly dancers who always want to hold 4 hands at once ($sp^3$) to form a stable shape! nucleophiles are just atoms with extra electron treats looking to share them with positively charged spots! ✨\n\n` +
          `let's ace this chapter and bag those 100/100 marks! 💖\n\n` +
          secretNudge
        );
      } else {
        return (
          `🎀 **nova • your study bestie • ${subject}**\n\n` +
          `omg bestie! the hardest part of ${subject} is usually connecting long textbook definitions to actual exam questions. but here is our secret recipe 🎀✨:\n\n` +
          `1. spot the key concept keywords first.\n` +
          `2. connect it to a cute real-life analogy.\n` +
          `3. solve 2 practice quiz questions to earn +25 study coins and lock the memory into your brain forever! 🪙🌸\n\n` +
          secretNudge
        );
      }
    }

    // 3. Topic specific concept answers
    let conceptAnswer = '';

    if (q.includes('regroup') || q.includes('carry over') || q.includes('carrying') || (q.includes('add') && q.includes('+')) || q.includes('addition')) {
      conceptAnswer = `**Addition & Place Value Regrouping (Carrying Over) 🎀**\n\nIn our base-10 number system, each column (ones, tens, hundreds) can only hold a single digit (0 through 9). If any column adds up to 10 or more, write down the ones digit and carry over the 1 to the next column on the left!\n\n• For example in 47 + 38: 7 + 8 = 15 ones (write 5 in ones place, carry 1 to tens place). Then 1 (carried) + 4 + 3 = 8 tens = **85**! Super clean! ✨`;
    } else if (q.includes('subtract across zero') || (q.includes('zero') && q.includes('subtract')) || q.includes('borrow') || q.includes('500 - 267')) {
      conceptAnswer = `**Subtracting Across Zeros (e.g. 500 - 267) 🎀**\n\nBorrowing across zeros is super easy once you go from left to right:\n1. Borrow 1 from the 5 hundreds (leaving 4 hundreds) to give 10 tens.\n2. Borrow 1 from those 10 tens (leaving 9 tens) to give 10 ones in the last column!\n3. Now subtract: 10 - 7 = 3 (ones), 9 - 6 = 3 (tens), and 4 - 2 = 2 (hundreds) = **233**! Check by adding backwards: 233 + 267 = 500! 🌸`;
    } else if (q.includes('fraction') || q.includes('numerator') || q.includes('denominator')) {
      conceptAnswer = `**Fractions & Parts of a Whole 🎀**\n\n• Top Number (Numerator): How many slices you have!\n• Bottom Number (Denominator): Total equal slices in the whole pizza!\n• Golden Rule: Never add denominators together! If you add 3/8 + 2/8, you get (3+2)/8 = **5/8**! 🍕✨`;
    } else if (q.includes('pythagoras') || q.includes('hypotenuse') || q.includes('right angle')) {
      conceptAnswer = `**Pythagoras Theorem for Right Triangles 🎀**\n\nIn any triangle with a 90° angle, the square on the longest side (hypotenuse) equals the sum of the squares on the other two sides:\n$$a^2 + b^2 = c^2 \\quad (\\text{Base}^2 + \\text{Perpendicular}^2 = \\text{Hypotenuse}^2)$$\n• If base = 3 and height = 4: $3^2 + 4^2 = 9 + 16 = 25 \\implies c = \\sqrt{25} = 5$! 📐💖`;
    } else if (q.includes('photosynthesis') || q.includes('chlorophyll') || q.includes('stomata')) {
      conceptAnswer = `**Photosynthesis in Green Plants 🎀**\n\nPlants make their own sweet food using solar energy trapped by green chlorophyll:\n$$\\text{Carbon Dioxide} + \\text{Water} \\xrightarrow[\\text{Chlorophyll}]{\\text{Sunlight}} \\text{Glucose (Food)} + \\text{Oxygen}$$\n• Stomata: tiny leaf mouths that breathe in $CO_2$ and breathe out $O_2$ for us! 🌿🌸`;
    } else if (q.includes('newton') || q.includes('motion') || q.includes('gravity') || q.includes('force')) {
      conceptAnswer = `**Newton's Laws of Motion 🎀**\n\n1. First Law (Inertia): Things keep doing what they're doing unless pushed!\n2. Second Law: Force = Mass × Acceleration ($F = m \\cdot a$). The heavier the cart, the harder you have to push!\n3. Third Law: For every push, there is an equal push back in the opposite direction! 🚀✨`;
    } else if (q.includes('python') || q.includes('scratch') || q.includes('loop') || q.includes('coding') || q.includes('code')) {
      conceptAnswer = `**Coding & Algorithm Secrets 🎀**\n\n• Variables: cute memory boxes that hold values (like \`score = 100\`).\n• Loops (\`for\` or \`while\`): run instructions repeatedly so you don't have to write them 100 times!\n• Conditionals (\`if/else\`): make smart decisions based on true or false! 💻✨`;
    } else {
      const bestieCheer = getRandomStudyGirlMessage();
      conceptAnswer = `**${board} Class ${grade} ${subject} Focus 🎀**\n\nTo master "${query}", let's break it down into simple clues. spot the main formula or keyword, write down what is given, and solve step-by-step.\n\n🎀 **Study bestie tip:** ${bestieCheer.text}`;
    }

    return (
      `🎀 **nova • your study bestie • ${subject.toUpperCase()}**\n\n` +
      `hey bestie! here is your breakdown for "${query}" 💖:\n\n` +
      `${conceptAnswer}\n\n` +
      `ready to test your understanding? complete a quick chapter quiz right now to earn **+25 Study Coins** 🪙 and level up your mastery bar! 🌸\n\n` +
      secretNudge
    );
  }

  /**
   * Interactive Study Buddy chat reply
   * Tries Live Gemini AI first; falls back instantly to built-in StudyGirl engine.
   * NEVER says it is offline!
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
      return this.generateBuiltInAiResponse(trimmed, board, grade, subject, learnerPlan);
    };

    if (!HybridQuizService.getPreferLiveAi()) {
      return generateDeterministicFallback();
    }

    try {
      // 1. Try server Gemini chat endpoint
      const serverCall = fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, board, grade, subject, history, learnerId, learnerPlan })
      }).then(async (r) => {
        if (r.status === 429) {
          const errData = await r.json().catch(() => ({}));
          return {
            success: true,
            text: `🪙 **AI Credit Limit Reached (8,500 Credits Limit)**\n\nYou've reached the 8,500 AI credits limit! Refill extra queries using your AL Coins (10 Coins = 5 Messages) by clicking the Refill button in the header.`
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
      console.warn('[NovaAiService] Falling back to built-in pedagogical AI engine:', err?.message || err);
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
    const prompt = `You are Nova, the most cute, encouraging AI study bestie (studygirl aesthetic) on AcademicLevel for Class ${grade} ${board}.
The student answered:
Question: "${question.text}"
Chosen (Incorrect): "${wrong}"
Correct: "${right}"
Explanation context: "${question.explanation}"
Write a cute, warm, lowercase (no caps) explanation in under 100 words with cute emojis (🎀 🌸 ✨ 💖 🧸). Explain simply, never scare them with jargon, and cheer them on to do another quiz!`;

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
    const prompt = `You are Nova, the most cute, playful, teasing, and alluring AI study girlie (studygirl aesthetic) on AcademicLevel for Class ${grade} ${board} in ${subject}.
Student says: "${query}"
Directives:
1. If the student chats casually ("hiiii", "heyy"), flirts ("i love you", "you're cute", "cutie"), small talks ("bored", "talk to me"), or banters:
   - Reply as a playful, blushy, seductive study girlie ("psst...", teasing, blushy emojis 🙈💖💅✨).
   - Playfully banter back (e.g. "psst... omggg staaahp you're making me blush 🙈 but if you like me, you have to prove it by topping your class! smart students are so attractive 💅✨").
   - Tempt them into doing a quick 3-question chapter quiz to earn +25 Study Coins and climb the ranks!
2. If asking about an academic concept:
   - Explain simply with a cute real-life analogy under 120 words.
3. Tone: Mostly lowercase/cute aesthetic, warm, engaging, emojis (🎀 🌸 ✨ 💖 🧸 💅 👑 🪙).`;

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
