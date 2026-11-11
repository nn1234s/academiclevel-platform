import React, { useState, useEffect } from 'react';
import { Board, Grade, Question } from '../../core/types';
import { NovaAiService, NovaMessage } from '../../services/novaAiService';
import { Sparkles, Send, Bot, User, Lightbulb, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

interface NovaAiTutorProps {
  board: Board;
  grade: Grade;
  activeSubject?: string;
  initialQuestion?: Question | null;
  initialChosenIndex?: number | null;
  onClose?: () => void;
}

export const NovaAiTutor: React.FC<NovaAiTutorProps> = ({
  board,
  grade,
  activeSubject = 'Mathematics',
  initialQuestion,
  initialChosenIndex,
  onClose,
}) => {
  const [messages, setMessages] = useState<NovaMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
      const historyPayload = messages.slice(-6).map(m => ({
        role: (m.sender === 'STUDENT' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));
      const response = await NovaAiService.answerStudentQuery(userText, board, grade, activeSubject, historyPayload);
      const aiMsg: NovaMessage = {
        id: 'msg_nova_' + Date.now(),
        sender: 'NOVA',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
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
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100">
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
              <span>Hybrid Engine (Live Gemini 1.5 + Syllabus Fallback)</span>
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        )}
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
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md shadow-indigo-950 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
