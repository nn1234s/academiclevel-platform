import React, { useState, useRef } from 'react';
import { Learner, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import { ApiClient } from '../../core/api/apiClient';
import {
  ProfileAvatar,
  PRESET_EMOJI_PFPS,
  getLocalCustomPfp,
  setLocalCustomPfp,
  parseEmojiPfp
} from '../shared/ProfileAvatar';
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
  Crown,
  Upload,
  Smartphone,
  Globe
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

  // Profile Picture (Local Photo + Synced Emoji PFP)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(() => getLocalCustomPfp(learner.id));
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState<string | null>(null);
  const [pfpStatus, setPfpStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingEmoji, setIsSavingEmoji] = useState(false);
  const activeEmoji = parseEmojiPfp(learner.avatarFrame);

  const handleSelectEmojiPfp = async (emoji: string) => {
    setIsSavingEmoji(true);
    setPfpStatus(null);
    try {
      const res = await ApiClient.updateAvatarFrame(learner.id, `emoji:${emoji}`);
      if (res.success) {
        onRefreshLearner();
        setPfpStatus({
          type: 'success',
          text: localPhoto
            ? `Saved ${emoji} across all your devices! Remove your local photo below if you want ${emoji} shown on this device.`
            : `Avatar ${emoji} saved! It will appear on every device you log in to.`
        });
      } else {
        setPfpStatus({ type: 'error', text: 'Could not save emoji avatar. Please try again.' });
      }
    } catch {
      setPfpStatus({ type: 'error', text: 'Connection error while saving emoji avatar.' });
    } finally {
      setIsSavingEmoji(false);
    }
  };

  const handlePhotoFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPfpStatus({ type: 'error', text: 'Please choose an image file (PNG, JPG, WebP, etc.).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 160;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPendingPhotoPreview(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        setPendingPhotoPreview(canvas.toDataURL('image/jpeg', 0.82));
        setPfpStatus(null);
      };
      img.onerror = () => {
        setPfpStatus({ type: 'error', text: 'Could not read that image. Try another photo.' });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmSaveLocalPhoto = () => {
    if (!pendingPhotoPreview) return;
    try {
      setLocalCustomPfp(learner.id, pendingPhotoPreview);
      setLocalPhoto(pendingPhotoPreview);
      setPendingPhotoPreview(null);
      setPfpStatus({
        type: 'success',
        text: 'Custom photo saved locally in this browser! (Remember: it stays on this device only.)'
      });
    } catch {
      setPfpStatus({
        type: 'error',
        text: 'Browser storage is full. Please clear old site data or use a smaller image.'
      });
    }
  };

  const handleRemoveLocalPhoto = () => {
    setLocalCustomPfp(learner.id, null);
    setLocalPhoto(null);
    setPendingPhotoPreview(null);
    setPfpStatus({
      type: 'success',
      text: activeEmoji
        ? `Local photo removed — now showing your synced ${activeEmoji} avatar.`
        : 'Local photo removed.'
    });
  };

  const handleConfirmDelete = async () => {
    const input = deleteConfirmInput.trim();
    if (input.toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE exactly (in capitals) to confirm permanent account deletion.');
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
    } catch (err: any) {
      setDeleteError(err?.message || 'Connection error. Please try again.');
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
    if (parentPinInput === (learner.parentPin || '0000')) {
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
          <ProfileAvatar learner={learner} sizeClass="w-16 h-16" textClass="text-2xl" roundedClass="rounded-2xl" />
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

      {/* Profile Picture & Emoji Avatar Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Profile Picture &amp; Avatar</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pick a Preset Emoji to sync across every device, or upload a custom photo stored locally on this device.
            </p>
          </div>
        </div>

        {/* 1. Preset Emoji PFPs (Synced Across All Devices) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Preset Emoji PFP (Syncs on Every Device)</span>
            </span>
            {activeEmoji && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Synced: {activeEmoji}
              </span>
            )}
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-8 gap-2">
            {PRESET_EMOJI_PFPS.map((item) => {
              const isSelected = activeEmoji === item.emoji;
              return (
                <button
                  key={item.emoji}
                  type="button"
                  disabled={isSavingEmoji}
                  onClick={() => handleSelectEmojiPfp(item.emoji)}
                  title={`${item.label} (Syncs on every device)`}
                  className={`h-11 rounded-2xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-2 border-indigo-600 shadow-xs scale-105'
                      : 'bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300'
                  }`}
                >
                  {item.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Custom Photo Upload (LocalStorage Only) */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>Custom Photo Upload (This Device Only)</span>
              </span>
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                Note: Custom uploaded photos are saved in LocalStorage on this device only and will NOT sync across devices.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChosen}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{localPhoto ? 'Change Local Photo' : 'Upload Photo'}</span>
              </button>
              {localPhoto && (
                <button
                  type="button"
                  onClick={handleRemoveLocalPhoto}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Explicit LocalStorage Reminder Confirmation Before Setting */}
          {pendingPhotoPreview && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
              <div className="flex items-start space-x-3">
                <img
                  src={pendingPhotoPreview}
                  alt="Preview"
                  className="w-14 h-14 rounded-2xl object-cover border border-amber-400 shrink-0"
                />
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-amber-950 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Reminder Before Setting: This Photo Is Local Only!</span>
                  </p>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Your uploaded profile picture is saved in this browser&apos;s <strong>LocalStorage</strong> and will <strong>NOT appear on other phones, tablets, or devices</strong>. Use a Preset Emoji PFP above if you want your avatar on every device.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setPendingPhotoPreview(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSaveLocalPhoto}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold cursor-pointer shadow-xs"
                >
                  I Understand — Set Local Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {pfpStatus && (
          <div
            className={`p-3 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
              pfpStatus.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {pfpStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{pfpStatus.text}</span>
          </div>
        )}
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
                          ? '60 Days Concept Booster: Unlimited Quizzes & 24/7 Nova AI Tutor.'
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Controlled Class-Change Manager</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Server-enforced policy: Maximum 1 class change during an active Premium period and 1 class change post-expiry.
            </p>
          </div>

          <div className="text-left sm:text-right text-[11px] text-slate-500 font-mono self-start sm:self-auto flex-shrink-0">
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
