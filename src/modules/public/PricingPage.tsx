import React from 'react';
import { PLAN_PRICING } from '../../services/paymentService';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingPageProps {
  onSelectPlan: (tier: 'LITE' | 'PLUS' | 'GOLD') => void;
  onOpenRegister: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onSelectPlan, onOpenRegister }) => {
  const handleGoToAdPage = () => {
    window.location.href = '/special49';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 text-slate-900 py-6 px-4">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-mono font-bold tracking-widest text-amber-800 uppercase bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          Limited-Time Breakthrough Access
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3">
          Honest &amp; Accessible Pricing
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Unlock the complete 3,600+ question syllabus bank and 24/7 Nova AI Interactive Study tutor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Lite Plan (Special ₹49 Advert1 Offer) */}
        <div className="bg-white border-2 border-amber-300 hover:border-amber-400 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative">
          <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white tracking-widest uppercase">
            Entry Offer
          </span>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-amber-800">CONCEPT BOOSTER (LITE)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800">
                60 Days
              </span>
            </div>
            <div className="flex items-baseline space-x-1 mb-4">
              <span className="text-4xl font-black text-slate-900">₹49</span>
              <span className="text-xs text-slate-500">/ 60 days (~₹24.50/mo)</span>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              60-day concept booster pass with uninterrupted CBSE, and CBSE syllabus coverage.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              {PLAN_PRICING.LITE.features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleGoToAdPage}
            className="mt-8 w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Claim Lite Offer (₹49)</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Plus Plan (180 Days) */}
        <div className="bg-white border-2 border-indigo-300 hover:border-indigo-400 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md relative">
          <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white tracking-widest uppercase">
            3X Duration
          </span>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1">
                <span>PLUS PLAN (180 DAYS)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                180 Days
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mb-2">
              <span className="text-4xl font-black text-slate-900">₹129</span>
              <span className="text-xs text-slate-500">/ 180 days (~₹21.50/mo)</span>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Complete semester mastery, competitive Olympiad foundation &amp; Master Certificate of Excellence.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              {PLAN_PRICING.PLUS.features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleGoToAdPage}
            className="mt-8 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Claim Plus Pass (₹129) ↗</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Gold Plan (Crown Best Value - 365 Days) */}
        <div className="bg-gradient-to-b from-amber-50/70 via-white to-white border-2 border-amber-400 rounded-3xl p-6 flex flex-col justify-between shadow-lg relative ring-4 ring-amber-400/20">
          <span className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-white tracking-widest uppercase shadow-xs animate-pulse">
            👑 1-YEAR GOLD • BEST VALUE
          </span>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-amber-800 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>GOLD PASS (365 DAYS)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 border border-amber-300 text-amber-900">
                1 Full Year
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5 mb-2">
              <span className="text-4xl font-black text-amber-900">₹205</span>
              <span className="text-xs text-slate-500">/ 365 days</span>
            </div>

            <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
              ⭐ <strong>Pay just ₹76 more</strong> than 6-month plan to get <strong>185 EXTRA DAYS (Double your duration to 365 Days!)</strong>. Only <strong>~56 paise/day</strong>!
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Complete full-year academic mastery, both terms &amp; final board exams, VIP reward priority.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              {PLAN_PRICING.GOLD.features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleGoToAdPage}
            className="mt-8 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer transform hover:scale-[1.01]"
          >
            <span>Claim 365-Day Gold Pass (₹205) — Best Value ↗</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trust & Verification Assurance */}
      <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 text-center max-w-xl mx-auto flex items-center justify-center space-x-2 text-xs text-slate-600 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>Official UPI PG Gateway • Instant Automated Activation • 100% money-back guarantee if syllabus is not covered</span>
      </div>
    </div>
  );
};
