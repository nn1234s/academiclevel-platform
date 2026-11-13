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

        {/* Plus Plan (Best Value) */}
        <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-2 border-indigo-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
          <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white tracking-widest uppercase">
            Best Academic Value
          </span>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>ACADEMICLEVEL PLUS</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                180 Days
              </span>
            </div>
            <div className="flex items-baseline space-x-1 mb-4">
              <span className="text-4xl font-black text-white">₹129</span>
              <span className="text-xs text-slate-400">/ 180 days (~₹21/mo)</span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Complete semester mastery, competitive Olympiad track & Master Certificate.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200">
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
            className="mt-8 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Unlock Plus Plan (₹129)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Trust & Verification Assurance */}
      <div className="mt-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-xl mx-auto flex items-center justify-center space-x-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Verified UPI Payments • Human-verified within 15–60 minutes • 100% money-back guarantee if syllabus is not covered</span>
      </div>
    </div>
  );
};
