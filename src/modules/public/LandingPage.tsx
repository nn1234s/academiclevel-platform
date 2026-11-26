import React, { useState, useEffect } from 'react';
import { Board, Grade } from '../../core/types';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { SiteConfigService } from '../../services/siteConfigService';
import { PaymentService } from '../../services/paymentService';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { WhatsDifferentFromChatGPT } from '../shared/WhatsDifferentFromChatGPT';
import { WindowsAppBanner } from '../shared/WindowsAppBanner';
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
  Bot,
  AlertTriangle,
  School,
  BarChart3,
  KeyRound
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
  const { registerStudent, loginStudent, currentLearner, refreshCurrentLearner } = useAuth();
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(10);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PARENTS' | 'STUDENTS'>('ALL');
  const [homeConfig, setHomeConfig] = useState(() => SiteConfigService.getHome());
  const [pricingConfig, setPricingConfig] = useState(() => SiteConfigService.getPricing());

  // Direct UPI PG & Instant Pass Activation State
  const [activatePlanTier, setActivatePlanTier] = useState<'LITE' | 'PLUS' | 'GOLD' | null>(null);
  const [studentFullName, setStudentFullName] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [regBoard, setRegBoard] = useState<Board>('CBSE');
  const [regGrade, setRegGrade] = useState<Grade>(10);
  const [receiptRef, setReceiptRef] = useState('');
  const [isActivatingPlan, setIsActivatingPlan] = useState(false);
  const [activateError, setActivateError] = useState('');
  const [activateSuccess, setActivateSuccess] = useState(false);
  const [noticeLang, setNoticeLang] = useState<'EN' | 'HINGLISH'>('EN');

  const handleBuyNow = (tier: 'LITE' | 'PLUS' | 'GOLD') => {
    const url = PaymentService.getGatewayUrl(tier);
    try {
      sessionStorage.setItem('al_landing_pending_tier', tier);
      sessionStorage.setItem('al_landing_pay_clicked_time', Date.now().toString());
    } catch {}
    window.open(url, '_blank', 'noopener,noreferrer');
    setActivatePlanTier(tier);
    setActivateError('');
  };

  const handleCreateAccountAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivateError('');
    if (!activatePlanTier) return;
    setIsActivatingPlan(true);

    try {
      let learnerId = currentLearner?.id;
      if (!learnerId) {
        const cleanInput = studentContact.trim().toLowerCase();
        const targetEmail = cleanInput.includes('@') && !cleanInput.endsWith('@upi')
          ? cleanInput
          : `${cleanInput.replace(/[^0-9]/g, '') || 'scholar'}@special49.academiclevel.in`;

        const existing = StorageRLSLayer.getLearnerByEmail(targetEmail);
        if (existing) {
          learnerId = existing.id;
          if (studentPassword.trim()) {
            await loginStudent(targetEmail, studentPassword.trim()).catch(() => {});
          }
        } else {
          const regRes = await registerStudent({
            fullName: studentFullName.trim() || 'Scholar',
            email: targetEmail,
            password: studentPassword.trim(),
            board: regBoard,
            grade: regGrade,
            parentName: 'Parent'
          });
          if (regRes.success) {
            const session = StorageRLSLayer.getCurrentSession();
            learnerId = session?.learnerId;
          } else {
            setActivateError(regRes.error || 'Failed to create student account.');
            setIsActivatingPlan(false);
            return;
          }
        }
      }

      const finalLearnerId = learnerId || `lrn_${Date.now()}`;
      const actRes = await PaymentService.activateGatewayPayment(
        finalLearnerId,
        activatePlanTier,
        receiptRef.trim() || undefined
      );

      if (actRes.success) {
        refreshCurrentLearner();
        setActivateSuccess(true);
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('DASHBOARD');
          } else {
            window.location.href = '/dashboard';
          }
        }, 1200);
      } else {
        setActivateError(actRes.error || 'Failed to activate plan.');
      }
    } catch (err: any) {
      setActivateError(err.message || 'Error completing account setup.');
    } finally {
      setIsActivatingPlan(false);
    }
  };

  useEffect(() => {
    const checkLandingReturn = () => {
      try {
        const pendingTier = sessionStorage.getItem('al_landing_pending_tier') as 'LITE' | 'PLUS' | null;
        const tappedTime = Number(sessionStorage.getItem('al_landing_pay_clicked_time') || 0);
        const elapsed = Date.now() - tappedTime;
        if (pendingTier && elapsed < 30 * 60 * 1000) {
          sessionStorage.removeItem('al_landing_pending_tier');
          sessionStorage.removeItem('al_landing_pay_clicked_time');
          setActivatePlanTier(pendingTier);
        } else if (pendingTier && elapsed >= 30 * 60 * 1000) {
          sessionStorage.removeItem('al_landing_pending_tier');
          sessionStorage.removeItem('al_landing_pay_clicked_time');
        }
      } catch {}
    };

    checkLandingReturn();
    window.addEventListener('pageshow', checkLandingReturn);
    window.addEventListener('focus', checkLandingReturn);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkLandingReturn();
    });

    const unsubscribe = SiteConfigService.subscribe(() => {
      setHomeConfig(SiteConfigService.getHome());
      setPricingConfig(SiteConfigService.getPricing());
    });

    return () => {
      window.removeEventListener('pageshow', checkLandingReturn);
      window.removeEventListener('focus', checkLandingReturn);
      unsubscribe();
    };
  }, []);

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
      title: 'Nova AI Tutor',
      category: 'Autonomous AI Guidance',
      badge: '24/7 Available',
      highlight: 'Interactive Study Helper',
      desc: 'Guides students through difficult math & science questions step-by-step with clear, patient hints rather than giving raw answers away.',
      accent: 'bg-[#3F51B5]',
      icon: '🎓',
    },
    {
      title: '3,600+ Questions Bank Engine',
      category: 'Curriculum-Mapped Bank',
      badge: 'Classes 1–12',
      highlight: 'CBSE Classes 1–12',
      desc: 'Comprehensive chapter-wise practice across Foundation concepts, Applications, Board Exam PYQs, and Olympiad HOTS challenges.',
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
    { text: 'AcademicLevel makes learning so fun! 🎉', time: '19 days ago', author: 'Ananya S., Student', role: 'STUDENTS' },
    { text: 'Best platform ever! Nova AI is awesome and solves doubts instantly!', time: '7 days ago', author: 'Rahul K., Student', role: 'STUDENTS' },
    { text: 'I aced my test thanks to Nova AI and the concept booster! 💯', time: '20 days ago', author: 'Tanvi M., Student', role: 'STUDENTS' },
    { text: 'Lessons are super cool and easy! Science is now my favourite.', time: '29 days ago', author: 'Ishaan P., Student', role: 'STUDENTS' },
    { text: 'I love learning here, it’s like playtime with study coins! 💎', time: '9 days ago', author: 'Aarav G., Student', role: 'STUDENTS' },
    { text: 'AcademicLevel is my secret to success in school exams 🚀', time: '10 days ago', author: 'Diya R., Student', role: 'STUDENTS' },
    { text: 'Course content syncs with CBSE school syllabus, zero pressure to learn.', time: '11 days ago', author: 'Mrs. Sunita Verma', role: 'PARENTS' },
    { text: 'Reasonable course price, low burden on parents. Truly accessible. 😍', time: '5 days ago', author: 'Rajesh Sharma', role: 'PARENTS' },
    { text: 'Improved learning initiative, child no longer needs parental supervision.', time: '14 days ago', author: 'Dr. Meenakshi Iyer', role: 'PARENTS' },
    { text: 'Nova AI makes everything so clear~ love the instant step-by-step guidance!', time: '20 days ago', author: 'Devendra N., Student', role: 'STUDENTS' },
    { text: 'Autonomous AI tutor is always available for problem solving 24/7.', time: '4 days ago', author: 'Pooja Agarwal', role: 'PARENTS' },
    { text: 'Children love to learn every single day, thank you AcademicLevel!', time: '8 days ago', author: 'Kavita Sengupta', role: 'PARENTS' },
    { text: 'Nova AI is the best—patient, kind, and super smart ❤️', time: '24 days ago', author: 'Rohan B., Student', role: 'STUDENTS' },
    { text: 'Best learning platform, none of them come close! 😍', time: '28 days ago', author: 'Amit Patel', role: 'PARENTS' },
    { text: 'I feel smarter every day with Nova AI answering all my doubts.', time: '16 days ago', author: 'Sneha D., Student', role: 'STUDENTS' },
  ];

  const filteredReviews = activeTab === 'ALL'
    ? parentStudentReviews
    : parentStudentReviews.filter(r => r.role === activeTab);

  return (
    <div className="space-y-8 sm:space-y-16 text-[#212121] pb-8 sm:pb-12">
      
      {/* 1. TOP HERO SECTION (MATERIAL 1 TACTILE PAPER PAPER SHEET) */}
      <section className="relative pt-4 sm:pt-8 pb-8 sm:pb-12 text-center max-w-6xl mx-auto px-2 sm:px-4">
        <div className="md-card p-6 sm:p-10 border border-[#E0E0E0]">
          {/* Announcement Ticker from CMS */}
          {homeConfig.announcementActive && homeConfig.announcementText && (
            <div className="mb-6 inline-flex items-center space-x-2 px-4 py-2 rounded-[2px] bg-[#FFF8E1] border border-[#FFE082] text-[#E65100] text-xs font-bold max-w-2xl mx-auto">
              <Sparkles className="w-4 h-4 text-[#FF6D00] flex-shrink-0" />
              <span>{homeConfig.announcementText}</span>
            </div>
          )}

          {/* Top Material 1 Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div className="md-chip inline-flex items-center space-x-2 px-3 py-1 text-xs font-bold bg-[#E8EAF6] border border-[#C5CAE9] text-[#283593]">
              <Bot className="w-3.5 h-3.5 text-[#3F51B5]" />
              <span>India&apos;s K-12 AI Learning Platform</span>
            </div>

            <a
              href="/most-innovative-edtech"
              onClick={handleAwardClick}
              title="Read independent recognition on EdTech Century"
              className="md-chip inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-bold bg-[#FFF8E1] hover:bg-[#FFECB3] border border-[#FFE082] text-[#E65100] transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FF8F00]" />
              <span>Ranked #1 Most Innovative EdTech (EdTech Century)</span>
            </a>

            <a
              href="/halloffame"
              onClick={handleHallOfFameClick}
              title="View Security & Bug Bounty Policy"
              className="md-chip inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-bold bg-[#E3F2FD] hover:bg-[#BBDEFB] border border-[#90CAF9] text-[#1565C0] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1976D2]" />
              <span>Security &amp; Bug Bounty</span>
            </a>
          </div>

          {/* Main Hero Header */}
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#212121] leading-tight">
              {homeConfig.heroTitle ? (
                <span>{homeConfig.heroTitle}</span>
              ) : (
                <>
                  Master Your School Curriculum. <br className="hidden sm:inline" />
                  <span className="text-[#3F51B5]">
                    Supercharged with AI.
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#616161] font-normal max-w-3xl mx-auto leading-relaxed">
              {homeConfig.heroSubtitle || (
                <>
                  Live Interaction. Deeper Learning. Stronger Results. <br className="hidden sm:inline" />
                  <span className="text-[#3F51B5] font-semibold">Nova AI Study Helper</span> identifies your learning gaps and guides you step-by-step across the CBSE curriculum.
                </>
              )}
            </p>
          </div>

          {/* Action CTAs — Classic Material 1 Raised & Flat Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('REGISTER')}
              className="md-btn-raised w-full sm:w-auto px-6 py-3 bg-[#009688] hover:bg-[#00796B] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Start Free Practice (6 Levels Free)</span>
            </button>

            <a
              href="/special49"
              className="md-btn-raised w-full sm:w-auto px-6 py-3 bg-[#FF6D00] hover:bg-[#E65100] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer tabular-nums"
            >
              <span>Claim 60-Day Breakthrough (₹49)</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </a>

            <button
              onClick={() => onOpenAuth('LOGIN')}
              className="md-btn-flat w-full sm:w-auto px-6 py-3 text-[#3F51B5] border border-[#E0E0E0] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center cursor-pointer"
            >
              Sign In
            </button>
          </div>

          {/* Divider + Trust Points */}
          <div className="md-divider mt-8 pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#616161] font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#009688]" />
              <span>6 Curriculum Levels Free</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#009688]" />
              <span>Zero Third-Party Ads</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#009688]" />
              <span>Instant AI Feedback</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#009688]" />
              <span>Offline Question Bank Fallback</span>
            </div>
          </div>

          <div className="mt-6 text-left">
            <WindowsAppBanner onOpenDownloads={onNavigate ? () => onNavigate('DOWNLOADS') : undefined} />
          </div>
        </div>
      </section>

      {/* 2. MOST POPULAR CONCEPT BOOSTER COURSE (MATERIAL 1 PAPER CARD) */}
      <section className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="md-card border border-[#E0E0E0] border-t-4 border-t-[#FF6D00] p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <div className="md-chip inline-flex items-center gap-2 px-3 py-1 bg-[#FFF8E1] border border-[#FFE082] text-[#E65100] text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-[#FF6D00]" />
                <span>Most Popular Concept Booster Course</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-[#212121] tracking-tight">
                Master Core Concepts in <span className="text-[#FF6D00] tabular-nums">60 Days</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#616161] leading-relaxed">
                Accelerate K-12 academic growth with our autonomous AI curriculum. Bridge learning gaps before term exams with daily AI diagnostic quizzes, 1-on-1 Nova AI Tutor feedback, and real-time concept clarity.
              </p>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-[4px] bg-[#FAFAFA] border border-[#E0E0E0] text-center">
                  <div className="text-[#E65100] font-bold text-sm tabular-nums">60 Days</div>
                  <div className="text-[11px] text-[#616161] mt-0.5">Concept Booster Pass</div>
                </div>
                <div className="p-3 rounded-[4px] bg-[#FAFAFA] border border-[#E0E0E0] text-center">
                  <div className="text-[#3F51B5] font-bold text-sm">Autonomous AI</div>
                  <div className="text-[11px] text-[#616161] mt-0.5">Zero Human Bias</div>
                </div>
                <div className="p-3 rounded-[4px] bg-[#FAFAFA] border border-[#E0E0E0] text-center">
                  <div className="text-[#009688] font-bold text-sm">Maths &amp; Science</div>
                  <div className="text-[11px] text-[#616161] mt-0.5">Curriculum Focused</div>
                </div>
              </div>
            </div>

            {/* Special Pricing Card */}
            <div className="shrink-0 w-full lg:w-80 bg-white border border-[#E0E0E0] border-t-4 border-t-[#3F51B5] rounded-[4px] p-6 shadow-dp4 text-center space-y-4">
              <span className="md-chip inline-block px-3 py-1 bg-[#FFF8E1] text-[#E65100] text-[10px] font-mono font-bold tracking-widest uppercase">
                Limited Time Special
              </span>
              <div>
                <div className="flex items-baseline justify-center gap-1.5 tabular-nums">
                  <span className="text-4xl sm:text-5xl font-bold text-[#212121]">₹49</span>
                  <span className="text-xs text-[#9E9E9E] line-through">₹499</span>
                </div>
                <p className="text-[11px] text-[#00796B] font-semibold mt-1 tabular-nums">
                  Full 60-Day Unrestricted Access (Save 90%)
                </p>
              </div>

              <div className="md-divider space-y-2 text-left text-xs text-[#616161] pt-3">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#009688] shrink-0" />
                  <span>Classes 1 to 12 (CBSE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#009688] shrink-0" />
                  <span>Nova AI Problem Solver</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#009688] shrink-0" />
                  <span>3,600+ Syllabus-Verified Questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#009688] shrink-0" />
                  <span>Full Study Material &amp; Printable Worksheets</span>
                </div>
              </div>

              <div className="md-divider pt-3 space-y-2">
                <a
                  href="/special49"
                  className="md-btn-raised w-full py-3 bg-[#FF6D00] hover:bg-[#E65100] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer tabular-nums"
                >
                  <span>Enroll Now (₹49)</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </a>
                <a
                  href="/special49"
                  className="md-btn-flat w-full py-2 text-[#3F51B5] text-xs font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  Explore Curriculum
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MOST ELITE AI QUIZ PLATFORM */}
      <section className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="text-center mb-10 space-y-3">
          <div className="md-chip inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8EAF6] border border-[#C5CAE9] text-[#283593] text-xs font-bold uppercase tracking-wider">
            <Brain className="w-4 h-4 text-[#3F51B5]" />
            <span>Autonomous Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121]">
            Most Elite AI Quiz Platform
          </h2>
          <p className="text-xs sm:text-sm text-[#616161] max-w-2xl mx-auto">
            AcademicLevel replaces rigid classroom schedules with an autonomous, 24/7 adaptive AI quiz engine tailored precisely to your syllabus, strengths, and pace.
          </p>

          {/* 4 Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
            <div className="md-card p-4 border border-[#E0E0E0] text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#FF6D00] tabular-nums">3,600+</div>
              <div className="text-xs text-[#616161] font-medium mt-1">Verified Questions</div>
            </div>
            <div className="md-card p-4 border border-[#E0E0E0] text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#3F51B5] tabular-nums">100% AI</div>
              <div className="text-xs text-[#616161] font-medium mt-1">Autonomous Study Helper</div>
            </div>
            <div className="md-card p-4 border border-[#E0E0E0] text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#009688] tabular-nums">24/7</div>
              <div className="text-xs text-[#616161] font-medium mt-1">Study Doubts Solved</div>
            </div>
            <div className="md-card p-4 border border-[#E0E0E0] text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#212121] tabular-nums">98.6%</div>
              <div className="text-xs text-[#616161] font-medium mt-1">Positive Rating</div>
            </div>
          </div>
        </div>

        {/* 6 AI Architecture Engine Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiPlatformEngines.map((engine, idx) => (
            <div
              key={idx}
              className="md-card md-card-interactive border border-[#E0E0E0] p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="md-chip px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#F5F5F5] text-[#424242] border border-[#E0E0E0]">
                    {engine.badge}
                  </span>
                  <span className="text-[11px] text-[#3F51B5] font-semibold">{engine.highlight}</span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">{engine.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-[#212121]">{engine.title}</h3>
                    <p className="text-xs font-medium text-[#616161]">{engine.category}</p>
                  </div>
                </div>

                <p className="text-xs text-[#616161] leading-relaxed pt-3 md-divider">
                  {engine.desc}
                </p>
              </div>

              <div className="pt-3 md-divider flex items-center justify-between text-[11px] text-[#616161]">
                <span className="flex items-center gap-1.5 text-[#009688] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Autonomous AI Verified</span>
                </span>
                <span className="text-[#FF8F00] flex items-center gap-1 font-semibold tabular-nums">
                  <Star className="w-3 h-3 fill-[#FFC107]" />
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Pedagogical Innovation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Immersive &amp; Interactive Learning Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Supercharged with AI to provide a personalized journey for every student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Interactive Quizzes */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 text-xl font-bold">
              🎯
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Interactive Quizzes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time online quizzes with multiple engaging interactive formats keep students focused, motivated, and exam-ready.
            </p>
          </div>

          {/* Card 2: Abundant Rewards */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 hover:border-amber-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <StudyCoinIcon className="w-8 h-8" glow />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Abundant Rewards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A rich reward system motivates children to keep learning, turning every lesson into a fun challenge with earnable study coins and gift redemptions.
            </p>
          </div>

          {/* Card 3: Professional Study Report */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xl font-bold">
              📊
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Professional Study Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full-scale study reports — session, weekly, monthly — powered by Nova AI to pinpoint weak concepts and guide continuous improvement.
            </p>
          </div>

          {/* Card 4: Engaging Experiments */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 hover:border-purple-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 text-xl font-bold">
              🔬
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Engaging Experiments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Faster knowledge absorption with LIVE experiments, step-by-step visual models, and applications that bring science to life.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE BOARD & CLASS SELECTOR (CURRICULUM ENGINE) */}
      <section className="max-w-4xl mx-auto px-1 sm:px-4">
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              Full Syllabus Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Explore Your Board &amp; Grade
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select your Board and Class to preview age-adaptive learning nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Your Board</label>
              <div className="grid grid-cols-3 gap-2">
                {(['CBSE'] as Board[]).map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBoard(b)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedBoard === b
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Class (1 to 12)</label>
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(Number(e.target.value) as Grade)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-base sm:text-xs text-slate-900 focus:outline-none cursor-pointer"
              >
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
                  <option key={g} value={g}>Class {g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900">
                {selectedBoard} Class {selectedGrade} Syllabus Configured
              </span>
              <p className="text-[11px] text-slate-500">
                Structured chapter-wise practice: Foundation concepts, Applications, {selectedBoard} Exam PYQs &amp; Olympiad HOTS.
              </p>
            </div>
            <button
              onClick={() => onExploreCourse(selectedBoard, selectedGrade)}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap cursor-pointer active:scale-98"
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
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Age-Adaptive UI Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Engineered for Every Stage of Growing Up
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            A 7-year-old child should not see the same interface as a 17-year-old preparing for Board exams. AcademicLevel transforms dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm hover:shadow-md space-y-3">
            <span className="text-3xl">🎈</span>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-700 block">Classes 1 to 4</span>
            <h3 className="font-extrabold text-slate-900 text-base">Visual Gamified Learning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Large interactive cards, friendly emoji-rich guides, and cheerful badges designed to spark natural curiosity without cognitive overload.
            </p>
          </div>

          <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-sm hover:shadow-md space-y-3">
            <span className="text-3xl">🧭</span>
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 block">Classes 5 to 8</span>
            <h3 className="font-extrabold text-slate-900 text-base">Interactive Quest Tracks</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gamified chapter sidebars, streak progression flames, friendly study buddy tips, and cheerful peer challenges.
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm hover:shadow-md space-y-3">
            <span className="text-3xl">📊</span>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 block">Classes 9 to 12</span>
            <h3 className="font-extrabold text-slate-900 text-base">Board Exam Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-density syllabus mastery meters, past-year question (PYQ) weightage trends, marking scheme tips, and Olympiad rigor.
            </p>
          </div>
        </div>
      </section>

      {/* 7. WIDELY PRAISED BY PARENTS & STUDENTS (COMMUNITY WALL OF LOVE) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Community Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Widely Praised by Parents &amp; Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Hear from students and parents mastering their school curriculum with AcademicLevel&apos;s interactive AI quiz platform.
          </p>

          {/* Feature Highlights Bar (Real Platform Features) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-emerald-600">24/7</div>
              <div className="text-[11px] text-slate-500 font-medium">Nova AI Tutor 24/7</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                <span>4.8</span>
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Verified Learner Rating</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="text-2xl font-black text-indigo-600">3,600+</div>
              <div className="text-[11px] text-slate-500 font-medium">Curriculum AI Quizzes</div>
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
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
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
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-amber-500">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{rev.time}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-800">{rev.author}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium">
                  {rev.role === 'PARENTS' ? 'Parent' : 'Scholar'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. TRANSPARENT PRICING PREVIEW */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-800 uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Free Starter &amp; Transparent Memberships
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Start 100% Free • Upgrade When Ready
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Master 6 curriculum levels free on any subject, or unlock full unlimited access at less than ₹1 per day.
          </p>
        </div>

        {/* Payment Return Notice Banner with English & Hinglish Toggle */}
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 text-left shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Payment Return Notice</span>
            </div>
            <div className="flex bg-white rounded-lg p-0.5 text-[10px] font-bold border border-slate-200 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setNoticeLang('EN')}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'EN' ? 'bg-amber-500 text-white font-black' : 'text-slate-600 hover:text-slate-900'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setNoticeLang('HINGLISH')}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'HINGLISH' ? 'bg-amber-500 text-white font-black' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Hinglish
              </button>
            </div>
          </div>
          {noticeLang === 'EN' ? (
            <p className="text-xs leading-relaxed text-amber-900 font-medium">
              ⚠️ <strong>AFTER you have paid in UPI PG</strong>, instead of being stuck on that page, <strong>CLICK back and return here</strong>, otherwise we will forget your payment as we track payments and accounts by the pay now button click.
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-amber-900 font-medium">
              ⚠️ <strong>UPI PG mein payment complete karne ke baad</strong>, wahan page par ruke rehne ke bajaye <strong>CLICK back karke yahan wapas aaiye</strong>, warna hum aapki payment bhool sakte hain kyunki hum payments aur accounts ko Pay Now button click ke through track karte hain.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free Starter Plan */}
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black tracking-wider uppercase px-3 py-1 rounded-bl-xl shadow-xs">
              100% FREE
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-700">FREE STARTER</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                  Lifetime Free
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-4xl font-black text-slate-900">₹0</span>
                <span className="text-xs text-slate-500">/ forever (no card needed)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3 Complete Curriculum Levels</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All 12 Classes (CBSE)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant Friendly Nova AI Hints</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Diagnostic Mailbox Reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Earn Study Coins on Every Quiz</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => onOpenAuth('REGISTER')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>SIGN UP FREE (6 LEVELS) 🚀</span>
              </button>
            </div>
          </div>
          {/* Lite Plan */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800">LITE PLAN</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                  {pricingConfig.liteDurationDays || 60} Days
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-4xl font-black text-slate-900">₹{pricingConfig.litePriceInr || 49}</span>
                <span className="text-xs text-slate-500">/ {pricingConfig.liteDurationDays || 60} days (~₹24.50/mo)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Unlimited Quizzes &amp; Tests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>All Syllabus Chapters &amp; Topics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Nova AI Tutor 24/7</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => handleBuyNow('LITE')}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:scale-[1.01]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>BUY NOW (₹{pricingConfig.litePriceInr || 49}) — UPI PG ↗</span>
              </button>
            </div>
          </div>

          {/* Plus Plan (180 Days) */}
          <div className="bg-white border-2 border-indigo-400 hover:border-indigo-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md transition-all">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-700">PLUS PLAN (180 DAYS)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                  {pricingConfig.plusDurationDays || 180} Days (Half Year)
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mb-2">
                <span className="text-4xl font-black text-slate-900">₹{pricingConfig.plusPriceInr || 129}</span>
                <span className="text-xs text-slate-500">/ 180 days</span>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ~₹21.50/mo
                </span>
              </div>

              {/* Value Comparison Pill */}
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
                ⭐ <strong>Pay just ₹80 more</strong> than Lite to get <strong>120 extra days (4 full months free!)</strong>.
              </div>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-bold text-slate-900">Full {pricingConfig.plusDurationDays || 180}-Day Syllabus Coverage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Both Midterms &amp; Board Final Exams Covered</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Olympiad &amp; National Foundation Track</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Physical Rewards Eligible (Pokémon &amp; Bottles)</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => handleBuyNow('PLUS')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:scale-[1.01]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>BUY NOW (₹{pricingConfig.plusPriceInr || 129}) — 180-DAY ↗</span>
              </button>
            </div>
          </div>

          {/* Gold Plan (Crown Best Value - 365 Days) */}
          <div className="bg-gradient-to-b from-amber-50/70 via-white to-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative ring-4 ring-amber-400/20">
            <span className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-white tracking-widest uppercase shadow-md animate-pulse">
              👑 1-YEAR GOLD • UNBEATABLE BEST VALUE
            </span>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-amber-800 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>GOLD PLAN (365 DAYS)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 border border-amber-300 text-amber-900">
                  {pricingConfig.goldDurationDays || 365} Days (1 Full Year)
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mb-2">
                <span className="text-4xl font-black text-amber-900">₹{pricingConfig.goldPriceInr || 205}</span>
                <span className="text-xs text-slate-500">/ 365 days</span>
                <span className="text-xs text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  ~₹17.08/mo (Only ~56 paise/day!)
                </span>
              </div>

              {/* Value Comparison Pill */}
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                ⭐ <strong>Pay just ₹76 more</strong> than 6-month plan to get <strong>185 EXTRA DAYS (Double your duration to 365 Days!)</strong>. Covers the entire school year!
              </div>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="font-bold text-slate-900">Full 365-Day Complete Academic Year Coverage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Both Terms, Midterms &amp; Board Final Exams Covered</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>VIP Priority Store Rewards (Pokémon, Milton &amp; Mystery Box)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Exclusive Gold Scholar Profile Badge &amp; Frame</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Annual Master Certificate of Academic Excellence</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => handleBuyNow('GOLD')}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer transform hover:scale-[1.01]"
              >
                <ExternalLink className="w-4 h-4" />
                <span>BUY NOW (₹{pricingConfig.goldPriceInr || 205}) — 365-DAY GOLD ↗</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8.5 WHY ACADEMICLEVEL VS FREE CHATGPT */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
        <WhatsDifferentFromChatGPT
          mode="STUDENT_PARENT"
          onCtaClick={() => setActivatePlanTier('LITE')}
        />
      </section>

      {/* 9. FOR SCHOOLS, EDUCATORS & INSTITUTIONS: CLASSROOM PACK & INTELLIGENCE */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                <School className="w-4 h-4 text-amber-600" />
                <span>FOR SCHOOLS, COACHINGS &amp; TUTORS</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Institutional Classroom Pack • <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-indigo-600">₹2,499 Flat</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Empower your batch with <strong className="text-slate-900">20 Plus (180 Days)</strong> or <strong className="text-slate-900">40 Lite (60 Days)</strong> A-Codes, live quiz tracking, and automated conceptual weak point diagnostics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('SCHOOL_PORTAL') : (window.location.href = '/school')}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.02]"
              >
                <School className="w-4 h-4 text-white" />
                <span>Open School Portal (₹2,499) ↗</span>
              </button>
            </div>
          </div>

          {/* 3 Core Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            {/* 1. Bulk A-Codes Voucher Pack */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2.5 text-amber-700 font-bold text-sm">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Bulk A-Codes Included</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get <strong className="text-slate-900">20 Plus A-Codes (180 Days each)</strong> or <strong className="text-slate-900">40 Lite A-Codes (60 Days each)</strong> instantly in your teacher dashboard. Students activate in 1 tap without personal cards.
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-emerald-700">
                ✓ Cost per student: as low as ₹62.47
              </div>
            </div>

            {/* 2. Live Classroom Quiz Tracking */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2.5 text-indigo-700 font-bold text-sm">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Live Quiz Tracker</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor student test submissions in real time. Filter by Class (1–12), Board (CBSE), and see instant accuracy percentages without manual grading.
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-indigo-700">
                ✓ Live submission feed &amp; auto-grading
              </div>
            </div>

            {/* 3. AI Conceptual Weak Points */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2.5 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Student Weak Points Heatmap</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                AI diagnostic scanner highlights sub-topics where students scored &lt;60% (e.g. Snell&apos;s law, quadratic word problems) so teachers can run targeted remedial quizzes.
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-amber-700">
                ✓ Pinpoints exact knowledge gaps
              </div>
            </div>
          </div>

          {/* Interactive Live Classroom Tracker & Weak Points Diagnostic Preview */}
          <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Quiz Activity Feed Mockup */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Classroom Quiz Activity Feed</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Class 10 CBSE Demo Batch</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Aarav Patel • Science</span>
                    <span className="text-[11px] text-slate-500">Light: Reflection &amp; Refraction</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    60% Review
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Priya Sharma • Mathematics</span>
                    <span className="text-[11px] text-slate-500">Quadratic Equations &amp; Roots</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    40% Critical
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Rohan Das • Science</span>
                    <span className="text-[11px] text-slate-500">Acids, Bases &amp; Salts</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    100% Passed
                  </span>
                </div>
              </div>
            </div>

            {/* Conceptual Weak Points Preview */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Automated Conceptual Weak Points</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">AI Pedagogical Scanner</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-900">Snell&apos;s Law &amp; Lens Formula (Physics)</span>
                    <span className="text-[10px] font-mono font-bold text-rose-700">8/20 struggling (46%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Students confusing sign conventions (+/-) for focal length of concave vs convex lens.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900">Speed &amp; Time Word Problems (Math)</span>
                    <span className="text-[10px] font-mono font-bold text-amber-700">6/20 struggling (52%)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Difficulty translating speed/distance word problems into standard quadratic equations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              🛡️ <strong>Strict Role Isolation:</strong> Dedicated educator portal. Student accounts cannot view teacher diagnostics or quiz solutions.
            </div>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('SCHOOL_PORTAL') : (window.location.href = '/school')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <span>Explore /school Offer &amp; Teacher Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </section>

      {/* UPI PG INSTANT ACTIVATION MODAL */}
      {activatePlanTier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900">
            <button
              onClick={() => {
                setActivatePlanTier(null);
                setActivateSuccess(false);
                setActivateError('');
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Close dialog"
            >
              ✕
            </button>

            {activateSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-900">Membership Activated! 🎉</h3>
                <p className="text-xs text-slate-600">
                  Your <strong>{activatePlanTier === 'GOLD' ? 'Gold Pass (365 Days / 1 Year)' : (activatePlanTier === 'PLUS' ? 'Plus Plan (180 Days)' : 'Lite Plan (60 Days)')}</strong> has been activated automatically via UPI PG. Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAccountAndActivate} className="space-y-4 text-xs">
                <div className="text-center">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Official UPI PG Activation
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1.5">
                    Payment OK. Make Student Account:-
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Paid via UPI PG ({activatePlanTier === 'GOLD' ? 'Gold Plan ₹205' : (activatePlanTier === 'PLUS' ? 'Plus Plan ₹129' : 'Lite Plan ₹49')})? Enter your details below to create your student account and get your subscription instantly.
                  </p>
                </div>

                {activateError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {activateError}
                  </div>
                )}

                {/* Payment Return Notice with English & Hinglish Toggle */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px]">Payment Return Notice</span>
                    </div>
                    <div className="flex bg-white rounded-lg p-0.5 text-[9px] font-bold border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => setNoticeLang('EN')}
                        className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'EN' ? 'bg-amber-500 text-white font-black' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoticeLang('HINGLISH')}
                        className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'HINGLISH' ? 'bg-amber-500 text-white font-black' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Hinglish
                      </button>
                    </div>
                  </div>
                  {noticeLang === 'EN' ? (
                    <p className="text-[10px] leading-relaxed text-amber-900 font-medium">
                      ⚠️ <strong>AFTER you have paid in UPI PG</strong>, instead of being stuck on that page, <strong>CLICK back and return here</strong>, otherwise we will forget your payment as we track payments and accounts by the pay now button click.
                    </p>
                  ) : (
                    <p className="text-[10px] leading-relaxed text-amber-900 font-medium">
                      ⚠️ <strong>UPI PG mein payment complete karne ke baad</strong>, wahan page par ruke rehne ke bajaye <strong>CLICK back karke yahan wapas aaiye</strong>, warna hum aapki payment bhool sakte hain kyunki hum payments aur accounts ko Pay Now button click ke through track karte hain.
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Gateway Link:</span>
                  <a
                    href={PaymentService.getGatewayUrl(activatePlanTier)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-bold"
                  >
                    Open UPI PG ↗
                  </a>
                </div>

                {!currentLearner ? (
                  <>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aarav Sharma"
                        value={studentFullName}
                        onChange={e => setStudentFullName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Parent Mobile / Email *</label>
                      <input
                        type="text"
                        required
                        placeholder="9861439460 or parent@gmail.com"
                        value={studentContact}
                        onChange={e => setStudentContact(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Class / Grade *</label>
                        <select
                          value={regGrade}
                          onChange={e => setRegGrade(Number(e.target.value) as Grade)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                            <option key={g} value={g}>Class {g}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Board *</label>
                        <select
                          value={regBoard}
                          onChange={e => setRegBoard(e.target.value as Board)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          <option value="CBSE">CBSE</option>
                          <option value="CBSE">CBSE</option>
                          <option value="CAMBRIDGE">Cambridge</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Create Account Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Minimum 6 characters"
                        value={studentPassword}
                        onChange={e => setStudentPassword(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    Logged in as: <strong>{currentLearner.fullName} ({currentLearner.email})</strong>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 mb-1">UPI PG Receipt Reference (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Transaction Ref from UPI PG receipt (optional)"
                    value={receiptRef}
                    onChange={e => setReceiptRef(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 font-mono text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isActivatingPlan}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isActivatingPlan ? 'Activating Pass...' : 'CREATE ACCOUNT & ACTIVATE PASS NOW'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
