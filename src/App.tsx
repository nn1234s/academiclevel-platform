import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAuth } from './core/auth/AuthContext';
import { StorageRLSLayer } from './core/storage/StorageRLSLayer';
import { Board, Grade, LevelNode, Question } from './core/types';
import { QuotaService } from './services/quotaService';
import { ErrorBoundary } from './modules/shared/ErrorBoundary';
import { PaywallGateModal } from './modules/shared/PaywallGateModal';
import { AuthModal } from './modules/shared/AuthModal';
import { StudyCoinIcon } from './modules/shared/StudyCoinIcon';
import { ProfileAvatar } from './modules/shared/ProfileAvatar';
import { useLanguage } from './core/i18n/LanguageContext';
import { LanguagePreferenceModal } from './modules/shared/LanguagePreferenceModal';

// Public Pages
import { LandingPage } from './modules/public/LandingPage';
import { AdsLandingPage } from './modules/public/AdsLandingPage';
import { SecretAdPage } from './modules/public/SecretAdPage';
import { Special49AdsLandingPage } from './modules/public/Special49AdsLandingPage';
import { PublicCourses } from './modules/public/PublicCourses';
import { CurriculumPage } from './modules/public/CurriculumPage';
import { PricingPage } from './modules/public/PricingPage';
import { AboutPage } from './modules/public/AboutPage';
import { FAQPage } from './modules/public/FAQPage';
import { LegalPages } from './modules/public/LegalPages';
import { CertificateVerificationView } from './modules/public/CertificateVerificationView';
import { HallOfFamePage } from './modules/public/HallOfFamePage';
import { InnovativeEdtechPage } from './modules/public/InnovativeEdtechPage';
import { BlogPage } from './modules/public/BlogPage';
import { DownloadsPage } from './modules/public/DownloadsPage';
import { NotFoundPika } from './modules/public/NotFoundPika';
import { AccountDeletionPage } from './modules/public/AccountDeletionPage';
import { SchoolPortalPage } from './modules/public/SchoolPortalPage';
import { SitemapPage } from './modules/public/SitemapPage';

// Student Modules
import { StudentDashboard } from './modules/student/StudentDashboard';
import { CourseCatalogue } from './modules/student/CourseCatalogue';
import { CourseLevels } from './modules/student/CourseLevels';
import { QuizEngine } from './modules/student/QuizEngine';
import { NovaAiTutor } from './modules/student/NovaAiTutor';
import { CoinMall } from './modules/student/CoinMall';
import { GiftStore } from './modules/student/GiftStore';
import { PremiumCenter } from './modules/student/PremiumCenter';
import { StudentPacks } from './modules/student/StudentPacks';
import { DailySpinWheel } from './modules/student/DailySpinWheel';
import { ReferralProgramme } from './modules/student/ReferralProgramme';
import { QOTD } from './modules/student/QOTD';
import { WeeklyChallenges } from './modules/student/WeeklyChallenges';
import { CertificateVault } from './modules/student/CertificateVault';
import { AnnualMasterCertificate } from './modules/student/AnnualMasterCertificate';
import { StudentProfile } from './modules/student/StudentProfile';
import { StreakEngine } from './modules/student/StreakEngine';
import { OfflineBankView } from './modules/student/OfflineBankView';
import { ACodesRedemption } from './modules/student/ACodesRedemption';
import { UPIQRCheckout } from './modules/student/UPIQRCheckout';
import { WorldwideScholarships } from './modules/student/WorldwideScholarships';
import { PokemonVaultHub } from './modules/pokemon/PokemonVaultHub';
import { StudentMailboxModal } from './modules/student/StudentMailboxModal';
import { MistakeVault } from './modules/student/MistakeVault';
import { QuizDuelArena } from './modules/student/QuizDuelArena';
import { ScholarLeagues } from './modules/student/ScholarLeagues';
import { StudyToolsWidget } from './modules/shared/StudyToolsWidget';

// Icons
import {
  Sparkles,
  BookOpen,
  Award,
  Zap,
  Flame,
  Users,
  User,
  LogOut,
  Menu,
  X,
  CreditCard,
  Gift,
  Compass,
  Trophy,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Crown,
  School,
  HelpCircle,
  FileText,
  Mail,
  Sun,
  Moon,
  AlertTriangle,
  ArrowRight,
  XOctagon,
  Globe,
  Home,
  Swords
} from 'lucide-react';

// Code-split Super-Admin Vault Shell (unlinked from public navigation)
const AdminVaultShell = lazy(() =>
  import('./admin-vault/AdminVaultShell').then(m => ({ default: m.AdminVaultShell }))
);

interface RouteResolution {
  route: string;
  intendedProtected?: string;
}

const PROTECTED_STUDENT_ROUTES: Record<string, string> = {
  '/dashboard': 'DASHBOARD',
  '/courses': 'COURSES',
  '/levels': 'LEVELS',
  '/quiz': 'QUIZ',
  '/community': 'COMMUNITY',
  '/spin': 'SPIN_WHEEL',
  '/spin-wheel': 'SPIN_WHEEL',
  '/referral': 'REFERRAL',
  '/referrals': 'REFERRAL',
  '/acodes': 'REFERRAL',
  '/friend-passes': 'REFERRAL',
  '/certificates': 'CERTIFICATES',
  '/master-certificate': 'MASTER_CERT',
  '/profile': 'PROFILE',
  '/streaks': 'STREAKS',
  '/offline-bank': 'OFFLINE_BANK',
  '/premium': 'PREMIUM',
  '/qotd': 'QOTD',
  '/challenges': 'CHALLENGES',
  '/scholarships': 'SCHOLARSHIPS',
  '/mistakes': 'MISTAKE_VAULT',
  '/mistake-vault': 'MISTAKE_VAULT',
  '/error-notebook': 'MISTAKE_VAULT',
  '/duel': 'DUEL_ARENA',
  '/duels': 'DUEL_ARENA',
  '/arena': 'DUEL_ARENA',
  '/leagues': 'LEAGUES',
  '/scholar-leagues': 'LEAGUES'
};

const ADS_ROUTES: Record<string, boolean> = {
  '/special49': true,
  '/special': true,
  '/offer': true,
  '/offer49': true,
  '/special-offer': true,
  '/advert': true,
  '/advert1': true,
  '/advert2': true,
  '/yt': true,
  '/youtube': true,
  '/yt49': true,
  '/ad-yt': true,
  '/ads': true,
  '/ad': true
};

function checkHasPaidSubscription(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = StorageRLSLayer.getCurrentSession();
    if (!session || !session.learnerId) return false;
    const learner = StorageRLSLayer.getLearnerById(session.learnerId, session.learnerId);
    if (learner?.hasActiveSubscription || (learner as any)?.activeSub) return true;
    const subs = StorageRLSLayer.getSubscriptionsForLearner(session.learnerId, session.learnerId);
    return subs.some(s => s.status === 'ACTIVE' && (!s.expiresAt || new Date(s.expiresAt).getTime() > Date.now()));
  } catch {
    return false;
  }
}

