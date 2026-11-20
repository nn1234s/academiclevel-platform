import React, { useState, useEffect, useCallback } from 'react';
import { Question, Board, Grade, LevelNode, Learner, QuizAttempt, LevelProgress, MailboxMessage, QuizReportDetail } from '../../core/types';
import { OfflineBankService } from '../../services/offlineBankService';
import { HybridQuizService } from '../../services/hybridQuizService';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { QuotaService } from '../../services/quotaService';
import { CertificateService } from '../../services/certificateService';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { ApiClient } from '../../core/api/apiClient';
import { useAuth } from '../../core/auth/AuthContext';
import { getClassTheme } from '../../core/theme/classThemes';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
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
  Cpu,
  Target,
  Flame,
  Atom,
  BookOpen,
  Mail,
  Zap
} from 'lucide-react';

interface QuizEngineProps {
  board: Board;
  grade: Grade;
  subjectId: string;
  levelNode: LevelNode;
  learner: Learner;
  onFinish: () => void;
  onOpenNovaAi: (question: Question, chosenIndex: number) => void;
  onOpenMailbox?: (reportId?: string) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  board,
  grade,
  subjectId,
  levelNode,
  learner,
  onFinish,
  onOpenNovaAi,
  onOpenMailbox,
}) => {
  const { refreshCurrentLearner } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(true);
  const [quizSource, setQuizSource] = useState<'GEMINI_LIVE' | 'CURATED_OFFLINE'>('CURATED_OFFLINE');
  const [aiNotice, setAiNotice] = useState<string>('');

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Diagnostic Answer Log for Mailbox Report Generation
  interface AnswerLog {
    question: Question;
    chosenIndex: number;
    isCorrect: boolean;
    dwellSeconds: number;
  }
  const [answersLog, setAnswersLog] = useState<AnswerLog[]>([]);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  // Anti-Cheat Timer: Minimum 3 seconds dwell time per question
  const [questionDwellSeconds, setQuestionDwellSeconds] = useState<number>(0);
  const [antiCheatViolations, setAntiCheatViolations] = useState<number>(0);

  // Level Completion & Reward state
  const [rewardResult, setRewardResult] = useState<{
    awarded: boolean;
    reason: string;
    coinsEarned: number;
  } | null>(null);

  // Daily Quiz Quota & Exam Mode
  const [examMode, setExamModeState] = useState<boolean>(Boolean(learner.examModeEnabled));
  useEffect(() => {
    setExamModeState(Boolean(learner.examModeEnabled));
  }, [learner.examModeEnabled]);

  const dailyStatus = QuotaService.getDailyQuizStatus(learner, examMode);

  const handleToggleExamMode = (targetState?: boolean) => {
    const next = targetState !== undefined ? targetState : !examMode;
    setExamModeState(next);
    QuotaService.toggleExamMode(learner.id, next);
    refreshCurrentLearner();
  };

  const loadQuizQuestions = useCallback(async () => {
    setIsLoadingQuiz(true);
    try {
      const res = await HybridQuizService.getQuestions(board, grade, subjectId, levelNode, 5);
      setQuestions(res.questions);
      setQuizSource(res.source);
      setAiNotice(res.notice || '');
    } catch {
      const fallback = await OfflineBankService.fetchServerQuestions(board, grade, subjectId, levelNode, 5);
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
      setAnswersLog([]);
      setGeneratedReportId(null);
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

    // Check anti-cheat minimum dwell time (1 second bot-prevention gate)
    if (questionDwellSeconds < 1) {
      setAntiCheatViolations(prev => prev + 1);
    }

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswersLog(prev => [
      ...prev.filter(a => a.question.id !== currentQuestion.id),
      {
        question: currentQuestion,
        chosenIndex: selectedOption,
        isCorrect,
        dwellSeconds: Math.max(1, questionDwellSeconds)
      }
    ]);

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
        coinRewardClaimed: Boolean(existingProgress?.coinRewardClaimed),
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

      // 6. Generate & Deliver In-Depth Quiz Diagnostic Report to Student Mailbox
      const allAnswers = answersLog.some(a => a.question.id === currentQuestion.id)
        ? answersLog
        : [
            ...answersLog,
            {
              question: currentQuestion,
              chosenIndex: selectedOption ?? -1,
              isCorrect: (selectedOption ?? -1) === currentQuestion.correctIndex,
              dwellSeconds: Math.max(1, questionDwellSeconds)
            }
          ];

      const masteredTopics = Array.from(
        new Set(allAnswers.filter(a => a.isCorrect).map(a => a.question.topicTag || 'Core Concept'))
      );
      const weakTopics = Array.from(
        new Set(allAnswers.filter(a => !a.isCorrect).map(a => a.question.topicTag || 'Core Concept'))
      );
      const totalDwell = allAnswers.reduce((sum, a) => sum + (a.dwellSeconds || 0), 0);

      let aiFeedback = '';
      if (accuracyPercent === 100) {
        aiFeedback = `🌟 Flawless Mastery! You achieved 100% accuracy in ${board} Class ${grade} ${subjectId.toUpperCase()} (${levelNode}). Outstanding conceptual clarity across ${masteredTopics.join(', ')}!`;
      } else if (accuracyPercent >= 70) {
        aiFeedback = `🎉 Great job achieving ${accuracyPercent}%! You demonstrated strong mastery in ${masteredTopics.join(', ')}. ${weakTopics.length > 0 ? `To aim for 100%, consider reviewing ${weakTopics.join(', ')} with Nova AI.` : ''}`;
      } else if (accuracyPercent >= 40) {
        aiFeedback = `📚 Good effort scoring ${accuracyPercent}%. You have solid fundamentals in ${masteredTopics.length > 0 ? masteredTopics.join(', ') : 'initial questions'}, but need reinforcement in ${weakTopics.join(', ')}. Check out the step-by-step solutions below!`;
      } else {
        aiFeedback = `💪 Every expert starts with practice! You scored ${accuracyPercent}%. Let's review the concepts in ${weakTopics.join(', ')} together. Try asking Nova AI Tutor to explain each missed question step-by-step.`;
      }

      const reportDetail: QuizReportDetail = {
        quizTitle: `${subjectId.toUpperCase()} • ${levelNode} Assessment`,
        board,
        grade,
        subjectId,
        levelNode,
        score: finalScore,
        totalQuestions,
        accuracyPercent,
        passed,
        coinsEarned: passed ? 25 : 0,
        antiCheatPassed,
        timeSpentSeconds: totalDwell,
        masteredTopics,
        weakTopics,
        aiTutorFeedback: aiFeedback,
        completedAt: new Date().toISOString(),
        questions: allAnswers.map(a => ({
          questionId: a.question.id,
          questionText: a.question.text,
          options: a.question.options,
          chosenIndex: a.chosenIndex,
          correctIndex: a.question.correctIndex,
          isCorrect: a.isCorrect,
          topicTag: a.question.topicTag || 'General',
          explanation: a.question.explanation || 'Review the core concept in your syllabus curriculum.'
        }))
      };

      const reportMsgId = 'rep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const mailboxMsg: MailboxMessage = {
        id: reportMsgId,
        learnerId: learner.id,
        sender: 'NOVA_AI',
        senderName: 'Nova AI Tutor',
        senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        subject: passed
          ? `📊 Quiz Mastery Report: ${subjectId.toUpperCase()} (${accuracyPercent}%)`
          : `📋 Quiz Diagnostic Report: ${subjectId.toUpperCase()} (${accuracyPercent}%)`,
        preview: `Scored ${finalScore}/${totalQuestions} (${accuracyPercent}%) in ${board} Class ${grade}. ${passed ? 'Mastery verified! +25 Coins.' : 'Areas to review: ' + (weakTopics.slice(0, 2).join(', ') || 'Concepts')}`,
        body: aiFeedback,
        category: 'QUIZ_REPORT',
        isRead: false,
        createdAt: new Date().toISOString(),
        quizReport: reportDetail
      };

      StorageRLSLayer.sendMailboxMessage(mailboxMsg);
      ApiClient.sendMailboxMessage(mailboxMsg).catch(() => {});
      setGeneratedReportId(reportMsgId);

      // Synchronize updated quiz counts, streak, and coin balance with React session state
      setTimeout(() => {
        refreshCurrentLearner();
      }, 300);
    }
  };

  // Daily Quiz Quota Enforcement Screen
  if (dailyStatus.isLimitReached && !isCompleted) {
    return (
      <div className="max-w-xl mx-auto p-8 sm:p-10 text-center text-slate-100 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <Zap className="w-8 h-8 text-amber-300" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
            Daily Quiz Target Reached ({dailyStatus.quizzesToday} / {dailyStatus.dailyLimit})
          </span>
          <h2 className="text-2xl font-black text-white mt-3">
            {dailyStatus.canEnableExamMode
              ? '⚡ Boost Your Study with Exam Mode!'
              : 'Daily Study Milestone Crushed! 🏆'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
            {dailyStatus.canEnableExamMode ? (
              dailyStatus.isSeniorGrade ? (
                <>
                  You have completed your standard <strong>10 daily quizzes</strong> for Class {grade}. Preparing for Board Exams, Pre-Boards, or Olympiads? Turn ON <strong>⚡ Exam Mode</strong> to immediately unlock <strong>5 additional quizzes</strong> today (15 total)!
                </>
              ) : (
                <>
                  Young scholars thrive on balanced daily learning! You have completed your standard <strong>5 daily quizzes</strong>. Preparing for school tests or exams? Turn ON <strong>⚡ Exam Mode</strong> to immediately unlock <strong>5 additional quizzes</strong> today (10 total)!
                </>
              )
            ) : (
              <>
                You have completed all <strong>{dailyStatus.dailyLimit} quizzes</strong> for today! Consistent daily practice and sleep consolidate memory much better than cramming. Take a rest, review your Mailbox diagnostic reports, or come back tomorrow for a fresh quota!
              </>
            )}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          {dailyStatus.canEnableExamMode && (
            <button
              onClick={() => handleToggleExamMode(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ Enable Exam Mode (+5 Quizzes)</span>
            </button>
          )}

          {onOpenMailbox && (
            <button
              onClick={() => onOpenMailbox()}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>View Mailbox Reports</span>
            </button>
          )}

          <button
            onClick={onFinish}
            className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            <StudyCoinIcon className="w-8 h-8 flex-shrink-0" glow animate />
            <div className="text-xs text-left">
              <p className="font-bold flex items-center gap-1.5">
                <StudyCoinIcon className="w-4 h-4" />
                <span>+25 Study Coins Credited to Ledger!</span>
              </p>
              <p className="text-amber-400/80">Level certificate generated and secured in your Certificate Vault.</p>
            </div>
          </div>
        )}

        {/* Anti-cheat audit badge */}
        <div className="inline-flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-800 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Anti-Cheat Verification: {antiCheatViolations === 0 ? 'Passed (Full Integrity)' : 'Anomalous speedrun detected'}</span>
        </div>

        {/* Mailbox Diagnostic Report Notification Banner */}
        <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-lg">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>Quiz Diagnostic Report Delivered!</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </p>
              <p className="text-[11px] text-purple-300/80">
                Nova AI has analyzed your answers, topic strengths, and solutions in your Student Mailbox.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onOpenMailbox) {
                onOpenMailbox(generatedReportId || undefined);
              } else {
                onFinish();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-950 transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>Open Report in Mailbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
  const theme = getClassTheme(grade);

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
      {/* Class Persona Header */}
      <div className={`p-4 rounded-2xl mb-6 bg-gradient-to-r ${theme.gradientHero} text-white flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl p-2 rounded-xl bg-white/20 backdrop-blur-md">{theme.mascot.emoji}</span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm">{theme.name} • Class {grade}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 uppercase font-bold tracking-wider">
                {theme.stageTitle}
              </span>
            </div>
            <p className="text-xs text-white/90 italic font-medium">{theme.motto}</p>
          </div>
        </div>

        {/* Specialized class style indicator */}
        {theme.quizStyle === 'PLAYFUL_BUBBLY' && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-white/25 rounded-full text-xs font-bold">
            <span>⭐ Explorer Quest</span>
          </div>
        )}
        {theme.quizStyle === 'TACTICAL_QUEST' && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-white/25 rounded-full text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Cadet Mission Radar</span>
          </div>
        )}
        {theme.quizStyle === 'BOARD_SPECIMEN' && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-white/25 rounded-full text-xs font-bold">
            <Target className="w-3.5 h-3.5 text-red-200" />
            <span>Board Specimen Exam</span>
          </div>
        )}
        {theme.quizStyle === 'COMPETITIVE_NTA' && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-white/25 rounded-full text-xs font-mono font-bold">
            <Atom className="w-3.5 h-3.5 text-cyan-200" />
            <span>NTA Speed Simulator (+4 / -1)</span>
          </div>
        )}
      </div>

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
                title="Synthesized dynamically by Google Gemini 2.5 Flash"
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Exam Mode Toggle Button */}
          <button
            onClick={() => handleToggleExamMode()}
            title={examMode ? 'Exam Mode is ON: +5 Daily Quizzes unlocked. Click to toggle.' : 'Click to enable Exam Mode (+5 Daily Quizzes)'}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
              examMode
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/60 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3 h-3 ${examMode ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>⚡ Exam Mode: <strong className={examMode ? 'text-amber-300' : 'text-slate-300'}>{examMode ? 'ON' : 'OFF'}</strong></span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
              {dailyStatus.quizzesToday + 1}/{dailyStatus.dailyLimit}
            </span>
          </button>

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

      {/* Progress Bar & Question Palette for Competitive Classes */}
      {theme.quizStyle === 'COMPETITIVE_NTA' ? (
        <div className="mb-6 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span>Question Palette (NTA Grid):</span>
            <span className="text-emerald-400 font-bold">Answered: {score}</span>
          </div>
          <div className="flex items-center space-x-2">
            {questions.map((_, qIdx) => (
              <span
                key={qIdx}
                className={`w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center transition-all ${
                  qIdx === currentIndex
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : qIdx < currentIndex
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {qIdx + 1}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full bg-slate-950 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      )}

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
          let letterBadgeStyle = 'bg-slate-800 text-slate-300';

          // Class-specific playful colors for primary grades (1 to 4)
          if (theme.quizStyle === 'PLAYFUL_BUBBLY') {
            const letterPalette = [
              'bg-amber-500/20 text-amber-300 border border-amber-500/40',
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
              'bg-sky-500/20 text-sky-300 border border-sky-500/40',
              'bg-pink-500/20 text-pink-300 border border-pink-500/40'
            ];
            letterBadgeStyle = letterPalette[idx % 4];
          }

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
                <span className={`w-7 h-7 rounded-xl text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 ${letterBadgeStyle}`}>
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
