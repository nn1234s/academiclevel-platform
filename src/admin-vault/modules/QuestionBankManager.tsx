import React, { useState } from 'react';
import { Board, Grade, LevelNode, Question } from '../../core/types';
import { OfflineBankService } from '../../services/offlineBankService';
import { Database, Plus, Check, RefreshCw } from 'lucide-react';

export const QuestionBankManager: React.FC = () => {
  const [board, setBoard] = useState<Board>('CBSE');
  const [grade, setGrade] = useState<Grade>(10);
  const [subjectId, setSubjectId] = useState<string>('math');
  const [levelNode, setLevelNode] = useState<LevelNode>('FOUNDATION');

  const [questions, setQuestions] = useState<Question[]>(() =>
    OfflineBankService.getQuestions('CBSE', 10, 'math', 'FOUNDATION')
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [hint, setHint] = useState('');
  const [notice, setNotice] = useState('');

  const refreshList = () => {
    setQuestions(OfflineBankService.getQuestions(board, grade, subjectId, levelNode));
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !opt0 || !opt1) return;

    const q: Question = {
      id: `q_custom_${Date.now()}`,
      board,
      grade,
      subjectId,
      levelNode,
      text: newText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correctIndex: correctIdx,
      explanation: explanation.trim() || 'Verified step-by-step solution.',
      hint: hint.trim() || 'Key concept hint.',
      difficulty: levelNode === 'OLYMPIAD' ? 'HARD' : 'MEDIUM',
      topicTag: 'Admin Verified Node'
    };

    OfflineBankService.saveCustomQuestion(q);
    setNotice(`Successfully appended Question ${q.id} to bank.`);
    setIsAdding(false);
    setNewText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    refreshList();
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Question Bank & Fallback Repository</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage syllabus-aligned questions utilized by the AI Quiz Engine and Offline Fallback cache.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add New Question'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300">
          {notice}
        </div>
      )}

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div>
          <label className="block text-[10px] text-slate-400 font-mono mb-1">Board</label>
          <select
            value={board}
            onChange={e => {
              setBoard(e.target.value as any);
              refreshList();
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
          >
            <option value="CBSE">CBSE</option>
            <option value="ICSE">ICSE</option>
            <option value="IGCSE">IGCSE</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 font-mono mb-1">Class</label>
          <select
            value={grade}
            onChange={e => {
              setGrade(Number(e.target.value) as any);
              refreshList();
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
          >
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
              <option key={g} value={g}>Class {g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 font-mono mb-1">Subject</label>
          <select
            value={subjectId}
            onChange={e => {
              setSubjectId(e.target.value);
              refreshList();
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
          >
            <option value="math">Mathematics</option>
            <option value="science">Science</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="english">English</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 font-mono mb-1">Tier Node</label>
          <select
            value={levelNode}
            onChange={e => {
              setLevelNode(e.target.value as any);
              refreshList();
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
          >
            <option value="FOUNDATION">Foundation</option>
            <option value="CONCEPT">Concept</option>
            <option value="EXAM_READY">Exam-Ready</option>
            <option value="OLYMPIAD">Olympiad</option>
          </select>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreateQuestion} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm">Add Verified Syllabus Question</h3>
          <div>
            <label className="block text-slate-400 mb-1">Question Text</label>
            <textarea
              required
              rows={2}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Option A</label>
              <input required type="text" value={opt0} onChange={e => setOpt0(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Option B</label>
              <input required type="text" value={opt1} onChange={e => setOpt1(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Option C</label>
              <input required type="text" value={opt2} onChange={e => setOpt2(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Option D</label>
              <input required type="text" value={opt3} onChange={e => setOpt3(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Correct Answer Index</label>
              <select
                value={correctIdx}
                onChange={e => setCorrectIdx(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Hint / Exam Tip</label>
              <input type="text" value={hint} onChange={e => setHint(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Step-by-Step Explanation</label>
            <textarea rows={2} value={explanation} onChange={e => setExplanation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </div>

          <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md">
            Save to Question Bank
          </button>
        </form>
      )}

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">
          Active Questions for {board} Class {grade} ({subjectId.toUpperCase()} • {levelNode}) — {questions.length} Items
        </h3>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] text-indigo-400 font-bold">Q#{idx + 1} • {q.id}</span>
                <span className="text-[10px] text-slate-500">{q.difficulty}</span>
              </div>
              <p className="font-semibold text-slate-200">{q.text}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={oIdx === q.correctIndex ? 'text-emerald-400 font-bold' : ''}>
                    {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctIndex ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
