import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  Zap,
  Sparkles,
  BookOpen,
  Home,
  Compass,
  ArrowRight,
  Smile,
  Volume2,
  RefreshCw,
  Award,
  Gamepad2,
  X
} from 'lucide-react';

interface NotFoundPikaProps {
  onNavigateHome: () => void;
  onNavigateCourses: () => void;
  isAuthenticated?: boolean;
}

// Sample courses and curriculum subjects across CBSE, ICSE, and IGCSE
interface CourseSuggestion {
  id: string;
  name: string;
  board: 'CBSE' | 'ICSE' | 'IGCSE';
  grades: string;
  topics: string[];
}

const POPULAR_COURSES: CourseSuggestion[] = [
  { id: 'c1', name: 'Class 10 Science & Technology', board: 'CBSE', grades: 'Class 10', topics: ['Chemical Reactions', 'Electricity', 'Light', 'Life Processes'] },
  { id: 'c2', name: 'Class 10 Mathematics & Geometry', board: 'CBSE', grades: 'Class 10', topics: ['Trigonometry', 'Quadratic Equations', 'Real Numbers', 'Circles'] },
  { id: 'c3', name: 'Class 9 Physics & Motion', board: 'ICSE', grades: 'Class 9', topics: ['Laws of Motion', 'Gravitation', 'Work & Energy', 'Sound'] },
  { id: 'c4', name: 'Class 10 Chemistry & Periodic Trends', board: 'ICSE', grades: 'Class 10', topics: ['Periodic Table', 'Acids & Bases', 'Metallurgy', 'Organic Chemistry'] },
  { id: 'c5', name: 'Cambridge IGCSE Biology (0610)', board: 'IGCSE', grades: 'Class 9–10', topics: ['Cell Structure', 'Enzymes', 'Plant Nutrition', 'Genetics'] },
  { id: 'c6', name: 'Cambridge IGCSE Mathematics (0580)', board: 'IGCSE', grades: 'Class 9–10', topics: ['Algebraic Manipulation', 'Vectors', 'Probability', 'Calculus Basics'] },
  { id: 'c7', name: 'Class 8 Social Science & History', board: 'CBSE', grades: 'Class 8', topics: ['Modern India', 'Constitution & Judiciary', 'Resources & Industries'] },
  { id: 'c8', name: 'Classes 1–5 Elementary Concept Foundations', board: 'CBSE', grades: 'Class 1–5', topics: ['Numbers & Operations', 'Living World', 'Measurement', 'Shapes'] }
];

const RIDDLES = [
  {
    q: "Why did the student eat their math homework?",
    a: "Because the teacher said it was a piece of cake!"
  },
  {
    q: "What has keys, but no locks; space, but no room; and you can enter, but never go out?",
    a: "A computer keyboard!"
  },
  {
    q: "Why do plants hate algebra tests?",
    a: "Because they hate giving square roots to problems!"
  },
  {
    q: "I have no legs, but I travel faster than anything in the universe. What am I?",
    a: "A beam of light! (300,000 km per second!)"
  },
  {
    q: "What did Pikachu say when he aced the science quiz?",
    a: "Pika-pika! It was purely shocking!"
  }
];

