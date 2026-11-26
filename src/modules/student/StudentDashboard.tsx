import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { Learner, Board, Grade, Subject, GiftRequest } from '../../core/types';
import { ApiClient } from '../../core/api/apiClient';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { QuotaService } from '../../services/quotaService';
import { CurriculumService } from '../../services/curriculumService';
import { CLASS_THEMES, getClassTheme } from '../../core/theme/classThemes';
import { ClassSwitcherBar } from '../shared/ClassSwitcherBar';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import { WorldwideScholarships } from './WorldwideScholarships';
import { LeoStickerBookModal, ALL_STICKERS } from './LeoStickerBookModal';
import {
  Flame,
  Award,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Compass,
  FileText,
  Star,
  Target,
  Trophy,
  ChevronRight,
  Layers,
  Check,
  Rocket,
  Atom,
  HelpCircle,
  BarChart3,
  Gift,
  Copy,
  ExternalLink,
  Package,
  Truck,
  MapPin,
  Crown,
  Mail,
  Printer,
  Swords,
  Share2
} from 'lucide-react';
import { StudentMailboxModal } from './StudentMailboxModal';
import { DailyQuestsWidget } from './DailyQuestsWidget';
import { ParentReportCardModal } from './ParentReportCardModal';
import { MailboxMessage } from '../../core/types';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { CoinLedgerService } from '../../services/coinLedgerService';
import { PracticeWorksheetViewer } from './PracticeWorksheetViewer';

