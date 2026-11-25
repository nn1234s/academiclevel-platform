import React, { useState } from 'react';
import {
  Award,
  Trophy,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Star,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';

interface InnovativeEdtechPageProps {
  onBack: () => void;
}

export const InnovativeEdtechPage: React.FC<InnovativeEdtechPageProps> = ({ onBack }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const ARTICLE_URL =
    'https://edtechcenturyblog.blogspot.com/2026/11/academiclevel-most-innovative-edtech.html';

  const reloadIframe = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className={`min-h-screen bg-[#EEEEEE] text-white ${isFullscreen ? 'p-2' : 'py-6 px-4 sm:px-6 lg:px-8'}`}>
      <div className={`${isFullscreen ? 'max-w-none' : 'max-w-6xl'} mx-auto space-y-6 transition-all`}>
        
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E0E0E0] pb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#F5F5F5] text-[#424242] hover:text-white border border-[#E0E0E0] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#3F51B5]" />
            <span>Return to AcademicLevel</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={reloadIframe}
              title="Reload article frame"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F5F5F5] text-[#424242] hover:text-white border border-[#E0E0E0] text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#616161]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F5F5F5] text-[#424242] hover:text-white border border-[#E0E0E0] text-xs font-semibold transition-all cursor-pointer"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>

            <a
              href={ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-950"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Hero #1 Most Innovative EdTech Badge Banner (Hidden in Fullscreen) */}
        {!isFullscreen && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
              <div className="space-y-3 max-w-2xl">
                {/* #1 Badge Ribbon */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-sm">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Ranked #1 — Most Innovative EdTech Platform 2026</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#212121] tracking-tight">
                  AcademicLevel Featured by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">EdTech Century</span>
                </h1>

                <p className="text-xs sm:text-sm text-[#424242] leading-relaxed">
                  Recognized as India&apos;s leading next-generation K-12 learning architecture. Featuring adaptive Nova AI tutoring, 3,600+ syllabus-mapped questions for CBSE, ICSE, and Cambridge IGCSE, and zero-ad student privacy.
                </p>

                {/* Rating & Star Badge */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#424242]">
                    5.0 / 5.0 Editorial Excellence Rating
                  </span>
                  <span className="text-[11px] text-[#616161] border-l border-[#E0E0E0] pl-3">
                    Published on EdTech Century Blog
                  </span>
                </div>
              </div>

              {/* Prominent Gold Seal / Trophy Card */}
              <div className="shrink-0 bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-xl text-center w-full max-w-[240px]">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                  <Award className="w-9 h-9" />
                </div>
                <div className="text-amber-400 text-xs font-black tracking-widest uppercase">
                  Official Award
                </div>
                <div className="text-[#212121] text-lg font-black mt-0.5">
                  #1 IN INNOVATION
                </div>
                <div className="text-[10px] text-[#616161] mt-1">
                  K-12 AI Learning Ecosystem
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#E0E0E0] text-[10px] text-amber-300/80 font-mono">
                  EdTech Century • Nov 2026
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-[#E0E0E0]">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-[#E0E0E0] text-xs text-[#424242]">
                <CheckCircle2 className="w-4 h-4 text-[#00796B] shrink-0" />
                <span>Nova AI Tutor</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-[#E0E0E0] text-xs text-[#424242]">
                <CheckCircle2 className="w-4 h-4 text-[#00796B] shrink-0" />
                <span>3,600+ Questions Bank</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-[#E0E0E0] text-xs text-[#424242]">
                <CheckCircle2 className="w-4 h-4 text-[#00796B] shrink-0" />
                <span>DPDP 2023 Child-Safe</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-[#E0E0E0] text-xs text-[#424242]">
                <CheckCircle2 className="w-4 h-4 text-[#00796B] shrink-0" />
                <span>Zero Third-Party Ads</span>
              </div>
            </div>
          </div>
        )}

        {/* Embedded iFrame Container */}
        <div className="relative bg-white border border-[#E0E0E0] rounded-3xl overflow-hidden shadow-2xl">
          {/* Top Browser Bar Mockup */}
          <div className="bg-[#EEEEEE] px-4 py-3 border-b border-[#E0E0E0] flex items-center justify-between text-xs text-[#616161]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-[#616161] ml-2 truncate max-w-md">
                https://edtechcenturyblog.blogspot.com/.../academiclevel-most-innovative-edtech.html
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-400/90 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Live Embedded Article
              </span>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 top-10 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xs">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-[#424242] font-medium">Loading EdTech Century article...</p>
            </div>
          )}

          {/* Real iFrame */}
          <iframe
            key={iframeKey}
            src={ARTICLE_URL}
            title="AcademicLevel: Most Innovative EdTech — EdTech Century Feature"
            onLoad={() => setIsLoading(false)}
            className={`w-full ${isFullscreen ? 'h-[90vh]' : 'h-[750px] sm:h-[820px]'} border-0 bg-white`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
            loading="lazy"
          />
        </div>

        {/* Fallback Notice & Direct Action Card */}
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#616161]">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <p>
              Experiencing frame loading issues on your device? You can always access the original independent feature directly on EdTech Century Blog.
            </p>
          </div>
          <a
            href={ARTICLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 rounded-xl bg-[#F5F5F5] hover:bg-slate-700 text-amber-300 font-bold transition-colors flex items-center gap-1.5"
          >
            <span>Read on EdTech Century</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