function resolveRouteFromPath(path: string, isAuth: boolean): RouteResolution {
  const p = path.toLowerCase().replace(/\/$/, '');

  // 1. Super-Admin Vault
  if (p === '/adminservice' || p === '/ops-vault-al99') {
    return { route: 'ADMIN_VAULT' };
  }

  // 1.1 Secret Arcade Vault (/arcade, /vault, /pika, /pikachu, /pokemon, /pokedex)
  if (p === '/arcade' || p === '/vault' || p === '/pika' || p === '/pikachu' || p === '/pokemon' || p === '/pokedex') {
    return { route: 'POKEMON_VAULT' };
  }

  // 2. Advertising & Campaign Landing Pages (Additional Module)
  if (ADS_ROUTES[p]) {
    return { route: 'SPECIAL_49_FUNNEL' };
  }

  // 3. Public static pages
  if (
    p === '/school' ||
    p === '/schools' ||
    p === '/institution' ||
    p === '/institutions' ||
    p === '/teacher' ||
    p === '/teachers'
  ) {
    return { route: 'SCHOOL_PORTAL' };
  }
  if (p === '/pricing') return { route: 'PRICING' };
  if (p === '/about') return { route: 'ABOUT' };
  if (p === '/faq') return { route: 'FAQ' };
  if (p === '/privacy' || p === '/policies' || p === '/policies.html' || p === '/policy' || p === '/privacy.html') return { route: 'PRIVACY' };
  if (p === '/terms' || p === '/terms.html' || p === '/terms-of-use') return { route: 'TERMS' };
  if (p === '/safety' || p === '/children' || p === '/student-safety') return { route: 'SAFETY' };
  if (p === '/delacc' || p === '/delete-account' || p === '/deleteaccount' || p === '/account-deletion') return { route: 'ACCOUNT_DELETION' };
  if (p === '/halloffame' || p === '/hall-of-fame' || p === '/security' || p === '/security/hall-of-fame') return { route: 'HALL_OF_FAME' };
  if (
    p === '/innovative-edtech' ||
    p === '/most-innovative-edtech' ||
    p === '/award' ||
    p === '/awards' ||
    p === '/edtech-century' ||
    p === '/edtech-award'
  ) return { route: 'INNOVATIVE_EDTECH' };

  if (p === '/sitemap' || p === '/sitemap.html') return { route: 'SITEMAP' };
  if (p === '/blog' || p.startsWith('/blog/') || p === '/changelog' || p === '/updates') return { route: 'BLOG' };
  if (p === '/downloads' || p === '/download') return { route: 'DOWNLOADS' };
  
  // Dedicated Curriculum Board Routes with Sample Questions & Free Signup
  if (p === '/curriculum/cbse' || p === '/cbse') return { route: 'CURRICULUM_CBSE' };
  if (p === '/curriculum/icse' || p === '/icse') return { route: 'CURRICULUM_ICSE' };
  if (p === '/curriculum/cambridge' || p === '/cambridge' || p === '/igcse' || p === '/curriculum/igcse') return { route: 'CURRICULUM_CAMBRIDGE' };
  if (p === '/curriculum/olympiad' || p === '/olympiad') return { route: 'CURRICULUM_OLYMPIAD' };
  if (p === '/curriculum') return { route: isAuth ? 'COURSES' : 'PUBLIC_COURSES' };
  if (p.startsWith('/verify')) return { route: 'VERIFY_CERTIFICATE' };
  if (p === '/nova' || p === '/nova-ai' || p === '/ai-tutor') return { route: 'NOVA_AI' };
  if (p === '/gift-store' || p === '/store' || p === '/rewards' || p === '/coin-mall' || p === '/coins' || p === '/gifts' || p === '/mall') return { route: 'GIFT_STORE' };
  if (p === '/login' || p === '/signin') {
    return { route: isAuth ? 'DASHBOARD' : 'HOME', intendedProtected: isAuth ? undefined : 'DASHBOARD' };
  }

  // 4. Protected Student Routes
  if (PROTECTED_STUDENT_ROUTES[p]) {
    const targetRoute = PROTECTED_STUDENT_ROUTES[p];
    if (isAuth) {
      return { route: targetRoute };
    }
    // Deep link requested while unauthenticated: remember intended destination
    return { route: 'HOME', intendedProtected: targetRoute };
  }

  // 5. Root Path
  if (p === '') {
    return { route: isAuth ? 'DASHBOARD' : 'HOME' };
  }

  // 6. Unknown Path -> 404
  return { route: 'NOT_FOUND' };
}

function getPathForRoute(route: string): string {
  switch (route) {
    case 'ADMIN_VAULT': return '/adminservice';
    case 'POKEMON_VAULT': return '/pika';
    case 'SPECIAL_49_FUNNEL': return '/special49';
    case 'ADS_FUNNEL': return '/special49';
    case 'ADVERT1_FUNNEL': return '/special49';
    case 'YT_ADS_FUNNEL': return '/special49';
    case 'SCHOOL_PORTAL': return '/school';
    case 'PRICING': return '/pricing';
    case 'ABOUT': return '/about';
    case 'FAQ': return '/faq';
    case 'CURRICULUM_CBSE': return '/curriculum/cbse';
    case 'CURRICULUM_ICSE': return '/curriculum/icse';
    case 'CURRICULUM_CAMBRIDGE': return '/curriculum/cambridge';
    case 'CURRICULUM_OLYMPIAD': return '/curriculum/olympiad';
    case 'PUBLIC_COURSES': return '/curriculum';
    case 'PRIVACY': return '/privacy';
    case 'TERMS': return '/terms';
    case 'SAFETY': return '/safety';
    case 'ACCOUNT_DELETION': return '/delacc';
    case 'HALL_OF_FAME': return '/halloffame';
    case 'INNOVATIVE_EDTECH': return '/most-innovative-edtech';
    case 'BLOG': return '/blog';
    case 'DOWNLOADS': return '/downloads';
    case 'SITEMAP': return '/sitemap';
    case 'VERIFY_CERTIFICATE': return '/verify';
    case 'DASHBOARD': return '/';
    case 'COURSES': return '/courses';
    case 'LEVELS': return '/levels';
    case 'QUIZ': return '/quiz';
    case 'NOVA_AI': return '/nova-ai';
    case 'COMMUNITY': return '/community';
    case 'SPIN_WHEEL': return '/spin-wheel';
    case 'REFERRAL': return '/referral';
    case 'COIN_MALL':
    case 'GIFT_STORE':
    case 'STORE':
      return '/gift-store';
    case 'CERTIFICATES': return '/certificates';
    case 'MASTER_CERT': return '/master-certificate';
    case 'PROFILE': return '/profile';
    case 'STREAKS': return '/streaks';
    case 'OFFLINE_BANK': return '/offline-bank';
    case 'PREMIUM': return '/premium';
    case 'QOTD': return '/qotd';
    case 'CHALLENGES': return '/challenges';
    case 'SCHOLARSHIPS': return '/scholarships';
    case 'MISTAKE_VAULT': return '/mistakes';
    case 'DUEL_ARENA': return '/arena';
    case 'LEAGUES': return '/leagues';
    default: return '/';
  }
}

