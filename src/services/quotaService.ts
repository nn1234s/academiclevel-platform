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
  activePlan?: 'LITE' | 'PLUS' | 'GOLD' | 'GOD' | 'TRIAL';
  expiresAt?: string;
  daysRemaining?: number;
}

export interface DailyQuizStatus {
  todayDate: string;
  quizzesToday: number;
  dailyLimit: number;
  remainingToday: number;
  isExamMode: boolean;
  isLimitReached: boolean;
  canEnableExamMode: boolean;
  isSeniorGrade: boolean;
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
      let daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      // Guard: Concept Booster is strictly capped to 60 days, PLUS to 180, GOLD to 365, and GOD to 1095 days max
      if (plan === 'LITE' && daysRemaining > 60) daysRemaining = 60;
      else if (plan === 'PLUS' && daysRemaining > 180) daysRemaining = 180;
      else if (plan === 'GOLD' && daysRemaining > 365) daysRemaining = 365;
      else if (plan === 'GOD' && daysRemaining > 1095) daysRemaining = 1095;
      else if (daysRemaining > 1095) daysRemaining = 1095;

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
      let daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      if (activeSub.planTier === 'LITE' && daysRemaining > 60) daysRemaining = 60;
      else if (activeSub.planTier === 'PLUS' && daysRemaining > 180) daysRemaining = 180;
      else if (activeSub.planTier === 'GOLD' && daysRemaining > 365) daysRemaining = 365;
      else if (activeSub.planTier === 'GOD' && daysRemaining > 1095) daysRemaining = 1095;
      else if (daysRemaining > 1095) daysRemaining = 1095;

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
    const daysRemaining = Math.min(60, Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24))));
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
   * Returns current calendar date string in YYYY-MM-DD local format.
   */
  public static getDailyDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Computes the daily quiz limit based on Grade and Exam Mode.
   * - Junior Scholars (Class 1-8): 5 quizzes/day normal; 10 quizzes/day in Exam Mode.
   * - Senior Scholars (Class 9-12): 10 quizzes/day normal; 15 quizzes/day in Exam Mode.
   * - Super Admin: Unlimited.
   */
  public static getDailyQuizLimit(learner: Learner, isExamMode?: boolean): number {
    const cleanEmail = (learner.email || '').trim().toLowerCase();
    const isSuperAdmin = learner.role === 'SUPER_ADMIN' || 
      cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() || 
      cleanEmail === 'naitiknanda1235@gmail.com';
    if (isSuperAdmin) return Infinity;

    const grade = Number(learner.grade) || 1;
    const exam = isExamMode !== undefined ? isExamMode : Boolean(learner.examModeEnabled);

    if (grade >= 9) {
      return exam ? 15 : 10;
    } else {
      return exam ? 10 : 5;
    }
  }

  /**
   * Evaluates Daily Quiz status for the learner for the current day.
   */
  public static getDailyQuizStatus(learner: Learner, isExamModeOverride?: boolean): DailyQuizStatus {
    const cleanEmail = (learner.email || '').trim().toLowerCase();
    const isSuperAdmin = learner.role === 'SUPER_ADMIN' || 
      cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() || 
      cleanEmail === 'naitiknanda1235@gmail.com';

    const todayDate = this.getDailyDateString();
    const isExamMode = isExamModeOverride !== undefined ? isExamModeOverride : Boolean(learner.examModeEnabled);
    const quizzesToday = learner.dailyQuizDate === todayDate ? (Number(learner.dailyQuizCount) || 0) : 0;
    const isSeniorGrade = (Number(learner.grade) || 1) >= 9;
    const dailyLimit = isSuperAdmin ? Infinity : this.getDailyQuizLimit(learner, isExamMode);
    const remainingToday = isSuperAdmin ? Infinity : Math.max(0, dailyLimit - quizzesToday);
    const isLimitReached = !isSuperAdmin && quizzesToday >= dailyLimit;
    const canEnableExamMode = !isExamMode;

    return {
      todayDate,
      quizzesToday,
      dailyLimit,
      remainingToday,
      isExamMode,
      isLimitReached,
      canEnableExamMode,
      isSeniorGrade
    };
  }

  /**
   * Toggles or sets Exam Mode for a learner, persisting and syncing to backend.
   */
  public static toggleExamMode(learnerId: string, enabled?: boolean): boolean {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return false;

    const newStatus = enabled !== undefined ? enabled : !Boolean(learner.examModeEnabled);
    learner.examModeEnabled = newStatus;
    StorageRLSLayer.saveLearner(learner, learnerId);
    ApiClient.setExamMode(learnerId, newStatus).catch(() => {});
    return newStatus;
  }

  /**
   * Records completion of a quiz and increments learner quiz count and daily quiz count.
   */
  public static recordQuizCompletion(learnerId: string): void {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return;

    const todayDate = this.getDailyDateString();
    learner.quizzesCompletedCount = (learner.quizzesCompletedCount || 0) + 1;

    if (learner.dailyQuizDate === todayDate) {
      learner.dailyQuizCount = (Number(learner.dailyQuizCount) || 0) + 1;
    } else {
      learner.dailyQuizDate = todayDate;
      learner.dailyQuizCount = 1;
    }

    StorageRLSLayer.saveLearner(learner, learnerId);
    // Background sync to server API
    ApiClient.updateStudentProgressCounters(learnerId, {
      quizzesCompletedCount: learner.quizzesCompletedCount,
      dailyQuizCount: learner.dailyQuizCount,
      dailyQuizDate: learner.dailyQuizDate,
      examModeEnabled: learner.examModeEnabled
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
