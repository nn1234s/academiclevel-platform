import React, { useState, useEffect, useMemo } from 'react';
import { MailboxMessage, QuizReportDetail, Question } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { ApiClient } from '../../core/api/apiClient';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import {
  Mail,
  Inbox,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Clock,
  Trash2,
  CheckCheck,
  Search,
  BookOpen,
  Zap,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Flame,
  ArrowLeft
} from 'lucide-react';

interface StudentMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  learnerId: string;
  initialSelectedMessageId?: string | null;
  onNavigateToQuiz?: (subjectId?: string) => void;
  onOpenNovaAi?: (questionText: string, explanation: string) => void;
}

type FilterCategory = 'ALL' | 'QUIZ_REPORT' | 'REWARD' | 'UNREAD';

export const StudentMailboxModal: React.FC<StudentMailboxModalProps> = ({
  isOpen,
  onClose,
  learnerId,
  initialSelectedMessageId,
  onNavigateToQuiz,
  onOpenNovaAi,
}) => {
  const [messages, setMessages] = useState<MailboxMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load messages from local storage & sync with server
  const loadMessages = () => {
    const local = StorageRLSLayer.getMailboxMessages(learnerId);
    setMessages(local);
    if (initialSelectedMessageId) {
      setSelectedMessageId(initialSelectedMessageId);
    } else if (!selectedMessageId && local.length > 0) {
      setSelectedMessageId(local[0].id);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    loadMessages();
    if (initialSelectedMessageId) {
      setSelectedMessageId(initialSelectedMessageId);
    }

    // Fetch from backend in background
    ApiClient.getMailboxMessages(learnerId)
      .then(res => {
        if (res && res.success && Array.isArray(res.messages)) {
          // Merge server messages into local storage
          res.messages.forEach(m => StorageRLSLayer.sendMailboxMessage(m));
          const updated = StorageRLSLayer.getMailboxMessages(learnerId);
          setMessages(updated);
          if (initialSelectedMessageId) {
            setSelectedMessageId(initialSelectedMessageId);
          } else if (!selectedMessageId && updated.length > 0) {
            setSelectedMessageId(updated[0].id);
          }
        }
      })
      .catch(() => {
        // Fallback silently to local storage
      });
  }, [isOpen, learnerId]);

  useEffect(() => {
    if (initialSelectedMessageId) {
      setSelectedMessageId(initialSelectedMessageId);
    }
  }, [initialSelectedMessageId]);

  // Mark message as read when selected
  useEffect(() => {
    if (!selectedMessageId) return;
    const msg = messages.find(m => m.id === selectedMessageId);
    if (msg && !msg.isRead) {
      StorageRLSLayer.markMailboxMessageRead(selectedMessageId, learnerId, true);
      ApiClient.markMailboxRead(selectedMessageId, learnerId, true).catch(() => {});
      setMessages(prev =>
        prev.map(m => (m.id === selectedMessageId ? { ...m, isRead: true } : m))
      );
    }
  }, [selectedMessageId, learnerId]);

  const handleMarkAllRead = () => {
    StorageRLSLayer.markAllMailboxMessagesRead(learnerId);
    ApiClient.markAllMailboxRead(learnerId).catch(() => {});
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
  };

  const handleDeleteMessage = async (msgId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDeleting(msgId);
    try {
      StorageRLSLayer.deleteMailboxMessage(msgId, learnerId);
      ApiClient.deleteMailboxMessage(msgId, learnerId).catch(() => {});
      const remaining = messages.filter(m => m.id !== msgId);
      setMessages(remaining);
      if (selectedMessageId === msgId) {
        setSelectedMessageId(remaining.length > 0 ? remaining[0].id : null);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      // Category filter
      if (filter === 'QUIZ_REPORT' && m.category !== 'QUIZ_REPORT') return false;
      if (filter === 'REWARD' && m.category !== 'REWARD' && m.category !== 'ACHIEVEMENT') return false;
      if (filter === 'UNREAD' && m.isRead) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const subjectMatch = m.subject.toLowerCase().includes(q);
        const previewMatch = m.preview.toLowerCase().includes(q);
        const reportMatch = m.quizReport?.subjectId.toLowerCase().includes(q) ||
          m.quizReport?.levelNode.toLowerCase().includes(q);
        return subjectMatch || previewMatch || reportMatch;
      }
      return true;
    });
  }, [messages, filter, searchQuery]);

  const selectedMessage = useMemo(() => {
    return messages.find(m => m.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  const unreadCount = useMemo(() => {
    return messages.filter(m => !m.isRead).length;
  }, [messages]);

  const reportCount = useMemo(() => {
    return messages.filter(m => m.category === 'QUIZ_REPORT').length;
  }, [messages]);

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">Student Mailbox</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-extrabold rounded-full animate-pulse">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                AI Diagnostic Performance Reports, Socratic Insights &amp; Platform Notifications
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 min-w-[40px] min-h-[40px]"
              aria-label="Close Mailbox"
              title="Close Mailbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Nav */}
        <div className="p-3 sm:px-5 border-b border-slate-800/80 bg-slate-900/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              All Mail ({messages.length})
            </button>
            <button
              onClick={() => setFilter('QUIZ_REPORT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                filter === 'QUIZ_REPORT'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Quiz Reports ({reportCount})</span>
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                filter === 'UNREAD'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports or topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Main 2-Pane Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Column: Messages List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/40 flex-shrink-0 ${
            selectedMessage && 'hidden md:flex'
          }`}>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-60" />
                  <p className="text-xs font-semibold text-slate-400">No messages found</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto">
                    {filter === 'QUIZ_REPORT'
                      ? 'Complete any assessment quiz to generate your first diagnostic AI report!'
                      : 'Your mailbox is empty.'}
                  </p>
                </div>
              ) : (
                filteredMessages.map(msg => {
                  const isSelected = msg.id === selectedMessageId;
                  const isQuiz = msg.category === 'QUIZ_REPORT';
                  const accuracy = msg.quizReport?.accuracyPercent;
                  const passed = msg.quizReport?.passed;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessageId(msg.id)}
                      className={`p-3.5 transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                          : msg.isRead
                          ? 'bg-transparent hover:bg-slate-800/40'
                          : 'bg-indigo-950/15 hover:bg-indigo-950/25 border-l-2 border-indigo-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 animate-pulse" />
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate ${
                            isQuiz
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {msg.senderName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex-shrink-0">
                          {formatTimestamp(msg.createdAt)}
                        </span>
                      </div>

                      <h4 className={`text-xs line-clamp-1 mb-1 ${
                        msg.isRead ? 'text-slate-300 font-medium' : 'text-white font-bold'
                      }`}>
                        {msg.subject}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {msg.preview}
                      </p>

                      {/* Quiz Pill Badges */}
                      {isQuiz && msg.quizReport && (
                        <div className="mt-2 flex items-center space-x-2 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold font-mono ${
                            passed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}>
                            {accuracy}% Score
                          </span>
                          {msg.quizReport.coinsEarned > 0 && (
                            <span className="flex items-center space-x-1 text-amber-300 font-bold">
                              <StudyCoinIcon className="w-3 h-3" />
                              <span>+{msg.quizReport.coinsEarned}</span>
                            </span>
                          )}
                          <span className="text-slate-500 text-[10px]">
                            {msg.quizReport.subjectId.toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Hover delete button */}
                      <button
                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-lg transition-all absolute right-2 bottom-2"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Message Detail View */}
          <div className={`flex-1 flex flex-col bg-slate-900 overflow-y-auto ${
            !selectedMessage && 'hidden md:flex'
          }`}>
            {selectedMessage ? (
              <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedMessageId(null)}
                  className="md:hidden flex items-center space-x-1.5 text-xs text-indigo-400 font-bold mb-2 py-1 px-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Inbox List</span>
                </button>

                {/* Message Header */}
                <div className="border-b border-slate-800 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-black text-sm shadow-inner">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-white">{selectedMessage.senderName}</p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {selectedMessage.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Delivered {new Date(selectedMessage.createdAt).toLocaleString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        disabled={isDeleting === selectedMessage.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 text-xs font-semibold border border-slate-700/60 hover:border-red-800/60 transition-colors flex items-center space-x-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                    {selectedMessage.subject}
                  </h3>
                </div>

                {/* QUIZ REPORT DIAGNOSTIC VIEW */}
                {selectedMessage.quizReport ? (
                  <div className="space-y-6">
                    
                    {/* Score Summary Card */}
                    <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Accuracy</span>
                          <span className={`text-2xl sm:text-3xl font-black ${
                            selectedMessage.quizReport.accuracyPercent >= 70 ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {selectedMessage.quizReport.accuracyPercent}%
                          </span>
                        </div>

                        <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Score</span>
                          <span className="text-2xl sm:text-3xl font-black text-white">
                            {selectedMessage.quizReport.score} <span className="text-xs text-slate-500 font-normal">/ {selectedMessage.quizReport.totalQuestions}</span>
                          </span>
                        </div>

                        <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mastery Status</span>
                          <span className={`text-xs font-black inline-block mt-1 px-2.5 py-1 rounded-full ${
                            selectedMessage.quizReport.passed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {selectedMessage.quizReport.passed ? 'Level Mastered 🎉' : 'Needs Practice'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coins Earned</span>
                          <div className="flex items-center justify-center space-x-1.5 mt-1 font-black text-lg text-amber-300">
                            <StudyCoinIcon className="w-5 h-5" glow />
                            <span>+{selectedMessage.quizReport.coinsEarned}</span>
                          </div>
                        </div>
                      </div>

                      {/* Meta Pills */}
                      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white uppercase">{selectedMessage.quizReport.board} Class {selectedMessage.quizReport.grade}</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-400 uppercase">{selectedMessage.quizReport.subjectId}</span>
                          <span>•</span>
                          <span className="font-mono text-purple-300 text-[11px]">{selectedMessage.quizReport.levelNode}</span>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px]">
                          <span className="flex items-center space-x-1 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Anti-Cheat Integrity Verified</span>
                          </span>
                          {selectedMessage.quizReport.timeSpentSeconds > 0 && (
                            <span className="flex items-center space-x-1 text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{selectedMessage.quizReport.timeSpentSeconds}s duration</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nova AI Socratic Commentary Card */}
                    <div className="bg-purple-950/30 border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Zap className="w-5 h-5 text-purple-300" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">Nova AI Tutor Diagnostic Note</h4>
                            <Sparkles className="w-3 h-3 text-purple-400" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                            {selectedMessage.quizReport.aiTutorFeedback}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conceptual Strengths & Focus Areas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mastered Concepts */}
                      <div className="bg-slate-950/60 border border-emerald-900/40 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mastered Concepts ({selectedMessage.quizReport.masteredTopics.length})</span>
                        </div>
                        {selectedMessage.quizReport.masteredTopics.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedMessage.quizReport.masteredTopics.map((topic, i) => (
                              <span key={i} className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-semibold rounded-lg">
                                ✓ {topic}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No topics fully mastered on this attempt.</p>
                        )}
                      </div>

                      {/* Weak Topics */}
                      <div className="bg-slate-950/60 border border-amber-900/40 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>Topics for Revision ({selectedMessage.quizReport.weakTopics.length})</span>
                        </div>
                        {selectedMessage.quizReport.weakTopics.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedMessage.quizReport.weakTopics.map((topic, i) => (
                              <span key={i} className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 text-[11px] font-semibold rounded-lg">
                                ⚠ {topic}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-400/90 font-medium">All assessed topics mastered! No weak areas detected.</p>
                        )}
                      </div>
                    </div>

                    {/* Question-by-Question Detailed Breakdown */}
                    {selectedMessage.quizReport.questions && selectedMessage.quizReport.questions.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          <span>Question-by-Question Assessment Review</span>
                        </h4>

                        <div className="space-y-3">
                          {selectedMessage.quizReport.questions.map((q, idx) => {
                            const isCorrect = q.isCorrect;
                            return (
                              <div
                                key={q.questionId || idx}
                                className={`p-4 rounded-2xl border transition-all ${
                                  isCorrect
                                    ? 'bg-slate-950/70 border-emerald-900/40'
                                    : 'bg-slate-950/70 border-amber-900/40'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                      isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                      {q.topicTag || 'Core Concept'}
                                    </span>
                                  </div>
                                  <span className={`text-[11px] font-bold flex items-center space-x-1 ${
                                    isCorrect ? 'text-emerald-400' : 'text-amber-400'
                                  }`}>
                                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                    <span>{isCorrect ? 'Correct (+1)' : 'Incorrect'}</span>
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm font-semibold text-slate-100 mb-3 leading-relaxed">
                                  {q.questionText}
                                </p>

                                {/* Options Review */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                  {q.options.map((opt, optIdx) => {
                                    const isChosen = optIdx === q.chosenIndex;
                                    const isTargetCorrect = optIdx === q.correctIndex;

                                    let badgeStyle = 'bg-slate-900/80 border-slate-800 text-slate-400';
                                    if (isTargetCorrect) {
                                      badgeStyle = 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 font-bold';
                                    } else if (isChosen && !isTargetCorrect) {
                                      badgeStyle = 'bg-red-950/70 border-red-500/60 text-red-300 line-through';
                                    }

                                    return (
                                      <div
                                        key={optIdx}
                                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${badgeStyle}`}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span className="font-mono text-[10px] opacity-60">
                                            {String.fromCharCode(65 + optIdx)}.
                                          </span>
                                          <span className="leading-snug">{opt}</span>
                                        </div>
                                        {isTargetCorrect && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                        )}
                                        {isChosen && !isTargetCorrect && (
                                          <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Explanation & Step-by-step Solution */}
                                {q.explanation && (
                                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                                    <p className="font-bold text-slate-200 text-[11px] flex items-center space-x-1.5 text-indigo-400">
                                      <HelpCircle className="w-3 h-3" />
                                      <span>Conceptual Explanation:</span>
                                    </p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                      {q.explanation}
                                    </p>
                                  </div>
                                )}

                                {/* Ask Nova AI for this specific question */}
                                {onOpenNovaAi && (
                                  <div className="mt-2.5 flex justify-end">
                                    <button
                                      onClick={() => {
                                        onClose();
                                        onOpenNovaAi(q.questionText, q.explanation);
                                      }}
                                      className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 transition-colors"
                                    >
                                      <Zap className="w-3 h-3" />
                                      <span>Ask Nova AI to explain this question</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3 justify-end">
                      {onNavigateToQuiz && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToQuiz(selectedMessage.quizReport?.subjectId);
                          }}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Practice More in {selectedMessage.quizReport.subjectId.toUpperCase()}</span>
                        </button>
                      )}
                    </div>

                  </div>
                ) : (
                  /* Standard text message view */
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.body}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Mail className="w-12 h-12 mb-3 text-slate-700 opacity-60" />
                <h4 className="text-sm font-bold text-slate-400">Select a message</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Choose an assessment report from your inbox to inspect question-by-question breakdowns, accuracy, and AI guidance.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
