import React, { useState } from 'react';
import { Board, Grade } from '../../core/types';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { X, Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'REGISTER' | 'LOGIN';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'REGISTER',
}) => {
  const { registerStudent, loginStudent, loginSuperAdmin } = useAuth();
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>(initialMode);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [board, setBoard] = useState<Board>('CBSE');
  const [grade, setGrade] = useState<Grade>(10);
  const [parentName, setParentName] = useState('');
  const [parentPin, setParentPin] = useState('1234');
  const [referralCode, setReferralCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (mode === 'REGISTER') {
      const res = await registerStudent({
        fullName,
        email,
        board,
        grade,
        parentName,
        parentPin,
        referredByCode: referralCode
      });
      setIsSubmitting(false);
      if (res.success) {
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
        onClose();
        return;
      }

      const res = await loginStudent(cleanEmail);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Login failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {mode === 'REGISTER' ? 'Create Scholar Account' : 'Student & Parent Login'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'REGISTER'
              ? 'Starts with 25 free quizzes & full board syllabus coverage.'
              : 'Enter your registered email to resume learning.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Diya Sen"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. student@school.edu or parent@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {mode === 'REGISTER' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Board *</label>
                  <select
                    value={board}
                    onChange={e => setBoard(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE / CISCE</option>
                    <option value="IGCSE">Cambridge IGCSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Class (Grade) *</label>
                  <select
                    value={grade}
                    onChange={e => setGrade(Number(e.target.value) as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Parent Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sen"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Referral Code (Optional)</label>
                <input
                  type="text"
                  placeholder="AL-XXX-XXXX"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center space-x-1.5 mt-2"
          >
            <span>{isSubmitting ? 'Verifying...' : mode === 'REGISTER' ? 'Register & Start (25 Free Quizzes)' : 'Login to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'REGISTER' ? (
            <p>
              Already registered?{' '}
              <button
                onClick={() => {
                  setMode('LOGIN');
                  setErrorMessage('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline"
              >
                Log In Here
              </button>
            </p>
          ) : (
            <p>
              New student?{' '}
              <button
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMessage('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline"
              >
                Create Free Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
