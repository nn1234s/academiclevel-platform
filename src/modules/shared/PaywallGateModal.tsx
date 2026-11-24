import React from 'react';
import { ShieldAlert, Zap, Award, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { PLAN_PRICING } from '../../services/paymentService';

interface PaywallGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  quizzesCompleted: number;
  levelsCompleted: number;
  onSelectPlan: (tier: 'LITE' | 'PLUS') => void;
  onOpenACode: () => void;
  hasActiveSubscription?: boolean;
}

export const PaywallGateModal: React.FC<PaywallGateModalProps> = ({
  isOpen,
  onClose,
  reason,
  quizzesCompleted,
  levelsCompleted,
  onSelectPlan,
  onOpenACode,
  hasActiveSubscription,
}) => {
  if (!isOpen || hasActiveSubscription) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-900">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-3 shadow-xs">
            <Zap className="w-7 h-7" />
          </div>
          <span className="block text-xs font-mono font-semibold uppercase tracking-wider text-amber-700 mb-1">
            Plan Upgrade &amp; Renewal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Unlock Unlimited K-12 Mastery
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2">
            {reason || 'Free tier accounts are limited to 3 completed curriculum levels. Upgrade to Lite (₹49) or Plus (₹129) to continue unlimited learning across all grades and subjects.'}
            <br />
            <span className="text-slate-500 font-medium">
              Your certificates, coin balance, and profile remain 100% safe.
            </span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* Lite Plan */}
          <div className="border border-slate-200 bg-slate-50/80 rounded-2xl p-5 hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">LITE PLAN</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                  60 Days
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-3">
                <span className="text-3xl font-extrabold text-slate-900">₹49</span>
                <span className="text-xs text-slate-500">/ 60 days</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-4">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Unlimited Quizzes &amp; Tests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>All Syllabus Chapters &amp; Topics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Nova AI Tutor 24/7 🎀</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('LITE')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <span>Choose Lite (₹49)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Plus Plan (Recommended) */}
          <div className="border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/40 to-white rounded-2xl p-5 relative flex flex-col justify-between shadow-md">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white tracking-wide uppercase shadow-xs">
              Best Value
            </span>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PLUS PLAN</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  180 Days
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-3">
                <span className="text-3xl font-extrabold text-slate-900">₹129</span>
                <span className="text-xs text-slate-500">/ 180 days (~₹21/mo)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 mb-4">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Full 180-Day Unlimited Access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Olympiad &amp; Entrance Track</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Annual Master Certificate Eligible</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('PLUS')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Unlock Plus (₹129)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer & ACode scholarship voucher */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Have an institutional or scholarship code?</span>
          </div>
          <button
            onClick={onOpenACode}
            className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Redeem ACode (AL-XXXX-XXXX)
          </button>
        </div>
      </div>
    </div>
  );
};
