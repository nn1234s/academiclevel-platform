import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './core/auth/AuthContext';
import { Board, Grade, LevelNode, Question } from './core/types';
import { QuotaService } from './services/quotaService';
import { ErrorBoundary } from './modules/shared/ErrorBoundary';
import { PaywallGateModal } from './modules/shared/PaywallGateModal';
import { AuthModal } from './modules/shared/AuthModal';

// Public Pages
import { LandingPage } from './modules/public/LandingPage';
import { AdsLandingPage } from './modules/public/AdsLandingPage';
import { SecretAdPage } from './modules/public/SecretAdPage';
import { PublicCourses } from './modules/public/PublicCourses';
import { PricingPage } from './modules/public/PricingPage';
import { AboutPage } from './modules/public/AboutPage';
import { FAQPage } from './modules/public/FAQPage';
import { LegalPages } from './modules/public/LegalPages';

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

function resolveRouteFromPath(path: string, isAuth: boolean): string {
  const p = path.toLowerCase().replace(/\/$/, '');
  if (p === '/adminservice' || p === '/ops-vault-al99') return 'ADMIN_VAULT';
  if (p === '/ads') return 'ADS_FUNNEL';
  if (p === '/advert1') return 'ADVERT1_FUNNEL';
  if (p === '/pricing') return 'PRICING';
  if (p === '/about') return 'ABOUT';
  if (p === '/faq') return 'FAQ';
  if (p === '/privacy') return 'PRIVACY';
  if (p === '/terms') return 'TERMS';
  if (p === '/safety') return 'SAFETY';

  if (p === '/curriculum' || p === '/courses') return isAuth ? 'COURSES' : 'PUBLIC_COURSES';

  if (isAuth) {
    if (p === '' || p === '/dashboard') return 'DASHBOARD';
    if (p === '/nova' || p === '/nova-ai') return 'NOVA_AI';
    if (p === '/community') return 'COMMUNITY';
    if (p === '/spin' || p === '/spin-wheel') return 'SPIN_WHEEL';
    if (p === '/referral' || p === '/referrals') return 'REFERRAL';
    if (p === '/coins' || p === '/coin-mall') return 'COIN_MALL';
    if (p === '/gifts' || p === '/gift-store') return 'GIFT_STORE';
    if (p === '/certificates') return 'CERTIFICATES';
    if (p === '/master-certificate') return 'MASTER_CERT';
    if (p === '/profile') return 'PROFILE';
    if (p === '/streaks') return 'STREAKS';
    if (p === '/offline-bank') return 'OFFLINE_BANK';
    if (p === '/premium') return 'PREMIUM';
    if (p === '/qotd') return 'QOTD';
    if (p === '/challenges') return 'CHALLENGES';
  } else {
    if (p === '') return 'HOME';
  }

  return p === '' ? (isAuth ? 'DASHBOARD' : 'HOME') : 'NOT_FOUND';
}

function getPathForRoute(route: string): string {
  switch (route) {
    case 'ADMIN_VAULT': return '/adminservice';
    case 'ADS_FUNNEL': return '/ads';
    case 'ADVERT1_FUNNEL': return '/advert1';
    case 'PRICING': return '/pricing';
    case 'ABOUT': return '/about';
    case 'FAQ': return '/faq';
    case 'PUBLIC_COURSES': return '/curriculum';
    case 'PRIVACY': return '/privacy';
    case 'TERMS': return '/terms';
    case 'SAFETY': return '/safety';
    case 'DASHBOARD': return '/';
    case 'COURSES': return '/courses';
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
    default: return '/';
  }
}

export const App: React.FC = () => {
  const { currentLearner, isAuthenticated, isSuperAdmin, logout, refreshCurrentLearner } = useAuth();

  // Route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return resolveRouteFromPath(window.location.pathname, false);
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

  // Authenticated learners are automatically sent to their workspace dashboard (no public landing)
  useEffect(() => {
    if (isAuthenticated && currentRoute === 'HOME') {
      setCurrentRoute('DASHBOARD');
    }
  }, [isAuthenticated, currentRoute]);

  // Synchronize URL popstate
  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolveRouteFromPath(window.location.pathname, isAuthenticated);
      setCurrentRoute(resolved);
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

  // Ad Campaign Funnel 2 (/ads) -> High School Board Exam Accelerator (Classes 8, 9 & 10)
  if (currentRoute === 'ADS_FUNNEL') {
    return (
      <AdsLandingPage
        onSuccessRegistered={() => {
          navigateTo('DASHBOARD');
        }}
      />
    );
  }

  // Ad Campaign Funnel 1 (/advert1) -> Primary & Middle Concept Booster (Classes 3 to 7, Class 5 Focus)
  if (currentRoute === 'ADVERT1_FUNNEL') {
    return (
      <SecretAdPage
        onSuccessRegistered={() => {
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
                    onClick={() => navigateTo('PRICING')}
                    className={`px-3 py-2 rounded-xl transition-all ${
                      currentRoute === 'PRICING' ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Pricing
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
                    className="hidden sm:inline-block text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('REGISTER');
                      setAuthModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all"
                  >
                    Start Free (25 Quizzes)
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
                  onClick={() => navigateTo('PRICING')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Pricing
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
                  onClick={() => navigateTo('PROFILE')}
                  className="w-full text-left p-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Student Profile & Parent PIN
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
            <div className="max-w-xl mx-auto my-12 p-8 sm:p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Compass className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                404 — Node Not Found
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-3">Page or Curriculum Node Not Found</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                The requested URL path was not found or requires student authentication.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => navigateTo(isAuthenticated ? 'DASHBOARD' : 'HOME')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950 transition-all"
                >
                  {isAuthenticated ? 'Return to Dashboard' : 'Back to Home'}
                </button>
              </div>
            </div>
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
              <a
                href="https://edtechcenturyblog.blogspot.com/2026/11/academiclevel-most-innovative-edtech.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Most Innovative EdTech (EdTech Century)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={() => navigateTo('PRIVACY')} className="hover:text-slate-300">
                Privacy Policy (DPDP 2023)
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
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-[10px] text-indigo-400 font-mono border border-slate-800">
                v1.0.0-PROD
              </span>
              <p className="text-[10px] text-slate-600 mt-1">© 2026 AcademicLevel Technologies Pvt. Ltd.</p>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
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
