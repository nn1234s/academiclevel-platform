import React, { useState, useEffect } from 'react';
import { Learner, Grade } from '../../core/types';
import { ApiClient } from '../../core/api/apiClient';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { PaymentService } from '../../services/paymentService';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
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
  Globe,
  KeyRound,
  Copy,
  Check,
  X
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
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemNotice, setRedeemNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getScholarships(learner.id);
      if (res.success && res.scholarships) {
        setScholarships(res.scholarships);
        setLoading(false);
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
      const progress = Math.min(s.targetQuizCount, Math.max(learner.quizzesCompletedCount || 0, learner.levelsCompletedCount || 0));
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
  }, [learner.id, learner.quizzesCompletedCount, learner.levelsCompletedCount]);

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

  const handleRedeemACode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCodeInput.trim()) return;
    setIsRedeeming(true);
    setRedeemNotice(null);

    const res = await PaymentService.redeemACode(learner.id, redeemCodeInput.trim());
    setIsRedeeming(false);
    if (res.success) {
      setRedeemNotice({ type: 'success', text: res.message });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onRefreshLearner) onRefreshLearner();
      await fetchScholarships();
      setTimeout(() => {
        setRedeemModalOpen(false);
        setRedeemNotice(null);
        setRedeemCodeInput('');
      }, 2500);
    } else {
      setRedeemNotice({ type: 'error', text: res.message });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

        <button
          onClick={() => setRedeemModalOpen(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all self-start sm:self-auto shadow-md"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Redeem Scholarship / Winner ACode</span>
        </button>
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

                  <span className="px-2.5 py-1 rounded-full text-xs font-black tracking-wide flex items-center space-x-1.5 bg-amber-500/20 border border-amber-500/50 text-amber-300">
                    <StudyCoinIcon className="w-3.5 h-3.5" glow />
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

                {/* Linked ACode Voucher if available */}
                {sch.acode && (
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800/70 text-[11px] text-indigo-300">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Voucher Code: <strong className="font-mono text-white">{sch.acode}</strong></span>
                    <button
                      onClick={() => handleCopyCode(sch.acode!)}
                      className="ml-1 text-slate-400 hover:text-white"
                      title="Copy ACode"
                    >
                      {copiedCode === sch.acode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                {/* If learner won a podium award */}
                {sch.wonAward && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center space-x-1">
                        <span>🏆</span>
                        <span>You Won Rank #{sch.wonAward.rank} by Quiz Accuracy ({sch.wonAward.accuracy}%)!</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        +{sch.wonAward.coins} Coins
                      </span>
                    </div>
                    {sch.wonAward.acode && (
                      <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-amber-500/30 text-[11px]">
                        <span className="font-mono font-bold text-amber-200">{sch.wonAward.acode}</span>
                        <button
                          onClick={() => handleCopyCode(sch.wonAward!.acode)}
                          className="flex items-center space-x-1 text-amber-400 hover:text-white font-semibold"
                        >
                          {copiedCode === sch.wonAward.acode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode === sch.wonAward.acode ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Accuracy Podium Laureates if awarded */}
                {sch.awards?.podium && sch.awards.podium.length > 0 && (
                  <div className="bg-slate-950/70 rounded-2xl p-2.5 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Accuracy Podium Laureates</span>
                      <span className="text-amber-400">Top Accuracy Winners</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      {sch.awards.podium.map((p: any) => (
                        <div key={p.rank} className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-center">
                          <div className="font-bold text-white truncate">
                            {p.rank === 1 ? '🥇 1st' : p.rank === 2 ? '🥈 2nd' : '🥉 3rd'} {p.learnerName?.split(' ')[0] || 'Winner'}
                          </div>
                          <div className="text-[9px] text-amber-400 font-mono font-semibold">{p.accuracy}% Acc</div>
                          <div className="text-[9px] text-slate-400 font-bold">+{p.coins}c</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                    <span className="flex items-center gap-1.5">
                      <StudyCoinIcon className="w-3.5 h-3.5" />
                      Scholarship Claimed (+{sch.rewardCoins} Coins Credited)
                    </span>
                  </div>
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaimReward(sch)}
                    disabled={claimingId === sch.id}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-amber-950 animate-pulse transition-all"
                  >
                    <Trophy className="w-4 h-4 text-slate-950" />
                    <span className="flex items-center gap-1.5">
                      <StudyCoinIcon className="w-4 h-4" />
                      {claimingId === sch.id
                        ? 'Claiming Scholarship...'
                        : `Claim ${sch.rewardCoins} Coins Scholarship!`}
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
              <div className="flex items-center justify-center space-x-2.5 text-2xl font-black text-amber-300">
                <StudyCoinIcon className="w-8 h-8" glow animate />
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

      {/* Redeem Scholarship / Winner / Friend ACode Modal */}
      {redeemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => { setRedeemModalOpen(false); setRedeemNotice(null); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white text-center">
              Redeem Scholarship / Winner ACode
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1 mb-4">
              Enter your official scholarship voucher code, podium award key, or friend pass to claim instant perks and coins!
            </p>

            <form onSubmit={handleRedeemACode} className="space-y-3">
              <input
                type="text"
                value={redeemCodeInput}
                onChange={e => setRedeemCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. AL-WIN1-..., AL-SCH-..., AL-FRND-..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase text-sm"
                required
              />

              {redeemNotice && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  redeemNotice.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                }`}>
                  {redeemNotice.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isRedeeming}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950 transition-all disabled:opacity-50"
              >
                {isRedeeming ? 'Redeeming Voucher...' : 'Redeem Code & Claim Reward'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
