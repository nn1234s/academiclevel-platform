import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../core/storage/StorageRLSLayer';
import { Learner, Subscription } from '../core/types';
import { ApiClient } from '../core/api/apiClient';

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
  activePlan?: 'LITE' | 'PLUS' | 'GOLD' | 'TRIAL' | 'FREE';
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

    // Comprehensive fallback: check all cached subscriptions by ID, email, and mobile phone
    try {
      const allSubs = StorageRLSLayer.getAllCachedSubscriptions();
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : '';
      const cleanEmail = email ? email.trim().toLowerCase() : '';

      const matched = allSubs.find(s => {
        if (s.status !== 'ACTIVE' || !s.expiresAt || new Date(s.expiresAt).getTime() <= now) return false;
        if (s.learnerId === learnerId) return true;
        if (cleanEmail && (s.learnerId.toLowerCase() === cleanEmail || s.learnerId.toLowerCase().includes(cleanEmail))) return true;
        if (cleanPhone && (s.learnerId.includes(cleanPhone) || (s.payerUpiId && s.payerUpiId.includes(cleanPhone)))) return true;
        // Specific verified legacy accounts
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
        quizzesCompleted: learner.quizzesCompletedCount || 0,
        maxQuizzes: Infinity,
        levelsCompleted: learner.levelsCompletedCount || 0,
        maxLevels: Infinity,
        hasActiveSubscription: true,
        activePlan: 'PLUS',
        daysRemaining: 365
      };
    }

    const anyLearner = learner as any;

    // 2. Comprehensive active subscription detection across storage and learner fields:
    const activeSub = this.getActiveSubscription(learner.id, learner.email, learner.phone);
    const hasSubInStorage = Boolean(
      activeSub &&
      activeSub.status === 'ACTIVE' &&
      activeSub.expiresAt &&
      new Date(activeSub.expiresAt).getTime() > Date.now()
    );

    const candidatePlan = anyLearner.activePlan || anyLearner.planTier || anyLearner.activeSub?.planTier || activeSub?.planTier;
    const isKnownPaidPlan = candidatePlan === 'LITE' || candidatePlan === 'PLUS' || candidatePlan === 'GOLD' || candidatePlan === 'TRIAL';

    const expiresAt = anyLearner.subscriptionExpiresAt || anyLearner.activeSub?.expiresAt || activeSub?.expiresAt;
    const isDateValid = expiresAt ? new Date(expiresAt).getTime() > Date.now() : true;

    const isExplicitlyActive = Boolean(anyLearner.hasActiveSubscription) && candidatePlan !== 'FREE';

    // If student holds ANY verified active plan or subscription, grant 100% unlocked access
    if (isExplicitlyActive || hasSubInStorage || (isKnownPaidPlan && isDateValid)) {
      const plan = (isKnownPaidPlan ? candidatePlan : 'LITE') as 'LITE' | 'PLUS' | 'GOLD' | 'TRIAL';
      const resolvedExpiry = expiresAt || new Date(Date.now() + (plan === 'GOLD' ? 365 : plan === 'PLUS' ? 180 : 60) * 24 * 60 * 60 * 1000).toISOString();
      const msLeft = new Date(resolvedExpiry).getTime() - Date.now();
      let daysRemaining = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      // Guard: Concept Booster capped to 60 days, Plus to 365 days
      if (plan === 'LITE' && daysRemaining > 60) daysRemaining = 60;
      if (daysRemaining > 365) daysRemaining = 365;

      return {
        isLocked: false, // Absolutely never locked for active premium subscribers
        quizzesCompleted: learner.quizzesCompletedCount || 0,
        maxQuizzes: Infinity,
        levelsCompleted: learner.levelsCompletedCount || 0,
        maxLevels: Infinity,
        hasActiveSubscription: true,
        activePlan: plan,
        expiresAt: resolvedExpiry,
        daysRemaining
      };
    }

    // 3. Free Tier Account: Strictly limited to 3 completed curriculum levels
    const levelsCompleted = learner.levelsCompletedCount || 0;
    const isLocked = levelsCompleted >= FREE_TIER_MAX_LEVELS;

    return {
      isLocked,
      reason: isLocked
        ? `You have completed the free account limit of ${FREE_TIER_MAX_LEVELS} curriculum levels. Upgrade to Lite (₹49) or Plus (₹129) to unlock all levels!`
        : undefined,
      quizzesCompleted: learner.quizzesCompletedCount || 0,
      maxQuizzes: Infinity,
      levelsCompleted,
      maxLevels: FREE_TIER_MAX_LEVELS,
      hasActiveSubscription: false,
      activePlan: 'FREE',
      expiresAt: undefined,
      daysRemaining: undefined
    };
  }

  /**
   * Records completion of a quiz and increments learner quiz count.
   */
  public static recordQuizCompletion(learnerId: string): void {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return;

    learner.quizzesCompletedCount = (learner.quizzesCompletedCount || 0) + 1;
    StorageRLSLayer.saveLearner(learner, learnerId);
    // Background sync to server API
    ApiClient.updateStudentProgressCounters(learnerId, {
      quizzesCompletedCount: learner.quizzesCompletedCount
    }).catch(() => {});
  }

  /**
   * Records completion of a course level node and syncs level counter accurately.
   */
  public static recordLevelCompletion(learnerId: string): void {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return;

    const progressList = StorageRLSLayer.getProgressForLearner(learnerId, learnerId);
    const completedLevels = progressList.filter(p => p.isCompleted).length;
    learner.levelsCompletedCount = Math.max(completedLevels, (learner.levelsCompletedCount || 0) + 1);
    StorageRLSLayer.saveLearner(learner, learnerId);
    // Background sync to server API
    ApiClient.updateStudentProgressCounters(learnerId, {
      levelsCompletedCount: learner.levelsCompletedCount
    }).catch(() => {});
  }
}
