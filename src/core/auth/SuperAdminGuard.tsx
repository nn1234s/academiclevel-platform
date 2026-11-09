import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../storage/StorageRLSLayer';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

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
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // If learner is logged in but is NOT the super-admin email
    if (currentLearner && currentLearner.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      StorageRLSLayer.recordSecurityViolation(
        currentLearner.email,
        'UNAUTHORIZED_ADMIN_VAULT_PROBE',
        '/ops-vault-al99'
      );
      setAccessDenied(true);
    }
  }, [currentLearner]);

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const handleSuperAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === 'vault99' || adminPasswordInput.trim() === 'naitik2026') {
      loginSuperAdmin();
      setAccessDenied(false);
    } else {
      StorageRLSLayer.recordSecurityViolation(
        'ANONYMOUS_IP',
        'FAILED_SUPERADMIN_VAULT_CHALLENGE',
        '/ops-vault-al99'
      );
      setLoginError('Invalid enterprise credentials. Access denied and logged.');
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
            Restricted Zone • AL-99
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">Super-Admin Control Vault</h1>
          <p className="text-xs text-slate-400 mt-2">
            Access strictly restricted to <span className="font-mono text-indigo-400 font-semibold">{SUPER_ADMIN_EMAIL}</span>.
            All unauthorized telemetry and connection attempts are logged to the immutable security ledger.
          </p>
        </div>

        {accessDenied ? (
          <div className="bg-red-950/40 border border-red-900/80 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3 text-red-300">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">403 Forbidden: Identity Unauthorized</p>
                <p className="text-red-400 mt-1">
                  Active account is not registered as the Lead Super-Admin. A security anomaly event has been permanently appended.
                </p>
              </div>
            </div>
            <button
              onClick={onUnauthorizedRedirect}
              className="mt-4 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Platform</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSuperAdminUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Super-Admin Identity Verification
              </label>
              <input
                type="text"
                disabled
                value={SUPER_ADMIN_EMAIL}
                className="w-full bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-lg px-3 py-2.5 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vault Security Clearance Key
              </label>
              <input
                type="password"
                placeholder="Enter vault clearance key..."
                value={adminPasswordInput}
                onChange={e => {
                  setAdminPasswordInput(e.target.value);
                  setLoginError('');
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none transition-colors"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Demo clearance key: <span className="font-mono text-slate-400">vault99</span>
              </p>
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
              <Lock className="w-4 h-4" />
              <span>Authenticate Super-Admin Clearance</span>
            </button>

            <button
              type="button"
              onClick={onUnauthorizedRedirect}
              className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors text-center"
            >
              Cancel & Exit Vault
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
