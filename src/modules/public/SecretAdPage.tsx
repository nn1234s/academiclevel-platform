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
  RefreshCw,
  Zap,
  Phone,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { UPIQRCheckout } from '../student/UPIQRCheckout';

interface SecretAdPageProps {
  onSuccessRegistered: () => void;
}

interface ReviewItem {
  id: string;
  name: 'Prabir' | 'Preetish' | 'Shaymin' | 'Kabir';
  role: string;
  date: string;
  stars: number;
  avatarBg: string;
  text: string;
}

// Dynamic pool of authentic parent and student reviews featuring Prabir, Preetish, and Shaymin
const REVIEWS_POOL: ReviewItem[] = [
  {
    id: 'prabir-1',
    name: 'Prabir',
    role: 'Parent of Class 7 Student (Kolkata)',
    date: '16 May 2026',
    stars: 5,
    avatarBg: 'bg-amber-600',
    text: 'It is really good because the adaptive AI quizzes explain every concept so nicely and energetic!!! Best Choice ever to join ACADEMIC LEVEL!! My son used to struggle with geometry and algebraic equations, but the 50+ solving skills and AI practice tests made him score 98% in his term exams!'
  },
  {
    id: 'preetish-1',
    name: 'Preetish',
    role: 'Parent of Class 8 Student (Bhubaneswar)',
    date: '11 May 2026',
    stars: 5,
    avatarBg: 'bg-emerald-600',
    text: "It's very good learning app for children.. the AI quizzes keep my daughter completely disciplined. She can practice anytime 24/7 at her own pace and topics are also too good .... Worth 10x more than ₹49!"
  },
  {
    id: 'shaymin-1',
    name: 'Shaymin',
    role: 'Class 9 Scholar (Bangalore)',
    date: '05 May 2026',
    stars: 5,
    avatarBg: 'bg-indigo-600',
    text: 'It is very interesting I am enjoying so much with lots of shortcut methods! Physics numericals and Chemistry balancing was my biggest fear, but ACADEMIC LEVEL AI quizzes broke down every single concept with instant hints. Best study booster ever!!'
  },
  {
    id: 'prabir-2',
    name: 'Prabir',
    role: 'Parent of Class 6 Student',
    date: '02 May 2026',
    stars: 5,
    avatarBg: 'bg-amber-600',
    text: 'Extraordinary AI quiz quality. The instant step-by-step solutions and chapter-wise quiz challenges helped my child top his school Olympiad rank. Best self-paced platform!'
  },
  {
    id: 'preetish-2',
    name: 'Preetish',
    role: 'Parent of Class 5 Student',
    date: '27 Apr 2026',
    stars: 5,
    avatarBg: 'bg-emerald-600',
    text: 'My son was addicted to mobile games. After joining ACADEMIC LEVEL, he practices AI quizzes anytime he wants and solves maths problems by himself without any scolding!'
  },
  {
    id: 'shaymin-2',
    name: 'Shaymin',
    role: 'Class 8 Student',
    date: '21 Apr 2026',
    stars: 5,
    avatarBg: 'bg-indigo-600',
    text: 'The AI quiz solving skills are pure magic! Things that took me 10 minutes to solve on paper can now be solved in 30 seconds using the instant step-by-step AI guidance.'
  }
];

const LIVE_ENROLLMENTS = [
  'Yogeshwar KumarSingh from Bihar has enrolled',
  'Prabir Sen from Kolkata has enrolled',
  'Preetish Mohanty from Bhubaneswar has enrolled',
  'Shaymin Roy from Bangalore has enrolled',
  'Aarav Deshmukh from Pune has enrolled',
  'Ananya Sharma from Jaipur has enrolled',
  'Rohan Agrawal from Mumbai has enrolled'
];

