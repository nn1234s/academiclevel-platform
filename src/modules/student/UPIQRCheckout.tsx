import React, { useState, useEffect, useRef } from 'react';
import { PlanPricing, PLAN_PRICING, PaymentService } from '../../services/paymentService';
import { CheckCircle2, ShieldCheck, AlertCircle, Copy, Check, ArrowLeft, Zap, ExternalLink, QrCode, AlertTriangle, Sparkles } from 'lucide-react';

interface UPIQRCheckoutProps {
  planTier: 'LITE' | 'PLUS' | 'GOLD';
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
  const gatewayUrl = PaymentService.getGatewayUrl(planTier);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [hasOpenedGateway, setHasOpenedGateway] = useState<boolean>(false);
  const [customRef, setCustomRef] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isActivatedSuccess, setIsActivatedSuccess] = useState<boolean>(false);
  const [activatedInvoice, setActivatedInvoice] = useState<string>('');
  const [noticeLang, setNoticeLang] = useState<'EN' | 'HINGLISH'>('EN');

  const handleOpenGateway = () => {
    setHasOpenedGateway(true);
    window.open(gatewayUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(gatewayUrl);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleActivateInstantAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsActivating(true);

    try {
      const res = await PaymentService.activateGatewayPayment(
        learnerId,
        planTier,
        customRef.trim() || undefined
      );

      if (res.success && res.subscription) {
        setActivatedInvoice(res.subscription.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`);
        setIsActivatedSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to activate plan. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Activation anomaly. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  if (isActivatedSuccess) {
    return (
      <div className="max-w-xl mx-auto bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block">
            ⚡ Automated Gateway Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Membership Activated Instantly!
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Welcome to <strong className="text-white">{plan.name}</strong>! Your account has been upgraded with full unlimited syllabus access, 24/7 Nova AI Socratic tutor, and physical rewards eligibility.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs font-mono space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Membership Tier:</span>
            <span className="text-white font-bold">{plan.name} ({plan.durationDays} Days)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount Paid:</span>
            <span className="text-emerald-400 font-bold">₹{plan.priceInr}.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Gateway:</span>
            <span className="text-indigo-300 font-bold">Official UPI PG (cit.org.in)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Invoice No:</span>
            <span className="text-amber-400">{activatedInvoice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Activation Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE (Full Access Live)</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => onSuccess(customRef.trim() || 'UPI-PG-ACTIVE')}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Start Learning &amp; Earn Coins Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-100">
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Plans</span>
      </button>

      <div className="space-y-6">
        {/* Header & Trust Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Automated UPI Gateway</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {plan.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {plan.durationDays} Days Unrestricted Syllabus Coverage • Classes 1 to 12
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">One-Time Fee</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ₹{plan.priceInr}<span className="text-xs text-slate-400 font-normal">.00</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-950/40 border border-red-800 rounded-2xl text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Streamlined Direct Gateway Action (No QR) */}
        <div className="space-y-4">
          {/* Screaming Gold Upgrade Banners */}
          {planTier === 'LITE' && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-yellow-950/80 border-2 border-amber-500/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xl ring-2 ring-amber-500/20">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  <span>👑 1-Year Gold Deal Available: ₹205 (365 Days)</span>
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Pay just <strong>₹156 more</strong> to get <strong>305 EXTRA DAYS (10 full months free!)</strong>. That is only <strong>~₹17.08/month (~56 paise/day!)</strong> covering both terms &amp; final board exams!
                </p>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
              >
                Upgrade to Gold (₹205) ↗
              </button>
            </div>
          )}

          {planTier === 'PLUS' && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-yellow-950/80 border-2 border-amber-500/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xl ring-2 ring-amber-500/20">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  <span>👑 Upgrade to 1-Year Gold Pass: ₹205 (365 Days)</span>
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Pay just <strong>₹76 MORE</strong> than Plus to get <strong>185 EXTRA DAYS (Double your duration to 365 Days!)</strong>. Only <strong>~56 paise/day</strong>!
                </p>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
              >
                Upgrade to Gold (₹205) ↗
              </button>
            </div>
          )}

          {planTier === 'GOLD' && (
            <div className="p-3.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-yellow-950/80 border-2 border-amber-500/80 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xl ring-4 ring-amber-500/30">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <span>👑 1-YEAR GOLD PASS SELECTED • 365 DAYS COMPLETE ACCESS</span>
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed font-semibold">
                  Full academic year coverage • Only <strong>~₹17.08/month (~56 paise/day)</strong> • VIP Store Rewards &amp; Master Certificate
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg shrink-0 uppercase tracking-widest">
                BEST VALUE
              </span>
            </div>
          )}

          {/* Step 1: BUY NOW VIA UPI PG */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px] font-black">1</span>
                <span>Step 1: Open Secure Gateway</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Official upipg.cit.org.in/pay Gateway
              </span>
            </div>

            {/* Payment Return Notice with English & Hinglish Toggle */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Payment Return Notice</span>
                </div>
                <div className="flex bg-slate-900 rounded-lg p-0.5 text-[10px] font-bold border border-slate-700 shrink-0">
                  <button
                    type="button"
                    onClick={() => setNoticeLang('EN')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'EN' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeLang('HINGLISH')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'HINGLISH' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    Hinglish
                  </button>
                </div>
              </div>
              {noticeLang === 'EN' ? (
                <p className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                  ⚠️ <strong>AFTER you have paid in UPI PG</strong>, instead of being stuck on that page, <strong>CLICK back and return here</strong>, otherwise we will forget your payment as we track payments and accounts by the pay now button click.
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                  ⚠️ <strong>UPI PG mein payment complete karne ke baad</strong>, wahan page par ruke rehne ke bajaye <strong>CLICK back karke yahan wapas aaiye</strong>, warna hum aapki payment bhool sakte hain kyunki hum payments aur accounts ko Pay Now button click ke through track karte hain.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenGateway}
              className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.01]"
            >
              <ExternalLink className="w-5 h-5" />
              <span>BUY NOW VIA UPI PG (₹{plan.priceInr}) ↗</span>
            </button>

            {/* Gateway Link Preview & Copy */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="truncate pr-2">{gatewayUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-[10px] transition-colors flex items-center space-x-1 flex-shrink-0 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Instant 1-Click Activation */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-black">2</span>
                <span>{hasOpenedGateway ? 'Payment OK. Complete Activation:-' : 'Step 2: Instant Automated Activation'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Zero Wait Time</span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                UPI PG Reference / UTR (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Transaction ID from receipt (optional)"
                value={customRef}
                onChange={e => setCustomRef(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleActivateInstantAccess()}
              disabled={isActivating}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isActivating ? (
                <span>Activating Instant Access...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>I Have Paid — Activate My Pass Instantly</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real Gateway Perks Guarantee */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Automated Gateway</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Plan Unlock</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Physical Rewards Store Eligible</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>All UPI Apps Supported</span>
          </span>
        </div>
      </div>
    </div>
  );
};
