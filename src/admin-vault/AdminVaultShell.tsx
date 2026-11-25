import React, { useState, useEffect } from 'react';
import { SuperAdminGuard } from '../core/auth/SuperAdminGuard';
import { useAuth } from '../core/auth/AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../core/storage/StorageRLSLayer';
import { Learner } from '../core/types';
import {
  Users,
  CreditCard,
  Zap,
  KeyRound,
  BookOpen,
  Database,
  Sparkles,
  UserCheck,
  Truck,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Award,
  FileText,
  Megaphone,
  Coins,
  Activity,
  Search,
  CheckCircle2,
  Copy,
  Check,
  ArrowUpRight,
  Command
} from 'lucide-react';

import { CommandCenterOverview } from './modules/CommandCenterOverview';
import { StudentManagement } from './modules/StudentManagement';
import { PaymentVerificationQueue } from './modules/PaymentVerificationQueue';
import { EntitlementManager } from './modules/EntitlementManager';
import { ACodeManager } from './modules/ACodeManager';
import { CurriculumManager } from './modules/CurriculumManager';
import { QuestionBankManager } from './modules/QuestionBankManager';
import { LedgerInspector } from './modules/LedgerInspector';
import { ReferralMonitor } from './modules/ReferralMonitor';
import { GiftFulfillment } from './modules/GiftFulfillment';
import { ScholarshipManager } from './modules/ScholarshipManager';
import { ModerationReports } from './modules/ModerationReports';
import { AuditLogViewer } from './modules/AuditLogViewer';
import { SystemHealthAnalytics } from './modules/SystemHealthAnalytics';
import { PricingManager } from './modules/PricingManager';
import { SiteContentManager } from './modules/SiteContentManager';
import { AdPagesManager } from './modules/AdPagesManager';

export type AdminTab =
  | 'OVERVIEW'
  | 'STUDENTS'
  | 'PAYMENTS'
  | 'PRICING'
  | 'CONTENT'
  | 'ADS'
  | 'ENTITLEMENTS'
  | 'SCHOLARSHIPS'
  | 'ACODES'
  | 'CURRICULUM'
  | 'QUESTIONS'
  | 'LEDGER'
  | 'REFERRALS'
  | 'GIFTS'
  | 'MODERATION'
  | 'AUDIT'
  | 'HEALTH';

interface AdminVaultShellProps {
  onExitVault: () => void;
}

interface NavCategory {
  category: string;
  items: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[];
}

