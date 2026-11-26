import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  Calendar,
  Tag,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
  initialPostSlug?: string;
}

type BlogCategory = 'ALL' | 'INNOVATIONS' | 'UPDATES';

interface BlogSection {
  heading: string;
  body: string;
}

interface BlogPost {
  id: string;
  date: string;
  readTime: string;
  category: 'INNOVATIONS' | 'UPDATES';
  tag: string;
  title: string;
  summary: string;
  highlights: string[];
  sections: BlogSection[];
  ctaLabel?: string;
  ctaRoute?: string;
  icon: React.ReactNode;
  accentBg: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'master-qb-curated-mcqs',
    date: 'Nov 26, 2026',
    readTime: '5 min read',
    category: 'UPDATES',
    tag: 'Question Bank',
    title: 'Master Question Bank Upgrade: 3,600 Curated 4-Option MCQs (Classes 1–12)',
    summary:
      'Imported the new Master Question Bank & Curriculum Blueprint across Classes 1–12 with curated 4-option MCQs, verified answer keys, topic tags, and step-by-step explanations.',
    highlights: [
      '300 curated questions per class across CBSE Classes 1–12 (3,600 total)',
      '100% verified 4 distinct options, exact answer keys, and explanations',
      'Synced into both curatedQuestionBank.json and SQLite question_bank',
      'Validated automatically in CI with zero duplicate options or missing keys'
    ],
    sections: [
      {
        heading: 'Why We Upgraded to Curated 4-Option MCQs',
        body: 'Earlier question bank imports relied on automated distractor generation for some items when only the answer text was available. While that worked as a baseline, great multiple-choice practice depends on realistic, pedagogically sound distractors that reflect actual student misconceptions — like off-by-one arithmetic errors, sign flips, or closely related scientific terms. With the new Master Question Bank & Curriculum Blueprint, every single question from Class 1 to Class 12 now ships with four hand-curated, distinct options (A, B, C, and D), an exact verified answer key, and a clear explanation.'
      },
      {
        heading: 'Class-Wise & Subject-Wise Coverage Across CBSE',
        body: 'Every grade receives balanced, age-appropriate depth. Classes 1 through 10 include 75 questions per subject across Mathematics, Science / EVS, Social Science / General Knowledge, and English — totaling 300 questions per class. For senior secondary students in Classes 11 and 12, the bank expands to stream-specific subjects: Mathematics, Physics, Chemistry, Biology, English, and Integrated Humanities (50 questions per subject, 300 per class). Altogether, 3,600 curated MCQs are immediately available across Foundation, Concept, Exam Ready, and Olympiad levels.'
      },
      {
        heading: 'How Explanations Turn Practice Into Mastery',
        body: 'Getting a question right is only half of learning; understanding why the other options are wrong is what builds exam confidence. Each record in the upgraded bank includes a teaching explanation that walks through the calculation, grammar rule, historical context, or scientific principle rather than simply repeating the answer letter. When a student misses an item, that exact explanation feeds straight into their Mistake Vault for targeted revision.'
      },
      {
        heading: 'Zero-Trust Automated Verification Pipeline',
        body: 'Before any question enters production, our import and validation pipeline checks every record programmatically: exactly 4 non-empty options, zero case-insensitive duplicate options, a valid answer index (0–3) matching the keyed answer text, and a non-empty explanation. Both the bundled offline JSON bank and the indexed SQLite question_bank table are updated in sync, keeping quiz loading under a millisecond.'
      }
    ],
    ctaLabel: 'Explore CBSE Courses',
    ctaRoute: 'PUBLIC_COURSES',
    icon: <Database className="w-5 h-5 text-indigo-600" />,
    accentBg: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'nova-psst-voice',
    date: 'Nov 26, 2026',
    readTime: '4 min read',
    category: 'UPDATES',
    tag: 'Nova AI',
    title: 'Nova AI Study Buddy: Playful *Psst...* Secrets & Zero Upsells',
    summary:
      'Brought back Nova’s warm, encouraging friend voice and signature *Psst...* memory hacks while keeping strict K–12 child-safe boundaries and zero paid-plan upsells in chat.',
    highlights: [
      'Instant *Psst...* study tricks for formulas, definitions, and quick revision',
      'Neutral, clean chat UI with warm conversational replies',
      'Works both with live Gemini AI and zero-cost offline fallback',
      'Zero paid-plan upsells and strict K–12 child-safe guardrails'
    ],
    sections: [
      {
        heading: 'Why Tone Matters for K–12 Learners',
        body: 'Students open an AI tutor when they are stuck, tired before a test, or hesitant to ask a question in class. When a tutor responds like a stiff corporate manual, kids close the tab after one message. By giving Nova a warm, upbeat, friend-like voice — complete with playful *Psst...* secret study tricks and relatable analogies — students actually look forward to asking follow-up questions and revising tricky chapters.'
      },
      {
        heading: 'What *Psst...* Study Secrets Actually Do',
        body: 'Whenever a student asks about a concept, formula, or quick revision tip, Nova pairs the core academic explanation with a short *Psst...* memory hack: for example, using active-recall 30-second summaries, visual analogies for physics and chemistry, or quick sign-check habits in algebra. Those bite-sized hooks make formulas much easier to recall during timed exams.'
      },
      {
        heading: 'Strict Child-Safe Boundaries & Zero Chat Upsells',
        body: 'Because AcademicLevel serves students from Class 1 to Class 12, fun never comes at the expense of safety. Nova keeps every conversation strictly platonic and age-appropriate, steers personal off-topic prompts cheerfully back to study goals, and never pushes paid subscription upsells inside the tutor chat. Learning help stays focused 100% on the student.'
      },
      {
        heading: 'Resilient Live + Offline Architecture',
        body: 'When connected to Gemini, Nova uses your board, class, and active subject context to craft tailored explanations. When offline or on a restricted connection, our deterministic Study Buddy engine responds instantly at zero server cost while preserving the exact same warm tone and syllabus accuracy.'
      }
    ],
    ctaLabel: 'Open Nova AI Tutor',
    ctaRoute: 'NOVA_AI',
    icon: <Bot className="w-5 h-5 text-indigo-600" />,
    accentBg: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'pfp-emoji-local',
    date: 'Nov 26, 2026',
    readTime: '4 min read',
    category: 'UPDATES',
    tag: 'Student Profile',
    title: 'Custom Local Profile Pictures & Cross-Device Preset Emoji PFPs',
    summary:
      'Students can now personalize their profile avatar with 16 Preset Emoji PFPs that sync across every device, or upload any custom photo saved locally in browser LocalStorage.',
    highlights: [
      '16 Preset Emoji PFPs synced via learner profile at zero extra server cost',
      'Client-side 160×160 photo upload stored strictly in LocalStorage',
      'Clear pre-save reminder so kids know custom photos stay on that device only',
      'Instant live update in both the Profile page and the top navigation bar'
    ],
    sections: [
      {
        heading: 'Personalization Without Server Bandwidth Bloat',
        body: 'Kids love customizing their profile, but storing and serving thousands of user-uploaded images from a backend server quickly consumes storage and outbound bandwidth caps. We designed a hybrid two-tier avatar system that gives students full self-expression while keeping server image bandwidth at zero.'
      },
      {
        heading: 'Preset Emoji PFPs That Travel Everywhere',
        body: 'In Student Profile, learners can choose from 16 expressive Preset Emoji PFPs — from Lion, Tiger, Fox, Panda, and Unicorn to Rocket, Crown, Scholar, and Robo. Because the selection is stored as a tiny string on the learner profile record, switching devices or browsers brings their chosen avatar along automatically.'
      },
      {
        heading: 'Custom Photo Upload with Clear LocalStorage Notice',
        body: 'Want to use a favorite photo or drawing from your own device? Students can upload any image file, which is resized client-side in an HTML5 canvas to a crisp 160×160 JPEG and stored solely in browser LocalStorage. Before saving, AcademicLevel shows an explicit confirmation box reminding the student that custom uploaded photos stay on this device only and will not sync across other phones or laptops — keeping expectations 100% clear.'
      }
    ],
    ctaLabel: 'Open Student Profile',
    ctaRoute: 'PROFILE',
    icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
    accentBg: 'bg-emerald-50 border-emerald-200'
  },
  {
    id: 'duel-arena-blitz',
    date: 'Nov 26, 2026',
    readTime: '4 min read',
    category: 'UPDATES',
    tag: 'Quiz Arena',
    title: '1v1 Quiz Duel Arena: Instant Zero-Lag Matchmaking',
    summary:
      'Streamlined the 1v1 Quiz Duel Arena for instant, zero-lag 5-question syllabus blitzes without broken invite codes or waiting rooms.',
    highlights: [
      'Instant matchmaking with 7 smart scholar challengers',
      '5-question rapid blitz with Study Coin wager tiers',
      'Zero expired room-code errors or waiting delays',
      'Automatic Study Quest credit & duel history tracking'
    ],
    sections: [
      {
        heading: 'Fixing the Cross-Device Room Code Frustration',
        body: 'Previously, creating a local room code and sharing it over WhatsApp meant friends on separate devices saw an "invalid room code" error because room state lived locally rather than on an expensive real-time WebSocket cluster. Rather than leaving a broken flow or burning server budget on idle sockets, we removed the broken room-code and WhatsApp invite flow completely.'
      },
      {
        heading: 'Fast 5-Question Syllabus Blitzes',
        body: 'Now, jumping into a duel takes two taps: pick your subject and Study Coin wager tier (Friendly Spar at 0 coins, Rookie Clash at 5, Pro Showdown at 15, or Grandmaster Duel at 30), and match within 2 seconds against one of 7 online scholar challengers.'
      },
      {
        heading: 'Speed, Accuracy & Coin Pot Rewards',
        body: 'Each duel pulls 5 curriculum-matched questions from your active CBSE class and subject with a 15-second timer per question. Winning doubles your coin pot and counts directly toward Today’s Study Quests, turning quick 90-second breaks into high-focus revision.'
      }
    ],
    ctaLabel: 'Enter Quiz Duel Arena',
    ctaRoute: 'DUEL_ARENA',
    icon: <Swords className="w-5 h-5 text-amber-600" />,
    accentBg: 'bg-amber-50 border-amber-200'
  },
  {
    id: 'study-quests-coin-sync',
    date: 'Nov 26, 2026',
    readTime: '4 min read',
    category: 'UPDATES',
    tag: 'Study Coins',
    title: 'Today’s Study Quests: Server-Synced Rewards & 4-Quest Daily Cap',
    summary:
      'Fixed Today’s Study Quests so completing quizzes, Nova chats, or duels reliably credits Study Coins to the server ledger and supports up to 4 rewarded quests per day.',
    highlights: [
      'Awaited server coin persistence so balances never revert on refresh',
      'Daily quest cap raised from 3 to 4 quests for active learners',
      'Clean error surfacing if a ledger sync fails',
      'CI upgraded to Node 24 for faster, greener verification builds'
    ],
    sections: [
      {
        heading: 'Why Quest Coins Sometimes Failed to Stick',
        body: 'Two subtle issues caused Today’s Study Quests to miss coin payouts: first, the client fired coin transactions without awaiting server persistence, so a fast refresh could overwrite the local balance; second, the server’s daily quest reward cap was set to 3 quests even though the dashboard offered 4 daily quests.'
      },
      {
        heading: 'End-to-End Ledger Sync & 4-Quest Cap',
        body: 'We updated CoinLedgerService to await the backend transaction response before updating UI state and raised the daily quest reward cap to 4 on the server. Now, every completed quest — whether it is a quiz, Nova AI session, or Quiz Duel — reliably credits Study Coins to your persistent balance.'
      },
      {
        heading: 'Upgraded CI on Node.js 24',
        body: 'Alongside the quest fix, we upgraded our GitHub Actions verification workflow to Node.js 24 so TypeScript, production bundle, and SQLite bank checks run cleanly without deprecation warnings.'
      }
    ],
    icon: <Coins className="w-5 h-5 text-yellow-600" />,
    accentBg: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'rounded-ui-cbse-popup',
    date: 'Nov 26, 2026',
    readTime: '4 min read',
    category: 'UPDATES',
    tag: 'UI & Curriculum',
    title: 'Child-Friendly Rounded UI, 100% CBSE Focus & Popup Checkout',
    summary:
      'Softened the interface with kid-friendly rounded geometry, unified every page around CBSE Classes 1–12, and streamlined Special ₹49 into a responsive popup checkout.',
    highlights: [
      'Friendly rounded cards and buttons designed for young learners',
      'Consistent CBSE-only curriculum across homepage, ads, and CMS',
      'One-tap Pay Now button opening a responsive payment popup',
      'Cleaner board selector without duplicate or broken options'
    ],
    sections: [
      {
        heading: 'Soft, Approachable UI for School Students',
        body: 'Sharp 2px–3px boxy corners can feel rigid and intimidating for primary and middle-school learners. We updated our global theme and component styles to use warm, rounded geometry that feels inviting on both desktop and mobile screens.'
      },
      {
        heading: 'Unified 100% CBSE Curriculum Messaging',
        body: 'To eliminate confusion for parents and students, we cleaned up stale multi-board references across the homepage, ad landing pages, and cached CMS defaults so AcademicLevel clearly presents its focused CBSE Classes 1–12 curriculum and single CBSE board selector.'
      },
      {
        heading: 'Streamlined Popup Checkout on Special ₹49',
        body: 'Instead of cluttering the Special ₹49 page with inline multi-step forms, clicking Pay Now now opens a clean, responsive payment popup directly, reducing friction for parents activating a 60-day pass.'
      }
    ],
    icon: <Palette className="w-5 h-5 text-pink-600" />,
    accentBg: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'offline-question-bank',
    date: 'Core Innovation',
    readTime: '5 min read',
    category: 'INNOVATIONS',
    tag: 'Question Bank',
    title: '3,600+ CBSE Question Bank with Offline-First SQLite Engine',
    summary:
      'Every CBSE Class 1–12 subject is backed by a structured MCQ bank with step-by-step explanations, hints, and instant SQLite + offline fallback retrieval.',
    highlights: [
      'Class-wise and chapter-wise progression across Foundation, Mastery, and Exam levels',
      'Built-in question bank integrity validator in CI',
      'Instant practice even on slow or intermittent mobile connections',
      'Sub-millisecond SQLite query retrieval with indexed lookups'
    ],
    sections: [
      {
        heading: 'Built for Real-World Indian Connectivity',
        body: 'Many students practice on shared family phones or variable 4G connections. Waiting several seconds between every quiz question breaks focus. AcademicLevel combines an indexed SQLite question_bank table on the server with a bundled offline fallback bank on the client.'
      },
      {
        heading: 'Structured Mastery Levels (Class 1 to Class 12)',
        body: 'Instead of dumping random questions into one giant list, every subject is organized into progressive tiers — Foundation, Concept, Exam Ready, and Olympiad — so beginners build confidence first before tackling multi-step board and competitive problems.'
      },
      {
        heading: 'Hints, Explanations & Integrity Guarantees',
        body: 'Every question includes a conceptual hint before submission and a detailed explanation afterward. Automated CI scripts verify all 3,600+ records on every commit so students never encounter broken options or missing answers.'
      }
    ],
    ctaLabel: 'Browse Question Bank',
    ctaRoute: 'PUBLIC_COURSES',
    icon: <Database className="w-5 h-5 text-blue-600" />,
    accentBg: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'mistake-vault-gamification',
    date: 'Core Innovation',
    readTime: '5 min read',
    category: 'INNOVATIONS',
    tag: 'Gamification',
    title: 'Mistake Vault, Daily Spin Wheel, Scholar Leagues & Gift Store',
    summary:
      'Turns mistakes into strengths: wrong answers automatically enter the Mistake Vault for targeted revision while Study Coins unlock real-world Scholar’s Gift Store rewards.',
    highlights: [
      'Automatic Mistake Vault error notebook for smart exam revision',
      'Daily Spin Wheel, QOTD, Weekly Challenges, and Scholar Leagues',
      'Study Coin economy backed by server-verified ledger transactions',
      'Redeemable Scholar’s Gift Store rewards and milestone badges'
    ],
    sections: [
      {
        heading: 'Turning Wrong Answers Into Exam Strength',
        body: 'Most quiz apps show a red X and move on, leaving students to make the exact same mistake a week later. AcademicLevel automatically saves every missed question into the student’s personal Mistake Vault, creating a focused pre-exam revision deck of the exact concepts they need to strengthen.'
      },
      {
        heading: 'Daily Habits That Feel Rewarding',
        body: 'Consistency beats last-minute cramming. Features like Question of the Day (QOTD), Today’s Study Quests, Daily Spin Wheel, Weekly Challenges, and Scholar Leagues reward students with Study Coins and XP for showing up every day.'
      },
      {
        heading: 'A Server-Verified Study Coin Economy',
        body: 'Every Study Coin earned from quizzes, quests, or streaks is recorded in a tamper-resistant server coin ledger and can be redeemed in the Scholar’s Gift Store — giving students tangible excitement around learning milestones.'
      }
    ],
    ctaLabel: 'Visit Gift Store',
    ctaRoute: 'GIFT_STORE',
    icon: <Award className="w-5 h-5 text-purple-600" />,
    accentBg: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'verifiable-certs-performance',
    date: 'Core Innovation',
    readTime: '4 min read',
    category: 'INNOVATIONS',
    tag: 'Trust & Speed',
    title: 'Verifiable Certificates, A-Codes & Lightweight Compressed Delivery',
    summary:
      'Cryptographically verifiable completion certificates, shareable A-Code friend passes, gzip-compressed API responses, and 1-year immutable static asset caching.',
    highlights: [
      'Public certificate verification at /verify',
      'Server-side gzip compression & immutable /assets caching for low bandwidth',
      'Zero third-party ads and strict child-safety defaults',
      'Shareable A-Code referral passes for classmates'
    ],
    sections: [
      {
        heading: 'Verifiable Learning Credentials',
        body: 'When a student completes curriculum milestones and earns an AcademicLevel certificate, anyone — parents, teachers, or schools — can verify its authenticity publicly at /verify using its unique verification token.'
      },
      {
        heading: 'Engineered for Low Bandwidth & Fast Loads',
        body: 'Performance is a feature. Our Express server compresses JSON API payloads with gzip and serves hashed static bundles under /assets with 1-year immutable cache headers. Returning students load the app almost instantaneously while using minimal mobile data.'
      },
      {
        heading: 'Zero Third-Party Ads, Ever',
        body: 'AcademicLevel never embeds third-party ad networks, tracking pixels, or distracting popups inside student study flows. Every screen is dedicated purely to safe, focused learning.'
      }
    ],
    ctaLabel: 'Verify a Certificate',
    ctaRoute: 'VERIFY_CERTIFICATE',
    icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    accentBg: 'bg-teal-50 border-teal-200'
  }
];

