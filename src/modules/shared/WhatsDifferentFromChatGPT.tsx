import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Brain,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
  Target,
  BarChart3,
  TrendingDown,
  Gift,
  Lock,
  ArrowRight,
  Zap,
  HelpCircle
} from 'lucide-react';

export interface WhatsDifferentFromChatGPTProps {
  mode?: 'STUDENT_PARENT' | 'TEACHER_SCHOOL';
  onCtaClick?: () => void;
  className?: string;
}

export const WhatsDifferentFromChatGPT: React.FC<WhatsDifferentFromChatGPTProps> = ({
  mode = 'STUDENT_PARENT',
  onCtaClick,
  className = ''
}) => {
  const isTeacher = mode === 'TEACHER_SCHOOL';

  const comparisons = [
    {
      feature: 'Curriculum & Syllabus Alignment',
      chatgpt: 'Hallucinates formulas; gives US/UK college-level answers out of Indian syllabus.',
      academiclevel: '100% strictly aligned with CBSE, ICSE & IGCSE (Classes 1–12) with 3,600+ verified NCERT questions.',
      icon: BookOpen,
      highlight: true
    },
    {
      feature: 'True Learning vs "Homework Copying"',
      chatgpt: 'Dumps the final answer immediately. Kids blindly copy without understanding and fail school exams.',
      academiclevel: 'Socratic AI Tutor never gives away answers. It asks probing hints, analogies, and guides step-by-step thinking.',
      icon: Brain,
      highlight: true
    },
    {
      feature: 'Exam-Pattern Quizzing & Speed Timers',
      chatgpt: 'Zero timed tests, no negative marking, no speed-accuracy pressure, no real evaluation.',
      academiclevel: 'Real timer-based adaptive quizzes, Class 10 board evaluation benchmarks, and instant misconception breakdown.',
      icon: Target,
      highlight: false
    },
    {
      feature: isTeacher ? 'Classroom Analytics & Gap Diagnostics' : 'Parent & Teacher Progress Visibility',
      chatgpt: 'Complete black box. Parents and teachers have zero insight into student knowledge gaps.',
      academiclevel: isTeacher 
        ? 'Automated Conceptual Weak Points Heatmap (e.g. flags lens sign convention gaps) + live quiz tracker across your batch.'
        : 'Automated weak point tracking, accuracy percentages, and real-time concept mastery reports.',
      icon: BarChart3,
      highlight: true
    },
    {
      feature: 'Anti-Cheating & Student/Teacher Role Isolation',
      chatgpt: 'Unmonitored chat where kids cheat on assignments. No institutional controls.',
      academiclevel: 'Strict account separation. Student accounts cannot view teacher answer keys, diagnostics, or voucher vaults.',
      icon: ShieldCheck,
      highlight: false
    },
    {
      feature: 'Motivation, Gamification & Real Rewards',
      chatgpt: 'Cold, dry text chat box. Students get bored and abandon it within 2 days.',
      academiclevel: 'Physical rewards store (Pokémon cards, smartwatches delivered worldwide), study coins, and verified digital certificates.',
      icon: Gift,
      highlight: false
    }
  ];

  return (
    <div className={`rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 text-xs font-black shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{"WHAT'S DIFFERENT FROM CHATGPT?"}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {isTeacher
            ? <>Why Schools &amp; Tutors Choose AcademicLevel Over <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">Free ChatGPT</span></>
            : <>Why Free ChatGPT Fails Students While <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600">AcademicLevel</span> Builds Toppers</>}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {isTeacher
            ? 'Kids use generic ChatGPT to blindly copy homework answers without learning. AcademicLevel stops cheating with Socratic reasoning, real CBSE/ICSE curriculum diagnostics, and isolated Teacher Admin accounts.'
            : 'Generic ChatGPT does homework FOR kids, killing their exam performance. AcademicLevel is the only syllabus-locked platform with Socratic AI guidance, exam timers, and real motivation.'}
        </p>
      </div>

      {/* Comparison Table / Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <thead>
            <tr className="bg-slate-50 text-slate-800 border-b border-slate-200">
              <th className="p-4 font-bold text-slate-900 w-1/4">Study Dimension</th>
              <th className="p-4 font-bold text-rose-800 bg-rose-50/60 w-3/8 border-l border-r border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Free Generic ChatGPT</span>
                </div>
              </th>
              <th className="p-4 font-black text-emerald-900 bg-emerald-50/60 w-3/8">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>AcademicLevel Platform</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {comparisons.map((c, i) => {
              const Icon = c.icon;
              return (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900 flex items-start space-x-2">
                    <Icon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span>{c.feature}</span>
                      {c.highlight && (
                        <span className="block text-[9px] font-mono text-amber-700 font-semibold uppercase mt-0.5">
                          High Impact
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 bg-rose-50/20 border-l border-r border-slate-200">
                    <div className="flex items-start space-x-2">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 leading-relaxed">{c.chatgpt}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-800 bg-emerald-50/20 font-medium">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-900 font-semibold leading-relaxed">{c.academiclevel}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Security & Strict Role Isolation Guarantee */}
      <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span>Strict Student &amp; Teacher Account Separation</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold">Anti-Cheating Guard</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Teacher Admin accounts are strictly segregated from learner accounts. Kids cannot misuse teacher mode to see quiz answer keys or bypass timed assessments.
            </p>
          </div>
        </div>

        {onCtaClick && (
          <button
            type="button"
            onClick={onCtaClick}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <span>{isTeacher ? 'Get School Pack (₹2,499) ↗' : 'Start for Just ₹49 ↗'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};
