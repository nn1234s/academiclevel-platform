import React, { useState } from 'react';
import { Learner, Subscription } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { PLAN_PRICING, PaymentService } from '../../services/paymentService';
import { UPIQRCheckout } from './UPIQRCheckout';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Zap,
  ArrowRight
} from 'lucide-react';

interface PremiumCenterProps {
  learner: Learner;
  onRefreshLearner: () => void;
  onOpenACodeModal: () => void;
}

export const PremiumCenter: React.FC<PremiumCenterProps> = ({
  learner,
  onRefreshLearner,
  onOpenACodeModal,
}) => {
  const [selectedTier, setSelectedTier] = useState<'LITE' | 'PLUS' | null>(null);
  const [submissionSuccessUtr, setSubmissionSuccessUtr] = useState<string | null>(null);

  const subscriptions = StorageRLSLayer.getSubscriptionsForLearner(learner.id, learner.id);
  const activeSub = subscriptions.find(
    s => s.status === 'ACTIVE' && s.expiresAt && new Date(s.expiresAt).getTime() > Date.now()
  );
  const pendingSub = subscriptions.find(s => s.status === 'PENDING_VERIFICATION');

  if (selectedTier) {
    return (
      <UPIQRCheckout
        planTier={selectedTier}
        learnerId={learner.id}
        onBack={() => setSelectedTier(null)}
        onSuccess={utr => {
          setSelectedTier(null);
          setSubmissionSuccessUtr(utr);
          onRefreshLearner();
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Premium Membership Portal</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Elevate Your Academic Trajectory
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Unlock unlimited AI quizzes, Olympiad challenges, Socratic tutoring, and verified certificates.
          </p>
        </div>

        <button
          onClick={onOpenACodeModal}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
        >
          Have a Scholarship ACode?
        </button>
      </div>

      {/* Active Subscription Status Banner */}
      {activeSub ? (
        <div className="p-5 bg-emerald-950/30 border border-emerald-800 rounded-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-white">
                  {activeSub.planTier} Membership Active
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Expires on {new Date(activeSub.expiresAt!).toLocaleDateString()} (Invoice #{activeSub.invoiceNumber})
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/80">
            Unlimited Quota
          </span>
        </div>
      ) : pendingSub ? (
        <div className="p-5 bg-amber-950/30 border border-amber-800 rounded-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-amber-300">
                Payment Verification Pending (UTR: {pendingSub.utrReference})
              </span>
              <p className="text-xs text-slate-200 font-semibold mt-0.5">
                Thank you for your purchase. Due to server side checks, we will grant after 1 day.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Your payment reference has been recorded in our verification system. You will receive unlimited access as soon as verified.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-800/80">
            Pending Audit
          </span>
        </div>
      ) : null}

      {/* Success Notification after submission */}
      {submissionSuccessUtr && (
        <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-600/60 rounded-3xl text-xs text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-white">
                Thank you for your purchase. Due to server side checks, we will grant after 1 day.
              </p>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                Bank UTR Reference: <strong className="text-amber-300">{submissionSuccessUtr}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionSuccessUtr(null)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lite Plan */}
        <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-300">LITE PLAN</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                60 Days
              </span>
            </div>
            <div className="flex items-baseline space-x-1 mb-4">
              <span className="text-4xl font-black text-white">₹49</span>
              <span className="text-xs text-slate-400">/ 60 days</span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Complete full syllabus coverage for an entire academic term across your chosen class.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              {PLAN_PRICING.LITE.features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setSelectedTier('LITE')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>Choose Lite Plan (₹49)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Plus Plan */}
        <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-2 border-indigo-500 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative">
          <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[10px] font-black bg-indigo-500 text-white tracking-widest uppercase shadow-md">
            Most Popular Choice
          </span>
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PLUS PLAN</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                180 Days
              </span>
            </div>
            <div className="flex items-baseline space-x-1 mb-4">
              <span className="text-4xl font-black text-white">₹129</span>
              <span className="text-xs text-slate-400">/ 180 days (~₹21/mo)</span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              6 full months of advanced training, Olympiad reasoning, and Annual Master Certificate eligibility.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200 mb-6">
              {PLAN_PRICING.PLUS.features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setSelectedTier('PLUS')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
          >
            <span>Choose Plus Plan (₹129)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Invoice & Order History */}
      {subscriptions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Transaction & Invoice History ({subscriptions.length})</span>
          </h3>

          <div className="divide-y divide-slate-800">
            {subscriptions.map(s => (
              <div key={s.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{s.planTier} Plan</span>
                    <span className="text-slate-400 font-mono text-[11px]">#{s.invoiceNumber || s.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    UTR: <span className="font-mono text-slate-300">{s.utrReference || 'N/A'}</span> • Payer: {s.payerUpiId || 'Direct'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-black text-white">₹{s.amountInr}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : s.status === 'REVOKED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
