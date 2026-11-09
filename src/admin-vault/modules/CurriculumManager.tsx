import React, { useState } from 'react';
import { Board, Grade, Subject } from '../../core/types';
import { CurriculumService } from '../../services/curriculumService';
import { BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const CurriculumManager: React.FC = () => {
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(10);

  const subjects = CurriculumService.getSubjects(selectedBoard, selectedGrade);

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Curriculum & Board Alignment Manager</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Inspect syllabus mappings, 4 progression nodes, and board-specific topic boundaries across Classes 1–12.
        </p>
      </div>

      {/* Board & Grade Selector */}
      <div className="flex flex-wrap gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Select Board:</span>
          {(['CBSE', 'ICSE', 'IGCSE'] as Board[]).map(b => (
            <button
              key={b}
              onClick={() => setSelectedBoard(b)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedBoard === b
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Select Class:</span>
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(Number(e.target.value) as Grade)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white focus:outline-none"
          >
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
              <option key={g} value={g}>Class {g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects & Progression Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map(s => {
          const levels = CurriculumService.getLevels(selectedBoard, selectedGrade, s.id);
          return (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-sm">{s.name}</h3>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                  Configured Progression Nodes:
                </span>
                {levels.map(l => (
                  <div
                    key={l.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{l.node}</span>
                      <p className="text-[10px] text-slate-500">{l.questionCount} Questions • ~{l.estimatedMinutes}m</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Live</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