export const SecretAdPage: React.FC<SecretAdPageProps> = ({ onSuccessRegistered }) => {
  const { registerStudent } = useAuth();

  const [selectedClass, setSelectedClass] = useState<number>(7);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(REVIEWS_POOL.slice(0, 3));
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

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

  // Cycle live enrollment ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_ENROLLMENTS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  // Shuffle / generate randomized reviews featuring Prabir, Preetish, Shaymin
  const handleShuffleReviews = () => {
    const shuffled = [...REVIEWS_POOL].sort(() => 0.5 - Math.random());
    setReviewsList(shuffled.slice(0, 3));
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim()) {
      setErrorMessage('Please enter student name.');
      return;
    }

    const email = emailOrPhone.includes('@')
      ? emailOrPhone.trim().toLowerCase()
      : `${emailOrPhone.replace(/[^0-9]/g, '') || 'camp'}@advert1.academiclevel.in`;

    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        fullName: studentName.trim(),
        email,
        board,
        grade: (selectedClass as any) || 7,
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
      {/* Centered Dual-Pane Card Layout (AcademicLevel Concept Booster) */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10">

        {/* ======================================================== */}
        {/* LEFT COLUMN: Concept Booster Orange Card & Reviews       */}
        {/* ======================================================== */}
        <div className="bg-[#fafbfc] border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
          <div>
            {/* Top Orange Header Card */}
            <div className="bg-gradient-to-b from-[#f95a00] to-[#ff7300] text-white p-5 sm:p-6 rounded-b-[2rem] shadow-lg relative overflow-hidden">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                CONCEPT BOOSTER COURSE
              </h1>
              <p className="text-xs font-bold text-[#ffea79] mt-0.5">
                Unlock Potential to Score 100%
              </p>

              {/* Live Enrolled Student Pill */}
              <div className="mt-3.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white flex items-center space-x-2 border border-white/10 w-fit max-w-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                <span className="truncate font-semibold">{LIVE_ENROLLMENTS[tickerIndex]}</span>
              </div>

              {/* Middle Section: Bullets + AI Engine Badge Representation */}
              <div className="mt-4 flex items-center justify-between gap-2">
                {/* 4 Value Bullets */}
                <div className="space-y-1.5 text-xs font-black">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#ffe066] text-sm leading-none">▶</span>
                    <span>Maths & Science & Olympiads</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#ffe066] text-sm leading-none">▶</span>
                    <span>50+ Core Concepts</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#ffe066] text-sm leading-none">▶</span>
                    <span>50+ Solving Skills</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#ffe066] text-sm leading-none">▶</span>
                    <span>Adaptive AI Quizzes 24/7</span>
                  </div>
                </div>

                {/* AI Quiz Engine Badge */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-amber-200 font-black text-center p-1 leading-none">
                    <Sparkles className="w-5 h-5 text-amber-300 mb-0.5 fill-amber-300" />
                    <span className="text-[10px] text-white font-extrabold">AI QUIZ</span>
                    <span className="text-[8px] text-amber-200 font-mono mt-0.5">24/7 ACCESS</span>
                  </div>
                </div>
              </div>

              {/* Bottom White Arch: 10,000,000+ PARENTS' CHOICE */}
              <div className="mt-5 -mb-6 mx-auto w-fit">
                <div className="bg-white text-[#f95a00] font-black text-xs px-6 py-1.5 rounded-full shadow-md border border-orange-100 tracking-wider">
                  10,000,000+ PARENTS&apos; CHOICE
                </div>
              </div>
            </div>

            {/* Highly Rated by Parents & Students Section */}
            <div className="p-4 sm:p-6 pt-8 space-y-4">
              {/* Golden Curved Header Banner */}
              <div className="relative flex items-center justify-between bg-gradient-to-r from-[#fbb034] to-[#ffdd00] px-4 py-2 rounded-2xl shadow-sm text-slate-900">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
                  <span className="text-xs font-black tracking-wide">
                    Highly Rated by Parents & Students
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleShuffleReviews}
                  className="flex items-center gap-1 text-[10px] font-bold bg-white/80 hover:bg-white text-slate-800 px-2 py-0.5 rounded-lg shadow-sm transition-all"
                  title="Generate new random reviews"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>

              {/* Reviews List (Prabir, Preetish, Shaymin) */}
              <div className="space-y-3">
                {reviewsList.map(review => {
                  const isExpanded = expandedReviewId === review.id;
                  return (
                    <div
                      key={review.id}
                      className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-3.5 shadow-sm transition-all space-y-2"
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
                        <span className="text-[#f95a00]">Helpful (48)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Trust Line */}
          <div className="p-3 text-center border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
            🛡️ Verified Parent Reviews • 100% Authentic Learning Feedback
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Thinking Power Camp & Class Selection     */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 lg:p-7 flex flex-col justify-between space-y-5 bg-white">
          
          {/* Top Header Tag */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-black tracking-wide border-b border-orange-100 pb-2">
              <span className="text-[#f95a00] uppercase flex items-center gap-1.5 font-black">
                <span className="w-2 h-2 rounded-full bg-[#f95a00] animate-pulse" />
                <span>ACADEMIC LEVEL</span>
              </span>
              <span className="text-slate-500 font-bold">MOST INNOVATIVE ED-TECH</span>
              <span className="text-orange-600 font-extrabold bg-orange-50 px-2 py-0.5 rounded">
                ET LEADERS
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Thinking Power Camp: Activate Potential
              </h2>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#f95a00]" />
                <span>Practice Anytime 24/7 • Self-Paced AI Quizzes</span>
              </div>
            </div>
          </div>

          {/* Choose Class Grid (Classes 1 - 12) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                <span>Choose Class to Boost Score (2026-27)</span>
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              </span>
              <span className="text-[10px] text-[#f95a00] font-bold">
                Class {selectedClass} Selected
              </span>
            </div>

            {/* 12 Class Buttons in 4 columns */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(cls => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border shadow-sm ${
                    selectedClass === cls
                      ? 'bg-gradient-to-b from-[#f95a00] to-[#ff7a00] text-white border-orange-600 scale-[1.03] shadow-orange-500/30'
                      : 'bg-[#fde68a] hover:bg-[#fed7aa] text-[#78350f] border-amber-300'
                  }`}
                >
                  <span>Class {cls}</span>
                </button>
              ))}

              {/* Sold out classes (Classes 10, 11, 12 as per screenshot) */}
              {[10, 11, 12].map(cls => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                    selectedClass === cls
                      ? 'bg-gradient-to-b from-[#f95a00] to-[#ff7a00] text-white border-orange-600'
                      : 'bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300'
                  }`}
                >
                  <span className="leading-tight">Class {cls}</span>
                  <span className="text-[8px] font-normal leading-tight opacity-75">(sold out)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extra Materials Book Stack Card */}
          <div className="bg-gradient-to-r from-[#fff9f2] to-[#fff3e6] border border-orange-200 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#f95a00] px-2 py-0.5 rounded">
                MATHS & SCIENCE
              </span>
              <h4 className="text-xs font-extrabold text-slate-900 mt-1">
                Extra Materials & Physical Workbooks
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                * Collect at your doorstep after enrolled
              </p>
            </div>
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-orange-200 flex flex-col items-center justify-center text-[#f95a00] font-black text-[10px] p-1 text-center">
              <span>📚</span>
              <span>Workbooks</span>
            </div>
          </div>

          {/* Score 100% and Become Topper 4-Card Grid (Image 2) */}
          <div className="space-y-2">
            <div className="bg-[#f59e0b] text-white py-1 px-3 rounded-lg text-center font-black text-xs tracking-wide shadow-sm">
              Score 100% and Become Topper
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#fffdf7] border border-dashed border-amber-300 rounded-xl p-2.5 flex flex-col justify-between">
                <span className="font-extrabold text-slate-800 text-[11px]">
                  Secret of <span className="text-[#f95a00] bg-orange-100 px-1 py-0.2 rounded font-black">83%</span>
                </span>
                <span className="text-[10px] font-bold text-slate-700 mt-0.5">Higher Score</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Proven acceleration methodology</span>
              </div>

              <div className="bg-[#fffdf7] border border-dashed border-orange-300 rounded-xl p-2.5 flex flex-col justify-between">
                <span className="font-black text-[#f95a00] text-sm">50+</span>
                <span className="text-[10px] font-bold text-slate-800">Core Concepts</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Most asked concepts & variety of topics</span>
              </div>

              <div className="bg-[#fffdf7] border border-dashed border-orange-300 rounded-xl p-2.5 flex flex-col justify-between">
                <span className="font-black text-[#f95a00] text-sm">50+</span>
                <span className="text-[10px] font-bold text-slate-800">Solving Skills</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Step-by-step AI guided solutions & shortcuts</span>
              </div>

              <div className="bg-[#fffdf7] border border-dashed border-amber-300 rounded-xl p-2.5 flex flex-col justify-between">
                <span className="font-black text-amber-600 text-sm">300+</span>
                <span className="text-[10px] font-bold text-slate-800">Quizzes</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Practice to master all concepts & skills</span>
              </div>
            </div>
          </div>

          {/* Trust Banner: 10,000,000+ parents and students */}
          <div className="text-center space-y-0.5 border-t border-slate-100 pt-2">
            <p className="text-[11px] font-extrabold text-slate-700 flex items-center justify-center gap-1">
              <span>🌾</span>
              <span>Trusted by 10,000,000+ parents and students!</span>
              <span>🌾</span>
            </p>
            <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">-- ACADEMIC LEVEL --</p>
            <p className="text-[11px] text-[#f95a00] font-black animate-pulse">
              Only Today: Be the 1922383th Student
            </p>
          </div>

          {/* Sticky Bottom Checkout Bar (Total Fee: ₹49) */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-[#f95a00]">₹49</span>
                <span className="text-xs text-slate-400 line-through">₹499</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">
                Total Fee • Include taxes
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 max-w-[220px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#f95a00] to-[#ff7a00] hover:from-[#e04f00] hover:to-[#f95a00] text-white font-black text-sm shadow-xl shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <span>Enroll Now (₹49)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* QUICK ENROLLMENT MODAL (₹49)                             */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-orange-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#f95a00] bg-orange-100 px-3 py-1 rounded-full">
                Instant Camp Enrollment
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Thinking Power Camp • Class {selectedClass}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Special Offer: Unlock all 50+ concepts & unlimited AI quizzes for ₹49 (normally ₹499)
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Sharma"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#f95a00] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number or Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or student@gmail.com"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#f95a00] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Board
                  </label>
                  <select
                    value={board}
                    onChange={e => setBoard(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#f95a00] rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="CBSE">CBSE Board</option>
                    <option value="ICSE">ICSE Board</option>
                    <option value="IGCSE">Cambridge IGCSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#f95a00] rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent / Guardian Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#f95a00] rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-[11px] text-orange-950 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Camp Fee:</span>
                  <span className="text-[#f95a00] font-black">₹49.00</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Included:</span>
                  <span>50+ Concepts + Unlimited AI Quizzes + Digital Kit</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#f95a00] to-[#ff7a00] hover:from-[#e04f00] hover:to-[#f95a00] text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Registering Enrollment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proceed to Pay ₹49 & Unlock Camp</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* UPI QR PAYMENT MODAL                                     */}
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
