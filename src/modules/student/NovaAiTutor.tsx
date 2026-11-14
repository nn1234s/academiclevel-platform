import React, { useState, useEffect } from 'react';
import { Board, Grade, Learner, Question } from '../../core/types';
import { NovaAiService, NovaMessage, StudentAiQuota } from '../../services/novaAiService';
import { Sparkles, Send, Bot, User, Lightbulb, RefreshCw, Coins, X, CheckCircle, Zap } from 'lucide-react';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';

interface NovaAiTutorProps {
  board: Board;
  grade: Grade;
  activeSubject?: string;
  initialQuestion?: Question | null;
  initialChosenIndex?: number | null;
  onClose?: () => void;
  learner?: Learner | null;
  onCoinsUpdated?: () => void;
}

export const NovaAiTutor: React.FC<NovaAiTutorProps> = ({
  board,
  grade,
  activeSubject = 'Mathematics',
  initialQuestion,
  initialChosenIndex,
  onClose,
  learner,
  onCoinsUpdated,
}) => {
  const [messages, setMessages] = useState<NovaMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quota, setQuota] = useState<StudentAiQuota | null>(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  const [refillStatus, setRefillStatus] = useState<{ success: boolean; text: string } | null>(null);

  // Check if learner is an active subscriber with unlimited access
  const isSubscriber = Boolean(
    quota?.isSubscriber ||
    quota?.dailyLimit === Infinity ||
    (learner as any)?.hasActiveSubscription ||
    (learner as any)?.activeSub ||
    (learner as any)?.activePlan ||
    (learner as any)?.subscriptionExpiresAt
  );

  // Load student AI message quota
  const loadQuota = async () => {
    if (!learner?.id) return;
    try {
      const q = await NovaAiService.getStudentQuota(learner.id);
      if (q) setQuota(q);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadQuota();
  }, [learner?.id]);

  // Handle refill purchase
  const handleBuyMessages = async (packType: 'PACK_5' | 'PACK_12') => {
    if (!learner?.id) return;
    setIsRefilling(true);
    setRefillStatus(null);
    const cost = packType === 'PACK_5' ? 10 : 20;

    if ((learner.coinBalance || 0) < cost) {
      setRefillStatus({
        success: false,
        text: `Insufficient AL Coins! You need ${cost} coins, but have ${learner.coinBalance || 0}. Earn coins by completing quizzes!`
      });
      setIsRefilling(false);
      return;
    }

    const res = await NovaAiService.buyAiMessages(learner.id, packType);
    if (res.success) {
      setRefillStatus({ success: true, text: res.message });
      if (res.quota) setQuota(res.quota);
      onCoinsUpdated?.();
      setTimeout(() => {
        setShowRefillModal(false);
        setRefillStatus(null);
      }, 1800);
    } else {
      setRefillStatus({ success: false, text: res.message });
    }
    setIsRefilling(false);
  };

  // Initialize tutor with age-appropriate welcome
  useEffect(() => {
    const initWelcome = async () => {
      let welcomeText = '';
      if (initialQuestion && initialChosenIndex !== null && initialChosenIndex !== undefined) {
        setIsTyping(true);
        welcomeText = await NovaAiService.explainMistake(
          initialQuestion,
          initialChosenIndex,
          board,
          grade
        );
        setIsTyping(false);
      } else {
        if (grade <= 4) {
          welcomeText = `✨ Hi! I'm Nova, your cheerful learning buddy! I can explain any puzzle in ${board} Class ${grade} ${activeSubject} in fun, simple steps. What would you like to explore today?`;
        } else if (grade <= 8) {
          welcomeText = `👋 Hello! I'm Nova, your Socratic AI guide for ${board} Class ${grade} ${activeSubject}. If you're stuck on a problem or formula, ask away and we'll break it down together step-by-step!`;
        } else {
          welcomeText = `🎯 Welcome! I'm Nova, your high-rigor ${board} Class ${grade} Academic Coach. I'm calibrated to ${board} official marking criteria and conceptual derivation. Which unit or topic are you working on?`;
        }
      }

      setMessages([
        {
          id: 'msg_welcome_' + Date.now(),
          sender: 'NOVA',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    };

    initWelcome();
  }, [board, grade, activeSubject, initialQuestion, initialChosenIndex]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // Check if daily quota is exhausted (bypassed completely for active subscribers)
    if (!isSubscriber && quota && quota.remainingToday <= 0) {
      setShowRefillModal(true);
      const limitMsg: NovaMessage = {
        id: 'msg_limit_' + Date.now(),
        sender: 'NOVA',
        text: `🪙 **Daily AI Cap Reached (8/8 Free Messages Used)**\n\nYou've used your daily free quota of 8 Socratic AI queries! You can unlock 5 extra AI messages for just 10 AL Coins using the Refill button.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, limitMsg]);
      return;
    }

    const userText = inputValue.trim();
    setInputValue('');

    const userMsg: NovaMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'STUDENT',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Send last 4 messages to keep prompts short and conserve free tier RPM/TPM caps
      const historyPayload = messages.slice(-4).map(m => ({
        role: (m.sender === 'STUDENT' ? 'user' : 'model') as 'user' | 'model',
        text: m.text.slice(0, 250)
      }));
      const response = await NovaAiService.answerStudentQuery(
        userText,
        board,
        grade,
        activeSubject,
        historyPayload,
        learner?.id
      );
      const aiMsg: NovaMessage = {
        id: 'msg_nova_' + Date.now(),
        sender: 'NOVA',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      loadQuota();
    } catch {
      const fallbackMsg: NovaMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'NOVA',
        text: `[Offline Resilience] I am currently operating in offline syllabus mode. For ${board} Class ${grade} ${activeSubject}, remember to review core definitions and foundational properties first!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 relative">
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/50">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">Nova AI Socratic Tutor</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {board} • Class {grade}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Multi-Model Chain (Gemini 3.5 Flash Lite + Failover)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {learner && (
            isSubscriber ? (
              <div
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                title="Active Subscriber • Unlimited Nova AI Access"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{quota?.planTier || (learner as any)?.activePlan || 'PLUS'} Scholar • Unlimited</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setRefillStatus(null);
                  setShowRefillModal(true);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                title="Refill AI Messages using AL Coins"
              >
                <StudyCoinIcon className="w-4 h-4" />
                <span>
                  {quota ? `${quota.remainingToday} left` : '8 daily'}
                </span>
                <span className="text-[9px] bg-amber-400/20 text-amber-200 px-1 py-0.5 rounded uppercase font-black">
                  +Refill
                </span>
              </button>
            )
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'STUDENT' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                msg.sender === 'STUDENT'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'STUDENT' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'STUDENT'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}
              <div
                className={`text-[9px] mt-1.5 ${
                  msg.sender === 'STUDENT' ? 'text-indigo-200 text-right' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2 bg-slate-950/60 rounded-xl border border-slate-800/60 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Nova is reasoning socratically...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-500 flex-shrink-0 flex items-center space-x-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Quick:</span>
        </span>
        <button
          onClick={() => setInputValue(`Can you simplify the hardest concept in ${activeSubject}?`)}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          Simplify hardest concept
        </button>
        <button
          onClick={() => setInputValue(`Give me a ${board} exam-style practice problem for Class ${grade}.`)}
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
        >
          Give practice problem
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={`Ask Nova anything about ${board} Class ${grade} ${activeSubject}...`}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md shadow-indigo-950 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Modal: Refill AI Messages using AL Coins */}
      {showRefillModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-left">
            <button
              onClick={() => {
                setShowRefillModal(false);
                setRefillStatus(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Unlock Extra AI Messages</h4>
                <p className="text-[11px] text-slate-400">
                  Your Balance: <strong className="text-amber-400 font-mono inline-flex items-center gap-1"><StudyCoinIcon className="w-3.5 h-3.5" /> {learner?.coinBalance || 0} AL Coins</strong>
                </p>
              </div>
            </div>

            {refillStatus && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center space-x-2 ${
                  refillStatus.success
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-600 text-rose-300'
                }`}
              >
                {refillStatus.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                <span>{refillStatus.text}</span>
              </div>
            )}

            {isSubscriber ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Unlimited Nova AI Active</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                    You have active <strong className="text-emerald-300 font-semibold">{quota?.planTier || (learner as any)?.activePlan || 'PLUS'} Scholar</strong> status. All daily Socratic AI query caps are lifted!
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setShowRefillModal(false)}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-5">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-white">5 Extra AI Messages</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300">
                          Standard
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Valid today and carried over until used.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyMessages('PACK_5')}
                      disabled={isRefilling}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <StudyCoinIcon className="w-4 h-4" />
                      <span>10 Coins</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-white">12 Extra AI Messages</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300">
                          Best Value (+2 Free)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Save 4 AL Coins for exam preparation.
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyMessages('PACK_12')}
                      disabled={isRefilling}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <StudyCoinIcon className="w-4 h-4" />
                      <span>20 Coins</span>
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  Need more coins? Ace your quizzes (5 quizzes = 1 Level mastery) or spin the daily wheel to earn coins!
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
