import React, { useState, useEffect } from 'react';
import { Learner, Grade } from '../../core/types';
import { ApiClient } from '../../core/api/apiClient';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  ChevronRight,
  Trophy,
  ArrowRight,
  Flame,
  Globe
} from 'lucide-react';

interface WorldwideScholarshipsProps {
  learner: Learner;
  activeGrade: Grade;
  onRefreshLearner?: () => void;
  onStartQuiz?: (grade: Grade) => void;
}

export const WorldwideScholarships: React.FC<WorldwideScholarshipsProps> = ({
  learner,
  activeGrade,
  onRefreshLearner,
  onStartQuiz
}) => {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ title: string; coins: number; badge?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getScholarships(learner.id);
      if (res.success && res.scholarships) {
        setScholarships(res.scholarships);
        return;
      }
    } catch {
      // Local fallback
    }

    // Local fallback calculation
    const all = StorageRLSLayer.getAllScholarships().filter(s => s.isActive);
    const claims = StorageRLSLayer.getScholarshipClaims().filter(c => c.learnerId === learner.id);
    const claimedIds = new Set(claims.map(c => c.scholarshipId));

    const enriched = all.map(s => {
      const isClaimed = claimedIds.has(s.id);
      const isExpired = new Date(s.endDate).getTime() < Date.now();
      const progress = Math.min(s.targetQuizCount, learner.quizzesCompletedCount || 0);
      const canClaim = !isClaimed && !isExpired && progress >= s.targetQuizCount;
      return {
        ...s,
        isClaimed,
        isExpired,
        completedQuizzesInWindow: progress,
        canClaim,
        progressPercent: Math.min(100, Math.round((progress / s.targetQuizCount) * 100))
      };
    });

    setScholarships(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchScholarships();
  }, [learner.id, learner.quizzesCompletedCount]);

  const handleClaimReward = async (sch: any) => {
    setClaimingId(sch.id);
    setErrorMsg(null);

    try {
      const res = await ApiClient.claimScholarship(sch.id, learner.id);
      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        setCelebration({
          title: sch.title,
          coins: res.coinsAwarded || sch.rewardCoins,
          badge: res.badgeTitle || sch.badgeTitle
        });

        if (onRefreshLearner) onRefreshLearner();
        fetchScholarships();
        return;
      } else {
        setErrorMsg(res.message || 'Could not claim scholarship reward.');
      }
    } catch (err: any) {
      // Local fallback claiming
      try {
        const now = new Date().toISOString();
        StorageRLSLayer.saveScholarshipClaim({
          id: 'clm_' + Date.now(),
          scholarshipId: sch.id,
          scholarshipTitle: sch.title,
          learnerId: learner.id,
          learnerName: learner.fullName,
          learnerEmail: learner.email,
          coinsAwarded: sch.rewardCoins,
          claimedAt: now
        });

        // Credit coins
        learner.coinBalance = (learner.coinBalance || 0) + sch.rewardCoins;
        StorageRLSLayer.saveLearner(learner, learner.id);

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        setCelebration({
          title: sch.title,
          coins: sch.rewardCoins,
          badge: sch.badgeTitle
        });

        if (onRefreshLearner) onRefreshLearner();
        fetchScholarships();
      } catch (localErr: any) {
        setErrorMsg(localErr.message || 'Error claiming scholarship.');
      }
    } finally {
      setClaimingId(null);
    }
  };

  // Only show active scholarships applicable to learner grade or ALL
  const visibleScholarships = scholarships.filter(s => {
    if (s.targetGrade && s.targetGrade !== 'ALL' && Number(s.targetGrade) !== Number(learner.grade || activeGrade)) {
      return false;
    }
    if (s.targetBoard && s.targetBoard !== 'ALL' && s.targetBoard !== learner.board) {
      return false;
    }
    return true;
  });

  if (visibleScholarships.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-1.5">
              <span>Worldwide Scholarships & Sprints</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                Live Challenge
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Complete quiz milestones in the challenge window to earn scholarship coin rewards!
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleScholarships.map(sch => {
          const isEnded = sch.isExpired || new Date(sch.endDate).getTime() < Date.now();
          const daysLeft = Math.max(0, Math.ceil((new Date(sch.endDate).getTime() - Date.now()) / 86400000));
          const quizzesNeeded = Math.max(0, sch.targetQuizCount - sch.completedQuizzesInWindow);
          const isClaimed = sch.isClaimed;
          const canClaim = sch.canClaim && !isClaimed;

          return (
            <div
              key={sch.id}
              className={`rounded-3xl p-5 border relative overflow-hidden transition-all flex flex-col justify-between ${
                canClaim
                  ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/70 shadow-xl shadow-amber-950/30'
                  : isClaimed
                  ? 'bg-slate-900/80 border-emerald-500/40 shadow-md'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center space-x-1.5 bg-indigo-950 border border-indigo-800 text-indigo-300">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>{sch.durationDays} Days Sprint</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-full text-xs font-black tracking-wide flex items-center space-x-1 bg-amber-500/20 border border-amber-500/50 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{sch.rewardCoins} Coins</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-base font-extrabold text-white leading-snug">{sch.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {sch.description}
                  </p>
                </div>

                {/* Progress Bar & Counter */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center space-x-1">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sprint Goal:</span>
                    </span>
                    <span className="font-bold text-white">
                      {sch.completedQuizzesInWindow} / {sch.targetQuizCount} Quizzes Completed
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        canClaim || isClaimed
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, sch.progressPercent || 0)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{isEnded ? 'Challenge Ended' : `${daysLeft} days remaining`}</span>
                    </span>
                    <span className="font-bold text-amber-300">
                      {sch.progressPercent}% Done
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {isClaimed ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Scholarship Claimed (+{sch.rewardCoins} Coins Credited)</span>
                  </div>
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaimReward(sch)}
                    disabled={claimingId === sch.id}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-amber-950 animate-pulse transition-all"
                  >
                    <Trophy className="w-4 h-4 text-slate-950" />
                    <span>
                      {claimingId === sch.id
                        ? 'Claiming Scholarship...'
                        : `🎉 Claim ${sch.rewardCoins} Coins Scholarship!`}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      {quizzesNeeded === 1 ? '1 more quiz to unlock!' : `${quizzesNeeded} more quizzes to unlock`}
                    </span>

                    {onStartQuiz && (
                      <button
                        onClick={() => onStartQuiz(activeGrade)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-md shadow-indigo-950 transition-all flex-shrink-0"
                      >
                        <span>Take Quiz</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Celebration Modal */}
      {celebration && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 border border-amber-500 text-amber-300 uppercase tracking-wider inline-block mb-3">
              Scholarship Awarded!
            </span>

            <h3 className="text-xl font-black text-white mb-2">
              Outstanding Achievement!
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto mb-5">
              You completed the worldwide challenge <strong>&quot;{celebration.title}&quot;</strong>! Your hard work and academic dedication have earned you:
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 mb-6">
              <div className="flex items-center justify-center space-x-2 text-2xl font-black text-amber-300">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <span>+{celebration.coins} Study Coins</span>
              </div>
              {celebration.badge && (
                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Earned: {celebration.badge}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCelebration(null)}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950 transition-all"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
