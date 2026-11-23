import React, { useState, useEffect } from 'react';
import { Learner, LevelNode } from '../../core/types';
import { CurriculumService } from '../../services/curriculumService';
import { OfflineBankService } from '../../services/offlineBankService';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { QuotaService } from '../../services/quotaService';
import {
  Compass,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileText,
  Layers,
  GraduationCap,
  Zap
} from 'lucide-react';

interface CourseLevelsProps {
  learner: Learner;
  subjectId: string;
  onBack: () => void;
  onStartQuiz: (levelNode: LevelNode, questionCount: number, chapter?: string) => void;
  onOpenUpgradeModal: () => void;
}

export const CourseLevels: React.FC<CourseLevelsProps> = ({
  learner,
  subjectId,
  onBack,
  onStartQuiz,
  onOpenUpgradeModal,
}) => {
  const staticChapters = CurriculumService.getChaptersForSubject(learner.board, learner.grade, subjectId);
  const quota = QuotaService.evaluateQuota(learner);
  const [serverChapters, setServerChapters] = useState<{ chapter: string; questionCount: number }[]>([]);

  useEffect(() => {
    OfflineBankService.fetchChapters(learner.board, learner.grade, subjectId).then(chs => {
      if (chs && chs.length > 0) {
        setServerChapters(chs);
      }
    });
  }, [learner.board, learner.grade, subjectId]);

  const handleStartChapter = (chapterTitle: string, questionCount: number) => {
    if (quota.isLocked) {
      onOpenUpgradeModal();
      return;
    }
    onStartQuiz('FOUNDATION', questionCount, chapterTitle);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900">
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Catalogue</span>
      </button>

      <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-700 uppercase bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full">
            {learner.board} Class {learner.grade} • Syllabus Architecture
          </span>
          <span className="text-xs text-amber-700 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>+25 Coins Reward per Assessment</span>
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {subjectId.toUpperCase()} Syllabus Chapters
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-xl">
          Complete chapter-wise syllabus practice calibrated strictly to {learner.board} Class {learner.grade} marking standards. Practice topics one-by-one with zero topic jumbling!
        </p>

        {/* Free Account Tier Indicator */}
        {!quota.hasActiveSubscription && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-800">
              <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Free Student Account:</strong> {quota.levelsCompleted} of {quota.maxLevels} curriculum levels completed.
                {quota.isLocked ? ' (Free limit reached! Upgrade to unlock all levels)' : ' (First 3 levels free)'}
              </span>
            </div>
            <button
              onClick={onOpenUpgradeModal}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              Upgrade to Unlimited (₹49)
            </button>
          </div>
        )}
      </div>

      {/* CHAPTER-WISE SYLLABUS PRACTICE */}
      <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-indigo-950">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Questions are grouped strictly by chapter so you can practice topics one-by-one with zero topic jumbling!</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-300">
              {staticChapters.length} Chapters Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staticChapters.map(ch => (
              <div
                key={ch.id}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-3xl p-5 flex flex-col justify-between shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {ch.badge}
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>+25 Coins</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{ch.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{ch.description}</p>

                  <div className="mt-3.5 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      Sub-Topics:
                    </span>
                    {ch.topics.map((t, idx) => (
                      <div key={idx} className="text-xs text-slate-700 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{ch.questionCount} Questions</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{ch.estimatedMinutes} Mins</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartChapter(ch.title, ch.questionCount)}
                    className="px-4 py-2 font-bold text-xs rounded-xl shadow-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Practice Chapter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};
