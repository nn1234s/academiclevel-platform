import React, { useState, useEffect } from 'react';
import { Learner, ACode } from '../../core/types';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { ApiClient } from '../../core/api/apiClient';
import { PaymentService } from '../../services/paymentService';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import confetti from 'canvas-confetti';
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Award,
  KeyRound,
  CheckCircle2,
  Clock,
  Plus,
  Share2,
  Send,
  Ticket,
  AlertCircle
} from 'lucide-react';

interface ReferralProgrammeProps {
  learner: Learner;
  onRefreshLearner?: () => void;
}

export const ReferralProgramme: React.FC<ReferralProgrammeProps> = ({ learner, onRefreshLearner }) => {
  const [activeTab, setActiveTab] = useState<'acodes' | 'referrals'>('acodes');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // ACodes state
  const [acodes, setAcodes] = useState<ACode[]>([]);
  const [loadingACodes, setLoadingACodes] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Redeem box state
  const [redeemInput, setRedeemInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemNotice, setRedeemNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch student's shareable ACodes
  const fetchMyACodes = async () => {
    try {
      setLoadingACodes(true);
      const res = await ApiClient.getLearnerACodes(learner.id);
      if (res && res.success && Array.isArray(res.acodes) && res.acodes.length > 0) {
        setAcodes(res.acodes);
      } else {
        const local = StorageRLSLayer.getLearnerACodes(learner.id);
        setAcodes(local);
      }
    } catch {
      const local = StorageRLSLayer.getLearnerACodes(learner.id);
      setAcodes(local);
    } finally {
      setLoadingACodes(false);
    }
  };

  useEffect(() => {
    fetchMyACodes();
  }, [learner.id]);

  // Handle generating new Friend Pass ACode
  const handleGenerateACode = async () => {
    try {
      setGeneratingCode(true);
      const res = await ApiClient.generateLearnerACode(learner.id, 'PLUS', 14);
      if (res && res.success && res.acode) {
        setAcodes(prev => [res.acode, ...prev]);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else {
        const local = StorageRLSLayer.generateLearnerACode(learner.id, 14, 'PLUS');
        setAcodes(prev => [local, ...prev]);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      console.error('Failed to generate ACode:', err);
      const local = StorageRLSLayer.generateLearnerACode(learner.id, 14, 'PLUS');
      setAcodes(prev => [local, ...prev]);
    } finally {
      setGeneratingCode(false);
    }
  };

  // Handle student redeeming someone else's ACode
  const handleRedeemACode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;
    setIsRedeeming(true);
    setRedeemNotice(null);

    const res = await PaymentService.redeemACode(learner.id, redeemInput.trim());
    setIsRedeeming(false);
    if (res.success) {
      setRedeemNotice({ type: 'success', text: res.message });
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      setRedeemInput('');
      if (onRefreshLearner) onRefreshLearner();
      await fetchMyACodes();
    } else {
      setRedeemNotice({ type: 'error', text: res.message });
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Share via WhatsApp
  const shareViaWhatsApp = (code: string) => {
    const text = encodeURIComponent(
      `Hey! I study on AcademicLevel and got you a free Friend Pass ACode: *${code}*!\n\n` +
      `Enter this code at https://academiclevel.in/scholarships or signup to unlock free 14-Day PLUS access and +25 Study Coins! 🚀`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Referrals tracking (classic)
  const allLearners = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
  const myReferrals = allLearners.filter(l => l.referredBy === learner.id);
  const qualifiedCount = myReferrals.filter(r => r.referralQualified).length;
  const referralLink = `${window.location.origin}/?ref=${learner.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const redeemedACodesCount = acodes.filter(c => c.isRedeemed || (c.usedCount && c.usedCount > 0)).length;
  const activeACodesCount = acodes.length - redeemedACodesCount;
  const totalCoinsEarned = (qualifiedCount + redeemedACodesCount) * 40;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <StudyCoinIcon className="w-3.5 h-3.5" glow />
              <span>+40 Coins Per Friend Who Joins</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Ticket className="w-3 h-3" />
              <span>Customer Friend Pass ACodes</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Share AcademicLevel with Friends
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Give your friends an exclusive <strong>Friend Pass ACode</strong> voucher. When they redeem it, they get free <strong>14-Day PLUS access</strong> + 25 bonus coins, and you receive an instant <strong className="text-amber-400 inline-flex items-center gap-1"><StudyCoinIcon className="w-4 h-4" /> +40 Study Coins</strong> in your ledger!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-indigo-900/40">
          <button
            onClick={() => setActiveTab('acodes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'acodes'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/50'
                : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>My Friend Pass ACodes ({acodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'referrals'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Direct Referral Link & Tracking</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Friend Pass ACodes</span>
          <p className="text-2xl font-black text-white mt-1">{acodes.length}</p>
          <span className="text-[10px] text-amber-400 font-medium">{activeACodesCount} Ready to Share</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Passes Redeemed</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{redeemedACodesCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">+40c Credited Each</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Referral Students</span>
          <p className="text-2xl font-black text-indigo-300 mt-1">{myReferrals.length}</p>
          <span className="text-[10px] text-slate-500 font-medium">{qualifiedCount} 1st Quiz Done</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Total Coins Earned</span>
          <p className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center gap-1.5">
            <StudyCoinIcon className="w-6 h-6" glow />
            <span>+{totalCoinsEarned}</span>
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Append-Only Ledger</span>
        </div>
      </div>

      {/* TAB 1: Friend Pass ACodes */}
      {activeTab === 'acodes' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Your Shareable Friend Pass ACodes</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send any of these codes to your classmates. When they enter the code, they get free 14-day PLUS access and you earn +40 coins.
              </p>
            </div>

            <button
              onClick={handleGenerateACode}
              disabled={generatingCode}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950 flex items-center justify-center space-x-1.5 transition-all flex-shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{generatingCode ? 'Minting Code...' : '+ Mint New Friend Pass'}</span>
            </button>
          </div>

          {/* ACodes Cards Grid */}
          {loadingACodes ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Loading your Friend Pass ACodes...
            </div>
          ) : acodes.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <p className="text-sm">You haven&apos;t generated any Friend Pass ACodes yet.</p>
              <button
                onClick={handleGenerateACode}
                className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
              >
                Generate 3 Free Friend Passes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {acodes.map(acode => {
                const isClaimed = acode.isRedeemed || (acode.usedCount && acode.usedCount > 0);
                const fullInviteText = `Hey! Here is an exclusive AcademicLevel Friend Pass ACode: ${acode.code}. Redeem it at https://academiclevel.in/scholarships for free 14-Day PLUS access and 25 Study Coins! 🚀`;

                return (
                  <div
                    key={acode.code}
                    className={`rounded-2xl p-5 border relative overflow-hidden transition-all flex flex-col justify-between ${
                      isClaimed
                        ? 'bg-slate-900/50 border-emerald-500/40 opacity-90'
                        : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 shadow-lg'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
                          {acode.planTier || 'PLUS'} • {acode.durationDays || 14} Days Free
                        </span>

                        {isClaimed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Redeemed (+40c Earned)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Ready to Share</span>
                          </span>
                        )}
                      </div>

                      {/* The Code Display */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-semibold">Friend Pass ACode</span>
                          <span className="text-base font-mono font-black text-amber-300 tracking-wide">{acode.code}</span>
                        </div>

                        <button
                          onClick={() => handleCopy(acode.code, acode.code)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all"
                          title="Copy Code"
                        >
                          {copiedCode === acode.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode === acode.code ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Perk Details */}
                      <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>For your friend:</span>
                          <span className="font-semibold text-white">14-Day Free PLUS + 25 Coins</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Reward for you:</span>
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <StudyCoinIcon className="w-3 h-3" />
                            +40 Study Coins
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isClaimed && (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => shareViaWhatsApp(acode.code)}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleCopy(fullInviteText, `full-${acode.code}`)}
                          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all"
                        >
                          {copiedCode === `full-${acode.code}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode === `full-${acode.code}` ? 'Invite Copied!' : 'Copy Invite'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Customer Redeem Box */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950/50 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="max-w-xl">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Have a Friend Pass or Scholarship ACode?</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                If a classmate or teacher gave you a voucher code, enter it below to claim your rewards instantly!
              </p>

              <form onSubmit={handleRedeemACode} className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={redeemInput}
                  onChange={e => setRedeemInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AL-FRND-XXXX-YYYY, AL-WIN1-..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm uppercase text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isRedeeming}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-950 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRedeeming ? 'Redeeming...' : 'Redeem Code'}</span>
                </button>
              </form>

              {redeemNotice && (
                <div className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
                  redeemNotice.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                }`}>
                  {redeemNotice.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Classic Referral Code & Pipeline */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Unique Referral Code Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Direct Referral Code & Registration Link</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-medium">Your Referral Code</span>
                  <span className="text-base font-mono font-bold text-indigo-300">{learner.referralCode}</span>
                </div>
                <button
                  onClick={() => handleCopy(learner.referralCode, 'ref-code')}
                  className="p-2 text-indigo-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
                  title="Copy Code"
                >
                  {copiedCode === 'ref-code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={copyReferralLink}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Invite Link'}</span>
              </button>
            </div>
          </div>

          {/* Referral Status Pipeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Referral Tracking Pipeline ({myReferrals.length})</span>
            </h3>

            {myReferrals.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No students have registered with your code yet. Share your code or Friend Pass to start earning coins!
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {myReferrals.map(ref => (
                  <div key={ref.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{ref.fullName}</p>
                      <p className="text-[11px] text-slate-400">
                        {ref.board} • Class {ref.grade} • Joined {new Date(ref.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      {ref.referralQualified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <StudyCoinIcon className="w-3.5 h-3.5" />
                          <span>Qualified (+40 Coins)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending 1st Quiz</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
