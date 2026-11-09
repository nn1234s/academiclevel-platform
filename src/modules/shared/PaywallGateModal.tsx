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
}

export const PaywallGateModal: React.FC<PaywallGateModalProps> = ({
  isOpen,
  onClose,
  reason,
  quizzesCompleted,
  levelsCompleted,
  onSelectPlan,
  onOpenACode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-3">
            <Zap className="w-7 h-7" />
          </div>
          <span className="block text-xs font-mono font-semibold uppercase tracking-wider text-amber-400 mb-1">
            Free Tier Quota Limit Reached
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Unlock Unlimited K-12 Mastery
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2">
            {reason || `You have completed your complimentary allowance (${quizzesCompleted}/25 quizzes or ${levelsCompleted}/3 levels).`}
            <br />
            <span className="text-slate-400">
              Your certificates, coin balance, and profile remain 100% safe.
            </span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* Lite Plan */}
          <div className="border border-slate-700 bg-slate-800/40 rounded-2xl p-5 hover:border-indigo-500/80 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">LITE PLAN</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                  60 Days
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-3">
                <span className="text-3xl font-extrabold text-white">₹49</span>
                <span className="text-xs text-slate-400">/ 60 days</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 mb-4">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Unlimited Quizzes & Tests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>All 4 Progression Nodes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Nova AI Socratic Tutor 24/7</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('LITE')}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Choose Lite (₹49)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Plus Plan (Recommended) */}
          <div className="border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 to-slate-900 rounded-2xl p-5 relative flex flex-col justify-between shadow-lg shadow-indigo-950/50">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white tracking-wide uppercase">
              Best Value
            </span>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PLUS PLAN</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                  180 Days
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-3">
                <span className="text-3xl font-extrabold text-white">₹129</span>
                <span className="text-xs text-slate-400">/ 180 days (~₹21/mo)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 mb-4">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Full 180-Day Unlimited Access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Olympiad & Entrance Track</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Annual Master Certificate Eligible</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onSelectPlan('PLUS')}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-900 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Unlock Plus (₹129)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer & ACode scholarship voucher */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Have an institutional or scholarship code?</span>
          </div>
          <button
            onClick={onOpenACode}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
          >
            Redeem ACode (AL-XXXX-XXXX)
          </button>
        </div>
      </div>
    </div>
  );
};
