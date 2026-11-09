import React, { useState } from 'react';
import { Learner, Board, Grade } from '../../core/types';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { Compass, Sparkles, CheckCircle2, XCircle, ArrowRight, Flame, Award } from 'lucide-react';

interface QOTDProps {
  learner: Learner;
  onRefreshLearner: () => void;
}

export const QOTD: React.FC<QOTDProps> = ({ learner, onRefreshLearner }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Daily Question tailored to Board and Grade
  const question = {
    title: `Daily Board Challenge • ${learner.board} Class ${learner.grade}`,
    subject: 'Cross-Disciplinary Analytical Logic',
    text: `[${learner.board} Milestone] In a closed ecological or mathematical system, if the primary rate of change is inversely proportional to time elapsed, which graph curvature accurately represents its progression?`,
    options: [
      'A strictly linear straight line passing through origin',
      'A rectangular hyperbola asymptotic to the coordinate axes',
      'An exponential parabola opening vertically upwards',
      'A sinusoidal wave oscillating with constant frequency'
    ],
    correctIndex: 1,
    explanation: 'An inverse proportional relationship (y ∝ 1/x, or xy = k) algebraically graphs as a rectangular hyperbola whose arms asymptotically approach the axes.',
    hint: 'Think of Boyle’s Law (P ∝ 1/V) or inverse reciprocal function curves.'
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);

    if (selectedOption === question.correctIndex && !rewardClaimed) {
      CoinLedgerService.appendTransaction(learner.id, 1, 'QOTD_COMPLETION', {
        date: new Date().toISOString().split('T')[0]
      });
      setRewardClaimed(true);
      onRefreshLearner();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Daily Streak Contributor
          </span>
          <h2 className="text-xl font-bold text-white mt-1.5">{question.title}</h2>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-bold">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>+1 Streak Day</span>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-xs text-slate-400 font-semibold mb-2 block">{question.subject}</span>
        <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">{question.text}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((opt, idx) => {
          let btnStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-200';
          if (selectedOption === idx) {
            btnStyle = 'border-indigo-500 bg-indigo-950/40 text-white';
          }
          if (isSubmitted) {
            if (idx === question.correctIndex) {
              btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
            } else if (selectedOption === idx) {
              btnStyle = 'border-red-500 bg-red-950/40 text-red-200';
            }
          }

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
              {isSubmitted && idx === question.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {isSubmitted && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-indigo-400">Official Solution:</p>
          <p>{question.explanation}</p>
          {rewardClaimed && (
            <div className="pt-2 text-emerald-400 font-bold flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>+1 Study Coin credited for completing today&apos;s question!</span>
            </div>
          )}
        </div>
      )}

      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
        >
          <span>Submit Daily Answer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
