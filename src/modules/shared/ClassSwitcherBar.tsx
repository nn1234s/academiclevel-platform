import React from 'react';
import { Grade } from '../../core/types';
import { CLASS_THEMES, getClassTheme } from '../../core/theme/classThemes';
import { Sparkles, Layers } from 'lucide-react';

interface ClassSwitcherBarProps {
  activeGrade: Grade;
  onSelectGrade: (grade: Grade) => void;
  showTitle?: boolean;
}

export const ClassSwitcherBar: React.FC<ClassSwitcherBarProps> = ({
  activeGrade,
  onSelectGrade,
  showTitle = true
}) => {
  const currentTheme = getClassTheme(activeGrade);
  const grades: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
      {showTitle && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-base">{currentTheme.mascot.emoji}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Class UI Selector
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${currentTheme.pillColor}`}>
                  Active: Class {activeGrade} • {currentTheme.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every class has its own distinct theme, mascot, customized dashboard, and 1,000 class-wise quizzes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>1,000 Verified Quizzes / Class</span>
          </div>
        </div>
      )}

      {/* Horizontal Class Selector Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
        {grades.map(g => {
          const theme = getClassTheme(g);
          const isActive = Number(activeGrade) === g;

          return (
            <button
              key={g}
              onClick={() => onSelectGrade(g)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 group relative ${
                isActive
                  ? `bg-gradient-to-r ${theme.gradientHero} text-white shadow-lg scale-105 ring-2 ring-white/30`
                  : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
              title={`Switch to Class ${g}: ${theme.name} (${theme.stageTitle})`}
            >
              <span className="text-sm">{theme.mascot.emoji}</span>
              <span>Class {g}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
