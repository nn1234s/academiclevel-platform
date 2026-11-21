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
  GraduationCap
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
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Catalogue</span>
      </button>

      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            {learner.board} Class {learner.grade} • Syllabus Architecture
          </span>
          <span className="text-xs text-amber-400 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+25 Coins Reward per Assessment</span>
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          {subjectId.toUpperCase()} Mastery Pathway
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Choose between <strong>4-Tier Progression Pathways</strong> (Foundation, Concept, Exam Ready, Olympiad) or <strong>Chapter-Wise Practice</strong> (Addition, Subtraction, Quadratic Equations, Trigonometry) strictly calibrated to {learner.board} marking standards.
        </p>

        {/* View Mode Switcher */}
        <div className="mt-6 flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('TIERS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TIERS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4-Tier Level Mastery</span>
          </button>
          <button
            onClick={() => setActiveTab('CHAPTERS')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CHAPTERS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                : 'text-slate-400 hover:text-white'
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
                className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between shadow-xl transition-all ${
                  isDone ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800 hover:border-indigo-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      Tier {idx + 1} • {level.node}
                    </span>
                    {isDone ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mastered ({bestScore.toFixed(0)}%)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+25 Coins Reward</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-snug">{level.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{level.description}</p>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      Curriculum Topics Covered:
                    </span>
                    {level.topics.map((t, tIdx) => (
                      <div key={tIdx} className="text-xs text-slate-300 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>

                  {/* Structured Revision Notes Accordion */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => toggleNotes(level.id)}
                      className="w-full flex items-center justify-between py-1.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Chapter Revision Notes</span>
                      </div>
                      {isNotesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isNotesExpanded && (
                      <div className="mt-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-2.5 animate-fadeIn">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300 block text-[11px]">Core Concept Focus:</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                              Focus on understanding step-by-step logic and clear definitions in {level.topics.slice(0, 2).join(' and ')}.
                              Always label your units and state assumptions clearly in {learner.board} evaluations.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2 pt-2 border-t border-slate-800">
                          <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-indigo-300 block text-[11px]">Board Marking Key:</span>
                            <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                              Step-marking is awarded for accurate formulas before substitution. Review common sign errors and boundary conditions before submitting.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
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
                    className={`px-4 py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isDone
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950'
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Questions are grouped strictly by chapter so you can practice topics one-by-one with zero topic jumbling!</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {staticChapters.length} Chapters Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staticChapters.map(ch => (
              <div
                key={ch.id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 flex flex-col justify-between shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {ch.badge}
                    </span>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>+25 Coins</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-snug">{ch.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{ch.description}</p>

                  <div className="mt-3.5 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      Sub-Topics:
                    </span>
                    {ch.topics.map((t, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
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
                    className="px-4 py-2 font-bold text-xs rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center space-x-1.5 cursor-pointer"
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
