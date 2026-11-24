import React, { useState, useEffect } from 'react';
import { Learner, ScholarLeagueTier, ScholarLeagueStanding } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Flame,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  Zap
} from 'lucide-react';

interface ScholarLeaguesProps {
  learner: Learner;
  onCoinsUpdated: () => void;
  onNavigateTo: (route: string) => void;
  onBackToDashboard: () => void;
}

const LEAGUE_CONFIG: Record<
  ScholarLeagueTier,
  {
    name: string;
    icon: string;
    minCoins: number;
    color: string;
    bgGradient: string;
    border: string;
    promotionReward: number;
    badge: string;
  }
> = {
  BRONZE: {
    name: 'Bronze Scholar',
    icon: '🥉',
    minCoins: 0,
    color: 'text-amber-700',
    bgGradient: 'from-amber-900 via-amber-950 to-slate-950',
    border: 'border-amber-700/40',
    promotionReward: 25,
    badge: 'Tier 1'
  },
  SILVER: {
    name: 'Silver Scholar',
    icon: '🥈',
    minCoins: 100,
    color: 'text-slate-300',
    bgGradient: 'from-slate-700 via-slate-800 to-slate-950',
    border: 'border-slate-500/40',
    promotionReward: 50,
    badge: 'Tier 2'
  },
  GOLD: {
    name: 'Gold Scholar',
    icon: '🥇',
    minCoins: 250,
    color: 'text-amber-400',
    bgGradient: 'from-amber-600 via-amber-800 to-slate-950',
    border: 'border-amber-400/50',
    promotionReward: 75,
    badge: 'Tier 3 (Elite)'
  },
  DIAMOND: {
    name: 'Diamond Champion',
    icon: '💎',
    minCoins: 500,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-700 via-blue-900 to-slate-950',
    border: 'border-cyan-400/60',
    promotionReward: 100,
    badge: 'Grand Champion'
  }
};

