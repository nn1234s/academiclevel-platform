import React, { useState } from 'react';
import { Learner, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import {
  User,
  Shield,
  KeyRound,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';

interface StudentProfileProps {
  learner: Learner;
  onRefreshLearner: () => void;
  onLogout?: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ learner, onRefreshLearner, onLogout }) => {
  const { updateActiveGrade, logout } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade>(learner.grade);
  const [classChangeMessage, setClassChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Parent PIN controls
  const [parentPinInput, setParentPinInput] = useState('');
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [parentPinError, setParentPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleClassChange = (e: React.FormEvent) => {
    e.preventDefault();
    setClassChangeMessage(null);

    const result = updateActiveGrade(selectedGrade);
    if (result.success) {
      setClassChangeMessage({ type: 'success', text: result.message });
      onRefreshLearner();
    } else {
      setClassChangeMessage({ type: 'error', text: result.message });
    }
  };

  const handleUnlockParentView = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentPinInput === (learner.parentPin || '1234')) {
      setIsParentUnlocked(true);
      setParentPinError('');
    } else {
      setParentPinError('Invalid 4-digit Parent PIN.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-100">
      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-950">
            {learner.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{learner.fullName}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {learner.board}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{learner.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Referral Code: <span className="font-mono text-indigo-300 font-bold">{learner.referralCode}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center min-w-[130px]">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Enrolled Class</span>
            <span className="text-2xl font-black text-white">Class {learner.grade}</span>
          </div>
          <button
            onClick={() => {
              if (onLogout) onLogout();
              else logout();
            }}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
            title="Sign out of your student account"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Controlled Class-Change Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Controlled Class-Change Manager</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Server-enforced policy: Maximum 1 class change during an active Premium period and 1 class change post-expiry.
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-mono">
            <div>Premium Changes Used: <strong className="text-white">{learner.classChangesUsedPremium}/1</strong></div>
            <div>Post-Expiry Changes Used: <strong className="text-white">{learner.classChangesUsedPostExpiry}/1</strong></div>
          </div>
        </div>

        {classChangeMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              classChangeMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}
          >
            {classChangeMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{classChangeMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleClassChange} className="flex flex-col sm:flex-row gap-3 items-center">
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(Number(e.target.value) as Grade)}
            className="w-full sm:w-64 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          >
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
              <option key={g} value={g}>
                Class {g} ({learner.board})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            Update Class
          </button>
        </form>
      </div>

      {/* Parent PIN Lock & Oversight View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Parental PIN Oversight & Control</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">DPDP Safe</span>
        </div>

        {!isParentUnlocked ? (
          <form onSubmit={handleUnlockParentView} className="max-w-sm space-y-3">
            <p className="text-xs text-slate-400">
              Enter your 4-digit Parent PIN to view screentime logs, payment receipts, and moderation reports.
            </p>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                placeholder="4-digit PIN (default: 1234)"
                value={parentPinInput}
                onChange={e => setParentPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white font-mono tracking-widest focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {parentPinError && <p className="text-xs text-red-400">{parentPinError}</p>}

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Parent Dashboard</span>
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Parental Access Verified</span>
              </span>
              <button
                onClick={() => setIsParentUnlocked(false)}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Lock Panel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Parent Name:</span>
                <span className="font-semibold text-white">{learner.parentName || 'Registered Parent'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Child Safety Filter:</span>
                <span className="font-semibold text-emerald-400">Strict (PII & Profanity Active)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Quizzes Taken This Month:</span>
                <span className="font-semibold text-white">{learner.quizzesCompletedCount} Quizzes</span>
              </div>
              <div>
                <span className="text-slate-500 block">Active Streak:</span>
                <span className="font-semibold text-amber-400">{learner.currentStreakDays} Consecutive Days</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
