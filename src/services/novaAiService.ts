import { Board, Grade, Question } from '../core/types';
import { OfflineBankService } from './offlineBankService';

export interface NovaMessage {
  id: string;
  sender: 'STUDENT' | 'NOVA';
  text: string;
  timestamp: string;
  metadata?: {
    board?: Board;
    grade?: Grade;
    subject?: string;
  };
}

export class NovaAiService {
  private static AI_TIMEOUT_MS = 2500;

  /**
   * Generates a Socratic, age-adaptive explanation for a question or mistake.
   */
  public static async explainMistake(
    question: Question,
    chosenIndex: number,
    board: Board,
    grade: Grade
  ): Promise<string> {
    const wrongAnswer = question.options[chosenIndex] || 'your choice';
    const correctAnswer = question.options[question.correctIndex];

    const generateExplanation = (): string => {
      // Age-Adaptive Tone Selection
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
        // High School / Board Exam Rigor (9-12)
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

    // Simulate resilient async call with timeout guard
    return Promise.race([
      new Promise<string>((resolve) => {
        setTimeout(() => resolve(generateExplanation()), 400);
      }),
      new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('AI generation timed out')), this.AI_TIMEOUT_MS);
      })
    ]).catch(() => {
      // Instant Fallback on timeout
      return (
        `[Offline Fallback Mode] Explanation: ${question.explanation}\n\nHint: ${question.hint}`
      );
    });
  }

  /**
   * Interactive Socratic chat reply
   */
  public static async answerStudentQuery(
    query: string,
    board: Board,
    grade: Grade,
    subject: string
  ): Promise<string> {
    const trimmed = query.trim();

    return new Promise((resolve) => {
      setTimeout(() => {
        if (grade <= 4) {
          resolve(
            `🎈 Hello! In Class ${grade} ${subject}, everything is about curiosity! ` +
            `Regarding "${trimmed}": Think of it like building with bright blocks. What is the very first step you would take?`
          );
        } else if (grade <= 8) {
          resolve(
            `💡 That's a sharp inquiry about "${trimmed}" in ${board} ${subject}! ` +
            `Before giving the direct formula, let me ask: what happens to the result if you increase the primary variable? What rule did we discuss in our last module?`
          );
        } else {
          resolve(
            `📚 Analytical Guidance (${board} Class ${grade} — ${subject}):\n\n` +
            `Regarding "${trimmed}":\n` +
            `1. **Theoretical Foundation**: Start from first principles according to the official ${board} syllabus.\n` +
            `2. **Key Derivation/Application**: Identify known variables and boundary conditions.\n` +
            `3. **Exam Tip**: Examiners award partial step-marking for stating the governing law before calculating numerical answers.`
          );
        }
      }, 500);
    });
  }
}
