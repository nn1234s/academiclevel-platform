import React, { useState } from 'react';
import { SuperAdminGuard } from '../core/auth/SuperAdminGuard';
import { useAuth } from '../core/auth/AuthContext';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../core/storage/StorageRLSLayer';
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
  Lock,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

import { StudentManagement } from './modules/StudentManagement';
import { PaymentVerificationQueue } from './modules/PaymentVerificationQueue';
import { EntitlementManager } from './modules/EntitlementManager';
import { ACodeManager } from './modules/ACodeManager';
import { CurriculumManager } from './modules/CurriculumManager';
import { QuestionBankManager } from './modules/QuestionBankManager';
import { LedgerInspector } from './modules/LedgerInspector';
import { ReferralMonitor } from './modules/ReferralMonitor';
import { GiftFulfillment } from './modules/GiftFulfillment';
import { ModerationReports } from './modules/ModerationReports';
import { AuditLogViewer } from './modules/AuditLogViewer';
import { SystemHealthAnalytics } from './modules/SystemHealthAnalytics';

type AdminTab =
  | 'STUDENTS'
  | 'PAYMENTS'
  | 'ENTITLEMENTS'
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

export const AdminVaultShell: React.FC<AdminVaultShellProps> = ({ onExitVault }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('PAYMENTS');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = StorageRLSLayer.getAllSubscriptionsAdmin(SUPER_ADMIN_EMAIL).filter(
    (s: any) => s.status === 'PENDING_VERIFICATION'
  ).length;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'PAYMENTS',
      label: 'PAID PAYMENT people',
      icon: <CreditCard className="w-4 h-4" />,
      badge: pendingCount > 0 ? `${pendingCount} NEW` : undefined
    },
    { id: 'STUDENTS', label: 'Kid Control & Finder', icon: <Users className="w-4 h-4" /> },
    { id: 'ENTITLEMENTS', label: 'Entitlement & Trials', icon: <Zap className="w-4 h-4" /> },
    { id: 'GIFTS', label: 'Gift & Amazon GC Dispatch', icon: <Truck className="w-4 h-4" /> },
    { id: 'ACODES', label: 'ACode Vouchers', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'CURRICULUM', label: 'Curriculum & Boards', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'QUESTIONS', label: 'Question Bank CRUD', icon: <Database className="w-4 h-4" /> },
    { id: 'LEDGER', label: 'Coin Ledger Inspector', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'REFERRALS', label: 'Referral Fraud Monitor', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'MODERATION', label: 'Safety & Moderation', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'AUDIT', label: 'Immutable Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'HEALTH', label: 'System Telemetry', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <SuperAdminGuard onUnauthorizedRedirect={onExitVault}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Restricted Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 font-bold text-xs">
              AL
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white tracking-wide">AcademicLevel Enterprise Control</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-950 border border-indigo-800 text-indigo-300">
                  /adminservice
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Security Status: <span className="text-emerald-400 font-semibold">Authorized Super-Admin</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Vault Secured</span>
            </span>

            <button
              onClick={() => {
                try {
                  sessionStorage.removeItem('al_admin_passkey');
                  localStorage.removeItem('al_admin_passkey');
                } catch {}
                logout();
                onExitVault();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Vault</span>
            </button>
          </div>
        </header>

        {/* Master Body Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900/95 lg:bg-slate-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="p-4 space-y-1 overflow-y-auto">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-3 py-2">
                12 Vault Modules
              </div>
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
              <p>AcademicLevel v1.0.0-PROD</p>
              <p>Strict Super-Admin Lock Active</p>
            </div>
          </aside>

          {/* Main Module Content Canvas */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
            {activeTab === 'PAYMENTS' && <PaymentVerificationQueue />}
            {activeTab === 'STUDENTS' && <StudentManagement />}
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
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  );
};