interface StudentDashboardProps {
  learner: Learner;
  activeGradeOverride?: Grade | null;
  onSelectGradeOverride?: (grade: Grade) => void;
  onNavigate: (module: string, extra?: any) => void;
  onOpenUpgradeModal: () => void;
  onOpenMailbox?: (reportId?: string | null) => void;
  initialOpenMailbox?: boolean;
  initialMailboxReportId?: string | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  learner,
  activeGradeOverride,
  onSelectGradeOverride,
  onNavigate,
  onOpenUpgradeModal,
  onOpenMailbox,
  initialOpenMailbox = false,
  initialMailboxReportId = null,
}) => {
  const { refreshCurrentLearner } = useAuth();
  const { t, isHinglish } = useLanguage();

  // Student Mailbox & Parent Report State
  const [isMailboxOpen, setIsMailboxOpen] = useState<boolean>(false);
  const [selectedMailboxMessageId, setSelectedMailboxMessageId] = useState<string | null>(initialMailboxReportId);
  const [isParentReportOpen, setIsParentReportOpen] = useState<boolean>(false);

  const handleOpenMailboxModal = (msgId?: string | null) => {
    if (onOpenMailbox) {
      onOpenMailbox(msgId || null);
    } else {
      setSelectedMailboxMessageId(msgId || null);
      setIsMailboxOpen(true);
    }
  };
  const [unreadMailCount, setUnreadMailCount] = useState<number>(() => {
    return StorageRLSLayer.getUnreadMailboxCount(learner.id);
  });
  const [latestReportMsg, setLatestReportMsg] = useState<MailboxMessage | null>(() => {
    const msgs = StorageRLSLayer.getMailboxMessages(learner.id);
    return msgs.find(m => m.category === 'QUIZ_REPORT') || null;
  });
  const [activeMistakesCount, setActiveMistakesCount] = useState<number>(() => {
    try {
      const mistakes = StorageRLSLayer.getMistakesForLearner(learner.id);
      return mistakes.filter(m => !m.isMastered).length;
    } catch {
      return 0;
    }
  });

  // Practice Worksheets Modal & Unlock State (30 Coins / Redeem in 2 Quizzes)
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState<boolean>(false);
  const isWorksheetUnlocked = typeof window !== 'undefined' && (
    localStorage.getItem(`al_unlocked_worksheets_${learner.id}`) === 'true' ||
    (learner.metadataJson && JSON.parse(learner.metadataJson || '{}').unlockedWorksheets) ||
    learner.role === 'SUPER_ADMIN' ||
    learner.id === 'usr_super_admin_001' ||
    (learner as any).username?.toLowerCase() === 'super' ||
    learner.fullName?.toLowerCase() === 'super'
  );

  const handleQuickUnlockWorksheets = () => {
    if (isWorksheetUnlocked) {
      setIsWorksheetModalOpen(true);
      return;
    }
    const cost = 30;
    if (learner.coinBalance < cost) {
      onNavigate('GIFT_STORE');
      return;
    }
    const tx = CoinLedgerService.appendTransaction(learner.id, -cost, 'MALL_PURCHASE', {
      item: 'PRACTICE_WORKSHEETS_ALL_CLASSES'
    });
    if (tx.success) {
      localStorage.setItem(`al_unlocked_worksheets_${learner.id}`, 'true');
      refreshCurrentLearner();
      setIsWorksheetModalOpen(true);
    } else {
      onNavigate('GIFT_STORE');
    }
  };

  // Dispatched & Active Rewards State & Automatic Backend Sync
  const [dispatchedGifts, setDispatchedGifts] = useState<GiftRequest[]>(() => {
    return StorageRLSLayer.getGiftRequestsForLearner(learner.id).filter(
      r => r.status === 'APPROVED_DISPATCHED' || r.status === 'ORDERED' || r.status === 'SHIPPED' || r.status === 'DELIVERED'
    );
  });
  const [copiedGiftCode, setCopiedGiftCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialOpenMailbox) {
      setIsMailboxOpen(true);
      if (initialMailboxReportId) {
        setSelectedMailboxMessageId(initialMailboxReportId);
      }
    }
  }, [initialOpenMailbox, initialMailboxReportId]);

  useEffect(() => {
    StorageRLSLayer.checkAndDeliverNovaMailboxNotes(learner.id);
    setUnreadMailCount(StorageRLSLayer.getUnreadMailboxCount(learner.id));
    const msgs = StorageRLSLayer.getMailboxMessages(learner.id);
    setLatestReportMsg(msgs.find(m => m.category === 'QUIZ_REPORT') || null);

    // Periodically check for 20-min Nova mailbox delivery while student is active
    const interval = setInterval(() => {
      const newNote = StorageRLSLayer.checkAndDeliverNovaMailboxNotes(learner.id);
      if (newNote) {
        setUnreadMailCount(StorageRLSLayer.getUnreadMailboxCount(learner.id));
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [learner.id, isMailboxOpen]);

  useEffect(() => {
    refreshCurrentLearner();
    const fetchGifts = async () => {
      try {
        const res = await ApiClient.getMyGifts(learner.id);
        if (res && res.success && Array.isArray(res.requests)) {
          res.requests.forEach(r => StorageRLSLayer.saveGiftRequest(r));
          const dispatched = res.requests.filter(
            r => r.status === 'APPROVED_DISPATCHED' || r.status === 'ORDERED' || r.status === 'SHIPPED' || r.status === 'DELIVERED'
          );
          setDispatchedGifts(dispatched);
          return;
        }
      } catch {
        // Fallback to local storage
      }
      const local = StorageRLSLayer.getGiftRequestsForLearner(learner.id).filter(
        r => r.status === 'APPROVED_DISPATCHED' || r.status === 'ORDERED' || r.status === 'SHIPPED' || r.status === 'DELIVERED'
      );
      setDispatchedGifts(local);
    };
    fetchGifts();
  }, [learner.id]);

  const handleCopyGiftCode = (code: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code);
      } else {
        const el = document.createElement('textarea');
        el.value = code;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedGiftCode(id);
      setTimeout(() => setCopiedGiftCode(null), 3000);
    } catch (e) {
      console.error('Clipboard copy error:', e);
    }
  };

  const getExtractedVoucherCode = (req: GiftRequest): string => {
    if (req.voucherCode && req.voucherCode.trim()) return req.voucherCode.trim();
    const match = req.shippingAddress?.match(/Voucher Code:\s*([^\s|]+)/i);
    if (match && match[1]) return match[1].trim();
    return 'AL-GC-DISPATCHED';
  };

  const getGiftBrandHelp = (title: string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('amazon')) {
      return {
        brand: 'Amazon Pay',
        emoji: '📦',
        url: 'https://www.amazon.in/addgiftcard',
        instructions: 'Open Amazon App → Amazon Pay → Add Gift Card to balance, paste code.'
      };
    }
    if (t.includes('google') || t.includes('play')) {
      return {
        brand: 'Google Play',
        emoji: '🎮',
        url: 'https://play.google.com/redeem',
        instructions: 'Open Google Play Store → Profile → Payments & subscriptions → Redeem code.'
      };
    }
    if (t.includes('flipkart')) {
      return {
        brand: 'Flipkart',
        emoji: '🛍️',
        url: 'https://www.flipkart.com',
        instructions: 'Open Flipkart App → Account → My Cards & Wallet → Add Flipkart Gift Card.'
      };
    }
    if (t.includes('swiggy') || t.includes('zomato')) {
      return {
        brand: 'Swiggy / Zomato',
        emoji: '🍕',
        url: 'https://www.swiggy.com',
        instructions: 'Open Swiggy App → Account → Swiggy Money → Add Gift Card / Voucher.'
      };
    }
    return {
      brand: 'Direct UPI Transfer',
      emoji: '💸',
      url: '',
      instructions: 'Direct cash transfer processed to your UPI address. Check your UPI app!'
    };
  };
  // Leo's Star Sticker Book State
  const [isStickerBookOpen, setIsStickerBookOpen] = useState(false);

  const unlockedStickersCount = ALL_STICKERS.filter(s =>
    learner.role === 'SUPER_ADMIN' ? true : s.unlockCondition(learner)
  ).length;

  const isSuperAdmin = learner.role === 'SUPER_ADMIN';
  // Normal students always see the UI according to their sign up class (learner.grade)
  const activeGrade: Grade = (isSuperAdmin && activeGradeOverride) ? activeGradeOverride : (learner.grade || 10);

  const handleSelectGrade = (g: Grade) => {
    if (onSelectGradeOverride) {
      onSelectGradeOverride(g);
    }
  };

  const theme = getClassTheme(activeGrade);
  const quota = QuotaService.evaluateQuota(learner);
  const subjects = CurriculumService.getSubjects(learner.board, activeGrade);

  // 10th Board Exam countdown (Target: Feb 15)
  const boardExamDate = new Date(new Date().getFullYear() + 1, 1, 15);
  const daysToBoardExam = Math.max(1, Math.ceil((boardExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-4 sm:space-y-6 text-slate-900">
      {/* Super-Admin ONLY: Multi-Class Visual Preview Bar (Hidden for all students) */}
      {isSuperAdmin && (
        <ClassSwitcherBar
          activeGrade={activeGrade}
          onSelectGrade={handleSelectGrade}
        />
      )}

      {/* 2. Class-Specific Hero Banner */}
      <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-xl sm:shadow-2xl relative overflow-hidden transition-all duration-500 bg-gradient-to-r ${theme.gradientHero}`}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <span className="px-2.5 sm:px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 text-white">
                <span className="text-sm">{theme.mascot.emoji}</span>
                <span>{learner.board} • Class {activeGrade} • {theme.name}</span>
              </span>

              <span className="px-2.5 py-1 bg-black/25 backdrop-blur-md rounded-full text-[10px] font-mono font-bold tracking-wider text-white/90">
                {theme.stageTitle}
              </span>

              {quota.hasActiveSubscription && (
                quota.activePlan === 'GOLD' ? (
                  <span className="px-2.5 sm:px-3 py-1 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 border border-amber-400/40 backdrop-blur-md rounded-full text-[10px] font-black tracking-wider text-amber-200 flex items-center space-x-1.5 shadow-lg shadow-amber-950/40">
                    <Crown className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                    <span>👑 1-YEAR GOLD VIP PASS (365d) ACTIVE</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-500/30 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{quota.activePlan === 'LITE' ? 'Concept Booster (60d)' : `${quota.activePlan} Scholar`} Active</span>
                  </span>
                )
              )}
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black mt-1.5 sm:mt-2 leading-tight drop-shadow-sm">
              {isHinglish ? 'Wapas Swagat Hai' : 'Welcome back'}, {learner.fullName.split(' ')[0]}! {theme.mascot.emoji}
            </h1>

            <p className="text-xs sm:text-sm text-white/95 mt-1.5 sm:mt-2 leading-relaxed max-w-xl font-medium">
              &quot;{theme.motto}&quot;
            </p>

            {/* Mascot Tip / Speech Bubble */}
            <div className="mt-3 sm:mt-4 inline-flex items-center space-x-2 bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs text-white/90 shadow-md">
              <span className="text-sm sm:text-base flex-shrink-0">{theme.mascot.emoji}</span>
              <span className="italic line-clamp-2 sm:line-clamp-none">
                <strong>{theme.mascot.name}:</strong> &quot;{theme.greetingPhrases[0]}&quot;
              </span>
            </div>
          </div>

          {/* Quick Metrics Pod: Sleek 2x2 grid on mobile/tablet, crisp vertical stack on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5 bg-black/30 backdrop-blur-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/20 w-full lg:w-auto lg:min-w-[220px] shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/10 lg:bg-transparent p-2.5 lg:p-0 rounded-xl">
              <span className="text-[11px] lg:text-xs font-bold text-white/80">{isHinglish ? 'Study Streak:' : 'Study Streak'}</span>
              <div className="flex items-center space-x-1 font-black text-amber-300 mt-0.5 lg:mt-0 text-sm lg:text-xs">
                <Flame className="w-4 h-4 fill-amber-300" />
                <span>{learner.currentStreakDays} {isHinglish ? 'Din' : 'Days'}</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/10 lg:bg-transparent p-2.5 lg:p-0 rounded-xl lg:pt-2 lg:border-t lg:border-white/10">
              <span className="text-[11px] lg:text-xs font-bold text-white/80">{isHinglish ? 'Study Coins:' : 'Study Coins'}</span>
              <div className="flex items-center space-x-1.5 font-black text-amber-300 mt-0.5 lg:mt-0 text-sm lg:text-xs">
                <StudyCoinIcon className="w-4 h-4" glow />
                <span>{learner.coinBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/10 lg:bg-transparent p-2.5 lg:p-0 rounded-xl lg:pt-2 lg:border-t lg:border-white/10">
              <span className="text-[11px] lg:text-xs font-bold text-white/80">{isHinglish ? 'Question Bank:' : 'Questions'}</span>
              <span className="font-mono text-[11px] lg:text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full text-white w-fit mt-1 lg:mt-0">
                300 Quizzes
              </span>
            </div>

            <button
              onClick={() => handleOpenMailboxModal(null)}
              className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/15 hover:bg-white/25 lg:bg-transparent lg:hover:bg-white/10 p-2.5 lg:p-1.5 rounded-xl lg:pt-2 lg:border-t lg:border-white/10 transition-all cursor-pointer group text-left active:scale-[0.98]"
              title="Open Student Mailbox"
            >
              <span className="text-[11px] lg:text-xs font-bold text-white/95 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-200 group-hover:scale-110 transition-transform" />
                <span>{isHinglish ? 'Mailbox' : 'Mailbox'}</span>
              </span>
              <div className="flex items-center space-x-1 mt-1 lg:mt-0">
                {unreadMailCount > 0 ? (
                  <span className="font-mono text-[10px] lg:text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                    {unreadMailCount} {isHinglish ? 'Naye' : 'New'}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] lg:text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full text-white group-hover:bg-white/30 transition-colors">
                    Reports
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2.5 Celebratory Dispatched Gift Cards & Rewards Showcase */}
      {dispatchedGifts.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs">
                    <Gift className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isHinglish ? 'Official Reward Dispatch Ho Gaya' : 'Official Reward Dispatched'}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {dispatchedGifts.length} {isHinglish ? 'Reward Ready' : (dispatchedGifts.length === 1 ? 'Reward' : 'Rewards Ready')}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 flex items-center space-x-2">
                  <span>{isHinglish ? '🎁 Aapke Dispatched Gifts & Rewards' : '🎁 Your Dispatched Physical Rewards'}</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                  {isHinglish
                    ? 'Badhai ho! Aapka milestone physical merchandise redemption verify aur dispatch ho chuka hai. Niche courier tracking details dekhein.'
                    : 'Congratulations! Your academic milestone physical merchandise redemption has been verified and dispatched by the admin team. Track your courier parcel details below.'}
                </p>
              </div>

              <button
                onClick={() => onNavigate('GIFT_STORE')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-all self-start sm:self-auto flex-shrink-0 shadow-xs cursor-pointer"
              >
                <span>{isHinglish ? 'Rewards Store Kholein' : 'Physical Rewards Store'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {dispatchedGifts.map((gift) => {
                const isPhysical = gift.isPhysical || (gift.shippingAddress && (gift.shippingAddress.includes('[PHYSICAL DELIVERY]') || gift.shippingAddress.includes('[PHYSICAL DELIVERY VIA AMAZON]'))) || gift.itemTitle.toLowerCase().includes('bottle') || gift.itemTitle.toLowerCase().includes('squishy') || gift.itemTitle.toLowerCase().includes('blaster') || gift.itemTitle.toLowerCase().includes('stationery') || gift.itemTitle.toLowerCase().includes('badge') || gift.itemTitle.toLowerCase().includes('mystery') || gift.itemTitle.toLowerCase().includes('box');
                const isShipped = gift.status === 'SHIPPED';
                const isOrdered = gift.status === 'ORDERED';
                const isDelivered = gift.status === 'DELIVERED';
                const voucherCode = getExtractedVoucherCode(gift);
                const help = getGiftBrandHelp(gift.itemTitle);
                const isCopied = copiedGiftCode === gift.id;

                return (
                  <div
                    key={gift.id}
                    className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 relative group hover:border-emerald-400 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1.5">
                          {isPhysical ? (
                            <>
                              <Package className="w-3.5 h-3.5 text-amber-600" />
                              <span>Amazon Doorstep Delivery</span>
                            </>
                          ) : (
                            <>
                              <span className="text-base">{help.emoji}</span>
                              <span>{help.brand}</span>
                            </>
                          )}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isShipped
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : isOrdered
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {isDelivered
                              ? (isHinglish ? 'Doorstep Par Deliver Ho Gaya' : 'Delivered to Doorstep')
                              : isShipped
                              ? (isHinglish ? 'Dispatch Ho Gaya • Raste Me Hai' : 'Dispatched & In Transit')
                              : isOrdered
                              ? (isHinglish ? 'Courier Order Lag Chuka Hai' : 'Order Placed with Courier')
                              : (isHinglish ? 'Active & Verified' : 'Active & Verified')}
                          </span>
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {gift.itemTitle}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isHinglish ? `${gift.coinsCost.toLocaleString()} Study Coins se redeem kiya` : `Claimed with ${gift.coinsCost.toLocaleString()} Study Coins`}
                      </p>
                    </div>

                    {/* PHYSICAL ITEM COURIER TRACKING BOX */}
                    {isPhysical ? (
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-sky-800 flex items-center space-x-1">
                            <Truck className="w-3.5 h-3.5 text-sky-600" />
                            <span>
                              {isDelivered
                                ? (isHinglish ? 'Doorstep Par Deliver Ho Gaya' : 'Delivered to Doorstep')
                                : isShipped
                                ? (isHinglish ? 'Courier Partner ke Saath Raste Mein' : 'In Transit with Courier Partner')
                                : (isHinglish ? 'Courier Order Placed' : 'Courier Order Placed')}
                            </span>
                          </span>
                          {gift.courierName && (
                            <span className="text-[10px] font-mono text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                              {gift.courierName}
                            </span>
                          )}
                        </div>

                        {gift.trackingId ? (
                          <div className="bg-white p-2.5 rounded-lg border border-sky-200 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-500 block">AWB / Tracking Number:</span>
                              <span className="font-mono text-sm font-black text-amber-700 tracking-wider select-all">
                                {gift.trackingId}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Live Tracking</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            {isHinglish ? 'Parcel dispatch hote hi tracking details yahan update hongi.' : 'Tracking details will appear here once the courier parcel is dispatched.'}
                          </p>
                        )}

                        <p className="text-[10px] text-slate-500 border-t border-slate-200 pt-1.5 truncate">
                          📍 {gift.shippingAddress.replace('[PHYSICAL DELIVERY VIA AMAZON]', '').replace('[PHYSICAL DELIVERY]', '').trim()}
                        </p>
                      </div>
                    ) : (
                      /* Voucher Code Box */
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Official Voucher Code / PIN</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">100% Verified</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <code className="text-base sm:text-lg font-mono font-black text-amber-900 tracking-wider select-all break-all bg-white px-3 py-1.5 rounded-lg border border-amber-300">
                            {voucherCode}
                          </code>

                          <button
                            onClick={() => handleCopyGiftCode(voucherCode, gift.id)}
                            className={`px-3.5 py-2 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer active:scale-95 ${
                              isCopied
                                ? 'bg-emerald-600 text-white font-black'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>{isHinglish ? 'Copy Ho Gaya!' : 'Copied!'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>{isHinglish ? 'Code Copy Karein' : 'Copy Code'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Redemption Instructions & Link */}
                    {!isPhysical && (
                      <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {help.instructions}
                        </p>

                        {help.url && (
                          <a
                            href={help.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-bold text-xs flex-shrink-0 self-start sm:self-auto hover:underline"
                          >
                            <span>{isHinglish ? `${help.brand} Par Redeem Karein` : `Redeem on ${help.brand}`}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Class-Specific Specialized Feature Widget */}
      {theme.stage === 'PRIMARY' ? (
        /* PRIMARY (Classes 1-4): Fun Star Sticker & Adventure Trail */
        <div
          onClick={() => setIsStickerBookOpen(true)}
          className="bg-white border border-amber-300 hover:border-amber-400 rounded-3xl p-6 shadow-sm relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] hover:shadow-amber-500/10 group"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {theme.specialWidget.emoji}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                    {theme.specialWidget.badgeText}
                  </span>
                  <span className="text-xs font-bold text-slate-800">Class {activeGrade} Explorer Hub</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{isHinglish ? 'Interactive Album Ready ✨' : 'Interactive Book Ready'}</span>
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1 group-hover:text-amber-700 transition-colors flex items-center space-x-2">
                  <span>{theme.specialWidget.title}</span>
                  <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  {isHinglish
                    ? 'Apna album kholein, cartoon stickers paste karein aur sabhi 20 collect karein!'
                    : `${theme.specialWidget.subtitle} Tap to open your album, paste cartoon buddies, and collect all 20!`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-start">
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-center min-w-[140px] flex-shrink-0">
                <span className="text-[10px] text-slate-500 block font-medium uppercase tracking-wider">{theme.specialWidget.statLabel}</span>
                <span className="text-lg font-black text-amber-800 mt-1 block">
                  {unlockedStickersCount} / {ALL_STICKERS.length} ⭐
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStickerBookOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 flex-shrink-0 active:scale-95 transition-transform cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isHinglish ? 'Album Kholein 📖' : 'Open Book'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : theme.stage === 'MIDDLE' ? (
        /* MIDDLE (Classes 5-8): Tactical Cadet Command & Science Lab */
        <div className="bg-white border border-indigo-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-3xl flex items-center justify-center flex-shrink-0">
                {theme.specialWidget.emoji}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 uppercase font-mono">
                    {theme.specialWidget.badgeText}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Middle School Learning Pathway</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {theme.specialWidget.title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  {theme.specialWidget.subtitle}
                </p>
              </div>
            </div>

            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200 text-center min-w-[140px] flex-shrink-0">
              <span className="text-[10px] text-slate-500 block font-medium uppercase font-mono">{theme.specialWidget.statLabel}</span>
              <span className="text-lg font-black text-indigo-700 mt-1 block font-mono">{theme.specialWidget.statValue}</span>
            </div>
          </div>
        </div>
      ) : activeGrade === 10 ? (
        /* CLASS 10 TITANS: Official 10th Board Exam Year Hub with Live Countdown Clock */
        <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/60 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-xs">
                  👑 10th Board Exam Headquarters
                </span>
                <span className="text-xs font-bold text-amber-800">{isHinglish ? 'Target: Board Finals me 100 / 100' : 'Target: 100 / 100 in Board Finals'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                CBSE &amp; CBSE Class 10 Specimen Paper Center
              </h2>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                {isHinglish
                  ? 'Asli Board Exam format par timed practice sets solve karo. Har question me step-by-step NCERT explanations aur formulas milenge.'
                  : 'Take timed practice sets calibrated strictly to standard Board Examination formats. Every question features board marking schemes, step-by-step NCERT explanations, and formulas.'}
              </p>
            </div>

            {/* Countdown Pod */}
            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="bg-white border border-amber-300 p-3.5 rounded-2xl text-center min-w-[100px] shadow-xs">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase block">Board Countdown</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{daysToBoardExam}</span>
                <span className="text-[9px] text-slate-500 font-mono">{isHinglish ? 'Din Bache Hain' : 'Days Remaining'}</span>
              </div>

              <div className="bg-white border border-amber-300 p-3.5 rounded-2xl text-center min-w-[100px] shadow-xs">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase block">{isHinglish ? 'Questions Bank' : 'Board Syllabus'}</span>
                <span className="text-2xl font-black text-amber-700 font-mono mt-0.5 block">300</span>
                <span className="text-[9px] text-slate-500 font-mono">{isHinglish ? 'NCERT Questions' : 'Curated Questions'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : activeGrade === 12 ? (
        /* CLASS 12 HALL OF FAME: 12th Boards + JEE / NEET / CUET Speed-Run Arena */
        <div className="bg-gradient-to-r from-red-50 via-white to-amber-50 border-2 border-red-300 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white shadow-xs">
                  💎 12th Board &amp; Competitive Arena
                </span>
                <span className="text-xs font-bold text-amber-800">JEE / NEET / CUET Speed-Run Active</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Class 12 All-India Rank &amp; Distinction Command
              </h2>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                High-yield multi-concept problems across Calculus, Electromagnetism, Organic Name Reactions, and Genetics with NTA-style timed interface.
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="bg-white border border-red-200 p-3.5 rounded-2xl text-center min-w-[110px] shadow-xs">
                <span className="text-[10px] font-mono font-bold text-red-700 uppercase block">Percentile Aim</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">99.5%</span>
                <span className="text-[9px] text-slate-500 font-mono">Top Percentile</span>
              </div>

              <div className="bg-white border border-amber-200 p-3.5 rounded-2xl text-center min-w-[110px] shadow-xs">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase block">Senior Bank</span>
                <span className="text-2xl font-black text-amber-700 font-mono mt-0.5 block">300</span>
                <span className="text-[9px] text-slate-500 font-mono">Advanced Questions</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OTHER SECONDARY & SENIOR (Class 9 & 11) */
        <div className="bg-white border border-cyan-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-3xl flex items-center justify-center flex-shrink-0">
                {theme.specialWidget.emoji}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 uppercase font-mono">
                    {theme.specialWidget.badgeText}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Class {activeGrade} Curriculum Center</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {theme.specialWidget.title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  {theme.specialWidget.subtitle}
                </p>
              </div>
            </div>

            <div className="bg-cyan-50/60 p-4 rounded-2xl border border-cyan-200 text-center min-w-[140px] flex-shrink-0">
              <span className="text-[10px] text-slate-500 block font-medium uppercase font-mono">{theme.specialWidget.statLabel}</span>
              <span className="text-lg font-black text-cyan-800 mt-1 block font-mono">{theme.specialWidget.statValue}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Live Worldwide Scholarships & Sprints */}
      <WorldwideScholarships
        learner={learner}
        activeGrade={activeGrade}
        onRefreshLearner={refreshCurrentLearner}
        onStartQuiz={() => onNavigate('COURSES')}
      />

      {/* 5. Quota & Subscription Progress Meter */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{quota.hasActiveSubscription ? (quota.activePlan === 'GOLD' ? (isHinglish ? '👑 1-Year Gold VIP Pass Active' : '👑 1-Year Gold VIP Status') : (quota.activePlan === 'LITE' ? (isHinglish ? 'Concept Booster Plan Active' : 'Concept Booster Status') : `${quota.activePlan} Scholar Status`)) : (isHinglish ? 'Free Student Plan (3 Levels Included)' : 'Free Student Plan (3 Levels Included)')}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {quota.hasActiveSubscription
                ? (quota.activePlan === 'GOLD'
                    ? (isHinglish
                        ? `👑 1-Year Gold Pass Active • Full 365 Din Unlimited Access • Sabhi Quotas Unlocked (${quota.daysRemaining} din bache)`
                        : `👑 1-Year Gold Pass Active • Full 365 Days All-Access Pass • All Quotas Lifted (${quota.daysRemaining} days remaining)`)
                    : (quota.activePlan === 'LITE'
                        ? (isHinglish
                            ? `Concept Booster Active • 60 Din Unlimited Quizzes (${quota.daysRemaining} din bache)`
                            : `Concept Booster Active • 60 Days Unlimited Quizzes (${quota.daysRemaining} days remaining)`)
                        : `${quota.activePlan} Plan Active • Unlimited Access (${quota.daysRemaining} days remaining)`))
                : (quota.isLocked
                    ? (isHinglish
                        ? 'Free limit (3 levels) poori ho gayi hai. Sabhi levels aur unlimited quizzes ke liye upgrade karein.'
                        : 'Free limit of 3 curriculum levels completed. Upgrade to unlock all levels & unlimited quizzes.')
                    : (isHinglish
                        ? `Free student tier active. Aap ${quota.maxLevels} curriculum levels bilkul free master kar sakte hain.`
                        : `Free student tier active. You can master up to ${quota.maxLevels} curriculum levels free.`))}
            </p>
          </div>

          {!quota.hasActiveSubscription ? (
            <button
              onClick={onOpenUpgradeModal}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isHinglish ? 'Premium Mein Upgrade Karein (₹49)' : 'Upgrade to Premium (₹49)'}
            </button>
          ) : (
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHinglish ? 'Sabhi Quotas Unlocked ✓' : 'All Quotas Lifted'}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quizzes Meter */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-600">{isHinglish ? 'Quizzes Solved' : 'Quizzes Completed'}</span>
              <span className="font-mono font-bold text-slate-900">
                {quota.quizzesCompleted} {quota.hasActiveSubscription ? (isHinglish ? '• Unlimited Pass' : '• Unlimited Pass') : (isHinglish ? '• Free Practice Mode' : '• Practice Mode')}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-indigo-600"
                style={{
                  width: quota.hasActiveSubscription
                    ? '100%'
                    : `${Math.min(100, Math.max(10, quota.quizzesCompleted * 10))}%`
                }}
              />
            </div>
          </div>

          {/* Course Levels Meter */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs mb-2">
              <div>
                <span className="text-slate-600 block">{isHinglish ? 'Course Levels Mastered' : 'Course Levels Mastered'}</span>
                <span className="text-[10px] text-slate-500 font-mono">{isHinglish ? 'Master karne ke liye ≥ 70% score' : '≥ 70% score to master'}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">
                {quota.levelsCompleted} / {quota.hasActiveSubscription ? (isHinglish ? '∞ (Sabhi Levels Unlocked)' : '∞ (All Levels Unlocked)') : quota.maxLevels}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  quota.levelsCompleted >= 3 && !quota.hasActiveSubscription
                    ? 'bg-rose-500'
                    : 'bg-emerald-600'
                }`}
                style={{
                  width: quota.hasActiveSubscription
                    ? '100%'
                    : `${Math.min(100, (quota.levelsCompleted / quota.maxLevels) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4.5 Latest Quiz Diagnostic Report Spotlight */}
      {latestReportMsg && latestReportMsg.quizReport && (
        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-4 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-xs ${
              latestReportMsg.quizReport.accuracyPercent >= 70
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {latestReportMsg.quizReport.accuracyPercent}%
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
                  {isHinglish ? 'Aakhiri Quiz Report 📊' : 'Latest Quiz Report'}
                </span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {latestReportMsg.quizReport.subjectId.toUpperCase()} • {latestReportMsg.quizReport.levelNode}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({latestReportMsg.quizReport.score}/{latestReportMsg.quizReport.totalQuestions} {isHinglish ? 'Sahi Jawab' : 'Correct'})
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-1 max-w-xl">
                {latestReportMsg.preview}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsParentReportOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isHinglish ? 'Parents WhatsApp Report 📱' : 'Parents WhatsApp Report 📱'}</span>
            </button>
            <button
              onClick={() => handleOpenMailboxModal(latestReportMsg.id)}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 flex-shrink-0 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>{isHinglish ? 'Poori Report Dekhein →' : 'View Full Report'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Daily Quests & Streak Freeze Widget */}
      <DailyQuestsWidget
        learner={learner}
        onCoinsUpdated={refreshCurrentLearner}
        onNavigate={onNavigate}
      />

      {/* 5. Quick Launch Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* 1. Daily Spin Wheel */}
        <button
          onClick={() => onNavigate('SPIN_WHEEL')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <StudyCoinIcon className="w-5 h-5 sm:w-6 sm:h-6" glow />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? 'Daily Spin Wheel 🎡' : 'Daily Spin Wheel'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? 'Har 24 ghante me free spin' : '24h UTC Cooldown'}</span>
          </div>
        </button>

        {/* 2. 1v1 Coin Duel Arena */}
        <button
          onClick={() => onNavigate('DUEL_ARENA')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded-full uppercase tracking-wider shrink-0">
              {isHinglish ? 'Live 1v1' : 'Live 1v1'}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? '1v1 Quiz Duel ⚔️' : '1v1 Quiz Duel ⚔️'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? 'Coins wager karke pot jeeto' : 'Wager Coins & Win Pot'}</span>
          </div>
        </button>

        {/* 3. Mistake Vault */}
        <button
          onClick={() => onNavigate('MISTAKE_VAULT')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-rose-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {activeMistakesCount > 0 ? (
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-black rounded-full shrink-0">
                {activeMistakesCount} {isHinglish ? 'Tricky' : 'Tricky'}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full shrink-0">
                {isHinglish ? 'Clean 🎯' : 'Clean 🎯'}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? 'Mistake Vault 📓' : 'Mistake Vault 📓'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? 'Har galat sawal par +10 Coins' : 'Redeem +10 Coins Each'}</span>
          </div>
        </button>

        {/* 4. Scholar Leagues */}
        <button
          onClick={() => onNavigate('LEAGUES')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded-full uppercase tracking-wider shrink-0">
              Diamond
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? 'Scholar Leagues 🏆' : 'Scholar Leagues 🏆'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? 'Weekly ranking aur promotion' : 'Weekly Tier Promotion'}</span>
          </div>
        </button>

        {/* 5. Question of Day */}
        <button
          onClick={() => onNavigate('QOTD')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? 'Aaj Ka Sawal (QOTD) ⚡' : 'Question of Day'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? 'Daily streak booster question' : 'Streak Booster'}</span>
          </div>
        </button>

        {/* 6. Nova AI Tutor */}
        <button
          onClick={() => onNavigate('NOVA_AI')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? 'Nova AI Tutor 🎀' : 'Nova AI Tutor 🎀'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? '24/7 AI Bestie Concept Tutor' : '24/7 AI Concept Tutor'}</span>
          </div>
        </button>

        {/* 7. Student Mailbox */}
        <button
          onClick={() => handleOpenMailboxModal(null)}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {unreadMailCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-100 border border-indigo-300 text-indigo-800 text-[9px] font-bold rounded-full animate-pulse shrink-0">
                {unreadMailCount} {isHinglish ? 'Naye' : 'New'}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? 'Student Mailbox 📬' : 'Student Mailbox'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? 'Quiz reports aur notes' : 'Quiz Diagnostic Reports'}</span>
          </div>
        </button>

        {/* 8. Rewards Store */}
        <button
          onClick={() => onNavigate('GIFT_STORE')}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-3.5 sm:p-4 text-left transition-all group shadow-xs cursor-pointer active:scale-[0.98] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-snug">{isHinglish ? 'Rewards Store 🎁' : 'Rewards Store'}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">{isHinglish ? 'Toys, badges aur bottles' : 'Toys, Badges & Bottles'}</span>
          </div>
        </button>
      </div>

      {/* 5.5 Comprehensive Class Practice Worksheets Spotlight (30 Coins / Redeem in 2 Quizzes) */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-emerald-50/60 border-2 border-indigo-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start space-x-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{isHinglish ? '⚡ 2 Quizzes me redeem karo (30 Coins)' : '⚡ Redeem in 2 Quizzes (30 Coins)'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {isHinglish ? '100% Syllabus Coverage' : '100% Comprehensive Coverage'}
              </span>
              {isWorksheetUnlocked && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>{isHinglish ? 'Unlocked aur Ready ✓' : 'Unlocked & Ready'}</span>
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {isHinglish ? 'Class Practice Worksheets aur Printable PDF Center 📝' : 'Comprehensive Class Practice Worksheets & PDF Center'}
            </h3>

            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {isHinglish
                ? 'Classes 1 se 12 tak sabhi subjects ke chapter-wise worksheets. Rough work scratchpad, step-by-step solutions aur 1-click printable PDFs ke saath!'
                : 'Curriculum-calibrated chapter worksheets covering all subjects for Classes 1 to 12. Includes dedicated student rough work scratchpads, detachable step-by-step NCERT solutions, and 1-click vector printable PDFs!'}
            </p>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-500 pt-0.5">
              <span>• Classes 1 to 12 (CBSE, Cambridge)</span>
              <span>• Printable Vector PDF</span>
              <span>• Detachable NCERT Solutions</span>
              <span>• Just 30 Coins (Earn +25 Coins / Quiz)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
          {isWorksheetUnlocked ? (
            <button
              onClick={() => setIsWorksheetModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isHinglish ? 'Worksheets Kholein aur Print Karein 🖨️' : 'Open & Print Worksheets'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleQuickUnlockWorksheets}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <StudyCoinIcon className="w-4 h-4" />
              <span>
                {learner.coinBalance >= 30
                  ? (isHinglish ? 'Worksheets Unlock Karein (30 Coins)' : 'Unlock Worksheets (30 Coins)')
                  : (isHinglish ? `30 Coins Se Redeem Karein (${learner.coinBalance}/30)` : `Redeem with 30 Coins (${learner.coinBalance}/30)`)}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {!isWorksheetUnlocked && (
            <button
              onClick={() => onNavigate('GIFT_STORE')}
              className="px-3 py-1.5 text-indigo-700 hover:text-indigo-900 text-[11px] font-bold text-center hover:underline cursor-pointer"
            >
              {isHinglish ? 'Gift Store Mein Dekhein →' : 'View in Gift Store →'}
            </button>
          )}
        </div>
      </div>

      {/* 6. Class-Tailored Curriculum Subjects Grid (300 Questions per Class) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{theme.mascot.emoji}</span>
              <h2 className="text-lg font-bold text-slate-900">
                Course Catalogue: {learner.board} Class {activeGrade}
              </h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${theme.pillColor}`}>
                300 Quizzes Loaded
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isHinglish
                ? 'Apne syllabus chapters ke interactive quizzes solve karne ke liye subject select karein.'
                : 'Select any subject to practice complete syllabus chapters with interactive quizzes and Nova AI.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('COURSES', { grade: activeGrade })}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{isHinglish ? 'Poora Syllabus Dekhein' : 'Browse Full Syllabus'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {subjects.map(subject => (
            <div
              key={subject.id}
              onClick={() => onNavigate('LEVELS', { subjectId: subject.id, grade: activeGrade })}
              className={`bg-white border rounded-2xl sm:rounded-3xl p-4 sm:p-6 cursor-pointer transition-all shadow-sm flex flex-col justify-between group active:scale-[0.99] ${theme.cardBorder} ${theme.cardHover}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {subject.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    Class {activeGrade} Bank
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {subject.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:text-indigo-800 transition-colors">
                <span>{isHinglish ? 'Practice Quiz Shuru Karo' : 'Start Practice Quiz'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Class Badges & Milestones Showcase */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>{theme.mascot.emoji}</span>
              <span>{isHinglish ? `Class ${activeGrade} Academic Badges aur Achievements 🏅` : `Class ${activeGrade} Academic Badges & Milestones`}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {isHinglish
                ? `Quizzes me 70%+ score karke Class ${activeGrade} ke exclusive badges unlock karein!`
                : `Complete quizzes with 70%+ score to unlock signature Class ${activeGrade} achievements.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {theme.badges.map((b, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center flex flex-col items-center justify-between space-y-2 hover:border-slate-300 transition-colors"
            >
              <span className="text-3xl">{b.emoji}</span>
              <div>
                <p className="text-xs font-bold text-slate-900">{b.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{b.desc}</p>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 border border-slate-300">
                Class {activeGrade} Badge
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leo's Star Sticker Book Modal */}
      <LeoStickerBookModal
        isOpen={isStickerBookOpen}
        onClose={() => setIsStickerBookOpen(false)}
        learner={learner}
        onStartQuiz={() => onNavigate('COURSES', { grade: activeGrade })}
      />

      {/* Student Mailbox Modal (Fallback if parent does not provide onOpenMailbox) */}
      {!onOpenMailbox && (
        <StudentMailboxModal
          isOpen={isMailboxOpen}
          onClose={() => {
            setIsMailboxOpen(false);
            setUnreadMailCount(StorageRLSLayer.getUnreadMailboxCount(learner.id));
          }}
          learnerId={learner.id}
          initialSelectedMessageId={selectedMailboxMessageId}
          onNavigateToQuiz={(sId) => {
            setIsMailboxOpen(false);
            onNavigate('COURSES', sId ? { subjectId: sId } : undefined);
          }}
          onOpenNovaAi={() => {
            setIsMailboxOpen(false);
            onNavigate('NOVA_AI');
          }}
        />
      )}
      {/* Practice Worksheets Modal */}
      {isWorksheetModalOpen && (
        <PracticeWorksheetViewer
          learner={learner}
          onClose={() => setIsWorksheetModalOpen(false)}
        />
      )}

      {/* Parents WhatsApp Report Card Modal */}
      <ParentReportCardModal
        learner={learner}
        isOpen={isParentReportOpen}
        onClose={() => setIsParentReportOpen(false)}
      />
    </div>
  );
};
