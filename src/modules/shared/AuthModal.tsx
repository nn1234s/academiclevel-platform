import React, { useState, useEffect } from 'react';
import { Board, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { X, Sparkles, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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

  // Clean transition to other side without redirecting
  const handleToggleToSignUp = () => {
    setMode('REGISTER');
    setErrorMessage('');
    setCaptchaVerified(false);
    setCaptchaError(false);
    setShowForgotNotice(false);
  };

  const handleToggleToSignIn = () => {
    setMode('LOGIN');
    setErrorMessage('');
    setCaptchaVerified(false);
    setCaptchaError(false);
    setShowForgotNotice(false);
  };

  const handleSpecial49Click = () => {
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
        referredByCode: referralCode,
        planTier: 'FREE' // Free student tier (3 curriculum levels included)
      });
      setIsSubmitting(false);
      if (res.success) {
        onSuccess?.('REGISTER');
        onClose();
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    } else {
      // Login: Always verify credentials through server authentication (no client passwordless admin bypass)
      const cleanEmail = email.trim().toLowerCase();

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

  const isRegister = mode === 'REGISTER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-y-auto md:overflow-hidden md:min-h-[580px] max-h-[92dvh] border border-slate-100 font-sans flex flex-col md:block overscroll-contain">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* MOBILE MODE TOGGLE BAR (< md only)                       */}
        {/* ======================================================== */}
        <div className="md:hidden flex border-b border-slate-200 bg-slate-50 p-2 pt-3 justify-center gap-2">
          <button
            type="button"
            onClick={handleToggleToSignIn}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister
                ? 'bg-[#ff4b2b] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={handleToggleToSignUp}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister
                ? 'bg-[#ff4b2b] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sign Up (Free)
          </button>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP PANEL 1: SIGN IN FORM (LEFT HALF)                */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center bg-white overflow-y-auto transition-all duration-700 ease-in-out md:absolute md:top-0 md:left-0 md:h-full ${
            !isRegister
              ? 'opacity-100 translate-x-0 z-20 pointer-events-auto block'
              : 'opacity-0 md:-translate-x-12 z-10 pointer-events-none hidden md:flex'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Sign in
          </h1>
          <p className="text-xs text-slate-400 font-medium mb-6">
            Welcome back! Please enter your details.
          </p>

          {errorMessage && !isRegister && (
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
                className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-base sm:text-sm px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
                autoFocus={!isRegister}
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
                className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-base sm:text-sm px-4 py-3 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 transition-all font-medium border border-transparent"
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
                hasError={captchaError && !isRegister}
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

          {/* Mobile switcher link */}
          <div className="md:hidden mt-4 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleToggleToSignUp}
              className="text-xs text-slate-600 hover:text-[#ff4b2b] font-medium"
            >
              Don&apos;t have an account? <strong className="text-[#ff4b2b] underline">Sign up free</strong>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP PANEL 2: SIGN UP / REGISTER FORM (RIGHT HALF)     */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center bg-white overflow-y-auto transition-all duration-700 ease-in-out md:absolute md:top-0 md:right-0 md:h-full ${
            isRegister
              ? 'opacity-100 translate-x-0 z-20 pointer-events-auto block'
              : 'opacity-0 md:translate-x-12 z-10 pointer-events-none hidden md:flex'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Create Free Account
          </h1>
          <p className="text-xs text-slate-500 font-medium mb-3">
            Free student account (Master 3 curriculum levels free) • No credit card needed.
          </p>

          {errorMessage && isRegister && (
            <div className="w-full max-w-sm mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2 text-left text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-0.5">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Diya Sen"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-base sm:text-xs px-3 py-2.5 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 font-medium border border-transparent"
                autoFocus={isRegister}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-0.5">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. student@gmail.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-base sm:text-xs px-3 py-2.5 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 font-medium border border-transparent"
              />
            </div>

            <div className="relative">
              <label className="block text-slate-700 font-semibold mb-0.5">Password (min. 6 chars) *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Choose a strong password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 text-base sm:text-xs px-3 py-2.5 sm:py-2 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff4b2b]/50 font-medium border border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-7 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-0.5">Board *</label>
                <select
                  value={board}
                  onChange={e => setBoard(e.target.value as Board)}
                  className="w-full bg-[#f0f2f5] text-slate-800 px-3 py-2 rounded-lg font-medium focus:outline-none border border-transparent"
                >
                  <option value="CBSE">CBSE (National)</option>
                  <option value="ICSE">ICSE (CISCE)</option>
                  <option value="IGCSE">Cambridge IGCSE</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-0.5">Class / Grade *</label>
                <select
                  value={grade}
                  onChange={e => setGrade(Number(e.target.value) as Grade)}
                  className="w-full bg-[#f0f2f5] text-slate-800 px-3 py-2 rounded-lg font-medium focus:outline-none border border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-0.5">Parent Name</label>
                <input
                  type="text"
                  placeholder="e.g. S. Sen"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full bg-[#f0f2f5] text-slate-800 placeholder-slate-400 px-3 py-2 rounded-lg font-medium focus:outline-none border border-transparent"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-0.5">Referral Code</label>
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
                hasError={captchaError && isRegister}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="md-btn-raised w-full py-2.5 bg-[#3F51B5] hover:bg-[#303F9F] text-white font-bold text-xs uppercase tracking-wider rounded-[3px] transition-all cursor-pointer disabled:opacity-50 mt-1 text-center"
            >
              {isSubmitting ? 'CREATING ACCOUNT...' : 'START FREE ACCOUNT (3 LEVELS)'}
            </button>
          </form>

          {/* Mobile switcher link */}
          <div className="md:hidden mt-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleToggleToSignIn}
              className="text-xs text-slate-600 hover:text-[#ff4b2b] font-medium"
            >
              Already registered? <strong className="text-[#ff4b2b] underline">Sign in here</strong>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP SLIDING OVERLAY CONTAINER (Vibrant Gradient)     */}
        {/* ======================================================== */}
        <div
          className={`hidden md:flex absolute top-0 left-0 w-1/2 h-full z-30 transition-transform duration-700 ease-in-out bg-gradient-to-tr from-[#ff4b2b] to-[#ff416c] text-white flex-col items-center justify-center text-center p-8 sm:p-12 shadow-2xl ${
            !isRegister ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* Overlay View A: When Sign In is active (Overlay sits on the RIGHT side) */}
          <div
            className={`transition-all duration-500 flex flex-col items-center justify-center ${
              !isRegister ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Hello, Friend!
            </h2>
            <p className="text-sm text-white/95 max-w-[260px] leading-relaxed font-normal mb-8">
              Enter your personal details and start journey with us
            </p>

            {/* Ghost SIGN UP button - Smoothly transitions to Sign Up on other side without redirecting */}
            <button
              type="button"
              onClick={handleToggleToSignUp}
              className="px-10 py-2.5 border-2 border-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white hover:text-[#ff416c] active:scale-95 transition-all cursor-pointer shadow-md"
            >
              SIGN UP
            </button>

            <div className="mt-6 px-4 py-1.5 bg-black/15 backdrop-blur-md rounded-full text-[11px] text-white/95 font-medium border border-white/20 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Free Student Plan: 3 Levels Included</span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20">
              <button
                type="button"
                onClick={handleSpecial49Click}
                className="text-[11px] text-white/80 hover:text-white underline transition-colors cursor-pointer"
              >
                Want ₹49 Concept Booster pass? Special Offer →
              </button>
            </div>
          </div>

          {/* Overlay View B: When Sign Up is active (Overlay sits on the LEFT side) */}
          <div
            className={`transition-all duration-500 flex flex-col items-center justify-center ${
              isRegister ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Welcome Back!
            </h2>
            <p className="text-sm text-white/95 max-w-[260px] leading-relaxed font-normal mb-8">
              To keep connected with your syllabus progress, please login with your personal info
            </p>

            {/* Ghost SIGN IN button - Smoothly transitions back to Sign In on the other side */}
            <button
              type="button"
              onClick={handleToggleToSignIn}
              className="px-10 py-2.5 border-2 border-white text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white hover:text-[#ff416c] active:scale-95 transition-all cursor-pointer shadow-md"
            >
              SIGN IN
            </button>

            <div className="mt-6 px-4 py-1.5 bg-black/15 backdrop-blur-md rounded-full text-[11px] text-white/95 font-medium border border-white/20">
              ⚡ Instant Access • All 12 Classes Live
            </div>

            <div className="mt-4 pt-3 border-t border-white/20">
              <button
                type="button"
                onClick={handleSpecial49Click}
                className="text-[11px] text-white/80 hover:text-white underline transition-colors cursor-pointer"
              >
                Looking for ₹49 Concept Booster? Click here →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