export const BlogPage: React.FC<BlogPageProps> = ({ onBack, onNavigate, initialPostSlug }) => {
  const [filter, setFilter] = useState<BlogCategory>('ALL');
  const [activePostId, setActivePostId] = useState<string | null>(() => {
    if (initialPostSlug && BLOG_POSTS.some((p) => p.id === initialPostSlug)) {
      return initialPostSlug;
    }
    return null;
  });

  useEffect(() => {
    if (initialPostSlug && BLOG_POSTS.some((p) => p.id === initialPostSlug)) {
      setActivePostId(initialPostSlug);
    } else if (initialPostSlug === '') {
      setActivePostId(null);
    }
  }, [initialPostSlug]);

  const openPost = (postId: string) => {
    setActivePostId(postId);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/blog/${postId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closePost = () => {
    setActivePostId(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeIndex = activePostId ? BLOG_POSTS.findIndex((p) => p.id === activePostId) : -1;
  const activePost = activeIndex >= 0 ? BLOG_POSTS[activeIndex] : null;

  // FULL DEDICATED BLOG ARTICLE PAGE
  if (activePost) {
    const prevPost = activeIndex > 0 ? BLOG_POSTS[activeIndex - 1] : null;
    const nextPost = activeIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[activeIndex + 1] : null;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        <button
          type="button"
          onClick={closePost}
          className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Blog Posts</span>
        </button>

        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${activePost.accentBg}`}>
              {activePost.icon}
            </div>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <Tag className="w-3 h-3" />
              <span>{activePost.tag}</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-xs text-slate-500 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{activePost.date}</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-xs text-slate-500 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{activePost.readTime}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {activePost.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed border-l-4 border-indigo-500 pl-4 bg-slate-50/70 py-3 rounded-r-2xl">
            {activePost.summary}
          </p>

          <div className="space-y-6 pt-2">
            {activePost.sections.map((section, idx) => (
              <section key={idx} className="space-y-2">
                <h2 className="text-lg font-extrabold text-slate-900">{section.heading}</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
              Key Highlights
            </h3>
            <ul className="space-y-2">
              {activePost.highlights.map((item, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {onNavigate && activePost.ctaRoute && activePost.ctaLabel && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate(activePost.ctaRoute!)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-extrabold inline-flex items-center space-x-2 shadow-sm cursor-pointer transition-colors"
              >
                <span>{activePost.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </article>

        {/* Previous / Next Post Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <button
              type="button"
              onClick={() => openPost(prevPost.id)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer shadow-2xs"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase block">← Previous Post</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 mt-1 block">
                {prevPost.title}
              </span>
            </button>
          ) : (
            <div />
          )}
          {nextPost && (
            <button
              type="button"
              onClick={() => openPost(nextPost.id)}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 text-left sm:text-right transition-all cursor-pointer shadow-2xs"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Next Post →</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 mt-1 block">
                {nextPost.title}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

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
          Click any post below to open the full article covering our latest updates, Nova AI Study Buddy,
          3,600+ CBSE Question Bank, Study Coins, Quiz Duels, and verifiable certificates.
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
            onClick={() => openPost(post.id)}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
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

              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{post.summary}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <ul className="space-y-1.5">
                {post.highlights.slice(0, 2).map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-400">{post.readTime}</span>
                <span className="text-xs font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center space-x-1">
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
