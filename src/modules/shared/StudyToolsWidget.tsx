import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  StickyNote,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  X,
  Copy,
  Check,
  Sparkles,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const POMODORO_STORAGE_KEY = 'al_pomodoro_state_v1';
const NOTES_STORAGE_KEY = 'al_student_quick_notes_v1';

export const StudyToolsWidget: React.FC = () => {
  // Toolbar collapse / open state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'POMODORO' | 'NOTES' | null>(null);

  // Fullscreen / Focus Mode state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pomodoro Timer State
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);

  // Notes State
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem(NOTES_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [copied, setCopied] = useState(false);

  // Track Fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Pomodoro countdown ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Sound notification using Web Audio API
            try {
              const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(mode === 'FOCUS' ? 587.33 : 880, ctx.currentTime); // D5 or A5
              gain.gain.setValueAtTime(0.15, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.8);
            } catch {}

            // Flip mode
            if (mode === 'FOCUS') {
              setMode('BREAK');
              return 5 * 60; // 5 min break
            } else {
              setMode('FOCUS');
              return 25 * 60; // 25 min focus
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  // Save notes to localStorage
  const handleNotesChange = (val: string) => {
    setNotes(val);
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, val);
    } catch {}
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating Study Tools Dock (Bottom Left on Desktop, unobtrusive) */}
      <aside aria-label="Study Tools Bar" className="fixed bottom-20 left-4 z-40 flex flex-col items-start space-y-2 select-none print:hidden">
        {/* Expanded Controls Drawer */}
        {isOpen && (
          <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200 w-56">
            <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[11px] font-black tracking-wider uppercase text-slate-400">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Study Booster Tools</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:text-white transition-colors cursor-pointer"
                title="Minimize toolbar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              {/* 1. Pomodoro Timer Button */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'POMODORO' ? null : 'POMODORO')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'POMODORO'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-rose-400" />
                  <span>Pomodoro Timer</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums bg-black/30 px-1.5 py-0.5 rounded">
                  {formatTime(timeLeft)}
                </span>
              </button>

              {/* 2. Notes Scratchpad Button */}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'NOTES' ? null : 'NOTES')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'NOTES'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <StickyNote className="w-4 h-4 text-amber-400" />
                  <span>Notes Scratchpad</span>
                </div>
                {notes.trim().length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>

              {/* 3. Focus Mode (Full Screen) Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  isFullscreen
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-indigo-300" />
                  )}
                  <span>Focus Mode (Full Screen)</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase bg-black/30">
                  {isFullscreen ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Trigger Pill */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg border transition-all cursor-pointer text-xs font-black backdrop-blur-md ${
            isRunning || isFullscreen || notes.trim().length > 0
              ? 'bg-indigo-950/90 text-white border-indigo-400/50 hover:bg-indigo-900 shadow-indigo-500/20'
              : 'bg-white/95 text-slate-800 border-slate-300 hover:bg-slate-50 shadow-md'
          }`}
          title="Open Study Tools (Pomodoro Timer, Notes Scratchpad, Focus Mode)"
        >
          <Timer className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="tabular-nums font-mono">
            {isRunning ? formatTime(timeLeft) : 'Study Tools'}
          </span>
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </aside>

      {/* Pomodoro Timer Modal / Popover */}
      {activeTab === 'POMODORO' && (
        <div className="fixed bottom-24 left-4 sm:left-16 z-50 w-72 bg-slate-900 text-white border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                {mode === 'FOCUS' ? '🎯 Focus Session' : '☕ Recharge Break'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-4xl font-black font-mono tracking-tight text-white tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <p className="text-[11px] text-slate-400">
              {mode === 'FOCUS'
                ? 'Stay focused on your questions & NCERT syllabus.'
                : 'Take a quick stretch! Grab a glass of water.'}
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-center space-x-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('FOCUS');
                setTimeLeft(25 * 60);
                setIsRunning(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                mode === 'FOCUS' && timeLeft === 25 * 60
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              25m Focus
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('FOCUS');
                setTimeLeft(50 * 60);
                setIsRunning(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                mode === 'FOCUS' && timeLeft === 50 * 60
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              50m Sprint
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('BREAK');
                setTimeLeft(5 * 60);
                setIsRunning(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                mode === 'BREAK'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              5m Break
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-2 rounded-xl text-xs font-black inline-flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-all ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Notes Scratchpad Modal / Popover */}
      {activeTab === 'NOTES' && (
        <div className="fixed bottom-24 left-4 sm:left-24 z-50 w-80 sm:w-96 bg-white border border-slate-300 rounded-3xl p-4 shadow-2xl space-y-3 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <StickyNote className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Student Quick Notes &amp; Scratchpad
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={notes}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder="Jot down quick formulas, tough vocabulary, or revision points here... (Auto-saved)"
            rows={7}
            className="w-full text-xs p-3 rounded-2xl bg-amber-50/50 border border-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-sans leading-relaxed resize-none"
          />

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-[10px] text-slate-400">
              Auto-saved to your device
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleCopyNotes}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {notes.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => handleNotesChange('')}
                  className="px-2 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
