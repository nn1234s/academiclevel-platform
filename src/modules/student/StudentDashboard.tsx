import React from 'react';
import { Learner, Board, Grade, Subject } from '../../core/types';
import { QuotaService } from '../../services/quotaService';
import { CurriculumService } from '../../services/curriculumService';
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
  FileText
} from 'lucide-react';

interface StudentDashboardProps {
  learner: Learner;
  onNavigate: (module: string, extra?: any) => void;
  onOpenUpgradeModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  learner,
  onNavigate,
  onOpenUpgradeModal,
}) => {
  const quota = QuotaService.evaluateQuota(learner);
  const subjects = CurriculumService.getSubjects(learner.board, learner.grade);

  const isPrimary = learner.grade <= 4;
  const isMiddle = learner.grade >= 5 && learner.grade <= 8;
  const isSenior = learner.grade >= 9;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Age-Adaptive Hero Section */}
      {isPrimary ? (
        /* PRIMARY (Classes 1-4): Cheerful, large cards, playful friendly encouragement */
        <div className="bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                🌟 Super Scholar • Class {learner.grade}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black mt-2">
                Welcome back, {learner.fullName.split(' ')[0]}! 🚀
              </h1>
              <p className="text-sm text-white/90 mt-1 max-w-md">
                Ready to explore fun puzzles and earn shiny badges today?
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <span className="text-3xl">🔥</span>
              <div>
                <span className="text-xs font-bold block">Study Streak</span>
                <span className="text-2xl font-black">{learner.currentStreakDays} Days</span>
              </div>
            </div>
          </div>
        </div>
      ) : isMiddle ? (
        /* MIDDLE (Classes 5-8): Gamified quest tracker */
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {learner.board} CLASS {learner.grade}
                </span>
                {quota.hasActiveSubscription && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {quota.activePlan} Premium Active
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Mastery Command Center, {learner.fullName.split(' ')[0]}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Your syllabus journey across {learner.board} concepts and competitive thinking.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[90px]">
                <div className="flex items-center justify-center space-x-1 text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span className="text-base font-black">{learner.currentStreakDays}d</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Streak</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[90px]">
                <div className="flex items-center justify-center space-x-1 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-base font-black">{learner.coinBalance}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Coins</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SENIOR (Classes 9-12): High-Density Board Exam Analytics */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {learner.board} SENIOR SECONDARY • CLASS {learner.grade}
                </span>
                <span className="text-xs text-slate-400">Official Exam Track</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                Board Exam & Foundation Analytics: {learner.fullName}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Targeting high-weightage chapters, PYQ patterns, and Olympiad HOTS questions.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Streak</span>
                <span className="text-sm font-bold text-amber-400">{learner.currentStreakDays} Days 🔥</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Ledger Balance</span>
                <span className="text-sm font-bold text-amber-400">{learner.coinBalance} Coins 🪙</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quota Progress Meter (Enforced Server-Side) */}
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

      {/* Quick Launch Cards */}
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
          onClick={() => onNavigate('CERTIFICATES')}
          className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-white">Certificate Vault</p>
          <span className="text-[10px] text-slate-400">Unique IDs</span>
        </button>
      </div>

      {/* Curriculum Subjects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              Course Catalogue ({learner.board} Class {learner.grade})
            </h2>
            <p className="text-xs text-slate-400">
              Select a subject to begin 4-tier node progression (Foundation, Concept, Exam-Ready, Olympiad).
            </p>
          </div>
          <button
            onClick={() => onNavigate('COURSES')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <div
              key={subject.id}
              onClick={() => onNavigate('LEVELS', { subjectId: subject.id })}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.01] shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {subject.icon}
                </div>
                <h3 className="font-bold text-white text-base">{subject.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{subject.description}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                <span>4 Progression Nodes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
