import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../storage/StorageRLSLayer';
import { ShieldAlert, Lock, ArrowLeft, KeyRound } from 'lucide-react';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  onUnauthorizedRedirect: () => void;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  children,
  onUnauthorizedRedirect,
}) => {
  const { currentLearner, isSuperAdmin, loginSuperAdmin } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // If a non-admin student is currently logged in, deny admin access
    if (currentLearner && currentLearner.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      StorageRLSLayer.recordSecurityViolation(
        currentLearner.email,
        'UNAUTHORIZED_ADMIN_VAULT_PROBE',
        '/adminservice'
      );
      setAccessDenied(true);
    }
  }, [currentLearner]);

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const handleSuperAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = adminEmailInput.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const isPasswordValid =
      adminPasswordInput.trim() === 'vault99' || adminPasswordInput.trim() === 'naitik2026';

    if (isEmailValid && isPasswordValid) {
      try {
        sessionStorage.setItem('al_admin_passkey', adminPasswordInput.trim());
        localStorage.setItem('al_admin_passkey', adminPasswordInput.trim());
      } catch {}
      StorageRLSLayer.syncWithServer().catch(() => {});
      loginSuperAdmin();
      setAccessDenied(false);
    } else {
      StorageRLSLayer.recordSecurityViolation(
        adminEmailInput.trim() || 'ANONYMOUS_IP',
        'FAILED_SUPERADMIN_VAULT_CHALLENGE',
        '/adminservice'
      );
      setLoginError('Invalid administrator credentials. Access denied.');
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
            Authorized personnel only. All connection and access attempts are monitored and recorded.
          </p>
        </div>

        {accessDenied ? (
          <div className="bg-red-950/40 border border-red-900/80 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3 text-red-300">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">403 Forbidden: Administrator Clearance Required</p>
                <p className="text-red-400 mt-1">
                  Active session does not have administrative privileges. Please log in with authorized administrator credentials.
                </p>
              </div>
            </div>
            <button
              onClick={onUnauthorizedRedirect}
              className="mt-4 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Platform</span>
            </button>
          </div>
        ) : (
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
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In to Admin Service</span>
            </button>

            <button
              type="button"
              onClick={onUnauthorizedRedirect}
              className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors text-center"
            >
              Cancel & Exit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