export const App: React.FC = () => {
  const { currentLearner, isAuthenticated, isAuthLoading, isSuperAdmin, logout, refreshCurrentLearner } = useAuth();
  const { t, language, toggleLanguage, setShowPromptModal } = useLanguage();

  // Pending redirect for unauthenticated deep link return-to-page
  const [pendingRedirectRoute, setPendingRedirectRoute] = useState<string | null>(null);

  // Route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hasInitialSession = StorageRLSLayer.getCurrentSession() !== null;
      const { route } = resolveRouteFromPath(window.location.pathname, hasInitialSession);
      return route;
    }
    return 'HOME';
  });

  // Theme state: Enforced Light Mode platform-wide per academic design standards
  const [theme, setTheme] = useState<'light'>('light');

  useEffect(() => {
    try {
      localStorage.setItem('al_theme', 'light');
      document.documentElement.classList.remove('dark');
    } catch {}
  }, []);

  const toggleTheme = () => {
    // Theme locked strictly to light mode
    setTheme('light');
    try {
      localStorage.setItem('al_theme', 'light');
      document.documentElement.classList.remove('dark');
    } catch {}
  };

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [acodeModalOpen, setAcodeModalOpen] = useState(false);
  const [checkoutPlanTier, setCheckoutPlanTier] = useState<'LITE' | 'PLUS' | 'GOLD' | null>(null);

  // Active quiz context
  const [activeSubjectId, setActiveSubjectId] = useState<string>('math');
  const [activeLevelNode, setActiveLevelNode] = useState<LevelNode>('FOUNDATION');
  const [activeGradeOverride, setActiveGradeOverride] = useState<Grade | null>(null);
  const [globalMailboxOpen, setGlobalMailboxOpen] = useState<boolean>(false);
  const [activeTargetCount, setActiveTargetCount] = useState<number>(10);
  const [activeChapter, setActiveChapter] = useState<string | undefined>(undefined);
  const [publicBoardFilter, setPublicBoardFilter] = useState<Board>('CBSE');
  const [dashboardOpenMailbox, setDashboardOpenMailbox] = useState<boolean>(false);
  const [dashboardActiveReportId, setDashboardActiveReportId] = useState<string | null>(null);
  const [novaQuestionContext, setNovaQuestionContext] = useState<{
    q: Question;
    chosenIdx: number;
  } | null>(null);

  // Incomplete Quiz Exit Protection Modal (Item B)
  const [quizExitModalOpen, setQuizExitModalOpen] = useState(false);
  const [pendingQuizExit, setPendingQuizExit] = useState<{ route: string; extra?: any } | null>(null);
  const [exitPinInput, setExitPinInput] = useState('');
  const [exitPinError, setExitPinError] = useState('');
  const currentRouteRef = useRef(currentRoute);

  useEffect(() => {
    currentRouteRef.current = currentRoute;
  }, [currentRoute]);

  // Mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop header dropdown state
  const [activeDropdown, setActiveDropdown] = useState<'OFFERS' | 'ABOUT' | null>(null);
  const dropdownTimeoutRef = useRef<any>(null);
  const navContainerRef = useRef<HTMLElement | null>(null);

  const handleDropdownEnter = (type: 'OFFERS' | 'ABOUT') => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(type);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // On initial mount: if visitor requested protected deep link while unauthenticated, trigger login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasInitialSession = StorageRLSLayer.getCurrentSession() !== null;
      const { intendedProtected } = resolveRouteFromPath(window.location.pathname, hasInitialSession);
      if (intendedProtected && !hasInitialSession) {
        setPendingRedirectRoute(intendedProtected);
        setAuthModalMode('LOGIN');
        setAuthModalOpen(true);
      }
    }
  }, []);

  // When user is confirmed authenticated:
  // 1. If there is a pending redirect route, immediately navigate to it!
  // 2. If at HOME, go to DASHBOARD.
  // 3. If currently showing NOT_FOUND, re-resolve in case it was a protected route waiting for auth resolution.
  useEffect(() => {
    if (isAuthenticated) {
      if (pendingRedirectRoute) {
        const dest = pendingRedirectRoute;
        setPendingRedirectRoute(null);
        navigateTo(dest);
      } else if (currentRoute === 'HOME') {
        setCurrentRoute('DASHBOARD');
      } else if (currentRoute === 'NOT_FOUND') {
        const { route } = resolveRouteFromPath(window.location.pathname, true);
        if (route !== 'NOT_FOUND') {
          setCurrentRoute(route);
        }
      }
    }
  }, [isAuthenticated, pendingRedirectRoute, currentRoute]);

  // Synchronize URL popstate (browser back/forward) & Guard Active Quiz
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If student clicks Back while an assessment is active, STOP them and show emergency popup
      if (currentRouteRef.current === 'QUIZ') {
        try {
          window.history.pushState({ inQuiz: true }, '', window.location.pathname);
        } catch {}
        setPendingQuizExit({ route: 'DASHBOARD' });
        setExitPinInput('');
        setExitPinError('');
        setQuizExitModalOpen(true);
        return;
      }

      const { route, intendedProtected } = resolveRouteFromPath(window.location.pathname, isAuthenticated);
      if (intendedProtected && !isAuthenticated) {
        setPendingRedirectRoute(intendedProtected);
        setCurrentRoute('HOME');
        setAuthModalMode('LOGIN');
        setAuthModalOpen(true);
      } else {
        setCurrentRoute(route);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Push history checkpoint and block accidental tab closing when inside active QUIZ
  useEffect(() => {
    if (currentRoute === 'QUIZ') {
      try {
        window.history.pushState({ inQuiz: true }, '', window.location.pathname);
      } catch {}

      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Was this an internet error? Leaving will void your active quiz!';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [currentRoute]);

  // Push URL with popstate support
  const navigateTo = (route: string, extra?: any) => {
    // Guard active assessment: prevent accidental loss of in-progress assessment via in-app exit confirmation modal
    if (currentRoute === 'QUIZ' && route !== 'QUIZ' && !extra?.forceExit) {
      setPendingQuizExit({ route, extra });
      setQuizExitModalOpen(true);
      return;
    }

    setCurrentRoute(route);
    setMobileMenuOpen(false);
    setActiveDropdown(null);

    if (typeof window !== 'undefined') {
      const targetPath = getPathForRoute(route);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      // Instant and reliable scroll to top on every navigation (guarantees footer links & page switches start at the top)
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    if (extra?.subjectId) setActiveSubjectId(extra.subjectId);
    if (extra?.node) setActiveLevelNode(extra.node);
    if (extra?.grade) setActiveGradeOverride(extra.grade);
    if (extra?.questionCount) setActiveTargetCount(extra.questionCount);
    if (extra?.chapter !== undefined) setActiveChapter(extra.chapter);
    if (extra?.board) setPublicBoardFilter(extra.board);
    if (extra?.openMailbox !== undefined) {
      setDashboardOpenMailbox(Boolean(extra.openMailbox));
      setGlobalMailboxOpen(Boolean(extra.openMailbox));
    }
    if (extra?.activeReportId !== undefined) {
      setDashboardActiveReportId(extra.activeReportId || null);
    }
  };

  const effectiveGrade: Grade = (isSuperAdmin && activeGradeOverride) ? activeGradeOverride : (currentLearner?.grade || 10);
  const effectiveLearner = currentLearner ? { ...currentLearner, grade: effectiveGrade } : null;

  // Quota evaluation
  const quota = currentLearner ? QuotaService.evaluateQuota(currentLearner) : null;

  // Code-Split Super-Admin Vault Screen
  if (currentRoute === 'ADMIN_VAULT') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
            Loading secure enterprise vault...
          </div>
        }
      >
        <AdminVaultShell onExitVault={() => navigateTo('HOME')} />
      </Suspense>
    );
  }

  // ALL Ad Campaign Funnels (/special49, /special, /offer, /ads, /advert1, etc.)
  // Unified under the highly informative Special 49 Offer UI (Classes 1-12, ₹49 Offer, Oda Class design)
  if (
    currentRoute === 'SPECIAL_49_FUNNEL' ||
    currentRoute === 'ADS_FUNNEL' ||
    currentRoute === 'ADVERT1_FUNNEL' ||
    currentRoute === 'YT_ADS_FUNNEL'
  ) {
    return (
      <Special49AdsLandingPage
        onSuccessRegistered={() => {
          refreshCurrentLearner();
          navigateTo('DASHBOARD');
        }}
      />
    );
  }

  // Secret Arcade Vault (/arcade, /vault, /pika, /pikachu, /pokemon, /pokedex)
  if (currentRoute === 'POKEMON_VAULT') {
    return (
      <>
        <PokemonVaultHub
          learner={currentLearner}
          onRefreshLearner={() => refreshCurrentLearner()}
          onOpenAuth={mode => {
            setAuthModalMode(mode);
            setAuthModalOpen(true);
          }}
          onBackToApp={() => {
            if (isAuthenticated) {
              navigateTo('DASHBOARD');
            } else {
              navigateTo('HOME');
            }
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            refreshCurrentLearner();
            setAuthModalOpen(false);
          }}
          initialMode={authModalMode}
          onNavigateToSpecial49={() => {
            setAuthModalOpen(false);
            navigateTo('SPECIAL_49_FUNNEL');
          }}
        />
      </>
    );
  }

  // Dedicated Institutional Classroom Portal (/school, /schools, /institution, /teacher)
  if (currentRoute === 'SCHOOL_PORTAL') {
    return (
      <SchoolPortalPage
        onNavigate={navigateTo}
        onSuccessAuth={() => refreshCurrentLearner()}
      />
    );
  }

  return (
    <ErrorBoundary fallbackTitle="AcademicLevel Platform Error">
      <div className="min-h-screen bg-[#EEEEEE] text-[#212121] flex flex-col selection:bg-[#3F51B5] selection:text-white">
        {/* ======================================================== */}
        {/* MATERIAL 1 TOP APP BAR (Neutral Light Blue)              */}
        {/* ======================================================== */}
        <header className="sticky top-0 z-40 bg-[#E8F0FE] text-[#1E293B] border-b border-[#C5CAE9] md-appbar px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center">
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2">
            {/* Brand Logo & Desktop Nav grouped closely together */}
            <div className="flex items-center space-x-2 sm:space-x-3.5 lg:space-x-5 min-w-0">
              <div
                onClick={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
                className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group shrink-0 min-w-[36px]"
                title="AcademicLevel"
              >
                <div className="w-9 h-9 rounded-[3px] bg-[#3F51B5] flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-dp1 group-hover:bg-[#303F9F] transition-colors shrink-0">
                  AL
                </div>
                {!isAuthenticated ? (
                  <div className="min-w-0">
                    <span className="font-bold text-sm sm:text-base tracking-tight text-[#1E293B] block leading-none truncate">
                      AcademicLevel
                    </span>
                    <span className="text-[10px] text-[#475569] font-medium hidden sm:block">Learn in your era</span>
                  </div>
                ) : (
                  <div className="hidden sm:block lg:hidden">
                    <span className="font-bold text-sm tracking-tight text-[#1E293B] block leading-none">
                      AcademicLevel
                    </span>
                  </div>
                )}
              </div>

              {/* Desktop Navigation Links with Clean Dropdowns */}
              <nav ref={navContainerRef} className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
              {!isAuthenticated ? (
                <>
                  {/* Direct Link: Home */}
                  <button
                    onClick={() => navigateTo('HOME')}
                    className={`px-3 py-2 rounded-[3px] transition-colors cursor-pointer ${
                      currentRoute === 'HOME'
                        ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]'
                        : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                    }`}
                  >
                    Home
                  </button>

                  {/* Dropdown 1: Curriculum & Offers */}
                  <div
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter('OFFERS')}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === 'OFFERS' ? null : 'OFFERS')}
                      className={`px-3 py-2 rounded-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentRoute === 'PUBLIC_COURSES' ||
                        currentRoute === 'SPECIAL_49_FUNNEL' ||
                        currentRoute === 'SCHOOL_PORTAL' ||
                        currentRoute === 'PRICING'
                          ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]'
                          : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                      }`}
                    >
                      <span>Curriculum &amp; Offers</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === 'OFFERS' ? 'rotate-180 text-[#3F51B5]' : 'text-[#64748B]'
                        }`}
                      />
                    </button>

                    {activeDropdown === 'OFFERS' && (
                      <div
                        className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[9999] ring-1 ring-slate-200/80"
                      >
                        <div className="p-1.5 space-y-1">
                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('CURRICULUM_CBSE');
                            }}
                            className="w-full flex items-start space-x-3 p-2 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-200 text-indigo-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                CBSE Classes 1–12
                              </p>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                NCERT &amp; NEP 2020 aligned board syllabus
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('CURRICULUM_OLYMPIAD');
                            }}
                            className="w-full flex items-start space-x-3 p-2 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <Trophy className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                                Olympiad &amp; Foundations
                              </p>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                HOTS speed simulation &amp; pattern recognition
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('SPECIAL_49_FUNNEL');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                                  Special ₹49 Pass
                                </p>
                                <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                                  HOT
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                60-Day unlimited concept booster &amp; quizzes
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('SCHOOL_PORTAL');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <School className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  Schools (₹2,499)
                                </p>
                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300">
                                  PACK
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Institutional pack with 40 Lite or 20 Plus A-Codes
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('PRICING');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer border-t border-slate-100 pt-2.5 mt-1"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-50 border border-sky-200 text-sky-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                                All Plans &amp; Pricing
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Compare Lite (₹49), Plus (₹129) &amp; 1-Year Gold VIP
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropdown 2: About & Trust */}
                  <div
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter('ABOUT')}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === 'ABOUT' ? null : 'ABOUT')}
                      className={`px-3 py-2 rounded-[3px] transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentRoute === 'ABOUT' ||
                        currentRoute === 'FAQ' ||
                        currentRoute === 'HALL_OF_FAME' ||
                        currentRoute === 'INNOVATIVE_EDTECH' ||
                        currentRoute === 'BLOG' ||
                        currentRoute === 'DOWNLOADS' ||
                        currentRoute === 'PRIVACY' ||
                        currentRoute === 'SITEMAP'
                          ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]'
                          : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                      }`}
                    >
                      <span>About &amp; Trust</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === 'ABOUT' ? 'rotate-180 text-[#3F51B5]' : 'text-[#64748B]'
                        }`}
                      />
                    </button>

                    {activeDropdown === 'ABOUT' && (
                      <div
                        className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[9999] ring-1 ring-slate-200/80"
                      >
                        <div className="p-1.5 space-y-1">
                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('ABOUT');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 border border-purple-200 text-purple-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                                About Us
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Mission, Nova AI Tutor methodology &amp; pedagogy
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('BLOG');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-200 text-indigo-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                AcademicLevel Blog
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                All updates, Nova AI &amp; innovative features
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('DOWNLOADS');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                Downloads (Windows App)
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Get the Windows Desktop (.exe) or Web App
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('FAQ');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                Frequently Asked Questions
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Parent guides, student safety &amp; answers
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('INNOVATIVE_EDTECH');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                                  #1 EdTech Award
                                </p>
                                <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                                  WINNER
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Century EdTech Leader &amp; Innovation recognition
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('HALL_OF_FAME');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-50 border border-cyan-200 text-cyan-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                                Security &amp; Bug Bounty
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Hall of Fame &amp; responsible disclosure policy
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('PRIVACY');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer border-t border-slate-100 pt-2.5 mt-1"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 border border-slate-200 text-slate-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                                Terms &amp; 20-Min Refund
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Privacy protection, DPDP &amp; cancellation policy
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdown(null);
                              navigateTo('SITEMAP');
                            }}
                            className="w-full flex items-start space-x-3 p-2.5 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-200 text-indigo-600 group-hover:scale-105 transition-transform flex-shrink-0 mt-0.5">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                Sitemap &amp; Directory
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                Public index of curriculum, plans, schools &amp; legal
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Authenticated Student Navigation */
                <>
                  <button
                    onClick={() => navigateTo('DASHBOARD')}
                    className={`px-3 py-2 rounded-[3px] transition-colors ${
                      currentRoute === 'DASHBOARD' ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]' : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                    }`}
                  >
                    {t('nav_dashboard')}
                  </button>
                  <button
                    onClick={() => navigateTo('COURSES')}
                    className={`px-3 py-2 rounded-[3px] transition-colors ${
                      currentRoute === 'COURSES' || currentRoute === 'LEVELS' ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]' : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                    }`}
                  >
                    {t('nav_courses')}
                  </button>
                  <button
                    onClick={() => navigateTo('NOVA_AI')}
                    className={`px-3 py-2 rounded-[3px] transition-colors ${
                      currentRoute === 'NOVA_AI' ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]' : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                    }`}
                  >
                    {t('nav_nova_ai')}
                  </button>
                  <button
                    onClick={() => navigateTo('COMMUNITY')}
                    className={`px-3 py-2 rounded-[3px] transition-colors ${
                      currentRoute === 'COMMUNITY' ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]' : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                    }`}
                  >
                    {t('nav_student_packs')}
                  </button>
                  <button
                    onClick={() => navigateTo('GIFT_STORE')}
                    className={`px-3 py-2 rounded-[3px] transition-colors flex items-center space-x-1.5 ${
                      currentRoute === 'GIFT_STORE' || currentRoute === 'COIN_MALL' ? 'text-[#E65100] font-bold bg-white shadow-2xs border-b-2 border-[#FF6D00]' : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5 text-[#FF6D00]" />
                    <span>{t('nav_gift_store')}</span>
                  </button>
                  <button
                    onClick={() => navigateTo('CERTIFICATES')}
                    className={`px-3 py-2 rounded-[3px] transition-colors ${
                      currentRoute === 'CERTIFICATES' || currentRoute === 'MASTER_CERT' ? 'text-[#3F51B5] font-bold bg-white shadow-2xs border-b-2 border-[#3F51B5]' : 'text-[#334155] hover:text-[#1E293B] hover:bg-white/60'
                    }`}
                  >
                    {t('nav_certificates')}
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* User Profile / Auth Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 flex-shrink-0">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setShowPromptModal(true)}
                className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 h-9 rounded-[3px] bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-bold transition-colors border border-[#CBD5E1] shadow-2xs cursor-pointer shrink-0"
                title="Change UI Language (Hindi / English)"
                aria-label="Change UI Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#3F51B5] flex-shrink-0" />
                <span className="text-[11px] font-bold">
                  {language === 'hi' ? 'HI' : 'EN'}
                </span>
              </button>
              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('LOGIN');
                      setAuthModalOpen(true);
                    }}
                    className="hidden sm:inline-flex items-center text-xs font-bold text-[#3F51B5] bg-white hover:bg-[#F8FAFC] px-3.5 py-2 rounded-[3px] border border-[#C5CAE9] shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('SPECIAL_49_FUNNEL')}
                    className="md-btn-raised px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FF6D00] hover:bg-[#E65100] text-white font-bold text-xs rounded-[3px] uppercase tracking-wider cursor-pointer shrink-0 tabular-nums"
                  >
                    Special ₹49
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 flex-shrink-0">
                  {/* 1-Year Gold VIP Pass Badge */}
                  {currentLearner?.activePlan === 'GOLD' && (
                    <button
                      type="button"
                      onClick={() => navigateTo('PROFILE')}
                      className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-[3px] bg-[#FFC107] text-[#212121] font-bold shadow-dp1 hover:bg-[#FFCA28] transition-colors cursor-pointer shrink-0 flex-shrink-0"
                      title="1-Year Gold VIP Pass Active (365 Days Access)"
                      aria-label="GOLD PASS Active"
                    >
                      <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#212121]" />
                    </button>
                  )}

                  {/* Mailbox Badge */}
                  <button
                    type="button"
                    onClick={() => setGlobalMailboxOpen(true)}
                    title="Student Mailbox & Diagnostic Reports"
                    aria-label="Student Mailbox"
                    className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-[3px] bg-white hover:bg-[#F8FAFC] text-[#3F51B5] border border-[#CBD5E1] shadow-2xs transition-colors cursor-pointer shrink-0 flex-shrink-0 touch-manipulation"
                  >
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3F51B5]" />
                    {currentLearner && StorageRLSLayer.getUnreadMailboxCount(currentLearner.id) > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 bg-[#FF6D00] text-white text-[9px] sm:text-[10px] font-bold rounded-[2px] flex items-center justify-center border border-white tabular-nums shadow-dp1">
                        {StorageRLSLayer.getUnreadMailboxCount(currentLearner.id)}
                      </span>
                    )}
                  </button>

                  {/* Coin Badge */}
                  <button
                    type="button"
                    onClick={() => navigateTo('GIFT_STORE')}
                    title="Open Scholar's Gift Store"
                    aria-label="Study Coins Balance"
                    className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 h-8 sm:h-9 rounded-[3px] bg-[#FFC107] text-[#212121] text-xs font-bold hover:bg-[#FFCA28] transition-colors shadow-dp1 cursor-pointer shrink-0 flex-shrink-0 tabular-nums"
                  >
                    <StudyCoinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" glow />
                    <span className="font-bold text-[11px] sm:text-xs tabular-nums">
                      {currentLearner?.coinBalance ? (currentLearner.coinBalance >= 100000 ? `${Math.floor(currentLearner.coinBalance / 1000)}k` : currentLearner.coinBalance.toLocaleString()) : 0}
                    </span>
                  </button>

                  {/* Profile Button */}
                  <button
                    type="button"
                    onClick={() => navigateTo('PROFILE')}
                    title={`Student Profile (${currentLearner?.fullName || 'Student'})`}
                    aria-label="Student Profile"
                    className="flex items-center justify-center sm:space-x-1.5 w-8 h-8 sm:w-auto sm:px-2 sm:py-1 sm:h-9 rounded-[3px] bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-semibold transition-colors shrink-0 flex-shrink-0 cursor-pointer border border-[#CBD5E1] shadow-2xs"
                  >
                    {currentLearner ? (
                      <ProfileAvatar
                        learner={currentLearner}
                        sizeClass="w-6 h-6"
                        textClass="text-xs"
                        roundedClass="rounded-lg"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-[#3F51B5] shrink-0" />
                    )}
                    <span className="hidden xl:inline truncate max-w-[90px]">
                      {currentLearner?.fullName.split(' ')[0]}
                    </span>
                  </button>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigateTo('HOME');
                    }}
                    className="hidden sm:flex w-9 h-9 items-center justify-center text-[#475569] hover:text-[#1E293B] rounded-[3px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] transition-colors shrink-0 flex-shrink-0 cursor-pointer"
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 text-[#1E293B] hover:bg-white rounded-[3px] bg-white/80 border border-[#CBD5E1] w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] sm:min-w-[36px] flex items-center justify-center cursor-pointer transition-colors shrink-0 flex-shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer (Overlay Sheet) */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-[57px] sm:top-[65px] inset-x-0 bottom-0 z-50 bg-slate-950/35 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white border-b border-slate-200 p-4 pb-24 space-y-4 text-xs font-semibold shadow-2xl text-slate-800 max-h-full overflow-y-auto overscroll-contain rounded-b-3xl">
            {!isAuthenticated ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalMode('LOGIN');
                    setAuthModalOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-xl text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 flex items-center justify-between min-h-[44px]"
                >
                  <span>Sign In (Existing User)</span>
                  <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded-full font-mono text-indigo-700">
                    Student &amp; Educator
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('HOME');
                  }}
                  className="w-full text-left p-3 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 min-h-[44px]"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Home</span>
                </button>

                {/* Group 1: Curriculum & Offers */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono mb-1">
                    Curriculum &amp; Offers
                  </p>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('PUBLIC_COURSES');
                    }}
                    className="w-full text-left p-3 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 min-h-[44px]"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Curriculum &amp; Syllabi (Classes 1–12)</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('SPECIAL_49_FUNNEL');
                    }}
                    className="w-full text-left p-3 rounded-xl text-amber-700 font-bold hover:bg-amber-50 flex items-center justify-between min-h-[44px]"
                  >
                    <span className="flex items-center space-x-2.5">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Special ₹49 Pass</span>
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                      HOT
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('SCHOOL_PORTAL');
                    }}
                    className="w-full text-left p-3 rounded-xl text-emerald-700 font-bold hover:bg-emerald-50 flex items-center justify-between min-h-[44px]"
                  >
                    <span className="flex items-center space-x-2.5">
                      <School className="w-4 h-4 text-emerald-600" />
                      <span>Schools &amp; Tutors</span>
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300">
                      ₹2,499
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('PRICING');
                    }}
                    className="w-full text-left p-3 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 min-h-[44px]"
                  >
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span>All Plans &amp; Pricing</span>
                  </button>
                </div>

                {/* Group 2: About & Trust */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono mb-1">
                    About &amp; Trust
                  </p>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('ABOUT');
                    }}
                    className="w-full text-left p-3 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>About AcademicLevel</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('FAQ');
                    }}
                    className="w-full text-left p-3 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 min-h-[44px]"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Frequently Asked Questions</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('INNOVATIVE_EDTECH');
                    }}
                    className="w-full text-left p-3 rounded-xl text-amber-700 font-semibold hover:bg-amber-50 flex items-center justify-between min-h-[44px]"
                  >
                    <span className="flex items-center space-x-2.5">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span>#1 EdTech Award</span>
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                      WINNER
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('HALL_OF_FAME');
                    }}
                    className="w-full text-left p-3 rounded-xl text-cyan-700 font-semibold hover:bg-cyan-50 flex items-center space-x-2.5 min-h-[44px]"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    <span>Security &amp; Bug Bounty</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('PRIVACY');
                    }}
                    className="w-full text-left p-3 rounded-xl text-slate-600 font-medium hover:bg-slate-100 flex items-center space-x-2.5 min-h-[44px]"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Terms, Privacy &amp; 20-Min Refund</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateTo('SITEMAP');
                    }}
                    className="w-full text-left p-3 rounded-xl text-indigo-700 font-medium hover:bg-indigo-50 flex items-center space-x-2.5 min-h-[44px]"
                  >
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Sitemap &amp; Directory</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Mobile Student Profile Capsule */}
                <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl flex items-center justify-between shadow-2xs mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {currentLearner?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-900 leading-tight">
                        {currentLearner?.fullName || 'Student'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {currentLearner?.board} • Class {currentLearner?.grade}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {currentLearner?.activePlan === 'GOLD' ? (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-[10px] font-black rounded-lg flex items-center space-x-1 shadow-2xs border border-amber-300">
                        <Crown className="w-3 h-3 fill-amber-950" />
                        <span>GOLD</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg">
                        Scholar
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('DASHBOARD');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 min-h-[44px] transition-colors ${
                    currentRoute === 'DASHBOARD' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Home className="w-4 h-4 text-indigo-600" />
                  <span>{t('nav_dashboard')}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setGlobalMailboxOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-xl text-purple-700 hover:bg-purple-50 flex items-center justify-between font-semibold min-h-[44px] transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span>{t('nav_mailbox')}</span>
                  </div>
                  {currentLearner && StorageRLSLayer.getUnreadMailboxCount(currentLearner.id) > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-full animate-pulse shadow-xs">
                      {StorageRLSLayer.getUnreadMailboxCount(currentLearner.id)} {language === 'hi' ? 'Naye' : 'New'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('COURSES');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 min-h-[44px] transition-colors ${
                    currentRoute === 'COURSES' || currentRoute === 'LEVELS' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>{t('nav_courses')}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('NOVA_AI');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between min-h-[44px] transition-colors ${
                    currentRoute === 'NOVA_AI' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>{t('nav_nova_ai')}</span>
                  </div>
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                    Bestie
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('COMMUNITY');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 min-h-[44px] transition-colors ${
                    currentRoute === 'COMMUNITY' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>{t('nav_student_packs')}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('SPIN_WHEEL');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between min-h-[44px] transition-colors ${
                    currentRoute === 'SPIN_WHEEL' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <StudyCoinIcon className="w-4 h-4" />
                    <span>{t('nav_spin_wheel')}</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-mono font-bold">{language === 'hi' ? '24h Cooldown' : '24h Cooldown'}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('MISTAKE_VAULT');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between min-h-[44px] transition-colors ${
                    currentRoute === 'MISTAKE_VAULT' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    <span>{t('nav_mistake_vault')}</span>
                  </div>
                  <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                    +10 Coins
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('DUEL_ARENA');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between min-h-[44px] transition-colors ${
                    currentRoute === 'DUEL_ARENA' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Swords className="w-4 h-4 text-indigo-600" />
                    <span>{t('nav_duel_arena')}</span>
                  </div>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                    Live 1v1
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('LEAGUES');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between min-h-[44px] transition-colors ${
                    currentRoute === 'LEAGUES' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>{t('nav_leagues')}</span>
                  </div>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    Diamond
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('REFERRAL');
                  }}
                  className="w-full text-left p-3 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center justify-between min-h-[44px] transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{language === 'hi' ? 'Friend ACodes aur Invites ⚡' : 'Friend ACodes & Invites'}</span>
                  </div>
                  <span className="flex items-center space-x-1 text-xs text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                    <StudyCoinIcon className="w-3.5 h-3.5" />
                    <span>+40 Coins</span>
                  </span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('GIFT_STORE');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 min-h-[44px] transition-colors ${
                    currentRoute === 'GIFT_STORE' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>{t('nav_gift_store')}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('CERTIFICATES');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 min-h-[44px] transition-colors ${
                    currentRoute === 'CERTIFICATES' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Certificate Vault</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('PREMIUM');
                  }}
                  className="w-full text-left p-3 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-2.5 min-h-[44px] transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Membership Center (₹49)</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('SCHOLARSHIPS');
                  }}
                  className="w-full text-left p-3 rounded-xl text-amber-700 hover:bg-amber-50 flex items-center space-x-2.5 min-h-[44px] transition-colors"
                >
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Worldwide Scholarships</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('PROFILE');
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center space-x-2.5 min-h-[44px] transition-colors ${
                    currentRoute === 'PROFILE' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Student Profile &amp; Parent PIN</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowPromptModal(true);
                  }}
                  className="w-full text-left p-3 rounded-xl text-indigo-700 hover:bg-indigo-50 flex items-center space-x-2.5 font-bold min-h-[44px] transition-colors"
                >
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'hi' ? '🇮🇳 Language: Hindi / Hinglish' : '🇬🇧 Language: English'}</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigateTo('HOME');
                  }}
                  className="w-full text-left p-3 rounded-xl text-rose-600 font-bold hover:bg-rose-50 flex items-center space-x-2.5 border-t border-slate-100 mt-2 pt-3 min-h-[44px] transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log Out ({currentLearner?.fullName.split(' ')[0] || 'Student'})</span>
                </button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN BODY VIEW CONTAINER                                */}
        {/* ======================================================== */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8">
          {/* Public Views */}
          {currentRoute === 'HOME' && (
            <LandingPage
              onOpenAuth={mode => {
                setAuthModalMode(mode);
                setAuthModalOpen(true);
              }}
              onExploreCourse={(b, g) => navigateTo('PUBLIC_COURSES')}
              onNavigate={navigateTo}
            />
          )}
          {(currentRoute === 'PUBLIC_COURSES' ||
            currentRoute === 'CURRICULUM_CBSE' ||
            currentRoute === 'CURRICULUM_ICSE' ||
            currentRoute === 'CURRICULUM_CAMBRIDGE' ||
            currentRoute === 'CURRICULUM_OLYMPIAD') && (
            <CurriculumPage
              track={
                currentRoute === 'CURRICULUM_CBSE'
                  ? 'CBSE'
                  : currentRoute === 'CURRICULUM_ICSE'
                  ? 'ICSE'
                  : currentRoute === 'CURRICULUM_CAMBRIDGE'
                  ? 'CAMBRIDGE'
                  : currentRoute === 'CURRICULUM_OLYMPIAD'
                  ? 'OLYMPIAD'
                  : 'ALL'
              }
              onOpenRegister={() => {
                setAuthModalMode('REGISTER');
                setAuthModalOpen(true);
              }}
              onSelectPlan={tier => {
                setCheckoutPlanTier(tier);
                if (!isAuthenticated) {
                  setAuthModalMode('REGISTER');
                  setAuthModalOpen(true);
                } else if (!quota?.hasActiveSubscription) {
                  setPaywallModalOpen(true);
                } else {
                  navigateTo('DASHBOARD');
                }
              }}
              onNavigate={navigateTo}
            />
          )}
          {currentRoute === 'PRICING' && (
            <PricingPage
              onSelectPlan={tier => {
                if (!isAuthenticated) {
                  setAuthModalMode('REGISTER');
                  setAuthModalOpen(true);
                } else {
                  setCheckoutPlanTier(tier);
                }
              }}
              onOpenRegister={() => {
                setAuthModalMode('REGISTER');
                setAuthModalOpen(true);
              }}
            />
          )}
          {currentRoute === 'ABOUT' && <AboutPage />}
          {currentRoute === 'FAQ' && <FAQPage />}
          {currentRoute === 'PRIVACY' && <LegalPages pageType="PRIVACY" />}
          {currentRoute === 'TERMS' && <LegalPages pageType="TERMS" />}
          {currentRoute === 'SAFETY' && <LegalPages pageType="SAFETY" />}
          {currentRoute === 'ACCOUNT_DELETION' && (
            <AccountDeletionPage
              learner={currentLearner}
              onDeleted={() => {
                logout();
                navigateTo('HOME');
              }}
              onBackToApp={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
            />
          )}
          {currentRoute === 'HALL_OF_FAME' && (
            <HallOfFamePage onNavigateHome={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')} />
          )}
          {currentRoute === 'INNOVATIVE_EDTECH' && (
            <InnovativeEdtechPage onBack={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')} />
          )}
          {currentRoute === 'BLOG' && (
            <BlogPage
              initialPostSlug={typeof window !== 'undefined' ? window.location.pathname.replace(/^\/blog\/?/, '') : ''}
              onBack={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
              onNavigate={(r) => navigateTo(r)}
            />
          )}
          {currentRoute === 'DOWNLOADS' && (
            <DownloadsPage
              onBack={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
              onOpenWebApp={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
            />
          )}
          {currentRoute === 'SITEMAP' && (
            <SitemapPage onNavigate={navigateTo} />
          )}
          {currentRoute === 'VERIFY_CERTIFICATE' && (
            <CertificateVerificationView
              token={typeof window !== 'undefined' ? window.location.pathname.replace(/^\/verify\/?/, '') : ''}
              onNavigateHome={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
            />
          )}

          {/* Public / Guest Accessible Nova AI */}
          {currentRoute === 'NOVA_AI' && !isAuthenticated && (
            <div className="py-1 sm:py-4">
              <NovaAiTutor
                board={publicBoardFilter || 'CBSE'}
                grade={10}
                activeSubject={activeSubjectId.toUpperCase()}
                initialQuestion={novaQuestionContext?.q || null}
                initialChosenIndex={novaQuestionContext?.chosenIdx ?? null}
                onClose={() => navigateTo('HOME')}
                learner={null}
              />
            </div>
          )}

          {/* Public / Guest Accessible Gift Store Showcase */}
          {(currentRoute === 'GIFT_STORE' || currentRoute === 'COIN_MALL' || currentRoute === 'STORE') && !isAuthenticated && (
            <div className="py-2 sm:py-4">
              <div className="max-w-4xl mx-auto mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200 text-center text-slate-800 shadow-sm">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  🎁 Scholar&apos;s Physical Prize Catalog
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  Earn Study Coins &amp; Claim Real Doorstep Delivery
                </h2>
                <p className="text-xs text-slate-600 max-w-xl mx-auto mt-1">
                  Preview all physical rewards available to AcademicLevel students. Complete daily quizzes and redeem stationery, books, plushies, smartwatches, and tablets!
                </p>
                <button
                  onClick={() => {
                    setAuthModalMode('REGISTER');
                    setAuthModalOpen(true);
                  }}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Create Student Account to Claim Rewards &rarr;
                </button>
              </div>
              <GiftStore
                learner={{
                  id: 'guest_preview',
                  email: 'guest@academiclevel.com',
                  fullName: 'Guest Scholar',
                  grade: 10,
                  board: 'CBSE',
                  role: 'STUDENT',
                  isActive: true,
                  quizzesCompletedCount: 0,
                  levelsCompletedCount: 0,
                  classChangesUsedPremium: 0,
                  classChangesUsedPostExpiry: 0,
                  referralCode: 'GUEST',
                  referralQualified: false,
                  currentStreakDays: 0,
                  longestStreakDays: 0,
                  streakFreezesAvailable: 0,
                  coinBalance: 0,
                  createdAt: new Date().toISOString()
                }}
                onRefreshLearner={() => {}}
                onNavigateToPremium={() => {
                  setAuthModalMode('REGISTER');
                  setAuthModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Student Authenticated Views */}
          {isAuthenticated && currentLearner && effectiveLearner && (
            <>
              {currentRoute === 'DASHBOARD' && (
                <StudentDashboard
                  learner={currentLearner}
                  activeGradeOverride={activeGradeOverride}
                  onSelectGradeOverride={setActiveGradeOverride}
                  onNavigate={navigateTo}
                  onOpenUpgradeModal={() => {
                    if (!quota?.hasActiveSubscription) setPaywallModalOpen(true);
                  }}
                  onOpenMailbox={(reportId) => {
                    refreshCurrentLearner();
                    if (reportId) setDashboardActiveReportId(reportId);
                    setGlobalMailboxOpen(true);
                  }}
                  initialOpenMailbox={dashboardOpenMailbox}
                  initialMailboxReportId={dashboardActiveReportId}
                />
              )}

              {currentRoute === 'COURSES' && (
                <CourseCatalogue
                  learner={effectiveLearner}
                  onSelectSubject={sId => navigateTo('LEVELS', { subjectId: sId })}
                />
              )}

              {currentRoute === 'LEVELS' && (
                <CourseLevels
                  learner={effectiveLearner}
                  subjectId={activeSubjectId}
                  onBack={() => navigateTo('COURSES')}
                  onStartQuiz={(node, count, chapter) => navigateTo('QUIZ', { node, questionCount: count, chapter })}
                  onOpenUpgradeModal={() => {
                    if (!quota?.hasActiveSubscription) setPaywallModalOpen(true);
                  }}
                />
              )}

              {currentRoute === 'QUIZ' && (
                <QuizEngine
                  board={currentLearner.board}
                  grade={effectiveGrade}
                  subjectId={activeSubjectId}
                  levelNode={activeLevelNode}
                  chapter={activeChapter}
                  targetCount={activeTargetCount}
                  learner={effectiveLearner}
                  onFinish={() => {
                    refreshCurrentLearner();
                    navigateTo('DASHBOARD', { forceExit: true });
                  }}
                  onOpenMailbox={(reportId) => {
                    refreshCurrentLearner();
                    setGlobalMailboxOpen(true);
                    if (reportId) setDashboardActiveReportId(reportId);
                  }}
                  onOpenNovaAi={(q, chosenIdx) => {
                    setNovaQuestionContext({ q, chosenIdx });
                    navigateTo('NOVA_AI');
                  }}
                  onExitQuiz={() => {
                    setPendingQuizExit({ route: 'DASHBOARD' });
                    setExitPinInput('');
                    setExitPinError('');
                    setQuizExitModalOpen(true);
                  }}
                />
              )}

              {currentRoute === 'NOVA_AI' && (
                <NovaAiTutor
                  board={currentLearner.board}
                  grade={effectiveGrade}
                  activeSubject={activeSubjectId.toUpperCase()}
                  initialQuestion={novaQuestionContext?.q || null}
                  initialChosenIndex={novaQuestionContext?.chosenIdx ?? null}
                  onClose={() => navigateTo('DASHBOARD')}
                  learner={currentLearner}
                  onCoinsUpdated={() => refreshCurrentLearner()}
                />
              )}

              {currentRoute === 'COMMUNITY' && <StudentPacks learner={currentLearner} />}

              {currentRoute === 'MISTAKE_VAULT' && (
                <MistakeVault
                  learner={currentLearner}
                  onOpenNovaAi={ctx => {
                    setNovaQuestionContext(ctx || null);
                    navigateTo('NOVA_AI');
                  }}
                  onCoinsUpdated={() => refreshCurrentLearner()}
                  onBackToDashboard={() => navigateTo('DASHBOARD')}
                />
              )}

              {currentRoute === 'DUEL_ARENA' && (
                <QuizDuelArena
                  learner={currentLearner}
                  onCoinsUpdated={() => refreshCurrentLearner()}
                  onBackToDashboard={() => navigateTo('DASHBOARD')}
                />
              )}

              {currentRoute === 'LEAGUES' && (
                <ScholarLeagues
                  learner={currentLearner}
                  onCoinsUpdated={() => refreshCurrentLearner()}
                  onNavigateTo={r => navigateTo(r as any)}
                  onBackToDashboard={() => navigateTo('DASHBOARD')}
                />
              )}

              {currentRoute === 'SPIN_WHEEL' && (
                <DailySpinWheel
                  learner={currentLearner}
                  onSpinCompleted={() => refreshCurrentLearner()}
                />
              )}

              {currentRoute === 'REFERRAL' && (
                <ReferralProgramme
                  learner={currentLearner}
                  onRefreshLearner={() => refreshCurrentLearner()}
                />
              )}

              {currentRoute === 'QOTD' && (
                <QOTD learner={currentLearner} onRefreshLearner={() => refreshCurrentLearner()} />
              )}

              {currentRoute === 'CHALLENGES' && (
                <WeeklyChallenges
                  learner={currentLearner}
                  onRefreshLearner={() => refreshCurrentLearner()}
                  onLaunchChallenge={subj => navigateTo('QUIZ', { subjectId: subj, node: 'OLYMPIAD', questionCount: 15 })}
                />
              )}

              {(currentRoute === 'GIFT_STORE' || currentRoute === 'COIN_MALL') && (
                <GiftStore
                  learner={currentLearner}
                  onRefreshLearner={() => refreshCurrentLearner()}
                  onNavigateToPremium={() => navigateTo('PREMIUM')}
                />
              )}

              {currentRoute === 'CERTIFICATES' && <CertificateVault learner={currentLearner} />}

              {currentRoute === 'MASTER_CERT' && (
                <AnnualMasterCertificate
                  learner={currentLearner}
                  onCertificateIssued={() => refreshCurrentLearner()}
                />
              )}

              {currentRoute === 'PROFILE' && (
                <StudentProfile
                  learner={currentLearner}
                  onRefreshLearner={() => refreshCurrentLearner()}
                  onLogout={() => {
                    logout();
                    navigateTo('HOME');
                  }}
                />
              )}

              {currentRoute === 'SCHOLARSHIPS' && (
                <WorldwideScholarships
                  learner={currentLearner}
                  activeGrade={effectiveGrade}
                  onRefreshLearner={() => refreshCurrentLearner()}
                  onStartQuiz={(g) => navigateTo('QUIZ', { grade: g })}
                />
              )}

              {currentRoute === 'STREAKS' && (
                <StreakEngine
                  learner={currentLearner}
                  onBuyFreeze={() => navigateTo('GIFT_STORE')}
                />
              )}

              {currentRoute === 'OFFLINE_BANK' && <OfflineBankView learner={currentLearner} />}

              {currentRoute === 'PREMIUM' && (
                <PremiumCenter
                  learner={currentLearner}
                  onRefreshLearner={() => refreshCurrentLearner()}
                  onOpenACodeModal={() => setAcodeModalOpen(true)}
                />
              )}
            </>
          )}

          {/* 404 Fallback View */}
          {currentRoute === 'NOT_FOUND' && (
            <NotFoundPika
              onNavigateHome={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
              onNavigateCourses={() => navigateTo(isAuthenticated ? 'COURSES' : 'PUBLIC_COURSES')}
              isAuthenticated={isAuthenticated}
            />
          )}

          {/* Direct Checkout View */}
          {checkoutPlanTier && currentLearner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
              <div className="my-8 w-full max-w-2xl">
                <UPIQRCheckout
                  planTier={checkoutPlanTier}
                  learnerId={currentLearner.id}
                  onBack={() => setCheckoutPlanTier(null)}
                  onSuccess={utr => {
                    setCheckoutPlanTier(null);
                    refreshCurrentLearner();
                    navigateTo('PREMIUM');
                  }}
                />
              </div>
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* PUBLIC FOOTER (Modern Light Mode Multi-Column)            */}
        {/* ======================================================== */}
        <footer className={`bg-white text-slate-600 border-t border-slate-200 pt-10 sm:pt-12 ${currentRoute !== 'QUIZ' ? 'pb-24 lg:pb-14' : 'pb-12'} px-4 sm:px-6 lg:px-8 text-xs font-sans`}>
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Brand Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                  AL
                </div>
                <div>
                  <span className="font-black text-slate-900 text-sm sm:text-base tracking-wider uppercase block leading-none">
                    AcademicLevel
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    Learn in your era • Special Offer
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono space-y-0.5 sm:text-right">
                <p>
                  Operated by{' '}
                  <a
                    href="https://zingquark.academiclevel.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    ZingQuark (ZQ Technology)
                  </a>
                </p>
                <p>UDYAM Reg: UDYAM-OD-19-0189385 • Contact: academiclevels@gmail.com</p>
              </div>
            </div>

            {/* 4 Standard Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-xs">
              {/* 1. CURRICULUM */}
              <div className="space-y-2.5">
                <h4 className="text-slate-900 font-extrabold uppercase text-[11px] tracking-wider">Curriculum</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('CURRICULUM_CBSE')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      CBSE Classes 1–12
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('CURRICULUM_OLYMPIAD')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Olympiad &amp; Foundations
                    </button>
                  </li>
                </ul>
              </div>

              {/* 2. MEMBERSHIPS */}
              <div className="space-y-2.5">
                <h4 className="text-slate-900 font-extrabold uppercase text-[11px] tracking-wider">Memberships</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('SPECIAL_49_FUNNEL')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Special ₹49 Pass
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutPlanTier('PLUS');
                        if (!isAuthenticated) {
                          setAuthModalMode('REGISTER');
                          setAuthModalOpen(true);
                        } else if (!quota?.hasActiveSubscription) {
                          setPaywallModalOpen(true);
                        } else {
                          navigateTo('DASHBOARD');
                        }
                      }}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Plus Pass (₹129)
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutPlanTier('GOLD');
                        if (!isAuthenticated) {
                          setAuthModalMode('REGISTER');
                          setAuthModalOpen(true);
                        } else if (!quota?.hasActiveSubscription) {
                          setPaywallModalOpen(true);
                        } else {
                          navigateTo('DASHBOARD');
                        }
                      }}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      1-Year Gold VIP (₹205)
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('SCHOOL_PORTAL')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      School Portal
                    </button>
                  </li>
                </ul>
              </div>

              {/* 3. FEATURES */}
              <div className="space-y-2.5">
                <h4 className="text-slate-900 font-extrabold uppercase text-[11px] tracking-wider">Features</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('NOVA_AI')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Nova AI Tutor
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('GIFT_STORE')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Scholar&apos;s Gift Store
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('VERIFY_CERTIFICATE')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Verify Certificate
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('BLOG')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      AcademicLevel Blog
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('DOWNLOADS')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Downloads (Windows App)
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('SITEMAP')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Sitemap Directory
                    </button>
                  </li>
                </ul>
              </div>

              {/* 4. LEGAL & SAFETY */}
              <div className="space-y-2.5">
                <h4 className="text-slate-900 font-extrabold uppercase text-[11px] tracking-wider">Legal &amp; Safety</h4>
                <ul className="space-y-2 text-slate-600">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('PRIVACY')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Policies &amp; Privacy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('TERMS')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('TERMS')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      20-Min Refund Policy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('SAFETY')}
                      className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                    >
                      Child Safety Protocol
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigateTo('ACCOUNT_DELETION')}
                      className="hover:text-rose-600 transition-colors cursor-pointer text-left font-medium"
                    >
                      Delete Account (/delacc)
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Row: Language Switcher, Social Links, and Copyright */}
            <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {/* Language Switcher Pill in Footer (Moved here to declutter mobile navbar) */}
                <button
                  type="button"
                  onClick={() => setShowPromptModal(true)}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Change UI Language"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'hi' ? '🇮🇳 भाषा: हिन्दी (Change)' : '🌐 Language: English (Change)'}</span>
                </button>

                {/* Social media links */}
                <div className="flex items-center space-x-2">
                  <a
                    href="https://www.youtube.com/@academiclevels"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                    title="YouTube"
                    aria-label="YouTube"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com/academiclevel1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                    title="Instagram"
                    aria-label="Instagram"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                  <a
                    href="mailto:academiclevels@gmail.com"
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                    title="Support Email: academiclevels@gmail.com"
                    aria-label="Email Support"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                  <button
                    type="button"
                    onClick={() => navigateTo('HALL_OF_FAME')}
                    className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                    title="Security & Bug Bounty Hall of Fame"
                    aria-label="Security"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Exact Copyright line */}
              <div className="text-slate-500 text-xs text-center md:text-right">
                &copy; {new Date().getFullYear()} AcademicLevel (
                <a
                  href="https://zingquark.academiclevel.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  ZingQuark
                </a>
                ). All rights reserved.
              </div>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={mode => {
            refreshCurrentLearner();
            if (pendingRedirectRoute) {
              const dest = pendingRedirectRoute;
              setPendingRedirectRoute(null);
              navigateTo(dest);
            } else {
              navigateTo('DASHBOARD');
            }
          }}
          initialMode={authModalMode}
          onNavigateToSpecial49={() => {
            setAuthModalOpen(false);
            navigateTo('SPECIAL_49_FUNNEL');
          }}
        />

        <PaywallGateModal
          isOpen={paywallModalOpen && !quota?.hasActiveSubscription}
          hasActiveSubscription={quota?.hasActiveSubscription}
          onClose={() => setPaywallModalOpen(false)}
          quizzesCompleted={quota?.quizzesCompleted || 0}
          levelsCompleted={quota?.levelsCompleted || 0}
          reason={quota?.reason}
          onSelectPlan={tier => {
            setPaywallModalOpen(false);
            setCheckoutPlanTier(tier);
          }}
          onOpenACode={() => {
            setPaywallModalOpen(false);
            setAcodeModalOpen(true);
          }}
        />

        {/* INCOMPLETE QUIZ EXIT PROTECTION MODAL (Item B: Scary Red X + Parent PIN Prompt) */}
        {quizExitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-900 space-y-5 relative">
              {/* Big Red Warning X Icon */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-rose-600 shadow-sm animate-pulse">
                <XOctagon className="w-9 h-9 stroke-[2.5]" />
              </div>

              {/* Scary Heading */}
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight leading-snug">
                  Was this a internet error? Or have you left on Purpose?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === 'hi'
                    ? 'Quiz beech mein chhodne se attempt cancel ho jayega aur Study Coins nahi milenge!'
                    : 'Exiting will void your quiz attempt, and unearned XP & Study Coins will be lost!'}
                </p>
              </div>

              {/* Parent Security Check Container */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                <div className="text-center">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wide block">
                    Parent Security Check
                  </span>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {language === 'hi'
                      ? 'Quiz se exit karne ke liye Parent PIN enter karein ya Return to Quiz click karein'
                      : 'Enter parent pin to exit or return to quiz'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="password"
                    maxLength={6}
                    value={exitPinInput}
                    onChange={e => {
                      setExitPinInput(e.target.value);
                      setExitPinError('');
                    }}
                    placeholder={language === 'hi' ? '4-digit Parent PIN enter karo' : 'Enter 4-digit Parent PIN'}
                    className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 px-4 bg-white border-2 border-rose-300 rounded-xl focus:outline-none focus:border-rose-600 text-slate-900"
                  />
                  {exitPinError && (
                    <p className="text-xs font-semibold text-rose-600 text-center">
                      {exitPinError}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setQuizExitModalOpen(false);
                    setPendingQuizExit(null);
                    setExitPinInput('');
                    setExitPinError('');
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{language === 'hi' ? 'Return to Quiz (Wapas Chalo)' : 'Return to Quiz'}</span>
                </button>
                <button
                  onClick={() => {
                    const correctPin = (effectiveLearner?.parentPin || '1234').trim();
                    if (exitPinInput.trim() === correctPin) {
                      setQuizExitModalOpen(false);
                      setExitPinInput('');
                      setExitPinError('');
                      const target = pendingQuizExit;
                      setPendingQuizExit(null);
                      if (target) {
                        navigateTo(target.route, { ...target.extra, forceExit: true });
                      } else {
                        navigateTo('DASHBOARD', { forceExit: true });
                      }
                    } else {
                      setExitPinError(language === 'hi' ? 'Galat Parent PIN. Parent se pucho ya Return to Quiz click karo.' : 'Incorrect Parent PIN. Ask your parent or click Return to Quiz.');
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'Confirm Exit (Requires Parent PIN)' : 'Confirm Exit (Requires Parent PIN)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentLearner && (
          <StudentMailboxModal
            isOpen={globalMailboxOpen}
            onClose={() => setGlobalMailboxOpen(false)}
            learnerId={currentLearner.id}
            initialSelectedMessageId={dashboardActiveReportId}
            onNavigateToQuiz={(sId) => {
              setGlobalMailboxOpen(false);
              navigateTo('COURSES', sId ? { subjectId: sId } : undefined);
            }}
            onOpenNovaAi={() => {
              setGlobalMailboxOpen(false);
              navigateTo('NOVA_AI');
            }}
          />
        )}

        {acodeModalOpen && currentLearner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <ACodesRedemption
              learner={currentLearner}
              onSuccess={() => {
                setAcodeModalOpen(false);
                refreshCurrentLearner();
              }}
              onCancel={() => setAcodeModalOpen(false)}
            />
          </div>
        )}

        {/* Persistent App-Style Bottom Navigation Bar (Mobile & Small Tablets Only) */}
        {currentRoute !== 'QUIZ' && (
          <nav
            aria-label="Mobile Navigation"
            className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-6px_24px_-6px_rgba(15,23,42,0.12)] pb-safe"
          >
            {isAuthenticated ? (
              <div className="grid grid-cols-5 h-16 px-1 max-w-lg mx-auto items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('DASHBOARD');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute === 'DASHBOARD' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`p-1 rounded-xl ${currentRoute === 'DASHBOARD' ? 'bg-indigo-50' : ''}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-none ${currentRoute === 'DASHBOARD' ? 'font-extrabold' : 'font-semibold'}`}>
                    {language === 'hi' ? 'Home' : 'Home'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('COURSES');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute === 'COURSES' || currentRoute === 'LEVELS' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`p-1 rounded-xl ${currentRoute === 'COURSES' || currentRoute === 'LEVELS' ? 'bg-indigo-50' : ''}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-none ${currentRoute === 'COURSES' || currentRoute === 'LEVELS' ? 'font-extrabold' : 'font-semibold'}`}>
                    {language === 'hi' ? 'Study' : 'Courses'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('NOVA_AI');
                  }}
                  className="flex flex-col items-center justify-center -mt-3 transition-all active:scale-95"
                >
                  <div
                    className={`md-fab w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                      currentRoute === 'NOVA_AI'
                        ? 'bg-[#303F9F] text-white ring-2 ring-[#C5CAE9]'
                        : 'bg-[#3F51B5] text-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-1 leading-none ${currentRoute === 'NOVA_AI' ? 'font-bold text-[#3F51B5]' : 'font-semibold text-[#616161]'}`}>
                    Nova AI
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('GIFT_STORE');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute === 'GIFT_STORE' || currentRoute === 'COIN_MALL' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`p-1 rounded-xl ${currentRoute === 'GIFT_STORE' || currentRoute === 'COIN_MALL' ? 'bg-amber-50' : ''}`}>
                    <Gift className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-none ${currentRoute === 'GIFT_STORE' || currentRoute === 'COIN_MALL' ? 'font-extrabold' : 'font-semibold'}`}>
                    {language === 'hi' ? 'Gifts' : 'Gifts'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('PROFILE');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute === 'PROFILE' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className={`p-1 rounded-xl ${currentRoute === 'PROFILE' ? 'bg-indigo-50' : ''}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-0.5 leading-none ${currentRoute === 'PROFILE' ? 'font-extrabold' : 'font-semibold'}`}>
                    Profile
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 h-16 px-2 max-w-md mx-auto items-center">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('HOME');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute === 'HOME' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 font-semibold'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[10px] mt-1 leading-none">Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('PUBLIC_COURSES');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute.startsWith('CURRICULUM') || currentRoute === 'PUBLIC_COURSES' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 font-semibold'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[10px] mt-1 leading-none">Syllabus</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('NOVA_AI');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute === 'NOVA_AI' ? 'text-pink-600 font-extrabold' : 'text-slate-500 font-semibold'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <span className="text-[10px] mt-1 leading-none">Nova AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('SPECIAL_49_FUNNEL');
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                    currentRoute === 'SPECIAL_49_FUNNEL' ? 'text-amber-600 font-extrabold' : 'text-amber-700 font-bold'
                  }`}
                >
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] mt-1 leading-none">₹49 Pass</span>
                </button>
              </div>
            )}
          </nav>
        )}

        {/* User Language Selection Modal */}
        <LanguagePreferenceModal />

        {/* Floating Student Study Booster Tools (Pomodoro Timer, Notes Scratchpad, Focus Mode Full Screen) */}
        <StudyToolsWidget />
      </div>
    </ErrorBoundary>
  );
};
