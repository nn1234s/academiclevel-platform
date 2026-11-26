import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Bot,
  Database,
  Coins,
  Swords,
  ShieldCheck,
  Award,
  UserCheck,
  Palette,
  ArrowLeft,
  Calendar,
  Tag
} from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

type BlogCategory = 'ALL' | 'INNOVATIONS' | 'UPDATES';

interface BlogPost {
  id: string;
  date: string;
  category: 'INNOVATIONS' | 'UPDATES';
  tag: string;
  title: string;
  summary: string;
  highlights: string[];
  icon: React.ReactNode;
  accentBg: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'nova-psst-voice',
    date: 'Nov 26, 2026',
    category: 'UPDATES',
    tag: 'Nova AI',
    title: 'Nova AI Study Buddy: Playful *Psst...* Secrets & Zero Upsells',
    summary:
      'Brought back Nova’s warm, encouraging friend voice and signature *Psst...* memory hacks while keeping strict K–12 child-safe boundaries and zero paid-plan upsells in chat.',
    highlights: [
      'Instant *Psst...* study tricks for formulas, definitions, and quick revision',
      'Neutral, clean chat UI with warm conversational replies',
      'Works both with live Gemini AI and zero-cost offline fallback'
    ],
    icon: <Bot className="w-5 h-5 text-indigo-600" />,
    accentBg: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'pfp-emoji-local',
    date: 'Nov 26, 2026',
    category: 'UPDATES',
    tag: 'Student Profile',
    title: 'Custom Local Profile Pictures & Cross-Device Preset Emoji PFPs',
    summary:
      'Students can now personalize their profile avatar with 16 Preset Emoji PFPs that sync across every device, or upload any custom photo saved locally in browser LocalStorage.',
    highlights: [
      '16 Preset Emoji PFPs synced via learner profile at zero extra server cost',
      'Client-side 160×160 photo upload stored strictly in LocalStorage',
      'Clear pre-save reminder so kids know custom photos stay on that device only'
    ],
    icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
    accentBg: 'bg-emerald-50 border-emerald-200'
  },
  {
    id: 'duel-bots-arena',
    date: 'Nov 26, 2026',
    category: 'UPDATES',
    tag: 'Quiz Arena',
    title: '1v1 Quiz Duel Arena: Instant Kid-Modeled Practice Bots',
    summary:
      'Removed broken cross-device WhatsApp room codes in favor of fast, zero-lag 1v1 syllabus blitzes against realistic kid-modeled practice bots.',
    highlights: [
      'Instant matchmaking with 7 kid-modeled bot opponents',
      '5-question rapid blitz with Study Coin wager tiers',
      'Zero server room-code overhead or expired invite errors'
    ],
    icon: <Swords className="w-5 h-5 text-amber-600" />,
    accentBg: 'bg-amber-50 border-amber-200'
  },
  {
    id: 'study-quests-coin-sync',
    date: 'Nov 26, 2026',
    category: 'UPDATES',
    tag: 'Study Coins',
    title: 'Today’s Study Quests: Server-Synced Rewards & 4-Quest Daily Cap',
    summary:
      'Fixed Today’s Study Quests so completing quizzes, Nova chats, or duels reliably credits Study Coins to the server ledger and supports up to 4 rewarded quests per day.',
    highlights: [
      'Awaited server coin persistence so balances never revert on refresh',
      'Daily quest cap raised to 4 quests for active learners',
      'CI upgraded to Node 24 for faster, greener verification builds'
    ],
    icon: <Coins className="w-5 h-5 text-yellow-600" />,
    accentBg: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'rounded-ui-cbse-popup',
    date: 'Nov 26, 2026',
    category: 'UPDATES',
    tag: 'UI & Curriculum',
    title: 'Child-Friendly Rounded UI, 100% CBSE Focus & Popup Checkout',
    summary:
      'Softened the interface with kid-friendly rounded geometry, unified every page around CBSE Classes 1–12, and streamlined Special ₹49 into a responsive popup checkout.',
    highlights: [
      'Friendly rounded cards and buttons designed for young learners',
      'Consistent CBSE-only curriculum across homepage, ads, and CMS',
      'One-tap Pay Now button opening a responsive payment popup'
    ],
    icon: <Palette className="w-5 h-5 text-pink-600" />,
    accentBg: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'offline-question-bank',
    date: 'Core Innovation',
    category: 'INNOVATIONS',
    tag: 'Question Bank',
    title: '3,600+ CBSE Question Bank with Offline-First SQLite Engine',
    summary:
      'Every CBSE Class 1–12 subject is backed by a structured MCQ bank with step-by-step explanations, hints, and instant SQLite + offline fallback retrieval.',
    highlights: [
      'Class-wise and chapter-wise progression across Foundation, Mastery, and Exam levels',
      'Built-in question bank integrity validator in CI',
      'Instant practice even on slow or intermittent mobile connections'
    ],
    icon: <Database className="w-5 h-5 text-blue-600" />,
    accentBg: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'mistake-vault-gamification',
    date: 'Core Innovation',
    category: 'INNOVATIONS',
    tag: 'Gamification',
    title: 'Mistake Vault, Daily Spin Wheel, Scholar Leagues & Gift Store',
    summary:
      'Turns mistakes into strengths: wrong answers automatically enter the Mistake Vault for targeted revision while Study Coins unlock real-world Scholar’s Gift Store rewards.',
    highlights: [
      'Automatic Mistake Vault error notebook for smart exam revision',
      'Daily Spin Wheel, QOTD, Weekly Challenges, and Scholar Leagues',
      'Study Coin economy backed by server-verified ledger transactions'
    ],
    icon: <Award className="w-5 h-5 text-purple-600" />,
    accentBg: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'verifiable-certs-performance',
    date: 'Core Innovation',
    category: 'INNOVATIONS',
    tag: 'Trust & Speed',
    title: 'Verifiable Certificates, A-Codes & Lightweight Compressed Delivery',
    summary:
      'Cryptographically verifiable completion certificates, shareable A-Code friend passes, gzip-compressed API responses, and 1-year immutable static asset caching.',
    highlights: [
      'Public certificate verification at /verify',
      'Server-side gzip compression & immutable /assets caching for low bandwidth',
      'Zero third-party ads and strict child-safety defaults'
    ],
    icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    accentBg: 'bg-teal-50 border-teal-200'
  }
];

