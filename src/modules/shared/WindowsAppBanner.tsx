import React from 'react';
import { Download, Monitor, Sparkles, Timer, StickyNote, Maximize2 } from 'lucide-react';

export const WINDOWS_INSTALLER_URL = 'https://drive.google.com/uc?export=download&id=1fhq9zeD4PHx9_icF2TPwpdSZgcSpErng';

export function isDesktopAppOrWebView(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const w = window as unknown as {
    chrome?: { webview?: unknown };
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
    electronAPI?: unknown;
    process?: { versions?: { electron?: string } };
  };
  const ua = navigator.userAgent || '';

  // Microsoft Edge WebView2, Electron, Tauri, Android/generic WebView, or standalone app window
  if (w.chrome?.webview !== undefined) return true;
  if (w.__TAURI__ !== undefined || w.__TAURI_INTERNALS__ !== undefined) return true;
  if (w.electronAPI !== undefined || w.process?.versions?.electron) return true;
  if (/electron|webview|\bwv\b|academiclevel-desktop/i.test(ua)) return true;
  if (window.matchMedia?.('(display-mode: standalone)')?.matches) return true;
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return true;

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'windows' || params.get('wrapper') === '1') {
      sessionStorage.setItem('al_in_app_wrapper', '1');
      return true;
    }
    if (sessionStorage.getItem('al_in_app_wrapper') === '1') return true;
  } catch {}

  return false;
}

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
  if (!isWindowsClient() || isDesktopAppOrWebView()) return null;

  return (
    <div
      className={`bg-gradient-to-r from-indigo-950 via-blue-900 to-indigo-900 text-white border border-indigo-400/40 rounded-3xl shadow-lg ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WINDOWS APP RECOMMENDED — BETTER THAN WEB</span>
            </span>
            <span className="text-[11px] font-semibold text-indigo-200">
              Official Desktop Wrapper of academiclevel.in (~1 MB)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed max-w-2xl">
            We detected you&apos;re on <strong>Windows</strong>! The official Windows App includes a built-in <strong>Pomodoro study timer</strong>, instant <strong>notes scratchpad button</strong>, and full-screen <strong>focus mode</strong> — built for distraction-free study and higher test scores.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-bold text-slate-200">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-900/80 border border-indigo-400/30 text-rose-300">
              <Timer className="w-3.5 h-3.5" />
              <span>Pomodoro Study Timer</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-900/80 border border-indigo-400/30 text-amber-300">
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notes Scratchpad</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-900/80 border border-indigo-400/30 text-emerald-300">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Focus Mode (Full Screen)</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href={WINDOWS_INSTALLER_URL}
            target="_blank"
            rel="noopener noreferrer"
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
