import React from 'react';
import { PLAN_PRICING } from '../../services/paymentService';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingPageProps {
  onSelectPlan: (tier: 'LITE' | 'PLUS') => void;
  onOpenRegister: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan, onOpenRegister }) => {
  const handleGoToAdPage = () => {
    window.location.href = '/special49';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 text-slate-100 py-6 px-4">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          Limited-Time Breakthrough Access
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-3">
          Honest &amp; Accessible Pricing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Unlock the complete 12,000 question syllabus bank and 24/7 Nova AI Socratic tutor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Lite Plan (Special ₹49 Advert1 Offer) */}
        <div className="bg-slate-900 border-2 border-amber-500/50 hover:border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all relative">
          <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 tracking-widest uppercase">
            Special Advert Offer
          </span>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-amber-400">CONCEPT BOOSTER (LITE)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                60 Days
              </span>
            </div>
            <div className="flex items-baseline space-x-1 mb-4">
              <span className="text-4xl font-black text-white">₹49</span>
              <span className="text-xs text-slate-400">/ 60 days (Save 90%)</span>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              60-day concept booster pass with uninterrupted CBSE, ICSE, and IGCSE syllabus coverage.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {PLAN_PRICING.LITE.features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleGoToAdPage}
            className="mt-8 w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Claim Special Offer (₹49)</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

        {/* Plus Plan (Best Value - 3x Duration) */}
        <div className="bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative ring-4 ring-emerald-500/20">
          <span className="absolute -top-3 right-6 px-3.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white tracking-widest uppercase shadow-md animate-pulse">
            🔥 3X DURATION • 6 MONTHS BEST VALUE
          </span>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-emerald-400 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>ACADEMICLEVEL PLUS (180 DAYS)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                180 Days (Half a Year)
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mb-2">
              <span className="text-4xl font-black text-white">₹129</span>
              <span className="text-xs text-slate-400">/ 180 days</span>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                ~₹21.50/mo (Cheaper per day!)
              </span>
            </div>

            <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-200">
              ⭐ <strong>Pay just ₹80 more</strong> to get <strong>120 extra days (4 full months free!)</strong>. Covers your entire semester + board exam season!
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Complete semester mastery, competitive Olympiad foundation &amp; Master Certificate of Excellence.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200 font-medium">
              {PLAN_PRICING.PLUS.features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleGoToAdPage}
            className="mt-8 w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center space-x-1.5 cursor-pointer transform hover:scale-[1.01]"
          >
            <span>Claim 180-Day Plus Pass (₹129) — Best Value ↗</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trust & Verification Assurance */}
      <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-xl mx-auto flex items-center justify-center space-x-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Official UPI PG Gateway • Instant Automated Activation • 100% money-back guarantee if syllabus is not covered</span>
      </div>
    </div>
  );
};
