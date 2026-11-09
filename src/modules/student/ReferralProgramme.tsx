import React, { useState } from 'react';
import { Learner } from '../../core/types';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { Users, Copy, Check, Sparkles, Award, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface ReferralProgrammeProps {
  learner: Learner;
}

export const ReferralProgramme: React.FC<ReferralProgrammeProps> = ({ learner }) => {
  const [copied, setCopied] = useState(false);

  // Fetch referrals for this learner
  const allLearners = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
  const myReferrals = allLearners.filter(l => l.referredBy === learner.id);

  const qualifiedCount = myReferrals.filter(r => r.referralQualified).length;
  const pendingCount = myReferrals.filter(r => !r.referralQualified).length;
  const totalCoinsEarned = qualifiedCount * 40;

  const referralLink = `${window.location.origin}/?ref=${learner.referralCode}`;

  const copyCode = () => {
    navigator.clipboard?.writeText(learner.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-xl">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>+40 Coins Per Qualified Scholar</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Invite Classmates, Grow Together
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Share your unique invite code with friends from CBSE, ICSE, or Cambridge IGCSE.
            When they join and complete their <strong className="text-white">first full quiz</strong>, you receive an instant <strong className="text-amber-400">+40 Study Coins</strong> and unlock the Rare 40-Coin Spin Wheel Jackpot!
          </p>
        </div>

        {/* Unique Code Cards */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center justify-between bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Your Referral Code</span>
              <span className="text-sm font-mono font-bold text-indigo-300">{learner.referralCode}</span>
            </div>
            <button
              onClick={copyCode}
              className="p-2 text-indigo-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={copyLink}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Direct Invite Link</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs text-slate-400">Total Referrals</span>
          <p className="text-2xl font-black text-white mt-1">{myReferrals.length}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs text-slate-400">First Quiz Qualified</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{qualifiedCount}</p>
          <span className="text-[10px] text-slate-500">Reward Credited</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs text-slate-400">Referral Coins Earned</span>
          <p className="text-2xl font-black text-amber-400 mt-1">+{totalCoinsEarned}</p>
          <span className="text-[10px] text-slate-500">Append-Only Ledger</span>
        </div>
      </div>

      {/* Referral Status Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Referral Tracking Pipeline ({myReferrals.length})</span>
        </h3>

        {myReferrals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No students have registered with your code yet. Share your code to start earning coins!
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
  );
};
