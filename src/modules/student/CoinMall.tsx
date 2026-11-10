import React, { useState } from 'react';
import { Learner } from '../../core/types';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { ShoppingBag, ShieldCheck, Flame, BookOpen, Sparkles, Check, AlertCircle, Gift, ArrowRight } from 'lucide-react';

interface CoinMallProps {
  learner: Learner;
  onRefreshLearner: () => void;
  onNavigateToGiftStore?: () => void;
}

export const CoinMall: React.FC<CoinMallProps> = ({ learner, onRefreshLearner, onNavigateToGiftStore }) => {
  const [purchaseSuccess, setPurchaseSuccess] = useState<string>('');
  const [purchaseError, setPurchaseError] = useState<string>('');

  const handleBuyStreakFreeze = () => {
    setPurchaseSuccess('');
    setPurchaseError('');

    const cost = 15;
    if (learner.coinBalance < cost) {
      setPurchaseError(`Insufficient coins. You have ${learner.coinBalance} coins, but 15 are required.`);
      return;
    }

    const tx = CoinLedgerService.appendTransaction(learner.id, -cost, 'MALL_PURCHASE', {
      item: 'STREAK_FREEZE_1X'
    });

    if (tx.success) {
      learner.streakFreezesAvailable = (learner.streakFreezesAvailable || 0) + 1;
      StorageRLSLayer.saveLearner(learner, learner.id);
      onRefreshLearner();
      setPurchaseSuccess('Streak Freeze purchased! Your study streak is protected for 1 missed day.');
    } else {
      setPurchaseError(tx.error || 'Transaction failed.');
    }
  };

  const handleBuyAvatarFrame = (frameName: string, cost: number) => {
    setPurchaseSuccess('');
    setPurchaseError('');

    if (learner.coinBalance < cost) {
      setPurchaseError(`Insufficient coins. You have ${learner.coinBalance} coins, but ${cost} are required.`);
      return;
    }

    const tx = CoinLedgerService.appendTransaction(learner.id, -cost, 'MALL_PURCHASE', {
      item: `AVATAR_FRAME_${frameName.toUpperCase()}`
    });

    if (tx.success) {
      learner.avatarFrame = frameName;
      StorageRLSLayer.saveLearner(learner, learner.id);
      onRefreshLearner();
      setPurchaseSuccess(`Equipped ${frameName} Avatar Frame!`);
    } else {
      setPurchaseError(tx.error || 'Transaction failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Study Coin Economy Mall
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Redeem Your Hard-Earned Coins
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Every coin is verified against the append-only ledger. Power up your profile, safeguard streaks, and download premium revisions.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-center min-w-[160px]">
          <span className="text-[11px] text-slate-400 block font-medium">Your Available Coins</span>
          <div className="flex items-center justify-center space-x-1.5 mt-1">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <span className="text-2xl font-black text-amber-400">{learner.coinBalance}</span>
          </div>
        </div>
      </div>

      {/* Real Cash & Gift Card Rewards Spotlight */}
      <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
            🎁
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Real Cash & Voucher Rewards
              </span>
              <span className="text-[10px] font-bold text-rose-300">Level 1 to 9</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              ₹20 to ₹500 Real Gift Cards & UPI Cash
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Unlock Amazon Pay, Google Play, Flipkart, Swiggy, or Direct UPI Cash. Starting at <strong className="text-amber-400">500 Coins (₹20 GC)</strong>, scaling up across 9 milestones to <strong className="text-amber-400">15,000 Coins (₹500 GC)</strong>!
            </p>
          </div>
        </div>

        {onNavigateToGiftStore && (
          <button
            onClick={onNavigateToGiftStore}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <span>Explore Gift Cards Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Notifications */}
      {purchaseSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-2xl text-xs text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{purchaseSuccess}</span>
        </div>
      )}

      {purchaseError && (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-2xl text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{purchaseError}</span>
        </div>
      )}

      {/* Item Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Protection */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Streak Freeze Shield</h3>
            <p className="text-xs text-slate-400 mt-2">
              Missing a study day won&apos;t reset your streak. Automatically activates if you miss 24 hours.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span>Active Freezes:</span>
              <span className="font-mono font-bold text-amber-400">{learner.streakFreezesAvailable || 0}</span>
            </div>
          </div>

          <button
            onClick={handleBuyStreakFreeze}
            className="mt-6 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Buy Freeze (15 Coins)</span>
          </button>
        </div>

        {/* Emerald Frame */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Emerald Scholar Frame</h3>
            <p className="text-xs text-slate-400 mt-2">
              Equip an exclusive animated emerald border for your avatar across StudentPacks and leaderboards.
            </p>
          </div>

          <button
            onClick={() => handleBuyAvatarFrame('Emerald', 20)}
            className="mt-6 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <span>{learner.avatarFrame === 'Emerald' ? 'Equipped' : 'Equip (20 Coins)'}</span>
          </button>
        </div>

        {/* Gold Olympiad Frame */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Olympiad Formula Guide</h3>
            <p className="text-xs text-slate-400 mt-2">
              Instant digital download of high-yield formula compendium for {learner.board} Class {learner.grade}.
            </p>
          </div>

          <button
            onClick={() => {
              if (learner.coinBalance < 30) {
                setPurchaseError('Need 30 coins for digital handbook.');
              } else {
                CoinLedgerService.appendTransaction(learner.id, -30, 'MALL_PURCHASE', { item: 'FORMULA_GUIDE' });
                onRefreshLearner();
                setPurchaseSuccess('Formula Guide unlocked! Check your course resources.');
              }
            }}
            className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Unlock PDF (30 Coins)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
