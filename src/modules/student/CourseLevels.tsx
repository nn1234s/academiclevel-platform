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
  const levels = CurriculumService.getLevels(learner.board, learner.grade, subjectId);
  const staticChapters = CurriculumService.getChaptersForSubject(learner.board, learner.grade, subjectId);
  const progressList = StorageRLSLayer.getProgressForLearner(learner.id, learner.id);
  const quota = QuotaService.evaluateQuota(learner);

  const [activeTab, setActiveTab] = useState<'TIERS' | 'CHAPTERS'>('TIERS');
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [serverChapters, setServerChapters] = useState<{ chapter: string; questionCount: number }[]>([]);

  useEffect(() => {
    OfflineBankService.fetchChapters(learner.board, learner.grade, subjectId).then(chs => {
      if (chs && chs.length > 0) {
        setServerChapters(chs);
      }
    });
  }, [learner.board, learner.grade, subjectId]);

  const toggleNotes = (levelId: string) => {
    setOpenNotes(prev => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const getProgressForNode = (node: LevelNode) => {
    return progressList.find(
      p =>
        p.board === learner.board &&
        p.grade === learner.grade &&
        p.subjectId === subjectId &&
        p.levelNode === node
    );
  };

  const handleStartLevel = (node: LevelNode, questionCount: number) => {
    if (quota.isLocked) {
      onOpenUpgradeModal();
      return;
    }
    onStartQuiz(node, questionCount);
  };

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
          {subjectId.toUpperCase()} Mastery Pathway
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-xl">
          Choose between <strong>4-Tier Progression Pathways</strong> (Foundation, Concept, Exam Ready, Olympiad) or <strong>Chapter-Wise Practice</strong> (Addition, Subtraction, Quadratic Equations, Trigonometry) strictly calibrated to {learner.board} marking standards.
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

        {/* View Mode Switcher */}
        <div className="mt-6 flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('TIERS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TIERS'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4-Tier Level Mastery</span>
          </button>
          <button
            onClick={() => setActiveTab('CHAPTERS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CHAPTERS'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chapter-Wise Syllabus Practice</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 4-TIER PROGRESSION NODES */}
      {activeTab === 'TIERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.map((level, idx) => {
            const progress = getProgressForNode(level.node);
            const isDone = progress?.isCompleted;
            const bestScore = progress?.bestScorePercent || 0;
            const isNotesExpanded = !!openNotes[level.id];

            return (
              <div
                key={level.id}
                className={`bg-white border rounded-3xl p-6 flex flex-col justify-between shadow-xs transition-all ${
                  isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      Tier {idx + 1} • {level.node}
                    </span>
                    {isDone ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Mastered ({bestScore.toFixed(0)}%)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-700 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>+25 Coins Reward</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{level.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{level.description}</p>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      Curriculum Topics Covered:
                    </span>
                    {level.topics.map((t, tIdx) => (
                      <div key={tIdx} className="text-xs text-slate-700 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>

                  {/* Structured Revision Notes Accordion */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => toggleNotes(level.id)}
                      className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Chapter Revision Notes</span>
                      </div>
                      {isNotesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isNotesExpanded && (
                      <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2.5 animate-fadeIn">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-800 block text-[11px]">Core Concept Focus:</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                              Focus on understanding step-by-step logic and clear definitions in {level.topics.slice(0, 2).join(' and ')}.
                              Always label your units and state assumptions clearly in {learner.board} evaluations.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-2 border-t border-slate-200">
                          <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-indigo-800 block text-[11px]">Board Marking Key:</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                              Step-marking is awarded for accurate formulas before substitution. Review common sign errors and boundary conditions before submitting.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{level.questionCount} Questions</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{level.estimatedMinutes} Mins</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartLevel(level.node, level.questionCount)}
                    className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isDone
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <span>{isDone ? 'Retake Practice' : 'Start Assessment'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CHAPTER-WISE SYLLABUS PRACTICE */}
      {activeTab === 'CHAPTERS' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between text-xs text-indigo-950">
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
      )}
    </div>
  );
};
