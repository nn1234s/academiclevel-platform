import React, { useState, useEffect, useRef } from 'react';
import { Learner, Question, QuizDuel, Subject } from '../../core/types';
import { OfflineBankService } from '../../services/offlineBankService';
import { CurriculumService } from '../../services/curriculumService';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import confetti from 'canvas-confetti';
import {
  Swords,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  Share2,
  Users,
  ShieldAlert,
  ArrowRight,
  Zap,
  Sparkles,
  Award,
  Copy,
  Check,
  Link,
  MessageCircle
} from 'lucide-react';

interface QuizDuelArenaProps {
  learner: Learner;
  onCoinsUpdated: () => void;
  onBackToDashboard: () => void;
}

interface WagerTier {
  id: string;
  name: string;
  entryCost: number;
  winnerReward: number;
  badge: string;
  color: string;
}

const WAGER_TIERS: WagerTier[] = [
  { id: 'FREE', name: 'Friendly Spar', entryCost: 0, winnerReward: 5, badge: 'Zero Risk', color: 'from-emerald-500 to-teal-600' },
  { id: 'ROOKIE', name: 'Rookie Clash', entryCost: 5, winnerReward: 10, badge: '10 Coin Pot', color: 'from-blue-500 to-indigo-600' },
  { id: 'PRO', name: 'Pro Showdown', entryCost: 15, winnerReward: 30, badge: '30 Coin Pot', color: 'from-purple-500 to-indigo-600' },
  { id: 'MASTER', name: 'Grandmaster Duel', entryCost: 30, winnerReward: 60, badge: '60 Coin Pot', color: 'from-amber-500 to-orange-600' }
];

const PEER_OPPONENTS = [
  { name: 'Aarav Sharma', location: 'Delhi', accuracy: 0.75, avatar: '🦁' },
  { name: 'Diya Patel', location: 'Ahmedabad', accuracy: 0.85, avatar: '🦊' },
  { name: 'Rohan Gupta', location: 'Bengaluru', accuracy: 0.80, avatar: '🐯' },
  { name: 'Ananya Iyer', location: 'Chennai', accuracy: 0.90, avatar: '🦄' },
  { name: 'Kabir Verma', location: 'Lucknow', accuracy: 0.70, avatar: '🦅' },
  { name: 'Tanvi Rao', location: 'Hyderabad', accuracy: 0.80, avatar: '🐼' },
  { name: 'Aditya Singh', location: 'Patna', accuracy: 0.75, avatar: '🐺' }
];

