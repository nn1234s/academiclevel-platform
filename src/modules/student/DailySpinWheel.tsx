import React, { useState, useEffect } from 'react';
import { Learner } from '../../core/types';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { ApiClient } from '../../core/api/apiClient';
import confetti from 'canvas-confetti';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { Sparkles, Clock, Lock, Unlock, Trophy, AlertCircle } from 'lucide-react';

interface DailySpinWheelProps {
  learner: Learner;
  onSpinCompleted: () => void;
}

export const DailySpinWheel: React.FC<DailySpinWheelProps> = ({ learner, onSpinCompleted }) => {
  const [canSpin, setCanSpin] = useState<boolean>(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotationDeg, setWheelRotationDeg] = useState<number>(0);
  const [spinResult, setSpinResult] = useState<{
    coinsAwarded: number;
    isJackpot: boolean;
    error?: string;
  } | null>(null);

  // Safely check qualified referral count without admin privilege requirement
  const qualifiedReferralsCount = StorageRLSLayer.getQualifiedReferralsCount(learner.id);
  const isJackpotUnlocked = qualifiedReferralsCount >= 1;

  useEffect(() => {
    const check = CoinLedgerService.canSpinWheel(learner);
    setCanSpin(check.allowed);
    setCooldownRemainingMs(check.remainingCooldownMs);

    const interval = setInterval(() => {
      const liveCheck = CoinLedgerService.canSpinWheel(learner);
      setCanSpin(liveCheck.allowed);
      setCooldownRemainingMs(liveCheck.remainingCooldownMs);
    }, 1000);

    return () => clearInterval(interval);
  }, [learner]);

  const formatCooldown = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handleSpinClick = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    let result = { coinsAwarded: 2, isJackpot: false, error: undefined as string | undefined };
    try {
      const serverRes = await ApiClient.spinWheel(learner.id);
      result = { coinsAwarded: serverRes.coinsWon, isJackpot: serverRes.isJackpot, error: undefined };
      const localLearner = StorageRLSLayer.getLearnerById(learner.id, learner.id);
      if (localLearner) {
        localLearner.coinBalance = serverRes.newBalance;
        localLearner.lastSpinTimestampUtc = new Date().toISOString();
        StorageRLSLayer.saveLearner(localLearner, learner.id);
      }
    } catch {
      // Offline fallback
      const fallback = CoinLedgerService.executeSpin(learner.id);
      result = { coinsAwarded: fallback.coinsAwarded, isJackpot: fallback.isJackpot, error: fallback.error };
    }

    // Determine target rotation
    // 4 slices: 0: 2 coins (90 deg), 1: 3 coins (180 deg), 2: 5 coins (270 deg), 3: 40 coins jackpot (360 deg)
    let sliceAngle = 45; // 2 coins
    if (result.coinsAwarded === 3) sliceAngle = 135;
    else if (result.coinsAwarded === 5) sliceAngle = 225;
    else if (result.coinsAwarded === 40) sliceAngle = 315;

    const fullSpins = 5 * 360; // 5 full revolutions
    const targetDeg = wheelRotationDeg + fullSpins + (360 - sliceAngle);

    setWheelRotationDeg(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(result);
      onSpinCompleted();

      if (result.coinsAwarded > 0) {
        try {
          confetti({
            particleCount: result.isJackpot ? 150 : 60,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }, 3500);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-slate-100">
      <div className="mb-4">
        <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          24-Hour UTC Cooldown Economy
        </span>
        <h2 className="text-2xl font-extrabold text-white mt-2">Daily Study Coin Wheel</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Spin every 24 hours to earn free Study Coins for avatar frames, streak freezes, and gift rewards.
        </p>
      </div>

      {/* Wheel Graphic Container */}
      <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
        {/* Pointer Triangle */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

        {/* Outer Wheel Rim */}
        <div
          className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-2xl relative overflow-hidden transition-transform duration-[3500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
          style={{ transform: `rotate(${wheelRotationDeg}deg)` }}
        >
          {/* Slice 1: 2 Coins (Top-Left) */}
          <div className="absolute inset-0 bg-indigo-700 [clip-path:polygon(50%_50%,0_0,100%_0)] flex items-start justify-center pt-4">
            <span className="text-xs font-black text-white tracking-wider">2 COINS</span>
          </div>

          {/* Slice 2: 3 Coins (Top-Right) */}
          <div className="absolute inset-0 bg-violet-700 [clip-path:polygon(50%_50%,100%_0,100%_100%)] flex items-center justify-end pr-4">
            <span className="text-xs font-black text-white tracking-wider rotate-90">3 COINS</span>
          </div>

          {/* Slice 3: 5 Coins (Bottom-Right) */}
          <div className="absolute inset-0 bg-blue-700 [clip-path:polygon(50%_50%,100%_100%,0_100%)] flex items-end justify-center pb-4">
            <span className="text-xs font-black text-white tracking-wider rotate-180">5 COINS</span>
          </div>

          {/* Slice 4: 40 Coins Rare Jackpot (Bottom-Left) */}
          <div
            className={`absolute inset-0 [clip-path:polygon(50%_50%,0_100%,0_0)] flex items-center justify-start pl-3 ${
              isJackpotUnlocked
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black animate-pulse'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <div className="-rotate-90 text-[10px] font-black flex items-center space-x-1">
              <span>40 JACKPOT</span>
              {!isJackpotUnlocked && <Lock className="w-3 h-3 inline ml-1" />}
            </div>
          </div>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-14 h-14 bg-slate-950 border-2 border-amber-400 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
            <StudyCoinIcon className="w-12 h-12" glow />
          </div>
        </div>
      </div>

      {/* Jackpot Unlock Status Bar */}
      <div className="mb-6 p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-left">
          {isJackpotUnlocked ? (
            <Unlock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
          )}
          <div>
            <span className="font-semibold text-slate-200">
              40-Coin Rare Jackpot: {isJackpotUnlocked ? 'Unlocked!' : 'Locked'}
            </span>
            <p className="text-[11px] text-slate-400">
              {isJackpotUnlocked
                ? 'Unlocked via 1+ qualified referral on your account.'
                : 'Unlocks when 1 friend joins via your invite and completes their first quiz.'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded">
          {qualifiedReferralsCount} Qualified
        </span>
      </div>

      {/* Spin Result Feedback */}
      {spinResult && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-semibold animate-in fade-in duration-300 ${
            spinResult.isJackpot
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {spinResult.isJackpot ? (
            <div className="flex items-center justify-center space-x-2">
              <StudyCoinIcon className="w-5 h-5" glow />
              <span>JACKPOT! You won +40 Study Coins! Ledger updated.</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <StudyCoinIcon className="w-4 h-4" />
              <span>Congratulations! You won +{spinResult.coinsAwarded} Study Coins!</span>
            </div>
          )}
        </div>
      )}

      {/* Spin Trigger / Cooldown Button */}
      {canSpin ? (
        <button
          onClick={handleSpinClick}
          disabled={isSpinning}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-950 transition-all flex items-center justify-center space-x-2"
        >
          <StudyCoinIcon className="w-4 h-4" />
          <span>{isSpinning ? 'Spinning Wheel...' : 'Spin the Wheel Now'}</span>
        </button>
      ) : (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Next daily spin unlocks in:</span>
          <span className="font-mono font-bold text-white">{formatCooldown(cooldownRemainingMs)}</span>
        </div>
      )}
    </div>
  );
};
