import React, { useState } from 'react';
import { Learner, Certificate } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { Award, Download, CheckCircle, ShieldCheck, Calendar, Sparkles, X } from 'lucide-react';

interface CertificateVaultProps {
  learner: Learner;
}

export const CertificateVault: React.FC<CertificateVaultProps> = ({ learner }) => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const certificates = StorageRLSLayer.getCertificates(learner.id, learner.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Tamper-Proof Academic Credentials
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            The Certificate Vault
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            All level mastery awards and annual master honors issued to {learner.fullName}. Each credential carries a globally verifiable cryptographic token.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-center min-w-[160px]">
          <span className="text-[11px] text-slate-400 block font-medium">Earned Certificates</span>
          <div className="flex items-center justify-center space-x-1.5 mt-1">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black text-white">{certificates.length}</span>
          </div>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Certificates Earned Yet</h3>
          <p className="text-xs max-w-md mx-auto">
            Complete any course level assessment with $\ge 70\%$ accuracy to earn your first official Level Mastery Certificate!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map(cert => {
            const isMaster = cert.certificateType === 'ANNUAL_MASTER';
            return (
              <div
                key={cert.certificateId}
                onClick={() => setSelectedCert(cert)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all hover:scale-[1.01] shadow-xl flex flex-col justify-between ${
                  isMaster
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/60 shadow-amber-950/40'
                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isMaster
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {isMaster ? '★ Annual Master Honor' : 'Level Mastery'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-snug">
                    {cert.subjectName || 'General Academic Mastery'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {cert.board} • Class {cert.grade} • {cert.levelName}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500 truncate max-w-[180px]">
                    ID: {cert.certificateId}
                  </span>
                  <span className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1">
                    <span>View / Print</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Resolution Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl relative text-slate-900 my-8">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Certificate Canvas */}
            <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50/50 border-8 border-double border-amber-700/60 rounded-2xl p-8 sm:p-10 text-center relative shadow-inner">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left">
                  <span className="text-xs font-mono font-black tracking-widest text-amber-900 uppercase">
                    ACADEMICLEVEL PLATFORM
                  </span>
                  <p className="text-[10px] text-amber-800">Learn in your era • Official Credential</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-amber-600/40 flex items-center justify-center text-amber-700 font-bold text-xs bg-amber-100">
                  AL
                </div>
              </div>

              <span className="text-[11px] font-mono font-semibold tracking-widest text-amber-800 uppercase block mb-1">
                Certificate of Academic Excellence
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 mb-4 tracking-tight">
                {selectedCert.certificateType === 'ANNUAL_MASTER'
                  ? 'Annual Master Scholar Honor'
                  : 'Course Level Mastery Award'}
              </h1>

              <p className="text-xs text-slate-600 mb-1">This is officially presented to</p>
              <h2 className="text-xl sm:text-2xl font-bold text-indigo-950 underline decoration-amber-500 underline-offset-8 mb-4">
                {selectedCert.learnerName}
              </h2>

              <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed mb-6">
                for demonstrating exceptional academic mastery in{' '}
                <strong className="text-slate-900">{selectedCert.subjectName}</strong> under the{' '}
                <strong className="text-slate-900">
                  {selectedCert.board} Class {selectedCert.grade}
                </strong>{' '}
                curriculum standards during Academic Year {selectedCert.academicYear}.
              </p>

              <div className="pt-6 border-t border-amber-300/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600">
                <div className="text-left">
                  <p className="font-mono font-bold text-slate-800">ID: {selectedCert.certificateId}</p>
                  <p>Issued: {new Date(selectedCert.issuedAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center space-x-1.5 text-amber-900 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Token: {selectedCert.verificationToken}</span>
                </div>

                <div className="text-right">
                  <p className="font-serif font-bold text-slate-900">AcademicLevel Council</p>
                  <p className="text-slate-500">Board of Assessment & AI</p>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Print or Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
