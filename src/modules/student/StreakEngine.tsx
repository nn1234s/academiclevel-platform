import React from 'react';
import { Learner } from '../../core/types';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { Flame, Shield, Calendar, Sparkles, Check, AlertCircle } from 'lucide-react';

interface StreakEngineProps {
  learner: Learner;
  onBuyFreeze: () => void;
}

export const StreakEngine: React.FC<StreakEngineProps> = ({ learner, onBuyFreeze }) => {
  // Generate 28-day visual calendar grid
  const days = Array.from({ length: 28 }, (_, i) => {
    const dayNum = i + 1;
    const isCompleted = dayNum <= learner.currentStreakDays;
    return {
      dayNum,
      isCompleted,
      isToday: dayNum === learner.currentStreakDays
    };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-900">
      <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-700 uppercase bg-amber-100 border border-amber-300 px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>Consistency Engine</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Study Streaks &amp; Heatmap
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md">
            Daily practice builds compound knowledge. Complete at least one quiz or QOTD daily to sustain your flame.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center min-w-[110px] shadow-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Current Streak</span>
            <span className="text-2xl font-black text-amber-600">{learner.currentStreakDays} Days 🔥</span>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center min-w-[110px] shadow-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Longest Record</span>
            <span className="text-2xl font-black text-slate-900">{learner.longestStreakDays} Days</span>
          </div>
        </div>
      </div>

      {/* Streak Freeze Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Streak Freeze Protection</h3>
            <p className="text-xs text-slate-600">
              You currently have <strong className="text-amber-600">{learner.streakFreezesAvailable || 0}</strong> freeze shield(s) available.
            </p>
          </div>
        </div>

        <button
          onClick={onBuyFreeze}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <StudyCoinIcon className="w-4 h-4" />
          <span>Get Freeze in Mall (15 Coins)</span>
        </button>
      </div>

      {/* Heatmap Grid (28 Days) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Consistency Calendar (Past 4 Weeks)</span>
          </span>
          <span className="text-slate-500">Active Study Target: 1 Session/Day</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-[10px] font-mono text-slate-500 font-semibold py-1">
              {day}
            </div>
          ))}

          {days.map(d => (
            <div
              key={d.dayNum}
              className={`h-12 rounded-xl border flex flex-col items-center justify-center text-xs font-mono transition-all ${
                d.isCompleted
                  ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <span>{d.dayNum}</span>
              {d.isCompleted && <span className="text-[10px]">🔥</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
