import React, { useState, useEffect } from 'react';
import { Learner } from '../../core/types';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Star,
  Award,
  CheckCircle2,
  Lock,
  BookOpen,
  RefreshCw,
  Trophy,
  Smile,
  Rocket,
  Check,
  ChevronRight
} from 'lucide-react';

export interface StickerDefinition {
  id: string;
  name: string;
  emoji: string;
  category: 'MASCOT' | 'ANIMAL' | 'COSMIC' | 'ACHIEVER';
  description: string;
  howToUnlock: string;
  unlockCondition: (learner: Learner) => boolean;
  bgGradient: string;
  borderColor: string;
}

export const ALL_STICKERS: StickerDefinition[] = [
  {
    id: 'leo_lion',
    name: 'Leo the Lion Cub',
    emoji: '🦁',
    category: 'MASCOT',
    description: 'The cheerful king of curiosity! Never afraid to try a new puzzle.',
    howToUnlock: 'Awarded to every little explorer on AcademicLevel!',
    unlockCondition: () => true,
    bgGradient: 'from-amber-400/20 to-orange-500/20',
    borderColor: 'border-amber-400/60'
  },
  {
    id: 'twinkle_star',
    name: 'Twinkle Star',
    emoji: '⭐',
    category: 'COSMIC',
    description: 'Shines bright when your mind is curious and ready to learn.',
    howToUnlock: 'Complete your first quiz with a bright smile!',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 1 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-yellow-400/20 to-amber-500/20',
    borderColor: 'border-yellow-400/60'
  },
  {
    id: 'sammy_fox',
    name: 'Sammy Scout Fox',
    emoji: '🦊',
    category: 'ANIMAL',
    description: 'Quick-thinking nature scout who loves reading words and tracks.',
    howToUnlock: 'Explore questions in any reading or science lesson.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 1 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-orange-400/20 to-rose-500/20',
    borderColor: 'border-orange-400/60'
  },
  {
    id: 'bambu_panda',
    name: 'Bambu Panda',
    emoji: '🐼',
    category: 'ANIMAL',
    description: 'Calm, patient, and peaceful. Takes deep breaths during tricky sums.',
    howToUnlock: 'Complete at least 2 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 2 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-emerald-400/20 to-teal-500/20',
    borderColor: 'border-emerald-400/60'
  },
  {
    id: 'koko_koala',
    name: 'Koko Koala',
    emoji: '🐨',
    category: 'ANIMAL',
    description: 'Hugs his study books tight and builds steady daily study habits.',
    howToUnlock: 'Build a 2-day study streak or earn 20 coins.',
    unlockCondition: (l) => (l.currentStreakDays || 0) >= 2 || (l.coinBalance || 0) >= 20 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-slate-400/20 to-indigo-500/20',
    borderColor: 'border-indigo-400/60'
  },
  {
    id: 'sparky_tiger',
    name: 'Sparky Tiger',
    emoji: '🐯',
    category: 'ANIMAL',
    description: 'Roars with excitement whenever a big math problem is conquered!',
    howToUnlock: 'Complete at least 3 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 3 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-amber-500/20 to-red-500/20',
    borderColor: 'border-amber-500/60'
  },
  {
    id: 'hopper_bunny',
    name: 'Hopper Bunny',
    emoji: '🐰',
    category: 'ANIMAL',
    description: 'Hops effortlessly from Level 1 up to Level 2 without skipping a beat!',
    howToUnlock: 'Advance beyond Foundation level.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 4 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-pink-400/20 to-rose-400/20',
    borderColor: 'border-pink-400/60'
  },
  {
    id: 'magic_unicorn',
    name: 'Magic Unicorn',
    emoji: '🦄',
    category: 'COSMIC',
    description: 'Leaves a sparkling rainbow trail of correct answers in its wake.',
    howToUnlock: 'Accumulate 30 or more Study Coins.',
    unlockCondition: (l) => (l.coinBalance || 0) >= 30 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-violet-400/20 to-pink-500/20',
    borderColor: 'border-violet-400/60'
  },
  {
    id: 'echo_dolphin',
    name: 'Echo Dolphin',
    emoji: '🐬',
    category: 'ANIMAL',
    description: 'Dives deep into science oceans and leaps high into the sky.',
    howToUnlock: 'Complete at least 5 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 5 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-cyan-400/20 to-blue-500/20',
    borderColor: 'border-cyan-400/60'
  },
  {
    id: 'oliver_owl',
    name: 'Oliver Wise Owl',
    emoji: '🦉',
    category: 'ANIMAL',
    description: 'Wears smart spectacles and remembers every single vocabulary word.',
    howToUnlock: 'Solve 6 quizzes with great focus.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 6 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-amber-600/20 to-yellow-600/20',
    borderColor: 'border-amber-600/60'
  },
  {
    id: 'momo_monkey',
    name: 'Momo Monkey',
    emoji: '🐵',
    category: 'ANIMAL',
    description: 'Swings through geometry branches and counts bananas with laughter.',
    howToUnlock: 'Complete 7 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 7 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-amber-500/20 to-emerald-500/20',
    borderColor: 'border-amber-500/60'
  },
  {
    id: 'ella_elephant',
    name: 'Ella Elephant',
    emoji: '🐘',
    category: 'ANIMAL',
    description: 'Has a mighty memory that never forgets times tables or facts.',
    howToUnlock: 'Build a coin balance of 50+ Study Coins.',
    unlockCondition: (l) => (l.coinBalance || 0) >= 50 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-blue-400/20 to-indigo-500/20',
    borderColor: 'border-blue-400/60'
  },
  {
    id: 'gigi_giraffe',
    name: 'Gigi Giraffe',
    emoji: '🦒',
    category: 'ANIMAL',
    description: 'Stretches tall to reach the highest stars and dreams big.',
    howToUnlock: 'Complete 8 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 8 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/60'
  },
  {
    id: 'pippin_penguin',
    name: 'Pippin Penguin',
    emoji: '🐧',
    category: 'ANIMAL',
    description: 'Slides smoothly across icy challenges without slipping once.',
    howToUnlock: 'Complete 9 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 9 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-sky-400/20 to-slate-500/20',
    borderColor: 'border-sky-400/60'
  },
  {
    id: 'rexy_dino',
    name: 'Rexy Dino',
    emoji: '🦖',
    category: 'ANIMAL',
    description: 'Prehistoric powerhouse who crushes big concept quizzes with huge smiles!',
    howToUnlock: 'Complete 10 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 10 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-emerald-500/20 to-lime-500/20',
    borderColor: 'border-emerald-500/60'
  },
  {
    id: 'speedy_turtle',
    name: 'Speedy Turtle',
    emoji: '🐢',
    category: 'ANIMAL',
    description: 'Proves slow and steady wins the race with 100% quiz accuracy.',
    howToUnlock: 'Earn 100+ Study Coins.',
    unlockCondition: (l) => (l.coinBalance || 0) >= 100 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-teal-400/20 to-emerald-500/20',
    borderColor: 'border-teal-400/60'
  },
  {
    id: 'buzzy_bee',
    name: 'Buzzy Worker Bee',
    emoji: '🐝',
    category: 'ANIMAL',
    description: 'Pollinates knowledge across math, reading, and nature puzzles.',
    howToUnlock: 'Complete 12 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 12 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-yellow-400/20 to-amber-500/20',
    borderColor: 'border-yellow-400/60'
  },
  {
    id: 'chroma_flutter',
    name: 'Chroma Butterfly',
    emoji: '🦋',
    category: 'COSMIC',
    description: 'Metamorphosis master! Transforms from curious beginner to quiz star.',
    howToUnlock: 'Complete 15 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 15 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-indigo-400/20 to-purple-500/20',
    borderColor: 'border-indigo-400/60'
  },
  {
    id: 'royal_peacock',
    name: 'Royal Peacock',
    emoji: '🦚',
    category: 'ACHIEVER',
    description: 'Fans out a glorious plumage of perfect scores and golden honors.',
    howToUnlock: 'Complete 18 quizzes.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 18 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-teal-500/20 to-blue-600/20',
    borderColor: 'border-teal-500/60'
  },
  {
    id: 'galaxy_crown',
    name: 'Galaxy Star Crown',
    emoji: '👑',
    category: 'ACHIEVER',
    description: 'The supreme crown of Grade 1 discovery! Master of all Leo puzzles.',
    howToUnlock: 'Complete 20 quizzes or master all Class 1 levels.',
    unlockCondition: (l) => (l.quizzesCompletedCount || 0) >= 20 || l.role === 'SUPER_ADMIN',
    bgGradient: 'from-amber-400/30 to-yellow-300/30',
    borderColor: 'border-yellow-400'
  }
];

