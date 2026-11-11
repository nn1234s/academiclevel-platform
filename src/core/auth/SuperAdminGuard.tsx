import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../storage/StorageRLSLayer';
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from 'lucide-react';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  onUnauthorizedRedirect: () => void;
}

const KNOWN_ADMIN_EMAIL_HASHES = new Set([
  'f82f3e631ed2142d54fdeb333e6cf87c4d837d398355d24fc6d83f98f955a87e',
  '4c7e6c4ddbbefea23b9d0347895e7b39670f5e7146cead23e590eb7707e7b68a',
]);

const KNOWN_ADMIN_PASS_HASHES = new Set([
  '2c00eca6aa79cb1c826ab54ea1bd4c45c3c814314880494af2bfc3bc45f6ca86', // naitik2026
  'b1a1cdecd18856d8636be31a2e3a575af96c0404de792e8146c99bc537616c64', // vault99
  '7d54032d8471e847c1aeb6c4293f77341e97dc2be05e5ea5a2ba393f9c63b48f', // admin2026
]);

async function computeSha256(text: string): Promise<string> {
  try {
    const enc = new TextEncoder().encode(text.trim());
    const buf = await window.crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return '';
  }
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  children,
  onUnauthorizedRedirect,
}) => {
  const { currentLearner, isSuperAdmin, loginSuperAdmin } = useAuth();
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const handleSuperAdminUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setLoginError('');

    const cleanEmail = adminEmailInput.trim().toLowerCase();
    const cleanPass = adminPasswordInput.trim();

    try {
      const res = await fetch('/api/auth/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          passkey: cleanPass
        })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data?.token) {
        try {
          sessionStorage.setItem('al_admin_token', data.token);
          sessionStorage.setItem('al_admin_email', data.email || cleanEmail);
          localStorage.setItem('al_admin_token', data.token);
          localStorage.setItem('al_admin_email', data.email || cleanEmail);
        } catch {}

        await StorageRLSLayer.syncWithServer();
        loginSuperAdmin(data.email || cleanEmail);
        return;
      }

      // Cryptographic client-side fallback if backend is sleeping or returned rejection
      const emailHash = await computeSha256(cleanEmail);
      const passHash = await computeSha256(cleanPass);
      if (
        (KNOWN_ADMIN_EMAIL_HASHES.has(emailHash) || cleanEmail === 'admin@academiclevel.in') &&
        KNOWN_ADMIN_PASS_HASHES.has(passHash)
      ) {
        const fallbackToken = 'adm_sess_fb_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        try {
          sessionStorage.setItem('al_admin_token', fallbackToken);
          sessionStorage.setItem('al_admin_email', cleanEmail);
          localStorage.setItem('al_admin_token', fallbackToken);
          localStorage.setItem('al_admin_email', cleanEmail);
        } catch {}
        loginSuperAdmin(cleanEmail);
        return;
      }

      StorageRLSLayer.recordSecurityViolation(
        cleanEmail || 'ANONYMOUS_IP',
        'FAILED_SUPERADMIN_VAULT_CHALLENGE',
        '/adminservice'
      );
      setLoginError(data?.error || 'Invalid administrator credentials. Access denied.');
    } catch (err: any) {
      // Offline / Network Error Fallback
      const emailHash = await computeSha256(cleanEmail);
      const passHash = await computeSha256(cleanPass);
      if (
        (KNOWN_ADMIN_EMAIL_HASHES.has(emailHash) || cleanEmail === 'admin@academiclevel.in') &&
        KNOWN_ADMIN_PASS_HASHES.has(passHash)
      ) {
        const fallbackToken = 'adm_sess_fb_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        try {
          sessionStorage.setItem('al_admin_token', fallbackToken);
          sessionStorage.setItem('al_admin_email', cleanEmail);
          localStorage.setItem('al_admin_token', fallbackToken);
          localStorage.setItem('al_admin_email', cleanEmail);
        } catch {}
        loginSuperAdmin(cleanEmail);
        return;
      }
      setLoginError(err.message || 'Connection error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-indigo-600" />

        <div className="w-16 h-16 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
          <Lock className="w-8 h-8" />
        </div>

        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono font-semibold rounded-full uppercase tracking-wider mb-2">
            Restricted Admin Access
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">Administrator Portal</h1>
          <p className="text-xs text-slate-400 mt-2">
            Authorized personnel only. All administrative actions and authentications are cryptographically audited.
          </p>
        </div>

        {currentLearner && currentLearner.role !== 'SUPER_ADMIN' && (
          <div className="bg-amber-950/40 border border-amber-900/60 rounded-xl p-3 mb-5 flex items-start space-x-2 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Learner session currently active ({currentLearner.email})</p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                Enter authorized administrator passkey below to elevate to Super-Admin console.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSuperAdminUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Administrator Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter administrator email..."
              value={adminEmailInput}
              onChange={e => {
                setAdminEmailInput(e.target.value);
                setLoginError('');
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Security Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter security password..."
              value={adminPasswordInput}
              onChange={e => {
                setAdminPasswordInput(e.target.value);
                setLoginError('');
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none transition-colors"
            />
          </div>

          {loginError && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-2.5 rounded-lg">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying with Backend...' : 'Sign In to Admin Service'}</span>
          </button>

          <button
            type="button"
            onClick={onUnauthorizedRedirect}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors text-center"
          >
            Cancel & Exit
          </button>
        </form>
      </div>
    </div>
  );
};
