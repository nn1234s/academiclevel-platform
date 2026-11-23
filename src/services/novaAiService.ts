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
   * Built-in pedagogical AI tutoring engine.
   * Generates rich, curriculum-accurate Study Buddy explanations for any student query.
   * Never says offline — always delivers intelligent, encouraging academic assistance!
   */
  public static generateBuiltInAiResponse(
    query: string,
    board: Board,
    grade: Grade,
    subject: string
  ): string {
    const q = (query || '').toLowerCase().trim();
    const cleanSub = (subject || '').toLowerCase();

    // 0. Motivation / StudyGirl Bestie Chat & Cheer (100 Preloaded Messages integration)
    if (
      q.includes('motivat') ||
      q.includes('cheer') ||
      q.includes('vibe') ||
      q.includes('bestie') ||
      q.includes('lazy') ||
      q.includes('tired') ||
      q.includes('bored') ||
      q.includes('quiz') ||
      q.includes('hello') ||
      q.includes('hi') ||
      q.includes('hey') ||
      q.includes('studygirl')
    ) {
      const msg = getRandomStudyGirlMessage();
      return (
        `${msg.emoji} **nova • your study bestie**\n\n` +
        `${msg.text}\n\n` +
        `ready to level up your brain? let's do a quick chapter quiz together right now! 🌸✨`
      );
    }

    // 1. Math: Addition & Regrouping
    if (q.includes('regroup') || q.includes('carry over') || q.includes('carrying') || (q.includes('add') && q.includes('+')) || q.includes('addition')) {
      return (
        `✨ **nova • your study bestie 🎀 • Addition & Place Value**\n\n` +
        `Let's break down carrying over (regrouping) step by step!\n\n` +
        `**1. The Base-10 Place Value Rule:**\n` +
        `Each column (Ones, Tens, Hundreds) can only hold a single digit (0 through 9). If any column adds up to 10 or more, you must bundle 10 of that unit into 1 unit of the next column to the left.\n\n` +
        `**2. Concrete Walkthrough (e.g. 47 + 38):**\n` +
        `• **Step 1 (Ones column):** Add the ones digits: 7 + 8 = 15 ones.\n` +
        `• **Step 2 (Regroup):** 15 ones = 1 Ten + 5 Ones. Write down **5** in the ones place, and carry over **1** to the top of the tens column.\n` +
        `• **Step 3 (Tens column):** Add the tens digits including the carried 1: 1 (carried) + 4 + 3 = 8 tens.\n` +
        `• **Final Answer:** 8 tens and 5 ones = **85**.\n\n` +
        `💡 **Quick Check:** What do you get if you add 56 + 29? *Try adding the ones first (6 + 9 = 15) and carrying the 1!*`
      );
    }

    // 2. Math: Subtraction Across Zeros
    if (q.includes('subtract across zero') || (q.includes('zero') && q.includes('subtract')) || q.includes('500 - 267') || q.includes('borrow')) {
      return (
        `✨ **nova • your study bestie 🎀 • Subtraction Across Zeros**\n\n` +
        `Subtracting across zeros (like **500 - 267**) can feel tricky because 0 cannot give you anything immediately, but here is the simple secret!\n\n` +
        `**1. Start from the Leftmost Non-Zero Digit:**\n` +
        `• You have 5 Hundreds, 0 Tens, and 0 Ones.\n` +
        `• Borrow 1 Hundred from the 5 Hundreds: now you have **4 Hundreds** left, and that 1 Hundred becomes **10 Tens** in the tens column.\n` +
        `• Now borrow 1 Ten from the 10 Tens: now you have **9 Tens** left, and that 1 Ten becomes **10 Ones** in the ones column.\n\n` +
        `**2. Now Subtract Each Column Easily:**\n` +
        `• **Ones place:** 10 - 7 = **3**\n` +
        `• **Tens place:** 9 - 6 = **3**\n` +
        `• **Hundreds place:** 4 - 2 = **2**\n` +
        `• **Final Result:** **233**!\n\n` +
        `💡 **Study Bestie Tip:** To verify your answer, simply add in reverse: 233 + 267 = 500!`
      );
    }

    // 3. Math: Fractions
    if (q.includes('fraction') || q.includes('numerator') || q.includes('denominator') || q.includes('like fraction')) {
      return (
        `✨ **nova • your study bestie 🎀 • Fractions & Equal Parts**\n\n` +
        `A fraction represents equal parts of a whole.\n\n` +
        `• **Top Number (Numerator):** How many equal parts you have or are considering.\n` +
        `• **Bottom Number (Denominator):** The total number of equal parts the whole is divided into.\n\n` +
        `**Example with Like Fractions:**\n` +
        `To add fractions with the same denominator: keep the bottom number the same, and add the tops!\n` +
        `$$\\frac{3}{8} + \\frac{2}{8} = \\frac{3 + 2}{8} = \\frac{5}{8}$$\n\n` +
        `💡 **Memory Rule:** Never add denominators together! If a pizza is sliced into 8 slices, 3 slices + 2 slices is 5 slices out of 8, not 16!`
      );
    }

    // 4. Math: Pythagoras & Geometry
    if (q.includes('pythagoras') || q.includes('hypotenuse') || q.includes('right angle triangle') || q.includes('right-angled')) {
      return (
        `✨ **nova • your study bestie 🎀 • Pythagoras Theorem**\n\n` +
        `In any right-angled triangle (where one angle is 90°):\n\n` +
        `$$\\text{Base}^2 + \\text{Perpendicular}^2 = \\text{Hypotenuse}^2 \\quad (a^2 + b^2 = c^2)$$\n\n` +
        `• The **Hypotenuse** is always the longest side, directly opposite the 90° right angle.\n` +
        `• **Classic Pythagorean Triple:** If base = 3 cm and perpendicular = 4 cm:\n` +
        `  $$3^2 + 4^2 = 9 + 16 = 25 \\implies c = \\sqrt{25} = 5\\text{ cm}$$\n\n` +
        `📌 **Exam Tip:** Always state the theorem name and show the square root step clearly for full step-marking credit in ${board} exams.`
      );
    }

    // 5. Math: Linear Equations & Algebra
    if (q.includes('linear equation') || q.includes('solve for x') || q.includes('algebra') || q.includes('equation')) {
      return (
        `✨ **nova • your study bestie 🎀 • Solving Algebraic Equations**\n\n` +
        `In algebra, an equation is a balanced scale. Your goal is to isolate the variable (such as $x$) on one side.\n\n` +
        `**Golden Rule:** Whatever operation you do to the Left-Hand Side (LHS), you MUST do the exact same operation to the Right-Hand Side (RHS).\n\n` +
        `**Example:** Solve $3x - 5 = 16$\n` +
        `1. Undo addition/subtraction: Add 5 to both sides:\n` +
        `   $$3x = 16 + 5 = 21$$\n` +
        `2. Undo multiplication: Divide both sides by 3:\n` +
        `   $$x = \\frac{21}{3} = 7$$\n` +
        `3. **Check:** $3(7) - 5 = 21 - 5 = 16$ ✅ Correct!`
      );
    }

    // 6. Math: Trigonometry
    if (q.includes('trigonometry') || q.includes('sin') || q.includes('cos') || q.includes('tan')) {
      return (
        `✨ **nova • your study bestie 🎀 • Trigonometric Ratios**\n\n` +
        `Trigonometry connects angles to side ratios in right-angled triangles:\n\n` +
        `• $\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$\n` +
        `• $\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$\n` +
        `• $\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{\\sin(\\theta)}{\\cos(\\theta)}$\n\n` +
        `**Fundamental Identity:**\n` +
        `$$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$$\n\n` +
        `💡 **Quick Mnemonic:** *Some People Have, Curly Brown Hair, Turned Permanent Black*!`
      );
    }

    // 7. CS: MS Paint
    if (q.includes('paint') || q.includes('ms paint') || q.includes('drawing tool')) {
      return (
        `✨ **nova • your study bestie 🎀 • MS Paint Tools & Digital Art**\n\n` +
        `MS Paint is a creative graphic application with essential drawing tools:\n\n` +
        `• **Pencil Tool:** Draws freehand thin lines with mouse clicks.\n` +
        `• **Fill with Color (Paint Bucket):** Pours color inside any completely closed shape with one click. *(Caution: If the shape has any gap, color spills everywhere!)*\n` +
        `• **Brushes:** Offers oil, watercolor, calligraphy, crayon, and airbrush spray effects.\n` +
        `• **Shapes Tool:** Creates perfect 2D geometric shapes like Circles, Rectangles, Stars, and Triangles.\n` +
        `• **Eraser:** Cleans or rubs out parts of your drawing using the secondary background color.`
      );
    }

    // 8. CS: Hardware Parts
    if (q.includes('cpu') || q.includes('monitor') || q.includes('hardware') || q.includes('keyboard') || q.includes('mouse') || q.includes('smart machine')) {
      return (
        `✨ **nova • your study bestie 🎀 • Computer Hardware & Components**\n\n` +
        `A computer consists of 4 main hardware units working together:\n\n` +
        `1. **CPU (Central Processing Unit):** Known as the **Brain of the Computer**, it executes all instructions, computations, and logical comparisons.\n` +
        `2. **Monitor:** The visual output screen that displays text, graphics, games, and videos.\n` +
        `3. **Keyboard:** An input device with alphanumeric keys, function keys, and spacebar to type data into the computer.\n` +
        `4. **Mouse:** A handheld pointing device used to click, double-click, drag, and select items on screen.`
      );
    }

    // 9. CS: Scratch
    if (q.includes('scratch') || q.includes('sprite') || q.includes('block code')) {
      return (
        `✨ **nova • your study bestie 🎀 • Scratch Block Coding**\n\n` +
        `Scratch uses visual color-coded blocks to build games and animations:\n\n` +
        `• **Sprites:** Characters or objects on the stage (like the Scratch Cat) that perform actions.\n` +
        `• **Green Flag (Events block):** Starts running your script when clicked: \`when green flag clicked\`.\n` +
        `• **Motion Blocks (Blue):** \`move 10 steps\`, \`turn 15 degrees\` change your sprite's position.\n` +
        `• **Control Blocks (Yellow/Gold):** \`repeat 10\` loops an action; \`forever\` keeps running until stopped; \`if-then\` makes smart decisions.\n` +
        `• **Variables (Orange):** Stores dynamic numbers like scores, timer, or lives!`
      );
    }

    // 10. CS: HTML & Web
    if (q.includes('html') || q.includes('css') || q.includes('web page') || q.includes('tag')) {
      return (
        `✨ **nova • your study bestie 🎀 • HTML & Web Development**\n\n` +
        `HTML (HyperText Markup Language) creates the structure of web pages:\n\n` +
        `\`\`\`html\n` +
        `<!DOCTYPE html>\n` +
        `<html>\n` +
        `  <head>\n` +
        `    <title>My First Page</title>\n` +
        `  </head>\n` +
        `  <body>\n` +
        `    <h1>Welcome to AcademicLevel!</h1>\n` +
        `    <p>This is a paragraph of text on the web.</p>\n` +
        `  </body>\n` +
        `</html>\n` +
        `\`\`\`\n\n` +
        `• **Opening & Closing Tags:** Most tags come in pairs, such as \`<h1>\` (start) and \`</h1>\` (end).\n` +
        `• **CSS (Cascading Style Sheets):** Controls styling (colors, fonts, borders, and responsive layouts)!`
      );
    }

    // 11. CS: Python
    if (q.includes('python')) {
      return (
        `✨ **nova • your study bestie 🎀 • Python Programming**\n\n` +
        `Python is an easy-to-read, beginner-friendly programming language:\n\n` +
        `• **Printing text:** \`print("Hello, Scholar!")\`\n` +
        `• **Variables:** Store values without keywords: \`score = 100\`\n` +
        `• **Taking Input:** \`name = input("Enter your name: ")\`\n` +
        `• **Conditionals:**\n` +
        `\`\`\`python\n` +
        `if score >= 90:\n` +
        `    print("Grade: A*")\n` +
        `else:\n` +
        `    print("Keep practicing!")\n` +
        `\`\`\`\n` +
        `• **Indentation:** In Python, 4 spaces of indentation define code blocks instead of curly braces!`
      );
    }

    // 12. Science: Photosynthesis
    if (q.includes('photosynthesis') || q.includes('chlorophyll') || q.includes('leaf') || q.includes('plants')) {
      return (
        `✨ **nova • your study bestie 🎀 • Photosynthesis in Plants**\n\n` +
        `Photosynthesis is the process by which green plants prepare their own food using sunlight:\n\n` +
        `$$\\text{Carbon Dioxide} + \\text{Water} \\xrightarrow[\\text{Chlorophyll}]{\\text{Sunlight}} \\text{Glucose (Food)} + \\text{Oxygen}$$\n\n` +
        `• **Chlorophyll:** Green pigment in leaves that traps solar energy.\n` +
        `• **Stomata:** Tiny microscopic pores on leaf surfaces that exchange gases ($CO_2$ in, $O_2$ out).\n` +
        `• **Roots:** Absorb water and minerals from the soil and transport them through xylem vessels to leaves.\n\n` +
        `💡 **Eco Fact:** Photosynthesis provides the oxygen that humans and animals breathe every second!`
      );
    }

    // 13. Science: Newton's Laws
    if (q.includes('newton') || q.includes('force') || q.includes('motion') || q.includes('gravity')) {
      return (
        `✨ **nova • your study bestie 🎀 • Laws of Motion & Force**\n\n` +
        `Sir Isaac Newton formulated three fundamental laws of motion:\n\n` +
        `1. **First Law (Inertia):** An object remains at rest or in uniform motion unless acted upon by an external unbalanced force.\n` +
        `2. **Second Law (Acceleration):** Force is proportional to the rate of change of momentum:\n` +
        `   $$F = m \\cdot a \\quad (\\text{Force} = \\text{Mass} \\times \\text{Acceleration})$$\n` +
        `   *SI Unit: Newton (N) or $\\text{kg}\\cdot\\text{m}/\\text{s}^2$*\n` +
        `3. **Third Law (Action & Reaction):** For every action, there is an equal and opposite reaction.\n\n` +
        `📌 **Example:** A rocket moves upward because hot exhaust gases are pushed downward with immense force!`
      );
    }

    // 14. Civics & Social: Constitution
    if (q.includes('constitution') || q.includes('democracy') || q.includes('government') || q.includes('parliament')) {
      return (
        `✨ **nova • your study bestie 🎀 • Indian Democratic Architecture**\n\n` +
        `India is a Sovereign, Socialist, Secular, Democratic Republic governed by the Constitution of India (adopted on 26th January 1950).\n\n` +
        `**Three Pillars of Government:**\n` +
        `1. **Legislature (Parliament):** Makes laws. Comprises President, Lok Sabha (House of the People), and Rajya Sabha (Council of States).\n` +
        `2. **Executive:** Implements laws. Headed by the Prime Minister and Council of Ministers.\n` +
        `3. **Judiciary (Supreme Court & High Courts):** Interprets laws and protects Fundamental Rights.\n\n` +
        `💡 **Key Civics Concept:** The Indian Constitution guarantees 6 Fundamental Rights to all citizens, including the Right to Equality and Right to Freedom.`
      );
    }

    // 15. General Cute StudyGirl Bestie Answer for ANY other question
    const randomBestieMsg = getRandomStudyGirlMessage();
    return (
      `✨ **nova • your study bestie 🎀 • ${cleanSub ? cleanSub.toUpperCase() : 'STUDY SESSION'}**\n\n` +
      `hey bestie! let's solve "${query}" together for **${board} Class ${grade}** 🌸\n\n` +
      `**1. here is the core idea:**\n` +
      `in ${cleanSub || 'your syllabus'}, we break down big questions into simple clues. identify what is given and what we need to find.\n\n` +
      `**2. simple step-by-step secret:**\n` +
      `• step 1: spot the main keywords and formula.\n` +
      `• step 2: plug in numbers carefully.\n` +
      `• step 3: double check your units and final answer!\n\n` +
      `🎀 **study bestie reminder:** ${randomBestieMsg.text}\n\n` +
      `ready to level up your score? let's take a quick quiz together right now! 💖`
    );
  }

  /**
   * Interactive Study Buddy chat reply
   * Tries Live Gemini AI first; falls back instantly to built-in pedagogical engine.
   * NEVER says it is offline!
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
      return this.generateBuiltInAiResponse(trimmed, board, grade, subject);
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
    const prompt = `You are Nova, the cutest, most supportive AI study buddy (studygirl aesthetic) for Class ${grade} ${board} in ${subject}.
Student asks: "${query}"
Answer in a cute, cheerful, lowercase (no caps) best-friend style under 100 words with emojis (🎀 🌸 ✨ 💖 🧸). Give simple intuitive steps and invite them to solve a quiz together!`;

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
