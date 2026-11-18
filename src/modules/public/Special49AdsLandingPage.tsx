import React, { useState, useEffect, useRef } from 'react';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { KidFounderGlazeShowcase } from '../shared/KidFounderGlazeShowcase';
import { SiteConfigService } from '../../services/siteConfigService';
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
  EyeOff,
  QrCode,
  Copy,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { PaymentService } from '../../services/paymentService';
import { UTRValidator } from '../../core/security/utrValidator';
import { UPIQRCheckout } from '../student/UPIQRCheckout';
import { CLASS_THEMES } from '../../core/theme/classThemes';
import { Grade, Board } from '../../core/types';
import { ReCaptchaWidget } from '../shared/ReCaptchaWidget';
import { WhatsDifferentFromChatGPT } from '../shared/WhatsDifferentFromChatGPT';

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
    role: 'Parent of Student (Bhubaneswar)',
    date: '08 Nov 2026',
    stars: 5,
    avatarBg: 'bg-amber-600',
    text: 'It is really good because the adaptive AI quizzes explain every maths and science concept so nicely and energetic!!! Best Choice ever to join ACADEMIC LEVEL!! My son used to struggle with fractions and problem sums, but the 50+ solving skills and AI practice tests made him score 98% in his school exams!'
  },
  {
    id: 'nibedita-1',
    name: 'Nibedita',
    role: 'Parent of Student (Bhubaneswar)',
    date: '05 Nov 2026',
    stars: 5,
    avatarBg: 'bg-emerald-600',
    text: "It's very good learning app for children.. the AI quizzes keep my daughter completely disciplined. She can practice anytime 24/7 at her own pace and topics are also too good .... Worth 10x more than ₹49!"
  },
  {
    id: 'shaymin-1',
    name: 'Shaymin',
    role: 'Student Scholar',
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
  'Sneha from Mumbai enrolled in Foundation Course (Special 49 Offer)',
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
  const { currentLearner, isAuthenticated, registerStudent, loginStudent } = useAuth();

  const [selectedClass, setSelectedClass] = useState<Grade>(5);
  const [selectedBoard, setSelectedBoard] = useState<Board>('CBSE');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(847);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [adsConfig, setAdsConfig] = useState(() => SiteConfigService.getAds());
  const [selectedPlanTier, setSelectedPlanTier] = useState<'LITE' | 'PLUS' | 'GOLD'>('GOLD');
  const [noticeLang, setNoticeLang] = useState<'EN' | 'HINGLISH'>('EN');

  useEffect(() => {
    return SiteConfigService.subscribe(() => {
      setAdsConfig(SiteConfigService.getAds());
    });
  }, []);

  // Quick enroll & QR checkout states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'PAY_QR' | 'REGISTER' | 'LOGIN'>('PAY_QR');
  const [studentName, setStudentName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parentName, setParentName] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [submittedUtr, setSubmittedUtr] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [showUpiCheckout, setShowUpiCheckout] = useState(false);
  const [createdLearnerId, setCreatedLearnerId] = useState<string | null>(null);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [showPostPaymentPopup, setShowPostPaymentPopup] = useState(false);
  const utrInputRef = useRef<HTMLInputElement>(null);
  const modalUtrInputRef = useRef<HTMLInputElement>(null);

  const handleUpiAppTap = () => {
    try {
      const nowStr = Date.now().toString();
      sessionStorage.setItem('al_pending_account_after_pay', 'true');
      sessionStorage.setItem('al_pay_clicked_time', nowStr);
    } catch {}
  };

  useEffect(() => {
    const checkAndShowReturnPopup = () => {
      try {
        const isPending = sessionStorage.getItem('al_pending_account_after_pay') === 'true';
        const tappedTime = Number(sessionStorage.getItem('al_pay_clicked_time') || 0);
        const elapsed = Date.now() - tappedTime;

        // ONLY trigger if the user actually clicked the Pay Now button and returned within 30 minutes!
        if (isPending && elapsed < 30 * 60 * 1000) {
          // Immediately consume the flag so it only triggers this single time upon clicking back
          sessionStorage.removeItem('al_pending_account_after_pay');
          sessionStorage.removeItem('al_pay_clicked_time');
          setShowPostPaymentPopup(true);
        } else if (isPending && elapsed >= 30 * 60 * 1000) {
          sessionStorage.removeItem('al_pending_account_after_pay');
          sessionStorage.removeItem('al_pay_clicked_time');
        }
      } catch {}
    };

    // Check immediately on mount in case WebView / browser reloaded or restored when clicking back
    checkAndShowReturnPopup();

    const handleReturnToTab = () => {
      if (document.visibilityState === 'visible') {
        checkAndShowReturnPopup();
      }
    };

    document.addEventListener('visibilitychange', handleReturnToTab);
    window.addEventListener('focus', checkAndShowReturnPopup);
    window.addEventListener('pageshow', checkAndShowReturnPopup);

    return () => {
      document.removeEventListener('visibilitychange', handleReturnToTab);
      window.removeEventListener('focus', checkAndShowReturnPopup);
      window.removeEventListener('pageshow', checkAndShowReturnPopup);
    };
  }, []);

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

  const officialVpa = PaymentService.OFFICIAL_UPI_VPA;
  const officialPayeeName = PaymentService.OFFICIAL_MERCHANT_NAME;
  const activeAmount = selectedPlanTier === 'GOLD' ? 205 : (selectedPlanTier === 'PLUS' ? 129 : Number(adsConfig.offerPriceInr || 49));
  const activeDurationDays = selectedPlanTier === 'GOLD' ? 365 : (selectedPlanTier === 'PLUS' ? 180 : 60);
  const activePlanName = selectedPlanTier === 'GOLD'
    ? 'AcademicLevel Gold Pass (365 Days / 1 Full Year)'
    : (selectedPlanTier === 'PLUS' ? 'AcademicLevel Plus (180 Days / 6 Months)' : 'AcademicLevel Lite (60 Days)');
  const activeOrderNote = `Order_AL_${selectedPlanTier === 'GOLD' ? '205' : (selectedPlanTier === 'PLUS' ? '129' : '49')}_${(currentLearner?.id || 'guest').slice(-6)}`;
  const offerAmount = activeAmount;
  const upiUri = PaymentService.buildStandardUpiUri({
    amount: activeAmount,
    note: activeOrderNote
  });

  // Pre-fill payer details if student is already logged in
  useEffect(() => {
    if (currentLearner) {
      if (!studentName) setStudentName(currentLearner.fullName || '');
      if (!emailOrPhone) setEmailOrPhone(currentLearner.phone || currentLearner.email || '');
      if (!payerUpiId && currentLearner.phone) {
        setPayerUpiId(`${currentLearner.phone.replace(/[^0-9]/g, '')}@upi`);
      }
    }
  }, [currentLearner]);

  const copyVpa = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(officialVpa);
    }
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleScrollToQr = () => {
    const el = document.getElementById('instant-pay-qr');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsModalOpen(true);
    }
  };

  const handleDirectPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPayer = (payerUpiId || emailOrPhone || '').trim();

    const cleanUtr = utrNumber.trim();
    if (cleanUtr && cleanUtr.length === 12) {
      const valResult = UTRValidator.validateFormat(cleanUtr);
      if (!valResult.isValid) {
        setErrorMessage(valResult.message);
        return;
      }
    }

    if (!currentLearner && (!password || password.trim().length < 6)) {
      setErrorMessage('Please create an account password (minimum 6 characters) so you can log into your student account anytime.');
      return;
    }

    setIsSubmitting(true);
    try {
      let targetLearnerId = currentLearner?.id;

      // If user is unauthenticated, auto-register or resolve learner account in place
      if (!targetLearnerId) {
        const cleanInput = (emailOrPhone.trim() || cleanPayer).toLowerCase();
        const targetEmail = cleanInput.includes('@') && !cleanInput.endsWith('@upi')
          ? cleanInput
          : `${cleanInput.replace(/[^0-9]/g, '') || 'special49'}@special49.academiclevel.in`;

        const existing = StorageRLSLayer.getLearnerByEmail(targetEmail);
        if (existing) {
          targetLearnerId = existing.id;
          if (password.trim()) {
            await loginStudent(targetEmail, password.trim()).catch(() => {});
          }
        } else {
          const regRes = await registerStudent({
            fullName: studentName.trim() || `Class ${selectedClass} Scholar`,
            email: targetEmail,
            password: password.trim(),
            board: selectedBoard,
            grade: selectedClass,
            parentName: parentName.trim() || 'Parent'
          });
          if (regRes.success) {
            const s = StorageRLSLayer.getCurrentSession();
            targetLearnerId = s?.learnerId;
          }
        }
      }

      const finalId = targetLearnerId || currentLearner?.id || `lrn_special49_${Date.now()}`;

      const res = await PaymentService.activateGatewayPayment(
        finalId,
        selectedPlanTier,
        cleanUtr || undefined
      );

      setIsSubmitting(false);
      if (res.success) {
        setSubmittedUtr(cleanUtr || 'UPI-PG-ACTIVE');
        setPaymentSuccess(true);
      } else {
        setErrorMessage(res.error || 'Payment activation failed. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Payment submission anomaly.');
    }
  };

  // Legacy enrollment submit fallback (for account creation mode if selected)
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanInput = emailOrPhone.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (modalMode === 'LOGIN') {
      if (!cleanInput) {
        setErrorMessage('Please enter your registered mobile number or email.');
        return;
      }
      if (!cleanPassword || cleanPassword.length < 6) {
        setErrorMessage('Please enter your account password (at least 6 characters).');
        return;
      }

      const loginEmail = cleanInput.includes('@')
        ? cleanInput
        : `${cleanInput.replace(/[^0-9]/g, '') || 'special'}@special49.academiclevel.in`;

      setIsSubmitting(true);
      try {
        const res = await loginStudent(loginEmail, cleanPassword);
        setIsSubmitting(false);
        if (res.success) {
          setModalMode('PAY_QR');
          setErrorMessage('');
        } else {
          setErrorMessage(res.error || 'Login failed. Please check your credentials.');
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Login failed.');
      }
      return;
    }

    // Modal Mode: REGISTER
    if (!studentName.trim()) {
      setErrorMessage('Please enter student full name.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage('Please create an account password of at least 6 characters.');
      return;
    }

    const email = cleanInput.includes('@')
      ? cleanInput
      : `${cleanInput.replace(/[^0-9]/g, '') || 'special'}@special49.academiclevel.in`;

    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        fullName: studentName.trim(),
        email,
        password: cleanPassword,
        board: selectedBoard,
        grade: selectedClass,
        parentName: parentName.trim() || 'Parent'
      });

      setIsSubmitting(false);
      if (res.success) {
        setModalMode('PAY_QR');
        setErrorMessage('');
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

      {/* Authenticated Student Banner (Additional Module requirement) */}
      {isAuthenticated && currentLearner && (
        <div className="bg-indigo-950 text-indigo-100 px-4 py-2.5 text-xs border-b border-indigo-800 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Signed in as <strong>{currentLearner.fullName}</strong> ({currentLearner.email})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onSuccessRegistered}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-colors"
            >
              Go to Scholar Workspace →
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP STICKY SPECIAL 49 & 129 OFFER PROMO BAR           */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white px-3 sm:px-6 py-2.5 shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[11px] tracking-wide uppercase flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>👑 1-Year Gold Deal</span>
            </span>
            <span className="font-extrabold hidden md:inline">
              ⚡ Starts at ₹49 | 👑 1-YEAR GOLD PLAN (365 DAYS / 1 FULL YEAR) FOR JUST ₹205 — BEST VALUE (~56 PAISE/DAY)!
            </span>
            <span className="font-bold md:hidden">
              👑 ₹205 (365 Days / 1 Year) • ~56 Paise/Day!
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <div className="flex items-center space-x-1 bg-black/25 px-2.5 py-0.5 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Offer Closes In: {formatCountdown(secondsRemaining)}</span>
            </div>

            <button
              onClick={handleScrollToQr}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1 rounded-full text-xs shadow transition-all hover:scale-105 cursor-pointer flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Claim Gold Pass (₹205 ↗)</span>
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
                    {adsConfig.mainHeading || 'CONCEPT BOOSTER COURSE'}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-[#ffea79] mt-0.5">
                    {adsConfig.subHeading || 'Unlock Potential to Score 100% with AI Adaptive Quizzes'}
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
                      <span>4.8 Star Rated by Parents &amp; Students</span>
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
                      Read Verified Reviews →
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
                {/* 3-PLAN SELECTOR IN HERO: ₹49 vs ₹129 vs 👑 ₹205 (SCREAMING 205 GOLD IS MAXIMUM VALUE) */}
                <div className="mb-6 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-800 flex items-center gap-1.5">
                      <span>Choose Scholar Pass</span>
                    </span>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                      👑 ₹205 IS 1-YEAR BEST VALUE
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Option 1: ₹49 Lite */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTier('LITE')}
                      className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                        selectedPlanTier === 'LITE'
                          ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-400 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className="text-[9px] font-black uppercase tracking-wider text-orange-800">
                        60D (Lite)
                      </div>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black text-slate-900">₹49</span>
                        <span className="text-[10px] text-slate-400 line-through">₹499</span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-medium mt-0.5 leading-tight">
                        ~₹24.50/mo
                      </p>
                    </button>

                    {/* Option 2: ₹129 Plus */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTier('PLUS')}
                      className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                        selectedPlanTier === 'PLUS'
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className="text-[9px] font-black uppercase tracking-wider text-emerald-800">
                        180D (Plus)
                      </div>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black text-emerald-950">₹129</span>
                        <span className="text-[10px] text-slate-400 line-through">₹1,299</span>
                      </div>
                      <p className="text-[9px] text-emerald-800 font-bold mt-0.5 leading-tight">
                        ~₹21.50/mo
                      </p>
                    </button>

                    {/* Option 3: 👑 ₹205 Gold (HEAVY SPOTLIGHT & VALUE CALLOUT) */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTier('GOLD')}
                      className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                        selectedPlanTier === 'GOLD'
                          ? 'border-amber-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 ring-2 ring-amber-400 shadow-xl scale-[1.03]'
                          : 'border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-slate-800'
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[7px] px-1.5 py-0.5 rounded-bl-md uppercase tracking-widest shadow animate-pulse">
                        👑 BEST VALUE
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-amber-900">
                        365D (Gold)
                      </div>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black text-amber-950">₹205</span>
                        <span className="text-[10px] text-slate-400 line-through">₹2,499</span>
                      </div>
                      <p className="text-[9px] text-amber-900 font-black mt-0.5 leading-tight">
                        ~₹17/mo • 56p/day!
                      </p>
                    </button>
                  </div>

                  {/* Value Callout Box: Why Gold Screams Maximum Value */}
                  <div className="p-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-400/80 rounded-2xl text-[11px] text-slate-800 space-y-1 shadow-sm">
                    <div className="flex items-center justify-between font-black text-amber-950">
                      <span className="flex items-center gap-1">
                        <span>👑</span>
                        <span>WHY 89% OF TOPPERS PICK THE ₹205 GOLD PLAN:</span>
                      </span>
                      <span className="text-[10px] font-mono bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                        365 DAYS (1 YEAR)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-snug">
                      Pay just <strong>₹76 more than Plus</strong> to get <strong>185 EXTRA DAYS (Double your duration to 365 Days!)</strong>. That is <strong>less than 56 paise a day (~₹17.08/month)</strong>, covering your <strong>entire academic year</strong> from first day to final board exams with zero renewal stress!
                    </p>
                  </div>
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
                  onClick={handleScrollToQr}
                  className={`w-full py-4 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 cursor-pointer ${
                    selectedPlanTier === 'GOLD'
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
                      : (selectedPlanTier === 'PLUS'
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-[#f95a00] to-[#ff7300] hover:from-[#e05000] hover:to-[#f95a00] shadow-orange-500/30')
                  }`}
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>
                    {selectedPlanTier === 'GOLD'
                      ? 'CLAIM 365-DAY GOLD PASS (₹205) — BEST VALUE ↗'
                      : (selectedPlanTier === 'PLUS'
                        ? 'CLAIM 180-DAY PASS (₹129) — BEST VALUE ↗'
                        : `BUY NOW (₹${adsConfig.offerPriceInr || 49}) — 60-DAY PASS ↗`)}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-[10px] text-center text-slate-500 font-medium">
                  🔒 Official UPI PG Gateway • Instant Automated Activation (Zero Wait Time)
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2.25. DIRECT ON-PAGE ₹49, ₹129 & ₹205 UPI PG GATEWAY SECTION */}
      {/* ======================================================== */}
      <section id="instant-pay-qr" className="py-10 px-3 sm:px-6 bg-gradient-to-b from-orange-100/50 via-white to-slate-100 border-y-2 border-orange-400/50 scroll-mt-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white shadow-md mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Official ₹{offerAmount} UPI PG Gateway</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Plan &amp; Buy via Official UPI PG Gateway
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
              Choose your plan below, click BUY NOW to complete payment on UPI PG, then enter your details to get your subscription activated immediately!
            </p>
          </div>

          {/* Screaming Value Comparison Banner: 205 Gold vs 129 & 49 */}
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 ring-4 ring-amber-400/40">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300">
                  👑 89% OF TOPPERS &amp; PARENTS CHOOSE GOLD
                </span>
                <span className="text-[11px] font-bold text-amber-100">
                  365 DAYS (1 FULL YEAR) FOR JUST ₹205 — LESS THAN 56 PAISE/DAY!
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black">
                Why buy 60 Days for ₹49 or 180 Days for ₹129 when ₹205 gives 365 Full Days (Entire Year)?
              </h3>
              <p className="text-xs text-amber-100 font-medium max-w-xl">
                Pay just <strong>₹76 more than Plus</strong> to get <strong>185 EXTRA DAYS (Double your duration to 365 Days!)</strong>. That is only <strong>~₹17.08/month</strong> vs ₹24.50/mo on Lite. Covers your <strong>entire academic year (both terms, pre-boards, board exams &amp; summer!)</strong> with zero renewal interruptions!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlanTier('GOLD')}
              className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm shadow-xl transition-all hover:scale-105 cursor-pointer flex-shrink-0 flex items-center space-x-1.5 border border-amber-400"
            >
              <Sparkles className="w-4 h-4 fill-amber-300" />
              <span>Select ₹205 Gold (Best Value)</span>
            </button>
          </div>

          {/* BIG 3-OPTION PLAN SELECTOR: ₹49 vs ₹129 vs ₹205 */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1: ₹49 Concept Booster */}
            <button
              type="button"
              onClick={() => setSelectedPlanTier('LITE')}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                selectedPlanTier === 'LITE'
                  ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50/60 shadow-xl ring-2 ring-orange-400 scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-slate-300 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 mb-1.5">
                    Concept Booster (Lite)
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">₹49</span>
                    <span className="text-xs text-slate-400 line-through font-bold">₹499</span>
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wide">90% OFF</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  selectedPlanTier === 'LITE' ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300 text-transparent'
                }`}>
                  ✓
                </div>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2">60 Days Full Syllabus Access (~₹24.50/mo)</p>
              <ul className="text-[11px] text-slate-600 mt-2 space-y-1 font-medium">
                <li>✓ Full syllabus adaptive AI quiz for Classes 1–12</li>
                <li>✓ Nova AI interactive homework &amp; doubt solver</li>
                <li>✓ Milton Costa 1000 &amp; Steel Bottle reward redemptions</li>
              </ul>
            </button>

            {/* Option 2: ₹129 Term Mastery */}
            <button
              type="button"
              onClick={() => setSelectedPlanTier('PLUS')}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                selectedPlanTier === 'PLUS'
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/60 shadow-xl ring-2 ring-emerald-400 scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-slate-300 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 mb-1.5">
                    Term Mastery (Plus) • 180 Days
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-950">₹129</span>
                    <span className="text-xs text-slate-400 line-through font-bold">₹1,299</span>
                    <span className="text-[10px] font-black text-white bg-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wide">90% OFF</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  selectedPlanTier === 'PLUS' ? 'border-emerald-600 bg-emerald-600 text-white shadow' : 'border-slate-300 text-transparent'
                }`}>
                  ✓
                </div>
              </div>
              <p className="text-xs font-black text-emerald-900 mt-2">
                180 Days (Half Year) • ~₹21.50/Month (~₹0.71/day)
              </p>
              <ul className="text-[11px] text-slate-700 mt-2 space-y-1 font-semibold">
                <li>✓ Covers both midterm &amp; annual exam prep</li>
                <li>✓ 8,500 AI credits limit with priority speeds</li>
                <li>✓ Physical rewards store eligible</li>
              </ul>
            </button>

            {/* Option 3: 👑 ₹205 Gold Pass (SCREAMING MAXIMUM 1-YEAR VALUE) */}
            <button
              type="button"
              onClick={() => setSelectedPlanTier('GOLD')}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                selectedPlanTier === 'GOLD'
                  ? 'border-amber-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-2xl ring-4 ring-amber-400/60 scale-[1.02]'
                  : 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
              }`}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-md animate-pulse">
                👑 1-YEAR GOLD • BEST VALUE
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 mb-1.5">
                    Gold Master Pass • 365 Days
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl font-black text-amber-950">₹205</span>
                    <span className="text-xs text-slate-400 line-through font-bold">₹2,499</span>
                    <span className="text-[10px] font-black text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wide">92% OFF</span>
                  </div>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm mt-3 ${
                  selectedPlanTier === 'GOLD' ? 'border-amber-600 bg-amber-500 text-slate-950 shadow' : 'border-slate-300 text-transparent'
                }`}>
                  ✓
                </div>
              </div>
              <p className="text-xs font-black text-amber-900 mt-2">
                365 Days (1 Full Year) • <span className="underline decoration-amber-500 font-extrabold text-amber-800">Only ~₹17.08/Month</span> (~₹0.56/day — 56p/day!)
              </p>
              <ul className="text-[11px] text-slate-700 mt-2 space-y-1 font-semibold">
                <li className="text-amber-950 font-black">⭐ Pay just ₹76 more than Plus to double your days to 365!</li>
                <li>✓ Complete academic year: terms, pre-boards &amp; finals</li>
                <li>✓ VIP Priority for Pokémon, Milton &amp; Mystery Gift Box</li>
                <li>✓ Exclusive Gold Scholar Profile Badge &amp; Frame</li>
                <li>✓ Annual Master Certificate of Academic Excellence</li>
              </ul>
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-300 overflow-hidden p-6 sm:p-10 max-w-2xl mx-auto space-y-6">
            {/* Step 1: BUY NOW VIA UPI PG BUTTON (No QR) */}
            <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-300 text-center space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Step 1: Open Official Gateway</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  cit.org.in UPI PG
                </span>
              </div>

              {/* Payment Return Notice with English & Hinglish Toggle */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 space-y-2 text-left">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Payment Return Notice</span>
                  </div>
                  <div className="flex bg-amber-100/80 rounded-lg p-0.5 text-[10px] font-bold border border-amber-300 shrink-0">
                    <button
                      type="button"
                      onClick={() => setNoticeLang('EN')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'EN' ? 'bg-amber-600 text-white font-black' : 'text-amber-800 hover:text-black'}`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoticeLang('HINGLISH')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'HINGLISH' ? 'bg-amber-600 text-white font-black' : 'text-amber-800 hover:text-black'}`}
                    >
                      Hinglish
                    </button>
                  </div>
                </div>
                {noticeLang === 'EN' ? (
                  <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
                    ⚠️ <strong>AFTER you have paid in UPI PG</strong>, instead of being stuck on that page, <strong>CLICK back and return here</strong>, otherwise we will forget your payment as we track payments and accounts by the pay now button click.
                  </p>
                ) : (
                  <p className="text-[11px] leading-relaxed text-amber-900 font-medium">
                    ⚠️ <strong>UPI PG mein payment complete karne ke baad</strong>, wahan page par ruke rehne ke bajaye <strong>CLICK back karke yahan wapas aaiye</strong>, warna hum aapki payment bhool sakte hain kyunki hum payments aur accounts ko Pay Now button click ke through track karte hain.
                  </p>
                )}
              </div>

              <a
                href={PaymentService.getGatewayUrl(selectedPlanTier)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleUpiAppTap}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.01]"
              >
                <ExternalLink className="w-5 h-5" />
                <span>BUY NOW (₹{offerAmount}) — UPI PG ↗</span>
              </a>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-orange-200 text-[11px] font-mono text-slate-700">
                <span className="truncate pr-2">{PaymentService.getGatewayUrl(selectedPlanTier)}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(PaymentService.getGatewayUrl(selectedPlanTier));
                    }
                    setCopiedVpa(true);
                    setTimeout(() => setCopiedVpa(false), 2000);
                  }}
                  className="text-orange-600 font-bold text-[10px] hover:underline flex-shrink-0 cursor-pointer"
                >
                  {copiedVpa ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Step 2: AFTER PAYMENT DONE: CREATE ACCOUNT & ACTIVATE PASS */}
            {paymentSuccess ? (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
                  ✓
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-950">
                    Pass Activated Successfully! 🎉
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1 font-medium">
                    Your <strong>₹{offerAmount} {selectedPlanTier === 'PLUS' ? 'Term Mastery (180 Days / 6 Months)' : 'Concept Booster (60 Days)'}</strong> pass has been activated automatically via the official UPI PG gateway.
                  </p>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl p-3 text-left text-xs text-slate-700 space-y-1">
                  <p>🎓 <strong>Student:</strong> {studentName || 'Scholar'}</p>
                  <p>📱 <strong>Contact:</strong> {payerUpiId || emailOrPhone}</p>
                  <p>📚 <strong>Grade &amp; Board:</strong> Class {selectedClass} • {selectedBoard}</p>
                  <p>⏱️ <strong>Access Status:</strong> {selectedPlanTier === 'PLUS' ? 'Term Mastery Unlocked (180 Days / 6 Months)' : 'Concept Booster Unlocked (60 Days)'}</p>
                  <p>⚡ <strong>Gateway Status:</strong> ACTIVE (Instant Automated Activation)</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSuccessRegistered()}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                >
                  Go to Student Dashboard &amp; Start Learning
                </button>
              </div>
            ) : (
              <form onSubmit={handleDirectPaymentSubmit} className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block mb-0.5">
                    Step 2: Create Account &amp; Activate Pass
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    After paying on UPI PG, enter your details below to create your account and get your subscription instantly.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Parent Mobile / Email *</label>
                    <input
                      type="text"
                      required
                      placeholder="9861439460 or email@domain.com"
                      value={emailOrPhone}
                      onChange={e => setEmailOrPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 text-xs"
                    />
                  </div>
                </div>

                {!currentLearner ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Account Password *</label>
                      <span className="text-[10px] text-slate-400 font-normal">Min. 6 characters to log into your account</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create password for student login"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Connected Scholar Account:</span>
                      <span className="text-[11px] text-orange-800">{currentLearner.fullName} ({currentLearner.email})</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Logged In
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-900 mb-1 text-xs">
                    UPI PG Reference / UTR (Optional)
                  </label>
                  <input
                    ref={utrInputRef}
                    id="onpage-utr-input"
                    type="text"
                    placeholder="e.g. Transaction Ref from UPI PG receipt (optional)"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{isSubmitting ? 'Activating Subscription...' : `I HAVE PAID ₹${offerAmount} — ACTIVATE MY SUBSCRIPTION`}</span>
                </button>

                <p className="text-[10px] text-center text-slate-500 font-medium">
                  🔒 Official UPI PG Gateway • Zero Manual Admin Delay • Instant Access Granted
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2.5. IIT BOMBAY & 9X CERTIFIED STUDENT DEVELOPER GLAZE    */}
      {/* ======================================================== */}
      <section className="py-10 px-3 sm:px-6 bg-slate-100/60">
        <div className="max-w-6xl mx-auto">
          <KidFounderGlazeShowcase theme="light" variant="full" />
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
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <StudyCoinIcon className="w-7 h-7" glow />
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
                  <td className="p-4 font-black text-emerald-700 bg-orange-50/30">
                    <span className="flex items-center gap-1.5">
                      <StudyCoinIcon className="w-4 h-4 flex-shrink-0" glow />
                      <span>Study Coins, Streak Freeze &amp; Real Gift Cards</span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">Certification &amp; Validation</td>
                  <td className="p-4 text-slate-600">None or basic paper slips</td>
                  <td className="p-4 font-black text-emerald-700 bg-orange-50/30">Official Verifiable Digital Certificates</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* WHAT'S DIFFERENT FROM CHATGPT SECTION */}
          <div className="mt-12">
            <WhatsDifferentFromChatGPT
              mode="STUDENT_PARENT"
              onCtaClick={handleScrollToQr}
            />
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
                q: 'How do coins and physical product rewards work?',
                a: 'Students earn study coins for completing daily quizzes, maintaining study streaks, and answering Question of the Day. Active scholars can redeem coins for physical merchandise (Pokémon stationery sets, slow-rising squishies, dart blasters, Milton bottles, Pokémon Mewtwo badges, and Mystery Gift Boxes) delivered straight to your doorstep.'
              },
              {
                q: 'How do I pay and how quickly is my account activated?',
                a: 'Click "Claim Special 49 Offer (₹49)", pay securely via the official UPI PG gateway link or dynamic QR scan, and click activate. Your pass unlocks automatically with zero waiting time!'
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
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 sm:px-4 py-2.5 z-30 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick 49 vs 129 vs 205 Selector Pill */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedPlanTier('LITE')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedPlanTier === 'LITE'
                    ? 'bg-orange-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₹49 (60D)
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlanTier('PLUS')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedPlanTier === 'PLUS'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <span>₹129 (180D)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlanTier('GOLD')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer relative ${
                  selectedPlanTier === 'GOLD'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black ring-1 ring-amber-400'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                <span>👑 ₹205 (365D Gold 🔥)</span>
              </button>
            </div>

            <div className="hidden sm:block">
              <span className={`text-[10px] font-mono font-bold block uppercase ${
                selectedPlanTier === 'GOLD'
                  ? 'text-amber-600'
                  : (selectedPlanTier === 'PLUS' ? 'text-emerald-600' : 'text-slate-500')
              }`}>
                {selectedPlanTier === 'GOLD'
                  ? '👑 365 Days (1 Full Year) • ~56 Paise/Day!'
                  : (selectedPlanTier === 'PLUS' ? '⭐ 180 Days (6 Months) • Best Academic Value' : 'Concept Booster')}
              </span>
              <span className="text-xs font-black text-slate-900">
                {selectedPlanTier === 'GOLD'
                  ? 'Classes 1–12 • Full Year (~₹17.08/mo)'
                  : (selectedPlanTier === 'PLUS' ? 'Classes 1–12 • Full 6 Months (~₹21.50/mo)' : 'Classes 1–12 • Full 60 Days')}
              </span>
            </div>
          </div>

          <button
            onClick={handleScrollToQr}
            className={`px-4 sm:px-6 py-2.5 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all hover:scale-105 flex items-center space-x-1.5 cursor-pointer ${
              selectedPlanTier === 'GOLD'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30'
                : (selectedPlanTier === 'PLUS'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-[#f95a00] to-[#ff7300] hover:from-[#e05000] hover:to-[#f95a00] shadow-orange-500/30')
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {selectedPlanTier === 'GOLD'
                ? 'BUY 365-DAY GOLD PASS (₹205) — BEST VALUE ↗'
                : (selectedPlanTier === 'PLUS'
                  ? 'BUY 180-DAY PASS (₹129) — BEST VALUE ↗'
                  : `BUY 60-DAY PASS (₹${offerAmount}) ↗`)}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-16" />

      {/* ======================================================== */}
      {/* MODAL 1: QUICK ENROLLMENT & INSTANT UPI QR CHECKOUT      */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider rounded-full inline-block mb-2">
                Special Offer • Classes 1–12
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {modalMode === 'PAY_QR'
                  ? `Instant ₹${offerAmount} UPI Checkout`
                  : modalMode === 'REGISTER'
                  ? `Unlock Class ${selectedClass} Access`
                  : 'Sign In to Your Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {modalMode === 'PAY_QR'
                  ? 'Pay securely via official UPI PG gateway or QR code for instant activation'
                  : modalMode === 'REGISTER'
                  ? `Special ₹${offerAmount} Pass • 90% Discounted`
                  : 'Enter your credentials to continue your syllabus practice'}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setModalMode('PAY_QR');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
                  modalMode === 'PAY_QR'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pay via QR (₹{offerAmount})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalMode('REGISTER');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  modalMode === 'REGISTER'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalMode('LOGIN');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  modalMode === 'LOGIN'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
                {modalMode === 'REGISTER' && errorMessage.toLowerCase().includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('LOGIN');
                      setErrorMessage('');
                      setPassword('');
                    }}
                    className="w-full py-1.5 px-3 bg-orange-600 text-white rounded-lg font-bold text-center block shadow hover:bg-orange-700 transition-colors"
                  >
                    Account already exists! Click here to Sign In
                  </button>
                )}
              </div>
            )}

            {modalMode === 'PAY_QR' ? (
              paymentSuccess ? (
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-xl shadow-lg">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950">
                      Payment Submitted Successfully!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1">
                      UTR: <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-950">{submittedUtr}</strong>
                    </p>
                  </div>
                  <div className="bg-white border border-emerald-200 rounded-xl p-3 text-left text-xs text-slate-700 space-y-1">
                    <p>🎓 <strong>Student:</strong> {studentName || 'Scholar'}</p>
                    <p>📚 <strong>Plan:</strong> {selectedPlanTier === 'GOLD' ? '₹205 Gold Pass (365 Days / 1 Year)' : (selectedPlanTier === 'PLUS' ? '₹129 Term Mastery (180 Days / 6 Months)' : '₹49 Concept Booster (60 Days)')}</p>
                    <p>✅ <strong>Status:</strong> ACTIVE (Instant UPI Gateway Verified)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      onSuccessRegistered();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition-all"
                  >
                    Continue to Student Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Quick Plan Switcher inside Modal */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTier('LITE')}
                      className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selectedPlanTier === 'LITE'
                          ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <div className="text-[9px] uppercase font-black tracking-wider text-orange-700">60 Days</div>
                      <div className="text-xs sm:text-sm font-black">₹49 <span className="text-[9px] text-slate-400 line-through font-normal">₹499</span></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTier('PLUS')}
                      className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selectedPlanTier === 'PLUS'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-md ring-1 ring-emerald-400'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <div className="text-[9px] uppercase font-black tracking-wider text-emerald-800">180 Days</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-950">₹129 <span className="text-[9px] text-slate-400 line-through font-normal">₹1,299</span></div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlanTier('GOLD')}
                      className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden ${
                        selectedPlanTier === 'GOLD'
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-md ring-2 ring-amber-400'
                          : 'border-amber-300 bg-amber-50/50 text-slate-700'
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[7px] font-black px-1 py-0.2 rounded-bl-sm uppercase tracking-wider animate-pulse">
                        👑 BEST
                      </div>
                      <div className="text-[9px] uppercase font-black tracking-wider text-amber-900">365D Gold</div>
                      <div className="text-xs sm:text-sm font-black text-amber-950">₹205 <span className="text-[9px] text-slate-400 line-through font-normal">₹2,499</span></div>
                      <div className="text-[8px] text-amber-800 font-bold">~56p/day!</div>
                    </button>
                  </div>

                  {/* Direct UPI PG Gateway Action (No QR) */}
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center space-y-2">
                    {/* Payment Return Notice with English & Hinglish Toggle */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 space-y-1.5 text-left mb-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="text-[11px]">Payment Return Notice</span>
                        </div>
                        <div className="flex bg-amber-100/80 rounded-lg p-0.5 text-[9px] font-bold border border-amber-300 shrink-0">
                          <button
                            type="button"
                            onClick={() => setNoticeLang('EN')}
                            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'EN' ? 'bg-amber-600 text-white font-black' : 'text-amber-800 hover:text-black'}`}
                          >
                            English
                          </button>
                          <button
                            type="button"
                            onClick={() => setNoticeLang('HINGLISH')}
                            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'HINGLISH' ? 'bg-amber-600 text-white font-black' : 'text-amber-800 hover:text-black'}`}
                          >
                            Hinglish
                          </button>
                        </div>
                      </div>
                      {noticeLang === 'EN' ? (
                        <p className="text-[10px] leading-relaxed text-amber-900 font-medium">
                          ⚠️ <strong>AFTER you have paid in UPI PG</strong>, instead of being stuck on that page, <strong>CLICK back and return here</strong>, otherwise we will forget your payment as we track payments and accounts by the pay now button click.
                        </p>
                      ) : (
                        <p className="text-[10px] leading-relaxed text-amber-900 font-medium">
                          ⚠️ <strong>UPI PG mein payment complete karne ke baad</strong>, wahan page par ruke rehne ke bajaye <strong>CLICK back karke yahan wapas aaiye</strong>, warna hum aapki payment bhool sakte hain kyunki hum payments aur accounts ko Pay Now button click ke through track karte hain.
                        </p>
                      )}
                    </div>

                    <a
                      href={PaymentService.getGatewayUrl(selectedPlanTier)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleUpiAppTap}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>BUY NOW (₹{offerAmount}) — UPI PG ↗</span>
                    </a>
                    <div className="w-full bg-white/90 px-3 py-1.5 rounded-lg border border-orange-200 flex items-center justify-between text-[11px] font-mono text-slate-700">
                      <span className="truncate pr-2">{PaymentService.getGatewayUrl(selectedPlanTier)}</span>
                      <a
                        href={PaymentService.getGatewayUrl(selectedPlanTier)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleUpiAppTap}
                        className="text-orange-600 font-bold hover:underline flex-shrink-0"
                      >
                        Open PG
                      </a>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Official Gateway: <strong>cit.org.in UPI PG</strong> • Fixed: <strong>₹{offerAmount}.00</strong>
                    </span>
                  </div>

                  <form onSubmit={handleDirectPaymentSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Student Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aarav Sharma"
                          value={studentName}
                          onChange={e => setStudentName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Mobile / Email *</label>
                        <input
                          type="text"
                          required
                          placeholder="9861439460"
                          value={emailOrPhone}
                          onChange={e => setEmailOrPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {!currentLearner ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-700">Account Password *</label>
                          <span className="text-[10px] text-slate-400 font-normal">Min. 6 chars to log in later</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Create password for student login"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 pr-10 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold block">Connected Scholar Account:</span>
                          <span className="text-[11px] text-orange-800">{currentLearner.fullName} ({currentLearner.email})</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Logged In
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-slate-900">UPI PG Reference / UTR (Optional)</label>
                        <span className="text-[10px] text-slate-400 font-normal">Instant Automated Activation</span>
                      </div>
                      <input
                        ref={modalUtrInputRef}
                        id="modal-utr-input"
                        type="text"
                        placeholder="e.g. Transaction ID from receipt (optional)"
                        value={utrNumber}
                        onChange={e => setUtrNumber(e.target.value)}
                        className="w-full bg-orange-50/50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-orange-600"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Paid on UPI PG? Click below to immediately activate your access.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>{isSubmitting ? 'Activating...' : `I HAVE PAID — ACTIVATE ₹${offerAmount} PASS NOW`}</span>
                    </button>
                  </form>
                </div>
              )
            ) : (
              <form onSubmit={handleEnrollSubmit} className="space-y-3.5 text-xs">
                {modalMode === 'REGISTER' && (
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
                )}

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
                      placeholder={modalMode === 'REGISTER' ? 'Create a password for student login' : 'Enter your password'}
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

                {modalMode === 'REGISTER' && (
                  <>
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
                  </>
                )}

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
                  <span>
                    {isSubmitting
                      ? 'Processing...'
                      : modalMode === 'REGISTER'
                      ? `PROCEED TO PAY ₹${offerAmount} (UPI / QR)`
                      : 'SIGN IN & ENTER WORKSPACE'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
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
              planTier={selectedPlanTier}
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

      {/* ======================================================== */}
      {/* MODAL 4: POST-PAYMENT RETURN: "Payment OK. Make Student Account:-" */}
      {/* ======================================================== */}
      {showPostPaymentPopup && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="max-w-lg w-full bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
            <button
              onClick={() => setShowPostPaymentPopup(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block">
                ⚡ UPI PG Transaction Tracked
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Payment OK. Make Student Account:-
              </h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Enter your details below to create your student account. Your <strong>{selectedPlanTier === 'GOLD' ? 'Gold Pass (365 Days / ₹205)' : (selectedPlanTier === 'PLUS' ? 'Plus Plan (180 Days / ₹129)' : 'Concept Booster (60 Days / ₹49)')}</strong> pass will be activated instantly!
              </p>
            </div>

            {paymentSuccess ? (
              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-5 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-black text-emerald-300">
                  Account Created &amp; Pass Activated!
                </h3>
                <p className="text-xs text-slate-200">
                  Welcome aboard! Your pass is active.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowPostPaymentPopup(false);
                    onSuccessRegistered();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Go to Student Dashboard &amp; Start Learning 🚀
                </button>
              </div>
            ) : (
              <form onSubmit={handleDirectPaymentSubmit} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mobile or Email *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210 or name@gmail.com"
                      value={emailOrPhone}
                      onChange={e => setEmailOrPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Create Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Parent Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Class / Grade</label>
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(Number(e.target.value) as Grade)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                        <option key={c} value={c} className="bg-slate-900 text-white">Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Education Board</label>
                    <select
                      value={selectedBoard}
                      onChange={e => setSelectedBoard(e.target.value as Board)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none"
                    >
                      {['CBSE', 'ICSE', 'STATE_BOARD'].map(b => (
                        <option key={b} value={b} className="bg-slate-900 text-white">{b.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    UPI PG Reference / UTR Number (Optional)
                  </label>
                  <input
                    type="text"
                    ref={modalUtrInputRef}
                    placeholder="e.g. 12-digit UTR from payment screen (optional)"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-white font-mono placeholder-slate-500 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 transform hover:scale-[1.01]"
                >
                  {isSubmitting ? (
                    <span>Creating Account &amp; Activating Pass...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>CREATE STUDENT ACCOUNT &amp; ACTIVATE PASS ↗</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
