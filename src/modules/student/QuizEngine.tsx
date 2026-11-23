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
import { useLanguage } from '../../core/i18n/LanguageContext';
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
  LogOut,
  ArrowLeft
} from 'lucide-react';

interface QuizEngineProps {
  board: Board;
  grade: Grade;
  subjectId: string;
  levelNode: LevelNode;
  chapter?: string;
  targetCount?: number;
  learner: Learner;
  onFinish: () => void;
  onOpenNovaAi: (question: Question, chosenIndex: number) => void;
  onOpenMailbox?: (reportId?: string) => void;
  onExitQuiz?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  board,
  grade,
  subjectId,
  levelNode,
  chapter,
  targetCount,
  learner,
  onFinish,
  onOpenNovaAi,
  onOpenMailbox,
  onExitQuiz,
}) => {
  const { refreshCurrentLearner } = useAuth();
  const { isHinglish } = useLanguage();
  const quizContainerRef = React.useRef<HTMLDivElement>(null);
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

  const scrollToQuizTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      const executeScroll = () => {
        try {
          if (quizContainerRef.current) {
            const rect = quizContainerRef.current.getBoundingClientRect();
            const headerOffset = 90; // offset for sticky navigation header
            const targetY = (window.pageYOffset || document.documentElement.scrollTop || 0) + rect.top - headerOffset;
            window.scrollTo({
              top: Math.max(0, targetY),
              left: 0,
              behavior: 'auto'
            });
          } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          }
        } catch {
          window.scrollTo(0, 0);
        }
      };

      // Immediate zero-delay snap to top so screen responds immediately
      executeScroll();
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(executeScroll);
      }
      setTimeout(executeScroll, 30);
      setTimeout(executeScroll, 120);
    }
  }, []);

  const sessionKey = `al_active_quiz_${learner.id}_${board}_${grade}_${subjectId}_${levelNode}_${chapter || 'all'}`;

  const loadQuizQuestions = useCallback(async (forceNew = false) => {
    // 1. Check for resumable in-progress session (prevents mid-quiz terminations on accidental refresh or mobile app switch)
    if (!forceNew && typeof window !== 'undefined') {
      try {
        const savedRaw = sessionStorage.getItem(sessionKey);
        if (savedRaw) {
          const saved = JSON.parse(savedRaw);
          if (saved && Array.isArray(saved.questions) && saved.questions.length > 0 && !saved.isCompleted) {
            setQuestions(saved.questions);
            setCurrentIndex(saved.currentIndex || 0);
            setScore(saved.score || 0);
            setAnswersLog(saved.answersLog || []);
            setQuizSource(saved.quizSource || 'CURATED_OFFLINE');
            setAiNotice('Resumed in-progress assessment');
            setIsLoadingQuiz(false);
            scrollToQuizTop();
            return;
          }
        }
      } catch {}
    }

    setIsLoadingQuiz(true);
    const targetQCount = targetCount || (levelNode === 'FOUNDATION' ? 10 : levelNode === 'CONCEPT' ? 12 : levelNode === 'EXAM_READY' ? 15 : 20);
    try {
      const res = await HybridQuizService.getQuestions(board, grade, subjectId, levelNode, targetQCount, chapter);
      let loaded = [...res.questions];

      // Ensure exact question count matching: If server returned fewer questions than advertised, top up immediately
      if (loaded.length < targetQCount) {
        const supplement = await OfflineBankService.fetchServerQuestions(board, grade, subjectId, levelNode, targetQCount * 2, chapter);
        const existingTexts = new Set(loaded.map(q => q.text.toLowerCase().replace(/[^a-z0-9]/g, '')));
        for (const sup of supplement) {
          const norm = sup.text.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!existingTexts.has(norm)) {
            existingTexts.add(norm);
            loaded.push(sup);
          }
          if (loaded.length >= targetQCount) break;
        }
      }

      // If still below targetCount, use offline bank generator to satisfy the exact advertised count
      if (loaded.length < targetQCount) {
        const localDirect = OfflineBankService.getQuestions(board, grade, subjectId, levelNode, targetQCount, chapter);
        const existingTexts = new Set(loaded.map(q => q.text.toLowerCase().replace(/[^a-z0-9]/g, '')));
        for (const loc of localDirect) {
          const norm = loc.text.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!existingTexts.has(norm)) {
            existingTexts.add(norm);
            loaded.push(loc);
          }
          if (loaded.length >= targetQCount) break;
        }
      }

      const sorted = loaded.slice(0, targetQCount).sort((a, b) => (a.topicTag || '').localeCompare(b.topicTag || ''));
      setQuestions(sorted);
      setQuizSource(res.source);
      setAiNotice(res.notice || '');
    } catch {
      const fallback = await OfflineBankService.fetchServerQuestions(board, grade, subjectId, levelNode, targetQCount, chapter);
      let loaded = [...fallback];
      if (loaded.length < targetQCount) {
        const localDirect = OfflineBankService.getQuestions(board, grade, subjectId, levelNode, targetQCount, chapter);
        loaded = [...loaded, ...localDirect];
      }
      const sorted = loaded.slice(0, targetQCount).sort((a, b) => (a.topicTag || '').localeCompare(b.topicTag || ''));
      setQuestions(sorted);
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
      scrollToQuizTop();
    }
  }, [board, grade, subjectId, levelNode, targetCount, chapter, scrollToQuizTop, sessionKey]);

  // Persist in-progress quiz state to prevent mid-session termination on refresh or tab switch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (questions.length > 0 && !isCompleted) {
      try {
        sessionStorage.setItem(
          sessionKey,
          JSON.stringify({
            questions,
            currentIndex,
            score,
            answersLog,
            quizSource,
            savedAt: Date.now()
          })
        );
      } catch {}
    } else if (isCompleted) {
      try {
        sessionStorage.removeItem(sessionKey);
      } catch {}
    }
  }, [questions, currentIndex, score, answersLog, quizSource, isCompleted, sessionKey]);

  // Prevent accidental tab close or page navigation during active quiz
  useEffect(() => {
    if (typeof window === 'undefined' || isCompleted || questions.length === 0) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Assessment in progress! Your answers will be saved in your session.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isCompleted, questions.length]);

  // Auto-scroll to top whenever currentIndex changes (ensures user always views top of question)
  useEffect(() => {
    scrollToQuizTop();
  }, [currentIndex, scrollToQuizTop]);

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

    const isCorrect = selectedOption === Number(currentQuestion.correctIndex);
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

  const handleJumpToQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length || idx === currentIndex) return;
    setCurrentIndex(idx);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuestionDwellSeconds(0);
    scrollToQuizTop();
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuestionDwellSeconds(0);
      scrollToQuizTop();
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

  if (isLoadingQuiz) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center text-slate-800 bg-white border border-slate-200 rounded-3xl shadow-xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-200 animate-pulse">
          <Cpu className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Synthesizing Assessment Nodes...</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
          Engaging AcademicLevel Hybrid Engine — combining Live Gemini AI with verified CBSE/ICSE syllabus guardrails.
        </p>
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-12 text-center text-slate-600 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
        <p className="text-sm font-medium">Loading syllabus assessment nodes...</p>
      </div>
    );
  }

  // Quiz Completed View
  if (isCompleted) {
    const accuracy = Math.round((score / questions.length) * 100);
    const passed = accuracy >= 70;

    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl text-center text-slate-900">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600 border border-indigo-200">
          <Award className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center space-x-2 mb-2">
          {quizSource === 'GEMINI_LIVE' ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 border border-purple-200 text-purple-700">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>Live Gemini AI Quiz Completed</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Syllabus Bank Completed</span>
            </span>
          )}
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-indigo-700 uppercase">
          Assessment Complete • {board} Class {grade}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 mb-2 text-slate-900">
          {passed
            ? (isHinglish ? 'Level Mastery Achieved! 🎉' : 'Level Mastery Achieved! 🎉')
            : (isHinglish ? 'Quiz Complete ho gaya' : 'Assessment Finished')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
          {isHinglish
            ? <>Aapne <strong className="text-slate-900">{questions.length}</strong> mein se <strong className="text-slate-900">{score}</strong> questions sahi kiye ({accuracy}% accuracy).</>
            : <>You scored <strong className="text-slate-900">{score}</strong> out of <strong className="text-slate-900">{questions.length}</strong> questions ({accuracy}% accuracy).</>}
        </p>

        {/* Reward Status Banner */}
        {rewardResult?.awarded && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center space-x-3 text-amber-900 shadow-xs">
            <StudyCoinIcon className="w-8 h-8 flex-shrink-0" glow animate />
            <div className="text-xs text-left">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <StudyCoinIcon className="w-4 h-4" />
                <span>+25 Study Coins Credited to Ledger!</span>
              </p>
              <p className="text-amber-800">Level certificate generated and secured in your Certificate Vault.</p>
            </div>
          </div>
        )}

        {/* Anti-cheat audit badge */}
        <div className="inline-flex items-center space-x-2 text-[11px] text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Anti-Cheat Verification: {antiCheatViolations === 0 ? 'Passed (Full Integrity)' : 'Anomalous speedrun detected'}</span>
        </div>

        {/* Mailbox Diagnostic Report Notification Banner */}
        <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-white to-indigo-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <span>Quiz Diagnostic Report Delivered!</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              </p>
              <p className="text-[11px] text-slate-600">
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
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
          >
            <span>{isHinglish ? 'Mailbox mein report dekhein' : 'Open Report in Mailbox'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => loadQuizQuestions(true)}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isHinglish ? 'Ek aur AI Practice Set solve karo' : 'Generate Another AI Practice Set'}</span>
          </button>
          <button
            onClick={onFinish}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            {isHinglish ? 'Padhai jari rakhein' : 'Continue Learning Journey'}
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz View
  const theme = getClassTheme(grade);

  return (
    <div ref={quizContainerRef} className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900">
      {/* Class Persona Header */}
      <div className={`p-4 rounded-2xl mb-6 bg-gradient-to-r ${theme.gradientHero} text-white flex items-center justify-between shadow-xs`}>
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          {onExitQuiz && (
            <button
              onClick={onExitQuiz}
              title="Return / Exit Assessment (Requires Parent PIN)"
              className="px-3 py-1.5 text-xs rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 flex items-center space-x-1 border border-rose-200 transition-all cursor-pointer font-bold active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-rose-600" />
              <span>Back</span>
            </button>
          )}

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-700 uppercase">
                {board} • Class {grade} • {subjectId.toUpperCase()} • {levelNode}
              </span>

              {/* Hybrid Source Badge */}
              {quizSource === 'GEMINI_LIVE' ? (
                <span
                  title="Synthesized dynamically by Google Gemini 2.5 Flash"
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 border border-purple-200 text-purple-700"
                >
                  <Sparkles className="w-3 h-3 text-purple-600 animate-pulse" />
                  <span>Live Gemini AI</span>
                </span>
              ) : (
                <span
                  title="Curated, 100% board syllabus verified offline bank"
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Syllabus Bank</span>
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-900">
              Question {currentIndex + 1} of {questions.length}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadQuizQuestions(true)}
            title="Synthesize new questions"
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 flex items-center space-x-1 border border-slate-300 transition-all cursor-pointer font-medium"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">New AI Set</span>
          </button>

          {/* Anti-cheat minimum timer badge */}
          <div className="flex items-center space-x-1 text-xs font-mono text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{questionDwellSeconds}s</span>
          </div>

          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Score: {score}
          </div>

          {onExitQuiz && (
            <button
              onClick={onExitQuiz}
              title="Exit Assessment"
              className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 flex items-center space-x-1 border border-rose-200 transition-all cursor-pointer font-bold active:scale-95"
            >
              <LogOut className="w-3 h-3 text-rose-600" />
              <span>Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Question Palette & Chapter Navigator */}
      <div className="mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
        <div className="text-xs text-slate-600 mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center space-x-1.5 font-semibold text-slate-800">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Question Navigator:</span>
          </span>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="text-slate-600">
              Answered: <strong className="text-slate-900">{answersLog.length}</strong> of {questions.length}
            </span>
            <span className="text-emerald-700">
              Score: <strong className="text-emerald-800">{score}</strong>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {questions.map((q, qIdx) => {
            const logEntry = answersLog.find(a => a.question.id === q.id);
            const isAnswered = Boolean(logEntry);
            const isCorrect = logEntry?.isCorrect;
            const isCurr = qIdx === currentIndex;

            let paletteStyle = 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-300 shadow-2xs';
            if (isCurr) {
              paletteStyle = 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md scale-105 border border-indigo-400';
            } else if (isAnswered) {
              paletteStyle = isCorrect
                ? 'bg-emerald-600 text-white border border-emerald-500 shadow-xs'
                : 'bg-rose-600 text-white border border-rose-500 shadow-xs';
            }

            return (
              <button
                key={qIdx}
                type="button"
                onClick={() => handleJumpToQuestion(qIdx)}
                className={`w-7 h-7 flex-shrink-0 rounded-lg text-xs font-bold font-mono flex items-center justify-center transition-all cursor-pointer ${paletteStyle}`}
                title={`Jump to Question ${qIdx + 1}: ${q.topicTag || 'Curriculum Focus'} ${isAnswered ? (isCorrect ? '(Correct)' : '(Incorrect)') : '(Unanswered)'}`}
              >
                {qIdx + 1}
              </button>
            );
          })}
        </div>
        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Text & Chapter Identification */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full inline-flex items-center space-x-1.5">
            <BookOpen className="w-3 h-3 text-indigo-600" />
            <span>Chapter: {currentQuestion.topicTag || chapter || 'Curriculum Focus'}</span>
          </span>
          {chapter && currentQuestion.topicTag && currentQuestion.topicTag !== chapter && (
            <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full inline-block border border-slate-200">
              {currentQuestion.topicTag}
            </span>
          )}
          {aiNotice && (
            <span className="text-[10px] text-slate-500 italic hidden sm:inline">
              • {aiNotice}
            </span>
          )}
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          {currentQuestion.text}
        </h2>
      </div>

      {/* Primary Top Action Bar: Repositioned prominently above options for immediate access on desktop & mobile */}
      <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2 text-xs">
          {selectedOption === null && !isAnswerSubmitted ? (
            <span className="text-slate-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>{isHinglish ? 'Answer karne ke liye niche option select karo' : 'Select an option below to answer'}</span>
            </span>
          ) : !isAnswerSubmitted ? (
            <span className="text-indigo-800 font-semibold flex items-center space-x-2">
              <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                {String.fromCharCode(65 + selectedOption!)}
              </span>
              <span>
                {isHinglish
                  ? `Option ${String.fromCharCode(65 + selectedOption!)} selected • Submit karne ke liye ready`
                  : `Option ${String.fromCharCode(65 + selectedOption!)} selected • Ready to submit`}
              </span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-xs font-semibold">
              {Number(selectedOption) === Number(currentQuestion.correctIndex) ? (
                <span className="text-emerald-800 flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isHinglish ? 'Shabash! Sahi Answer! (+1 Score)' : 'Correct Answer! (+1 Score)'}</span>
                </span>
              ) : (
                <span className="text-rose-800 flex items-center space-x-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{isHinglish ? 'Galat Answer. Niche step-by-step solution dekhein.' : 'Incorrect. See step-by-step solution below.'}</span>
                </span>
              )}
            </span>
          )}
        </div>

        {/* Action Button: Visible right at the top of the answer interaction area */}
        <div className="flex items-center space-x-2">
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || questionDwellSeconds < 1}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <span>{questionDwellSeconds < 1 ? 'Reading... (1s)' : 'Submit Answer'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          let btnStyle = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 text-slate-800 shadow-2xs';
          let letterBadgeStyle = 'bg-slate-100 text-slate-700 border border-slate-300 font-bold';

          const isThisSelected = selectedOption === idx;
          const isThisCorrect = idx === Number(currentQuestion.correctIndex);

          if (!isAnswerSubmitted) {
            if (isThisSelected) {
              btnStyle = 'border-2 border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm ring-1 ring-indigo-400/40';
              letterBadgeStyle = 'bg-indigo-600 text-white border-indigo-600 font-bold';
            }
          } else {
            // Post-submission rigorous evaluation styles
            if (isThisCorrect) {
              btnStyle = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm';
              letterBadgeStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
            } else if (isThisSelected) {
              btnStyle = 'border-2 border-rose-500 bg-rose-50 text-rose-950 shadow-sm';
              letterBadgeStyle = 'bg-rose-600 text-white border-rose-500 font-bold';
            } else {
              btnStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
              letterBadgeStyle = 'bg-slate-100 text-slate-400 border-slate-200';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswerSubmitted}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <span className={`w-7 h-7 rounded-xl text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 transition-all ${letterBadgeStyle}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="break-words">{option}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                {isAnswerSubmitted && isThisCorrect && (
                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHinglish ? 'Sahi Jawab' : 'Correct Answer'}</span>
                  </span>
                )}
                {isAnswerSubmitted && isThisSelected && !isThisCorrect && (
                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isHinglish ? 'Aapka Answer' : 'Your Answer'}</span>
                  </span>
                )}
                {!isAnswerSubmitted && isThisSelected && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                    Selected
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation & Socratic Helper */}
      {isAnswerSubmitted && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 animate-in fade-in duration-200 shadow-xs">
          <div>
            <span className="font-bold text-indigo-700 block mb-1 text-xs">
              Step-by-Step Solution:
            </span>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">{currentQuestion.explanation}</p>
          </div>

          <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-600 font-medium">
              💡 Hint / Exam Tip: {currentQuestion.hint}
            </span>
            <button
              onClick={() => onOpenNovaAi(currentQuestion, selectedOption!)}
              className="text-indigo-700 hover:text-indigo-800 font-semibold flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>{isHinglish ? 'Nova AI se easy hint lo (Socratic)' : 'Ask Nova AI Tutor to Explain Socratically'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span className="text-[11px] text-slate-500">
          {questionDwellSeconds < 1 && !isAnswerSubmitted ? (
            <span className="text-amber-600 font-medium">Reading dwell guard active: 1s</span>
          ) : (
            <span>Anti-cheat verification active</span>
          )}
        </span>

        {!isAnswerSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || questionDwellSeconds < 1}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>{questionDwellSeconds < 1 ? 'Reading... (1s)' : 'Submit Answer'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
