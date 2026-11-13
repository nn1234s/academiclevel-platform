import React from 'react';
import { ArrowLeft, ShieldAlert, Mail, Gift, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface HallOfFamePageProps {
  onNavigateHome?: () => void;
}

export const HallOfFamePage: React.FC<HallOfFamePageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 rounded-3xl my-4">
      <div className="max-w-[760px] mx-auto">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-1.5 text-blue-600 hover:text-blue-800 font-semibold text-sm mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AcademicLevel Home</span>
          </button>
        )}

        {/* Page Header */}
        <header className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Security Vulnerability &amp; Bug Bounty Policy
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Official guidelines for technical vulnerability disclosures and critical bug reporting.
          </p>
        </header>

        {/* STRICT NO RECOGNITION NOTICE */}
        <section className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8 text-slate-900 shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-red-950 mb-1">
                Zero Public Recognition Policy
              </h2>
              <p className="text-red-900 text-sm leading-relaxed font-medium">
                Please take note: <strong>You will receive NO public recognition, NO Hall of Fame listing, NO certificates, NO social media shoutouts, and NO public acknowledgments whatsoever</strong> for discovering or reporting vulnerabilities on AcademicLevel. All legacy recognition listings have been permanently discontinued.
              </p>
            </div>
          </div>
        </section>

        {/* 10 RS AMAZON GC BOUNTY NOTICE */}
        <section className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 mb-8 shadow-xs">
          <div className="flex items-start space-x-3">
            <Gift className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-amber-950 mb-1">
                Bounty Reward: ₹10 Amazon Gift Card (Amazon GC)
              </h2>
              <p className="text-amber-900 text-sm leading-relaxed">
                If you report a genuine security vulnerability that our engineering team verifies to be{' '}
                <strong className="text-amber-950 font-black uppercase tracking-wide">
                  VERY VERY VERY VERY critical
                </strong>
                , you are eligible to receive a <strong>₹10 Amazon Gift Card (Amazon GC)</strong> delivered to your reporting email upon complete remediation.
              </p>
            </div>
          </div>
        </section>

        {/* QUALIFYING VS NON-QUALIFYING CRITERIA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Qualifying (VERY VERY VERY VERY CRITICAL) */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What Qualifies (Must be VERY Critical)</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Remote Code Execution (RCE)</strong> directly compromising production server host or containers.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Direct SQL / Database Injection</strong> resulting in unauthenticated total production data compromise.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Full Server-Side Auth Bypass</strong> allowing complete unauthorized control of the Super-Admin Vault.</span>
              </li>
            </ul>
          </div>

          {/* Non-Qualifying */}
          <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>What Does NOT Qualify (Zero Bounty)</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Missing HTTP security headers (CSP, HSTS, X-Frame-Options, etc.).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Rate-limiting timing quirks, public assets, or local storage inspection.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>SPF, DKIM, or DMARC email record observations.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Automated scanner or pentest tool outputs without a proven functional exploit.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Minor copy, UI glitches, or expected client-side features.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Responsible Submission Channel */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>How to Submit a Critical Report</span>
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            If you have identified a genuine, reproducible, VERY VERY VERY VERY critical vulnerability, submit your detailed proof of concept (PoC), step-by-step reproduction guide, and exact HTTP request payloads to:
          </p>
          <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-blue-700 font-bold flex items-center justify-between">
            <span>securityacademiclevels@gmail.com</span>
            <a
              href="mailto:securityacademiclevels@gmail.com"
              className="text-slate-600 hover:text-blue-600 text-xs font-sans underline"
            >
              Open Email App
            </a>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            Rules of Engagement: Do not exfiltrate or modify student records, do not disrupt platform availability (no DoS/DDoS), and allow our team reasonable time to investigate. Ineligible submissions, spam, and non-critical findings will be closed without response.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-1">
          <p>Bounty terms: Exactly one ₹10 Amazon Gift Card (Amazon GC) strictly for verified VERY VERY VERY VERY critical vulnerabilities.</p>
          <p className="text-slate-400">© 2020–{new Date().getFullYear()} ZINGQUARK INDIA TECHNOLOGIES PVT LTD. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};
