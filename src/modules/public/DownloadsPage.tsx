import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Globe,
  Monitor,
  Sparkles,
  Zap
} from 'lucide-react';
import { isDesktopAppOrWebView, isWindowsClient, WINDOWS_INSTALLER_URL } from '../shared/WindowsAppBanner';

interface DownloadsPageProps {
  onBack: () => void;
  onOpenWebApp: () => void;
}

export const DownloadsPage: React.FC<DownloadsPageProps> = ({ onBack, onOpenWebApp }) => {
  const inApp = isDesktopAppOrWebView();
  const isWindows = isWindowsClient() && !inApp;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 border border-indigo-800/40 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Official AcademicLevel Downloads</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-slate-200">
            <Monitor className="w-3.5 h-3.5 text-emerald-300" />
            <span>Detected Device: {inApp ? 'AcademicLevel Desktop App' : isWindows ? 'Windows PC' : 'Web Browser'}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Get AcademicLevel on Your Device
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Currently we support two official ways to study on AcademicLevel: the{' '}
          <strong>Windows Desktop App (.exe)</strong> — an official desktop wrapper of{' '}
          <strong>academiclevel.in</strong> — and the <strong>Web App</strong> in any browser.
        </p>

        {inApp ? (
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-400 text-emerald-950 text-xs sm:text-sm font-black shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>You&apos;re already using the AcademicLevel Desktop App!</span>
          </div>
        ) : isWindows && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-400 text-amber-950 text-xs sm:text-sm font-black shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>WINDOWS APP RECOMMENDED FOR YOUR PC — BETTER THAN WEB!</span>
          </div>
        )}
      </div>

      {/* Two Official Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Windows Desktop App (.exe) */}
        <div
          className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 transition-all ${
            isWindows
              ? 'border-2 border-indigo-600 ring-4 ring-indigo-100 shadow-lg'
              : 'border border-slate-200'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Monitor className="w-6 h-6" />
              </div>
              {isWindows ? (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
                  ★ RECOMMENDED • BETTER THAN WEB
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  Windows 10 / 11 (.exe)
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                AcademicLevel for Windows (.exe)
              </h2>
              <p className="text-xs text-indigo-700 font-bold mt-0.5">
                Official Desktop Wrapper of academiclevel.in (~1 MB Online Setup)
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Built as a clean, dedicated desktop wrapper around <strong>academiclevel.in</strong> so students can launch straight into CBSE quizzes, Nova AI, and Study Quests without browser tabs or distractions.
            </p>

            <ul className="space-y-2 pt-1">
              {[
                'Faster 1-click launch from your Desktop or Start Menu',
                'Distraction-free full-screen study window (no extra browser tabs)',
                'Always synced live with academiclevel.in & your Study Coins',
                'Lightweight 1 MB setup (AcademicLevel_K12_Online_Setup.exe)'
              ].map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={WINDOWS_INSTALLER_URL}
            download="AcademicLevel_K12_Online_Setup.exe"
            className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm inline-flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download AcademicLevel_K12_Online_Setup.exe</span>
          </a>
        </div>

        {/* 2. Web App (academiclevel.in) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Globe className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                All Browsers &amp; Devices
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                AcademicLevel Web App
              </h2>
              <p className="text-xs text-emerald-700 font-bold mt-0.5">
                Instant Browser Access at academiclevel.in
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No installation needed — open <strong>academiclevel.in</strong> directly in Chrome, Edge, Safari, or mobile browsers on Windows, Mac, Linux, Android, or iOS.
            </p>

            <ul className="space-y-2 pt-1">
              {[
                'Works on any phone, tablet, Chromebook, or Mac',
                'Zero download required — start practicing in seconds',
                'Full access to 3,600+ CBSE MCQs, Nova AI & Gift Store'
              ].map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onOpenWebApp}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm inline-flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Continue on Web App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
