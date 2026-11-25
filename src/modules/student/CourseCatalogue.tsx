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
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 text-slate-900">
      <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-700 uppercase bg-indigo-100 border border-indigo-200 px-2.5 sm:px-3 py-1 rounded-full">
            Curriculum Scope
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {learner.board} Syllabus • Class {learner.grade}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
            Strictly tailored to the official learning milestones of {learner.board}. Choose a discipline to advance through the 4-tier mastery nodes.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 sm:p-4 text-center flex sm:block items-center justify-between w-full sm:w-auto sm:min-w-[140px]">
          <span className="text-[11px] text-slate-500 block font-medium">Subjects Available</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{subjects.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {subjects.map(subject => (
          <div
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                {subject.icon}
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">{subject.name}</h3>
              <p className="text-xs text-slate-600 mt-1.5 sm:mt-2 leading-relaxed">{subject.description}</p>
            </div>

            <div className="mt-5 sm:mt-8 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold group-hover:text-indigo-800">
              <span>Practice Syllabus Chapters</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
