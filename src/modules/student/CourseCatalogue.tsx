import React from 'react';
import { Learner } from '../../core/types';
import { CurriculumService } from '../../services/curriculumService';
import { BookOpen, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface CourseCatalogueProps {
  learner: Learner;
  onSelectSubject: (subjectId: string) => void;
}

export const CourseCatalogue: React.FC<CourseCatalogueProps> = ({ learner, onSelectSubject }) => {
  const subjects = CurriculumService.getSubjects(learner.board, learner.grade);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-100">
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Curriculum Scope
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {learner.board} Syllabus • Class {learner.grade}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Strictly tailored to the official learning milestones of {learner.board}. Choose a discipline to advance through the 4-tier mastery nodes.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[140px]">
          <span className="text-[11px] text-slate-400 block font-medium">Subjects Available</span>
          <span className="text-2xl font-black text-white">{subjects.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.01] shadow-xl flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                {subject.icon}
              </div>
              <h3 className="font-extrabold text-white text-lg">{subject.name}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{subject.description}</p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold">
              <span>View 4 Progression Nodes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
