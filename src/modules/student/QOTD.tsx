import React, { useState, useEffect } from 'react';
import { Learner, Board, Grade } from '../../core/types';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { Compass, Sparkles, CheckCircle2, XCircle, ArrowRight, Flame, Award, Loader2 } from 'lucide-react';

interface QOTDProps {
  learner: Learner;
  onRefreshLearner: () => void;
}

interface DailyQuestion {
  title: string;
  subject: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

export const QOTD: React.FC<QOTDProps> = ({ learner, onRefreshLearner }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [question, setQuestion] = useState<DailyQuestion>({
    title: `Daily Board Challenge • ${learner.board} Class ${learner.grade}`,
    subject: 'Curriculum Mastery',
    text: `Loading Class ${learner.grade} daily challenge...`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 0,
    explanation: 'Step-by-step reasoning will appear after submission.',
    hint: 'Review key terms introduced in your class textbook.'
  });

  useEffect(() => {
    let isMounted = true;
    const loadDailyQuestion = async () => {
      try {
        const res = await fetch(`/api/quizzes/qotd?board=${encodeURIComponent(learner.board)}&grade=${learner.grade}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.question && isMounted) {
            setQuestion({
              title: `Daily Challenge • ${data.question.board || learner.board} Class ${data.question.grade || learner.grade}`,
              subject: data.question.subjectId ? data.question.subjectId.toUpperCase() : 'Curriculum Mastery',
              text: data.question.text,
              options: data.question.options,
              correctIndex: data.question.correctIndex,
              explanation: data.question.explanation,
              hint: data.question.hint
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[QOTD] Offline fallback active:', err);
      }

      if (isMounted) {
        // Class-appropriate offline fallbacks
        if (learner.grade <= 4) {
          setQuestion({
            title: `Daily Primary Challenge • ${learner.board} Class ${learner.grade}`,
            subject: 'Foundational Mathematics',
            text: `A classroom has ${learner.grade * 4} desks arranged in rows. If each row has 4 desks, how many rows are there in total?`,
            options: [`${learner.grade} rows`, `${learner.grade + 2} rows`, `${learner.grade + 4} rows`, `${learner.grade * 2} rows`],
            correctIndex: 0,
            explanation: `Divide total desks by desks per row: (${learner.grade * 4}) ÷ 4 = ${learner.grade} rows.`,
            hint: 'Think of basic division or equal groups.'
          });
        } else if (learner.grade <= 8) {
          setQuestion({
            title: `Daily Middle School Challenge • ${learner.board} Class ${learner.grade}`,
            subject: 'Science & Reasoning',
            text: 'Which cellular organelle is responsible for generating adenosine triphosphate (ATP) through cellular respiration?',
            options: ['Ribosome', 'Mitochondria', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
            correctIndex: 1,
            explanation: 'Mitochondria are the powerhouses of eukaryotic cells, producing ATP via oxidative phosphorylation.',
            hint: 'Often referred to as the powerhouse of the cell.'
          });
        } else {
          setQuestion({
            title: `Daily Senior Board Challenge • ${learner.board} Class ${learner.grade}`,
            subject: 'Senior Mathematics & Physics',
            text: 'If a particle moves along a straight line such that its displacement x(t) = 3t² - 12t + 9, at what time t does its instantaneous velocity become zero?',
            options: ['t = 1 second', 't = 2 seconds', 't = 3 seconds', 't = 4 seconds'],
            correctIndex: 1,
            explanation: 'Velocity is the derivative of displacement: v(t) = dx/dt = 6t - 12. Setting v(t) = 0 gives 6t = 12 => t = 2 seconds.',
            hint: 'Take the first derivative dx/dt with respect to time.'
          });
        }
        setIsLoading(false);
      }
    };

    loadDailyQuestion();
    return () => { isMounted = false; };
  }, [learner.board, learner.grade]);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);

    if (selectedOption === question.correctIndex && !rewardClaimed) {
      CoinLedgerService.appendTransaction(learner.id, 1, 'QOTD_COMPLETION', {
        date: new Date().toISOString().split('T')[0]
      });
      setRewardClaimed(true);
      setTimeout(() => {
        onRefreshLearner();
      }, 300);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Daily Streak Contributor
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1.5">{question.title}</h2>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>+1 Streak Day</span>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-xs text-slate-500 font-semibold mb-2 block">{question.subject}</span>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">{question.text}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map((opt, idx) => {
          let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';
          if (selectedOption === idx) {
            btnStyle = 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20';
          }
          if (isSubmitted) {
            if (idx === question.correctIndex) {
              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
            } else if (selectedOption === idx) {
              btnStyle = 'border-rose-500 bg-rose-50 text-rose-950';
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
                <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
              {isSubmitted && idx === question.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {isSubmitted && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
          <p className="font-bold text-indigo-700">Official Solution:</p>
          <p>{question.explanation}</p>
          {rewardClaimed && (
            <div className="pt-2 text-emerald-700 font-bold flex items-center space-x-1.5">
              <StudyCoinIcon className="w-4 h-4" glow />
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
