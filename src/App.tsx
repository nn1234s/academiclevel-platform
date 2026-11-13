import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './core/auth/AuthContext';
import { StorageRLSLayer } from './core/storage/StorageRLSLayer';
import { Board, Grade, LevelNode, Question } from './core/types';
import { QuotaService } from './services/quotaService';
import { ErrorBoundary } from './modules/shared/ErrorBoundary';
import { PaywallGateModal } from './modules/shared/PaywallGateModal';
import { AuthModal } from './modules/shared/AuthModal';

// Public Pages
import { LandingPage } from './modules/public/LandingPage';
import { AdsLandingPage } from './modules/public/AdsLandingPage';
import { SecretAdPage } from './modules/public/SecretAdPage';
import { Special49AdsLandingPage } from './modules/public/Special49AdsLandingPage';
import { PublicCourses } from './modules/public/PublicCourses';
import { PricingPage } from './modules/public/PricingPage';
import { AboutPage } from './modules/public/AboutPage';
import { FAQPage } from './modules/public/FAQPage';
import { LegalPages } from './modules/public/LegalPages';
import { CertificateVerificationView } from './modules/public/CertificateVerificationView';
import { HallOfFamePage } from './modules/public/HallOfFamePage';
import { InnovativeEdtechPage } from './modules/public/InnovativeEdtechPage';
import { NotFoundPika } from './modules/public/NotFoundPika';

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
  ExternalLink
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
  '/nova': 'NOVA_AI',
  '/nova-ai': 'NOVA_AI',
  '/community': 'COMMUNITY',
  '/spin': 'SPIN_WHEEL',
  '/spin-wheel': 'SPIN_WHEEL',
  '/referral': 'REFERRAL',
  '/referrals': 'REFERRAL',
  '/coins': 'COIN_MALL',
  '/coin-mall': 'COIN_MALL',
  '/gifts': 'GIFT_STORE',
  '/gift-store': 'GIFT_STORE',
  '/certificates': 'CERTIFICATES',
  '/master-certificate': 'MASTER_CERT',
  '/profile': 'PROFILE',
  '/streaks': 'STREAKS',
  '/offline-bank': 'OFFLINE_BANK',
  '/premium': 'PREMIUM',
  '/qotd': 'QOTD',
  '/challenges': 'CHALLENGES',
  '/scholarships': 'SCHOLARSHIPS'
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

function resolveRouteFromPath(path: string, isAuth: boolean): RouteResolution {
  const p = path.toLowerCase().replace(/\/$/, '');

  // 1. Super-Admin Vault
  if (p === '/adminservice' || p === '/ops-vault-al99') {
    return { route: 'ADMIN_VAULT' };
  }

  // 2. Advertising & Campaign Landing Pages (Additional Module)
  if (ADS_ROUTES[p]) {
    if (isAuth) {
      // Intelligently redirect already-authenticated students
      if (p === '/ad' || p === '/ads') {
        return { route: 'DASHBOARD' };
      }
      return { route: 'PREMIUM' };
    }
    return { route: 'SPECIAL_49_FUNNEL' };
  }

  // 3. Public static pages
  if (p === '/pricing') return { route: 'PRICING' };
  if (p === '/about') return { route: 'ABOUT' };
  if (p === '/faq') return { route: 'FAQ' };
  if (p === '/privacy' || p === '/policies' || p === '/policies.html' || p === '/policy' || p === '/privacy.html') return { route: 'PRIVACY' };
  if (p === '/terms' || p === '/terms.html' || p === '/terms-of-use') return { route: 'TERMS' };
  if (p === '/safety' || p === '/children' || p === '/student-safety') return { route: 'SAFETY' };
  if (p === '/halloffame' || p === '/hall-of-fame' || p === '/security' || p === '/security/hall-of-fame') return { route: 'HALL_OF_FAME' };
  if (
    p === '/innovative-edtech' ||
    p === '/most-innovative-edtech' ||
    p === '/award' ||
    p === '/awards' ||
    p === '/edtech-century' ||
    p === '/edtech-award'
  ) return { route: 'INNOVATIVE_EDTECH' };

  if (p === '/curriculum') return { route: isAuth ? 'COURSES' : 'PUBLIC_COURSES' };
  if (p.startsWith('/verify')) return { route: 'VERIFY_CERTIFICATE' };

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
    case 'SPECIAL_49_FUNNEL': return '/special49';
    case 'ADS_FUNNEL': return '/special49';
    case 'ADVERT1_FUNNEL': return '/special49';
    case 'YT_ADS_FUNNEL': return '/special49';
    case 'PRICING': return '/pricing';
    case 'ABOUT': return '/about';
    case 'FAQ': return '/faq';
    case 'PUBLIC_COURSES': return '/curriculum';
    case 'PRIVACY': return '/privacy';
    case 'TERMS': return '/terms';
    case 'SAFETY': return '/safety';
    case 'HALL_OF_FAME': return '/halloffame';
    case 'INNOVATIVE_EDTECH': return '/most-innovative-edtech';
    case 'VERIFY_CERTIFICATE': return '/verify';
    case 'DASHBOARD': return '/';
    case 'COURSES': return '/courses';
    case 'LEVELS': return '/levels';
    case 'QUIZ': return '/quiz';
    case 'NOVA_AI': return '/nova-ai';
    case 'COMMUNITY': return '/community';
    case 'SPIN_WHEEL': return '/spin-wheel';
    case 'REFERRAL': return '/referral';
    case 'COIN_MALL': return '/coin-mall';
    case 'GIFT_STORE': return '/gift-store';
    case 'CERTIFICATES': return '/certificates';
    case 'MASTER_CERT': return '/master-certificate';
    case 'PROFILE': return '/profile';
    case 'STREAKS': return '/streaks';
    case 'OFFLINE_BANK': return '/offline-bank';
    case 'PREMIUM': return '/premium';
    case 'QOTD': return '/qotd';
    case 'CHALLENGES': return '/challenges';
    case 'SCHOLARSHIPS': return '/scholarships';
    default: return '/';
  }
}

