import { Grade } from '../types';

export interface ClassTheme {
  grade: Grade;
  name: string;
  stage: 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR';
  stageTitle: string;
  motto: string;
  mascot: {
    name: string;
    emoji: string;
    avatarBg: string;
    description: string;
  };
  gradientHero: string;
  gradientBadge: string;
  accentHex: string;
  cardBorder: string;
  cardHover: string;
  pillColor: string;
  quizStyle: 'PLAYFUL_BUBBLY' | 'TACTICAL_QUEST' | 'BOARD_SPECIMEN' | 'COMPETITIVE_NTA';
  specialWidget: {
    title: string;
    subtitle: string;
    emoji: string;
    badgeText: string;
    statLabel: string;
    statValue: string;
  };
  badges: { title: string; emoji: string; desc: string }[];
  greetingPhrases: string[];
}

export const CLASS_THEMES: Record<Grade, ClassTheme> = {
  1: {
    grade: 1,
    name: 'Wonder Explorers',
    stage: 'PRIMARY',
    stageTitle: 'Primary Discovery',
    motto: 'Play, discover, and touch the stars!',
    mascot: {
      name: 'Leo the Lion Cub',
      emoji: '🦁',
      avatarBg: 'bg-amber-400/20 border-amber-400/40 text-amber-300',
      description: 'Cheerful learning buddy for fun puzzles and big cheerful stars!'
    },
    gradientHero: 'from-amber-400 via-rose-400 to-sky-400',
    gradientBadge: 'from-amber-400 to-orange-500 text-slate-950',
    accentHex: '#f59e0b',
    cardBorder: 'border-amber-400/30 hover:border-amber-400 shadow-amber-950/20',
    cardHover: 'hover:shadow-amber-500/20 hover:scale-[1.02]',
    pillColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    quizStyle: 'PLAYFUL_BUBBLY',
    specialWidget: {
      title: "Leo's Star Sticker Book",
      subtitle: 'Solve puzzles today to collect shiny cartoon animal stickers!',
      emoji: '⭐',
      badgeText: 'Sticker Fun',
      statLabel: 'Stickers Collected',
      statValue: '12 / 20 ⭐'
    },
    badges: [
      { title: 'Tiny Explorer', emoji: '🌟', desc: 'First quiz completed with a bright smile!' },
      { title: 'Counting Cub', emoji: '🔢', desc: 'Counted all toys and fruits correctly.' },
      { title: 'Alphabet Whiz', emoji: '🔤', desc: 'Mastered sounds and magic letters.' },
      { title: 'Rainbow Artist', emoji: '🎨', desc: 'Recognized all shapes and color patterns.' }
    ],
    greetingPhrases: [
      'Ready for super fun puzzles today?',
      'Let us count shiny stars together!',
      'Hooray! Leo is so excited to learn with you!'
    ]
  },

  2: {
    grade: 2,
    name: 'Little Adventurers',
    stage: 'PRIMARY',
    stageTitle: 'Primary Exploration',
    motto: 'Hop through the forest of knowledge and unlock new wonders!',
    mascot: {
      name: 'Sammy the Scout Fox',
      emoji: '🦊',
      avatarBg: 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300',
      description: 'Curious scout guiding you through nature stories, addition, and words!'
    },
    gradientHero: 'from-emerald-400 via-teal-400 to-amber-300',
    gradientBadge: 'from-emerald-400 to-teal-500 text-slate-950',
    accentHex: '#10b981',
    cardBorder: 'border-emerald-400/30 hover:border-emerald-400 shadow-emerald-950/20',
    cardHover: 'hover:shadow-emerald-500/20 hover:scale-[1.02]',
    pillColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    quizStyle: 'PLAYFUL_BUBBLY',
    specialWidget: {
      title: "Sammy's Forest Discovery Map",
      subtitle: 'Follow the secret forest path by mastering daily math and reading quests.',
      emoji: '🗺️',
      badgeText: 'Nature Trail',
      statLabel: 'Trail Distance',
      statValue: '5.2 km 🐾'
    },
    badges: [
      { title: 'Curiosity Scout', emoji: '🍃', desc: 'Discovered 10 plant and animal facts.' },
      { title: 'Addition Trailblazer', emoji: '➕', desc: 'Solved 2-digit sums with zero errors.' },
      { title: 'Story Seeker', emoji: '📖', desc: 'Read and understood 5 complete tales.' },
      { title: 'Clock Master', emoji: '⏰', desc: 'Told time to the exact hour and half-hour.' }
    ],
    greetingPhrases: [
      'The forest trail is open for adventure!',
      'Grab your backpack, little explorer!',
      'Sammy found exciting new clues for you!'
    ]
  },

  3: {
    grade: 3,
    name: 'Curious Champions',
    stage: 'PRIMARY',
    stageTitle: 'Primary Mastery',
    motto: 'Sprint through challenges and collect victory trophies!',
    mascot: {
      name: 'Turbo Cheetah',
      emoji: '🐆',
      avatarBg: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
      description: 'Lightning-fast sprinter who loves multiplication tables and science facts!'
    },
    gradientHero: 'from-orange-500 via-rose-400 to-teal-400',
    gradientBadge: 'from-orange-500 to-rose-500 text-white',
    accentHex: '#f97316',
    cardBorder: 'border-orange-500/30 hover:border-orange-500 shadow-orange-950/20',
    cardHover: 'hover:shadow-orange-500/20 hover:scale-[1.02]',
    pillColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    quizStyle: 'PLAYFUL_BUBBLY',
    specialWidget: {
      title: 'Turbo Speed-Math Sprint',
      subtitle: 'Complete 3 fast multiplication rounds to earn Turbo speed trophies!',
      emoji: '⚡',
      badgeText: 'Speed Sprint',
      statLabel: 'Sprint Velocity',
      statValue: '280 WPM ⚡'
    },
    badges: [
      { title: 'Times-Table Knight', emoji: '⚔️', desc: 'Crushed the 2, 3, 4, and 5 tables!' },
      { title: 'Science Detective', emoji: '🔍', desc: 'Understood solids, liquids, and gases.' },
      { title: 'Grammar Champion', emoji: '🏆', desc: 'Spotted nouns, verbs, and adjectives instantly.' },
      { title: 'Measure Ace', emoji: '📏', desc: 'Measured meters and centimeters accurately.' }
    ],
    greetingPhrases: [
      'Turbo Cheetah is ready to sprint!',
      'Speed through today’s challenges!',
      'Collect your championship stars today!'
    ]
  },

  4: {
    grade: 4,
    name: 'Junior Pioneers',
    stage: 'PRIMARY',
    stageTitle: 'Primary Milestone',
    motto: 'Launch your rocket towards middle school excellence!',
    mascot: {
      name: 'Nova Space Scout',
      emoji: '🛸',
      avatarBg: 'bg-purple-600/20 border-purple-500/40 text-purple-300',
      description: 'Cosmic navigator tracking solar systems, fractions, and grammar engines!'
    },
    gradientHero: 'from-purple-600 via-indigo-600 to-lime-400',
    gradientBadge: 'from-purple-600 to-indigo-600 text-white',
    accentHex: '#a855f7',
    cardBorder: 'border-purple-500/30 hover:border-purple-400 shadow-purple-950/20',
    cardHover: 'hover:shadow-purple-500/20 hover:scale-[1.02]',
    pillColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    quizStyle: 'PLAYFUL_BUBBLY',
    specialWidget: {
      title: 'Planetary Science Space Station',
      subtitle: 'Dock your spaceship at Earth, Mars, and Jupiter by mastering Class 4 units.',
      emoji: '🪐',
      badgeText: 'Cosmic Orbit',
      statLabel: 'Orbit Altitude',
      statValue: '420 km 🚀'
    },
    badges: [
      { title: 'Fraction Pioneer', emoji: '🍕', desc: 'Understood halves, quarters, and eighths.' },
      { title: 'Cosmic Astronomer', emoji: '🌌', desc: 'Mapped all 8 planets of our solar system.' },
      { title: 'Primary Graduate', emoji: '🎓', desc: 'Ready for the jump into Middle School!' },
      { title: 'Plant Botanist', emoji: '🌿', desc: 'Mastered photosynthesis and seed dispersal.' }
    ],
    greetingPhrases: [
      'Spaceship engines are primed and ready!',
      'Welcome aboard, Junior Pioneer!',
      'Set coordinates for maximum knowledge!'
    ]
  },

  5: {
    grade: 5,
    name: 'Middle School Cadets',
    stage: 'MIDDLE',
    stageTitle: 'Middle School Foundation',
    motto: 'Gear up for structured inquiry, tactical thinking, and equations!',
    mascot: {
      name: 'Iron Owl',
      emoji: '🦉',
      avatarBg: 'bg-blue-600/20 border-blue-500/40 text-blue-300',
      description: 'Wise tactical strategist coaching you through fractions, decimals, and body systems.'
    },
    gradientHero: 'from-blue-600 via-indigo-700 to-cyan-500',
    gradientBadge: 'from-blue-600 to-cyan-600 text-white',
    accentHex: '#3b82f6',
    cardBorder: 'border-blue-500/30 hover:border-blue-400 shadow-blue-950/20',
    cardHover: 'hover:shadow-blue-500/20 hover:scale-[1.02]',
    pillColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    quizStyle: 'TACTICAL_QUEST',
    specialWidget: {
      title: 'Cadet Mission Radar & Tactical Tree',
      subtitle: 'Track your middle school rank and unlock tactical streak multipliers.',
      emoji: '🧭',
      badgeText: 'Cadet Rank II',
      statLabel: 'Mission Success',
      statValue: '88.5% 🎯'
    },
    badges: [
      { title: 'Middle School Entry', emoji: '🎖️', desc: 'Successfully onboarded into Middle School.' },
      { title: 'Decimal Decryption', emoji: '🔢', desc: 'Converted fractions and decimals effortlessly.' },
      { title: 'Anatomy Analyst', emoji: '🫀', desc: 'Mastered human circulatory & nervous systems.' },
      { title: 'Geometry Cadet', emoji: '📐', desc: 'Calculated perimeter and area of complex shapes.' }
    ],
    greetingPhrases: [
      'Cadet briefing ready for inspection.',
      'Tactical study radar is locked on target.',
      'Maintain your streak and advance your rank!'
    ]
  },

  6: {
    grade: 6,
    name: 'Discovery Scholars',
    stage: 'MIDDLE',
    stageTitle: 'Middle Science & Math',
    motto: 'Formulate hypotheses, observe patterns, and prove theorems!',
    mascot: {
      name: 'Galileo Microscope',
      emoji: '🔬',
      avatarBg: 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300',
      description: 'Scientific researcher unraveling cell structures, integers, and ancient civilizations.'
    },
    gradientHero: 'from-indigo-600 via-purple-700 to-amber-400',
    gradientBadge: 'from-indigo-600 to-purple-600 text-white',
    accentHex: '#6366f1',
    cardBorder: 'border-indigo-500/30 hover:border-indigo-400 shadow-indigo-950/20',
    cardHover: 'hover:shadow-indigo-500/20 hover:scale-[1.02]',
    pillColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    quizStyle: 'TACTICAL_QUEST',
    specialWidget: {
      title: 'Discovery Science & Math Lab',
      subtitle: 'Interactive virtual lab apparatus testing magnetism, friction, and integers.',
      emoji: '🧪',
      badgeText: 'Lab Station',
      statLabel: 'Specimens Analyzed',
      statValue: '34 Units 🔬'
    },
    badges: [
      { title: 'Integer Specialist', emoji: '±', desc: 'Mastered negative numbers on the number line.' },
      { title: 'Cell Biologist', emoji: '🧫', desc: 'Identified plant vs animal cell organelles.' },
      { title: 'History Excavator', emoji: '🏺', desc: 'Decoded Indus Valley and Vedic settlements.' },
      { title: 'Grammar Captain', emoji: '✍️', desc: 'Analyzed active-passive voice with precision.' }
    ],
    greetingPhrases: [
      'Lab equipment calibrated and ready.',
      'Formulate your academic hypotheses today!',
      'Let us investigate today’s core theorems.'
    ]
  },

  7: {
    grade: 7,
    name: 'Quantum Navigators',
    stage: 'MIDDLE',
    stageTitle: 'Middle Advanced',
    motto: 'Master algebraic expressions, heat transfer, and world geography!',
    mascot: {
      name: 'Quantum Atom',
      emoji: '⚛️',
      avatarBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
      description: 'Quantum intelligence calculating algebraic variables, optics, and constitutional civics.'
    },
    gradientHero: 'from-slate-900 via-blue-900 to-cyan-500',
    gradientBadge: 'from-blue-600 to-cyan-500 text-white',
    accentHex: '#06b6d4',
    cardBorder: 'border-cyan-500/30 hover:border-cyan-400 shadow-cyan-950/20',
    cardHover: 'hover:shadow-cyan-500/20 hover:scale-[1.02]',
    pillColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    quizStyle: 'TACTICAL_QUEST',
    specialWidget: {
      title: 'Quantum Accuracy & Algebra Grid',
      subtitle: 'Real-time precision gauge computing your algebraic fluency and error margins.',
      emoji: '📊',
      badgeText: 'Quantum Grid',
      statLabel: 'Algebraic Precision',
      statValue: '94.2% ⚡'
    },
    badges: [
      { title: 'Algebra Ace', emoji: '🧩', desc: 'Solved linear algebraic systems smoothly.' },
      { title: 'Thermodynamics Analyst', emoji: '🔥', desc: 'Understood conduction, convection, radiation.' },
      { title: 'Civic Constitutionalist', emoji: '🏛️', desc: 'Mastered democratic pillars and state governance.' },
      { title: 'Triangles Architect', emoji: '📐', desc: 'Proved triangle congruence criteria (SSS, SAS, ASA).' }
    ],
    greetingPhrases: [
      'Quantum systems online.',
      'Precision and analytical clarity first.',
      'Navigate through advanced Class 7 nodes!'
    ]
  },

  8: {
    grade: 8,
    name: 'Pre-Board Trailblazers',
    stage: 'MIDDLE',
    stageTitle: 'Pre-Secondary Foundation',
    motto: 'Build the launchpad for secondary board exams and competitive Olympiads!',
    mascot: {
      name: 'Blaze Phoenix',
      emoji: '🔥',
      avatarBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
      description: 'Resilient phoenix fueling high-intensity streaks, force calculations, and pre-board readiness.'
    },
    gradientHero: 'from-rose-950 via-zinc-900 to-red-600',
    gradientBadge: 'from-red-600 to-rose-600 text-white',
    accentHex: '#ef4444',
    cardBorder: 'border-red-500/30 hover:border-red-400 shadow-red-950/20',
    cardHover: 'hover:shadow-red-500/20 hover:scale-[1.02]',
    pillColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    quizStyle: 'TACTICAL_QUEST',
    specialWidget: {
      title: 'Phoenix Streak Arena & Pre-Board Milestone',
      subtitle: 'High-energy arena tracking readiness for the leap into secondary board exams.',
      emoji: '🔥',
      badgeText: 'High Heat',
      statLabel: 'Pre-Board Index',
      statValue: '91 / 100 🛡️'
    },
    badges: [
      { title: 'High School Bound', emoji: '🚀', desc: 'Mastered complete middle school curriculum.' },
      { title: 'Mechanics & Pressure', emoji: '⚙️', desc: 'Solved hydraulic pressure and friction problems.' },
      { title: 'Chemical Reactions', emoji: '🧪', desc: 'Balanced displacement and combustion equations.' },
      { title: 'Factorization Pro', emoji: '✂️', desc: 'Factorized quadratic expressions with ease.' }
    ],
    greetingPhrases: [
      'The Phoenix burns with focus.',
      'Ignite your pre-board preparation!',
      'Build your foundation for Class 9 & 10!'
    ]
  },

  9: {
    grade: 9,
    name: 'Board Vanguard',
    stage: 'SECONDARY',
    stageTitle: 'Secondary Board Foundation',
    motto: 'Establish unshakeable board exam foundations with NCERT and ICSE rigor!',
    mascot: {
      name: 'Apex Compass',
      emoji: '🧭',
      avatarBg: 'bg-slate-800 border-cyan-500/40 text-cyan-300',
      description: 'Strategic navigation instrument mapping 9th curriculum directly into 10th board dominance.'
    },
    gradientHero: 'from-slate-950 via-zinc-900 to-cyan-500',
    gradientBadge: 'from-cyan-500 to-blue-600 text-white',
    accentHex: '#06b6d4',
    cardBorder: 'border-cyan-500/30 hover:border-cyan-400 shadow-cyan-950/20',
    cardHover: 'hover:shadow-cyan-500/20 hover:scale-[1.02]',
    pillColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    quizStyle: 'BOARD_SPECIMEN',
    specialWidget: {
      title: 'NCERT / ICSE Specimen Checklist',
      subtitle: 'Official chapter-by-chapter curriculum tracking for 9th CBSE, ICSE, and Cambridge exams.',
      emoji: '📋',
      badgeText: 'Board Specimen',
      statLabel: 'Syllabus Mapped',
      statValue: '86% Complete'
    },
    badges: [
      { title: 'Kinematics Master', emoji: '📈', desc: 'Derived all 3 kinematic equations of motion.' },
      { title: 'Atomic Theorist', emoji: '⚛️', desc: 'Mastered Thomson, Rutherford, and Bohr atomic models.' },
      { title: 'Tissues Specialist', emoji: '🧬', desc: 'Identified meristematic, xylem, and phloem tissues.' },
      { title: 'Polynomials Virtuoso', emoji: '📐', desc: 'Applied Factor and Remainder theorems flawlessly.' }
    ],
    greetingPhrases: [
      'Board Vanguard command active.',
      'Rigor in Class 9 guarantees 10th board topper ranks.',
      'Inspect your NCERT specimen coverage.'
    ]
  },

  10: {
    grade: 10,
    name: 'Board Exam Titans',
    stage: 'SECONDARY',
    stageTitle: '10th Board Exam Year',
    motto: 'The ultimate board examination milestone: aim for 100/100 perfection!',
    mascot: {
      name: 'Imperial Gold Crown',
      emoji: '👑',
      avatarBg: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
      description: 'The golden crown of academic supremacy for CBSE and ICSE 10th Board Candidates.'
    },
    gradientHero: 'from-amber-950 via-slate-950 to-amber-500',
    gradientBadge: 'from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-black',
    accentHex: '#f59e0b',
    cardBorder: 'border-amber-400/40 hover:border-amber-400 shadow-amber-950/30',
    cardHover: 'hover:shadow-amber-500/30 hover:scale-[1.02]',
    pillColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    quizStyle: 'BOARD_SPECIMEN',
    specialWidget: {
      title: '10th Board Exam Official Countdown & Topper Simulator',
      subtitle: 'Timed specimen papers modeled after official CBSE & ICSE Class 10 board question formats.',
      emoji: '🏆',
      badgeText: '10th Board Hub',
      statLabel: 'Target Score',
      statValue: '100 / 100 👑'
    },
    badges: [
      { title: 'Board 10th Topper Aim', emoji: '👑', desc: 'Targeting 98%+ in upcoming 10th Board Exams.' },
      { title: 'Trigonometry Titan', emoji: '📐', desc: 'Solved complex heights & distances and identities.' },
      { title: 'Electricity Master', emoji: '⚡', desc: 'Calculated parallel circuits, Joule heating, and Ohm\'s law.' },
      { title: 'Carbon Compounds', emoji: '⚗️', desc: 'Mastered covalent bonding, soaps, and isomerism.' }
    ],
    greetingPhrases: [
      'Welcome, Class 10 Board Titan.',
      'Every question brings you closer to 100/100.',
      'Simulate the official 10th board paper today!'
    ]
  },

  11: {
    grade: 11,
    name: 'Stream Specialists',
    stage: 'SENIOR',
    stageTitle: 'Higher Secondary & Competitive',
    motto: 'Dive deep into specialized streams: Calculus, Thermodynamics, Organic, and Vectors!',
    mascot: {
      name: 'Quantum DNA & Vector',
      emoji: '🧬',
      avatarBg: 'bg-purple-950/40 border-purple-500/40 text-purple-300',
      description: 'Higher secondary stream engine balancing PCM, PCB, Commerce, and Olympiad standards.'
    },
    gradientHero: 'from-purple-950 via-slate-950 to-blue-600',
    gradientBadge: 'from-purple-600 to-blue-600 text-white',
    accentHex: '#8b5cf6',
    cardBorder: 'border-purple-500/30 hover:border-purple-400 shadow-purple-950/20',
    cardHover: 'hover:shadow-purple-500/20 hover:scale-[1.02]',
    pillColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    quizStyle: 'COMPETITIVE_NTA',
    specialWidget: {
      title: 'Higher Secondary Stream Hub (PCM / PCB / Commerce)',
      subtitle: 'Calculus derivatives, chemical thermodynamics, and specialized competitive track selector.',
      emoji: '📈',
      badgeText: 'Stream Specialist',
      statLabel: 'Stream Rank',
      statValue: 'Top 3% Tier'
    },
    badges: [
      { title: 'Calculus Apprentice', emoji: '∫', desc: 'Mastered limits, continuity, and first derivatives.' },
      { title: 'Newtonian Dynamics', emoji: '🏹', desc: 'Solved projectile motion and rotational dynamics.' },
      { title: 'Equilibrium Chemist', emoji: '⚖️', desc: 'Computed Le Chatelier shifts and pH buffers.' },
      { title: 'Olympiad Contender', emoji: '🎖️', desc: 'Cleared national olympiad benchmark thresholds.' }
    ],
    greetingPhrases: [
      'Stream specialized systems engaged.',
      'Higher secondary concepts require analytical clarity.',
      'Master Class 11 core derivations!'
    ]
  },

  12: {
    grade: 12,
    name: 'Hall of Fame Masters',
    stage: 'SENIOR',
    stageTitle: '12th Boards & Competitive Entrance',
    motto: '12th Board Distinction + JEE / NEET / CUET Dominance!',
    mascot: {
      name: 'Sovereign Diamond',
      emoji: '💎',
      avatarBg: 'bg-red-950/40 border-amber-400/50 text-amber-300',
      description: 'The pinnacle of school education: 12th Board distinction, percentile simulator, and speed-run arena.'
    },
    gradientHero: 'from-red-950 via-slate-950 to-amber-400',
    gradientBadge: 'from-red-600 via-rose-600 to-amber-500 text-white font-black',
    accentHex: '#ef4444',
    cardBorder: 'border-red-500/40 hover:border-amber-400 shadow-red-950/30',
    cardHover: 'hover:shadow-amber-500/30 hover:scale-[1.02]',
    pillColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    quizStyle: 'COMPETITIVE_NTA',
    specialWidget: {
      title: '12th Board + JEE / NEET Competitive Speed-Run Arena',
      subtitle: 'Timed full-mock examinations with question palette, review tags, and percentile analytics.',
      emoji: '⚡',
      badgeText: 'AIR Contender',
      statLabel: 'Estimated Percentile',
      statValue: '99.4%ile 💎'
    },
    badges: [
      { title: 'All-India Rank Candidate', emoji: '💎', desc: 'Scoring consistently in the top 99th percentile.' },
      { title: 'Integrals Maestro', emoji: '∫dx', desc: 'Evaluated complex definite integrals and differential equations.' },
      { title: 'Electromagnetism Master', emoji: '🧲', desc: 'Solved Faraday, Ampere, and Maxwell electrodynamics.' },
      { title: 'Organic Synthesizer', emoji: '🧪', desc: 'Mastered name reactions, mechanisms, and conversions.' }
    ],
    greetingPhrases: [
      'Welcome to the Hall of Fame Arena.',
      '12th Boards & Competitive dominance starts now.',
      'Test your speed and accuracy under official NTA exam conditions!'
    ]
  }
};

export function getClassTheme(grade: Grade): ClassTheme {
  const g = Number(grade) as Grade;
  return CLASS_THEMES[g] || CLASS_THEMES[10];
}
