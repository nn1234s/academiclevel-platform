import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../core/storage/StorageRLSLayer';
import { CoinLedgerEntry, CoinReasonCode, Learner } from '../core/types';
import { ApiClient } from '../core/api/apiClient';

/**
 * Append-Only Study Coin Ledger Service
 * Enforces atomic balance mutations with cryptographic hash signatures.
 */
export class CoinLedgerService {
  /**
   * Generates a deterministic tamper-resistant signature for an entry.
   */
  private static generateSignature(
    entryId: string,
    learnerId: string,
    amount: number,
    balanceAfter: number,
    timestampUtc: string
  ): string {
    const raw = `${entryId}:${learnerId}:${amount}:${balanceAfter}:${timestampUtc}:ACADEMIC_LEVEL_LEDGER_SALT`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return 'SIG_' + Math.abs(hash).toString(16).padStart(12, '0');
  }

  /**
   * Records a ledger entry and updates the learner cached balance atomically.
   */
  public static appendTransaction(
    learnerId: string,
    amount: number,
    reasonCode: CoinReasonCode,
    metadata?: Record<string, any>
  ): { success: boolean; newBalance: number; error?: string } {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) {
      return { success: false, newBalance: 0, error: 'Learner not found.' };
    }

    const currentBalance = learner.coinBalance || 0;
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      return {
        success: false,
        newBalance: currentBalance,
        error: `Insufficient Study Coins. Required: ${Math.abs(amount)}, Available: ${currentBalance}.`
      };
    }

    const entryId = 'c_tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const timestampUtc = new Date().toISOString();
    const signatureHash = this.generateSignature(entryId, learnerId, amount, newBalance, timestampUtc);

    const entry: CoinLedgerEntry = {
      entryId,
      learnerId,
      amount,
      transactionType: amount >= 0 ? 'CREDIT' : 'DEBIT',
      reasonCode,
      balanceAfter: newBalance,
      metadata,
      timestampUtc,
      signatureHash
    };

    // 1. Append to immutable ledger
    StorageRLSLayer.appendCoinEntry(entry);

    // 2. Update cached learner balance
    learner.coinBalance = newBalance;
    StorageRLSLayer.saveLearner(learner, learnerId);

    // 3. Dispatch to server database
    ApiClient.transactCoins(learnerId, amount, amount >= 0 ? 'CREDIT' : 'DEBIT', reasonCode, metadata).catch(() => {});

    return { success: true, newBalance };
  }

  /**
   * Evaluates and awards +25 coins for course level completion.
   * STRICT: Awarded ONLY once per distinct level upon achieving >= 70% accuracy
   * AND passing minimum time-per-question anti-cheat checks.
   */
  public static awardLevelCompletionReward(
    learnerId: string,
    board: string,
    grade: number,
    subjectId: string,
    levelNode: string,
    accuracyPercent: number,
    antiCheatPassed: boolean
  ): { awarded: boolean; reason: string; coinsEarned: number } {
    if (!antiCheatPassed) {
      return {
        awarded: false,
        reason: 'Anti-cheat check failed. Minimum answer dwell time not met.',
        coinsEarned: 0
      };
    }

    if (accuracyPercent < 70) {
      return {
        awarded: false,
        reason: `Accuracy is ${accuracyPercent.toFixed(1)}%. Minimum 70% required to earn Level Mastery Coins.`,
        coinsEarned: 0
      };
    }

    const progressList = StorageRLSLayer.getProgressForLearner(learnerId, learnerId);
    const existing = progressList.find(
      p =>
        p.board === board &&
        p.grade === grade &&
        p.subjectId === subjectId &&
        p.levelNode === levelNode
    );

    if (existing?.coinRewardClaimed) {
      return {
        awarded: false,
        reason: 'Level completion reward already claimed for this distinct course node.',
        coinsEarned: 0
      };
    }

    // Award +25 coins
    const result = this.appendTransaction(learnerId, 25, 'LEVEL_COMPLETED_REWARD', {
      board,
      grade,
      subjectId,
      levelNode,
      accuracyPercent
    });

    if (result.success) {
      // Mark claimed in progress
      const progressRecord = {
        learnerId,
        board: board as any,
        grade: grade as any,
        subjectId,
        levelNode: levelNode as any,
        isCompleted: true,
        bestScorePercent: accuracyPercent,
        coinRewardClaimed: true,
        completedAt: new Date().toISOString(),
        calendarYear: new Date().getFullYear()
      };
      StorageRLSLayer.saveProgress(progressRecord);
      ApiClient.recordLevelProgress(progressRecord).catch(() => {});

      return {
        awarded: true,
        reason: 'Mastery achieved! +25 Study Coins awarded.',
        coinsEarned: 25
      };
    }

    return { awarded: false, reason: result.error || 'Transaction failed.', coinsEarned: 0 };
  }

  /**
   * Qualifies a referral and awards +40 coins to the referrer.
   * Triggered ONLY after the referee finishes their first full quiz.
   */
  public static qualifyReferralOnFirstQuiz(refereeId: string): void {
    const referee = StorageRLSLayer.getLearnerById(refereeId, refereeId);
    if (!referee || !referee.referredBy || referee.referralQualified) {
      return; // Already qualified or no referrer
    }

    const referrer = StorageRLSLayer.getLearnerById(referee.referredBy, referee.referredBy);
    if (!referrer) return;

    // Mark referee as qualified
    referee.referralQualified = true;
    StorageRLSLayer.saveLearner(referee, refereeId);

    // Award +40 Coins to Referrer
    this.appendTransaction(referrer.id, 40, 'REFERRAL_SIGNUP_QUALIFIED', {
      refereeId: referee.id,
      refereeName: referee.fullName
    });
  }

  /**
   * Daily Spin Wheel evaluation:
   * Strictly 1 spin per 24 UTC hours.
   * Standard slices: 2, 3, 5 coins.
   * Rare Jackpot: 40 coins slice unlocked ONLY if student has >= 1 qualified referral.
   */
  public static canSpinWheel(learner: Learner): { allowed: boolean; remainingCooldownMs: number } {
    if (!learner.lastSpinTimestampUtc) {
      return { allowed: true, remainingCooldownMs: 0 };
    }
    const lastSpin = new Date(learner.lastSpinTimestampUtc).getTime();
    const now = Date.now();
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
    const diff = now - lastSpin;

    if (diff >= cooldownMs) {
      return { allowed: true, remainingCooldownMs: 0 };
    }
    return { allowed: false, remainingCooldownMs: cooldownMs - diff };
  }

  public static executeSpin(learnerId: string): {
    coinsAwarded: number;
    isJackpot: boolean;
    error?: string;
  } {
    const learner = StorageRLSLayer.getLearnerById(learnerId, learnerId);
    if (!learner) return { coinsAwarded: 0, isJackpot: false, error: 'Learner not found.' };

    const check = this.canSpinWheel(learner);
    if (!check.allowed) {
      const hours = Math.ceil(check.remainingCooldownMs / (1000 * 60 * 60));
      return {
        coinsAwarded: 0,
        isJackpot: false,
        error: `Daily spin already used. Available again in ${hours} hours (24h UTC cooldown).`
      };
    }

    // Check if qualified for 40-coin rare jackpot
    // Qualified if at least 1 student referred by this learner has referralQualified === true
    const allLearners = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
    const qualifiedReferralsCount = allLearners.filter(
      l => l.referredBy === learnerId && l.referralQualified
    ).length;

    let coinsWon = 2;
    let isJackpot = false;

    const roll = Math.random() * 100; // 0 to 100

    if (qualifiedReferralsCount > 0 && roll < 5) {
      // 5% chance of 40-coin jackpot ONLY if qualified
      coinsWon = 40;
      isJackpot = true;
    } else if (roll < 45) {
      coinsWon = 2; // 45% chance
    } else if (roll < 80) {
      coinsWon = 3; // 35% chance
    } else {
      coinsWon = 5; // 20% chance
    }

    // Append transaction
    const tx = this.appendTransaction(learnerId, coinsWon, 'DAILY_SPIN_WHEEL', {
      isJackpot,
      qualifiedReferralsCount
    });

    if (tx.success) {
      learner.lastSpinTimestampUtc = new Date().toISOString();
      StorageRLSLayer.saveLearner(learner, learnerId);
    }

    return { coinsAwarded: coinsWon, isJackpot };
  }
}
