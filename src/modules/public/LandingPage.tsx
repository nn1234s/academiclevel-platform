import React, { useState } from 'react';
import { Board, Grade } from '../../core/types';
import {
  Sparkles,
  Zap,
  Award,
  ShieldCheck,
  Check,
  ArrowRight,
  BookOpen,
  Users,
  Compass,
  Star,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'REGISTER' | 'LOGIN') => void;
  onExploreCourse: (board: Board, grade: Grade) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onExploreCourse }) => {
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(10);

  return (
    <div className="space-y-24 text-slate-100">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 text-center max-w-5xl mx-auto px-4 overflow-hidden">
        {/* Glow blur background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>India&apos;s Premier K-12 AI Learning Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          Learn in your era.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AI-powered adaptive learning engineered for <strong className="text-white">Classes 1 to 12</strong> across{' '}
          <strong className="text-indigo-400">CBSE</strong>, <strong className="text-purple-400">ICSE/CISCE</strong>, and{' '}
          <strong className="text-cyan-400">Cambridge IGCSE</strong>. Master concepts with Nova AI, anti-cheat assessments, and real rewards.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onOpenAuth('REGISTER')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-950 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02]"
          >
            <span>Start Free (25 Quizzes Free)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenAuth('LOGIN')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm rounded-2xl transition-all"
          >
            Student & Parent Login
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Zero Third-Party Ads</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>DPDP Act 2023 Child Safety</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Offline Question Bank Fallback</span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CURRICULUM PREVIEW */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Interactive Board Selector
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Explore Your Curriculum
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your Board and Class to preview age-adaptive learning nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Board</label>
              <div className="grid grid-cols-3 gap-2">
                {(['CBSE', 'ICSE', 'IGCSE'] as Board[]).map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBoard(b)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedBoard === b
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Class (1 to 12)</label>
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(Number(e.target.value) as Grade)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              >
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
                  <option key={g} value={g}>Class {g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white">
                {selectedBoard} Class {selectedGrade} Syllabus Configured
              </span>
              <p className="text-[11px] text-slate-400">
                4-tier progression: Foundation, Conceptual Applications, {selectedBoard} Exam PYQs & Olympiad HOTS.
              </p>
            </div>
            <button
              onClick={() => onExploreCourse(selectedBoard, selectedGrade)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap"
            >
              <span>Preview Course</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3 AGE-ADAPTIVE LEARNING TIERS */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Age-Adaptive UI Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            Engineered for Every Stage of Growing Up
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            A 7-year-old child should not see the same UI as a 17-year-old preparing for Board exams. AcademicLevel transforms dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-b from-amber-950/20 to-slate-900 border border-amber-900/40 rounded-3xl p-6 shadow-xl space-y-3">
            <span className="text-3xl">🎈</span>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">Classes 1 to 4</span>
            <h3 className="font-extrabold text-white text-base">Visual Gamified Learning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Large interactive cards, friendly emoji-rich guides, and cheerful badges designed to spark natural curiosity without cognitive overload.
            </p>
          </div>

          <div className="bg-gradient-to-b from-indigo-950/20 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 shadow-xl space-y-3">
            <span className="text-3xl">🧭</span>
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block">Classes 5 to 8</span>
            <h3 className="font-extrabold text-white text-base">Interactive Quest Tracks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gamified chapter sidebars, streak progression flames, Socratic reasoning prompts, and friendly peer challenges.
            </p>
          </div>

          <div className="bg-gradient-to-b from-emerald-950/20 to-slate-900 border border-emerald-900/40 rounded-3xl p-6 shadow-xl space-y-3">
            <span className="text-3xl">📊</span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">Classes 9 to 12</span>
            <h3 className="font-extrabold text-white text-base">Board Exam Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-density syllabus mastery meters, past-year question (PYQ) weightage trends, marking scheme tips, and Olympiad rigor.
            </p>
          </div>
        </div>
      </section>

      {/* TRANSPARENT PRICING PREVIEW */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Accessible Pricing for Every Indian Family
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            No Exploitative Coaching Fees
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Top-tier educational AI at less than ₹1 per day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">LITE PLAN</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                  60 Days
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-4xl font-black text-white">₹49</span>
                <span className="text-xs text-slate-400">/ 60 days</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Unlimited Quizzes & Tests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>All 4 Progression Nodes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Nova AI Socratic Tutor 24/7</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('REGISTER')}
              className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Get Started with Lite
            </button>
          </div>

          <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-2 border-indigo-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white tracking-widest uppercase">
              Best Value
            </span>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-300">PLUS PLAN</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  180 Days
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-4xl font-black text-white">₹129</span>
                <span className="text-xs text-slate-400">/ 180 days (~₹21/mo)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Full 180-Day Unlimited Access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Olympiad & Competitive Track</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Annual Master Certificate Eligible</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('REGISTER')}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all"
            >
              Unlock Plus Plan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
