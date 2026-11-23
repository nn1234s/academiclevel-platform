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
    // 4 slices:
    // Slice 1: 2 Coins (Top quadrant, center at 0° / 360°)
    // Slice 2: 3 Coins (Right quadrant, center at 90°)
    // Slice 3: 5 Coins (Bottom quadrant, center at 180°)
    // Slice 4: 40 Coins Jackpot (Left quadrant, center at 270°)
    let centerAngle = 0; // 2 coins default (Slice 1: Top, 0°)
    if (result.coinsAwarded === 3) centerAngle = 90; // Slice 2: Right, 90°
    else if (result.coinsAwarded === 5) centerAngle = 180; // Slice 3: Bottom, 180°
    else if (result.coinsAwarded === 40) centerAngle = 270; // Slice 4: Left, 270°

    // Safe organic landing offset within the core slice quadrant (+-8 degrees)
    const jitter = Math.floor((Math.random() - 0.5) * 16);
    const desiredNormalized = ((360 - centerAngle + jitter) % 360 + 360) % 360;
    const currentNormalized = ((wheelRotationDeg % 360) + 360) % 360;
    let delta = desiredNormalized - currentNormalized;
    if (delta <= 0) {
      delta += 360;
    }
    const fullSpins = 5 * 360; // 5 full revolutions forward
    const targetDeg = wheelRotationDeg + fullSpins + delta;

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
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center text-slate-900">
      <div className="mb-4">
        <span className="text-[11px] font-bold tracking-wider text-amber-800 uppercase bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full inline-flex items-center space-x-1.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Daily Scholar Reward Wheel</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">Daily Study Coin Wheel</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Spin every 24 hours to earn free Study Coins for awesome avatar frames, streak freezes, and real doorstep rewards!
        </p>
      </div>

      {/* Wheel Graphic Container */}
      <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
        {/* Pointer Triangle */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-500 drop-shadow-md" />

        {/* Outer Wheel Rim */}
        <div
          className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-lg relative overflow-hidden transition-transform duration-[3500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
          style={{ transform: `rotate(${wheelRotationDeg}deg)` }}
        >
          {/* Slice 1: 2 Coins (Top-Left) */}
          <div className="absolute inset-0 bg-indigo-600 [clip-path:polygon(50%_50%,0_0,100%_0)] flex items-start justify-center pt-4">
            <span className="text-xs font-black text-white tracking-wider">2 COINS</span>
          </div>

          {/* Slice 2: 3 Coins (Top-Right) */}
          <div className="absolute inset-0 bg-violet-600 [clip-path:polygon(50%_50%,100%_0,100%_100%)] flex items-center justify-end pr-4">
            <span className="text-xs font-black text-white tracking-wider rotate-90">3 COINS</span>
          </div>

          {/* Slice 3: 5 Coins (Bottom-Right) */}
          <div className="absolute inset-0 bg-blue-600 [clip-path:polygon(50%_50%,100%_100%,0_100%)] flex items-end justify-center pb-4">
            <span className="text-xs font-black text-white tracking-wider rotate-180">5 COINS</span>
          </div>

          {/* Slice 4: 40 Coins Rare Jackpot (Bottom-Left) */}
          <div
            className={`absolute inset-0 [clip-path:polygon(50%_50%,0_100%,0_0)] flex items-center justify-start pl-3 ${
              isJackpotUnlocked
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black animate-pulse'
                : 'bg-slate-300 text-slate-600'
            }`}
          >
            <div className="-rotate-90 text-[10px] font-black flex items-center space-x-1">
              <span>40 JACKPOT</span>
              {!isJackpotUnlocked && <Lock className="w-3 h-3 inline ml-1" />}
            </div>
          </div>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-14 h-14 bg-white border-2 border-amber-400 rounded-full flex items-center justify-center shadow-xs overflow-hidden">
            <StudyCoinIcon className="w-12 h-12" glow />
          </div>
        </div>
      </div>

      {/* Jackpot Unlock Status Bar */}
      <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-left">
          {isJackpotUnlocked ? (
            <Unlock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
          )}
          <div>
            <span className="font-semibold text-slate-900">
              40-Coin Rare Jackpot: {isJackpotUnlocked ? 'Unlocked!' : 'Locked'}
            </span>
            <p className="text-[11px] text-slate-500">
              {isJackpotUnlocked
                ? 'Unlocked via 1+ qualified referral on your account.'
                : 'Unlocks when 1 friend joins via your invite and completes their first quiz.'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl">
          {qualifiedReferralsCount} Friends Invited
        </span>
      </div>

      {/* Spin Result Feedback */}
      {spinResult && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs font-semibold animate-in fade-in duration-300 ${
            spinResult.isJackpot
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
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
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <StudyCoinIcon className="w-4 h-4" />
          <span>{isSpinning ? 'Spinning Wheel...' : 'Spin the Wheel Now'}</span>
        </button>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center justify-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Next daily spin unlocks in:</span>
          <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">{formatCooldown(cooldownRemainingMs)}</span>
        </div>
      )}
    </div>
  );
};
