import React from 'react';
import { ShieldCheck, Lock, Eye, AlertTriangle } from 'lucide-react';

interface LegalPageProps {
  pageType: 'PRIVACY' | 'TERMS' | 'SAFETY';
}

export const LegalPages: React.FC<LegalPageProps> = ({ pageType }) => {
  if (pageType === 'PRIVACY') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-slate-100 py-6 px-4">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            DPDP Act 2023 Compliant
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            AcademicLevel Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mt-1">Last Updated: Academic Year 2026-2027</p>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <h2 className="text-sm font-bold text-white">1. Compliance with Digital Personal Data Protection (DPDP) Act 2023</h2>
          <p>
            AcademicLevel operates under strict compliance with India&apos;s DPDP Act 2023. As a platform serving minor students (Classes 1 to 12), we enforce verified parental consent mechanisms, zero behavioral ad profiling, and verifiable data minimization.
          </p>

          <h2 className="text-sm font-bold text-white">2. Data We Collect and Why</h2>
          <p>
            We collect only the bare essentials needed to deliver pedagogical learning: student name, grade, board, parent contact information, and quiz assessment telemetry. We do not sell or monetize student data under any circumstances.
          </p>

          <h2 className="text-sm font-bold text-white">3. Row-Level Tenant Isolation</h2>
          <p>
            All student progress, quiz attempts, and peer chats are protected by strict Row-Level Security (RLS). Client A can never view, inspect, or mutate Client B&apos;s private data.
          </p>

          <h2 className="text-sm font-bold text-white">4. Parental Rights & Erasure</h2>
          <p>
            Parents hold the right to inspect all learning metrics or request permanent data deletion at any time via the Student Profile Parent PIN view or by writing to support.
          </p>
        </div>
      </div>
    );
  }

  if (pageType === 'SAFETY') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-slate-100 py-6 px-4">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Child Protection Mandate
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Child Safety & PII Firewall Protocol
          </h1>
          <p className="text-xs text-slate-400 mt-1">Safeguarding K-12 Scholars</p>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <h2 className="text-sm font-bold text-white">1. Automated PII Firewall in StudentPacks</h2>
          <p>
            All messages exchanged within the StudentPacks community pass through an automated real-time regex filter. Phone numbers (10-digit Indian formats), email addresses, external URLs, and social media handles (Telegram, Discord, Instagram) are automatically redacted before delivery.
          </p>

          <h2 className="text-sm font-bold text-white">2. Zero Third-Party Advertising</h2>
          <p>
            AcademicLevel contains zero third-party advertising, zero affiliate cookies, and zero behavioral marketing trackers. Children learn in a completely safe, distraction-free digital environment.
          </p>

          <h2 className="text-sm font-bold text-white">3. One-Click Reporting and Moderation</h2>
          <p>
            Any student can report inappropriate behavior or block peers with one tap. Flagged interactions are immediately audited by our human moderation team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-100 py-6 px-4">
      <div className="border-b border-slate-800 pb-4">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
          Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
          Terms of Service & Fair Use Policy
        </h1>
        <p className="text-xs text-slate-400 mt-1">Effective: Academic Year 2026-2027</p>
      </div>

      <div className="space-y-4 text-xs text-slate-300 leading-relaxed bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h2 className="text-sm font-bold text-white">1. Anti-Cheat & Dwell Time Guard</h2>
        <p>
          To maintain ledger integrity and certificate authenticity, students must spend a minimum dwell time (3 seconds) per question. Automated bot scripts or instant guessing will trigger anti-cheat audit flags and forfeit coin rewards.
        </p>

        <h2 className="text-sm font-bold text-white">2. Class Change Policy</h2>
        <p>
          Students are strictly permitted a maximum of 1 class change during an active Premium period and 1 class change post-expiry. Accounts found rotating classes to share a single subscription will be suspended.
        </p>

        <h2 className="text-sm font-bold text-white">3. UPI Payment & UTR Verification</h2>
        <p>
          All UPI transactions require submission of a valid, authentic 12-digit UTR bank reference number. Replay or duplicate UTR submissions constitute fraudulent activity and trigger permanent account suspension.
        </p>

        <h2 className="text-sm font-bold text-white">4. Study Coin Economy</h2>
        <p>
          Study Coins are promotional loyalty credits tracked on an append-only ledger. They hold no cash surrender value and are redeemable exclusively within the AcademicLevel Mall and Gift Store.
        </p>
      </div>
    </div>
  );
};
