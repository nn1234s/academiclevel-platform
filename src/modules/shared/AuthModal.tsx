import React, { useState, useEffect } from 'react';
import { Board, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { X, Sparkles, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ReCaptchaWidget } from './ReCaptchaWidget';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (mode: 'REGISTER' | 'LOGIN') => void;
  initialMode?: 'REGISTER' | 'LOGIN';
  onNavigateToSpecial49?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'REGISTER',
  onNavigateToSpecial49,
}) => {
  const { registerStudent, loginStudent, loginSuperAdmin } = useAuth();
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setCaptchaVerified(false);
    setCaptchaError(false);
    setShowForgotNotice(false);
  }, [initialMode, isOpen]);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [board, setBoard] = useState<Board>('CBSE');
  const [grade, setGrade] = useState<Grade>(10);
  const [parentName, setParentName] = useState('');
  const [parentPin, setParentPin] = useState('1234');
  const [referralCode, setReferralCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  if (!isOpen) return null;

  const handleSignUpClick = () => {
    onClose();
    if (onNavigateToSpecial49) {
      onNavigateToSpecial49();
    } else {
      window.history.pushState(null, '', '/special49');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!captchaVerified) {
      setErrorMessage('Please verify that you are not a robot before proceeding.');
      setCaptchaError(true);
      return;
    }

    setIsSubmitting(true);

    if (mode === 'REGISTER') {
      if (!password || password.trim().length < 6) {
        setErrorMessage('Password is required and must be at least 6 characters.');
        setIsSubmitting(false);
        return;
      }

      const res = await registerStudent({
        fullName,
        email,
        password,
        board,
        grade,
        parentName,
        parentPin,
        referredByCode: referralCode
      });
      setIsSubmitting(false);
      if (res.success) {
        onSuccess?.('REGISTER');
        onClose();
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } else {
      // Login
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() || StorageRLSLayer.isAdminAuthorized(cleanEmail)) {
        loginSuperAdmin(cleanEmail);
        setIsSubmitting(false);
        onSuccess?.('LOGIN');
        onClose();
        return;
      }

      if (!password) {
        setErrorMessage('Please enter your password.');
        setIsSubmitting(false);
        return;
      }

      const res = await loginStudent(cleanEmail, password);
      setIsSubmitting(false);
      if (res.success) {
        onSuccess?.('LOGIN');
        onClose();
      } else {
        setErrorMessage(res.error || 'Login failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[500px] max-h-[92vh] border border-slate-100 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 text-slate-500 hover:text-slate-800 md:text-white/80 md:hover:text-white rounded-full bg-slate-100 hover:bg-slate-200 md:bg-black/20 md:hover:bg-black/30 backdrop-blur-md transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'LOGIN' ? (
          <>
            {/* Left Panel: Sign in (White Background) */}
            <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center bg-white overflow-y-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Sign in
              </h1>
              <p className="text-xs text-slate-400 font-medium mb-6">
                Welcome back! Please enter your details.
              </p>

              {errorMessage && (
                <div className="w-full max-w-xs mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-3 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                      To reset your password, contact{' '}
                      <a href="mailto:academiclevels@gmail.com" className="text-[#ff4b2b] underline font-semibold">
                        academiclevels@gmail.com
                      </a>{' '}
                      with your registered student email address.
                    </div>
                  )}
                </div>

                {/* reCAPTCHA Widget */}
                <div className="pt-1 pb-1 flex justify-center">
                  <ReCaptchaWidget
                    isVerified={captchaVerified}
                    onVerify={verified => {
                      setCaptchaVerified(verified);
                      if (verified) {
                        setCaptchaError(false);
                        if (errorMessage.includes('robot')) {
                          setErrorMessage('');
                        }
                      }
                    }}
                    hasError={captchaError}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-12 py-3 bg-[#ff4b2b] hover:bg-[#ff3b1b] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#ff4b2b]/30 transition-all cursor-pointer disabled:opacity-50 mt-2 mx-auto block"
                >
                  {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </form>
            </div>

            {/* Right Panel: Hello, Friend! (Vibrant Gradient Background) */}
            <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-[#ff4b2b] to-[#ff416c] text-white relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                Hello, Friend!
              </h2>
              <p className="text-sm text-white/95 max-w-[260px] leading-relaxed font-normal mb-8">
                Enter your personal details and start journey with us
              </p>

              <button
                type="button"
                onClick={handleSignUpClick}
                className="px-10 py-2.5 border-2 border-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white hover:text-[#ff416c] active:scale-95 transition-all cursor-pointer shadow-md"
              >
                SIGN UP
              </button>

              <div className="mt-5 px-4 py-1.5 bg-black/15 backdrop-blur-md rounded-full text-[11px] text-white/95 font-medium border border-white/20">
                ⚡ ₹49 Concept Booster Pass • Instant Access
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMessage('');
                }}
                className="mt-4 text-[11px] text-white/80 hover:text-white underline transition-colors cursor-pointer"
              >
                Prefer free basic account? Register here
              </button>
            </div>
          </>
        ) : (
          <>
            {/* REGISTER MODE */}
            {/* Left Panel: Register Account Form (White Background) */}
            <div className="w-full md:w-3/5 p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center bg-white overflow-y-auto">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                Create Account
              </h1>
              <p className="text-xs text-slate-400 font-medium mb-4">
                Free student account (Master up to 3 curriculum levels free) • Upgrade anytime.
              </p>

              {errorMessage && (
                <div className="w-full max-w-sm mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2.5 text-left text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diya Sen"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 px-3.5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@school.edu or parent@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 px-3.5 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-semibold">Password *</label>
                    <span className="text-[10px] text-slate-400">Min. 6 chars</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a secure password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 px-3.5 py-2 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Board *</label>
                    <select
                      value={board}
                      onChange={e => setBoard(e.target.value as any)}
                      className="w-full bg-[#f0f2f5] text-slate-800 px-3 py-2 rounded-lg focus:outline-none font-medium border border-transparent"
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE / CISCE</option>
                      <option value="IGCSE">Cambridge IGCSE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Class (Grade) *</label>
                    <select
                      value={grade}
                      onChange={e => setGrade(Number(e.target.value) as any)}
                      className="w-full bg-[#f0f2f5] text-slate-800 px-3 py-2 rounded-lg focus:outline-none font-medium border border-transparent"
                    >
                      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
                        <option key={g} value={g}>Class {g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Parent Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sen"
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 px-3 py-2 rounded-lg focus:outline-none font-medium border border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Referral Code</label>
                    <input
                      type="text"
                      placeholder="AL-XXX-XXXX"
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 px-3 py-2 rounded-lg font-mono uppercase focus:outline-none font-medium border border-transparent"
                    />
                  </div>
                </div>

                {/* reCAPTCHA Widget */}
                <div className="pt-1 pb-1 flex justify-center">
                  <ReCaptchaWidget
                    isVerified={captchaVerified}
                    onVerify={verified => {
                      setCaptchaVerified(verified);
                      if (verified) {
                        setCaptchaError(false);
                        if (errorMessage.includes('robot')) {
                          setErrorMessage('');
                        }
                      }
                    }}
                    hasError={captchaError}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#ff4b2b] hover:bg-[#ff3b1b] active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#ff4b2b]/30 transition-all cursor-pointer disabled:opacity-50 mt-2 text-center"
                >
                  {isSubmitting ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}
                </button>
              </form>
            </div>

            {/* Right Panel: Switch to Sign In (Vibrant Gradient Background) */}
            <div className="w-full md:w-2/5 p-8 sm:p-10 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-[#ff4b2b] to-[#ff416c] text-white relative">
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                Welcome Back!
              </h2>
              <p className="text-sm text-white/95 max-w-[240px] leading-relaxed font-normal mb-8">
                To keep connected with your syllabus progress, please login with your account
              </p>

              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage('');
                }}
                className="px-10 py-2.5 border-2 border-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white hover:text-[#ff416c] active:scale-95 transition-all cursor-pointer shadow-md"
              >
                SIGN IN
              </button>

              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="text-xs text-white/90 hover:text-white underline font-semibold transition-colors cursor-pointer"
                >
                  Want full syllabus mastery? Grab ₹49 Booster Pass →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

