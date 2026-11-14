import React, { useState, useEffect } from 'react';
import { PlanPricing, PLAN_PRICING, PaymentService } from '../../services/paymentService';
import { UTRValidator } from '../../core/security/utrValidator';
import { CheckCircle2, QrCode, ShieldCheck, AlertCircle, Copy, Check, ArrowLeft, Zap } from 'lucide-react';

interface UPIQRCheckoutProps {
  planTier: 'LITE' | 'PLUS';
  learnerId: string;
  onBack: () => void;
  onSuccess: (utr: string) => void;
}

export const UPIQRCheckout: React.FC<UPIQRCheckoutProps> = ({
  planTier,
  learnerId,
  onBack,
  onSuccess,
}) => {
  const plan: PlanPricing = PLAN_PRICING[planTier];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [payerUpiId, setPayerUpiId] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [showPostPaymentNotice, setShowPostPaymentNotice] = useState<boolean>(false);
  const utrInputRef = React.useRef<HTMLInputElement>(null);

  const officialPayeeName = PaymentService.OFFICIAL_MERCHANT_NAME;
  const officialQrImage = PaymentService.getOfficialQrImageUrl(planTier);
  const upiUri = PaymentService.generateUpiPaymentString(planTier, learnerId);

  useEffect(() => {
    let isMounted = true;
    PaymentService.generateQrDataUrl(planTier, learnerId).then(url => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [planTier, learnerId]);

  const handleUpiAppTap = () => {
    try {
      const nowStr = Date.now().toString();
      sessionStorage.setItem('al_checkout_tapped_upi', 'true');
      sessionStorage.setItem('al_checkout_tapped_time', nowStr);
      localStorage.setItem('al_checkout_tapped_upi', 'true');
      localStorage.setItem('al_checkout_tapped_time', nowStr);
    } catch {}
  };

  useEffect(() => {
    const checkAndShowNotice = () => {
      try {
        const tapped = sessionStorage.getItem('al_checkout_tapped_upi') === 'true' ||
                       localStorage.getItem('al_checkout_tapped_upi') === 'true';
        const tappedTime = Number(
          sessionStorage.getItem('al_checkout_tapped_time') ||
          localStorage.getItem('al_checkout_tapped_time') ||
          0
        );
        if (tapped && !isSubmittedSuccess && Date.now() - tappedTime < 20 * 60 * 1000) {
          setShowPostPaymentNotice(true);
          sessionStorage.removeItem('al_checkout_tapped_upi');
          localStorage.removeItem('al_checkout_tapped_upi');
          setTimeout(() => {
            utrInputRef.current?.focus();
          }, 300);
        }
      } catch {}
    };

    const handleReturn = () => {
      if (document.visibilityState === 'visible') {
        checkAndShowNotice();
      }
    };

    // Check immediately on mount in case WebView reloaded
    checkAndShowNotice();

    document.addEventListener('visibilitychange', handleReturn);
    window.addEventListener('focus', checkAndShowNotice);
    window.addEventListener('pageshow', checkAndShowNotice);

    return () => {
      document.removeEventListener('visibilitychange', handleReturn);
      window.removeEventListener('focus', checkAndShowNotice);
      window.removeEventListener('pageshow', checkAndShowNotice);
    };
  }, [isSubmittedSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setErrorMessage('Please enter the 12-digit bank Transaction ID (UTR) from your UPI payment receipt.');
      return;
    }

    const valResult = UTRValidator.validateFormat(cleanUtr);
    if (!valResult.isValid) {
      setErrorMessage(valResult.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await PaymentService.submitUpiPayment(
        learnerId,
        planTier,
        payerUpiId.trim() || undefined,
        cleanUtr
      );

      if (!result.success) {
        setErrorMessage(result.error || 'Payment submission failed.');
        setIsSubmitting(false);
      } else {
        setIsSubmittedSuccess(true);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network anomaly.');
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 border border-emerald-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Payment Registered Successfully
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            Payment Details Submitted for Verification
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Thank you! Your payment details have been submitted to our audit desk. Manual bank ledger reconciliation typically takes approximately one hour. You can continue practicing unlimited quizzes with your 60-day Concept Booster pass while activation is finalized!
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs font-mono space-y-2.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Membership Tier:</span>
            <span className="text-white font-bold">{plan.name} ({plan.durationDays} Days)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount Paid:</span>
            <span className="text-emerald-400 font-bold">₹{plan.priceInr}.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Bank UTR Reference:</span>
            <span className="text-amber-300 font-bold tracking-wider">{utrNumber || 'Under Audit Desk Match'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Current Status:</span>
            <span className="text-amber-400 font-bold">Under Server Verification</span>
          </div>
        </div>

        <button
          onClick={() => onSuccess(utrNumber.trim())}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Plans</span>
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* QR Code Container */}
        <div className="flex flex-col items-center bg-white p-4 rounded-3xl shadow-2xl w-full max-w-[320px] border border-slate-200">
          <div className="w-full flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Official Merchant QR
            </span>
            <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {plan.name} · ₹{plan.priceInr}
            </span>
          </div>

          {/* Dynamic Google Pay UPI QR Image */}
          <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 relative p-1 bg-white flex flex-col items-center">
            <img
              src={qrDataUrl || officialQrImage}
              alt={`Dynamic UPI QR - ₹${plan.priceInr} (${officialPayeeName})`}
              className="w-full h-auto object-contain block select-none"
            />
            <a
              href={upiUri}
              onClick={handleUpiAppTap}
              className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Tap to Pay via UPI App (₹{plan.priceInr})</span>
            </a>
          </div>

          {/* Payee Verification Badge (UPI ID hidden for clean presentation) */}
          <div className="mt-3 text-center w-full px-1">
            <div className="flex items-center justify-center space-x-1.5 bg-slate-100 px-3 py-2 rounded-xl text-xs text-slate-800 font-semibold border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Payee: <strong className="text-slate-900">{officialPayeeName}</strong></span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Pay ₹{plan.priceInr} directly from GPay, PhonePe, Paytm, BHIM, or any UPI app.
            </p>
          </div>
        </div>

        {/* Verification Form */}
        <div className="flex-1 w-full">
          <div className="mb-4">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <ShieldCheck className="w-3 h-3" />
              <span>Direct Bank Settlement</span>
            </span>
            <h2 className="text-xl font-bold text-white">Audited UPI Verification</h2>
            <p className="text-xs text-slate-400 mt-1">
              After completing the UPI payment of <strong className="text-white">₹{plan.priceInr}</strong>, submit your 12-digit bank UTR reference below. Verification takes approximately one hour.
            </p>
          </div>

          {showPostPaymentNotice && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <strong className="block font-bold">Welcome Back! 🎉</strong>
                <span>Enter the 12-digit UTR reference from your payment receipt below to complete activation.</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  12-Digit Bank Transaction ID (UTR) <span className="text-red-400">*</span>
                </label>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${utrNumber.length === 12 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                  {utrNumber.length}/12 Digits
                </span>
              </div>
              <input
                ref={utrInputRef}
                type="text"
                required
                maxLength={12}
                placeholder="e.g. 431289567812 (12 digits from receipt)"
                value={utrNumber}
                onChange={e => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                  setUtrNumber(cleaned);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Check your UPI app receipt for <strong>UPI Ref No.</strong>, <strong>UTR</strong>, or <strong>Transaction ID</strong> (12 digits).
              </p>
            </div>

            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Audit & Verification Notice:</p>
              <p>• We match your Payer UPI ID with our merchant statement.</p>
              <p>• Status is marked PENDING_VERIFICATION and audited before activation.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !payerUpiId.trim() || !payerUpiId.includes('@')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Submitting to Verification Queue...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Payment Verification (₹{plan.priceInr})</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
