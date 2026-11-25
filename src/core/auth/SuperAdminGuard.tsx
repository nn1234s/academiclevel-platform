import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { StorageRLSLayer } from '../storage/StorageRLSLayer';
import { ShieldAlert, Lock } from 'lucide-react';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  onUnauthorizedRedirect: () => void;
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
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [showSignUpNotice, setShowSignUpNotice] = useState(false);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

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

      StorageRLSLayer.recordSecurityViolation(
        cleanEmail || 'ANONYMOUS_IP',
        'FAILED_OPERATIONS_VAULT_CHALLENGE',
        '/adminservice'
      );
      setLoginError(data?.error || 'Authentication failed. Server verification rejected credentials.');
    } catch (err: any) {
      setLoginError(err.message || 'Unable to verify administrator credentials with server.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f7] text-slate-800 flex flex-col font-sans">
      {/* Top Banner: ADMIN ACCESS ONLY SIGN UP BUTTON CLOSED */}
      <div className="w-full bg-[#ff416c] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2 z-10">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        <span>ADMIN ACCESS ONLY SIGN UP BUTTON CLOSED.</span>
      </div>

      {/* Main Centered Authentication Stage */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 min-h-[500px]">
          {/* Left Panel: Sign in (White Background) */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Sign in
            </h1>

            {/* Social Icons (f, G+, in) */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => setSocialNotice('Social SSO is disabled for Admin Vault. Please enter authorized credentials.')}
                className="w-10 h-10 rounded-full border border-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Sign in with Facebook"
              >
                f
              </button>
              <button
                type="button"
                onClick={() => setSocialNotice('Google SSO is disabled for Admin Vault. Please enter authorized credentials.')}
                className="w-10 h-10 rounded-full border border-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Sign in with Google"
              >
                G+
              </button>
              <button
                type="button"
                onClick={() => setSocialNotice('LinkedIn SSO is disabled for Admin Vault. Please enter authorized credentials.')}
                className="w-10 h-10 rounded-full border border-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                aria-label="Sign in with LinkedIn"
              >
                in
              </button>
            </div>

            {socialNotice && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1 mb-3">
                {socialNotice}
              </p>
            )}

            <p className="text-xs text-slate-400 font-medium mb-5">
              or use your account
            </p>

            {currentLearner && currentLearner.role !== 'SUPER_ADMIN' && (
              <div className="w-full max-w-xs mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 text-left flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-semibold block">Learner session ({currentLearner.email}) active</span>
                  <span className="text-amber-700/80">Elevated admin credentials required for Operations Vault.</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSuperAdminUnlock} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={adminEmailInput}
                  onChange={e => {
                    setAdminEmailInput(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={adminPasswordInput}
                  onChange={e => {
                    setAdminPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(v => !v)}
                  className="text-xs text-slate-400 hover:text-slate-700 transition-colors my-1 block mx-auto cursor-pointer"
                >
                  Forgot your password?
                </button>
                {showForgotNotice && (
                  <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-600 border border-slate-200 my-2 text-left">
                    Admin credentials and passkeys are provisioned via offline vault configuration. Contact root security personnel.
                  </div>
                )}
              </div>

              {loginError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg my-1 font-medium">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="px-12 py-3 bg-[#ff4b2b] hover:bg-[#ff3b1b] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#ff4b2b]/30 transition-all cursor-pointer disabled:opacity-50 mt-3 mx-auto block"
              >
                {isVerifying ? 'SIGNING IN...' : 'SIGN IN'}
              </button>

              <button
                type="button"
                onClick={onUnauthorizedRedirect}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors pt-3 block mx-auto cursor-pointer"
              >
                ← Return to AcademicLevel
              </button>
            </form>
          </div>

          {/* Right Panel: Hello, Friend! (Vibrant Gradient Background) */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-[#ff4b2b] to-[#ff416c] text-white relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Hello, Friend!
            </h2>
            <p className="text-sm text-white/95 max-w-[260px] leading-relaxed font-normal mb-8">
              Enter your personal details and start journey with us
            </p>

            <button
              type="button"
              onClick={() => setShowSignUpNotice(true)}
              className="px-10 py-2.5 border-2 border-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white hover:text-[#ff416c] active:scale-95 transition-all cursor-pointer"
            >
              SIGN UP
            </button>

            <div className="mt-5 px-3.5 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-[11px] text-white/95 font-medium border border-white/20">
              Sign up button closed • Admin access only
            </div>

            {showSignUpNotice && (
              <div className="mt-4 p-3 bg-black/35 backdrop-blur-md border border-white/30 rounded-xl text-xs text-white max-w-xs animate-in fade-in duration-200">
                <strong>Notice:</strong> ADMIN ACCESS ONLY. Sign up is closed. Administrative accounts are strictly provisioned by root operators.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
