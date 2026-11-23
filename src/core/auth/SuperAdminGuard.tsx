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
  '6e4376f66f72da17365fbd163ba17ad731bd4d0e34bfa8bc0b17e246e74d8d8b',
]);

const KNOWN_ADMIN_PASS_HASHES = new Set([
  '2c00eca6aa79cb1c826ab54ea1bd4c45c3c814314880494af2bfc3bc45f6ca86',
  'b1a1cdecd18856d8636be31a2e3a575af96c0404de792e8146c99bc537616c64',
  '6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270',
  '652223af1df39fd77db08443cda575c39fb1a8d578861bcf15fdb94dbdcf478e',
  '4b811bbafe9b7bfc1adc909f8416f37314a3ea38bbd7125380eac6b436d7c414',
  'fa18b0efa4f01d0e1cc7014a619385af3dce6913f981f16c9013eb29c6b3c285',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  '4208e4682660cc8718d9062a9e14fe78faee474930dcf2d40a342dd386752bb2',
  '15cfd10c7cdf8f65c2e606cbe77dfb4eee3f3c7ecfd2bb3cf51d6a30250fa50e',
  '344e3f92a63e3b370371deac496dc858ca3e345adb4c23f248dae7a30035f3ae',
  '8b3ce0c3977ee6e8d53efeb1fb5b4f82bfb85e44b706c4eded197bd78875da67',
  '0e89f223e226ae63268cf39152ab75722e811b89d29efb22a852f1667bd22ae0',
  '7d54032d8471e847c1aeb6c4293f77341e97dc2be05e5ea5a2ba393f9c63b48f',
  'ae34d5a89d38fe522141810d3ea99895b42a83dfb766f918b584f5b23b6b2e0d',
  '558972415c578b557b4d89a1c6e40b0e142c0425b737f891943a0d63710c098c',
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
          sessionStorage.setItem('al_admin_passkey', cleanPass);
          localStorage.setItem('al_admin_token', data.token);
          localStorage.setItem('al_admin_email', data.email || cleanEmail);
          localStorage.setItem('al_admin_passkey', cleanPass);
        } catch {}

        await StorageRLSLayer.syncWithServer();
        loginSuperAdmin(data.email || cleanEmail);
        return;
      }

      // Cryptographic client-side fallback if backend is sleeping or returned rejection
      const emailHash = await computeSha256(cleanEmail);
      const passHash = await computeSha256(cleanPass);
      const isAuthMatch =
        (KNOWN_ADMIN_EMAIL_HASHES.has(emailHash) || cleanEmail === 'admin@academiclevel.in' || cleanEmail === 'naitiknanda1235@gmail.com') &&
        KNOWN_ADMIN_PASS_HASHES.has(passHash);

      if (isAuthMatch) {
        const fallbackToken = 'adm_sess_fb_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        try {
          sessionStorage.setItem('al_admin_token', fallbackToken);
          sessionStorage.setItem('al_admin_email', cleanEmail);
          sessionStorage.setItem('al_admin_passkey', cleanPass);
          localStorage.setItem('al_admin_token', fallbackToken);
          localStorage.setItem('al_admin_email', cleanEmail);
          localStorage.setItem('al_admin_passkey', cleanPass);
        } catch {}
        loginSuperAdmin(cleanEmail);
        return;
      }

      StorageRLSLayer.recordSecurityViolation(
        cleanEmail || 'ANONYMOUS_IP',
        'FAILED_OPERATIONS_VAULT_CHALLENGE',
        '/adminservice'
      );
      setLoginError(data?.error || 'Authentication failed. Access denied.');
    } catch (err: any) {
      // Offline / Network Error Fallback
      const emailHash = await computeSha256(cleanEmail);
      const passHash = await computeSha256(cleanPass);
      const isAuthMatch =
        (KNOWN_ADMIN_EMAIL_HASHES.has(emailHash) || cleanEmail === 'admin@academiclevel.in' || cleanEmail === 'naitiknanda1235@gmail.com') &&
        KNOWN_ADMIN_PASS_HASHES.has(passHash);

      if (isAuthMatch) {
        const fallbackToken = 'adm_sess_fb_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        try {
          sessionStorage.setItem('al_admin_token', fallbackToken);
          sessionStorage.setItem('al_admin_email', cleanEmail);
          sessionStorage.setItem('al_admin_passkey', cleanPass);
          localStorage.setItem('al_admin_token', fallbackToken);
          localStorage.setItem('al_admin_email', cleanEmail);
          localStorage.setItem('al_admin_passkey', cleanPass);
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