interface LeoStickerBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner;
  onStartQuiz: () => void;
}

export const LeoStickerBookModal: React.FC<LeoStickerBookModalProps> = ({
  isOpen,
  onClose,
  learner,
  onStartQuiz
}) => {
  const [activeTab, setActiveTab] = useState<'ALBUM' | 'ALL_STICKERS'>('ALBUM');
  const [placedStickers, setPlacedStickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`al_placed_stickers_${learner.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default starter placed stickers
    return ['leo_lion', 'twinkle_star', 'sammy_fox'];
  });
  const [selectedSticker, setSelectedSticker] = useState<StickerDefinition | null>(null);
  const [previewUnlockAll, setPreviewUnlockAll] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(`al_placed_stickers_${learner.id}`, JSON.stringify(placedStickers));
    } catch {}
  }, [placedStickers, learner.id]);

  if (!isOpen) return null;

  const isStickerUnlocked = (s: StickerDefinition) => {
    if (previewUnlockAll || learner.role === 'SUPER_ADMIN') return true;
    return s.unlockCondition(learner);
  };

  const unlockedStickers = ALL_STICKERS.filter(isStickerUnlocked);
  const unlockedCount = unlockedStickers.length;
  const progressPercent = Math.round((unlockedCount / ALL_STICKERS.length) * 100);

  const handleTogglePlaceSticker = (stickerId: string) => {
    if (placedStickers.includes(stickerId)) {
      setPlacedStickers(prev => prev.filter(id => id !== stickerId));
    } else {
      setPlacedStickers(prev => [...prev, stickerId]);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  const handleClearAlbum = () => {
    if (window.confirm('Clear all stickers from your notebook page? You can stick them back anytime!')) {
      setPlacedStickers([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl shadow-amber-500/10 overflow-hidden text-slate-100 my-auto">
        {/* Playful Header */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 p-4 sm:p-6 text-slate-950 flex items-center justify-between shadow-md relative overflow-hidden flex-shrink-0">
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 shadow-md border-2 border-amber-600 flex items-center justify-center text-3xl sm:text-4xl animate-bounce">
              🦁
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300">
                  Class 1 Special
                </span>
                <span className="text-xs font-bold text-slate-900">Wonder Explorers</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black leading-tight mt-0.5">
                Leo&apos;s Star Sticker Book ⭐
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-900 font-semibold max-w-md">
                Solve puzzles, uncover cheerful animal buddies, and paste shiny stickers into your album!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 relative z-10">
            {learner.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setPreviewUnlockAll(prev => !prev)}
                className={`hidden sm:flex px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  previewUnlockAll
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-400'
                    : 'bg-black/30 text-white hover:bg-black/40'
                }`}
                title="Toggle unlocking all stickers for preview"
              >
                {previewUnlockAll ? '✓ All Unlocked' : 'Preview All'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-black/20 hover:bg-black/40 text-slate-950 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Navigation Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-black text-white">
                {unlockedCount} / {ALL_STICKERS.length} Stickers
              </span>
            </div>
            <div className="w-32 sm:w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{progressPercent}%</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex space-x-1">
              <button
                onClick={() => setActiveTab('ALBUM')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'ALBUM'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>My Sticker Album ({placedStickers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('ALL_STICKERS')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'ALL_STICKERS'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>All 20 Stickers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'ALBUM' ? (
            /* TAB 1: INTERACTIVE STICKER ALBUM NOTEBOOK */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <span>📖 Leo&apos;s Collector Notebook</span>
                    <span className="text-xs text-amber-400 font-normal">
                      (Tap stickers from your collection below to stick them on this page!)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your personal learning scrapbook. Arranged stickers are saved automatically!
                  </p>
                </div>

                {placedStickers.length > 0 && (
                  <button
                    onClick={handleClearAlbum}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 self-start sm:self-auto flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear Page</span>
                  </button>
                )}
              </div>

              {/* The Illustrated Notebook Canvas */}
              <div className="min-h-[220px] bg-gradient-to-b from-amber-50/10 via-slate-950 to-amber-950/20 border-2 border-dashed border-amber-400/40 rounded-3xl p-6 shadow-inner relative flex flex-wrap gap-4 items-center justify-center">
                {placedStickers.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <span className="text-5xl block animate-pulse">✨</span>
                    <p className="text-sm font-bold text-slate-300">Your sticker notebook is empty!</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Tap any unlocked sticker in your collection tray below to paste it proudly onto this page.
                    </p>
                  </div>
                ) : (
                  placedStickers.map(id => {
                    const sticker = ALL_STICKERS.find(s => s.id === id);
                    if (!sticker) return null;
                    return (
                      <div
                        key={id}
                        onClick={() => handleTogglePlaceSticker(id)}
                        className={`bg-slate-900 border-2 ${sticker.borderColor} p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-lg hover:scale-110 transition-transform cursor-pointer group relative`}
                        title="Click to remove from notebook"
                      >
                        <span className="text-4xl drop-shadow-md group-hover:rotate-12 transition-transform">
                          {sticker.emoji}
                        </span>
                        <span className="text-[10px] font-black text-amber-300 max-w-[80px] text-center truncate">
                          {sticker.name}
                        </span>
                        <span className="text-[8px] bg-slate-950 px-1.5 py-0.2 rounded-full text-slate-400 border border-slate-800">
                          Pasted ✓
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Collection Tray Below Canvas */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Unlocked Sticker Tray ({unlockedCount})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Tap to paste or un-paste on notebook
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {unlockedStickers.map(sticker => {
                    const isPlaced = placedStickers.includes(sticker.id);
                    return (
                      <button
                        key={sticker.id}
                        onClick={() => handleTogglePlaceSticker(sticker.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
                          isPlaced
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{sticker.emoji}</span>
                        <div className="text-left">
                          <p className="text-[11px] font-bold leading-tight">{sticker.name}</p>
                          <span className="text-[9px] text-slate-400 block font-normal">
                            {isPlaced ? 'Pasted on Page' : '+ Paste'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: ALL 20 STICKERS CATALOGUE */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <span>🌟 All 20 Academic Stickers</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Solve quizzes and study daily to unlock every single cartoon buddy.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ALL_STICKERS.map(sticker => {
                  const unlocked = isStickerUnlocked(sticker);
                  const isPlaced = placedStickers.includes(sticker.id);

                  return (
                    <div
                      key={sticker.id}
                      onClick={() => setSelectedSticker(sticker)}
                      className={`border rounded-2xl p-4 text-center flex flex-col items-center justify-between space-y-2 cursor-pointer transition-all relative group ${
                        unlocked
                          ? `bg-slate-950 ${sticker.borderColor} hover:scale-105 shadow-md shadow-amber-500/5`
                          : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80'
                      }`}
                    >
                      {/* Sticker Visual */}
                      <div className="relative">
                        <span className={`text-4xl sm:text-5xl block transition-transform group-hover:scale-110 ${!unlocked ? 'filter grayscale blur-[1px]' : ''}`}>
                          {sticker.emoji}
                        </span>
                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                            <Lock className="w-5 h-5 drop-shadow-md text-amber-400" />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-black text-white">{sticker.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                          {unlocked ? sticker.description : sticker.howToUnlock}
                        </p>
                      </div>

                      {unlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePlaceSticker(sticker.id);
                          }}
                          className={`w-full py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            isPlaced
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          {isPlaced ? 'Pasted ✓' : '+ Paste'}
                        </button>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Locked 🔒
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Sticker Detail Card Popover */}
          {selectedSticker && (
            <div className="bg-slate-950 border-2 border-amber-400/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xl">
              <div className="flex items-center space-x-3.5">
                <span className="text-4xl">{selectedSticker.emoji}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-amber-300">{selectedSticker.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      {selectedSticker.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{selectedSticker.description}</p>
                  <p className="text-[11px] text-amber-400/90 font-medium mt-1">
                    🎯 How to Unlock: {selectedSticker.howToUnlock}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {isStickerUnlocked(selectedSticker) && (
                  <button
                    onClick={() => handleTogglePlaceSticker(selectedSticker.id)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    {placedStickers.includes(selectedSticker.id) ? 'Remove from Page' : 'Stick in Album ⭐'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedSticker(null)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Complete quizzes with &gt;= 70% accuracy to earn shiny new animal stickers!</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onStartQuiz();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <Rocket className="w-4 h-4" />
            <span>Solve a Quiz with Leo (+Unlock Sticker)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
