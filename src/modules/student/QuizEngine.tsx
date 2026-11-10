import React, { useState, useEffect, useCallback } from 'react';
import { Question, Board, Grade, LevelNode, Learner, QuizAttempt, LevelProgress } from '../../core/types';
import { OfflineBankService } from '../../services/offlineBankService';
import { HybridQuizService } from '../../services/hybridQuizService';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { QuotaService } from '../../services/quotaService';
import { CertificateService } from '../../services/certificateService';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { ApiClient } from '../../core/api/apiClient';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface QuizEngineProps {
  board: Board;
  grade: Grade;
  subjectId: string;
  levelNode: LevelNode;
  learner: Learner;
  onFinish: () => void;
  onOpenNovaAi: (question: Question, chosenIndex: number) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  board,
  grade,
  subjectId,
  levelNode,
  learner,
  onFinish,
  onOpenNovaAi,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(true);
  const [quizSource, setQuizSource] = useState<'GEMINI_LIVE' | 'CURATED_OFFLINE'>('CURATED_OFFLINE');
  const [aiNotice, setAiNotice] = useState<string>('');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Anti-Cheat Timer: Minimum 3 seconds dwell time per question
  const [questionDwellSeconds, setQuestionDwellSeconds] = useState<number>(0);
  const [antiCheatViolations, setAntiCheatViolations] = useState<number>(0);

  // Level Completion & Reward state
  const [rewardResult, setRewardResult] = useState<{
    awarded: boolean;
    reason: string;
    coinsEarned: number;
  } | null>(null);

  const loadQuizQuestions = useCallback(async () => {
    setIsLoadingQuiz(true);
    try {
      const res = await HybridQuizService.getQuestions(board, grade, subjectId, levelNode, 5);
      setQuestions(res.questions);
      setQuizSource(res.source);
      setAiNotice(res.notice || '');
    } catch {
      const fallback = OfflineBankService.getQuestions(board, grade, subjectId, levelNode);
      setQuestions(fallback);
      setQuizSource('CURATED_OFFLINE');
      setAiNotice('Loaded from verified offline syllabus bank');
    } finally {
      setIsLoadingQuiz(false);
      setCurrentIndex(0);
      setScore(0);
      setIsCompleted(false);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuestionDwellSeconds(0);
    }
  }, [board, grade, subjectId, levelNode]);

  useEffect(() => {
    loadQuizQuestions();
  }, [loadQuizQuestions]);

  // Dwell timer effect
  useEffect(() => {
    if (isCompleted || isAnswerSubmitted || isLoadingQuiz) return;

    const timer = setInterval(() => {
      setQuestionDwellSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnswerSubmitted, isCompleted, isLoadingQuiz]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;

    // Check anti-cheat minimum dwell time (3 seconds)
    if (questionDwellSeconds < 3) {
      setAntiCheatViolations(prev => prev + 1);
    }

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuestionDwellSeconds(0);
    } else {
      // Quiz Finished
      setIsCompleted(true);

      const finalScore = score;
      const totalQuestions = questions.length;
      const accuracyPercent = Math.round((finalScore / totalQuestions) * 100);
      const passed = accuracyPercent >= 70;

      // Anti-cheat verification
      const antiCheatPassed = antiCheatViolations === 0;

      // 1. Record Quota & Attempt Counter
      QuotaService.recordQuizCompletion(learner.id);

      // Qualify referral if referee's first quiz
      CoinLedgerService.qualifyReferralOnFirstQuiz(learner.id);

      // 2. Build & Persist Quiz Attempt
      const attempt: QuizAttempt = {
        id: 'qa_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        learnerId: learner.id,
        board,
        grade,
        subjectId,
        levelNode,
        totalQuestions,
        correctCount: finalScore,
        accuracyPercent,
        totalDurationSeconds: Math.max(10, questionDwellSeconds),
        antiCheatPassed,
        completedAt: new Date().toISOString()
      };
      StorageRLSLayer.recordQuizAttempt(attempt);
      ApiClient.recordQuizAttempt(attempt).catch(() => {});

      // 3. Save Level Mastery Progress
      const existingList = StorageRLSLayer.getProgressForLearner(learner.id, learner.id);
      const existingProgress = existingList.find(
        p => p.board === board && p.grade === grade && p.subjectId === subjectId && p.levelNode === levelNode
      );
      const isNewBest = !existingProgress || accuracyPercent > (existingProgress.bestScorePercent || 0);

      const progressRecord: LevelProgress = {
        learnerId: learner.id,
        board,
        grade,
        subjectId,
        levelNode,
        isCompleted: passed || Boolean(existingProgress?.isCompleted),
        bestScorePercent: isNewBest ? accuracyPercent : (existingProgress?.bestScorePercent ?? accuracyPercent),
        coinRewardClaimed: Boolean(existingProgress?.coinRewardClaimed || (passed && antiCheatPassed)),
        completedAt: passed ? (existingProgress?.completedAt || new Date().toISOString()) : existingProgress?.completedAt,
        calendarYear: new Date().getFullYear()
      };
      StorageRLSLayer.saveProgress(progressRecord);
      ApiClient.recordLevelProgress(progressRecord).catch(() => {});

      // 4. Award Level Completion Reward if passed
      if (passed) {
        QuotaService.recordLevelCompletion(learner.id);

        const reward = CoinLedgerService.awardLevelCompletionReward(
          learner.id,
          board,
          grade,
          subjectId,
          levelNode,
          accuracyPercent,
          antiCheatPassed
        );
        setRewardResult(reward);

        // 5. Issue verifiable certificate
        const cert = CertificateService.issueLevelCertificate(
          learner.id,
          learner.fullName,
          board,
          grade,
          subjectId.toUpperCase(),
          levelNode
        );
        ApiClient.issueCertificate(cert).catch(() => {});

        // Trigger Confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // Confetti fallback
        }
      }
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center text-slate-100 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30 animate-pulse">
          <Cpu className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Synthesizing Assessment Nodes...</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
          Engaging AcademicLevel Hybrid Engine — combining Live Gemini AI with verified CBSE/ICSE syllabus guardrails.
        </p>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
        <p className="text-sm">Loading syllabus assessment nodes...</p>
      </div>
    );
  }

  // Quiz Completed View
  if (isCompleted) {
    const accuracy = Math.round((score / questions.length) * 100);
    const passed = accuracy >= 70;

    return (
      <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center text-slate-100">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Award className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center space-x-2 mb-2">
          {quizSource === 'GEMINI_LIVE' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-950/60 border border-purple-500/40 text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Live Gemini AI Quiz Completed</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Syllabus Bank Completed</span>
            </span>
          )}
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
          Assessment Complete • {board} Class {grade}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 mb-2">
          {passed ? 'Level Mastery Achieved! 🎉' : 'Assessment Finished'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
          You scored <strong className="text-white">{score}</strong> out of <strong className="text-white">{questions.length}</strong> questions ({accuracy}% accuracy).
        </p>

        {/* Reward Status Banner */}
        {rewardResult?.awarded && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center space-x-3 text-amber-300">
            <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-400 animate-spin-slow" />
            <div className="text-xs text-left">
              <p className="font-bold">+25 Study Coins Credited to Ledger!</p>
              <p className="text-amber-400/80">Level certificate generated and secured in your Certificate Vault.</p>
            </div>
          </div>
        )}

        {/* Anti-cheat audit badge */}
        <div className="inline-flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-800 mb-8">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Anti-Cheat Verification: {antiCheatViolations === 0 ? 'Passed (Full Integrity)' : 'Anomalous speedrun detected'}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => loadQuizQuestions()}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Another AI Practice Set</span>
          </button>
          <button
            onClick={onFinish}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all"
          >
            Continue Learning Journey
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
              {board} • Class {grade} • {subjectId.toUpperCase()} • {levelNode}
            </span>

            {/* Hybrid Source Badge */}
            {quizSource === 'GEMINI_LIVE' ? (
              <span
                title="Synthesized dynamically by Google Gemini 1.5 Flash"
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300"
              >
                <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                <span>Live Gemini AI</span>
              </span>
            ) : (
              <span
                title="Curated, 100% board syllabus verified offline bank"
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Syllabus Bank</span>
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-white">
            Question {currentIndex + 1} of {questions.length}
          </h3>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadQuizQuestions()}
            title="Synthesize new questions"
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">New AI Set</span>
          </button>

          {/* Anti-cheat minimum timer badge */}
          <div className="flex items-center space-x-1 text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{questionDwellSeconds}s</span>
          </div>

          <div className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/50">
            Score: {score}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full inline-block">
            {currentQuestion.topicTag}
          </span>
          {aiNotice && (
            <span className="text-[10px] text-slate-500 italic hidden sm:inline">
              • {aiNotice}
            </span>
          )}
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {currentQuestion.text}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          let btnStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-200';

          if (selectedOption === idx) {
            btnStyle = 'border-indigo-500 bg-indigo-950/40 text-white';
          }

          if (isAnswerSubmitted) {
            if (idx === currentQuestion.correctIndex) {
              btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
            } else if (selectedOption === idx) {
              btnStyle = 'border-red-500 bg-red-950/40 text-red-200';
            } else {
              btnStyle = 'border-slate-800/40 bg-slate-950/20 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswerSubmitted}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              {isAnswerSubmitted && selectedOption === idx && idx !== currentQuestion.correctIndex && (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Socratic Helper */}
      {isAnswerSubmitted && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3 animate-in fade-in duration-200">
          <div>
            <span className="font-bold text-indigo-400 block mb-1">Step-by-Step Solution:</span>
            <p className="text-slate-300 whitespace-pre-line">{currentQuestion.explanation}</p>
          </div>

          <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-400">💡 Hint / Exam Tip: {currentQuestion.hint}</span>
            <button
              onClick={() => onOpenNovaAi(currentQuestion, selectedOption!)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Ask Nova AI Tutor to Explain Socratically</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <span className="text-[11px] text-slate-500">
          {questionDwellSeconds < 3 && !isAnswerSubmitted ? (
            <span className="text-amber-400/80">Reading dwell guard: {3 - questionDwellSeconds}s</span>
          ) : (
            <span>Anti-cheat timer active</span>
          )}
        </span>

        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || questionDwellSeconds < 3}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center space-x-1.5"
          >
            <span>Submit Answer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center space-x-1.5"
          >
            <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
