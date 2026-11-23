import React, { useState } from 'react';
import { Learner } from '../../core/types';
import { PaymentService } from '../../services/paymentService';
import { Award, KeyRound, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface ACodesRedemptionProps {
  learner: Learner;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const ACodesRedemption: React.FC<ACodesRedemptionProps> = ({
  learner,
  onSuccess,
  onCancel,
}) => {
  const [acodeInput, setAcodeInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acodeInput.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const result = await PaymentService.redeemACode(learner.id, acodeInput.trim());
    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900">
      <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
        <KeyRound className="w-7 h-7" />
      </div>

      <div className="text-center mb-6">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
          Institutional Scholarships
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Redeem ACode Voucher</h2>
        <p className="text-xs text-slate-600 mt-1">
          Enter your 16-character scholarship key (e.g. <span className="font-mono text-indigo-600 font-bold">AL-SCHOLAR-2026</span>) to activate instant premium access.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`mb-4 p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleRedeem} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            ACode Voucher Key
          </label>
          <input
            type="text"
            required
            placeholder="AL-XXXX-XXXX"
            value={acodeInput}
            onChange={e => setAcodeInput(e.target.value.toUpperCase())}
            className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-slate-900 uppercase placeholder-slate-400 focus:outline-none text-center"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !acodeInput.trim()}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>{isSubmitting ? 'Verifying ACode...' : 'Activate Scholarship Voucher'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};
