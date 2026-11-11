import React, { useState } from 'react';
import { Learner, Board, Grade, Subject } from '../../core/types';
import { QuotaService } from '../../services/quotaService';
import { CurriculumService } from '../../services/curriculumService';
import { CLASS_THEMES, getClassTheme } from '../../core/theme/classThemes';
import { ClassSwitcherBar } from '../shared/ClassSwitcherBar';
import {
  Flame,
  Award,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Compass,
  FileText,
  Star,
  Target,
  Trophy,
  ChevronRight,
  Layers,
  Check,
  Rocket,
  Atom,
  HelpCircle,
  BarChart3
} from 'lucide-react';

interface StudentDashboardProps {
  learner: Learner;
  activeGradeOverride?: Grade | null;
  onSelectGradeOverride?: (grade: Grade) => void;
  onNavigate: (module: string, extra?: any) => void;
  onOpenUpgradeModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  learner,
  activeGradeOverride,
  onSelectGradeOverride,
  onNavigate,
  onOpenUpgradeModal,
}) => {
  const isSuperAdmin = learner.role === 'SUPER_ADMIN';
  // Normal students always see the UI according to their sign up class (learner.grade)
  const activeGrade: Grade = (isSuperAdmin && activeGradeOverride) ? activeGradeOverride : (learner.grade || 10);

  const handleSelectGrade = (g: Grade) => {
    if (onSelectGradeOverride) {
      onSelectGradeOverride(g);
    }
  };

  const theme = getClassTheme(activeGrade);
  const quota = QuotaService.evaluateQuota(learner);
  const subjects = CurriculumService.getSubjects(learner.board, activeGrade);

  // 10th Board Exam countdown (Target: Feb 15)
  const boardExamDate = new Date(new Date().getFullYear() + 1, 1, 15);
  const daysToBoardExam = Math.max(1, Math.ceil((boardExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 text-slate-100">
      {/* Super-Admin ONLY: Multi-Class Visual Preview Bar (Hidden for all students) */}
      {isSuperAdmin && (
        <ClassSwitcherBar
          activeGrade={activeGrade}
          onSelectGrade={handleSelectGrade}
        />
      )}

      {/* 2. Class-Specific Hero Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 bg-gradient-to-r ${theme.gradientHero}`}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 text-white">
                <span className="text-sm">{theme.mascot.emoji}</span>
                <span>{learner.board} • Class {activeGrade} • {theme.name}</span>
              </span>

              <span className="px-2.5 py-1 bg-black/25 backdrop-blur-md rounded-full text-[10px] font-mono font-bold tracking-wider text-white/90">
                {theme.stageTitle}
              </span>

              {quota.hasActiveSubscription && (
                <span className="px-2.5 py-1 bg-emerald-500/30 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{quota.activePlan} Scholar Active</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black mt-2 leading-tight drop-shadow-sm">
              Welcome back, {learner.fullName.split(' ')[0]}! {theme.mascot.emoji}
            </h1>

            <p className="text-xs sm:text-sm text-white/95 mt-2 leading-relaxed max-w-xl font-medium">
              &quot;{theme.motto}&quot;
            </p>

            {/* Mascot Tip / Speech Bubble */}
            <div className="mt-4 inline-flex items-center space-x-2.5 bg-black/30 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl text-xs text-white/90 shadow-md">
              <span className="text-base flex-shrink-0">{theme.mascot.emoji}</span>
              <span className="italic">
                <strong>{theme.mascot.name}:</strong> &quot;{theme.greetingPhrases[0]}&quot;
              </span>
            </div>
          </div>

          {/* Quick Metrics Pod */}
          <div className="flex flex-row lg:flex-col items-center sm:items-end justify-between gap-3 bg-black/30 backdrop-blur-md p-4 rounded-3xl border border-white/20 min-w-[200px] shadow-xl">
            <div className="flex items-center space-x-3 w-full justify-between">
              <span className="text-xs font-bold text-white/80">Study Streak:</span>
              <div className="flex items-center space-x-1 font-black text-amber-300">
                <Flame className="w-4 h-4 fill-amber-300" />
                <span>{learner.currentStreakDays} Days</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full justify-between pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-white/80">Study Coins:</span>
              <div className="flex items-center space-x-1 font-black text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>{learner.coinBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full justify-between pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-white/80">Questions Bank:</span>
              <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
                1,000 Quizzes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Class-Specific Specialized Feature Widget */}
      {theme.stage === 'PRIMARY' ? (
        /* PRIMARY (Classes 1-4): Fun Star Sticker & Adventure Trail */
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-3xl flex items-center justify-center flex-shrink-0">
                {theme.specialWidget.emoji}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {theme.specialWidget.badgeText}
                  </span>
                  <span className="text-xs font-bold text-white">Class {activeGrade} Explorer Hub</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {theme.specialWidget.title}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  {theme.specialWidget.subtitle}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[140px] flex-shrink-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">{theme.specialWidget.statLabel}</span>
              <span className="text-lg font-black text-amber-400 mt-1 block">{theme.specialWidget.statValue}</span>
            </div>
          </div>
        </div>
      ) : theme.stage === 'MIDDLE' ? (
        /* MIDDLE (Classes 5-8): Tactical Cadet Command & Science Lab */
        <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-3xl flex items-center justify-center flex-shrink-0">
                {theme.specialWidget.emoji}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono">
                    {theme.specialWidget.badgeText}
                  </span>
                  <span className="text-xs font-bold text-slate-300">Middle School Progression Tree</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {theme.specialWidget.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  {theme.specialWidget.subtitle}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[140px] flex-shrink-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase font-mono">{theme.specialWidget.statLabel}</span>
              <span className="text-lg font-black text-indigo-400 mt-1 block font-mono">{theme.specialWidget.statValue}</span>
            </div>
          </div>
        </div>
      ) : activeGrade === 10 ? (
        /* CLASS 10 TITANS: Official 10th Board Exam Year Hub with Live Countdown Clock */
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md">
                  👑 10th Board Exam Headquarters
                </span>
                <span className="text-xs font-bold text-amber-300">Target: 100 / 100 in Board Finals</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                CBSE & ICSE Class 10 Specimen Paper Center
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Take timed practice sets calibrated strictly to standard Board Examination formats. Every question features board marking schemes, step-by-step NCERT explanations, and formulas.
              </p>
            </div>

            {/* Countdown Pod */}
            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="bg-slate-950/90 border border-amber-500/40 p-3.5 rounded-2xl text-center min-w-[100px] shadow-lg">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Board Countdown</span>
                <span className="text-2xl font-black text-white font-mono mt-0.5 block">{daysToBoardExam}</span>
                <span className="text-[9px] text-slate-500 font-mono">Days Remaining</span>
              </div>

              <div className="bg-slate-950/90 border border-amber-500/40 p-3.5 rounded-2xl text-center min-w-[100px] shadow-lg">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Board Syllabus</span>
                <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">1,000</span>
                <span className="text-[9px] text-slate-500 font-mono">Curated Questions</span>
              </div>
            </div>
          </div>
        </div>
      ) : activeGrade === 12 ? (
        /* CLASS 12 HALL OF FAME: 12th Boards + JEE / NEET / CUET Speed-Run Arena */
        <div className="bg-gradient-to-r from-red-950/50 via-slate-900 to-amber-950/40 border-2 border-red-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white shadow-md">
                  💎 12th Board & Competitive Arena
                </span>
                <span className="text-xs font-bold text-amber-300">JEE / NEET / CUET Speed-Run Active</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Class 12 All-India Rank & Distinction Command
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                High-yield multi-concept problems across Calculus, Electromagnetism, Organic Name Reactions, and Genetics with NTA-style timed interface.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="bg-slate-950/90 border border-red-500/40 p-3.5 rounded-2xl text-center min-w-[110px] shadow-lg">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase block">Percentile Aim</span>
                <span className="text-2xl font-black text-white font-mono mt-0.5 block">99.5%</span>
                <span className="text-[9px] text-slate-500 font-mono">Top Percentile</span>
              </div>

              <div className="bg-slate-950/90 border border-amber-500/40 p-3.5 rounded-2xl text-center min-w-[110px] shadow-lg">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Senior Bank</span>
                <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">1,000</span>
                <span className="text-[9px] text-slate-500 font-mono">Advanced Questions</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OTHER SECONDARY & SENIOR (Class 9 & 11) */
        <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-3xl flex items-center justify-center flex-shrink-0">
                {theme.specialWidget.emoji}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-mono">
                    {theme.specialWidget.badgeText}
                  </span>
                  <span className="text-xs font-bold text-slate-300">Class {activeGrade} Curriculum Center</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  {theme.specialWidget.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  {theme.specialWidget.subtitle}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[140px] flex-shrink-0">
              <span className="text-[10px] text-slate-400 block font-medium uppercase font-mono">{theme.specialWidget.statLabel}</span>
              <span className="text-lg font-black text-cyan-400 mt-1 block font-mono">{theme.specialWidget.statValue}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quota & Subscription Progress Meter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Subscription & Free Tier Quota Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {quota.hasActiveSubscription
                ? `${quota.activePlan} Plan Active • Unlimited Access (${quota.daysRemaining} days remaining)`
                : 'Free Tier strictly capped at 25 quizzes OR 3 course levels.'}
            </p>
          </div>

          {!quota.hasActiveSubscription ? (
            <button
              onClick={onOpenUpgradeModal}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Upgrade to Premium (₹49)
            </button>
          ) : (
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Quotas Lifted</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quizzes Meter */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400">Quizzes Completed</span>
              <span className="font-mono font-bold text-white">
                {quota.quizzesCompleted} / {quota.hasActiveSubscription ? '∞' : quota.maxQuizzes}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  quota.quizzesCompleted >= 25 && !quota.hasActiveSubscription
                    ? 'bg-red-500'
                    : 'bg-indigo-500'
                }`}
                style={{
                  width: quota.hasActiveSubscription
                    ? '100%'
                    : `${Math.min(100, (quota.quizzesCompleted / quota.maxQuizzes) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Course Levels Meter */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400">Course Levels Mastered</span>
              <span className="font-mono font-bold text-white">
                {quota.levelsCompleted} / {quota.hasActiveSubscription ? '∞' : quota.maxLevels}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  quota.levelsCompleted >= 3 && !quota.hasActiveSubscription
                    ? 'bg-red-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: quota.hasActiveSubscription
                    ? '100%'
                    : `${Math.min(100, (quota.levelsCompleted / quota.maxLevels) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Launch Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('SPIN_WHEEL')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Daily Spin Wheel</p>
          <span className="text-[10px] text-slate-400">24h UTC Cooldown</span>
        </button>

        <button
          onClick={() => onNavigate('QOTD')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Question of Day</p>
          <span className="text-[10px] text-slate-400">Streak Booster</span>
        </button>

        <button
          onClick={() => onNavigate('NOVA_AI')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Nova AI Socratic</p>
          <span className="text-[10px] text-slate-400">24/7 AI Tutor</span>
        </button>

        <button
          onClick={() => onNavigate('GIFT_STORE')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Gift Card Arena</p>
          <span className="text-[10px] text-slate-400">₹20 - ₹500 Vouchers</span>
        </button>
      </div>

      {/* 6. Class-Tailored Curriculum Subjects Grid (1,000 Questions per Class) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{theme.mascot.emoji}</span>
              <h2 className="text-lg font-bold text-white">
                Course Catalogue: {learner.board} Class {activeGrade}
              </h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${theme.pillColor}`}>
                1,000 Quizzes Loaded
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any subject to launch 4-level progression (Foundation, Concept, Exam-Ready, Olympiad).
            </p>
          </div>

          <button
            onClick={() => onNavigate('COURSES', { grade: activeGrade })}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Browse Full Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <div
              key={subject.id}
              onClick={() => onNavigate('LEVELS', { subjectId: subject.id, grade: activeGrade })}
              className={`bg-slate-900 border rounded-3xl p-6 cursor-pointer transition-all shadow-xl flex flex-col justify-between group ${theme.cardBorder} ${theme.cardHover}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {subject.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                    Class {activeGrade} Bank
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {subject.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold group-hover:text-amber-400 transition-colors">
                <span>Start Practice Quiz</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Class Badges & Milestones Showcase */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{theme.mascot.emoji}</span>
              <span>Class {activeGrade} Academic Badges & Milestones</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete quizzes with 70%+ score to unlock signature Class {activeGrade} achievements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {theme.badges.map((b, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 text-center flex flex-col items-center justify-between space-y-2 hover:border-slate-700 transition-colors"
            >
              <span className="text-3xl">{b.emoji}</span>
              <div>
                <p className="text-xs font-bold text-white">{b.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{b.desc}</p>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                Class {activeGrade} Badge
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
