import React, { useState, useEffect } from 'react';
import { Learner, MistakeVaultEntry, Question } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Bot,
  Trophy,
  Filter,
  Flame,
  Award
} from 'lucide-react';

interface MistakeVaultProps {
  learner: Learner;
  onOpenNovaAi: (context?: { q: Question; chosenIdx: number }) => void;
  onCoinsUpdated: () => void;
  onBackToDashboard: () => void;
}

export const MistakeVault: React.FC<MistakeVaultProps> = ({
  learner,
  onOpenNovaAi,
  onCoinsUpdated,
  onBackToDashboard
}) => {
  const { language } = useLanguage();
  const isHinglish = language === 'hi';

  const makeQuestionObj = (item: MistakeVaultEntry): Question => ({
    id: item.questionId,
    board: item.board as any,
    grade: item.grade as any,
    subjectId: item.subjectId,
    levelNode: 'FOUNDATION',
    text: item.questionText,
    options: item.options,
    correctIndex: item.correctOptionIndex,
    explanation: item.explanation,
    hint: '',
    difficulty: 'MEDIUM',
    topicTag: item.chapterId || item.subjectId
  });

  const [mistakes, setMistakes] = useState<MistakeVaultEntry[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'MASTERED'>('ACTIVE');

  // Redemption Run state
  const [isRedemptionMode, setIsRedemptionMode] = useState<boolean>(false);
  const [redemptionIndex, setRedemptionIndex] = useState<number>(0);
  const [selectedRedemptionOption, setSelectedRedemptionOption] = useState<number | null>(null);
  const [redemptionSubmitted, setRedemptionSubmitted] = useState<boolean>(false);
  const [redemptionFeedback, setRedemptionFeedback] = useState<{
    isCorrect: boolean;
    isNowMastered: boolean;
    consecutiveCorrect: number;
    coinsAwarded: number;
  } | null>(null);

  const loadMistakes = () => {
    const list = StorageRLSLayer.getMistakesForLearner(learner.id);
    setMistakes(list);
  };

  useEffect(() => {
    loadMistakes();
  }, [learner.id]);

  const activeMistakes = mistakes.filter(m => !m.isMastered);
  const masteredMistakes = mistakes.filter(m => m.isMastered);

  const subjects = Array.from(new Set(mistakes.map(m => m.subjectId).filter(Boolean)));

  const displayedMistakes = (activeTab === 'ACTIVE' ? activeMistakes : masteredMistakes).filter(m => {
    if (selectedSubject === 'ALL') return true;
    return m.subjectId === selectedSubject;
  });

  const redemptionQueue = activeMistakes.filter(m => {
    if (selectedSubject === 'ALL') return true;
    return m.subjectId === selectedSubject;
  });

  // Start Redemption Run
  const handleStartRedemption = () => {
    if (redemptionQueue.length === 0) return;
    setIsRedemptionMode(true);
    setRedemptionIndex(0);
    setSelectedRedemptionOption(null);
    setRedemptionSubmitted(false);
    setRedemptionFeedback(null);
  };

  const handleRedemptionSubmit = () => {
    if (selectedRedemptionOption === null || redemptionIndex >= redemptionQueue.length) return;
    const currentItem = redemptionQueue[redemptionIndex];
    const isCorrect = selectedRedemptionOption === currentItem.correctOptionIndex;

    const res = StorageRLSLayer.recordMistakeAttempt(learner.id, currentItem.id, isCorrect);
    StorageRLSLayer.recordQuestProgress(learner.id, 'VAULT_PRACTICE');

    if (res.coinsAwarded > 0) {
      CoinLedgerService.appendTransaction(learner.id, res.coinsAwarded, 'MISTAKE_VAULT_MASTERY', {
        questionId: currentItem.questionId,
        subjectId: currentItem.subjectId
      });
      onCoinsUpdated();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    setRedemptionSubmitted(true);
    setRedemptionFeedback({
      isCorrect,
      isNowMastered: res.isNowMastered,
      consecutiveCorrect: res.consecutiveCorrect,
      coinsAwarded: res.coinsAwarded
    });
    loadMistakes();
  };

  const handleNextRedemption = () => {
    if (redemptionIndex + 1 < redemptionQueue.length) {
      setRedemptionIndex(prev => prev + 1);
      setSelectedRedemptionOption(null);
      setRedemptionSubmitted(false);
      setRedemptionFeedback(null);
    } else {
      setIsRedemptionMode(false);
      setSelectedRedemptionOption(null);
      setRedemptionSubmitted(false);
      setRedemptionFeedback(null);
    }
  };

  // RENDER: REDEMPTION RUN MODE
  if (isRedemptionMode && redemptionQueue.length > 0) {
    const currentItem = redemptionQueue[redemptionIndex];
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5 animate-spin-slow" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {isHinglish ? 'Mistake Redemption Run' : 'Mistake Redemption Run'}
              </h2>
              <p className="text-xs text-slate-500">
                {isHinglish
                  ? `Question ${redemptionIndex + 1} of ${redemptionQueue.length} • 2 baar sahi karne par +10 Coins!`
                  : `Question ${redemptionIndex + 1} of ${redemptionQueue.length} • Answer correctly 2x to graduate & earn +10 Coins!`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRedemptionMode(false)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {isHinglish ? 'Run Band Karo' : 'Exit Run'}
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full">
              {currentItem.subjectId?.toUpperCase() || 'SUBJECT'}
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {isHinglish ? 'Consecutive Mastery:' : 'Consecutive Correct:'} {currentItem.consecutiveCorrect}/2
              </span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentItem.questionText}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentItem.options.map((opt, idx) => {
              const isSelected = selectedRedemptionOption === idx;
              const isCorrectOpt = idx === currentItem.correctOptionIndex;

              let btnStyle = 'border-slate-200 hover:border-indigo-400 bg-white text-slate-800';
              if (redemptionSubmitted) {
                if (isCorrectOpt) {
                  btnStyle = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'border-2 border-rose-500 bg-rose-50 text-rose-950';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'border-2 border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={redemptionSubmitted}
                  onClick={() => setSelectedRedemptionOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-700">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </div>
                  {redemptionSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {redemptionSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Actions */}
          {!redemptionSubmitted ? (
            <button
              disabled={selectedRedemptionOption === null}
              onClick={handleRedemptionSubmit}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                selectedRedemptionOption !== null
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/25 active:scale-98'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{isHinglish ? 'Answer Check Karo' : 'Check Redemption Answer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              {redemptionFeedback?.isNowMastered ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold">
                    <Trophy className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">
                      {isHinglish ? '🎉 Mastery Achieved! +10 Coins Jeete!' : '🎉 Mastery Achieved! +10 Coins Earned!'}
                    </h4>
                    <p className="text-xs text-amber-800">
                      {isHinglish
                        ? 'Yeh question aapke mistake notebook se graduate ho gaya!'
                        : 'You successfully answered this question correctly 2x in a row. It is now graduated from your mistake vault!'}
                    </p>
                  </div>
                </div>
              ) : redemptionFeedback?.isCorrect ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-bold">
                    {isHinglish
                      ? `Sahi jawab! Streak: ${redemptionFeedback.consecutiveCorrect}/2. Ek baar aur sahi karne par +10 coins milenge!`
                      : `Great job! Current streak: ${redemptionFeedback.consecutiveCorrect}/2. Answer correctly once more to master & claim +10 coins!`}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <p className="text-xs font-bold">
                    {isHinglish
                      ? 'Abhi bhi galat ho gaya. Fikar mat karo, explanation padhein aur dubara koshish karein!'
                      : 'Still missed. Review the explanation below and try again on the next pass!'}
                  </p>
                </div>
              )}

              {/* Step by Step Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <span className="font-extrabold text-slate-900 uppercase tracking-wider block">
                  {isHinglish ? 'Explanation & Concept Breakdown:' : 'Explanation & Concept Breakdown:'}
                </span>
                <p className="leading-relaxed whitespace-pre-line">{currentItem.explanation}</p>
                <button
                  onClick={() =>
                    onOpenNovaAi({
                      q: makeQuestionObj(currentItem),
                      chosenIdx: selectedRedemptionOption ?? currentItem.chosenOptionIndex
                    })
                  }
                  className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold transition-colors cursor-pointer text-xs"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isHinglish ? 'Nova AI se is mistake ko discuss karo' : 'Discuss this mistake with Nova AI'}</span>
                </button>
              </div>

              <button
                onClick={handleNextRedemption}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
              >
                <span>
                  {redemptionIndex + 1 < redemptionQueue.length
                    ? isHinglish
                      ? 'Agla Question Dekho →'
                      : 'Next Question →'
                    : isHinglish
                    ? 'Run Khatam Karo'
                    : 'Finish Redemption Run'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER: DEFAULT NOTEBOOK VIEW
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-800/40 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>{isHinglish ? 'Smart Error Notebook' : 'Smart Error Notebook (Cuo Ti Ben)'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {isHinglish ? 'Aapka Mistake Vault' : 'Your Personal Mistake Vault'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isHinglish
              ? 'Quiz mein galat hue sabhi questions yahan automatically save hote hain. 2 baar sahi solve karke master karo aur har question par +10 Study Coins jeeto!'
              : 'Every tricky question you miss during quizzes is automatically captured here. Re-attempt them in a Redemption Run, graduate them with 2 consecutive correct answers, and earn +10 Study Coins per mastery!'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              disabled={activeMistakes.length === 0}
              onClick={handleStartRedemption}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer ${
                activeMistakes.length > 0
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 shadow-amber-500/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {isHinglish
                  ? `Redemption Run Shuru Karo (${activeMistakes.length})`
                  : `Start Redemption Run (${activeMistakes.length})`}
              </span>
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              {isHinglish ? '← Dashboard Wapas' : '← Back to Dashboard'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {isHinglish ? 'Active Mistakes' : 'Pending Mistakes'}
          </span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {activeMistakes.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isHinglish ? 'Jo abhi master karne baaki hain' : 'Need 2 consecutive correct'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {isHinglish ? 'Mastered & Graduated' : 'Mastered & Cleared'}
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {masteredMistakes.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isHinglish ? 'Completely solved 2x in a row' : 'Purged from error notebook'}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isHinglish ? 'Coins Earned Here' : 'Mastery Bounty'}
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 flex items-center space-x-1.5">
              <span>{masteredMistakes.length * 10}</span>
              <StudyCoinIcon className="w-5 h-5 inline-block" glow />
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              +10 Coins per question
            </span>
          </div>
          <Award className="w-8 h-8 text-amber-500 opacity-60" />
        </div>
      </div>

      {/* Tabs and Subject Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Active vs Mastered tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-rose-50 border border-rose-300 text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isHinglish ? `Active Tricky Questions (${activeMistakes.length})` : `Active Mistakes (${activeMistakes.length})`}
          </button>
          <button
            onClick={() => setActiveTab('MASTERED')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'MASTERED'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isHinglish ? `Graduated (${masteredMistakes.length})` : `Graduated (${masteredMistakes.length})`}
          </button>
        </div>

        {/* Subject Filter Dropdown / Pills */}
        {subjects.length > 0 && (
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSubject('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedSubject === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Subjects
            </button>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer shrink-0 ${
                  selectedSubject === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mistake Cards List */}
      {displayedMistakes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            {activeTab === 'ACTIVE'
              ? isHinglish
                ? 'Koi active mistake nahi hai!'
                : 'Zero active mistakes in this filter!'
              : isHinglish
              ? 'Abhi tak koi question graduate nahi hua.'
              : 'No questions graduated yet.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'ACTIVE'
              ? isHinglish
                ? 'Aapne sabhi tricky questions master kar liye ya abhi tak koi quiz miss nahi kiya. Practice jari rakho!'
                : 'You have either cleared all mistakes or answered everything correctly. Keep up the high accuracy!'
              : isHinglish
              ? 'Active mistakes mein Redemption Run karke 2 baar sahi answer dein aur questions ko graduate karein!'
              : 'Run a Redemption Run on your active mistakes to answer them correctly twice and graduate them here!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMistakes.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {item.subjectId?.toUpperCase() || 'SUBJECT'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Missed {item.mistakeCount}x
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold">
                  {item.isMastered ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isHinglish ? 'Mastered (+10 Coins)' : 'Mastered (+10 Coins)'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      <span>Progress: {item.consecutiveCorrect}/2</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {item.questionText}
              </p>

              {/* Show What you chose vs Correct */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-rose-800">
                      {isHinglish ? 'Aapne chuna tha:' : 'What you chose:'}
                    </span>
                    <span>{item.options[item.chosenOptionIndex] || 'Selected Option'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-emerald-800">
                      {isHinglish ? 'Sahi option:' : 'Correct option:'}
                    </span>
                    <span>{item.options[item.correctOptionIndex]}</span>
                  </div>
                </div>
              </div>

              {/* Concept explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[10px]">
                  Concept Note:
                </span>
                <p>{item.explanation}</p>
              </div>

              {/* Action: Ask Nova */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() =>
                    onOpenNovaAi({
                      q: makeQuestionObj(item),
                      chosenIdx: item.chosenOptionIndex
                    })
                  }
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isHinglish ? 'Nova AI se samjho' : 'Explain with Nova AI'}</span>
                </button>

                {!item.isMastered && (
                  <button
                    onClick={() => {
                      setSelectedSubject(item.subjectId);
                      handleStartRedemption();
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-indigo-600" />
                    <span>{isHinglish ? 'Isse Solve Karo' : 'Attempt This'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
