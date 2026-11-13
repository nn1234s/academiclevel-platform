import React, { useState, useEffect } from 'react';
import {
  Star,
  Check,
  Flame,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  X,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Phone,
  User,
  ShieldCheck,
  ExternalLink,
  Target,
  Trophy,
  Brain,
  Video,
  Layers,
  HelpCircle,
  Play,
  Gift,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { PaymentService } from '../../services/paymentService';
import { UPIQRCheckout } from '../student/UPIQRCheckout';
import { CLASS_THEMES } from '../../core/theme/classThemes';
import { Grade, Board } from '../../core/types';
import { ReCaptchaWidget } from '../shared/ReCaptchaWidget';

export interface Special49AdsLandingPageProps {
  onSuccessRegistered: () => void;
}

interface ReviewItem {
  id: string;
  name: string;
  role: string;
  date: string;
  stars: number;
  avatarBg: string;
  text: string;
}

// Authentic reviews matching the Oda-class and user uploaded style
const REVIEWS_POOL: ReviewItem[] = [
  {
    id: 'prabir-1',
    name: 'Prabir',
    role: 'Parent of Class 5 Student (Bhubaneswar)',
    date: '08 Nov 2026',
    stars: 5,
    avatarBg: 'bg-amber-600',
    text: 'It is really good because the adaptive AI quizzes explain every maths and science concept so nicely and energetic!!! Best Choice ever to join ACADEMIC LEVEL!! My son used to struggle with fractions and problem sums, but the 50+ solving skills and AI practice tests made him score 98% in his school exams!'
  },
  {
    id: 'preetish-1',
    name: 'Preetish',
    role: 'Parent of Class 5 Student (Bhubaneswar)',
    date: '05 Nov 2026',
    stars: 5,
    avatarBg: 'bg-emerald-600',
    text: "It's very good learning app for children.. the AI quizzes keep my daughter completely disciplined. She can practice anytime 24/7 at her own pace and topics are also too good .... Worth 10x more than ₹49!"
  },
  {
    id: 'shaymin-1',
    name: 'Shaymin',
    role: 'Class 5 Scholar',
    date: '02 Nov 2026',
    stars: 5,
    avatarBg: 'bg-indigo-600',
    text: 'It is very interesting I am enjoying so much with lots of shortcut methods! Science and Maths was confusing for me, but ACADEMIC LEVEL AI quizzes broke down every single concept with instant hints. Best study booster ever!!'
  },
  {
    id: 'kabir-1',
    name: 'Kabir S.',
    role: 'Class 10 CBSE Student (Delhi)',
    date: '09 Nov 2026',
    stars: 5,
    avatarBg: 'bg-rose-600',
    text: 'The Special 49 Offer gave me full 60 days of board exam question bank with instant step-by-step AI answers. Aced my pre-board math and science exams with 96%!'
  },
  {
    id: 'ananya-1',
    name: 'Ananya Sharma',
    role: 'Grade 8 Student (Bengaluru)',
    date: '07 Nov 2026',
    stars: 5,
    avatarBg: 'bg-cyan-600',
    text: 'Improved learning initiative, no longer need parental supervision. My secret to success 🚀 The coins and digital gift cards make practicing daily quizzes super motivating!'
  },
  {
    id: 'vikram-1',
    name: 'Dr. Vikram Sen',
    role: 'Parent of Class 11 Student (Kolkata)',
    date: '04 Nov 2026',
    stars: 5,
    avatarBg: 'bg-purple-600',
    text: 'Best platform ever! Course content syncs perfectly with school curriculum and competitive foundations. Far better value than offline tuition centres charging thousands.'
  }
];

const LIVE_ENROLLMENTS = [
  'Aarav from Delhi enrolled in Class 10 (Special 49 Offer)',
  'Sneha from Mumbai enrolled in Class 5 (Special 49 Offer)',
  'Bhavya from Patna enrolled in Class 8 (Special 49 Offer)',
  'Rohan from Bengaluru enrolled in Class 12 (Special 49 Offer)',
  'Ananya from Hyderabad enrolled in Class 6 (Special 49 Offer)',
  'Aditya from Lucknow enrolled in Class 9 (Special 49 Offer)',
  'Priya from Pune enrolled in Class 3 (Special 49 Offer)'
];

// Rich curriculum syllabus info for all classes 1-12
const CLASS_SYLLABUS_INFO: Record<Grade, {
  tagline: string;
  subjects: string[];
  keyHighlights: string[];
  targetExams: string;
  sampleQuestion: { q: string; a: string; explanation: string };
}> = {
  1: {
    tagline: 'Foundational Numbers, Phonics, Shapes & Fun Curiosities',
    subjects: ['Playful Mathematics', 'Environmental Explorations', 'English Phonics & Vocabulary', 'Logical Picture Puzzles'],
    keyHighlights: ['Cartoon Mascot Leo guidance', 'Audio-visual question prompts', 'Star Stickers & Study Badges'],
    targetExams: 'School Term Tests & Junior Olympiad Foundations',
    sampleQuestion: {
      q: 'Which number comes right after 8 and before 10?',
      a: '9',
      explanation: 'Counting in order: 7, 8, 9, 10. The number between 8 and 10 is 9!'
    }
  },
  2: {
    tagline: 'Addition, Animal Science, Story Logic & Word Power',
    subjects: ['Mathematics & Mental Math', 'Nature & Animal Science', 'English Reading', 'Pattern Recognition'],
    keyHighlights: ['Timed counting games', 'Visual subtraction balance', 'Streak Coin Rewards'],
    targetExams: 'School Formative Assessments & SilverZone Olympiads',
    sampleQuestion: {
      q: 'If a rabbit has 4 carrots and finds 3 more, how many carrots does it have?',
      a: '7 carrots',
      explanation: '4 + 3 = 7. The rabbit has 7 carrots in total.'
    }
  },
  3: {
    tagline: 'Multiplication Tables, Matter, Habitats & Paragraph Skills',
    subjects: ['Mathematics (Times Tables & Geometry)', 'General Science (Living & Non-Living)', 'English Grammar', 'Mental Aptitude'],
    keyHighlights: ['Multiplication speed-runs', 'Interactive science diagrams', 'Daily Question of the Day'],
    targetExams: 'CBSE / ICSE School Evaluations & NCO / NSO Olympiads',
    sampleQuestion: {
      q: 'What is 7 multiplied by 6?',
      a: '42',
      explanation: '7 × 6 = 42. Practicing 7 times table daily builds lightning-fast recall.'
    }
  },
  4: {
    tagline: 'Fractions, Human Body, Force, Solar System & Reasoning',
    subjects: ['Mathematics (Fractions & Division)', 'Science (Ecosystems & Energy)', 'English Comprehension', 'Critical Reasoning'],
    keyHighlights: ['Fraction visualizer widgets', 'Science experiment quiz simulation', 'Weekly Scholar Sprints'],
    targetExams: 'School Summative Exams & NSTSE / IMO Foundations',
    sampleQuestion: {
      q: 'Which planet is known as the Red Planet in our Solar System?',
      a: 'Mars',
      explanation: 'Mars is covered with iron oxide (rust) dust, giving it a distinct reddish appearance.'
    }
  },
  5: {
    tagline: 'Decimals, Percentages, Circulatory System, Matter & Grammar',
    subjects: ['Mathematics (Decimals, Area & Volume)', 'General Science (Organs & Energy)', 'Social Studies & Earth', 'Logical Aptitude'],
    keyHighlights: ['50+ Concept Booster shortcuts', 'Step-by-step problem solver', 'Olympiad medal tracker'],
    targetExams: 'CBSE / ICSE / State Board Mastery & Class 5 IMO/NSO/NSTSE',
    sampleQuestion: {
      q: 'What is 3/4 expressed as a decimal and percentage?',
      a: '0.75 or 75%',
      explanation: 'Divide 3 by 4 to get 0.75. Multiply 0.75 by 100 to get 75%!'
    }
  },
  6: {
    tagline: 'Integers, Algebra Basics, Physics (Motion), Chemistry (Fibre to Fabric)',
    subjects: ['Mathematics (Algebra & Ratio)', 'Physics & Chemistry (NCERT Foundation)', 'Biology (Components of Food)', 'English & Social'],
    keyHighlights: ['Intro to Algebraic equations', 'Light, Shadows & Reflection simulations', '24/7 Nova AI Tutor support'],
    targetExams: 'Middle School Annual Finals & Homi Bhabha Science Exam',
    sampleQuestion: {
      q: 'Solve for x: 3x - 5 = 16',
      a: 'x = 7',
      explanation: 'Add 5 to both sides: 3x = 21. Divide by 3: x = 7!'
    }
  },
  7: {
    tagline: 'Exponents, Heat & Temperature, Acids & Bases, Nutrition in Plants',
    subjects: ['Mathematics (Rational Numbers & Triangles)', 'Physics & Chemistry', 'Biology & Environment', 'Mental Ability Test (MAT)'],
    keyHighlights: ['Linear equation mastery', 'Heat conduction & convection drills', 'Peer leaderboards & study packs'],
    targetExams: 'Middle School Mastery & National Science Talent Search (NSTSE)',
    sampleQuestion: {
      q: 'What is the standard unit of temperature in the International System (SI)?',
      a: 'Kelvin (K)',
      explanation: 'While Celsius is widely used in daily life, Kelvin (K) is the official SI unit of temperature.'
    }
  },
  8: {
    tagline: 'Linear Equations, Rational Numbers, Microorganisms, Force & Pressure',
    subjects: ['Mathematics (Squares, Cubes & Mensuration)', 'Science (Physics, Chemistry, Biology)', 'English Literature & Grammar', 'National Talent Aptitude'],
    keyHighlights: ['Critical transition to High School Science', 'Force & Pressure numerical solvers', 'National Scholarship eligibility'],
    targetExams: 'Class 8 Board Prep & NMMS / NTSE Foundation',
    sampleQuestion: {
      q: 'Pressure is defined as:',
      a: 'Force divided by Area (P = F / A)',
      explanation: 'Pressure is the perpendicular force applied per unit area. SI unit is Pascal (N/m²).'
    }
  },
  9: {
    tagline: 'Polynomials, Coordinate Geometry, Laws of Motion, Cell Structure & Tissues',
    subjects: ['Mathematics (NCERT Exemplar level)', 'Physics (Motion, Gravitation, Work & Energy)', 'Chemistry (Atoms & Molecules)', 'Biology (Cell & Tissues)'],
    keyHighlights: ['Foundational bedrock for Class 10 Boards', 'Newtonian mechanics numerical banks', 'In-depth derivation breakdowns'],
    targetExams: 'Class 9 Final Exams & Early JEE / NEET Foundation',
    sampleQuestion: {
      q: 'State Newton’s Second Law of Motion mathematically:',
      a: 'F = m · a',
      explanation: 'Force equals mass times acceleration (rate of change of momentum is proportional to applied force).'
    }
  },
  10: {
    tagline: 'Quadratic Equations, Trigonometry, Light (Optics), Chemical Reactions & Heredity',
    subjects: ['Mathematics (Trigonometry & Surface Areas)', 'Physics (Electricity & Magnetic Effects)', 'Chemistry (Carbon & Acids)', 'Biology (Life Processes)'],
    keyHighlights: ['1,000 Board exam specimen questions', 'CBSE / ICSE marking scheme alignment', 'High School Board Exam Rank Accelerator'],
    targetExams: 'CBSE / ICSE Class 10 Board Exams & NTSE',
    sampleQuestion: {
      q: 'What is the value of sin²θ + cos²θ for any angle θ?',
      a: '1',
      explanation: 'This is the fundamental Pythagorean trigonometric identity: sin²θ + cos²θ = 1.'
    }
  },
  11: {
    tagline: 'Calculus Foundations, Kinematics, Chemical Bonding, Cell Biology & Commerce/Arts',
    subjects: ['Physics (Vectors, Kinematics, Thermodynamics)', 'Chemistry (Atomic Structure, Bonding, Organic)', 'Mathematics (Limits, Trigonometry, Conics)', 'Biology / Accountancy / Economics'],
    keyHighlights: ['Competitive Speed-Run Arena', 'JEE Main & NEET numerical depth', 'Multi-concept problem decomposition'],
    targetExams: 'Class 11 Annual Exams & JEE Main / NEET / CUET Entrance Phase 1',
    sampleQuestion: {
      q: 'What is the derivative of f(x) = x³ with respect to x?',
      a: '3x²',
      explanation: 'Using the power rule: d/dx (x^n) = n · x^(n-1). For x³, derivative is 3x².'
    }
  },
  12: {
    tagline: 'Integral Calculus, Electromagnetism, Electrochemistry, Organic Mechanisms & Board 95%+',
    subjects: ['Physics (Electrostatics, Optics, Modern Physics)', 'Chemistry (Solutions, Electrochemistry, Coordination, Aldehydes)', 'Mathematics (Integrals, Vectors, 3D Geometry)', 'Biology / Business / Economics'],
    keyHighlights: ['NTA-style timed test interface', '12th Board Examination distinction masterbank', 'All-India Scholar Rank leaderboards'],
    targetExams: 'Class 12 Boards (CBSE / ICSE / State) & JEE Advanced, NEET, CUET',
    sampleQuestion: {
      q: 'What is the integral of 1/x with respect to x?',
      a: 'ln|x| + C',
      explanation: 'The standard integral of 1/x is natural logarithm ln|x| plus arbitrary constant C.'
    }
  }
};

export const Special49AdsLandingPage: React.FC<Special49AdsLandingPageProps> = ({ onSuccessRegistered }) => {
  const { registerStudent } = useAuth();

  const [selectedClass, setSelectedClass] = useState<Grade>(5);
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(847);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Quick enroll modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parentName, setParentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);

  // Payment checkout modal state
  const [showUpiCheckout, setShowUpiCheckout] = useState(false);
  const [createdLearnerId, setCreatedLearnerId] = useState<string | null>(null);

  // Review Drawer state
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  // Cycle live enrollment ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_ENROLLMENTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer for offer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!captchaVerified) {
      setErrorMessage('Please verify that you are not a robot before proceeding.');
      setCaptchaError(true);
      return;
    }

    if (!studentName.trim()) {
      setErrorMessage('Please enter student full name.');
      return;
    }

    if (!password || password.trim().length < 6) {
      setErrorMessage('Please create an account password of at least 6 characters.');
      return;
    }

    const email = emailOrPhone.includes('@')
      ? emailOrPhone.trim().toLowerCase()
      : `${emailOrPhone.replace(/[^0-9]/g, '') || 'special'}@special49.academiclevel.in`;

    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        fullName: studentName.trim(),
        email,
        password: password.trim(),
        board: selectedBoard,
        grade: selectedClass,
        parentName: parentName.trim() || 'Parent'
      });

      setIsSubmitting(false);
      if (res.success) {
        const session = StorageRLSLayer.getCurrentSession();
        if (session) {
          setCreatedLearnerId(session.learnerId);

          // Auto-register pending payment intent so the student IMMEDIATELY appears in
          // the Admin's "PAID PAYMENT people" verification queue under "To Tick"
          PaymentService.submitUpiPayment(
            session.learnerId,
            'LITE',
            emailOrPhone.trim().includes('@') ? emailOrPhone.trim() : `${emailOrPhone.replace(/[^0-9]/g, '') || '9861439460'}@upi`,
            undefined
          ).catch(err => console.warn('Payment intent registration warning:', err));

          setIsModalOpen(false);
          setShowUpiCheckout(true);
        } else {
          onSuccessRegistered();
        }
      } else {
        setErrorMessage(res.error || 'Enrollment registration failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error occurred while registering.');
    }
  };

  const currentTheme = CLASS_THEMES[selectedClass];
  const syllabus = CLASS_SYLLABUS_INFO[selectedClass];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#ff7300] selection:text-white">

      {/* ======================================================== */}
      {/* 1. TOP STICKY SPECIAL 49 OFFER PROMO BAR                 */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white px-3 sm:px-6 py-2.5 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="bg-white text-orange-600 px-2 py-0.5 rounded font-black text-[11px] tracking-wide uppercase flex items-center space-x-1 shadow-sm">
              <Zap className="w-3 h-3 fill-orange-600" />
              <span>Special Offer</span>
            </span>
            <span className="font-extrabold hidden sm:inline">
              Special 49 Offer • Original Price ₹499 (90% OFF)
            </span>
            <span className="font-bold sm:hidden">
              Special 49 Offer (Orig. ₹499)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <div className="flex items-center space-x-1 bg-black/25 px-2.5 py-0.5 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Offer Closes In: {formatCountdown(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-300 hover:bg-amber-200 text-slate-950 font-black px-3 py-1 rounded-full text-xs shadow transition-all hover:scale-105"
            >
              Claim ₹49 Now
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HERO: ODA-CLASS DUAL CARD + CLASS 1-12 SELECTOR       */}
      {/* ======================================================== */}
      <section className="py-6 sm:py-10 px-3 sm:px-6 bg-gradient-to-b from-orange-50/60 via-white to-slate-50">
        <div className="max-w-6xl mx-auto">
          {/* Main Dual Card Container */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">

            {/* LEFT COLUMN (7 Cols): Oda-Style Concept Booster Card */}
            <div className="lg:col-span-7 bg-[#fafbfc] border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
              <div>
                {/* Top Orange Header Card */}
                <div className="bg-gradient-to-b from-[#f95a00] to-[#ff7300] text-white p-6 sm:p-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/30 backdrop-blur-md text-[#ffea79] border border-white/20">
                      Special 49 Offer
                    </span>
                    <span className="text-xs font-bold text-white/90">
                      Class 1 to 12 • All Boards
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug text-white">
                    CONCEPT BOOSTER COURSE
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-[#ffea79] mt-0.5">
                    Unlock Potential to Score 100% with AI Adaptive Quizzes
                  </p>

                  {/* Live Enrolled Student Pill */}
                  <div className="mt-3.5 bg-black/40 backdrop-blur-md rounded-full px-3.5 py-1 text-[11px] text-white flex items-center space-x-2 border border-white/10 w-fit max-w-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                    <span className="truncate font-semibold">{LIVE_ENROLLMENTS[tickerIndex]}</span>
                  </div>

                  {/* Bullet Highlights + AI Engine Badge */}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="space-y-2 text-xs font-black">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#ffe066] text-sm leading-none">▶</span>
                        <span>Maths, Science &amp; Olympiads (Class 1-12)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#ffe066] text-sm leading-none">▶</span>
                        <span>12,000+ Curated Question Bank</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#ffe066] text-sm leading-none">▶</span>
                        <span>50+ Solving Skills &amp; Shortcut Hacks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#ffe066] text-sm leading-none">▶</span>
                        <span>24/7 Nova AI 3.5 Flash Lite Socratic Tutor</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-amber-200 font-black text-center p-1.5 leading-none">
                        <Sparkles className="w-6 h-6 text-amber-300 mb-1 fill-amber-300" />
                        <span className="text-[11px] text-white font-black">AI QUIZ</span>
                        <span className="text-[9px] text-amber-200 font-mono mt-0.5">24/7 ACCESS</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom White Arch Rating Badge */}
                  <div className="mt-6 -mb-8 mx-auto w-fit">
                    <div className="bg-white text-[#f95a00] font-black text-xs px-6 py-2 rounded-full shadow-lg border border-orange-100 tracking-wider flex items-center gap-1.5">
                      <span className="text-amber-500 font-bold">★</span>
                      <span>4.8 Positive Review (4,000+ Students)</span>
                    </div>
                  </div>
                </div>

                {/* Highly Rated by Parents & Students Mini-Cards */}
                <div className="px-6 pt-10 pb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Recent Verified Student Reviews
                    </h3>
                    <button
                      onClick={() => setShowAllReviewsModal(true)}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Read All 2,400+ →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {REVIEWS_POOL.slice(0, 2).map(r => (
                      <div key={r.id} className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center ${r.avatarBg}`}>
                              {r.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800">{r.name}</span>
                            <span className="text-[10px] text-slate-400">({r.role})</span>
                          </div>
                          <div className="flex text-amber-400 text-[10px]">
                            {'★'.repeat(r.stars)}
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          &quot;{r.text}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Guarantee Strip */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 text-xs flex items-center justify-between text-slate-600">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>60-Day Full Scholar Term Access</span>
                </span>
                <span className="font-bold text-slate-800">100% Curriculum Aligned</span>
              </div>
            </div>

            {/* RIGHT COLUMN (5 Cols): Class 1 to 12 Interactive Selector & Quick Enroll */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <div>
                {/* Special Price Box */}
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-orange-500/40 rounded-3xl p-5 mb-6 text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md animate-pulse">
                      Save 90%
                    </span>
                  </div>

                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 block">
                    Special 49 Scholar Pricing
                  </span>

                  <div className="mt-2 flex items-baseline justify-center space-x-3">
                    <span className="text-sm font-bold text-slate-400 line-through">
                      ₹499
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-[#f95a00]">
                      ₹49
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      / 60 Days
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Just ₹0.81 per day. Unlimited practice quizzes across all subjects.
                  </p>
                </div>

                {/* 1 to 12 Class Selector Tabs */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      1. Select Student Class (1 to 12)
                    </label>
                    <span className="text-[11px] font-bold text-indigo-600">
                      Selected: Class {selectedClass}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
                    {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as Grade[]).map(gradeNum => (
                      <button
                        key={gradeNum}
                        type="button"
                        onClick={() => setSelectedClass(gradeNum)}
                        className={`min-h-[44px] py-2.5 px-2 text-xs sm:text-sm font-black rounded-xl transition-all border text-center flex items-center justify-center ${
                          selectedClass === gradeNum
                            ? 'bg-[#f95a00] text-white border-[#f95a00] shadow-md scale-105'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Class {gradeNum}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Board Selection */}
                <div className="space-y-2 mb-6">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                    2. Select Education Board
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['CBSE', 'ICSE', 'STATE'] as Board[]).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBoard(b)}
                        className={`min-h-[44px] py-2 px-2 text-xs font-bold rounded-xl transition-all border text-center flex items-center justify-center ${
                          selectedBoard === b
                            ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {b} Board
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Class Specifics Pod */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2 mb-6 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{currentTheme.mascot.emoji}</span>
                    <div>
                      <span className="font-extrabold text-slate-900 block">Class {selectedClass} • {currentTheme.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{currentTheme.stageTitle}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium pt-1 border-t border-slate-200">
                    🎯 <strong>Curriculum Focus:</strong> {syllabus.tagline}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    📚 <strong>1,000 Questions:</strong> {syllabus.subjects.join(', ')}
                  </p>
                </div>
              </div>

              {/* Instant Claim CTA */}
              <div className="space-y-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 bg-gradient-to-r from-[#f95a00] to-[#ff7300] hover:from-[#e05000] hover:to-[#f95a00] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>CLAIM SPECIAL 49 OFFER (₹49)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-[10px] text-center text-slate-500 font-medium">
                  🔒 Safe 256-bit UPI Payment • Verified within 15–60 Mins (Instant with ACode Voucher)
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECTION 1 (IMAGE 1): TRUSTED NATIONWIDE - AI QUIZ     */}
      {/* ======================================================== */}
      <section className="py-12 px-4 bg-white border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="border border-emerald-300/80 bg-emerald-50/40 rounded-3xl p-6 sm:p-10 text-center shadow-sm relative overflow-hidden">
            <div className="inline-block px-5 py-1 rounded-full border border-emerald-400/80 bg-white text-slate-900 font-black text-[11px] uppercase tracking-widest mb-4 shadow-xs">
              TRUSTED NATIONWIDE
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              AI Quiz
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-xl mx-auto font-medium">
              Students across India achieving real academic progress with AcademicLevel.
            </p>

            {/* Live Interactive Sample Question for selected class */}
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-left shadow-md max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-mono font-bold text-emerald-600 uppercase">
                  Class {selectedClass} Sample AI Assessment
                </span>
                <span className="font-mono text-slate-400">
                  Adaptive Level 1
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                {syllabus.sampleQuestion.q}
              </h4>

              <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                <span className="font-bold text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Correct Answer: {syllabus.sampleQuestion.a}</span>
                </span>
                <p className="text-[11px] text-slate-600 pl-5">
                  💡 <strong>Nova AI Step Explanation:</strong> {syllabus.sampleQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SECTION 2 (IMAGE 2): IMMERSIVE & INTERACTIVE (6 CARDS) */}
      {/* ======================================================== */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Immersive &amp; Interactive Learning Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto font-medium">
            Supercharged with AI to provide a personalized journey for every student in Classes 1–12.
          </p>

          {/* 6 Cards Grid matching Screenshot 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10 text-left">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Nova AI Quizzes &amp; Agent
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Real-time AI quiz generation and smart study reports that identify learning gaps and guide improvement fast.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Interactive Quizzes
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Real-time online quizzes with multiple engaging interactive formats that keep students focused and motivated.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Abundant Rewards
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A rich reward system with learning coins to earn, turning every lesson and quiz challenge into a fun game.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                All Subjects. One Platform.
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Explore class-based learning, complete course levels at your pace, and sync seamlessly with your school curriculum.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Progress Tracking
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Full-scale session, weekly, and monthly study tracking to monitor quiz activity and milestone achievements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Certificates &amp; Rewards
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Celebrate completed learning milestones with official printable certificates and redeem exciting items in the Coin Store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECTION 3 (IMAGE 3): MOST ADVANCED AI QUIZ (4 STATS) */}
      {/* ======================================================== */}
      <section className="py-16 px-4 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Most ADVANCED AI QUIZ Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto font-medium">
            Our quizzes aren&apos;t just any basic quizzes; they are ai leaders from AI&apos;s most prestigious models.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-10">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block font-mono">
                2+
              </span>
              <span className="text-xs text-slate-600 mt-2 block font-semibold">
                AI Support
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block font-mono">
                99%^
              </span>
              <span className="text-xs text-slate-600 mt-2 block font-semibold">
                AI &amp; Question Bank Available 24/7
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block font-mono">
                12,000+
              </span>
              <span className="text-xs text-slate-600 mt-2 block font-semibold">
                Preloaded questions across Cls 1–12 in case AI doesn&apos;t work.
              </span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 block font-mono">
                98%
              </span>
              <span className="text-xs text-slate-600 mt-2 block font-semibold">
                Positive Rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. SECTION 4 (IMAGE 4): WIDELY PRAISED BY STUDENTS       */}
      {/* ======================================================== */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Widely Praised by Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto font-medium">
            Hear from our community with AcademicLevel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 text-left">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &quot;AcademicLevel makes learning so fun! 🎉 I aced my test thanks to the quizzes!&quot;
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                — Student
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &quot;Best platform ever! Nova AI is awesome and course content syncs perfectly with school.&quot;
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                — Parent
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                &quot;Improved learning initiative, no longer need parental supervision. My secret to success 🚀&quot;
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                — Grade 8 Student
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setShowAllReviewsModal(true)}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-white border border-emerald-400 text-emerald-700 font-extrabold text-xs rounded-full shadow-xs hover:bg-emerald-50 transition-all"
            >
              <span>Community reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. MORE & MORE INFO: COMPARISON & DAILY ROUTINE          */}
      {/* ======================================================== */}
      <section className="py-16 px-4 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-full uppercase tracking-wider">
              Smart Parent Decision
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
              Why Parents Choose AcademicLevel Over ₹3,000/mo Tuition
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              See why 4,000+ Indian families switched to self-paced AI mastery.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-4 font-bold border-b border-slate-200">Feature Comparison</th>
                  <th className="p-4 font-bold border-b border-slate-200 text-slate-500">Typical Offline Coaching</th>
                  <th className="p-4 font-bold border-b border-slate-200 text-[#f95a00] bg-orange-50/60">AcademicLevel (Special 49 Offer)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-4 font-bold text-slate-900">Cost &amp; Affordability</td>
                  <td className="p-4 text-slate-600">₹2,000 to ₹4,000 per month</td>
                  <td className="p-4 font-black text-emerald-700 bg-orange-50/30">Just ₹49 for 60 Days (₹0.81/day)</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Practice Question Bank</td>
                  <td className="p-4 text-slate-600">Limited worksheets (100–200 Qs)</td>
                  <td className="p-4 font-black text-emerald-700 bg-orange-50/30">12,000+ Class-wise Verified Questions</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Doubt Clearing Availability</td>
                  <td className="p-4 text-slate-600">Fixed 1-hour batch slots only</td>
                  <td className="p-4 font-black text-emerald-700 bg-orange-50/30">24/7 Nova AI 3.5 Flash Lite Socratic Tutor</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Gamification &amp; Motivation</td>
                  <td className="p-4 text-slate-600">Rote homework pressure</td>
                  <td className="p-4 font-black text-emerald-700 bg-orange-50/30">Study Coins, Streak Freeze &amp; Real Gift Cards</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Certification &amp; Validation</td>
                  <td className="p-4 text-slate-600">None or basic paper slips</td>
                  <td className="p-4 font-black text-emerald-700 bg-orange-50/30">Official Verifiable Digital Certificates</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. MORE & MORE INFO: FREQUENTLY ASKED QUESTIONS (FAQ)    */}
      {/* ======================================================== */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions (Special 49 Offer)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Everything you need to know about the Special 49 Offer.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Is this really ₹49 or will I be charged recurring fees?',
                a: 'Zero hidden fees and no automatic recurring debit! You pay a single one-time payment of ₹49 which gives full 60-day access to your chosen class and board.'
              },
              {
                q: 'Which classes are supported in this offer?',
                a: 'All classes from Class 1 all the way to Class 12 are supported across CBSE, ICSE, and State Board curriculums.'
              },
              {
                q: 'Which devices can my child use?',
                a: 'AcademicLevel is web-based and responsive. It works seamlessly on any Android phone, iPhone, iPad, tablet, Windows laptop, or desktop with Chrome or Safari.'
              },
              {
                q: 'How do the coins and gift card rewards work?',
                a: 'Students earn study coins for completing daily quizzes, maintaining study streaks, and answering Question of the Day. Active Lite scholars can redeem their coins for genuine ₹20 digital gift cards (Amazon Pay, Google Play, etc.) in the Gift Store.'
              },
              {
                q: 'How do I pay and how quickly is my account activated?',
                a: 'Click "Claim Special 49 Offer (₹49)", register with your parent mobile or email, and pay via any UPI app (GPay, PhonePe, Paytm, BHIM) or QR scan. Submit your 12-digit UTR reference for swift human verification (usually within 15–60 minutes). If you have an authorized institutional ACode voucher, activation is instant.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-orange-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. STICKY BOTTOM ENROLLMENT BAR                          */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-30 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <span className="text-[10px] font-mono text-orange-600 font-bold block uppercase">Special 49 Offer</span>
              <span className="text-xs font-black text-slate-900">Classes 1–12 • Full 60 Days Access</span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xs text-slate-400 line-through font-bold">₹499</span>
              <span className="text-2xl font-black text-[#f95a00]">₹49</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-[#f95a00] to-[#ff7300] hover:from-[#e05000] hover:to-[#f95a00] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 flex items-center space-x-1.5"
          >
            <span>ENROLL NOW FOR ₹49</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-16" />

      {/* ======================================================== */}
      {/* MODAL 1: QUICK ENROLLMENT FORM                           */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider rounded-full inline-block mb-2">
                Special 49 Offer
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Unlock Class {selectedClass} Access
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Special ₹49 for 60 Days • Original ₹499 (90% OFF)
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95a00]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent Mobile Number or Email *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or parent@gmail.com"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95a00]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Account Password *</label>
                  <span className="text-[10px] text-slate-400 font-normal">Min. 6 characters</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password for student login"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95a00] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class</label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(Number(e.target.value) as Grade)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-[#f95a00]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Board</label>
                  <select
                    value={selectedBoard}
                    onChange={e => setSelectedBoard(e.target.value as Board)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-[#f95a00]"
                  >
                    <option value="CBSE">CBSE Board</option>
                    <option value="ICSE">ICSE Board</option>
                    <option value="STATE">State Board</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#f95a00]"
                />
              </div>

              {/* Authentic reCAPTCHA v2 Widget */}
              <div className="pt-2">
                <ReCaptchaWidget
                  isVerified={captchaVerified}
                  onVerify={verified => {
                    setCaptchaVerified(verified);
                    if (verified) {
                      setCaptchaError(false);
                      if (errorMessage.includes('robot')) {
                        setErrorMessage('');
                      }
                    }
                  }}
                  hasError={captchaError}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#f95a00] to-[#ff7300] hover:from-[#e05000] hover:to-[#f95a00] text-white font-black text-sm rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <span>{isSubmitting ? 'Registering...' : 'PROCEED TO PAY ₹49 (UPI / QR)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: 1-CLICK UPI QR CHECKOUT                         */}
      {/* ======================================================== */}
      {showUpiCheckout && createdLearnerId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-200 my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowUpiCheckout(false);
                onSuccessRegistered();
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <UPIQRCheckout
              planTier="LITE"
              learnerId={createdLearnerId}
              onBack={() => {
                setShowUpiCheckout(false);
                onSuccessRegistered();
              }}
              onSuccess={() => {
                setShowUpiCheckout(false);
                onSuccessRegistered();
              }}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ALL COMMUNITY REVIEWS                          */}
      {/* ======================================================== */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowAllReviewsModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <h3 className="text-xl font-black text-slate-900">
                Community Reviews &amp; Praise
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic feedback from students and parents across Classes 1–12.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {REVIEWS_POOL.map(r => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center ${r.avatarBg}`}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{r.name}</span>
                        <span className="text-[10px] text-slate-400">{r.role} • {r.date}</span>
                      </div>
                    </div>
                    <div className="text-amber-400 text-xs">
                      {'★'.repeat(r.stars)}
                    </div>
                  </div>
                  <p className="text-slate-600 mt-2 leading-relaxed">
                    &quot;{r.text}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
