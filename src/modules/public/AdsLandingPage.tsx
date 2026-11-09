import React, { useState } from 'react';
import { Board, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import { Sparkles, CheckCircle2, ShieldCheck, Zap, ArrowRight, Award, Star } from 'lucide-react';

interface AdsLandingPageProps {
  onSuccessRegistered: () => void;
}

export const AdsLandingPage: React.FC<AdsLandingPageProps> = ({ onSuccessRegistered }) => {
  const { registerStudent } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [board, setBoard] = useState<Board>('CBSE');
  const [grade, setGrade] = useState<Grade>(10);
  const [parentName, setParentName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await registerStudent({
      fullName,
      email,
      board,
      grade,
      parentName,
      referredByCode: referralCode
    });

    setIsSubmitting(false);
    if (res.success) {
      onSuccessRegistered();
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: High-Converting Headline & Social Proof */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Google & YouTube Ads Special Offer: 25 Quizzes 100% Free</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Stop Overpaying for Tuition. Master Your Board with AI.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Join thousands of CBSE, ICSE, and Cambridge scholars. Instant Socratic tutoring, anti-cheat assessments, and real rewards — from Class 1 to 12.
          </p>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Tailored strictly to CBSE, ICSE/CISCE, and Cambridge IGCSE.</span>
            </div>
            <div className="flex items-center space-x-2.5 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full Offline Question Bank ensuring zero network disruptions.</span>
            </div>
            <div className="flex items-center space-x-2.5 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Safe child environment under DPDP Act 2023 (Zero 3rd party ads).</span>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-400">
            <div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] mt-1 block">4.9/5 from 12,000+ Indian Families</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="font-bold text-white text-sm">₹49 for 60 Days</span>
              <span className="text-[11px] block text-slate-500">Sub-₹1/day premium tier</span>
            </div>
          </div>
        </div>

        {/* Right Column: Distraction-Free Above-The-Fold Signup Box */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
              Instant Scholar Access
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Claim Free Student Account</h2>
            <p className="text-xs text-slate-400 mt-0.5">No credit card or payment required.</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-300">
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
              <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="student or parent email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Board *</label>
                <select
                  value={board}
                  onChange={e => setBoard(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE / CISCE</option>
                  <option value="IGCSE">Cambridge IGCSE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Class *</label>
                <select
                  value={grade}
                  onChange={e => setGrade(Number(e.target.value) as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Parent Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sunita Sharma"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Promo / Referral Code</label>
              <input
                type="text"
                placeholder="e.g. AL-XXX-1234"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-1.5 mt-2"
            >
              <span>{isSubmitting ? 'Creating Genuine Account...' : 'Get Instant Access (25 Free Quizzes)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500 mt-4">
            By signing up, you agree to our Terms and DPDP 2023 compliant Child Safety Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
