import React, { useState, useEffect } from 'react';
import { Board, Grade, LevelNode, Question } from '../../core/types';
import { OfflineBankService } from '../../services/offlineBankService';
import { HybridQuizService, AiConfig } from '../../services/hybridQuizService';
import {
  Database,
  Plus,
  Check,
  RefreshCw,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

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

  // AI Hybrid State
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    hasApiKey: false,
    preferLiveAi: true,
    model: 'gemini-2.5-flash'
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; message?: string; error?: string } | null>(null);
  const [isGeneratingAiSample, setIsGeneratingAiSample] = useState(false);
  const [aiSampleQuestions, setAiSampleQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    HybridQuizService.getConfig().then(cfg => {
      setAiConfig(cfg);
      if (cfg.hasApiKey && !apiKeyInput) {
        setApiKeyInput(HybridQuizService.getClientStoredKey() || '');
      }
    });
  }, []);

  const refreshList = () => {
    setQuestions(OfflineBankService.getQuestions(board, grade, subjectId, levelNode));
  };

  const handleSaveAiConfig = async () => {
    const res = await HybridQuizService.saveConfig(apiKeyInput, aiConfig.preferLiveAi);
    const updated = await HybridQuizService.getConfig();
    setAiConfig(updated);
    setNotice(res.message);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleTestAiPing = async () => {
    setIsTestingAi(true);
    setTestResult(null);
    try {
      const res = await HybridQuizService.testConnection(apiKeyInput);
      setTestResult(res);
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleGenerateLiveSample = async () => {
    setIsGeneratingAiSample(true);
    setAiSampleQuestions(null);
    try {
      const res = await HybridQuizService.getQuestions(board, grade, subjectId, levelNode, 3);
      setAiSampleQuestions(res.questions);
      setNotice(
        res.source === 'GEMINI_LIVE'
          ? `✨ Successfully synthesized 3 questions via ${res.model || 'Gemini 1.5 Flash'}!`
          : `🛡️ Loaded 3 questions via Curated Syllabus Bank (${res.notice || 'fallback'})`
      );
      setTimeout(() => setNotice(''), 4000);
    } finally {
      setIsGeneratingAiSample(false);
    }
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
      topicTag: 'Admin Verified Node',
      source: 'CURATED_OFFLINE'
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Question Bank & Hybrid AI Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic Google Gemini 1.5 Flash question synthesis paired with resilient offline syllabus fallback.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add Fallback Question'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* HYBRID AI ENGINE CONTROL CARD */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Google Gemini Hybrid AI Architecture</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {aiConfig.model}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Primary: Live Gemini AI question synthesis • Fallback: Curated Syllabus Bank (Zero-latency)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              aiConfig.hasApiKey
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
            }`}>
              {aiConfig.hasApiKey ? '● Gemini API Key Armed' : '○ Resilient Offline Mode (No Key Set)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Configuration */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Gemini API Key:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {aiConfig.maskedApiKey ? `Active: ${aiConfig.maskedApiKey}` : 'process.env.GEMINI_API_KEY'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (Paste Gemini Key here to activate Live AI)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Key is stored securely in the server SQLite database & browser state. If left blank, offline bank serves 100% of quizzes.
            </p>
          </div>

          {/* Mode Switch & Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Hybrid Preference</span>
                <span className="text-[10px] text-slate-400">
                  {aiConfig.preferLiveAi ? 'Try Gemini Live First -> Fallback on offline/error' : 'Force Curated Syllabus Bank Only'}
                </span>
              </div>
              <button
                onClick={() => {
                  const newVal = !aiConfig.preferLiveAi;
                  setAiConfig(prev => ({ ...prev, preferLiveAi: newVal }));
                  HybridQuizService.saveConfig(apiKeyInput, newVal);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  aiConfig.preferLiveAi
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {aiConfig.preferLiveAi ? '✨ Live AI First' : '🛡️ Bank Only'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveAiConfig}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Save API Key
              </button>
              <button
                onClick={handleTestAiPing}
                disabled={isTestingAi}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center space-x-1"
              >
                <Zap className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin' : ''}`} />
                <span>{isTestingAi ? 'Pinging...' : 'Ping Test'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ping Test Feedback */}
        {testResult && (
          <div className={`p-3 rounded-2xl text-xs border flex items-center justify-between ${
            testResult.success
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
              <span>{testResult.message || testResult.error}</span>
            </div>
            {testResult.latencyMs !== undefined && (
              <span className="font-mono text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                {testResult.latencyMs}ms latency
              </span>
            )}
          </div>
        )}

        {/* Live Generation Sandbox for Admin */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Preview live AI generation for <strong className="text-white">{board} Class {grade} {subjectId.toUpperCase()}</strong>:
          </div>
          <button
            onClick={handleGenerateLiveSample}
            disabled={isGeneratingAiSample}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Play className={`w-3.5 h-3.5 ${isGeneratingAiSample ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAiSample ? 'Synthesizing...' : 'Generate 3 Live Sample Questions'}</span>
          </button>
        </div>

        {/* AI Sample Questions Output */}
        {aiSampleQuestions && (
          <div className="space-y-3 pt-3">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wide">
              Live Synthesis Preview:
            </span>
            <div className="space-y-2">
              {aiSampleQuestions.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-purple-500/30 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white">Q{idx + 1}. {q.text}</span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800">
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 my-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-1.5 rounded-lg border ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">💡 {q.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
            <option value="biology">Biology</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 font-mono mb-1">Progression Node</label>
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
            <option value="EXAM_READY">Exam Ready</option>
            <option value="OLYMPIAD">Olympiad</option>
          </select>
        </div>
      </div>

      {/* Add Question Form Modal / Expandable */}
      {isAdding && (
        <form onSubmit={handleCreateQuestion} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Append Curated Fallback Question ({board} Class {grade} {subjectId.toUpperCase()})</span>
          </h3>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Question Statement</label>
            <textarea
              required
              rows={2}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="e.g. Find the discriminant of 2x² - 4x + 3 = 0"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Option A</label>
              <input
                required
                value={opt0}
                onChange={e => setOpt0(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Option B</label>
              <input
                required
                value={opt1}
                onChange={e => setOpt1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Option C</label>
              <input
                value={opt2}
                onChange={e => setOpt2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Option D</label>
              <input
                value={opt3}
                onChange={e => setOpt3(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Correct Option</label>
              <select
                value={correctIdx}
                onChange={e => setCorrectIdx(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Hint</label>
              <input
                value={hint}
                onChange={e => setHint(e.target.value)}
                placeholder="Formula or clue"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Explanation</label>
              <input
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Step-by-step solution"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Commit Question to Offline Fallback Bank</span>
          </button>
        </form>
      )}

      {/* Curated Fallback Question Listing */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-slate-400">
            Curated Fallback Bank for {board} Class {grade} ({questions.length} questions):
          </span>
          <button
            onClick={refreshList}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white leading-relaxed">
                  #{idx + 1}. {q.text}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 flex-shrink-0">
                  {q.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2 rounded-xl border ${
                      oIdx === q.correctIndex
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 font-semibold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}. {opt}
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex flex-wrap justify-between gap-2">
                <span>💡 {q.explanation}</span>
                <span className="text-slate-500 font-mono text-[10px]">ID: {q.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