const AdminVaultShellContent: React.FC<AdminVaultShellProps> = ({ onExitVault }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);

  // Global OmniSearch Modal (Ctrl+K)
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState(false);
  const [omniQuery, setOmniQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real-time badge counts
  let pendingGiftsCount = 0;
  let allLearnersCount = 0;
  try {
    const gifts = StorageRLSLayer.getAllGiftRequestsAdmin(SUPER_ADMIN_EMAIL);
    pendingGiftsCount = gifts.filter((g: any) => g.status === 'PENDING' || g.status === 'READY_FOR_PACKING').length;
    allLearnersCount = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL).length;
  } catch {
    pendingGiftsCount = 0;
  }

  // Ctrl+K Global Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOmniSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOmniSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigateTab = (tab: AdminTab, contextLearner?: Learner) => {
    setActiveTab(tab);
    if (contextLearner) {
      setSelectedLearner(contextLearner);
    }
    setMobileMenuOpen(false);
  };

  // OmniSearch filtered list
  const omniResults = React.useMemo(() => {
    if (!omniQuery.trim()) return [];
    try {
      const all = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
      const q = omniQuery.toLowerCase();
      return all.filter(l =>
        l.fullName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone && l.phone.includes(q)) ||
        l.id.toLowerCase().includes(q)
      ).slice(0, 5);
    } catch {
      return [];
    }
  }, [omniQuery]);

  const navCategories: NavCategory[] = [
    {
      category: 'Mission Command & Telemetry',
      items: [
        { id: 'OVERVIEW', label: 'Command HUD Overview', icon: <Activity className="w-4 h-4 text-cyan-400" />, badge: 'LIVE', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
        { id: 'HEALTH', label: 'System Health & Latency', icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
        { id: 'AUDIT', label: 'Immutable Audit Logs', icon: <ShieldCheck className="w-4 h-4 text-indigo-400" /> },
      ]
    },
    {
      category: 'Scholar & Account Control',
      items: [
        { id: 'STUDENTS', label: 'Kid Control & Accounts', icon: <Users className="w-4 h-4 text-blue-400" />, badge: allLearnersCount > 0 ? `${allLearnersCount}` : undefined, badgeColor: 'bg-blue-500/20 text-blue-300' },
        { id: 'ENTITLEMENTS', label: 'Entitlements & Trials', icon: <Zap className="w-4 h-4 text-amber-400" /> },
        { id: 'SCHOLARSHIPS', label: 'Worldwide Scholarships', icon: <Award className="w-4 h-4 text-purple-400" /> },
        { id: 'ACODES', label: 'Institutional ACode Vouchers', icon: <KeyRound className="w-4 h-4 text-yellow-400" /> },
      ]
    },
    {
      category: 'Commerce, Rewards & Gifts',
      items: [
        { id: 'PRICING', label: 'Modify Prices & UPI PG', icon: <Coins className="w-4 h-4 text-emerald-400" /> },
        { id: 'GIFTS', label: 'Physical Gift Dispatch', icon: <Truck className="w-4 h-4 text-amber-400" />, badge: pendingGiftsCount > 0 ? `${pendingGiftsCount} PENDING` : undefined, badgeColor: 'bg-amber-400 text-slate-950 animate-pulse font-black' },
        { id: 'LEDGER', label: 'Coin Ledger & Wallets', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
        { id: 'PAYMENTS', label: 'Manual Payments (Retired)', icon: <CreditCard className="w-4 h-4 text-slate-500" />, badge: 'AUTO PG', badgeColor: 'bg-slate-800 text-slate-400' },
      ]
    },
    {
      category: 'Academic & Curriculum Engine',
      items: [
        { id: 'CURRICULUM', label: 'Curriculum & Boards', icon: <BookOpen className="w-4 h-4 text-indigo-400" /> },
        { id: 'QUESTIONS', label: 'Question Bank CRUD', icon: <Database className="w-4 h-4 text-teal-400" /> },
      ]
    },
    {
      category: 'Governance, Funnels & Safety',
      items: [
        { id: 'ADS', label: 'Ad Pages & Funnels', icon: <Megaphone className="w-4 h-4 text-orange-400" /> },
        { id: 'CONTENT', label: 'Home & Legal Content', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
        { id: 'REFERRALS', label: 'Referral Fraud Monitor', icon: <UserCheck className="w-4 h-4 text-rose-400" /> },
        { id: 'MODERATION', label: 'Safety & Moderation', icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Restricted Command Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-900 border border-red-500/40 flex items-center justify-center text-white font-black text-xs shadow-md">
            AL
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm text-white tracking-wide">AcademicLevel Enterprise Control</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
                /adminservice
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Role: <span className="text-emerald-400 font-semibold">Authorized Super-Admin</span> • Engine: <span className="text-cyan-400">SQLite WAL &lt;0.1ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Universal OmniSearch Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOmniSearchOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 text-slate-300 hover:text-white rounded-xl text-xs font-semibold shadow-inner transition-all cursor-pointer"
            title="Search scholars across database (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>OmniSearch Scholar...</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              Ctrl K
            </kbd>
          </button>

          <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Tenant Isolated</span>
          </span>

          <button
            onClick={() => {
              logout();
              onExitVault();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Vault</span>
          </button>
        </div>
      </header>

      {/* Master Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Categorized Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-3.5 space-y-4 overflow-y-auto">
            {navCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-1">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2.5 py-1">
                  {cat.category}
                </div>
                {cat.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/70 font-medium'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1 text-left flex items-center justify-between">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`ml-1.5 px-2 py-0.2 rounded-full text-[9px] font-mono border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                            {item.badge}
                          </span>
                        )}
                      </span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-1 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-3.5 border-t border-slate-800 text-[10px] text-slate-500 font-mono space-y-0.5">
            <div className="flex justify-between items-center">
              <span>AcademicLevel v2.15.1s</span>
              <span className="text-emerald-400 font-bold">PROD WAL</span>
            </div>
            <p>Strict Super-Admin Lock Active</p>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          {activeTab === 'OVERVIEW' && (
            <CommandCenterOverview onNavigateTab={handleNavigateTab} />
          )}
          {activeTab === 'STUDENTS' && (
            <StudentManagement initialLearner={selectedLearner} />
          )}
          {activeTab === 'PRICING' && <PricingManager />}
          {activeTab === 'CONTENT' && <SiteContentManager />}
          {activeTab === 'ADS' && <AdPagesManager />}
          {activeTab === 'SCHOLARSHIPS' && <ScholarshipManager />}
          {activeTab === 'ENTITLEMENTS' && <EntitlementManager />}
          {activeTab === 'ACODES' && <ACodeManager />}
          {activeTab === 'CURRICULUM' && <CurriculumManager />}
          {activeTab === 'QUESTIONS' && <QuestionBankManager />}
          {activeTab === 'LEDGER' && <LedgerInspector />}
          {activeTab === 'REFERRALS' && <ReferralMonitor />}
          {activeTab === 'GIFTS' && <GiftFulfillment />}
          {activeTab === 'MODERATION' && <ModerationReports />}
          {activeTab === 'AUDIT' && <AuditLogViewer />}
          {activeTab === 'HEALTH' && <SystemHealthAnalytics />}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                <span>ℹ️ <strong>Manual Payment Queue Retired:</strong> Real UPI PG handles all transactions automatically. This view is maintained strictly for legacy audit logs.</span>
              </div>
              <PaymentVerificationQueue />
            </div>
          )}
        </main>
      </div>

      {/* OMNISEARCH MODAL OVERLAY (Ctrl+K) */}
      {isOmniSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Command className="w-4 h-4" />
                <span>Super-Admin Scholar OmniSearch</span>
              </div>
              <button
                onClick={() => setIsOmniSearchOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                autoFocus
                type="text"
                value={omniQuery}
                onChange={e => setOmniQuery(e.target.value)}
                placeholder="Type student name, email, phone, or learner ID..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {omniResults.map(l => (
                <div
                  key={l.id}
                  className="p-3 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/60 rounded-2xl flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-white">{l.fullName}</span>
                      <span className="text-[10px] font-mono text-slate-400">Class {l.grade} ({l.board})</span>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                        l.hasActiveSubscription
                          ? (l.activePlan === 'GOLD' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500/20 text-emerald-300')
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {l.hasActiveSubscription ? (l.activePlan || 'ACTIVE') : 'FREE'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {l.email} {l.phone ? `• ${l.phone}` : ''} • ID: {l.id.slice(0, 10)}...
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(l.id);
                        }
                        setCopiedId(l.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      title="Copy Learner ID"
                    >
                      {copiedId === l.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsOmniSearchOpen(false);
                        handleNavigateTab('STUDENTS', l);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Control</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {omniQuery && omniResults.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  No scholars found matching &quot;{omniQuery}&quot;.
                </p>
              )}

              {!omniQuery && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Start typing to instantly query the entire student database.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminVaultShell: React.FC<AdminVaultShellProps> = ({ onExitVault }) => {
  return (
    <SuperAdminGuard onUnauthorizedRedirect={onExitVault}>
      <AdminVaultShellContent onExitVault={onExitVault} />
    </SuperAdminGuard>
  );
};