export const BlogPage: React.FC<BlogPageProps> = ({ onBack, onNavigate }) => {
  const [filter, setFilter] = useState<BlogCategory>('ALL');

  const visiblePosts =
    filter === 'ALL' ? BLOG_POSTS : BLOG_POSTS.filter((post) => post.category === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs w-fit">
          {(
            [
              { id: 'ALL', label: 'All Posts' },
              { id: 'UPDATES', label: 'Latest Changes' },
              { id: 'INNOVATIONS', label: 'Core Innovations' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 border border-indigo-800/40 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AcademicLevel Product Blog &amp; Changelog</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          What’s New &amp; Innovative at AcademicLevel
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Every major upgrade, new student feature, and core innovation — from our Nova AI Study Buddy and
          3,600+ CBSE Question Bank to Study Coins, Quiz Duels, and verifiable certificates.
        </p>
        {onNavigate && (
          <div className="pt-1 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('NOVA_AI')}
              className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-extrabold text-xs hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              Try Nova AI →
            </button>
            <button
              type="button"
              onClick={() => onNavigate('PUBLIC_COURSES')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Explore CBSE Question Bank
            </button>
          </div>
        )}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visiblePosts.map((post) => (
          <article
            key={post.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${post.accentBg}`}>
                  {post.icon}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    <span>{post.tag}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[11px] text-slate-400 font-semibold">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {post.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{post.summary}</p>
            </div>

            <ul className="pt-3 border-t border-slate-100 space-y-1.5">
              {post.highlights.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
};
