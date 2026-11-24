import React, { useState } from 'react';
import { Learner, ParentWeeklyReport } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import {
  X,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Flame,
  Award,
  Target,
  Trophy,
  ShieldCheck,
  Bot
} from 'lucide-react';

interface ParentReportCardModalProps {
  learner: Learner;
  isOpen: boolean;
  onClose: () => void;
}

export const ParentReportCardModal: React.FC<ParentReportCardModalProps> = ({
  learner,
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const isHinglish = language === 'hi';
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const report: ParentWeeklyReport = StorageRLSLayer.getParentWeeklyReport(learner.id);

  const whatsappMessage = `🎓 *ACADEMICLEVEL SCHOLAR REPORT CARD* 🎓
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${report.learnerName}
📚 *Class:* Grade ${report.grade} (${report.board})
📅 *Date:* ${report.generatedDate}

📊 *WEEKLY PERFORMANCE HIGHLIGHTS:*
🎯 *Accuracy Rate:* ${report.weeklyAccuracyPercent}%
🔥 *Study Streak:* ${report.currentStreakDays} Days Active
🪙 *Coins Earned:* +${report.weeklyCoinsEarned} Study Coins
🏆 *Scholar League:* ${report.leagueTier} Division (Rank #${report.leagueRank})
📝 *Quizzes Solved:* ${report.weeklyQuizzesCount} Quizzes (${report.weeklyQuestionsSolved} Questions)
⭐ *Top Subject:* ${report.topSubject}

💡 *NOVA AI MENTOR FEEDBACK:*
"${report.novaFeedback}"

━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Check full live analytics & rewards at: https://academiclevel.in`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-blue-200 font-bold block">
                Official Scholar Diagnostic
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center space-x-1.5">
                <span>{isHinglish ? 'Parents Weekly Report Card' : 'Parent Weekly Progress Card'}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 print:p-0">
          {/* Student Profile Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{report.learnerName}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Class {report.grade} • {report.board} Curriculum • {report.generatedDate}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              Active Scholar
            </span>
          </div>

          {/* 4 Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 text-center">
              <Target className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-lg font-black text-indigo-950">{report.weeklyAccuracyPercent}%</p>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Accuracy</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-center">
              <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-black text-amber-950">{report.currentStreakDays} Days</p>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Study Streak</span>
            </div>

            <div className="bg-yellow-50/70 border border-yellow-200/80 rounded-2xl p-3.5 text-center">
              <div className="flex justify-center mb-1">
                <StudyCoinIcon className="w-5 h-5" glow />
              </div>
              <p className="text-lg font-black text-amber-950">+{report.weeklyCoinsEarned}</p>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Coins Earned</span>
            </div>

            <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5 text-center">
              <Trophy className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-black text-purple-950">Rank #{report.leagueRank}</p>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">{report.leagueTier} League</span>
            </div>
          </div>

          {/* Performance Summary Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Syllabus Quizzes Completed:</span>
              <span className="font-extrabold text-slate-800">{report.weeklyQuizzesCount} Quizzes ({report.weeklyQuestionsSolved} Qs)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Strongest Subject:</span>
              <span className="font-extrabold text-emerald-700">{report.topSubject} ⭐</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Recommended Next Goal:</span>
              <span className="font-extrabold text-indigo-700">{report.weakAreaToFocus}</span>
            </div>
          </div>

          {/* Nova AI Personalized Teacher Feedback */}
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200/70 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-900 font-extrabold text-xs">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Nova AI Tutor Note for Parents:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{report.novaFeedback}"
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{isHinglish ? 'Mummy/Papa ko WhatsApp karein 📱' : 'Send to Parents on WhatsApp 📱'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
