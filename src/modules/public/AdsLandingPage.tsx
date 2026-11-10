import React, { useState, useEffect } from 'react';
import {
  Star,
  Check,
  Flame,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  X,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Phone,
  User,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { UPIQRCheckout } from '../student/UPIQRCheckout';

interface AdsLandingPageProps {
  onSuccessRegistered: () => void;
}

interface TopperReview {
  id: string;
  name: string;
  role: string;
  date: string;
  stars: number;
  avatarBg: string;
  text: string;
}

const BOARD_REVIEWS_POOL: TopperReview[] = [
  {
    id: 'aarav-1',
    name: 'Aarav M.',
    role: 'Class 10 CBSE Scholar (Pre-Board 97%)',
    date: '09 Nov 2026',
    stars: 5,
    avatarBg: 'bg-indigo-600',
    text: 'The EXAM_READY node questions match the exact tricky twists CBSE gives in Science and Math. Nova AI step-marking breakdowns helped me eliminate silly derivation errors and score 97% in my pre-boards!'
  },
  {
    id: 'sneha-1',
    name: 'Sneha P.',
    role: 'Class 9 ICSE Student (Cuttack)',
    date: '06 Nov 2026',
    stars: 5,
    avatarBg: 'bg-emerald-600',
    text: 'Physics numericals and Chemistry equation balancing used to take forever. The chapter-wise AI quizzes with instant hints made concept revision 3x faster without expensive coaching classes.'
  },
  {
    id: 'tanmay-1',
    name: 'Tanmay S.',
    role: 'Class 10 ICSE Board Aspirant (Mumbai)',
    date: '03 Nov 2026',
    stars: 5,
    avatarBg: 'bg-amber-600',
    text: 'Pure gold for board prep. ₹49 for 60 days of self-paced, anti-cheat AI practice is unbelievable value. The Olympiad tier questions also gave me the edge I needed for competitive exams.'
  },
  {
    id: 'aarav-2',
    name: 'Aarav M.',
    role: 'Class 10 CBSE Scholar',
    date: '07 Nov 2026',
    stars: 5,
    avatarBg: 'bg-indigo-600',
    text: 'Maths coordinate geometry and trigonometry used to cost me marks. ACADEMIC LEVEL broke down every question into 4 difficulty tiers so I could practice only where I was weak.'
  },
  {
    id: 'sneha-2',
    name: 'Sneha P.',
    role: 'Class 9 ICSE Student',
    date: '04 Nov 2026',
    stars: 5,
    avatarBg: 'bg-emerald-600',
    text: 'Best self-study app for Class 9 and 10. The AI hints feel like having a personal tutor beside you 24/7. Definitely worth joining!'
  },
  {
    id: 'tanmay-2',
    name: 'Tanmay S.',
    role: 'Class 10 ICSE Aspirant',
    date: '01 Nov 2026',
    stars: 5,
    avatarBg: 'bg-amber-600',
    text: 'The timed quizzes trained my exam speed. I finished my science pre-board paper 20 minutes before time with zero panic.'
  }
];

const LIVE_BOARD_TICKER = [
  'One Class 10 scholar enrolled from Odisha',
  'One Class 9 scholar enrolled from Maharashtra',
  'One Class 10 scholar enrolled from Delhi NCR',
  'One Class 8 scholar enrolled from Karnataka',
  'One Class 10 scholar enrolled from West Bengal',
  'One Class 9 scholar enrolled from Uttar Pradesh',
  'One Class 10 scholar enrolled from Gujarat'
];

export const AdsLandingPage: React.FC<AdsLandingPageProps> = ({ onSuccessRegistered }) => {
  const { registerStudent } = useAuth();

  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [reviewsList] = useState<TopperReview[]>(BOARD_REVIEWS_POOL.slice(0, 3));

  // Quick enroll modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [board, setBoard] = useState<'CBSE' | 'ICSE' | 'IGCSE'>('CBSE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Payment checkout modal state
  const [showUpiCheckout, setShowUpiCheckout] = useState(false);
  const [createdLearnerId, setCreatedLearnerId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_BOARD_TICKER.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim()) {
      setErrorMessage('Please enter student name.');
      return;
    }

    const email = emailOrPhone.includes('@')
      ? emailOrPhone.trim().toLowerCase()
      : `${emailOrPhone.replace(/[^0-9]/g, '') || 'board'}@ads.academiclevel.in`;

    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        fullName: studentName.trim(),
        email,
        board,
        grade: (selectedClass as any) || 10,
        parentName: parentName.trim() || 'Parent'
      });

      setIsSubmitting(false);
      if (res.success) {
        const session = StorageRLSLayer.getCurrentSession();
        if (session) {
          setCreatedLearnerId(session.learnerId);
          setIsModalOpen(false);
          setShowUpiCheckout(true);
        } else {
          onSuccessRegistered();
        }
      } else {
        setErrorMessage(res.error || 'Enrollment registration failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error occurred while registering.');
    }
  };

  return (
    <div
      className="min-h-screen text-slate-800 font-sans py-4 sm:py-8 px-2 sm:px-4 flex items-center justify-center relative"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px), radial-gradient(#e5e7eb 1px, #ffffff 1px)`,
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px'
      }}
    >
      {/* Centered Dual-Pane Card Layout (AcademicLevel Board Topper Accelerator) */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10">

        {/* ======================================================== */}
        {/* LEFT COLUMN: Board Exam Header Card & Scholar Reviews   */}
        {/* ======================================================== */}
        <div className="bg-[#fafbfc] border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
          <div>
            {/* Top Navy/Indigo Gradient Header Card */}
            <div className="bg-gradient-to-b from-[#1e1b4b] to-[#312e81] text-white p-5 sm:p-6 rounded-b-[2rem] shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                  Classes 8, 9 & 10 Board Accelerator
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-900">
                  TOPPER TRACK
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                BOARD EXAM & TOPPER SPRINT
              </h1>
              <p className="text-xs font-bold text-amber-300 mt-0.5">
                Target 95%+ in CBSE & ICSE Board Exams
              </p>

              {/* Live Enrolled Student Pill */}
              <div className="mt-3.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white flex items-center space-x-2 border border-white/10 w-fit max-w-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                <span className="truncate font-semibold">{LIVE_BOARD_TICKER[tickerIndex]}</span>
              </div>

              {/* Middle Section: Bullets + Board Exam Badge */}
              <div className="mt-4 flex items-center justify-between gap-2">
                {/* 4 Value Bullets */}
                <div className="space-y-1.5 text-xs font-bold text-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400 text-sm leading-none">▶</span>
                    <span>10-Year Board Paper Patterns</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400 text-sm leading-none">▶</span>
                    <span>50+ Core Derivations & Proofs</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400 text-sm leading-none">▶</span>
                    <span>Nova AI Step-Marking Tips</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-amber-400 text-sm leading-none">▶</span>
                    <span>Anti-Cheat Timed AI Quizzes</span>
                  </div>
                </div>

                {/* AI Quiz Engine Badge */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-amber-200 font-black text-center p-1 leading-none">
                    <Sparkles className="w-5 h-5 text-amber-300 mb-0.5 fill-amber-300" />
                    <span className="text-[10px] text-white font-extrabold">BOARD AI</span>
                    <span className="text-[8px] text-amber-200 font-mono mt-0.5">24/7 SPRINT</span>
                  </div>
                </div>
              </div>

              {/* Bottom White Arch: 4.8 Positive Review */}
              <div className="mt-5 -mb-6 mx-auto w-fit">
                <div className="bg-white text-indigo-950 font-black text-xs px-5 py-1.5 rounded-full shadow-md border border-indigo-100 tracking-wider flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold">★</span>
                  <span>4.8 Positive Review</span>
                </div>
              </div>
            </div>

            {/* Highly Rated by Board Scholars & Parents Section */}
            <div className="p-4 sm:p-6 pt-8 space-y-4">
              {/* Golden Curved Header Banner */}
              <div className="flex items-center justify-between bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2 rounded-2xl shadow-sm text-slate-900">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                  <span className="text-xs font-black tracking-wide">
                    Highly Rated by Board Scholars
                  </span>
                </div>
                <span className="text-[10px] font-black bg-white/90 text-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">
                  4.8 ★ Verified
                </span>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviewsList.map(review => (
                  <div
                    key={review.id}
                    className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-3.5 shadow-sm transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-8 h-8 rounded-full ${review.avatarBg} text-white font-black text-xs flex items-center justify-center shadow-sm`}
                        >
                          {review.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-black text-slate-900">{review.name}</span>
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                              Verified
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block leading-tight">{review.date}</span>
                        </div>
                      </div>

                      {/* 5 Bright Gold Stars */}
                      <div className="flex space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-[#ffb800] text-[#ffb800]"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      &quot;{review.text}&quot;
                    </p>

                    <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-1.5 flex justify-between items-center">
                      <span>{review.role}</span>
                      <span className="text-indigo-600">Helpful (54)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Trust Line */}
          <div className="p-3 text-center border-t border-slate-100 text-[10px] text-slate-500 font-semibold flex flex-wrap items-center justify-center gap-2">
            <span>🛡️ Verified Scholar Reviews</span>
            <span>•</span>
            <a
              href="https://edtechcenturyblog.blogspot.com/2026/11/academiclevel-most-innovative-edtech.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1 font-bold"
            >
              <span>Featured on EdTech Century: Most Innovative EdTech</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Board Rank Accelerator & Class Selection   */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 lg:p-7 flex flex-col justify-between space-y-5 bg-white">
          
          {/* Top Header Tag */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-black tracking-wide border-b border-indigo-100 pb-2">
              <span className="text-indigo-700 uppercase flex items-center gap-1.5 font-black">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>ACADEMIC LEVEL</span>
              </span>
              <span className="text-slate-500 font-bold hidden sm:inline">MOST INNOVATIVE ED-TECH</span>
              <a
                href="https://edtechcenturyblog.blogspot.com/2026/11/academiclevel-most-innovative-edtech.html"
                target="_blank"
                rel="noopener noreferrer"
                title="Voted Most Innovative EdTech by EdTech Century"
                className="text-indigo-700 hover:text-indigo-800 font-extrabold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded transition-all flex items-center gap-1 text-[10px]"
              >
                <span>EDTECH CENTURY</span>
                <ExternalLink className="w-3 h-3 text-indigo-600" />
              </a>
            </div>

            <div className="mt-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Board Rank Accelerator: Eliminate Exam Fear
              </h2>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Practice Anytime 24/7 • Self-Paced Board AI Quizzes</span>
              </div>
            </div>
          </div>

          {/* Choose Class Grid (Focused on Classes 8, 9, 10) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                <span>Select Target Board Class (2026-27)</span>
                <Flame className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              </span>
              <span className="text-[10px] text-indigo-600 font-bold">
                Class {selectedClass} Selected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[8, 9, 10].map(cls => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`py-3 px-2 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center border shadow-sm ${
                    selectedClass === cls
                      ? 'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white border-indigo-900 scale-[1.03] shadow-indigo-500/30'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-200'
                  }`}
                >
                  <span className="text-sm font-extrabold">Class {cls}</span>
                  <span className={`text-[9px] mt-0.5 font-semibold ${selectedClass === cls ? 'text-indigo-200' : 'text-indigo-600'}`}>
                    {cls === 10 ? 'Board Exam' : cls === 9 ? 'Pre-Board' : 'Middle Rank'}
                  </span>
                </button>
              ))}
            </div>

            {/* Other classes status */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[5, 6, 7, 11].map(cls => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className="py-1 px-1.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                >
                  Class {cls} (Foundation)
                </button>
              ))}
            </div>
          </div>

          {/* 100% Digital Study Kit Card */}
          <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 px-2 py-0.5 rounded">
                100% DIGITAL BOARD REVISION KIT
              </span>
              <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                Digital Board Formula Workbooks & Mindmaps
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                * Instant PDF access unlocked right inside your student dashboard
              </p>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-indigo-200 flex flex-col items-center justify-center text-indigo-600 font-black text-[10px] p-1 text-center">
              <span>📋</span>
              <span>Board PDF</span>
            </div>
          </div>

          {/* Score 95%+ and Become Topper 4-Card Grid */}
          <div className="space-y-2">
            <div className="bg-indigo-600 text-white py-1 px-3 rounded-lg text-center font-black text-xs tracking-wide shadow-sm">
              Target 95%+ and Become Topper
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                <span className="text-indigo-600 font-bold block text-[11px]">Maths & Science</span>
                <span className="text-slate-500 text-[10px]">All core formulas</span>
              </div>
              <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/40">
                <span className="text-purple-600 font-bold block text-[11px]">Board Paper Derivations</span>
                <span className="text-slate-500 text-[10px]">Phys / Chem / Bio / Math</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-amber-500 font-black text-sm block">95%+</span>
                <span className="text-xs font-bold text-slate-900 block">Board Goal</span>
                <span className="text-[10px] text-slate-400">Step-marking precision</span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-indigo-600 font-black text-sm block">100+</span>
                <span className="text-xs font-bold text-slate-900 block">Core Concepts</span>
                <span className="text-[10px] text-slate-400">Repeated exam topics</span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-purple-600 font-black text-sm block">50+</span>
                <span className="text-xs font-bold text-slate-900 block">Exam Derivations</span>
                <span className="text-[10px] text-slate-400">Verified by Nova AI</span>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-emerald-600 font-black text-sm block">300+</span>
                <span className="text-xs font-bold text-slate-900 block">Board Quizzes</span>
                <span className="text-[10px] text-slate-400">Anti-cheat timed drills</span>
              </div>
            </div>
          </div>

          {/* Social Proof Middle: 4.8 Rating */}
          <div className="text-center pt-2">
            <div className="flex items-center justify-center space-x-1 text-[#ffb800] mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#ffb800]" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">4.8 Positive Review</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Verified by CBSE & ICSE Scholars across India
            </span>
          </div>

          {/* Price & Primary CTA */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Total Fee (Include taxes)</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-indigo-700">₹49</span>
                <span className="text-xs text-slate-400 line-through">₹499</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                  90% OFF
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 max-w-[200px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-black text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK ENROLL MODAL                                       */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase">
                Instant Enrollment • ₹49 Only
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Start Board AI Practice
              </h3>
              <p className="text-xs text-slate-500">
                Unlock 60 Days full access for <strong className="text-slate-800">Class {selectedClass}</strong>
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number or Email *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile or email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
                  <select
                    value={board}
                    onChange={e => setBoard(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="IGCSE">Cambridge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Class</label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-indigo-700 focus:outline-none focus:border-indigo-600"
                  >
                    <option value={10}>Class 10 (Board)</option>
                    <option value={9}>Class 9 (Pre-Board)</option>
                    <option value={8}>Class 8 (Middle)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent / Guardian Name (Optional)
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="Parent or Guardian"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <span>{isSubmitting ? 'Registering...' : 'Proceed to UPI Pay (₹49)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-3 text-center text-[10px] text-slate-400 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>DPDP 2023 Child Safety • 100% Digital PDF Delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIRECT UPI QR CHECKOUT MODAL                             */}
      {/* ======================================================== */}
      {showUpiCheckout && createdLearnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="my-8 w-full max-w-2xl">
            <UPIQRCheckout
              planTier="LITE"
              learnerId={createdLearnerId}
              onBack={() => setShowUpiCheckout(false)}
              onSuccess={() => {
                setShowUpiCheckout(false);
                onSuccessRegistered();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
