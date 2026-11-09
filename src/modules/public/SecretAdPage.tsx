import React, { useState, useEffect } from 'react';
import {
  Star,
  Check,
  Sparkles,
  Flame,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  TrendingUp,
  GraduationCap,
  Users
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { UPIQRCheckout } from '../student/UPIQRCheckout';

interface SecretAdPageProps {
  onSuccessRegistered: () => void;
}

interface ReviewItem {
  id: string;
  name: string;
  role: string;
  date: string;
  stars: number;
  avatarColor: string;
  text: string;
}

const STATIC_REVIEWS: ReviewItem[] = [
  {
    id: 'prabir',
    name: 'Prabir',
    role: 'Parent of Class 7 Student',
    date: '16 May 2026',
    stars: 5,
    avatarColor: 'bg-amber-600',
    text: 'It is really good because you have the best teachers and they explain really nicely and energetic!!! Best choice ever to join Oda Class style concept booster. My son scored 96% in his term exams!'
  },
  {
    id: 'preetish',
    name: 'Preetish',
    role: 'Parent of Class 8 Student',
    date: '11 May 2026',
    stars: 5,
    avatarColor: 'bg-emerald-600',
    text: "It's very good learning app for children.. the teachers inspired our children and topics are also too good .... I think it is best learning app ❤️👏 Highly recommend to all parents."
  },
  {
    id: 'shaymin',
    name: 'Shaymin',
    role: 'Class 9 Student',
    date: '05 May 2026',
    stars: 5,
    avatarColor: 'bg-indigo-600',
    text: 'It is very interesting I am enjoying so much with lots of shortcut solving skills! Science concepts are so clearly taught with interactive 3D examples. Solved my math fear completely!'
  },
  {
    id: 'kabir',
    name: 'Kabir',
    role: 'Class 6 Scholar',
    date: '28 Apr 2026',
    stars: 5,
    avatarColor: 'bg-rose-600',
    text: 'Best concept booster course! 50+ solving skills and IIT/NIT teachers give personal attention. Daily quizzes made studying super fun!'
  }
];

const ENROLLMENT_NAMES = [
  'Yogeshwar KumarSingh from Bihar',
  'Prabir Sen from Kolkata',
  'Preetish Mohanty from Bhubaneswar',
  'Shaymin Roy from Bangalore',
  'Aarav Deshmukh from Pune',
  'Ananya Iyer from Chennai',
  'Rohan Agrawal from Jaipur'
];

export const SecretAdPage: React.FC<SecretAdPageProps> = ({ onSuccessRegistered }) => {
  const { registerStudent } = useAuth();

  const [selectedClass, setSelectedClass] = useState<number>(7);
  const [enrollmentTickerIndex, setEnrollmentTickerIndex] = useState(0);

  // Modal checkout / registration state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [board, setBoard] = useState<'CBSE' | 'ICSE' | 'IGCSE'>('CBSE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Post enrollment UPI QR modal state
  const [showUpiCheckout, setShowUpiCheckout] = useState(false);
  const [createdLearnerId, setCreatedLearnerId] = useState<string | null>(null);

  // Cycle live enrollment toasts
  useEffect(() => {
    const interval = setInterval(() => {
      setEnrollmentTickerIndex(prev => (prev + 1) % ENROLLMENT_NAMES.length);
    }, 3800);
    return () => clearInterval(interval);
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
      : `${emailOrPhone.replace(/[^0-9]/g, '') || 'student'}@adcampaign.academiclevel.in`;

    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        fullName: studentName,
        email,
        board,
        grade: (selectedClass as any) || 7,
        parentName: parentName || 'Guardian'
      });

      setIsSubmitting(false);
      if (res.success) {
        const session = StorageRLSLayer.getCurrentSession();
        if (session) {
          setCreatedLearnerId(session.learnerId);
          setIsEnrollModalOpen(false);
          setShowUpiCheckout(true);
        } else {
          onSuccessRegistered();
        }
      } else {
        setErrorMessage(res.error || 'Enrollment registration failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error processing enrollment.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Banner (Oda Class Style) */}
      <div className="bg-[#ff6a00] text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center space-x-2">
        <span>oda class style</span>
        <span>•</span>
        <span>MOST INNOVATIVE ED-TECH</span>
        <span>•</span>
        <span>ET LEADERS OF TOMORROW</span>
      </div>

      {/* Main Responsive Split Layout */}
      <div className="max-w-5xl mx-auto p-3 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Concept Booster Hero & Reviews              */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#fff9f2] via-white to-[#fff5ea] p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-orange-100 flex flex-col justify-between space-y-6">
            
            {/* Top Concept Booster Orange Card */}
            <div className="bg-gradient-to-br from-[#ff6a00] via-[#ff7e14] to-[#f95300] rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
              {/* Subtle background circles */}
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                  Thinking Power Camp
                </span>
                <span className="text-[10px] font-black bg-amber-300 text-orange-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Flame className="w-3 h-3 fill-orange-600 text-orange-600" />
                  <span>2026-27 Special</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight mt-1">
                CONCEPT BOOSTER COURSE
              </h1>
              <p className="text-xs text-orange-100 font-semibold mt-0.5">
                Unlock Potential to Score 100%
              </p>

              {/* Dynamic Live Enrollment Ticker */}
              <div className="mt-3 bg-black/25 backdrop-blur-md rounded-full px-3 py-1 text-[11px] text-white flex items-center space-x-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="truncate">
                  <strong>{ENROLLMENT_NAMES[enrollmentTickerIndex]}</strong> has enrolled
                </span>
              </div>

              {/* 4 Core Value Bullets */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-bold">
                <div className="flex items-center space-x-1.5 bg-white/10 rounded-lg p-1.5">
                  <span className="text-amber-300">🔺</span>
                  <span>Maths & Science</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 rounded-lg p-1.5">
                  <span className="text-amber-300">🔺</span>
                  <span>50+ Core Concepts</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 rounded-lg p-1.5">
                  <span className="text-amber-300">🔺</span>
                  <span>50+ Solving Skills</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-white/10 rounded-lg p-1.5">
                  <span className="text-amber-300">🔺</span>
                  <span>Top IIT/NIT Teachers</span>
                </div>
              </div>

              {/* Teachers Banner Illustration */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-full bg-white text-orange-600 flex items-center justify-center font-black text-sm shadow">
                    IIT
                  </div>
                  <div>
                    <span className="text-[10px] text-orange-100 block leading-tight">Master Faculty</span>
                    <span className="text-xs font-black text-white">Mentors from IIT/NIT</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white text-orange-600 px-2 py-1 rounded-md shadow-sm">
                  10M+ Enrolled
                </span>
              </div>
            </div>

            {/* Middle Badge: 10,000,000+ PARENTS' CHOICE */}
            <div className="text-center">
              <span className="inline-block text-xs font-black tracking-widest text-[#ff6a00] uppercase bg-orange-100 border border-orange-200 px-4 py-1.5 rounded-full shadow-sm">
                10,000,000+ PARENTS' CHOICE
              </span>
            </div>

            {/* Highly Rated by Parents & Students Section */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white text-center py-2 px-3 rounded-xl font-black text-xs shadow-sm flex items-center justify-center space-x-1.5">
                <Star className="w-4 h-4 fill-white text-white" />
                <span>Highly Rated by Parents & Students</span>
                <Star className="w-4 h-4 fill-white text-white" />
              </div>

              {/* Reviews List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {STATIC_REVIEWS.map(r => (
                  <div
                    key={r.id}
                    className="bg-white border border-orange-100 rounded-2xl p-3.5 shadow-sm space-y-1.5 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-full text-white ${r.avatarColor} flex items-center justify-center text-xs font-bold shadow-sm`}
                        >
                          {r.name[0]}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-800 block leading-none">
                            {r.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{r.role} • {r.date}</span>
                        </div>
                      </div>

                      {/* 5 Stars */}
                      <div className="flex space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      &quot;{r.text}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Thinking Power Camp & Class Selection     */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#ff6a00] uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                  Interactive Live Camp
                </span>
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span>Course Schedule: 16 Nov – 21 Nov</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 leading-tight">
                Thinking Power Camp: Activate Potential
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fast-track syllabus mastery, Olympiad problem-solving tricks, and step-by-step logic.
              </p>
            </div>

            {/* Choose Class Grid (Classes 1 - 12) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <span>Choose Class to Boost Score (2026-27)</span>
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                </span>
                <span className="text-[10px] text-orange-600 font-bold">
                  Class {selectedClass} Selected
                </span>
              </div>

              {/* Class Buttons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border shadow-sm ${
                      selectedClass === cls
                        ? 'bg-gradient-to-b from-[#ff7e14] to-[#f95300] text-white border-orange-600 scale-[1.02] shadow-orange-500/30'
                        : 'bg-[#fff5ea] hover:bg-[#ffeacf] text-[#b34900] border-orange-200'
                    }`}
                  >
                    <span>Class {cls}</span>
                    <span className="text-[9px] opacity-80 font-normal">Available</span>
                  </button>
                ))}

                {/* Sold out classes (Classes 10, 11, 12 as per screenshot) */}
                {[10, 11, 12].map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                      selectedClass === cls
                        ? 'bg-gradient-to-b from-[#ff7e14] to-[#f95300] text-white border-orange-600'
                        : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span>Class {cls}</span>
                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">
                      Few Seats
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Score 100% and Become Topper 4-Card Grid (Image 2) */}
            <div className="space-y-3">
              <div className="bg-[#ff9500] text-white py-1.5 px-4 rounded-xl text-center font-black text-xs uppercase tracking-wider shadow-sm">
                Score 100% and Become Topper
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      Secret of <span className="text-orange-600">83%</span>
                    </span>
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-1">Higher Score</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Proven acceleration methodology</span>
                </div>

                <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-600">50+</span>
                    <BookOpen className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1">Core Concepts</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Most asked topics across all boards</span>
                </div>

                <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-600">50+</span>
                    <Award className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1">Solving Skills</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Summarized by top IIT/NIT teachers</span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-600">300+</span>
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1">Quizzes & Tests</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Practice to master all concepts & skills</span>
                </div>
              </div>
            </div>

            {/* Extra Materials Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                  MATHS & SCIENCE
                </span>
                <h4 className="text-xs font-extrabold text-slate-800">
                  Extra Digital Workbooks & Study Notes
                </h4>
                <p className="text-[10px] text-slate-500">
                  * Instant access unlocked after enrollment
                </p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
                📚 Kit
              </div>
            </div>

            {/* Trust Footer Bar */}
            <div className="text-center space-y-1">
              <p className="text-[11px] font-extrabold text-slate-700 flex items-center justify-center gap-1.5">
                <span>🏆</span>
                <span>Trusted by 10,000,000+ parents and students!</span>
              </p>
              <p className="text-[10px] text-orange-600 font-bold">
                Only Today: Be the 1922383th Student
              </p>
            </div>

            {/* Sticky/Fixed Bottom Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-[#f95300]">₹29</span>
                  <span className="text-xs text-slate-400 line-through">₹499</span>
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Total Fee • Includes all taxes
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(true)}
                className="flex-1 max-w-[240px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ff6a00] to-[#f95300] hover:from-[#f95300] hover:to-[#e04b00] text-white font-black text-sm shadow-xl shadow-orange-500/30 transition-all transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Enroll Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK ENROLLMENT MODAL                                   */}
      {/* ======================================================== */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-orange-100 relative">
            <button
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                Instant Camp Enrollment
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Thinking Power Camp • Class {selectedClass}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Special Offer: Unlock all 50+ concepts for ₹29 (normally ₹499)
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-[11px] text-orange-950 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Camp Fee:</span>
                  <span className="text-[#ff6a00]">₹29.00</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Included:</span>
                  <span>50+ Concepts + Digital Kit + Certificates</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#ff6a00] to-[#f95300] hover:from-[#f95300] hover:to-[#e04b00] text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Registering Enrollment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proceed to Pay ₹29 & Unlock Camp</span>
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
