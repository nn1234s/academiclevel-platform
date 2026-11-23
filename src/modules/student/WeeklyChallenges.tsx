import React, { useState, useEffect } from 'react';
import { Learner } from '../../core/types';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { Trophy, Clock, Users, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

interface WeeklyChallengesProps {
  learner: Learner;
  onLaunchChallenge: (subject: string) => void;
  onRefreshLearner?: () => void;
}

interface ChallengeItem {
  id: string;
  title: string;
  subject: string;
  duration: string;
  cohortSize: string;
  rewardCoins: number;
  status: 'OPEN' | 'COMPLETED';
  description: string;
  isCompleted?: boolean;
}

export const WeeklyChallenges: React.FC<WeeklyChallengesProps> = ({
  learner,
  onLaunchChallenge,
  onRefreshLearner
}) => {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([
    {
      id: 'wc_math_sprint',
      title: `${learner.board} Numerical Sprint Challenge`,
      subject: 'Mathematics',
      duration: '20 Minutes',
      cohortSize: '1,420 Active Peers',
      rewardCoins: 35,
      status: 'OPEN',
      description: 'Solve 15 non-routine arithmetic and algebraic questions against the live clock.'
    },
    {
      id: 'wc_science_olympiad',
      title: 'Junior Olympiad Diagnostic Cup',
      subject: 'Science & Discovery',
      duration: '25 Minutes',
      cohortSize: '980 Active Peers',
      rewardCoins: 50,
      status: 'OPEN',
      description: 'Experimental design, assertion-reasoning, and scientific inquiry scenarios.'
    },
    {
      id: 'wc_logic_blitz',
      title: 'Mental Aptitude & Spatial Logic',
      subject: 'Reasoning',
      duration: '15 Minutes',
      cohortSize: '2,150 Active Peers',
      rewardCoins: 30,
      status: 'OPEN',
      description: 'Pattern completion, syllogisms, and rapid algorithmic problem solving.'
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadChallenges = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/challenges?learnerId=${encodeURIComponent(learner.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.challenges) && data.challenges.length > 0 && isMounted) {
            setChallenges(data.challenges);
          }
        }
      } catch (err) {
        console.warn('[WeeklyChallenges] Failed to fetch server challenges, using cached default:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadChallenges();
    return () => {
      isMounted = false;
    };
  }, [learner.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900">
      <div className="bg-gradient-to-r from-violet-50 via-white to-indigo-50 border border-violet-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-violet-700 uppercase bg-violet-100 border border-violet-200 px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
            <Trophy className="w-3 h-3 text-amber-600" />
            <span>Weekly Competitive Missions</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Cohort Leaderboard Missions
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md">
            Timed, synchronized multi-subject challenges calibrated to {learner.board} Class {learner.grade}. Earn bonus coins and climb cohort rankings.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-[140px]">
          <span className="text-[10px] text-slate-500 block font-medium">Closes In</span>
          <span className="text-xl font-mono font-black text-amber-700">4d 14h 22m</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 text-slate-500 text-xs space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
          <span>Synchronizing weekly cohorts...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {challenges.map(c => {
          const isDone = c.isCompleted || c.status === 'COMPLETED';

          return (
            <div
              key={c.id}
              className={`bg-white border rounded-3xl p-6 flex flex-col justify-between shadow-sm transition-all ${
                isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-violet-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-100 text-violet-800">
                    {c.subject}
                  </span>
                  <span className="text-amber-700 font-bold flex items-center space-x-1.5">
                    <StudyCoinIcon className="w-3.5 h-3.5" glow />
                    <span>+{c.rewardCoins} Coins</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Time Limit: {c.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cohort: {c.cohortSize}</span>
                  </div>
                </div>
              </div>

              {isDone ? (
                <div className="mt-6 w-full py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="flex items-center gap-1">
                    <StudyCoinIcon className="w-3.5 h-3.5" />
                    Challenge Completed (+{c.rewardCoins} Coins)
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => onLaunchChallenge(c.subject)}
                  className="mt-6 w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Enter Mission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
