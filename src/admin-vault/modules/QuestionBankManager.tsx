import React, { useState, useEffect } from 'react';
import { Board, Grade, LevelNode, Question } from '../../core/types';
import { OfflineBankService } from '../../services/offlineBankService';
import { HybridQuizService, AiConfig, KeyTestResult } from '../../services/hybridQuizService';
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
  Play,
  Layers,
  ShieldCheck,
  Copy,
  Trash2
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

  // AI Hybrid State with 5-Key Cascading Failover Pool
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    hasApiKey: false,
    keyCount: 0,
    preferLiveAi: true,
    model: 'gemini-3.5-flash-lite'
  });
  const [apiKeysList, setApiKeysList] = useState<string[]>(['', '', '', '', '']);
  const [showKeys, setShowKeys] = useState<boolean[]>([false, false, false, false, false]);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [poolTestResults, setPoolTestResults] = useState<{
    success: boolean;
    message?: string;
    workingCount?: number;
    totalTested?: number;
    results?: KeyTestResult[];
  } | null>(null);
  const [isGeneratingAiSample, setIsGeneratingAiSample] = useState(false);
  const [aiSampleQuestions, setAiSampleQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    HybridQuizService.getConfig().then(cfg => {
      setAiConfig(cfg);
      const storedPool = HybridQuizService.getClientStoredKeysPool();
      const initialKeys = ['', '', '', '', ''];
      for (let i = 0; i < 5; i++) {
        if (storedPool[i]) {
          initialKeys[i] = storedPool[i];
        }
      }
      setApiKeysList(initialKeys);
    });
  }, []);

  const refreshList = () => {
    setQuestions(OfflineBankService.getQuestions(board, grade, subjectId, levelNode));
  };

  const handleKeyChange = (index: number, value: string) => {
    setApiKeysList(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const toggleShowKey = (index: number) => {
    setShowKeys(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handlePasteKey = async (index: number) => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        handleKeyChange(index, clipText.trim());
      }
    } catch {
      const entered = window.prompt(`Paste Gemini API Key for Slot #${index + 1}:`);
      if (entered) handleKeyChange(index, entered.trim());
    }
  };

  const handleClearKey = (index: number) => {
    handleKeyChange(index, '');
  };

  const handleSaveAiConfig = async () => {
    const cleanKeys = apiKeysList.map(k => k.trim()).filter(Boolean);
    const res = await HybridQuizService.saveConfig(cleanKeys, aiConfig.preferLiveAi);
    const updated = await HybridQuizService.getConfig();
    setAiConfig(updated);
    setNotice(res.message || `Saved ${cleanKeys.length} API Key(s) to server failover pool!`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleTestAiPingAll = async () => {
    setIsTestingAi(true);
    setPoolTestResults(null);
    try {
      const activeKeys = apiKeysList.map(k => k.trim()).filter(Boolean);
      const res = await HybridQuizService.testConnection(undefined, true, activeKeys.length > 0 ? activeKeys : undefined);
      setPoolTestResults(res);
      if (res.success) {
        setNotice(`✅ Failover Pool Verified: ${res.workingCount || 0}/${res.totalTested || 0} keys operational.`);
      } else {
        setNotice(`⚠️ Failover Pool Alert: ${res.message || 'Key test failed.'}`);
      }
      setTimeout(() => setNotice(''), 5000);
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
              (aiConfig.keyCount || 0) > 0 || apiKeysList.some(k => k.trim())
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-700/60 text-amber-300'
            }`}>
              {(aiConfig.keyCount || 0) > 0 || apiKeysList.some(k => k.trim())
                ? `● ${apiKeysList.filter(k => k.trim()).length || aiConfig.keyCount || 1}/5 Keys Armed in Pool`
                : '○ Offline Mode (No Keys in Pool)'}
            </span>
          </div>
        </div>

        {/* 5-Key Cascading Failover Pipeline Banner */}
        <div className="bg-slate-950/70 border border-indigo-950 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Key Real-Time Failover Pool (Cascading Architecture)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-cascade: Key 1 ➔ Key 2 ➔ Key 3 ➔ Key 4 ➔ Key 5
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            {[1, 2, 3, 4, 5].map(slotNum => {
              const hasKey = !!apiKeysList[slotNum - 1]?.trim();
              const testSlot = poolTestResults?.results?.find(r => r.slot === slotNum);
              return (
                <React.Fragment key={slotNum}>
                  <div className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1 ${
                    testSlot
                      ? testSlot.ok
                        ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                        : 'bg-rose-950/70 border-rose-800 text-rose-300'
                      : hasKey
                      ? 'bg-indigo-950/60 border-indigo-800 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <span className="font-bold">Slot {slotNum}</span>
                    <span>{slotNum === 1 ? '(Primary)' : '(Failover)'}</span>
                    <span className="text-[9px]">
                      {testSlot ? (testSlot.ok ? '✓' : '✗') : (hasKey ? '●' : '○')}
                    </span>
                  </div>
                  {slotNum < 5 && <span className="text-slate-600">➔</span>}
                </React.Fragment>
              );
            })}
            <span className="text-slate-600">➔</span>
            <div className="px-2.5 py-1 rounded-lg border bg-slate-900 border-slate-800 text-slate-400 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Zero-Latency Offline Bank</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            If Key 1 hits Google rate limits (429), quota exhaustion, or error, the engine cascades immediately to Key 2, then Key 3, Key 4, and Key 5 without failing student quizzes.
          </p>
        </div>

        {/* 5-Key Slot Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>Configure 5 Gemini API Key Slots:</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Slots 1–5 stored securely in SQLite database
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[0, 1, 2, 3, 4].map(idx => {
              const slotNumber = idx + 1;
              const isPrimary = idx === 0;
              const keyVal = apiKeysList[idx] || '';
              const isFilled = keyVal.trim().length > 0;
              const testSlot = poolTestResults?.results?.find(r => r.slot === slotNumber);

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-2.5 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between sm:justify-start gap-2 min-w-[130px]">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                      isPrimary
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {isPrimary ? 'Slot #1 Primary' : `Slot #${slotNumber} Failover`}
                    </span>
                    <span className={`text-[10px] font-mono ${isFilled ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isFilled ? '● Set' : '○ Empty'}
                    </span>
                  </div>

                  <div className="relative flex-1">
                    <input
                      type={showKeys[idx] ? 'text' : 'password'}
                      value={keyVal}
                      onChange={e => handleKeyChange(idx, e.target.value)}
                      placeholder={isPrimary ? "AIzaSy... (Paste Primary Google Gemini Key)" : `AIzaSy... (Paste Failover Key #${slotNumber})`}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 pr-20 font-mono"
                    />
                    <div className="absolute right-2 top-1.5 flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => toggleShowKey(idx)}
                        title={showKeys[idx] ? 'Hide Key' : 'Reveal Key'}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        {showKeys[idx] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePasteKey(idx)}
                        title="Paste from clipboard"
                        className="text-slate-400 hover:text-indigo-300 p-0.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {keyVal && (
                        <button
                          type="button"
                          onClick={() => handleClearKey(idx)}
                          title="Clear Key"
                          className="text-slate-400 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {testSlot && (
                    <div className={`px-2 py-1 rounded-xl text-[10px] font-mono border flex items-center space-x-1 flex-shrink-0 ${
                      testSlot.ok
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-800 text-rose-300'
                    }`}>
                      {testSlot.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      <span>{testSlot.ok ? `${testSlot.latencyMs}ms OK` : (testSlot.error || 'Failed').slice(0, 24)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Action Toolbar & Hybrid Mode Switch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Mode Switch */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">Hybrid Preference</span>
              <span className="text-[10px] text-slate-400">
                {aiConfig.preferLiveAi ? 'Try 5-Key Gemini Pool First -> Cascading fallback' : 'Force Curated Syllabus Bank Only'}
              </span>
            </div>
            <button
              onClick={() => {
                const newVal = !aiConfig.preferLiveAi;
                setAiConfig(prev => ({ ...prev, preferLiveAi: newVal }));
                const cleanKeys = apiKeysList.map(k => k.trim()).filter(Boolean);
                HybridQuizService.saveConfig(cleanKeys, newVal);
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveAiConfig}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save 5 API Keys</span>
            </button>
            <button
              onClick={handleTestAiPingAll}
              disabled={isTestingAi}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl border border-purple-600 transition-all flex items-center justify-center space-x-1.5"
            >
              <Zap className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin' : ''}`} />
              <span>{isTestingAi ? 'Testing Pool...' : 'Test All 5 Keys'}</span>
            </button>
          </div>
        </div>

        {/* Pool Test Results Feedback */}
        {poolTestResults && (
          <div className={`p-3 rounded-2xl text-xs border space-y-2 ${
            poolTestResults.success
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {poolTestResults.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                <span className="font-bold">{poolTestResults.message}</span>
              </div>
              <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {poolTestResults.workingCount || 0}/{poolTestResults.totalTested || 0} Operational
              </span>
            </div>

            {poolTestResults.results && poolTestResults.results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
                {poolTestResults.results.map((r, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">Slot #{r.slot}:</span>
                      <span className="ml-1 text-slate-400 font-mono">{r.masked}</span>
                    </div>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${r.ok ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                      {r.ok ? `${r.latencyMs}ms (${r.model || 'OK'})` : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
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