export const NotFoundPika: React.FC<NotFoundPikaProps> = ({
  onNavigateHome,
  onNavigateCourses,
  isAuthenticated = false
}) => {
  // Course Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<CourseSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Bush Interaction State
  const [bushShake, setBushShake] = useState(false);
  const [bushClickCount, setBushClickCount] = useState(0);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);

  // Easter Egg Drawer / Modal State
  const [showBoredModal, setShowBoredModal] = useState(false);
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [showRiddleAnswer, setShowRiddleAnswer] = useState(false);
  const [cheatCode, setCheatCode] = useState('');
  const [cheatFeedback, setCheatFeedback] = useState('');

  // Mini-Game: Catch the Wild Spark
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(15);
  const [targetPos, setTargetPos] = useState({ top: 30, left: 40 });
  const gameTimerRef = useRef<any>(null);

  // Sound synthesis using Web Audio API
  const playSoundEffect = (type: 'spark' | 'fanfare' | 'click' | 'shiny') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'spark') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'fanfare') {
        const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.18);
        });
      } else if (type === 'shiny') {
        const notes = [659.25, 880.0, 1174.66, 1760.0];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
        });
      }
    } catch {}
  };

  // Filter courses live
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    const matches = POPULAR_COURSES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.board.toLowerCase().includes(q) ||
      c.grades.toLowerCase().includes(q) ||
      c.topics.some(t => t.toLowerCase().includes(q))
    );
    setFilteredCourses(matches);
  }, [searchQuery]);

  // Handle Grass Bush Click
  const handleBushClick = () => {
    setBushShake(true);
    const newCount = bushClickCount + 1;
    setBushClickCount(newCount);
    playSoundEffect('spark');

    // Create lightning spark particles
    const newSparks = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + (Math.random() * 30 - 15),
      y: 20 + (Math.random() * 20 - 10),
      angle: Math.random() * 360
    }));
    setSparks(newSparks);

    setTimeout(() => {
      setBushShake(false);
    }, 450);

    setTimeout(() => {
      setSparks([]);
    }, 800);

    // Easter Egg at 5 clicks: Shiny Sparkles!
    if (newCount % 5 === 0) {
      playSoundEffect('shiny');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#FEF08A', '#22C55E', '#38BDF8']
      });
    }
  };

  // Trigger Pikachu Thunderstorm
  const triggerThunderstorm = () => {
    playSoundEffect('fanfare');
    confetti({
      particleCount: 120,
      angle: 60,
      spread: 70,
      origin: { x: 0 },
      colors: ['#EAB308', '#FACC15', '#3B82F6', '#EF4444']
    });
    confetti({
      particleCount: 120,
      angle: 120,
      spread: 70,
      origin: { x: 1 },
      colors: ['#EAB308', '#FACC15', '#3B82F6', '#EF4444']
    });
  };

  // Mini-Game Loop
  const startSparkGame = () => {
    setGameActive(true);
    setGameScore(0);
    setGameTimeLeft(15);
    moveTarget();

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setGameTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimerRef.current);
          setGameActive(false);
          playSoundEffect('fanfare');
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#EAB308', '#22C55E', '#3B82F6']
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const moveTarget = () => {
    const top = Math.floor(15 + Math.random() * 65);
    const left = Math.floor(10 + Math.random() * 75);
    setTargetPos({ top, left });
  };

  const handleCatchSpark = () => {
    if (!gameActive) return;
    playSoundEffect('spark');
    setGameScore(prev => prev + 1);
    moveTarget();
  };

  // Cheat Code Engine
  const handleCheckCheat = (e: React.FormEvent) => {
    e.preventDefault();
    const code = cheatCode.trim().toUpperCase();
    if (code === 'PIKA' || code === 'PIKACHU') {
      triggerThunderstorm();
      setCheatFeedback('⚡ Pika-pi! Unlimited lightning power granted to your study session!');
    } else if (code === 'ASH') {
      playSoundEffect('shiny');
      setCheatFeedback('🧢 "I wanna be the very best, like no one ever was!" — +100 Pokédex Master points!');
    } else if (code === 'BORED') {
      playSoundEffect('fanfare');
      setCheatFeedback('🎮 Boredom eradicated! You just unlocked the Academic Level Explorer Badge!');
    } else if (code === 'COIN' || code === 'ALCOIN') {
      playSoundEffect('shiny');
      setCheatFeedback('🪙 Secret Mystery Vault unlocked! Spin the Daily Wheel for bonus coins!');
    } else {
      setCheatFeedback('🤔 Mysterious code not recognized. Try typing "PIKA", "ASH", or "BORED"!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-slate-950">
      {/* Main Container Card — Google 404 Aesthetic with AcademicLevel Polish */}
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-12 items-center">
          
          {/* Left Column: 404 Google Style Error Text & Interactive Bush */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-4">
            
            {/* Google Classic 404 Header */}
            <div>
              <p className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight">
                <span className="font-extrabold text-slate-950">404.</span> That’s an error.
              </p>
            </div>

            {/* Main Tagline & Pokémon Prompt Context */}
            <div className="pt-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                Pika's Chu timing! You have landed in the wrong bush.
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                That’s all Ash Ketchum knows.
              </p>
            </div>

            {/* Interactive Rustling Grass Bush SVG */}
            <div className="py-2 flex items-center gap-4">
              <div
                onClick={handleBushClick}
                className="relative cursor-pointer select-none group"
                title="Click the bush to rustle it and shoot sparks!"
              >
                {/* Grass Bush SVG */}
                <div
                  className={`w-28 h-20 transition-transform duration-150 ${
                    bushShake ? 'animate-[bounce_0.2s_ease-in-out_infinite]' : 'group-hover:scale-105'
                  }`}
                  style={{
                    transformOrigin: 'bottom center',
                    transform: bushShake ? 'rotate(5deg) scale(1.05)' : undefined
                  }}
                >
                  <svg viewBox="0 0 160 110" className="w-full h-full drop-shadow-md">
                    {/* Shadow under bush */}
                    <ellipse cx="80" cy="98" rx="60" ry="10" fill="#CBD5E1" opacity="0.6" />
                    
                    {/* Background Bush Leaves */}
                    <path
                      d="M25 90 C15 65 30 40 50 48 C65 25 95 20 110 40 C130 30 145 60 135 90 Z"
                      fill="#15803D"
                    />
                    
                    {/* Midground Lush Leaves */}
                    <path
                      d="M35 92 C25 72 40 50 60 58 C72 38 100 35 115 52 C135 45 145 72 130 92 Z"
                      fill="#16A34A"
                    />

                    {/* Foreground Wild Grass Blades */}
                    <path
                      d="M45 95 Q35 70 30 50 Q45 65 52 95 Z"
                      fill="#22C55E"
                    />
                    <path
                      d="M58 95 Q52 60 55 35 Q68 55 70 95 Z"
                      fill="#4ADE80"
                    />
                    <path
                      d="M75 95 Q78 50 82 25 Q92 52 88 95 Z"
                      fill="#22C55E"
                    />
                    <path
                      d="M92 95 Q102 55 110 32 Q108 62 102 95 Z"
                      fill="#4ADE80"
                    />
                    <path
                      d="M108 95 Q122 65 132 45 Q125 72 118 95 Z"
                      fill="#16A34A"
                    />

                    {/* Cute yellow spark center or peek hint */}
                    <circle cx="80" cy="65" r="4" fill="#FACC15" opacity="0.8" className="animate-pulse" />
                    <circle cx="85" cy="62" r="2" fill="#FEF08A" />
                  </svg>
                </div>

                {/* Flying Yellow Lightning Sparks */}
                {sparks.map(s => (
                  <div
                    key={s.id}
                    className="absolute pointer-events-none transition-all duration-500 ease-out"
                    style={{
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      transform: `rotate(${s.angle}deg) scale(1.4)`,
                      opacity: 0.95
                    }}
                  >
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)] animate-ping" />
                  </div>
                ))}
              </div>

              {/* Bush Tip Callout */}
              <div className="text-xs text-slate-500 flex flex-col justify-center">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  Tall Grass Bush
                </span>
                <span className="text-[11px] text-slate-400">
                  {bushClickCount === 0
                    ? 'Click the bush to rustle it!'
                    : `Rustled ${bushClickCount} ${bushClickCount === 1 ? 'time' : 'times'}! (Keep shaking!)`}
                </span>
              </div>
            </div>

            {/* Course Search Bar */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                Search AcademicLevel Courses & Subjects
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. CBSE Class 10 Science, ICSE Math, IGCSE Biology..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearching && (
                <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-52 overflow-y-auto z-20">
                  {filteredCourses.length > 0 ? (
                    <div className="space-y-1">
                      {filteredCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={onNavigateCourses}
                          className="p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                                {course.name}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                {course.board}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                              {course.topics.slice(0, 3).join(' • ')}
                            </div>
                          </div>
                          <span className="text-xs text-indigo-600 font-bold opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            Start <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No matching courses found. Try searching "Science", "Maths", or "Class 10".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons & Secret "You're bored?" Trigger */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                {isAuthenticated ? 'Student Dashboard' : 'Back to Home'}
              </button>

              <button
                onClick={onNavigateCourses}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                Browse All Curriculum
              </button>

              {/* Secret "You're bored?" Button */}
              <button
                onClick={() => setShowBoredModal(true)}
                className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm group"
                title="Secret Easter Egg Zone!"
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:rotate-12 transition-transform" />
                You're bored?
              </button>
            </div>

          </div>

          {/* Right Column: Uploaded Pikachu Forest Photo */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative group">
              {/* Soft Forest Glow Backing */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-100/80 bg-slate-100 max-w-[280px] sm:max-w-[320px]">
                <img
                  src="/pika-bush.jpg"
                  alt="Pikachu in the forest bush"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to media path if public path fails
                    (e.target as HTMLImageElement).src = '/assets/pika-bush.jpg';
                  }}
                />
                
                {/* Decorative Bottom Tag */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center">
                  <span className="text-[11px] font-semibold text-yellow-300 drop-shadow">
                    ⚡ Wild Pikachu encountered in Sector 404!
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Secret "You're Bored?" Easter Egg Arcade Modal */}
      {showBoredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-white" />
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Secret Boredom Relief Zone</h3>
                  <p className="text-[11px] text-amber-100">AcademicLevel Easter Egg Vault • Pokémon Edition</p>
                </div>
              </div>
              <button
                onClick={() => setShowBoredModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-800">
              
              {/* Feature 1: Pikachu Thunderstorm Button */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-amber-900">Pikachu Thunderstorm Shower</h4>
                  <p className="text-[11px] text-amber-700">Shoot electric confetti and lightning across the screen!</p>
                </div>
                <button
                  onClick={triggerThunderstorm}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" /> Strike!
                </button>
              </div>

              {/* Feature 2: "Catch the Wild Spark" Mini-Game */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-xs text-emerald-900">Mini-Game: Catch the Wild Spark</h4>
                    <p className="text-[11px] text-emerald-700">Click the jumping spark as many times as you can!</p>
                  </div>
                  {!gameActive ? (
                    <button
                      onClick={startSparkGame}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
                    >
                      {gameScore > 0 ? 'Play Again' : 'Start (15s)'}
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      ⏱️ {gameTimeLeft}s | Score: {gameScore}
                    </span>
                  )}
                </div>

                {/* Game Field */}
                <div className="relative w-full h-32 bg-slate-900 rounded-xl overflow-hidden border border-emerald-300/50">
                  {gameActive ? (
                    <button
                      onClick={handleCatchSpark}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 p-2 bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50 transition-all duration-75 cursor-pointer animate-pulse"
                      style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%` }}
                    >
                      <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
                    </button>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      {gameScore > 0 ? (
                        <div className="text-center">
                          <p className="text-emerald-400 font-bold text-sm">🎉 Game Over! Final Score: {gameScore} Sparks!</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Ash Ketchum would be proud of your lightning reflexes!</p>
                        </div>
                      ) : (
                        <p>Click "Start" to catch wild lightning sparks!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Feature 3: Science & Pokémon Riddles */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-indigo-600" />
                    Professor Oak's Brain Teaser
                  </h4>
                  <button
                    onClick={() => {
                      setCurrentRiddleIndex((currentRiddleIndex + 1) % RIDDLES.length);
                      setShowRiddleAnswer(false);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Next Riddle
                  </button>
                </div>
                <p className="text-xs text-indigo-950 font-medium">
                  "{RIDDLES[currentRiddleIndex].q}"
                </p>
                <div className="mt-3">
                  {!showRiddleAnswer ? (
                    <button
                      onClick={() => setShowRiddleAnswer(true)}
                      className="text-xs text-indigo-600 underline font-semibold hover:text-indigo-800"
                    >
                      Reveal Answer 💡
                    </button>
                  ) : (
                    <p className="text-xs font-bold text-indigo-800 bg-white/80 p-2.5 rounded-lg border border-indigo-200">
                      ✨ Answer: {RIDDLES[currentRiddleIndex].a}
                    </p>
                  )}
                </div>
              </div>

              {/* Feature 4: Secret Cheat Code Input */}
              <form onSubmit={handleCheckCheat} className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Secret Trainer Code Box
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cheatCode}
                    onChange={e => setCheatCode(e.target.value)}
                    placeholder="Hint: Type 'PIKA', 'ASH', or 'BORED'"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Enter Code
                  </button>
                </div>
                {cheatFeedback && (
                  <p className="text-xs font-medium text-amber-800 mt-2 bg-amber-100/60 p-2 rounded-lg">
                    {cheatFeedback}
                  </p>
                )}
              </form>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                ⚡ Ready to study? Return to your curriculum anytime!
              </span>
              <button
                onClick={() => setShowBoredModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Close Arcade
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
