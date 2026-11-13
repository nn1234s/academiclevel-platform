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
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Trophy,
  Flame,
  CheckCircle2,
  Heart,
  MessageSquare,
  Play,
  TrendingUp,
  Brain,
  Video,
  Bot
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'REGISTER' | 'LOGIN') => void;
  onExploreCourse: (board: Board, grade: Grade) => void;
  onNavigate?: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreCourse,
  onNavigate,
}) => {
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(10);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PARENTS' | 'STUDENTS'>('ALL');

  const handleHallOfFameClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('HALL_OF_FAME');
    }
  };

  const handleAwardClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('INNOVATIVE_EDTECH');
    }
  };

  const aiPlatformEngines = [
    {
      title: 'Nova Socratic AI Tutor',
      category: 'Autonomous AI Guidance',
      badge: '24/7 Available',
      highlight: 'Socratic Problem Solver',
      desc: 'Guides students through difficult math & science questions step-by-step with patient hints rather than giving raw answers away.',
      gradient: 'from-blue-600 to-indigo-700',
      icon: '🧠',
    },
    {
      title: '12,000 Questions Bank Engine',
      category: 'Curriculum-Mapped Bank',
      badge: 'Classes 1–12',
      highlight: 'CBSE • ICSE • Cambridge',
      desc: 'Rigorous 4-stage progression across Foundation, Conceptual Applications, Board Exam PYQs, and Olympiad HOTS challenges.',
      gradient: 'from-purple-600 to-pink-700',
      icon: '📚',
    },
    {
      title: 'Real-Time Diagnostic Engine',
      category: 'Adaptive Assessment',
      badge: 'Zero Guesswork',
      highlight: 'Identifies Learning Gaps',
      desc: 'Continuously diagnoses syllabus weaknesses with mathematical precision and generates targeted micro-drills to fix them.',
      gradient: 'from-amber-600 to-orange-700',
      icon: '⚡',
    },
    {
      title: 'Anti-Cheat Integrity Guard',
      category: 'Strict Security Kernel',
      badge: 'Audited Telemetry',
      highlight: 'Minimum Dwell-Time',
      desc: 'Enforces authentic engagement with 3-second dwell checks and append-only cryptographic logging to protect learner credibility.',
      gradient: 'from-emerald-600 to-teal-700',
      icon: '🛡️',
    },
    {
      title: 'Study Coin Ledger & Economy',
      category: 'Gamified Motivation',
      badge: 'Instant Rewards',
      highlight: 'Loyalty Store & Gifts',
      desc: 'Rewarding consistent academic effort with earnable study coins that students redeem for books, stationery, and certificates.',
      gradient: 'from-rose-600 to-red-700',
      icon: '💎',
    },
    {
      title: 'Multi-Version Dynamic Fallback',
      category: 'Enterprise Infrastructure',
      badge: '99.9% Uptime',
      highlight: 'Ultra-Low Latency',
      desc: 'Built on persistent SQLite ACID storage and multi-model AI failover for instant answers during late-night exam preparations.',
      gradient: 'from-cyan-600 to-blue-700',
      icon: '🚀',
    },
  ];

  const parentStudentReviews = [
    { text: 'AcademicLevel makes learning so fun! 🎉', time: '19 days ago', author: 'Ananya S., Class 7', role: 'STUDENTS' },
    { text: 'Best platform ever! Nova AI is awesome and solves doubts instantly!', time: '7 days ago', author: 'Rahul K., Class 10', role: 'STUDENTS' },
    { text: 'I aced my test thanks to Nova AI and the concept booster! 💯', time: '20 days ago', author: 'Tanvi M., Class 9', role: 'STUDENTS' },
    { text: 'Lessons are super cool and easy! Science is now my favourite.', time: '29 days ago', author: 'Ishaan P., Class 6', role: 'STUDENTS' },
    { text: 'I love learning here, it’s like playtime with study coins! 💎', time: '9 days ago', author: 'Aarav G., Class 4', role: 'STUDENTS' },
    { text: 'AcademicLevel is my secret to success in school exams 🚀', time: '10 days ago', author: 'Diya R., Class 8', role: 'STUDENTS' },
    { text: 'Course content syncs with CBSE school syllabus, zero pressure to learn.', time: '11 days ago', author: 'Mrs. Sunita Verma', role: 'PARENTS' },
    { text: 'Reasonable course price, low burden on parents. Truly accessible. 😍', time: '5 days ago', author: 'Rajesh Sharma', role: 'PARENTS' },
    { text: 'Improved learning initiative, child no longer needs parental supervision.', time: '14 days ago', author: 'Dr. Meenakshi Iyer', role: 'PARENTS' },
    { text: 'Nova AI makes everything so clear~ love the instant step-by-step guidance!', time: '20 days ago', author: 'Devendra N., Class 11', role: 'STUDENTS' },
    { text: 'Autonomous AI tutor is always available for problem solving 24/7.', time: '4 days ago', author: 'Pooja Agarwal', role: 'PARENTS' },
    { text: 'Children love to learn every single day, thank you AcademicLevel!', time: '8 days ago', author: 'Kavita Sengupta', role: 'PARENTS' },
    { text: 'Nova AI is the best—patient, kind, and super smart ❤️', time: '24 days ago', author: 'Rohan B., Class 5', role: 'STUDENTS' },
    { text: 'Best learning platform, none of them come close! 😍', time: '28 days ago', author: 'Amit Patel', role: 'PARENTS' },
    { text: 'I feel smarter every day with Nova AI answering all my doubts.', time: '16 days ago', author: 'Sneha D., Class 10', role: 'STUDENTS' },
  ];

  const filteredReviews = activeTab === 'ALL'
    ? parentStudentReviews
    : parentStudentReviews.filter(r => r.role === activeTab);

  return (
    <div className="space-y-24 text-slate-100 pb-12">
      
      {/* 1. TOP HERO SECTION (MOST ELITE AI QUIZ PLATFORM) */}
      <section className="relative pt-8 pb-16 text-center max-w-6xl mx-auto px-4 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 backdrop-blur-md shadow-xs">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>India&apos;s No.1 Premium K-12 Online Learning Platform — Supercharged with AI</span>
          </div>

          <a
            href="/most-innovative-edtech"
            onClick={handleAwardClick}
            title="Read independent recognition on EdTech Century"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 backdrop-blur-md transition-all group shadow-xs cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>🏆 Ranked #1 Most Innovative EdTech (EdTech Century)</span>
          </a>

          <a
            href="/halloffame"
            onClick={handleHallOfFameClick}
            title="View Recognized Security Researchers"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 backdrop-blur-md transition-all group shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>🛡️ Security Hall of Fame</span>
          </a>
        </div>

        {/* Main Hero Header */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Most Elite AI Quiz Platform. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-indigo-400">
              Supercharged with AI.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed">
            Live Interaction. Deeper Learning. Stronger Results. <br className="hidden sm:inline" />
            <span className="text-indigo-300 font-semibold">India’s Smartest AI Socratic Engine</span> knows your gaps and solves them fast. All subjects, one platform, real academic progress.
          </p>
        </div>

        {/* Social Proof Counter */}
        <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 border border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">AI</div>
            <div className="w-6 h-6 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">12K</div>
            <div className="w-6 h-6 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">★</div>
          </div>
          <span>Trusted by <strong className="text-white">4,000+ Students</strong> across India</span>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/special49"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-orange-950 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] cursor-pointer"
          >
            <span>Claim 60-Day Breakthrough (₹49)</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </a>

          <button
            onClick={() => onOpenAuth('LOGIN')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 font-bold text-sm rounded-2xl transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            Sign In (Existing User)
          </button>
        </div>

        {/* Trust Points */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Third-Party Ads</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>DPDP Act 2023 Child Safety</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Offline Question Bank Fallback</span>
          </div>
        </div>
      </section>

      {/* 2. MOST POPULAR CONCEPT BOOSTER COURSE (ADVERT1 MIX) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Most Popular Concept Booster Course</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Master Core Concepts in <span className="text-amber-400">60 Days</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Accelerate K-12 academic growth with our autonomous AI curriculum. Bridge learning gaps before term exams with daily AI diagnostic quizzes, 1-on-1 Socratic feedback, and real-time concept clarity with zero human delays.
              </p>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-amber-400 font-black text-sm">60 Days</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Concept Booster Pass</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-indigo-400 font-black text-sm">Autonomous AI</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Zero Human Bias</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-emerald-400 font-black text-sm">Maths &amp; Science</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Curriculum Focused</div>
                </div>
              </div>
            </div>

            {/* Special Pricing Card (Advert1 ₹49 Mix) */}
            <div className="shrink-0 w-full lg:w-80 bg-slate-950/90 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase">
                Limited Time Special
              </span>
              <div>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white">₹49</span>
                  <span className="text-xs text-slate-400 line-through">₹499</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Full 60-Day Unrestricted Access (Save 90%)
                </p>
              </div>

              <div className="space-y-2 text-left text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Classes 1 to 12 (CBSE / ICSE / IGCSE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Nova AI Socratic Problem Solver</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>12,000 Syllabus-Verified Questions</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <a
                  href="/special49"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Enroll Now (₹49)</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </a>
                <a
                  href="/special49"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-colors flex items-center justify-center"
                >
                  Explore Breakthrough Curriculum
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MOST ELITE AI QUIZ PLATFORM */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Brain className="w-4 h-4 text-amber-400" />
            <span>Autonomous Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Most Elite AI Quiz Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            AcademicLevel replaces rigid classroom schedules with an autonomous, 24/7 Socratic AI quiz engine tailored precisely to your syllabus, strengths, and pace.
          </p>

          {/* 4 Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">12,000+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Verified Questions</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">100% AI</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Autonomous Socratic Tutoring</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">24/7 Instant</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Socratic Doubts Solved</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl sm:text-3xl font-black text-rose-400">98.6%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Positive Rating</div>
            </div>
          </div>
        </div>

        {/* 6 AI Architecture Engine Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiPlatformEngines.map((engine, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                    {engine.badge}
                  </span>
                  <span className="text-[11px] text-indigo-400 font-semibold">{engine.highlight}</span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">{engine.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{engine.title}</h3>
                    <p className="text-xs font-medium text-slate-400">{engine.category}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                  {engine.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Autonomous AI Verified</span>
                </span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>5.0 / 5.0</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. IMMERSIVE & INTERACTIVE LEARNING EXPERIENCE */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Pedagogical Innovation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Immersive &amp; Interactive Learning Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Supercharged with AI to provide a personalized journey for every student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Interactive Quizzes */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold">
              🎯
            </div>
            <h3 className="font-extrabold text-white text-base">Interactive Quizzes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time online quizzes with multiple engaging interactive formats keep students focused, motivated, and exam-ready.
            </p>
          </div>

          {/* Card 2: Abundant Rewards */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
              💎
            </div>
            <h3 className="font-extrabold text-white text-base">Abundant Rewards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A rich reward system motivates children to keep learning, turning every lesson into a fun challenge with earnable study coins and gift redemptions.
            </p>
          </div>

          {/* Card 3: Professional Study Report */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold">
              📊
            </div>
            <h3 className="font-extrabold text-white text-base">Professional Study Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-scale study reports — session, weekly, monthly — powered by Nova AI to pinpoint weak concepts and guide continuous improvement.
            </p>
          </div>

          {/* Card 4: Engaging Experiments */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl font-bold">
              🔬
            </div>
            <h3 className="font-extrabold text-white text-base">Engaging Experiments</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faster knowledge absorption with LIVE experiments, step-by-step visual models, and applications that bring science to life.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE BOARD & CLASS SELECTOR (CURRICULUM ENGINE) */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Full Syllabus Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Explore Your Board &amp; Grade
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
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
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
                4-tier progression: Foundation, Conceptual Applications, {selectedBoard} Exam PYQs &amp; Olympiad HOTS.
              </p>
            </div>
            <button
              onClick={() => onExploreCourse(selectedBoard, selectedGrade)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Preview Course</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. 3 AGE-ADAPTIVE LEARNING TIERS */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Age-Adaptive UI Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
            Engineered for Every Stage of Growing Up
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            A 7-year-old child should not see the same interface as a 17-year-old preparing for Board exams. AcademicLevel transforms dynamically.
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

      {/* 7. WIDELY PRAISED BY PARENTS & STUDENTS (COMMUNITY WALL OF LOVE) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Widely Praised by Parents &amp; Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Hear from our community of over 4,000 students and parents thriving with AcademicLevel&apos;s autonomous AI platform.
          </p>

          {/* Rating Cards Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-400">98.6%</div>
              <div className="text-[11px] text-slate-400">Overall Satisfaction</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                <span>4.8</span>
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="text-[11px] text-slate-400">Learner Feedback Rating</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-black text-indigo-400">4,000+</div>
              <div className="text-[11px] text-slate-400">Active Students</div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-6">
            {(['ALL', 'STUDENTS', 'PARENTS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab === 'ALL' ? 'All Stories' : tab === 'STUDENTS' ? 'Student Reviews' : 'Parent Reviews'}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-amber-400">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{rev.time}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">{rev.author}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300">
                  {rev.role === 'PARENTS' ? 'Parent' : 'Scholar'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. TRANSPARENT PRICING PREVIEW */}
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
                  <span>Unlimited Quizzes &amp; Tests</span>
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
              className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
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
                  <span>Olympiad &amp; Competitive Track</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Annual Master Certificate Eligible</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onOpenAuth('REGISTER')}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all cursor-pointer"
            >
              Unlock Plus Plan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