export const App: React.FC = () => {
  const { currentLearner, isAuthenticated, isAuthLoading, isSuperAdmin, logout, refreshCurrentLearner } = useAuth();

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

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [paywallModalOpen, setPaywallModalOpen] = useState(false);
  const [acodeModalOpen, setAcodeModalOpen] = useState(false);
  const [checkoutPlanTier, setCheckoutPlanTier] = useState<'LITE' | 'PLUS' | null>(null);

  // Active quiz context
  const [activeSubjectId, setActiveSubjectId] = useState<string>('math');
  const [activeLevelNode, setActiveLevelNode] = useState<LevelNode>('FOUNDATION');
  const [activeGradeOverride, setActiveGradeOverride] = useState<Grade | null>(null);
  const [novaQuestionContext, setNovaQuestionContext] = useState<{
    q: Question;
    chosenIdx: number;
  } | null>(null);

  // Mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Synchronize URL popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
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

  // Push URL with popstate support
  const navigateTo = (route: string, extra?: any) => {
    setCurrentRoute(route);
    setMobileMenuOpen(false);

    if (typeof window !== 'undefined') {
      const targetPath = getPathForRoute(route);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }

    if (extra?.subjectId) setActiveSubjectId(extra.subjectId);
    if (extra?.node) setActiveLevelNode(extra.node);
    if (extra?.grade) setActiveGradeOverride(extra.grade);
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
    // If student is already authenticated, intelligently direct them to Premium Center / Dashboard
    // without forcing them through the raw ad conversion funnel (Additional Module requirement)
    if (isAuthenticated) {
      navigateTo('PREMIUM');
      return null;
    }

    return (
      <Special49AdsLandingPage
        onSuccessRegistered={() => {
          refreshCurrentLearner();
          navigateTo('DASHBOARD');
        }}
      />
    );
  }

  return (
    <ErrorBoundary fallbackTitle="AcademicLevel Platform Error">
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* ======================================================== */}
        {/* HEADER / NAVIGATION BAR (Zero Admin Links)               */}
        {/* ======================================================== */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Brand Logo */}
            <div
              onClick={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-950 group-hover:scale-105 transition-transform">
                AL
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  AcademicLevel
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Learn in your era</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigateTo('HOME')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'HOME' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => navigateTo('PUBLIC_COURSES')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'PUBLIC_COURSES' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Curriculum
                  </button>
                  <button
                    onClick={() => navigateTo('SPECIAL_49_FUNNEL')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'SPECIAL_49_FUNNEL' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Special ₹49 Offer
                  </button>
                  <button
                    onClick={() => navigateTo('ABOUT')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'ABOUT' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => navigateTo('FAQ')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'FAQ' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    FAQ
                  </button>
                  <button
                    onClick={() => navigateTo('HALL_OF_FAME')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1 ${
                      currentRoute === 'HALL_OF_FAME' ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bug Bounty</span>
                  </button>
                  <button
                    onClick={() => navigateTo('INNOVATIVE_EDTECH')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                      currentRoute === 'INNOVATIVE_EDTECH'
                        ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30'
                        : 'text-amber-300/90 hover:text-amber-300'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>#1 EdTech Award</span>
                  </button>
                </>
              ) : (
                /* Authenticated Student Navigation */
                <>
                  <button
                    onClick={() => navigateTo('DASHBOARD')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'DASHBOARD' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigateTo('COURSES')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'COURSES' || currentRoute === 'LEVELS' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Courses
                  </button>
                  <button
                    onClick={() => navigateTo('NOVA_AI')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'NOVA_AI' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Nova AI Tutor
                  </button>
                  <button
                    onClick={() => navigateTo('COMMUNITY')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'COMMUNITY' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    StudentPacks
                  </button>
                  <button
                    onClick={() => navigateTo('COIN_MALL')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'COIN_MALL' || currentRoute === 'GIFT_STORE' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Coin Mall
                  </button>
                  <button
                    onClick={() => navigateTo('CERTIFICATES')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'CERTIFICATES' || currentRoute === 'MASTER_CERT' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Certificates
                  </button>
                </>
              )}
            </nav>

            {/* User Profile / Auth Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      setAuthModalMode('LOGIN');
                      setAuthModalOpen(true);
                    }}
                    className="hidden sm:inline-flex items-center text-xs font-bold text-indigo-300 hover:text-white px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all cursor-pointer"
                  >
                    Sign In (Existing User)
                  </button>
                  <button
                    onClick={() => navigateTo('SPECIAL_49_FUNNEL')}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-950 transition-all cursor-pointer"
                  >
                    Special ₹49 Offer
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Coin Badge */}
                  <button
                    onClick={() => navigateTo('COIN_MALL')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    <span>{currentLearner?.coinBalance || 0}</span>
                  </button>

                  {/* Profile Button */}
                  <button
                    onClick={() => navigateTo('PROFILE')}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline truncate max-w-[120px]">
                      {currentLearner?.fullName.split(' ')[0]}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      navigateTo('HOME');
                    }}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-xs font-semibold">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalMode('LOGIN');
                    setAuthModalOpen(true);
                  }}
                  className="w-full text-left p-2.5 rounded-xl text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20"
                >
                  Sign In (Existing User)
                </button>
                <button
                  onClick={() => navigateTo('HOME')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Home
                </button>
                <button
                  onClick={() => navigateTo('PUBLIC_COURSES')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Curriculum & Boards
                </button>
                <button
                  onClick={() => navigateTo('SPECIAL_49_FUNNEL')}
                  className="w-full text-left p-2.5 rounded-xl text-amber-400 font-bold hover:bg-slate-800"
                >
                  Special ₹49 Offer
                </button>
                <button
                  onClick={() => navigateTo('ABOUT')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  About Us
                </button>
                <button
                  onClick={() => navigateTo('FAQ')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  FAQ
                </button>
                <button
                  onClick={() => navigateTo('HALL_OF_FAME')}
                  className="w-full text-left p-2.5 rounded-xl text-blue-400 font-semibold hover:bg-slate-800 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Security &amp; Bug Bounty</span>
                </button>
                <button
                  onClick={() => navigateTo('INNOVATIVE_EDTECH')}
                  className="w-full text-left p-2.5 rounded-xl text-amber-300 font-semibold hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>🏆 #1 Most Innovative EdTech</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('DASHBOARD')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigateTo('COURSES')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Course Catalogue
                </button>
                <button
                  onClick={() => navigateTo('NOVA_AI')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Nova AI Socratic Tutor
                </button>
                <button
                  onClick={() => navigateTo('COMMUNITY')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  StudentPacks Community
                </button>
                <button
                  onClick={() => navigateTo('SPIN_WHEEL')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Daily Spin Wheel
                </button>
                <button
                  onClick={() => navigateTo('REFERRAL')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Referral Programme (+40 Coins)
                </button>
                <button
                  onClick={() => navigateTo('COIN_MALL')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Study Coin Mall
                </button>
                <button
                  onClick={() => navigateTo('GIFT_STORE')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Scholar&apos;s Gift Store
                </button>
                <button
                  onClick={() => navigateTo('CERTIFICATES')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Certificate Vault
                </button>
                <button
                  onClick={() => navigateTo('PREMIUM')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Membership Center (UPI)
                </button>
                <button
                  onClick={() => navigateTo('SCHOLARSHIPS')}
                  className="w-full text-left p-2.5 rounded-xl text-amber-300 hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Worldwide Scholarships</span>
                </button>
                <button
                  onClick={() => navigateTo('PROFILE')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800 flex items-center space-x-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Student Profile & Parent PIN</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigateTo('HOME');
                  }}
                  className="w-full text-left p-2.5 rounded-xl text-rose-400 font-bold hover:bg-rose-500/10 flex items-center space-x-2 border-t border-slate-800 mt-2 pt-3"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out ({currentLearner?.fullName.split(' ')[0] || 'Student'})</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN BODY VIEW CONTAINER                                */}
        {/* ======================================================== */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
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
          {currentRoute === 'PUBLIC_COURSES' && (
            <PublicCourses
              onSelectTrack={(b, g) => {
                setAuthModalMode('REGISTER');
                setAuthModalOpen(true);
              }}
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
          {currentRoute === 'HALL_OF_FAME' && (
            <HallOfFamePage onNavigateHome={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')} />
          )}
          {currentRoute === 'INNOVATIVE_EDTECH' && (
            <InnovativeEdtechPage onBack={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')} />
          )}
          {currentRoute === 'VERIFY_CERTIFICATE' && (
            <CertificateVerificationView
              token={typeof window !== 'undefined' ? window.location.pathname.replace(/^\/verify\/?/, '') : ''}
              onNavigateHome={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
            />
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
                  onOpenUpgradeModal={() => setPaywallModalOpen(true)}
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
                  onStartQuiz={node => navigateTo('QUIZ', { node })}
                  onOpenUpgradeModal={() => setPaywallModalOpen(true)}
                />
              )}

              {currentRoute === 'QUIZ' && (
                <QuizEngine
                  board={currentLearner.board}
                  grade={effectiveGrade}
                  subjectId={activeSubjectId}
                  levelNode={activeLevelNode}
                  learner={effectiveLearner}
                  onFinish={() => {
                    refreshCurrentLearner();
                    navigateTo('DASHBOARD');
                  }}
                  onOpenNovaAi={(q, chosenIdx) => {
                    setNovaQuestionContext({ q, chosenIdx });
                    navigateTo('NOVA_AI');
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

              {currentRoute === 'SPIN_WHEEL' && (
                <DailySpinWheel
                  learner={currentLearner}
                  onSpinCompleted={() => refreshCurrentLearner()}
                />
              )}

              {currentRoute === 'REFERRAL' && <ReferralProgramme learner={currentLearner} />}

              {currentRoute === 'QOTD' && (
                <QOTD learner={currentLearner} onRefreshLearner={() => refreshCurrentLearner()} />
              )}

              {currentRoute === 'CHALLENGES' && (
                <WeeklyChallenges
                  learner={currentLearner}
                  onRefreshLearner={() => refreshCurrentLearner()}
                  onLaunchChallenge={subj => navigateTo('QUIZ', { node: 'OLYMPIAD' })}
                />
              )}

              {currentRoute === 'COIN_MALL' && (
                <CoinMall
                  learner={currentLearner}
                  onRefreshLearner={() => refreshCurrentLearner()}
                  onNavigateToGiftStore={() => navigateTo('GIFT_STORE')}
                />
              )}

              {currentRoute === 'GIFT_STORE' && (
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
                  onBuyFreeze={() => navigateTo('COIN_MALL')}
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
        {/* PUBLIC FOOTER (Zero Admin Links)                         */}
        {/* ======================================================== */}
        <footer className="bg-slate-950 border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                  AL
                </div>
                <span className="font-extrabold text-white text-sm">AcademicLevel</span>
              </div>
              <p className="mt-1">
                &quot;Learn in your era&quot; — India&apos;s Premier AI-Powered K-12 Ecosystem.
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                CBSE • ICSE / CISCE • Cambridge IGCSE (Classes 1–12)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => navigateTo('INNOVATIVE_EDTECH')}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>#1 Most Innovative EdTech (EdTech Century)</span>
              </button>
              <button onClick={() => navigateTo('PRIVACY')} className="hover:text-slate-300">
                Policies &amp; Privacy
              </button>
              <button onClick={() => navigateTo('TERMS')} className="hover:text-slate-300">
                Terms of Service
              </button>
              <button onClick={() => navigateTo('SAFETY')} className="hover:text-slate-300">
                Child Safety Protocol
              </button>
              <button onClick={() => navigateTo('FAQ')} className="hover:text-slate-300">
                FAQ
              </button>
              <button
                onClick={() => navigateTo('HALL_OF_FAME')}
                className="hover:text-blue-300 text-blue-400 font-semibold flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security &amp; Bug Bounty</span>
              </button>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] text-indigo-400 font-mono border border-slate-800">
                v2.15.1s
              </span>
              <p className="text-[10px] text-slate-600 mt-1">© 2020–{new Date().getFullYear()} ZINGQUARK INDIA TECHNOLOGIES PVT LTD</p>
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
        />

        <PaywallGateModal
          isOpen={paywallModalOpen}
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
      </div>
    </ErrorBoundary>
  );
};
