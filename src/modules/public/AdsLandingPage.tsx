import React, { useState, useEffect } from 'react';
import { Board, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { UPIQRCheckout } from '../student/UPIQRCheckout';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Award,
  Star,
  ExternalLink,
  BookOpen,
  Clock,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface AdsLandingPageProps {
  onSuccessRegistered: () => void;
}

interface TopperReview {
  id: string;
  name: string;
  role: string;
  date: string;
  stars: number;
  text: string;
}

const BOARD_REVIEWS: TopperReview[] = [
  {
    id: 'rev-1',
    name: 'Aarav M.',
    role: 'Class 10 CBSE Scholar (Pre-Board 97%)',
    date: '09 Nov 2026',
    stars: 5,
    text: 'The EXAM_READY node questions match the exact tricky twists CBSE gives in Science and Math. Nova AI step-marking breakdowns helped me eliminate silly derivation errors and score 97% in my pre-boards!'
  },
  {
    id: 'rev-2',
    name: 'Sneha P.',
    role: 'Class 9 ICSE Student (Cuttack)',
    date: '06 Nov 2026',
    stars: 5,
    text: 'Physics numericals and Chemistry equation balancing used to take forever. The chapter-wise AI quizzes with instant hints made concept revision 3x faster without expensive coaching classes.'
  },
  {
    id: 'rev-3',
    name: 'Tanmay S.',
    role: 'Class 10 ICSE Board Aspirant (Mumbai)',
    date: '03 Nov 2026',
    stars: 5,
    text: 'Pure gold for board prep. ₹49 for 60 days of self-paced, anti-cheat AI practice is unbelievable value. The Olympiad tier questions also gave me the edge I needed for competitive exams.'
  }
];

const LIVE_BOARD_TICKER = [
  'One Class 10 scholar enrolled from Odisha',
  'One Class 9 scholar enrolled from Maharashtra',
  'One Class 10 scholar enrolled from Delhi NCR',
  'One Class 8 scholar enrolled from Karnataka',
  'One Class 10 scholar enrolled from West Bengal',
  'One Class 9 scholar enrolled from Uttar Pradesh'
];

export const AdsLandingPage: React.FC<AdsLandingPageProps> = ({ onSuccessRegistered }) => {
  const { registerStudent } = useAuth();
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [board, setBoard] = useState<Board>('CBSE');
  const [grade, setGrade] = useState<Grade>(10);
  const [parentName, setParentName] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment checkout modal state
  const [showUpiCheckout, setShowUpiCheckout] = useState(false);
  const [createdLearnerId, setCreatedLearnerId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_BOARD_TICKER.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter student name.');
      return;
    }

    const email = emailOrPhone.includes('@')
      ? emailOrPhone.trim().toLowerCase()
      : `${emailOrPhone.replace(/[^0-9]/g, '') || 'board'}@ads.academiclevel.in`;

    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        fullName: fullName.trim(),
        email,
        board,
        grade,
        parentName: parentName.trim() || 'Parent'
      });

      setIsSubmitting(false);
      if (res.success) {
        const session = StorageRLSLayer.getCurrentSession();
        if (session) {
          setCreatedLearnerId(session.learnerId);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Board Exam Rank Accelerator Value Pillars   */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          {/* Top Pill: EdTech Century Recognition */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <a
              href="https://edtechcenturyblog.blogspot.com/2026/11/academiclevel-most-innovative-edtech.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all shadow-sm"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Voted Most Innovative EdTech by EdTech Century</span>
              <ExternalLink className="w-3 h-3 text-amber-400/80" />
            </a>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Classes 8, 9 & 10 Board Accelerator</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Target 95%+ in Board Exams with AI-Guided Solving.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Syllabus-calibrated assessments for <strong className="text-indigo-400">CBSE</strong>, <strong className="text-purple-400">ICSE/CISCE</strong>, and <strong className="text-cyan-400">Cambridge IGCSE</strong>. Master 10-year question patterns with Nova AI step-marking breakdowns.
          </p>

          {/* Live Enrolled Ticker */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <span className="font-semibold">{LIVE_BOARD_TICKER[tickerIndex]}</span>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>4-Tier Nodes: Foundation to Olympiad</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Nova AI Step-Marking & Derivations</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>100% Digital PDF Notes & Formula Sheets</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero 3rd-Party Ads & Zero Distractions</span>
            </div>
          </div>

          {/* Social Proof Reviews Preview */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white">4.8 ★ Positive Reviews</span>
              <span>•</span>
              <span>Authentic Class 8–10 Scholars</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {BOARD_REVIEWS.slice(0, 2).map(r => (
                <div key={r.id} className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{r.name}</span>
                    <span className="text-[10px] text-slate-500">{r.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">&quot;{r.text}&quot;</p>
                  <span className="text-[10px] text-indigo-400 mt-1 block font-semibold">{r.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Fast Enrollment Form                       */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[11px] font-bold mb-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Special Campaign Fee: ₹49</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Enroll in Board Accelerator</h2>
            <p className="text-xs text-slate-400 mt-1">Full 60 Days Access • Self-Paced 24/7 AI Practice</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Number or Email *</label>
              <input
                type="text"
                required
                placeholder="Mobile number or email"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Board *</label>
                <select
                  value={board}
                  onChange={e => setBoard(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE / CISCE</option>
                  <option value="IGCSE">Cambridge IGCSE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Class *</label>
                <select
                  value={grade}
                  onChange={e => setGrade(Number(e.target.value) as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-bold text-indigo-400"
                >
                  <option value={10}>Class 10 (Board Exam)</option>
                  <option value={9}>Class 9 (Pre-Board Foundation)</option>
                  <option value={8}>Class 8 (Middle School Mastery)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Parent Name (Optional)</label>
              <input
                type="text"
                placeholder="Parent or Guardian"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <span>{isSubmitting ? 'Registering...' : 'Enroll Now for ₹49 (Instant QR)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DPDP 2023 Child Safety</span>
            </span>
            <span className="text-amber-400 font-semibold">100% Digital PDF Delivery</span>
          </div>
        </div>
      </div>

      {/* Direct UPI QR Checkout Modal */}
      {showUpiCheckout && createdLearnerId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
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
