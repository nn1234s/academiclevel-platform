import React, { useState } from 'react';
import { Learner } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { CertificateService } from '../../services/certificateService';
import { ApiClient } from '../../core/api/apiClient';
import confetti from 'canvas-confetti';
import { Award, Sparkles, CheckCircle2, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface AnnualMasterCertificateProps {
  learner: Learner;
  onCertificateIssued: () => void;
}

export const AnnualMasterCertificate: React.FC<AnnualMasterCertificateProps> = ({
  learner,
  onCertificateIssued,
}) => {
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  // Check progress
  const progressList = StorageRLSLayer.getProgressForLearner(learner.id, learner.id);
  const completedThisYear = progressList.filter(p => p.isCompleted && p.calendarYear === currentYear);
  const distinctNodes = new Set(
    completedThisYear.map(p => `${p.board}_${p.grade}_${p.subjectId}_${p.levelNode}`)
  );
  const distinctCount = distinctNodes.size;

  // Check existing master certificate
  const certs = StorageRLSLayer.getCertificates(learner.id, learner.id);
  const existingMaster = certs.find(
    c => c.certificateType === 'ANNUAL_MASTER' && c.academicYear === academicYear
  );

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClaim = () => {
    setMessage(null);
    const result = CertificateService.checkAndAwardAnnualMasterCertificate(
      learner.id,
      learner.fullName,
      learner.board,
      learner.grade
    );

    if (result.awarded) {
      if (result.certificate) {
        ApiClient.issueCertificate(result.certificate).catch(() => {});
      }
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      setMessage({ type: 'success', text: result.reason });
      onCertificateIssued();
    } else {
      setMessage({ type: 'error', text: result.reason });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-100">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-900/60 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4">
          <Award className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          Academic Year {academicYear}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          The Annual Master Certificate
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
          Awarded only to students who achieve complete mastery across at least <strong className="text-white">3 distinct course levels</strong> within a single calendar year.
          Enforces strict deduplication: maximum 1 Master Certificate per student per academic year.
        </p>

        {/* Progress Tracker Meter */}
        <div className="mt-8 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-slate-300">Annual Mastery Milestone</span>
            <span className="font-mono text-amber-400">{distinctCount} of 3 Levels Completed</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (distinctCount / 3) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center text-[11px]">
            <div className={`p-2.5 rounded-xl border ${distinctCount >= 1 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
              Level 1 Completed
            </div>
            <div className={`p-2.5 rounded-xl border ${distinctCount >= 2 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
              Level 2 Completed
            </div>
            <div className={`p-2.5 rounded-xl border ${distinctCount >= 3 ? 'border-amber-500/40 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
              Level 3 Completed
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-2xl border text-xs flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Claim / Status CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {existingMaster ? (
              <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Certificate already secured in Certificate Vault ({existingMaster.certificateId})</span>
              </span>
            ) : distinctCount >= 3 ? (
              <span className="text-amber-400 font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Criteria met! Ready to mint your Annual Master Certificate.</span>
              </span>
            ) : (
              <span className="text-slate-400">
                Complete {3 - distinctCount} more course level(s) this year to unlock.
              </span>
            )}
          </div>

          {!existingMaster && (
            <button
              onClick={handleClaim}
              disabled={distinctCount < 3}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Mint Annual Master Certificate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
