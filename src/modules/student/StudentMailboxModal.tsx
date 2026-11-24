import React, { useState, useEffect, useMemo } from 'react';
import { MailboxMessage, QuizReportDetail, Question } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { ApiClient } from '../../core/api/apiClient';
import { useLanguage } from '../../core/i18n/LanguageContext';
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

type FilterCategory = 'ALL' | 'QUIZ_REPORT' | 'NOVA_NOTE' | 'REWARD' | 'UNREAD';

export const StudentMailboxModal: React.FC<StudentMailboxModalProps> = ({
  isOpen,
  onClose,
  learnerId,
  initialSelectedMessageId,
  onNavigateToQuiz,
  onOpenNovaAi,
}) => {
  const { isHinglish } = useLanguage();
  const [messages, setMessages] = useState<MailboxMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isOutsideMode, setIsOutsideMode] = useState<boolean>(() =>
    StorageRLSLayer.isOutsideModeActive(learnerId)
  );

  const handleToggleOutsideMode = () => {
    const next = !isOutsideMode;
    StorageRLSLayer.setOutsideMode(learnerId, next);
    setIsOutsideMode(next);
  };

  // Load messages from local storage & sync with server
  const loadMessages = () => {
    StorageRLSLayer.checkAndDeliverNovaMailboxNotes(learnerId);
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
      if (filter === 'NOVA_NOTE' && m.category !== 'NOVA_NOTE' && m.sender !== 'NOVA_AI') return false;
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

  const novaNotesCount = useMemo(() => {
    return messages.filter(m => m.category === 'NOVA_NOTE' || m.sender === 'NOVA_AI').length;
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden text-slate-900">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">{isHinglish ? 'Student Mailbox 📬' : 'Student Mailbox'}</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold rounded-full">
                    {unreadCount} {isHinglish ? 'Naye' : 'Unread'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isHinglish ? 'AI Diagnostic Performance Reports, Study Buddy Insights aur Platform Updates' : 'AI Diagnostic Performance Reports, Study Buddy Insights & Platform Notifications'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* "I'm outside" Notification Stop Button */}
            <button
              onClick={handleToggleOutsideMode}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                isOutsideMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isOutsideMode ? (isHinglish ? "Nova study notifications resume karein" : "Click to resume Nova study notifications") : (isHinglish ? "Bahar hone par notifications pause karein" : "Stop notifications while outside or away")}
            >
              <span>{isOutsideMode ? (isHinglish ? "🏠 Ghar Wapas (I'm Back)" : "🏠 I'm Back Home") : (isHinglish ? "🚶 Bahar Hoon (I'm Outside)" : "🚶 I'm Outside")}</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isHinglish ? 'Sabhi Read Mark Karein' : 'Mark All Read'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 bg-rose-500/15 text-rose-600 border border-rose-200 transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 min-w-[40px] min-h-[40px]"
              aria-label="Close Mailbox"
              title="Close Mailbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Outside Mode Warning Banner */}
        {isOutsideMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 font-medium shrink-0 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <span className="text-base">🚶</span>
              <span>
                <strong>{isHinglish ? 'Outside Mode Active:' : 'Outside Mode Active:'}</strong> {isHinglish ? 'Nova ki 20-min mailbox study notifications pause hain. Bahar khoob enjoy karo! 🌳☀️' : "Nova's 20-min mailbox study notifications are paused. Enjoy being outside! 🌳☀️"}
              </span>
            </div>
            <button
              onClick={handleToggleOutsideMode}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shrink-0"
            >
              {isHinglish ? 'Alerts Chalu Karein 🏠' : 'Resume Alerts 🏠'}
            </button>
          </div>
        )}

        {/* Search & Filter Nav */}
        <div className="p-3 sm:px-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {isHinglish ? `Sabhi Mail (${messages.length})` : `All Mail (${messages.length})`}
            </button>
            <button
              onClick={() => setFilter('NOVA_NOTE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                filter === 'NOVA_NOTE'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>{isHinglish ? `Nova Notes 🎀 (${novaNotesCount})` : `Nova Notes 🎀 (${novaNotesCount})`}</span>
            </button>
            <button
              onClick={() => setFilter('QUIZ_REPORT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                filter === 'QUIZ_REPORT'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isHinglish ? `Quiz Reports (${reportCount})` : `Quiz Reports (${reportCount})`}</span>
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{isHinglish ? 'Naye' : 'Unread'}</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isHinglish ? "Reports ya topics search karein..." : "Search reports or topics..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Main 2-Pane Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Column: Messages List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0 ${
            selectedMessage && 'hidden md:flex'
          }`}>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
                  <p className="text-xs font-semibold text-slate-600">{isHinglish ? 'Koi message nahi mila' : 'No messages found'}</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto">
                    {filter === 'QUIZ_REPORT'
                      ? (isHinglish ? 'Apna pehla AI diagnostic report paane ke liye koi quiz complete karein!' : 'Complete any assessment quiz to generate your first diagnostic AI report!')
                      : (isHinglish ? 'Aapka mailbox khali hai.' : 'Your mailbox is empty.')}
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
                          ? 'bg-indigo-50 border-l-4 border-indigo-600'
                          : msg.isRead
                          ? 'bg-transparent hover:bg-slate-100/70'
                          : 'bg-indigo-50/50 hover:bg-indigo-50 border-l-2 border-indigo-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 animate-pulse" />
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate ${
                            isQuiz
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {msg.senderName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap flex-shrink-0">
                          {formatTimestamp(msg.createdAt)}
                        </span>
                      </div>

                      <h4 className={`text-xs line-clamp-1 mb-1 ${
                        msg.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'
                      }`}>
                        {msg.subject}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {msg.preview}
                      </p>

                      {/* Quiz Pill Badges */}
                      {isQuiz && msg.quizReport && (
                        <div className="mt-2 flex items-center space-x-2 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold font-mono ${
                            passed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {accuracy}% Score
                          </span>
                          {msg.quizReport.coinsEarned > 0 && (
                            <span className="flex items-center space-x-1 text-amber-600 font-bold">
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
          <div className={`flex-1 flex flex-col bg-white overflow-y-auto ${
            !selectedMessage && 'hidden md:flex'
          }`}>
            {selectedMessage ? (
              <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedMessageId(null)}
                  className="md:hidden flex items-center space-x-1.5 text-xs text-indigo-600 font-bold mb-2 py-1 px-2.5 rounded-lg bg-indigo-50 border border-indigo-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHinglish ? '← Wapas Mail List Par' : 'Back to Inbox List'}</span>
                </button>

                {/* Message Header */}
                <div className="border-b border-slate-200 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-black text-sm shadow-xs">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">{selectedMessage.senderName}</p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {selectedMessage.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
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
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isHinglish ? 'Delete Karein' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {selectedMessage.subject}
                  </h3>
                </div>

                {/* QUIZ REPORT DIAGNOSTIC VIEW */}
                {selectedMessage.quizReport ? (
                  <div className="space-y-6">
                    
                    {/* Score Summary Card */}
                    <div className="bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/60 border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-sm">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{isHinglish ? 'Accuracy' : 'Accuracy'}</span>
                          <span className={`text-2xl sm:text-3xl font-black ${
                            selectedMessage.quizReport.accuracyPercent >= 70 ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {selectedMessage.quizReport.accuracyPercent}%
                          </span>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{isHinglish ? 'Score' : 'Score'}</span>
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">
                            {selectedMessage.quizReport.score} <span className="text-xs text-slate-500 font-normal">/ {selectedMessage.quizReport.totalQuestions}</span>
                          </span>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{isHinglish ? 'Mastery Status' : 'Mastery Status'}</span>
                          <span className={`text-xs font-black inline-block mt-1 px-2.5 py-1 rounded-full ${
                            selectedMessage.quizReport.passed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {selectedMessage.quizReport.passed ? (isHinglish ? 'Level Mastered 🎉' : 'Level Mastered 🎉') : (isHinglish ? 'Practice Ki Zaroorat' : 'Needs Practice')}
                          </span>
                        </div>

                        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{isHinglish ? 'Coins Jeete' : 'Coins Earned'}</span>
                          <div className="flex items-center justify-center space-x-1.5 mt-1 font-black text-lg text-amber-700">
                            <StudyCoinIcon className="w-5 h-5" glow />
                            <span>+{selectedMessage.quizReport.coinsEarned}</span>
                          </div>
                        </div>
                      </div>

                      {/* Meta Pills */}
                      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 uppercase">{selectedMessage.quizReport.board} Class {selectedMessage.quizReport.grade}</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-600 uppercase">{selectedMessage.quizReport.subjectId}</span>
                          <span>•</span>
                          <span className="font-mono text-purple-700 text-[11px] font-bold">{selectedMessage.quizReport.levelNode}</span>
                        </div>

                        <div className="flex items-center space-x-3 text-[11px]">
                          <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isHinglish ? 'Anti-Cheat Integrity Verified ✓' : 'Anti-Cheat Integrity Verified'}</span>
                          </span>
                          {selectedMessage.quizReport.timeSpentSeconds > 0 && (
                            <span className="flex items-center space-x-1 text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{selectedMessage.quizReport.timeSpentSeconds}s duration</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nova AI StudyGirl Commentary Card */}
                    <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 border border-purple-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                          <Zap className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800">Nova AI Tutor Diagnostic Note</h4>
                            <Sparkles className="w-3 h-3 text-purple-600" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                            {selectedMessage.quizReport.aiTutorFeedback}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conceptual Strengths & Focus Areas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Mastered Concepts */}
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Mastered Concepts ({selectedMessage.quizReport.masteredTopics.length})</span>
                        </div>
                        {selectedMessage.quizReport.masteredTopics.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedMessage.quizReport.masteredTopics.map((topic, i) => (
                              <span key={i} className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 text-[11px] font-semibold rounded-lg shadow-xs">
                                ✓ {topic}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">No topics fully mastered on this attempt.</p>
                        )}
                      </div>

                      {/* Weak Topics */}
                      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold mb-2">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Topics for Revision ({selectedMessage.quizReport.weakTopics.length})</span>
                        </div>
                        {selectedMessage.quizReport.weakTopics.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedMessage.quizReport.weakTopics.map((topic, i) => (
                              <span key={i} className="px-2.5 py-1 bg-white border border-amber-300 text-amber-800 text-[11px] font-semibold rounded-lg shadow-xs">
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
                          <BookOpen className="w-4 h-4 text-indigo-600" />
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
                                    ? 'bg-emerald-50/50 border-emerald-200'
                                    : 'bg-amber-50/50 border-amber-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {idx + 1}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                      {q.topicTag || 'Core Concept'}
                                    </span>
                                  </div>
                                  <span className={`text-[11px] font-bold flex items-center space-x-1 ${
                                    isCorrect ? 'text-emerald-700' : 'text-amber-700'
                                  }`}>
                                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-amber-600" />}
                                    <span>{isCorrect ? (isHinglish ? 'Sahi Jawab (+1)' : 'Correct (+1)') : (isHinglish ? 'Galat Answer' : 'Incorrect')}</span>
                                  </span>
                                </div>

                                <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 leading-relaxed">
                                  {q.questionText}
                                </p>

                                {/* Options Review */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                  {q.options.map((opt, optIdx) => {
                                    const isChosen = optIdx === q.chosenIndex;
                                    const isTargetCorrect = optIdx === q.correctIndex;

                                    let badgeStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                                    if (isTargetCorrect) {
                                      badgeStyle = 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-bold';
                                    } else if (isChosen && !isTargetCorrect) {
                                      badgeStyle = 'bg-rose-100/80 border-rose-300 text-rose-900 line-through';
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
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                        )}
                                        {isChosen && !isTargetCorrect && (
                                          <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Explanation & Step-by-step Solution */}
                                {q.explanation && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                                    <p className="font-bold text-slate-900 text-[11px] flex items-center space-x-1.5 text-indigo-700">
                                      <HelpCircle className="w-3 h-3 text-indigo-600" />
                                      <span>{isHinglish ? 'Concept Breakdown / Explanation:' : 'Conceptual Explanation:'}</span>
                                    </p>
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
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
                                      className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1 py-1 px-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                    >
                                      <Zap className="w-3 h-3 text-purple-600" />
                                      <span>{isHinglish ? 'Nova AI Tutor se samjho' : 'Ask Nova AI to explain this question'}</span>
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
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
                      {onNavigateToQuiz && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToQuiz(selectedMessage.quizReport?.subjectId);
                          }}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>{isHinglish ? `${selectedMessage.quizReport.subjectId.toUpperCase()} me aur practice karo →` : `Practice More in ${selectedMessage.quizReport.subjectId.toUpperCase()}`}</span>
                        </button>
                      )}
                    </div>

                  </div>
                ) : selectedMessage.category === 'NOVA_NOTE' || selectedMessage.sender === 'NOVA_AI' || selectedMessage.isCuteNote ? (
                  /* Cute Nova Mail Stationery View */
                  <div className="space-y-5 animate-in fade-in">
                    <div className="bg-gradient-to-br from-pink-50 via-rose-50/50 to-indigo-50/50 border-2 border-pink-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 relative overflow-hidden">
                      <div className="flex items-center space-x-3 pb-4 border-b border-pink-200/60">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white shadow-md text-xl shrink-0">
                          🎧
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-black text-sm text-pink-950">nova • your study bestie</h4>
                            <span className="text-[10px] bg-pink-200/80 text-pink-800 px-2.5 py-0.5 rounded-full font-bold">
                              20-Min Study Boost 🎀
                            </span>
                          </div>
                          <p className="text-[11px] text-pink-700/80 font-medium mt-0.5">
                            personalized check-in for you • {formatTimestamp(selectedMessage.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Letter Body */}
                      <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap bg-white/70 border border-pink-100 rounded-2xl p-5 shadow-2xs">
                        {selectedMessage.body}
                      </div>

                      {/* Cute Action Bar */}
                      <div className="pt-4 border-t border-pink-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="text-xs text-pink-800 font-bold flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
                          <span>{isHinglish ? '1 quick quiz abhi solve karke Study Coins kamao! 🪙' : 'Solve 1 quick quiz now to stack up Study Coins! 🪙'}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {onNavigateToQuiz && (
                            <button
                              onClick={() => {
                                onClose();
                                onNavigateToQuiz(selectedMessage.quizActionSubject || 'math');
                              }}
                              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-black text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer transform hover:scale-102"
                            >
                              <span>{isHinglish ? 'Cute 2-Min Quiz Khele 🎀' : 'Do Cute 2-Min Quiz 🎀'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onOpenNovaAi && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenNovaAi("Hey Nova! I got your mailbox note 🎀", "Let's review my syllabus!");
                              }}
                              className="px-4 py-2.5 rounded-xl bg-white hover:bg-pink-100/80 text-pink-900 border border-pink-300 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                            >
                              <Zap className="w-3.5 h-3.5 text-pink-500" />
                              <span>{isHinglish ? 'Nova Se Chat Karein 💬' : 'Chat with Nova 💬'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard text message view */
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.body}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Mail className="w-12 h-12 mb-3 text-slate-300 opacity-80" />
                <h4 className="text-sm font-bold text-slate-700">Select a message</h4>
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
