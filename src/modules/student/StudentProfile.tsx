import React, { useState } from 'react';
import { Learner, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import { ApiClient } from '../../core/api/apiClient';
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
  LogOut,
  Trash2,
  Crown
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

  // Danger Zone / Google Play Account Deletion controls
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleConfirmDelete = async () => {
    const input = deleteConfirmInput.trim();
    const isPinMatch = input === (learner.parentPin || '1234');
    const isDeleteWord = input.toUpperCase() === 'DELETE';

    if (!isPinMatch && !isDeleteWord) {
      setDeleteError('Please type DELETE or enter your 4-digit Parent PIN to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await ApiClient.deleteMyAccount(input);
      if (res.success) {
        alert('Your AcademicLevel account and all associated personal data have been permanently deleted.');
        logout();
      } else {
        setDeleteError(res.message || 'Failed to delete account. Please try again.');
      }
    } catch {
      // Local fallback
      logout();
    } finally {
      setIsDeleting(false);
    }
  };

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
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center min-w-[130px] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Enrolled Class</span>
            <span className="text-2xl font-black text-slate-900">Class {learner.grade}</span>
          </div>
          <button
            onClick={() => {
              if (onLogout) onLogout();
              else logout();
            }}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="Sign out of your student account"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Active Subscription & Entitlement Branding Card */}
      <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
        learner.activePlan === 'GOLD'
          ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-amber-300 ring-1 ring-amber-200'
          : (learner.hasActiveSubscription ? 'bg-white border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-slate-200')
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            {learner.activePlan === 'GOLD' ? (
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 shadow-sm flex-shrink-0">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex-shrink-0">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-base font-black text-slate-900">
                  {learner.activePlan === 'GOLD' 
                    ? '👑 1-Year AcademicLevel Gold Pass' 
                    : (learner.activePlan === 'PLUS' 
                        ? 'AcademicLevel Plus (180 Days)' 
                        : (learner.activePlan === 'LITE' 
                            ? 'Concept Booster Pass (60 Days)' 
                            : 'Free Starter Account'))}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  learner.hasActiveSubscription
                    ? (learner.activePlan === 'GOLD' 
                        ? 'bg-amber-400 text-slate-950 font-black' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-300')
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {learner.hasActiveSubscription ? 'ACTIVE' : 'FREE TIER'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-lg">
                {learner.activePlan === 'GOLD'
                  ? '365 Days (1 Full Academic Year) complete coverage: Terms 1 & 2, Midterms, Final Board Exams, VIP Store Rewards, & Nova AI 24/7.'
                  : (learner.activePlan === 'PLUS'
                      ? '180 Days Semester Pass: Unlimited Quizzes, Olympiad & Foundation reasoning track.'
                      : (learner.activePlan === 'LITE'
                          ? '60 Days Concept Booster: Unlimited Quizzes & Nova AI Socratic tutor.'
                          : 'Upgrade to Gold (₹205 / 365 Days) to lift all daily study quotas.'))}
              </p>
            </div>
          </div>

          {learner.subscriptionExpiresAt && learner.hasActiveSubscription && (
            <div className="text-left sm:text-right bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl flex-shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Validity Status</span>
              <span className="text-xs font-bold text-amber-700 font-mono">
                Valid till {new Date(learner.subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controlled Class-Change Manager */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Controlled Class-Change Manager</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Server-enforced policy: Maximum 1 class change during an active Premium period and 1 class change post-expiry.
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-500 font-mono">
            <div>Premium Changes Used: <strong className="text-slate-900">{learner.classChangesUsedPremium}/1</strong></div>
            <div>Post-Expiry Changes Used: <strong className="text-slate-900">{learner.classChangesUsedPostExpiry}/1</strong></div>
          </div>
        </div>

        {classChangeMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              classChangeMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            {classChangeMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{classChangeMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleClassChange} className="flex flex-col sm:flex-row gap-3 items-center">
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(Number(e.target.value) as Grade)}
            className="w-full sm:w-64 bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none cursor-pointer"
          >
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
              <option key={g} value={g}>
                Class {g} ({learner.board})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            Update Class
          </button>
        </form>
      </div>

      {/* Parent PIN Lock & Oversight View */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Parental PIN Oversight & Control</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">DPDP Safe</span>
        </div>

        {!isParentUnlocked ? (
          <form onSubmit={handleUnlockParentView} className="max-w-sm space-y-3">
            <p className="text-xs text-slate-500">
              Enter your 4-digit Parent PIN to view screentime logs, payment receipts, and moderation reports.
            </p>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                placeholder="4-digit PIN (default: 1234)"
                value={parentPinInput}
                onChange={e => setParentPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono tracking-widest focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {parentPinError && <p className="text-xs text-rose-600">{parentPinError}</p>}

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Parent Dashboard</span>
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs text-slate-700">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Parental Access Verified</span>
              </span>
              <button
                onClick={() => setIsParentUnlocked(false)}
                className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Lock Panel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Parent Name:</span>
                <span className="font-semibold text-slate-900">{learner.parentName || 'Registered Parent'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Child Safety Filter:</span>
                <span className="font-semibold text-emerald-700">Strict (PII & Profanity Active)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Quizzes Taken This Month:</span>
                <span className="font-semibold text-slate-900">{learner.quizzesCompletedCount} Quizzes</span>
              </div>
              <div>
                <span className="text-slate-500 block">Active Streak:</span>
                <span className="font-semibold text-amber-700">{learner.currentStreakDays} Consecutive Days</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone: Google Play Mandated In-App Account Deletion */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-800">Danger Zone: Delete Account</h3>
          </div>
          <span className="text-[10px] text-rose-700 font-mono">Google Play &amp; DPDP Policy</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Permanently delete your AcademicLevel account, learning streaks, certificates, quiz records, and earned Study Coins. This action is irreversible and immediately wipes all records.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold text-xs rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete Account</span>
          </button>
        ) : (
          <div className="p-4 bg-white border border-rose-300 rounded-2xl space-y-3 shadow-xs">
            <div className="text-xs text-rose-900">
              <strong className="block font-bold mb-1">Confirm Account &amp; Data Deletion</strong>
              Please confirm by typing <span className="font-mono bg-rose-100 text-rose-800 px-1 py-0.5 rounded font-bold">DELETE</span> or entering your 4-digit Parent PIN.
            </div>

            <input
              type="text"
              placeholder="Type DELETE or 4-digit Parent PIN"
              value={deleteConfirmInput}
              onChange={e => setDeleteConfirmInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:border-rose-500 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none font-mono"
            />

            {deleteError && (
              <p className="text-xs text-rose-600">{deleteError}</p>
            )}

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting Account...' : 'Permanently Delete Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput('');
                  setDeleteError('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
