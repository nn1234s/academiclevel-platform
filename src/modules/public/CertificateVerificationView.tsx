import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Calendar, BookOpen, GraduationCap, ExternalLink } from 'lucide-react';

interface VerifiedCertificate {
  certificateId: string;
  learnerName: string;
  certificateType: string;
  board: string;
  grade: number;
  subjectName: string;
  levelName: string;
  academicYear: string;
  issuedAt: string;
  verificationToken: string;
}

interface CertificateVerificationViewProps {
  token?: string;
  onNavigateHome: () => void;
}

export const CertificateVerificationView: React.FC<CertificateVerificationViewProps> = ({ token: propToken, onNavigateHome }) => {
  const [tokenInput, setTokenInput] = useState<string>(propToken || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerifiedCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const verifyToken = async (targetToken: string) => {
    if (!targetToken.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(targetToken.trim())}`);
      const data = await res.json();
      if (res.ok && data.success && data.certificate) {
        setResult(data.certificate);
      } else {
        setResult(null);
        setError(data.error || 'Credential not found. Please verify the cryptographic token.');
      }
    } catch {
      setResult(null);
      setError('Unable to reach credential verification server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propToken) {
      verifyToken(propToken);
    } else if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const urlToken = pathParts[2] || new URLSearchParams(window.location.search).get('token');
      if (urlToken) {
        setTokenInput(urlToken);
        verifyToken(urlToken);
      }
    }
  }, [propToken]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 text-slate-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to AcademicLevel</span>
        </button>

        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Official Public Registry</span>
        </div>
      </div>

      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-950 mb-3">
          <Award className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Academic Credential Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          Verify authentic course mastery awards and annual master honors issued by AcademicLevel Council.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyToken(tokenInput);
          }}
          className="mt-6 max-w-md mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Enter token (e.g. tok_... or CERT-...)"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Verification Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>OFFICIALLY VERIFIED &amp; VALID CREDENTIAL</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
              ID: {result.certificateId}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Recipient Scholar</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{result.learnerName}</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">Curriculum</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">{result.board}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">Grade / Class</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">Class {result.grade}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">Subject</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block capitalize">{result.subjectName}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-medium">Honor Tier</span>
                <span className="text-xs font-bold text-amber-300 mt-0.5 block">{result.levelName || 'Mastery'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div>
                <span>Academic Year: <strong className="text-slate-200">{result.academicYear}</strong></span>
                <span className="mx-2">•</span>
                <span>Issued: <strong className="text-slate-200">{new Date(result.issuedAt).toLocaleDateString()}</strong></span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Token: {result.verificationToken}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error / Not Found Card */}
      {hasSearched && !loading && error && (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center text-slate-300 shadow-xl space-y-3">
          <XCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Verification Failed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
        </div>
      )}
    </div>
  );
};
