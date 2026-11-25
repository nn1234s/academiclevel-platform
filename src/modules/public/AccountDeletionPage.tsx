import React, { useState } from 'react';
import { Learner } from '../../core/types';
import { ApiClient } from '../../core/api/apiClient';
import {
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Mail,
  User,
  HelpCircle,
  FileText
} from 'lucide-react';

interface AccountDeletionPageProps {
  learner?: Learner | null;
  onDeleted?: () => void;
  onBackToApp: () => void;
}

export const AccountDeletionPage: React.FC<AccountDeletionPageProps> = ({
  learner,
  onDeleted,
  onBackToApp
}) => {
  const [emailOrPhone, setEmailOrPhone] = useState(learner?.email || learner?.phone || '');
  const [learnerName, setLearnerName] = useState(learner?.fullName || '');
  const [passwordOrPin, setPasswordOrPin] = useState('');
  const [reason, setReason] = useState('No longer using the app');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    referenceId: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please provide your registered account email or phone number.');
      return;
    }

    if (!agreed) {
      setErrorMessage('Please confirm that you understand this action is irreversible.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (learner) {
        // Authenticated deletion
        const res = await ApiClient.deleteMyAccount(passwordOrPin);
        if (res.success) {
          const refId = 'DEL-' + Date.now().toString(36).toUpperCase();
          setSuccessInfo({
            referenceId: refId,
            message: res.message || 'Your account and all associated data have been permanently deleted.',
            timestamp: new Date().toUTCString()
          });
          onDeleted?.();
        } else {
          setErrorMessage(res.message || 'Account deletion failed. Please check your credentials.');
        }
      } else {
        // Public web deletion request (from https://academiclevel.in/delacc)
        const res = await ApiClient.requestPublicAccountDeletion({
          emailOrPhone: emailOrPhone.trim(),
          learnerName: learnerName.trim(),
          password: passwordOrPin.trim(),
          parentPin: passwordOrPin.trim(),
          reason
        });

        if (res.success) {
          setSuccessInfo({
            referenceId: res.referenceId || ('DEL-' + Date.now().toString(36).toUpperCase()),
            message: res.message || 'Your account deletion request has been processed and all associated records have been purged.',
            timestamp: new Date().toUTCString()
          });
        } else {
          setErrorMessage(res.message || 'Could not process deletion request. Please check the details and try again.');
        }
      }
    } catch (err: any) {
      // Propagate the error — do not fake a success if the server rejected the deletion request
      setErrorMessage(err?.message || 'Connection error. Please try again or contact support if the problem persists.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black shadow-md shadow-red-950">
              A✦
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase block">
                PRIVACY &amp; DATA SAFETY
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                AcademicLevel Account Deletion
              </h1>
            </div>
          </div>

          <button
            onClick={onBackToApp}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Compliance Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Google Play Policy Compliant</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 Safe</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-mono">
            URL: academiclevel.in/delacc
          </span>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Request Permanent Account &amp; Data Deletion
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            In compliance with Google Play&apos;s Account Deletion Policy, users and guardians may request complete and permanent deletion of their AcademicLevel student account and all associated personal data at any time.
          </p>
        </div>

        {/* What gets deleted breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>What happens when you delete your account?</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
              <strong className="text-red-400 block font-bold">1. Profile &amp; Identifiers</strong>
              <p className="text-slate-400 leading-normal">
                Your name, email address, grade, school board, parent phone number, and password hashes are permanently erased.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
              <strong className="text-red-400 block font-bold">2. Learning Progress &amp; Quizzes</strong>
              <p className="text-slate-400 leading-normal">
                All course completions, quiz attempts, answer history, Nova AI chat transcripts, and streak records are wiped.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
              <strong className="text-red-400 block font-bold">3. Study Coins &amp; Rewards</strong>
              <p className="text-slate-400 leading-normal">
                Unspent Study Coin balances, coin transaction ledgers, prize requests, and referral codes are permanently voided.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
              <strong className="text-red-400 block font-bold">4. Certificates &amp; Active Logins</strong>
              <p className="text-slate-400 leading-normal">
                Earned certificates become invalid, and all active login sessions on any mobile device or browser are immediately terminated.
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p>
              <strong>Permanent &amp; Irreversible:</strong> Once completed, account recovery is not possible. If you decide to use AcademicLevel in the future, a new account must be created.
            </p>
          </div>
        </div>

        {/* Success Confirmation Card */}
        {successInfo ? (
          <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">
                Account Deletion Completed
              </h3>
              <p className="text-xs text-emerald-300 max-w-md mx-auto">
                {successInfo.message}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs max-w-sm mx-auto text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference ID:</span>
                <span className="text-emerald-400 font-bold">{successInfo.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processed At:</span>
                <span className="text-slate-300">{successInfo.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-bold">PERMANENTLY_PURGED</span>
              </div>
            </div>

            <button
              onClick={onBackToApp}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <span>Return to AcademicLevel Homepage</span>
            </button>
          </div>
        ) : (
          /* Deletion Request Form */
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {learner ? 'Confirm Your Account Deletion' : 'Web Deletion Request Form'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {learner
                  ? `Signed in as ${learner.fullName} (${learner.email || learner.phone})`
                  : 'Enter your registered details to initiate account and data purge.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Account Email or Mobile Number <span className="text-red-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. learner@example.com or 9861439460"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  disabled={Boolean(learner)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-75 font-mono"
                />
              </div>

              {!learner && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Registered Student Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={learnerName}
                    onChange={e => setLearnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Password or 4-digit Parent PIN</span>
                </label>
                <input
                  type="password"
                  placeholder="Required for instant verification (or leave blank for manual review)"
                  value={passwordOrPin}
                  onChange={e => setPasswordOrPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Providing your password or 4-digit PIN allows instantaneous automatic purge.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reason for Deletion (Optional)</span>
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="No longer using the app">No longer using the app</option>
                  <option value="Privacy concerns">Privacy concerns</option>
                  <option value="Graduated school / class">Graduated school / class</option>
                  <option value="Created duplicate account">Created duplicate account</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Irreversible consent checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-700 bg-slate-950"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    I understand that deleting my account will permanently remove all my profile details, quiz histories, certificates, and earned Study Coins, and that this action cannot be undone.
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Permanent Deletion...' : 'Permanently Delete Account & Personal Data'}</span>
            </button>
          </form>
        )}

        {/* Footer Contact for Privacy Questions */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            Need assistance or have privacy inquiries? Contact our Data Protection Officer at{' '}
            <a href="mailto:academiclevels@gmail.com" className="text-indigo-400 hover:underline">
              academiclevels@gmail.com
            </a>
          </p>
          <p>© {new Date().getFullYear()} AcademicLevel. All data deletion requests processed under Google Play Data Safety specifications.</p>
        </div>
      </main>
    </div>
  );
};
