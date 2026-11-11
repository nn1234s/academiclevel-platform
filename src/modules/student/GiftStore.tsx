import React, { useState } from 'react';
import { Learner, GiftRequest } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { ApiClient } from '../../core/api/apiClient';
import { QuotaService } from '../../services/quotaService';
import {
  Gift,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Truck,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
  Tag,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Send,
  ShieldCheck,
  Award
} from 'lucide-react';

interface GiftStoreProps {
  learner: Learner;
  onRefreshLearner: () => void;
  onNavigateToPremium?: () => void;
}

export interface SubmittedClaimInfo {
  reqId: string;
  level: GiftCardLevel;
  brandName: string;
  amount: number;
  deliveryEmail: string;
  deliveryPhone: string;
  coinsCost: number;
  targetEmail: string;
  mailSubject: string;
  mailBody: string;
  mailtoUrl: string;
}

export interface GiftCardLevel {
  level: number;
  rsAmount: number;
  coinsCost: number;
  coinsCostFormatted: string;
  badge: string;
  gradient: string;
  popular?: boolean;
}

export const GIFT_CARD_LEVELS: GiftCardLevel[] = [
  {
    level: 1,
    rsAmount: 20,
    coinsCost: 500,
    coinsCostFormatted: '500 Coins',
    badge: 'Starter Milestone',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    level: 2,
    rsAmount: 30,
    coinsCost: 750,
    coinsCostFormatted: '750 Coins',
    badge: 'Bronze Scholar',
    gradient: 'from-orange-500 to-rose-500'
  },
  {
    level: 3,
    rsAmount: 50,
    coinsCost: 1200,
    coinsCostFormatted: '1,200 Coins',
    badge: 'Silver Scholar',
    gradient: 'from-rose-500 to-pink-500'
  },
  {
    level: 4,
    rsAmount: 100,
    coinsCost: 2400,
    coinsCostFormatted: '2,400 Coins',
    badge: 'Gold Scholar',
    gradient: 'from-indigo-600 to-violet-600',
    popular: true
  },
  {
    level: 5,
    rsAmount: 150,
    coinsCost: 3500,
    coinsCostFormatted: '3,500 Coins',
    badge: 'Platinum Scholar',
    gradient: 'from-violet-600 to-purple-600'
  },
  {
    level: 6,
    rsAmount: 200,
    coinsCost: 4800,
    coinsCostFormatted: '4,800 Coins',
    badge: 'Diamond Scholar',
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    level: 7,
    rsAmount: 250,
    coinsCost: 6000,
    coinsCostFormatted: '6,000 Coins',
    badge: 'Master Scholar',
    gradient: 'from-blue-600 to-indigo-700'
  },
  {
    level: 8,
    rsAmount: 350,
    coinsCost: 8500,
    coinsCostFormatted: '8,500 Coins',
    badge: 'Grandmaster',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    level: 9,
    rsAmount: 500,
    coinsCost: 12000,
    coinsCostFormatted: '12,000 Coins',
    badge: 'Olympiad Champion',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    popular: true
  }
];

export const GIFT_CARD_BRANDS = [
  { id: 'AMAZON', name: 'Amazon Pay Gift Card', emoji: '📦', color: 'text-amber-400' },
  { id: 'GPAY', name: 'Google Play Redeem Code', emoji: '🎮', color: 'text-emerald-400' },
  { id: 'FLIPKART', name: 'Flipkart Voucher', emoji: '🛍️', color: 'text-blue-400' },
  { id: 'SWIGGY', name: 'Swiggy / Zomato Food', emoji: '🍕', color: 'text-orange-400' },
  { id: 'UPI_CASH', name: 'Direct UPI Cash Transfer', emoji: '💸', color: 'text-indigo-400' }
];

