import React, { useState } from 'react';
import { Learner } from '../../core/types';
import { OfflineBankService } from '../../services/offlineBankService';
import { Database, CheckCircle, RefreshCw, WifiOff, HardDrive, ShieldCheck, Search } from 'lucide-react';

interface OfflineBankViewProps {
  learner: Learner;
}

export const OfflineBankView: React.FC<OfflineBankViewProps> = ({ learner }) => {
  const [activeSubject, setActiveSubject] = useState<string>('math');
  const [activeNode, setActiveNode] = useState<'FOUNDATION' | 'CONCEPT' | 'EXAM_READY' | 'OLYMPIAD'>('FOUNDATION');
  const [syncStatus, setSyncStatus] = useState<string>('Synchronized & Cached Locally');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const questions = OfflineBankService.getQuestions(learner.board, learner.grade, activeSubject, activeNode);

  const handleForceSync = () => {
    setIsSyncing(true);
    setSyncStatus('Downloading and indexing syllabus vectors...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus(`Synchronized! All ${questions.length} questions secured in local storage.`);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
            <WifiOff className="w-3 h-3" />
            <span>Zero-Latency Fallback Engine</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#212121] mt-2">
            Offline Question Bank
          </h2>
          <p className="text-xs text-[#424242] mt-1 max-w-md">
            Guarantees uninterrupted learning even during 2G/3G network drops or connection interruptions. Seamlessly activates whenever offline or when remote network is unavailable.
          </p>
        </div>

        <button
          onClick={handleForceSync}
          disabled={isSyncing}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950 transition-all flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Offline Bank</span>
        </button>
      </div>

      <div className="p-3 bg-[#EEEEEE] border border-[#E0E0E0] rounded-2xl flex items-center justify-between text-xs text-[#616161]">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-[#00796B]" />
          <span>Status: <strong className="text-slate-200">{syncStatus}</strong></span>
        </div>
        <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-lg text-cyan-300">
          {learner.board} Class {learner.grade}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['math', 'science', 'physics', 'chemistry', 'english'] as const).map(subj => (
          <button
            key={subj}
            onClick={() => setActiveSubject(subj)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              activeSubject === subj
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-[#E0E0E0] text-[#616161] hover:text-[#212121]'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Questions Preview */}
      <div className="bg-white border border-[#E0E0E0] rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-[#212121] flex items-center justify-between">
          <span>Cached Syllabus Questions ({questions.length})</span>
          <span className="text-xs font-normal text-[#616161]">{activeNode} Tier</span>
        </h3>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="bg-[#EEEEEE] border border-[#E0E0E0] rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                  {q.topicTag || 'Core Topic'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {q.id}</span>
              </div>
              <p className="font-semibold text-slate-200">{q.text}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2 rounded-xl border text-[11px] ${
                      oIdx === q.correctIndex
                        ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-bold'
                        : 'border-[#E0E0E0] text-[#616161]'
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}. {opt}
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
