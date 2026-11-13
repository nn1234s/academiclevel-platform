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
  public static getActiveSubscription(learnerId: string, email?: string, phone?: string): Subscription | null {
    const subs = StorageRLSLayer.getSubscriptionsForLearner(learnerId, learnerId);
    const now = Date.now();
    const primary = subs.find(
      s =>
        s.status === 'ACTIVE' &&
        s.expiresAt &&
        new Date(s.expiresAt).getTime() > now
    );
    if (primary) return primary;

    // Fallback: check only verified legacy aliases
    try {
      const allSubs = StorageRLSLayer.getAllCachedSubscriptions();
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      const matched = allSubs.find(s => {
        if (s.status !== 'ACTIVE' || !s.expiresAt || new Date(s.expiresAt).getTime() <= now) return false;
        if (s.learnerId === learnerId) return true;
        // Specific verified legacy accounts only
        if (cleanEmail === 'prabir2gmailc@gmail.com' && (s.learnerId === 'lrn_mw9asujp_rzun' || s.learnerId === 'lrn_prabir_alias_norm')) return true;
        if (cleanPhone === '9861439460' && s.learnerId === 'lrn_special49_9861439460') return true;
        return false;
      });

      if (matched) return matched;
    } catch {}

    return null;
  }

  /**
   * Evaluates Student Quota & Subscription Status:
   * AcademicLevel provides 60 Days of Unlimited Quizzes (Concept Booster / LITE Plan) on signup.
   * No 10 or 25 quiz free plan restrictions apply to active scholars.
   */
  public static evaluateQuota(learner: Learner): QuotaStatus {
    // 1. Super-Admin is never paywall locked (strictly check learner identity, NOT client localStorage!)
    const cleanEmail = (learner.email || '').trim().toLowerCase();
    const isSuperAdmin = learner.role === 'SUPER_ADMIN' || 
      cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() || 
      cleanEmail === 'naitiknanda1235@gmail.com';

    if (isSuperAdmin) {
      return {
        isLocked: false,
        quizzesCompleted: learner.quizzesCompletedCount,
        maxQuizzes: Infinity,
        levelsCompleted: learner.levelsCompletedCount,
        maxLevels: Infinity,
        hasActiveSubscription: true,
        activePlan: 'PLUS',
        daysRemaining: 365
      };
    }

    // 2. Direct check: Has active subscription already attached to learner object
    const anyLearner = learner as any;
    if (anyLearner.hasActiveSubscription || anyLearner.activeSub || (anyLearner.activePlan && anyLearner.activePlan !== 'FREE')) {
      const sub = anyLearner.activeSub;
      const plan = anyLearner.activePlan || sub?.planTier || anyLearner.planTier || 'LITE';
      const expiresAt = anyLearner.subscriptionExpiresAt || sub?.expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
      const msLeft = new Date(expiresAt).getTime() - Date.now();
      const daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      return {
        isLocked: daysRemaining <= 0,
        quizzesCompleted: learner.quizzesCompletedCount,
        maxQuizzes: Infinity,
        levelsCompleted: learner.levelsCompletedCount,
        maxLevels: Infinity,
        hasActiveSubscription: daysRemaining > 0,
        activePlan: plan as any,
        expiresAt,
        daysRemaining
      };
    }

    // 3. Persistent subscription check
    const activeSub = this.getActiveSubscription(learner.id, learner.email, learner.phone);
    if (activeSub && activeSub.expiresAt) {
      const msLeft = new Date(activeSub.expiresAt).getTime() - Date.now();
      const daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      return {
        isLocked: daysRemaining <= 0,
        quizzesCompleted: learner.quizzesCompletedCount,
        maxQuizzes: Infinity,
        levelsCompleted: learner.levelsCompletedCount,
        maxLevels: Infinity,
        hasActiveSubscription: daysRemaining > 0,
        activePlan: activeSub.planTier,
        expiresAt: activeSub.expiresAt,
        daysRemaining
      };
    }

    // 4. Default 60-Day Concept Booster Pass for ALL registered scholars (no free plan or 10/25 quiz limit)
    const createdAtMs = learner.createdAt ? new Date(learner.createdAt).getTime() : Date.now();
    const defaultExpiryMs = createdAtMs + 60 * 24 * 60 * 60 * 1000;
    const msLeft = defaultExpiryMs - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    const isExpired = daysRemaining <= 0;

    return {
      isLocked: isExpired,
      reason: isExpired ? 'Your 60-Day Concept Booster pass has ended. Upgrade to continue unlimited quizzes.' : undefined,
      quizzesCompleted: learner.quizzesCompletedCount,
      maxQuizzes: Infinity,
      levelsCompleted: learner.levelsCompletedCount,
      maxLevels: Infinity,
      hasActiveSubscription: !isExpired,
      activePlan: 'LITE',
      expiresAt: new Date(defaultExpiryMs).toISOString(),
      daysRemaining
    };
  }

  /**
   * Records completion of a quiz and updates learner quiz and level quota counters.
   * 10 quizzes doesn't mean 10 levels. It means 2 (5 quizzes = 1 level).
   */
  public static recordQuizCompletion(learnerId: string): void {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return;

    learner.quizzesCompletedCount = (learner.quizzesCompletedCount || 0) + 1;
    learner.levelsCompletedCount = Math.floor(learner.quizzesCompletedCount / 5);
    StorageRLSLayer.saveLearner(learner, learnerId);
  }

  /**
   * Records completion of a course level node and syncs level counter.
   * 10 quizzes doesn't mean 10 levels. It means 2 (5 quizzes = 1 level).
   */
  public static recordLevelCompletion(learnerId: string): void {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return;

    learner.levelsCompletedCount = Math.floor((learner.quizzesCompletedCount || 0) / 5);
    StorageRLSLayer.saveLearner(learner, learnerId);
  }
}
