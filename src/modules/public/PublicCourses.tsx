import React, { useState } from 'react';
import { Board, Grade } from '../../core/types';
import { CurriculumService } from '../../services/curriculumService';
import { ArrowRight, BookOpen, Compass } from 'lucide-react';

interface PublicCoursesProps {
  onSelectTrack: (board: Board, grade: Grade) => void;
}

export const PublicCourses: React.FC<PublicCoursesProps> = ({ onSelectTrack }) => {
  const [board, setBoard] = useState<Board>('CBSE');
  const [grade, setGrade] = useState<Grade>(10);

  const subjects = CurriculumService.getSubjects(board, grade);

  return (
    <div className="max-w-5xl mx-auto space-y-12 text-slate-100 py-6 px-4">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          Comprehensive Board Coverage
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-3">
          Curriculum & Progression Nodes
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Strictly aligned with official syllabus frameworks for CBSE, ICSE/CISCE, and Cambridge IGCSE across Classes 1 to 12.
        </p>

        {/* Filter controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            {(['CBSE', 'ICSE', 'IGCSE'] as Board[]).map(b => (
              <button
                key={b}
                onClick={() => setBoard(b)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  board === b ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <select
            value={grade}
            onChange={e => setGrade(Number(e.target.value) as Grade)}
            className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none"
          >
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
              <option key={g} value={g}>Class {g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(s => {
          const levels = CurriculumService.getLevels(board, grade, s.id);
          return (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-4">
                  {s.icon}
                </div>
                <h3 className="font-extrabold text-white text-base">{s.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Available Nodes:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {levels.map(l => (
                      <span key={l.node} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-indigo-300 font-mono">
                        {l.node}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectTrack(board, grade)}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Enroll in {s.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
