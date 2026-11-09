import React from 'react';
import { Learner, LevelNode } from '../../core/types';
import { CurriculumService } from '../../services/curriculumService';
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
  Lock
} from 'lucide-react';

interface CourseLevelsProps {
  learner: Learner;
  subjectId: string;
  onBack: () => void;
  onStartQuiz: (levelNode: LevelNode) => void;
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
  const progressList = StorageRLSLayer.getProgressForLearner(learner.id, learner.id);
  const quota = QuotaService.evaluateQuota(learner);

  const getProgressForNode = (node: LevelNode) => {
    return progressList.find(
      p =>
        p.board === learner.board &&
        p.grade === learner.grade &&
        p.subjectId === subjectId &&
        p.levelNode === node
    );
  };

  const handleNodeClick = (node: LevelNode) => {
    if (quota.isLocked) {
      onOpenUpgradeModal();
      return;
    }
    onStartQuiz(node);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Course Catalogue</span>
      </button>

      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          4-Tier Progression Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          {subjectId.toUpperCase()} Mastery Pathway
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-lg">
          Advance systematically through Foundation, Conceptual Applications, {learner.board} Exam Simulations, and Olympiad Reasoning. Complete any node with $\ge 70\%$ accuracy to earn <strong className="text-amber-400">+25 Study Coins</strong> and an official Mastery Certificate!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map((level, idx) => {
          const progress = getProgressForNode(level.node);
          const isDone = progress?.isCompleted;
          const bestScore = progress?.bestScorePercent || 0;

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
                  onClick={() => handleNodeClick(level.node)}
                  className={`px-4 py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 ${
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
    </div>
  );
};