export const QuizDuelArena: React.FC<QuizDuelArenaProps> = ({
  learner,
  onCoinsUpdated,
  onBackToDashboard
}) => {
  const { language } = useLanguage();
  const isHinglish = language === 'hi';

  const [gameState, setGameState] = useState<'LOBBY' | 'MATCHMAKING' | 'DUELING' | 'RESULT'>('LOBBY');
  const [selectedTier, setSelectedTier] = useState<WagerTier>(WAGER_TIERS[1]); // Default Rookie (5 coins)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');

  // Match state
  const [opponent, setOpponent] = useState<typeof PEER_OPPONENTS[0]>(PEER_OPPONENTS[0]);
  const [duelQuestions, setDuelQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userScore, setUserScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [opponentStatus, setOpponentStatus] = useState<'THINKING' | 'ANSWERED'>('THINKING');
  const [duelHistory, setDuelHistory] = useState<QuizDuel[]>([]);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Friend Challenge Room State
  const [activeFriendDuel, setActiveFriendDuel] = useState<QuizDuel | null>(null);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [joinRoomInput, setJoinRoomInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [friendChallengeTab, setFriendChallengeTab] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [roomCopied, setRoomCopied] = useState<boolean>(false);

  const subjects = CurriculumService.getSubjects(learner.board, learner.grade);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDuelHistory(StorageRLSLayer.getDuelsForLearner(learner.id));
  }, [learner.id]);

  // Deep-link check for ?room=... param on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setJoinRoomInput(roomParam);
        handleJoinRoom(roomParam);
      }
    }
  }, []);

  const handleCreateRoom = () => {
    if (selectedTier.entryCost > 0 && learner.coinBalance < selectedTier.entryCost) {
      alert(isHinglish ? `Aapke paas ${selectedTier.entryCost} coins nahi hain.` : `You need ${selectedTier.entryCost} coins to wager this tier.`);
      return;
    }
    const duel = StorageRLSLayer.createFriendChallenge(learner.id, selectedSubjectId, selectedTier.entryCost);
    setActiveFriendDuel(duel);
    setCreatedRoomCode(duel.roomCode || null);
  };

  const handleShareCreatedRoomWhatsApp = () => {
    if (!createdRoomCode) return;
    const link = `https://academiclevel.in/arena?room=${createdRoomCode}`;
    const text = `⚔️ *1v1 SYLLABUS QUIZ DUEL CHALLENGE!* ⚔️
👤 *Challenger:* ${learner.fullName || 'Scholar'}
📚 *Subject:* ${selectedSubjectId.toUpperCase()} (Class ${learner.grade})
🪙 *Win Pot:* +${selectedTier.winnerReward} Study Coins!

Maine 1v1 battle room banaya hai! Kya tu mujhe hara sakta hai?
👉 Tap to accept & battle: ${link}

Room Code: *${createdRoomCode}*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyRoomCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setRoomCopied(true);
    setTimeout(() => setRoomCopied(false), 2000);
  };

  const handleJoinRoom = (codeToJoin?: string) => {
    const code = (codeToJoin || joinRoomInput).trim().toUpperCase();
    if (!code) {
      setJoinError('Please enter a valid 6-digit Room Code');
      return;
    }
    const duel = StorageRLSLayer.getDuelByRoomCode(code);
    if (!duel) {
      setJoinError(isHinglish ? 'Room code nahi mila ya expire ho gaya.' : 'Room code not found or expired.');
      return;
    }
    setJoinError(null);
    setActiveFriendDuel(duel);
    setSelectedSubjectId(duel.subjectId || selectedSubjectId);

    setOpponent({
      name: duel.challengerName || 'Friend Challenger',
      location: 'India',
      accuracy: 0.8,
      avatar: '👑'
    });

    const qs = OfflineBankService.getQuestions(
      learner.board,
      learner.grade,
      duel.subjectId || selectedSubjectId,
      'FOUNDATION',
      5
    );
    setDuelQuestions(qs.slice(0, 5));
    setCurrentQIndex(0);
    setUserScore(0);
    setOpponentScore(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimeLeft(15);
    setGameState('DUELING');
  };

  const handleStartCreatedRoomBattle = () => {
    setOpponent({
      name: 'Classmate (Live Room)',
      location: 'WhatsApp Friend',
      accuracy: 0.8,
      avatar: '⚡'
    });
    const qs = OfflineBankService.getQuestions(
      learner.board,
      learner.grade,
      selectedSubjectId,
      'FOUNDATION',
      5
    );
    setDuelQuestions(qs.slice(0, 5));
    setCurrentQIndex(0);
    setUserScore(0);
    setOpponentScore(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimeLeft(15);
    setGameState('DUELING');
  };

  // Matchmaking effect
  useEffect(() => {
    if (gameState === 'MATCHMAKING') {
      const matchTimeout = setTimeout(() => {
        // Pick random peer
        const randomPeer = PEER_OPPONENTS[Math.floor(Math.random() * PEER_OPPONENTS.length)];
        setOpponent(randomPeer);

        // Fetch 5 questions from Curriculum / Bank
        const qs = OfflineBankService.getQuestions(
          learner.board,
          learner.grade,
          selectedSubjectId,
          'FOUNDATION',
          5
        );
        setDuelQuestions(qs.slice(0, 5));
        setCurrentQIndex(0);
        setUserScore(0);
        setOpponentScore(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setTimeLeft(15);
        setGameState('DUELING');
      }, 2000);

      return () => clearTimeout(matchTimeout);
    }
  }, [gameState, learner.board, learner.grade, selectedSubjectId]);

  // Question countdown timer & Opponent answering simulation
  useEffect(() => {
    if (gameState !== 'DUELING' || isAnswerSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setOpponentStatus('THINKING');

    // Opponent answers between 3 to 9 seconds
    const opponentThinkTime = 3000 + Math.random() * 6000;
    const opponentTimeout = setTimeout(() => {
      setOpponentStatus('ANSWERED');
      // Did opponent answer correctly?
      const willBeCorrect = Math.random() < opponent.accuracy;
      if (willBeCorrect) {
        setOpponentScore(prev => prev + 1);
      }
    }, opponentThinkTime);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(opponentTimeout);
    };
  }, [gameState, currentQIndex, isAnswerSubmitted]);

  const handleStartMatchmaking = () => {
    // Check coin balance if wagering coins
    if (selectedTier.entryCost > 0) {
      if ((learner.coinBalance || 0) < selectedTier.entryCost) {
        alert(
          isHinglish
            ? `Aapke paas paryapt Study Coins nahi hain! Is duel ke liye ${selectedTier.entryCost} coins chahiye, aapke paas ${learner.coinBalance || 0} hain.`
            : `Insufficient Study Coins! This duel requires ${selectedTier.entryCost} coins, but you have ${learner.coinBalance || 0}.`
        );
        return;
      }

      // Deduct entry wager
      CoinLedgerService.appendTransaction(learner.id, -selectedTier.entryCost, 'QUIZ_DUEL_ENTRY', {
        tier: selectedTier.id,
        wager: selectedTier.entryCost
      });
      onCoinsUpdated();
    }

    setGameState('MATCHMAKING');
  };

  const handleTimeExpired = () => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
  };

  const handleSubmitOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const currentQ = duelQuestions[currentQIndex];
    if (currentQ && idx === Number(currentQ.correctIndex)) {
      setUserScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < duelQuestions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(15);
    } else {
      // Duel finished!
      finishDuel();
    }
  };

  const finishDuel = () => {
    setGameState('RESULT');
    StorageRLSLayer.recordQuestProgress(learner.id, 'DUEL_PLAY');
    const didUserWin = userScore > opponentScore;
    const isTie = userScore === opponentScore;

    if (didUserWin) {
      // Payout prize!
      CoinLedgerService.appendTransaction(learner.id, selectedTier.winnerReward, 'QUIZ_DUEL_WIN', {
        tier: selectedTier.id,
        wager: selectedTier.entryCost,
        payout: selectedTier.winnerReward,
        opponent: opponent.name
      });
      onCoinsUpdated();
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    } else if (isTie && selectedTier.entryCost > 0) {
      // Refund wager on tie
      CoinLedgerService.appendTransaction(learner.id, selectedTier.entryCost, 'QUIZ_DUEL_WIN', {
        note: 'Tie refund',
        tier: selectedTier.id
      });
      onCoinsUpdated();
    }

    // Save duel record to history
    const record: QuizDuel = {
      id: 'duel_' + Date.now(),
      challengerId: learner.id,
      challengerName: learner.fullName,
      opponentId: 'peer_' + opponent.name.replace(/\s+/g, '_').toLowerCase(),
      opponentName: opponent.name,
      subjectId: selectedSubjectId,
      wagerCoins: selectedTier.entryCost,
      winnerId: didUserWin ? learner.id : isTie ? null : 'opponent',
      challengerScore: userScore,
      opponentScore: opponentScore,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };
    StorageRLSLayer.recordDuelResult(record);
    setDuelHistory(StorageRLSLayer.getDuelsForLearner(learner.id));
  };

  const handleShareDuelLink = () => {
    const duelUrl = `https://academiclevel.in/duel?ref=${learner.id}&code=AL-DUEL-${Math.floor(1000 + Math.random() * 9000)}`;
    const shareText = `⚔️ ${learner.fullName} has challenged you to a 1v1 Quiz Duel on AcademicLevel! Can you beat my score? Play here: ${duelUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  // 1. MATCHMAKING SCREEN
  if (gameState === 'MATCHMAKING') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <Swords className="w-12 h-12 text-indigo-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">
            {isHinglish ? 'Scholar Opponent Dhoonda Ja Raha Hai...' : 'Matching with Online Scholar...'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {isHinglish
              ? `Class ${learner.grade} ${learner.board} syllabus se 5 questions ready ho rahe hain. Prize: ${selectedTier.winnerReward} Study Coins!`
              : `Calibrating 5 questions from Class ${learner.grade} ${learner.board}. Winner takes ${selectedTier.winnerReward} Study Coins!`}
          </p>
        </div>
      </div>
    );
  }

  // 2. LIVE DUEL SCREEN
  if (gameState === 'DUELING' && duelQuestions.length > 0) {
    const currentQ = duelQuestions[currentQIndex];
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Top Battle HUD */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between">
            {/* User side */}
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-lg border-2 border-indigo-400 shadow-md">
                {learner.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-extrabold block truncate max-w-[100px] sm:max-w-[140px]">
                  {learner.fullName.split(' ')[0]} (You)
                </span>
                <span className="text-lg sm:text-2xl font-black text-indigo-400">
                  {userScore} / {duelQuestions.length}
                </span>
              </div>
            </div>

            {/* Timer Center */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Round {currentQIndex + 1}/5
              </span>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl border-2 transition-all mt-1 ${
                  timeLeft <= 5
                    ? 'border-rose-500 text-rose-400 bg-rose-950/60 animate-pulse'
                    : 'border-amber-400 text-amber-300 bg-slate-800'
                }`}
              >
                {timeLeft}s
              </div>
            </div>

            {/* Opponent side */}
            <div className="flex items-center space-x-3 text-right flex-row-reverse space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-lg border-2 border-rose-400 shadow-md">
                {opponent.avatar}
              </div>
              <div>
                <span className="text-xs sm:text-sm font-extrabold block truncate max-w-[100px] sm:max-w-[140px]">
                  {opponent.name.split(' ')[0]} ({opponent.location})
                </span>
                <span className="text-lg sm:text-2xl font-black text-rose-400">
                  {opponentScore} / {duelQuestions.length}
                </span>
              </div>
            </div>
          </div>

          {/* Opponent Activity Pill */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Pot: {selectedTier.winnerReward} Study Coins</span>
            </span>
            <span className="flex items-center space-x-1.5">
              {opponentStatus === 'THINKING' ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{opponent.name.split(' ')[0]} is solving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{opponent.name.split(' ')[0]} locked answer</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-slate-100 text-slate-700 rounded-full inline-block">
            {selectedSubjectId.toUpperCase()} • QUESTION {currentQIndex + 1}
          </span>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQ.text}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === Number(currentQ.correctIndex);

              let style = 'border-slate-200 hover:border-indigo-400 bg-white text-slate-800';
              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  style = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  style = 'border-2 border-rose-500 bg-rose-50 text-rose-950';
                } else {
                  style = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                style = 'border-2 border-indigo-600 bg-indigo-50 text-indigo-950 font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSubmitOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${style}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </div>
                  {isAnswerSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Post-Submit Action */}
          {isAnswerSubmitted && (
            <div className="pt-2">
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-indigo-600/25 active:scale-98"
              >
                <span>
                  {currentQIndex + 1 < duelQuestions.length
                    ? isHinglish
                      ? 'Agla Question Dekho →'
                      : 'Next Round →'
                    : isHinglish
                    ? 'Final Scorecard Dekho 🏆'
                    : 'View Final Duel Result 🏆'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. FINAL RESULT SCREEN
  if (gameState === 'RESULT') {
    const didUserWin = userScore > opponentScore;
    const isTie = userScore === opponentScore;

    return (
      <div className="max-w-xl mx-auto px-4 py-10 space-y-6 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-lg">
            {didUserWin ? '🏆' : isTie ? '🤝' : '⚔️'}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {didUserWin
                ? isHinglish
                  ? 'Shandar Jeet! Match Jeet Gaye!'
                  : 'Victory! You Won the Duel!'
                : isTie
                ? isHinglish
                  ? 'Tough Fight! Match Tie Hua!'
                  : 'Honorable Draw!'
                : isHinglish
                ? 'Acche Koshish! Opponent Jeet Gaya'
                : 'Defeat! Better Luck Next Duel'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {didUserWin
                ? isHinglish
                  ? `Badhai ho! Aapne ${opponent.name} ko hara kar ${selectedTier.winnerReward} Study Coins jeete!`
                  : `Incredible skill! You defeated ${opponent.name} and claimed the ${selectedTier.winnerReward} Study Coin pot!`
                : isTie
                ? isHinglish
                  ? `Dono ka score barabar raha (${userScore} - ${opponentScore}). Entry coins wapas refund ho gaye.`
                  : `Evenly matched (${userScore} - ${opponentScore}). Entry wager refunded safely.`
                : isHinglish
                ? `${opponent.name} ne yeh match jeet liya. Practice jaari rakhein aur dubara challenge karein!`
                : `${opponent.name} clinched this clash. Study your Mistake Vault and challenge again!`}
            </p>
          </div>

          {/* Score comparison pill */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around font-black text-lg">
            <div>
              <span className="text-xs text-slate-500 font-bold block">Aapka Score</span>
              <span className="text-indigo-600 text-2xl">{userScore}/5</span>
            </div>
            <div className="text-slate-300 font-mono text-xl">VS</div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">{opponent.name.split(' ')[0]}</span>
              <span className="text-rose-600 text-2xl">{opponentScore}/5</span>
            </div>
          </div>

          {didUserWin && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-center space-x-2 font-black text-sm">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>+{selectedTier.winnerReward} Study Coins Credited to Ledger!</span>
              <StudyCoinIcon className="w-5 h-5 inline-block" glow />
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setGameState('LOBBY')}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-md"
            >
              {isHinglish ? 'Naya Duel Khele' : 'Play Another Duel'}
            </button>
            <button
              onClick={handleShareDuelLink}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>{isHinglish ? 'Classmate ko Challenge Karo' : 'Challenge via WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. LOBBY VIEW (Default)
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-800/40 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>{isHinglish ? 'Live 1v1 Quiz Arena' : 'Live 1v1 Quiz Arena'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {isHinglish ? '1v1 Quiz Clash: Coin Arena ⚔️' : '1v1 Quiz Clash: Coin Arena ⚔️'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isHinglish
              ? 'Apne syllabus par online scholars se live 5-question blitz khelein ya friend ko challenge karein. Fast answers aur high score se jeetein coin pot!'
              : 'Go head-to-head in a fast 5-question syllabus blitz against online peers or invite friends via WhatsApp. Speed + accuracy takes the coin pot!'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleStartMatchmaking}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isHinglish ? 'Quick Match Shuru Karo' : 'Start Quick Match'}</span>
            </button>
            <button
              onClick={handleShareDuelLink}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{isHinglish ? 'Friend ko Challenge Karo' : 'Challenge a Classmate'}</span>
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-sm transition-all cursor-pointer"
            >
              {isHinglish ? '← Dashboard' : '← Back to Dashboard'}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp 1v1 Friend Challenge Room */}
      <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/40 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                {isHinglish ? 'Viral Friend Mode' : 'Direct Friend Challenge'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isHinglish ? 'WhatsApp 1v1 Friend Room Banayein 💬' : 'Challenge a Classmate via WhatsApp 💬'}
              </h3>
            </div>
          </div>

          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 shrink-0">
            <button
              onClick={() => setFriendChallengeTab('CREATE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                friendChallengeTab === 'CREATE' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              {isHinglish ? 'Room Create Karein' : 'Create Room'}
            </button>
            <button
              onClick={() => setFriendChallengeTab('JOIN')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                friendChallengeTab === 'JOIN' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              {isHinglish ? 'Room Code Enter Karein' : 'Join Room'}
            </button>
          </div>
        </div>

        {friendChallengeTab === 'CREATE' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              {isHinglish
                ? `Apne dost ko Class ${learner.grade} ${selectedSubjectId.toUpperCase()} me 1v1 quiz challenge karein! Wager: ${selectedTier.entryCost} Coins (Win Pot: +${selectedTier.winnerReward} Coins).`
                : `Challenge your friend to a 1v1 battle in Class ${learner.grade} ${selectedSubjectId.toUpperCase()}! Pot: +${selectedTier.winnerReward} Coins.`}
            </p>

            {createdRoomCode ? (
              <div className="bg-black/40 border border-emerald-500/40 rounded-2xl p-4 space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-300">Room Code:</span>
                    <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-widest bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/30">
                      {createdRoomCode}
                    </span>
                    <button
                      onClick={handleCopyRoomCode}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                    >
                      {roomCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleShareCreatedRoomWhatsApp}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isHinglish ? 'WhatsApp par Send Karein 📱' : 'Share on WhatsApp 📱'}</span>
                    </button>
                    <button
                      onClick={handleStartCreatedRoomBattle}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isHinglish ? 'Battle Shuru Karo' : 'Enter Battle'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCreateRoom}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isHinglish ? 'Room Generate Karein & WhatsApp Link Payein' : 'Generate Room Code & WhatsApp Link'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              {isHinglish
                ? 'Apne dost ke dwara bheja gaya 6-digit Room Code (e.g. AL-4821) yahan daalein:'
                : 'Enter the 6-digit challenge code sent by your classmate:'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="text"
                placeholder="e.g. AL-7842"
                value={joinRoomInput}
                onChange={e => setJoinRoomInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-sm font-mono tracking-wider focus:outline-none focus:border-emerald-400 uppercase"
              />
              <button
                onClick={() => handleJoinRoom()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md"
              >
                <Swords className="w-4 h-4" />
                <span>{isHinglish ? 'Room Join Karein' : 'Join & Battle'}</span>
              </button>
            </div>
            {joinError && <p className="text-xs text-rose-400 font-bold">{joinError}</p>}
          </div>
        )}
      </div>

      {/* Select Wager Tier */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>{isHinglish ? '1. Coin Wager Tier Chunein' : '1. Select Wager Tier'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WAGER_TIERS.map(tier => {
            const isSelected = selectedTier.id === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-indigo-600 bg-indigo-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-indigo-300 bg-white'
                }`}
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {tier.badge}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-2">{tier.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Entry: {tier.entryCost === 0 ? 'FREE' : `${tier.entryCost} Coins`}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-amber-700">
                  <span>Win Pot:</span>
                  <span className="flex items-center space-x-1">
                    <span>+{tier.winnerReward}</span>
                    <StudyCoinIcon className="w-3.5 h-3.5 inline-block" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Select Subject */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>{isHinglish ? '2. Subject Select Karein' : '2. Select Battle Subject'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {subjects.map((s: Subject) => {
            const isSelected = selectedSubjectId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-indigo-600 bg-indigo-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-indigo-300 bg-white'
                }`}
              >
                <span className="text-2xl block">{s.icon}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{s.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Class {learner.grade} Syllabus</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Duels Log */}
      {duelHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            {isHinglish ? 'Recent Duel History' : 'Recent Duel History'}
          </h3>
          <div className="divide-y divide-slate-100">
            {duelHistory.slice(0, 5).map(d => {
              const won = d.winnerId === learner.id;
              const tie = d.winnerId === null;
              return (
                <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{won ? '🏆' : tie ? '🤝' : '⚔️'}</span>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        vs {d.opponentName} ({d.subjectId?.toUpperCase()})
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black ${won ? 'text-emerald-600' : tie ? 'text-slate-600' : 'text-rose-600'}`}>
                      {won ? 'WON' : tie ? 'TIE' : 'LOST'} ({d.challengerScore}-{d.opponentScore})
                    </span>
                    <span className="text-slate-400 text-[10px] block">
                      Wager: {d.wagerCoins} Coins
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
