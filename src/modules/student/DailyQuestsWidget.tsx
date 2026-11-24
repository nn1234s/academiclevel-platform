import React, { useState, useEffect } from 'react';
import { Learner, DailyQuest, DailyQuestState } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import confetti from 'canvas-confetti';
import {
  Target,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Gift,
  Trophy,
  Swords,
  BookOpen,
  RotateCcw
} from 'lucide-react';

interface DailyQuestsWidgetProps {
  learner: Learner;
  onCoinsUpdated: () => void;
  onNavigate: (route: string) => void;
}

export const DailyQuestsWidget: React.FC<DailyQuestsWidgetProps> = ({
  learner,
  onCoinsUpdated,
  onNavigate
}) => {
  const { language } = useLanguage();
  const isHinglish = language === 'hi';

  const [questState, setQuestState] = useState<DailyQuestState>(() =>
    StorageRLSLayer.getDailyQuestState(learner.id)
  );
  const [freezeMessage, setFreezeMessage] = useState<string | null>(null);

  const completedCount = questState.quests.filter(q => q.completed).length;
  const totalQuests = questState.quests.length;
  const isAllCompleted = completedCount === totalQuests;

  const handleClaim = (questId: string) => {
    const res = StorageRLSLayer.claimQuestReward(learner.id, questId);
    if (res.success) {
      CoinLedgerService.appendTransaction(learner.id, res.coinsAwarded, 'DAILY_QUESTS_COMPLETE', { questId });
      setQuestState(StorageRLSLayer.getDailyQuestState(learner.id));
      onCoinsUpdated();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
  };

  const handleClaimAllBonus = () => {
    const res = StorageRLSLayer.claimAllQuestsBonus(learner.id);
    if (res.success) {
      CoinLedgerService.appendTransaction(learner.id, res.coinsAwarded, 'DAILY_QUESTS_COMPLETE', { bonus: 'ALL_QUESTS_COMPLETED' });
      setQuestState(StorageRLSLayer.getDailyQuestState(learner.id));
      onCoinsUpdated();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleBuyStreakFreeze = () => {
    const res = StorageRLSLayer.purchaseStreakFreeze(learner.id);
    if (res.success) {
      CoinLedgerService.appendTransaction(learner.id, -50, 'STREAK_FREEZE_PURCHASE', { item: 'STREAK_FREEZE' });
      setQuestState(StorageRLSLayer.getDailyQuestState(learner.id));
      onCoinsUpdated();
      setFreezeMessage(isHinglish ? '🛡️ Streak Freeze activate ho gaya! Aapki streak safe hai.' : '🛡️ Streak Freeze equipped! Your streak is protected.');
      setTimeout(() => setFreezeMessage(null), 3500);
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {}
    } else {
      setFreezeMessage(res.error || 'Failed to purchase');
      setTimeout(() => setFreezeMessage(null), 3000);
    }
  };

  const getQuestIcon = (id: string) => {
    if (id === 'QUIZ_PLAY') return <BookOpen className="w-4 h-4 text-indigo-600" />;
    if (id === 'DUEL_PLAY') return <Swords className="w-4 h-4 text-purple-600" />;
    return <RotateCcw className="w-4 h-4 text-rose-500" />;
  };

  const handleQuestAction = (id: string) => {
    if (id === 'QUIZ_PLAY') onNavigate('COURSES');
    else if (id === 'DUEL_PLAY') onNavigate('DUEL_ARENA');
    else onNavigate('MISTAKE_VAULT');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-700/40 space-y-5">
      {/* Header with Streak Freeze status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
              {isHinglish ? 'Daily Missions' : 'Daily Quests'}
            </span>
            <span className="text-xs text-indigo-300 font-bold">
              {completedCount}/{totalQuests} {isHinglish ? 'Complete' : 'Done'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-2">
            <span>{isHinglish ? 'Aaj Ke Daily Quests' : "Today's Study Quests"}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
        </div>

        {/* Streak Freeze Button / Pill */}
        <div className="flex items-center space-x-2 shrink-0">
          {questState.streakFreezeCount > 0 ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Streak Shield: {questState.streakFreezeCount} Equipped</span>
            </div>
          ) : (
            <button
              onClick={handleBuyStreakFreeze}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Protect your streak against missed days (50 Coins)"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isHinglish ? 'Streak Freeze (50 Coins)' : 'Streak Freeze (50 Coins)'}</span>
            </button>
          )}
        </div>
      </div>

      {freezeMessage && (
        <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold animate-in fade-in">
          {freezeMessage}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
        <div
          className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / totalQuests) * 100}%` }}
        />
      </div>

      {/* Quest Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {questState.quests.map(quest => {
          return (
            <div
              key={quest.id}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                quest.completed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                  : 'bg-white/5 border-white/10 hover:border-indigo-400/40 text-white'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    {getQuestIcon(quest.id)}
                  </div>
                  <span className="flex items-center space-x-1 text-xs font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    <span>+{quest.rewardCoins}</span>
                    <StudyCoinIcon className="w-3.5 h-3.5" glow />
                  </span>
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white">{quest.title}</h4>
                <p className="text-[11px] text-slate-300 leading-tight">{quest.description}</p>
              </div>

              {/* Action / Claim Button */}
              <div>
                {quest.claimed ? (
                  <span className="w-full py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Claimed</span>
                  </span>
                ) : quest.completed ? (
                  <button
                    onClick={() => handleClaim(quest.id)}
                    className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-amber-950 font-black text-xs transition-all shadow-md cursor-pointer animate-bounce"
                  >
                    Claim +{quest.rewardCoins} Coins! 🪙
                  </button>
                ) : (
                  <button
                    onClick={() => handleQuestAction(quest.id)}
                    className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{isHinglish ? 'Shuru Karein' : 'Start'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Complete Grand Bonus Banner */}
      {isAllCompleted && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-emerald-500/20 border border-amber-400/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-amber-200">
                {isHinglish ? '🎉 Sabhi Quests Complete!' : '🎉 All Quests Completed Today!'}
              </h4>
              <p className="text-xs text-slate-300">
                {isHinglish ? 'Aaj ka master daily bonus unlock ho gaya hai.' : 'You mastered all 3 daily goals.'}
              </p>
            </div>
          </div>

          {questState.allCompletedBonusClaimed ? (
            <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Bonus Claimed (+20 Coins)</span>
            </span>
          ) : (
            <button
              onClick={handleClaimAllBonus}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-amber-950 font-black text-xs shadow-lg transition-all transform hover:scale-105 cursor-pointer shrink-0"
            >
              Claim +20 Master Coins! 🪙
            </button>
          )}
        </div>
      )}
    </div>
  );
};
