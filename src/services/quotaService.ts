import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../core/storage/StorageRLSLayer';
import { Learner, Subscription } from '../core/types';

export const FREE_TIER_MAX_QUIZZES = 25;
export const FREE_TIER_MAX_LEVELS = 3;

export interface QuotaStatus {
  isLocked: boolean;
  reason?: string;
  quizzesCompleted: number;
  maxQuizzes: number;
  levelsCompleted: number;
  maxLevels: number;
  hasActiveSubscription: boolean;
  activePlan?: 'LITE' | 'PLUS' | 'TRIAL';
  expiresAt?: string;
  daysRemaining?: number;
}

export class QuotaService {
  /**
   * Checks whether the learner has an active verified subscription.
   */
  public static getActiveSubscription(learnerId: string): Subscription | null {
    const subs = StorageRLSLayer.getSubscriptionsForLearner(learnerId, learnerId);
    const now = Date.now();
    return (
      subs.find(
        s =>
          s.status === 'ACTIVE' &&
          s.expiresAt &&
          new Date(s.expiresAt).getTime() > now
      ) || null
    );
  }

  /**
   * Evaluates the Free Tier Quota Gate:
   * Strictly limited to 25 quizzes OR 3 completed course levels, whichever occurs first.
   */
  public static evaluateQuota(learner: Learner): QuotaStatus {
    // Super-Admin is never paywall locked
    if (learner.role === 'SUPER_ADMIN' || learner.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || StorageRLSLayer.isAdminAuthorized(learner.email)) {
      return {
        isLocked: false,
        quizzesCompleted: learner.quizzesCompletedCount,
        maxQuizzes: Infinity,
        levelsCompleted: learner.levelsCompletedCount,
        maxLevels: Infinity,
        hasActiveSubscription: true,
        activePlan: 'PLUS',
        daysRemaining: 999
      };
    }

    const activeSub = this.getActiveSubscription(learner.id);

    if (activeSub && activeSub.expiresAt) {
      const msLeft = new Date(activeSub.expiresAt).getTime() - Date.now();
      const daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      return {
        isLocked: false,
        quizzesCompleted: learner.quizzesCompletedCount,
        maxQuizzes: Infinity,
        levelsCompleted: learner.levelsCompletedCount,
        maxLevels: Infinity,
        hasActiveSubscription: true,
        activePlan: activeSub.planTier,
        expiresAt: activeSub.expiresAt,
        daysRemaining
      };
    }

    // Free Tier Evaluation
    const quizzesCount = learner.quizzesCompletedCount || 0;
    const levelsCount = learner.levelsCompletedCount || 0;

    let isLocked = false;
    let reason = '';

    if (quizzesCount >= FREE_TIER_MAX_QUIZZES) {
      isLocked = true;
      reason = `Free tier limit reached: You have completed all ${FREE_TIER_MAX_QUIZZES} complimentary quizzes.`;
    } else if (levelsCount >= FREE_TIER_MAX_LEVELS) {
      isLocked = true;
      reason = `Free tier limit reached: You have completed ${FREE_TIER_MAX_LEVELS} full course levels.`;
    }

    return {
      isLocked,
      reason,
      quizzesCompleted: quizzesCount,
      maxQuizzes: FREE_TIER_MAX_QUIZZES,
      levelsCompleted: levelsCount,
      maxLevels: FREE_TIER_MAX_LEVELS,
      hasActiveSubscription: false
    };
  }

  /**
   * Records completion of a quiz and increments learner quota counter.
   */
  public static recordQuizCompletion(learnerId: string): void {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return;

    learner.quizzesCompletedCount = (learner.quizzesCompletedCount || 0) + 1;
    StorageRLSLayer.saveLearner(learner, learnerId);
  }

  /**
   * Records completion of a course level node and increments level counter.
   */
  public static recordLevelCompletion(learnerId: string): void {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return;

    learner.levelsCompletedCount = (learner.levelsCompletedCount || 0) + 1;
    StorageRLSLayer.saveLearner(learner, learnerId);
  }
}
