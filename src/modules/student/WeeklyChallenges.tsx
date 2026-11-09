import React, { useState } from 'react';
import { Learner } from '../../core/types';
import { Trophy, Clock, Users, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface WeeklyChallengesProps {
  learner: Learner;
  onLaunchChallenge: (subject: string) => void;
}

export const WeeklyChallenges: React.FC<WeeklyChallengesProps> = ({ learner, onLaunchChallenge }) => {
  const challenges = [
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
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 border border-violet-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>Weekly Competitive Missions</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Cohort Leaderboard Missions
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Timed, synchronized multi-subject challenges calibrated to {learner.board} Class {learner.grade}. Earn bonus coins and climb cohort rankings.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[140px]">
          <span className="text-[10px] text-slate-400 block font-medium">Closes In</span>
          <span className="text-xl font-mono font-black text-amber-400">4d 14h 22m</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {challenges.map(c => (
          <div
            key={c.id}
            className="bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300">
                  {c.subject}
                </span>
                <span className="text-amber-400 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>+{c.rewardCoins} Coins</span>
                </span>
              </div>

              <h3 className="font-extrabold text-white text-base leading-snug">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{c.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Time Limit: {c.duration}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cohort: {c.cohortSize}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onLaunchChallenge(c.subject)}
              className="mt-6 w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-950 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Enter Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