export const ScholarLeagues: React.FC<ScholarLeaguesProps> = ({
  learner,
  onCoinsUpdated,
  onNavigateTo,
  onBackToDashboard
}) => {
  const { language } = useLanguage();
  const isHinglish = language === 'hi';

  const [leagueData, setLeagueData] = useState<{
    tier: ScholarLeagueTier;
    weeklyCoins: number;
    standings: ScholarLeagueStanding[];
    promotionZoneCutoff: number;
    daysRemainingInSeason: number;
  } | null>(null);

  const [hasClaimedBonus, setHasClaimedBonus] = useState<boolean>(false);

  useEffect(() => {
    const refreshStandings = () => {
      const data = StorageRLSLayer.getScholarLeagueStandings(learner.id);
      setLeagueData(data);
    };

    refreshStandings();

    // Check & update every 20 seconds so +5 coins/5-min progression updates live seamlessly
    const interval = setInterval(refreshStandings, 20000);
    return () => clearInterval(interval);
  }, [learner.id]);

  if (!leagueData) return null;

  const currentCfg = LEAGUE_CONFIG[leagueData.tier];

  // Calculate progress to next league
  let nextTierMin = 100;
  let nextTierName = 'Silver';
  if (leagueData.tier === 'SILVER') {
    nextTierMin = 250;
    nextTierName = 'Gold';
  } else if (leagueData.tier === 'GOLD') {
    nextTierMin = 500;
    nextTierName = 'Diamond';
  } else if (leagueData.tier === 'DIAMOND') {
    nextTierMin = 1000;
    nextTierName = 'Legend';
  }

  const progressPercent = Math.min(100, Math.floor((leagueData.weeklyCoins / nextTierMin) * 100));

  const handleClaimLeagueBonus = () => {
    if (hasClaimedBonus) return;
    CoinLedgerService.appendTransaction(learner.id, currentCfg.promotionReward, 'LEAGUE_PROMOTION_REWARD', {
      tier: leagueData.tier
    });
    setHasClaimedBonus(true);
    onCoinsUpdated();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* League Header Card */}
      <div
        className={`bg-gradient-to-br ${currentCfg.bgGradient} rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border ${currentCfg.border} shadow-xl`}
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHinglish ? 'Weekly Scholar League' : 'Weekly Scholar League'}</span>
            </span>

            <span className="flex items-center space-x-1 text-xs font-bold text-slate-300 bg-black/30 px-3 py-1 rounded-full border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isHinglish
                  ? `Season ends in ${leagueData.daysRemainingInSeason} din`
                  : `Season ends in ${leagueData.daysRemainingInSeason} days`}
              </span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-4xl sm:text-5xl">{currentCfg.icon}</span>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{currentCfg.name}</h1>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {isHinglish
                      ? `Is hafte jeete: ${leagueData.weeklyCoins} Study Coins • Top 5 scholars agle tier me promote honge!`
                      : `Earned this week: ${leagueData.weeklyCoins} Study Coins • Top 5 scholars advance to next tier!`}
                  </p>
                </div>
              </div>
            </div>

            {/* Promotion Reward Card */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-center shrink-0">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Promotion Bonus
              </span>
              <span className="text-xl font-black text-amber-300 mt-1 flex items-center justify-center space-x-1">
                <span>+{currentCfg.promotionReward}</span>
                <StudyCoinIcon className="w-4 h-4 inline-block" glow />
              </span>
            </div>
          </div>

          {/* Progress bar to next league */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">
                {isHinglish
                  ? `${nextTierName} League Progress (${leagueData.weeklyCoins}/${nextTierMin} Coins)`
                  : `Next Tier: ${nextTierName} League (${leagueData.weeklyCoins}/${nextTierMin} Coins)`}
              </span>
              <span className="text-amber-300">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTo('DUEL_ARENA')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-amber-950 font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isHinglish ? '1v1 Coin Duel Khele' : 'Play 1v1 Coin Duel'}</span>
            </button>
            <button
              onClick={() => onNavigateTo('MISTAKE_VAULT')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>{isHinglish ? 'Mistake Vault (+10 Coins)' : 'Mistake Vault (+10 Coins)'}</span>
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-2 rounded-xl bg-black/30 hover:bg-black/40 text-slate-300 font-bold text-xs cursor-pointer"
            >
              {isHinglish ? '← Dashboard' : '← Back'}
            </button>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {isHinglish ? 'Weekly League Standings' : 'Weekly League Standings'}
            </h3>
            <p className="text-xs text-slate-400">
              {isHinglish ? 'Ranks 1 to 5 agle tier me qualify honge' : 'Ranks 1 to 5 qualify for next week promotion'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isHinglish ? 'Live: Scholars padh rahe hain (+5 Coins / 5m)' : 'Live: Active Scholars (+5 Coins / 5m)'}</span>
            </span>

            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Promotion Zone: Top 5</span>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {leagueData.standings.map(item => {
            const isPromotionZone = item.rank <= leagueData.promotionZoneCutoff;
            const isMe = item.isCurrentUser;

            return (
              <div
                key={item.learnerId}
                className={`py-3.5 px-3 sm:px-4 rounded-2xl flex items-center justify-between transition-all ${
                  isMe
                    ? 'bg-indigo-50 border-2 border-indigo-500 shadow-2xs font-extrabold'
                    : isPromotionZone
                    ? 'hover:bg-emerald-50/50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {/* Rank badge */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm font-mono ${
                      item.rank === 1
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : item.rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : isPromotionZone
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.rank}
                  </div>

                  {/* Name and Promotion Tag */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs sm:text-sm ${isMe ? 'text-indigo-950 font-black' : 'text-slate-800 font-bold'}`}>
                        {item.learnerName} {isMe && '(You)'}
                      </span>
                      {item.rank === 1 && <Crown className="w-4 h-4 text-amber-500" />}
                    </div>
                    {isPromotionZone && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-0.5">
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        <span>Promotion Zone</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Weekly coins */}
                <div className="flex items-center space-x-1.5 font-black text-xs sm:text-sm text-amber-700">
                  <span>{item.weeklyCoinsEarned}</span>
                  <StudyCoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block" glow />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