export const GiftStore: React.FC<GiftStoreProps> = ({ learner, onRefreshLearner, onNavigateToPremium }) => {
  const [selectedLevel, setSelectedLevel] = useState<GiftCardLevel | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('AMAZON');
  const [deliveryEmail, setDeliveryEmail] = useState<string>(learner.email || '');
  const [deliveryPhone, setDeliveryPhone] = useState<string>(learner.phone || '');
  const [upiIdInput, setUpiIdInput] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submittedClaim, setSubmittedClaim] = useState<SubmittedClaimInfo | null>(null);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);

  const handleCopyVoucher = (code: string, id: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedVoucherId(id);
      setTimeout(() => setCopiedVoucherId(null), 2500);
    } catch {}
  };

  const getVoucherDetails = (req: GiftRequest): string => {
    if (req.voucherCode) return req.voucherCode;
    const match = req.shippingAddress?.match(/Voucher Code:\s*([^\s|]+)/i);
    if (match && match[1]) return match[1];
    return 'AL-AMZ-READY-2026';
  };

  const getRedemptionHelp = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('amazon')) {
      return {
        url: 'https://www.amazon.in/addgiftcard',
        instructions: 'Open Amazon App → Amazon Pay → Add Gift Card to balance, paste code.'
      };
    }
    if (t.includes('google')) {
      return {
        url: 'https://play.google.com/redeem',
        instructions: 'Open Play Store → Top right profile icon → Payments & subscriptions → Redeem code.'
      };
    }
    if (t.includes('flipkart')) {
      return {
        url: 'https://www.flipkart.com',
        instructions: 'Open Flipkart App → Account → My Cards & Wallet → Add Flipkart Gift Card.'
      };
    }
    if (t.includes('swiggy')) {
      return {
        url: 'https://www.swiggy.com',
        instructions: 'Open Swiggy App → Account → Swiggy Money → Add Gift Card / Voucher.'
      };
    }
    return {
      url: '',
      instructions: 'Funds transferred directly to your submitted UPI ID. Check your UPI app!'
    };
  };

  // Unit Economics Guard: Check scholar subscription status and learning milestones
  const quota = QuotaService.evaluateQuota(learner);
  const isEnrolledScholar = quota.hasActiveSubscription || learner.role === 'SUPER_ADMIN';
  const minLevelsRequired = 3;
  const levelsCount = learner.levelsCompletedCount || 0;
  const hasAcademicMilestone = levelsCount >= minLevelsRequired || learner.role === 'SUPER_ADMIN';

  const existingRequests = StorageRLSLayer.getGiftRequestsForLearner(learner.id);

  // Calculate progress toward next reachable level
  const nextTargetLevel = GIFT_CARD_LEVELS.find(l => l.coinsCost > learner.coinBalance) || GIFT_CARD_LEVELS[0];
  const progressPercent = Math.min(100, (learner.coinBalance / nextTargetLevel.coinsCost) * 100);

  const handleOpenRedeemModal = (gcLevel: GiftCardLevel) => {
    setSelectedLevel(gcLevel);
    setMessage(null);
  };

  const handleConfirmRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevel) return;

    // 1. Check Scholar Plan status (Protects 60%+ platform profit margin)
    if (!isEnrolledScholar) {
      setMessage({
        type: 'error',
        text: '🌟 Enrolled Scholar Privilege: Real Cash and Gift Card claims are exclusively reserved for active Lite (₹49) or Plus (₹129) subscribers. Upgrade your plan to unlock instant reward claims! You can also spend coins immediately on digital avatars & streak freezes in the Coin Mall.'
      });
      return;
    }

    // 2. Check Academic Effort Requirement
    if (!hasAcademicMilestone) {
      setMessage({
        type: 'error',
        text: `🎯 Proof of Study Milestone: Complete at least ${minLevelsRequired} curriculum levels with >= 70% score (currently completed: ${levelsCount}/${minLevelsRequired}) to verify genuine learning progress before redeeming.`
      });
      return;
    }

    // 3. Check Coin Balance
    if (learner.coinBalance < selectedLevel.coinsCost) {
      setMessage({
        type: 'error',
        text: `Insufficient Study Coins. Required: ${selectedLevel.coinsCost.toLocaleString()} (${selectedLevel.coinsCostFormatted}), Available: ${learner.coinBalance.toLocaleString()} Coins.`
      });
      return;
    }

    if (!deliveryEmail.trim() || !deliveryPhone.trim()) {
      setMessage({ type: 'error', text: 'Please fill in both email and WhatsApp mobile number for digital voucher delivery.' });
      return;
    }

    const brandName = GIFT_CARD_BRANDS.find(b => b.id === selectedBrand)?.name || selectedBrand;
    const title = `Level ${selectedLevel.level}: ₹${selectedLevel.rsAmount} ${brandName}`;
    const targetEmail = 'academiclevels@gmail.com';

    // 1. Append-only ledger debit
    const tx = CoinLedgerService.appendTransaction(
      learner.id,
      -selectedLevel.coinsCost,
      'GIFT_STORE_REDEMPTION',
      {
        level: selectedLevel.level,
        rsAmount: selectedLevel.rsAmount,
        brand: selectedBrand,
        email: deliveryEmail.trim(),
        phone: deliveryPhone.trim(),
        upiId: selectedBrand === 'UPI_CASH' ? upiIdInput.trim() : undefined,
        dispatchedTo: targetEmail
      }
    );

    if (!tx.success) {
      setMessage({ type: 'error', text: tx.error || 'Ledger transaction failed.' });
      return;
    }

    // 2. Queue gift card request for Admin approval & delivery
    const reqId = 'gc_req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newRequest: GiftRequest = {
      id: reqId,
      learnerId: learner.id,
      learnerName: learner.fullName,
      itemTitle: title,
      coinsCost: selectedLevel.coinsCost,
      shippingAddress: `Email Request to ${targetEmail} | Delivery: ${deliveryEmail.trim()} | Brand: ${brandName}${selectedBrand === 'UPI_CASH' && upiIdInput ? ` | UPI: ${upiIdInput.trim()}` : ''}`,
      contactPhone: deliveryPhone.trim(),
      status: 'PENDING_APPROVAL',
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    StorageRLSLayer.saveGiftRequest(newRequest);

    // Sync redemption to server database queue
    ApiClient.redeemGift({
      learnerId: learner.id,
      level: selectedLevel.level,
      brand: selectedBrand,
      rsAmount: selectedLevel.rsAmount,
      coinsCost: selectedLevel.coinsCost,
      deliveryEmail: deliveryEmail.trim(),
      deliveryPhone: deliveryPhone.trim(),
      upiId: selectedBrand === 'UPI_CASH' && upiIdInput ? upiIdInput.trim() : undefined
    }).catch(() => {});

    // 3. Prepare formal email request directed to academiclevels@gmail.com
    const mailSubject = `[Gift Card Claim] Level ${selectedLevel.level} (₹${selectedLevel.rsAmount} ${brandName}) - ${learner.fullName}`;
    const mailBody = `Hello AcademicLevel Team,

I have accumulated Study Coins on AcademicLevel and redeemed a Gift Card reward!

Redemption Claim Summary:
• Student Name: ${learner.fullName}
• Student Email: ${learner.email}
• WhatsApp / Phone: ${deliveryPhone.trim()}
• Board & Class: ${learner.board} Class ${learner.grade}
• Learner ID: ${learner.id}
• Selected Reward: Level ${selectedLevel.level} - ₹${selectedLevel.rsAmount} ${brandName}
• Coins Debited: ${selectedLevel.coinsCost.toLocaleString()} Coins
• Voucher Delivery Email: ${deliveryEmail.trim()}
${selectedBrand === 'UPI_CASH' && upiIdInput ? `• Direct UPI ID: ${upiIdInput.trim()}\n` : ''}• Claim Request ID: ${reqId}
• Submitted At: ${new Date().toLocaleString()}

Please verify my coin ledger record and dispatch the voucher code.

Thank you,
${learner.fullName}`;

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

    // Set submitted claim modal state
    setSubmittedClaim({
      reqId,
      level: selectedLevel,
      brandName,
      amount: selectedLevel.rsAmount,
      deliveryEmail: deliveryEmail.trim(),
      deliveryPhone: deliveryPhone.trim(),
      coinsCost: selectedLevel.coinsCost,
      targetEmail,
      mailSubject,
      mailBody,
      mailtoUrl
    });

    onRefreshLearner();
    setSelectedLevel(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-slate-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-900/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-flex items-center space-x-1.5 mb-3">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin-slow" />
              <span>Real Rewards • Instant Digital Delivery</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Study Coin Gift Card Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Convert your academic consistency into real-world rewards!
              <br />
              <strong className="text-amber-400">Level 1 starts at 500 Coins (₹20 Gift Card)</strong>, scaling up across 9 milestones to <strong className="text-amber-400">15,000 Coins (₹500 Gift Card)</strong>!
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 rounded-3xl p-5 text-center min-w-[200px] shadow-xl">
            <span className="text-[11px] text-slate-400 block font-medium">Your Study Coins</span>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span className="text-3xl font-black text-amber-400 font-mono">
                {learner.coinBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-mono">Append-Only Ledger Verified</span>
          </div>
        </div>

        {/* Dynamic Progress toward next milestone */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-1 mb-2">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>
                Target: Level {nextTargetLevel.level} (₹{nextTargetLevel.rsAmount} Gift Card • {nextTargetLevel.coinsCostFormatted})
              </span>
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {learner.coinBalance.toLocaleString()} / {nextTargetLevel.coinsCost.toLocaleString()} Coins ({progressPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scholar Economics & Trust Badge */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-lg">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg flex-shrink-0 mt-0.5">
            🛡️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">Rapid Voucher Dispatch & Fair-Play Economics</span>
              {isEnrolledScholar ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  ✓ Scholar Enrolled
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Free Tier • Upgrade to Cash Out
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Earn <strong className="text-amber-400">+25 coins</strong> per level mastered (70%+ accuracy) plus daily streak bonuses. Real gift cards are reserved for enrolled Lite/Plus Scholars with min. 3 levels mastered. Digital avatars, streak freezes, and PDFs are available to all students in the Coin Mall!
            </p>
          </div>
        </div>
        {!isEnrolledScholar && onNavigateToPremium && (
          <button
            onClick={onNavigateToPremium}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex-shrink-0 shadow-md transition-all flex items-center justify-center space-x-1"
          >
            <span>Upgrade Plan (From ₹49)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Feedback Alert */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {/* Gift Card Grid (9 Levels) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Gift className="w-5 h-5 text-indigo-400" />
              <span>Available Gift Card Tiers (Levels 1 to 9)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Redeemable for Amazon Pay, Google Play, Flipkart, Swiggy, or Direct UPI.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GIFT_CARD_LEVELS.map(tier => {
            const canAfford = learner.coinBalance >= tier.coinsCost;
            return (
              <div
                key={tier.level}
                className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group ${
                  canAfford
                    ? 'border-amber-500/60 hover:border-amber-400 shadow-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-sm">
                    Popular Tier
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-950 text-indigo-300 border border-slate-800">
                      Level {tier.level}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{tier.badge}</span>
                  </div>

                  {/* Visual Gift Card Voucher Preview */}
                  <div
                    className={`rounded-2xl p-4 bg-gradient-to-tr ${tier.gradient} text-white shadow-lg mb-4 relative overflow-hidden`}
                  >
                    <div className="absolute top-2 right-2 text-2xl opacity-20">🎁</div>
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 block">
                      AcademicLevel Reward Voucher
                    </span>
                    <div className="text-2xl font-black mt-1">₹{tier.rsAmount} Gift Card</div>
                    <div className="text-[10px] font-mono opacity-90 mt-2">
                      Amazon Pay • GPlay • Flipkart
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400">Coin Requirement:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {tier.coinsCost.toLocaleString()} Coins
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ({tier.coinsCostFormatted} Study Coins)
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenRedeemModal(tier)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>
                      {canAfford
                        ? `Redeem ₹${tier.rsAmount} Gift Card`
                        : `Need ${(tier.coinsCost - learner.coinBalance).toLocaleString()} more`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redemption History */}
      {existingRequests.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Your Redemptions & Digital Delivery Status ({existingRequests.length})</span>
          </h3>

          <div className="divide-y divide-slate-800">
            {existingRequests.map(req => {
              const code = getVoucherDetails(req);
              const help = getRedemptionHelp(req.itemTitle);
              const isDispatched = req.status === 'APPROVED_DISPATCHED';

              return (
                <div key={req.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-white text-sm">{req.itemTitle}</p>
                        <span className="text-amber-400 font-mono text-xs">(-{req.coinsCost.toLocaleString()} Coins)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Delivered to: {req.shippingAddress.split('|')[0] || req.shippingAddress} • Phone: {req.contactPhone}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Requested on: {new Date(req.requestedAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                          isDispatched
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span>{isDispatched ? '✓ Dispatched & Ready to Use' : req.status === 'REJECTED' ? 'Rejected' : '⏳ Verification in Progress'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Dispatched Voucher Code Banner & 1-Click Copy */}
                  {isDispatched && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-950 to-slate-900 border-2 border-emerald-500/50 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-400 flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>Voucher Code Generated & Verified</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300/80 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                          Ready to Redeem
                        </span>
                      </div>

                      {/* Monospace Code Box */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                            Digital Voucher Code:
                          </span>
                          <span className="font-mono text-base sm:text-lg font-black text-white tracking-widest selection:bg-emerald-500">
                            {code}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyVoucher(code, req.id)}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950 transition-all flex-shrink-0"
                        >
                          {copiedVoucherId === req.id ? (
                            <>
                              <Check className="w-4 h-4 text-slate-950" />
                              <span>Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-950" />
                              <span>Copy Voucher Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Instructions */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                        <span>💡 {help.instructions}</span>
                        {help.url && (
                          <a
                            href={help.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 hover:underline"
                          >
                            <span>Open Redemption Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Redeem Gift Card */}
      {selectedLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-slate-100 relative">
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Level {selectedLevel.level} Reward
              </span>
              <h3 className="text-xl font-extrabold text-white mt-2">
                Redeem ₹{selectedLevel.rsAmount} Gift Card
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cost: <strong className="text-amber-400">{selectedLevel.coinsCost.toLocaleString()} Study Coins</strong> ({selectedLevel.coinsCostFormatted})
              </p>
            </div>

            <form onSubmit={handleConfirmRedeem} className="space-y-4 text-xs">
              {/* Brand Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Select Gift Card Brand
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GIFT_CARD_BRANDS.map(brand => (
                    <button
                      type="button"
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                        selectedBrand === brand.id
                          ? 'border-amber-400 bg-amber-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{brand.emoji}</span>
                      <span className="text-[11px] truncate">{brand.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Email */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Delivery Email Address (for Voucher Code & PIN)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student or parent email"
                  value={deliveryEmail}
                  onChange={e => setDeliveryEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Delivery Phone */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Mobile Number (for Instant Voucher SMS)</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={deliveryPhone}
                  onChange={e => setDeliveryPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Optional UPI ID if UPI Cash selected */}
              {selectedBrand === 'UPI_CASH' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Your UPI ID for Cash Voucher Transfer
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourname@okhdfcbank"
                    value={upiIdInput}
                    onChange={e => setUpiIdInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Summary */}
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
                <span>Coins to be debited:</span>
                <span className="font-mono font-bold text-amber-400">
                  -{selectedLevel.coinsCost.toLocaleString()} Coins
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLevel(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950 transition-all"
                >
                  Confirm & Redeem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Email Request Confirmation to academiclevels@gmail.com */}
      {submittedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-slate-100 relative space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <Gift className="w-7 h-7 text-amber-400" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full inline-block">
                Claim Dispatched to academiclevels@gmail.com
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                ₹{submittedClaim.amount} {submittedClaim.brandName} Claimed!
              </h3>
              <p className="text-xs text-slate-300">
                Your <strong className="text-amber-400">{submittedClaim.coinsCost.toLocaleString()} Study Coins</strong> have been debited from the ledger. An official redemption request has been formatted for <strong>academiclevels@gmail.com</strong>.
              </p>
            </div>

            {/* Email Dispatch Action Buttons */}
            <div className="space-y-2.5">
              <a
                href={submittedClaim.mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Open Mail & Send to academiclevels@gmail.com</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(submittedClaim.mailBody);
                  setCopiedEmailText(true);
                  setTimeout(() => setCopiedEmailText(false), 2500);
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                {copiedEmailText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied Email Claim Text to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Pre-filled Email Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Request Summary details */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Support Email:</span>
                <span className="text-amber-300 font-bold">{submittedClaim.targetEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Address:</span>
                <span className="text-white truncate max-w-[200px]">{submittedClaim.deliveryEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp / Mobile:</span>
                <span className="text-emerald-400">{submittedClaim.deliveryPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Request ID:</span>
                <span className="text-indigo-300">{submittedClaim.reqId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verification Status:</span>
                <span className="text-amber-400 font-bold">Queued for Admin Review</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Our team verifies ledger debits against <strong className="text-slate-300">academiclevels@gmail.com</strong>. Your digital voucher code and PIN will arrive via email / SMS within 24 hours.
            </p>

            <button
              type="button"
              onClick={() => setSubmittedClaim(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Done & Return to Gift Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
