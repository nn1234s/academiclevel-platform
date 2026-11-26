import React from 'react';
import { Download, Monitor, Sparkles } from 'lucide-react';

export const WINDOWS_INSTALLER_URL = '/installers/AcademicLevel_K12_Online_Setup.exe';

export function isWindowsClient(): boolean {
  if (typeof navigator === 'undefined') return false;
  const uaDataPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || '';
  const platform = navigator.platform || '';
  const ua = navigator.userAgent || '';
  return /win/i.test(uaDataPlatform) || /win/i.test(platform) || /windows/i.test(ua);
}

interface WindowsAppBannerProps {
  onOpenDownloads?: () => void;
  compact?: boolean;
}

export const WindowsAppBanner: React.FC<WindowsAppBannerProps> = ({ onOpenDownloads, compact = false }) => {
  if (!isWindowsClient()) return null;

  return (
    <div
      className={`bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-900 text-white border border-indigo-400/40 rounded-3xl shadow-lg ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WINDOWS APP RECOMMENDED — BETTER THAN WEB</span>
            </span>
            <span className="text-[11px] font-semibold text-indigo-200">
              Official Desktop Wrapper of academiclevel.in
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
            We detected you&apos;re on <strong>Windows</strong>! Install the lightweight AcademicLevel Windows App for faster launch, distraction-free full-screen study, and a smoother experience than a browser tab.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href={WINDOWS_INSTALLER_URL}
            download="AcademicLevel_K12_Online_Setup.exe"
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs sm:text-sm inline-flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Windows App (.exe)</span>
          </a>
          {onOpenDownloads && (
            <button
              type="button"
              onClick={onOpenDownloads}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Downloads Page</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
