import React, { useState } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { Learner, Board, Grade, Subscription } from '../../core/types';
import { PaymentService } from '../../services/paymentService';
import { QuotaService } from '../../services/quotaService';
import { CoinLedgerService } from '../../services/coinLedgerService';
import {
  Search,
  Zap,
  Check,
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  RotateCcw,
  KeyRound,
  Coins,
  BookOpen,
  Plus,
  Minus,
  Clock,
  Settings,
  AlertCircle,
  Filter,
  Eye,
  Gift
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [learners, setLearners] = useState<Learner[]>(() =>
    StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL)
  );
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  // Selected Kid for deep control modal
  const [controllingLearner, setControllingLearner] = useState<Learner | null>(null);

  // Quick Grant Premium dropdown/modal state
  const [grantingForLearner, setGrantingForLearner] = useState<Learner | null>(null);
  const [grantTier, setGrantTier] = useState<'LITE' | 'PLUS'>('PLUS');
  const [grantDays, setGrantDays] = useState<number>(180);
  const [grantNote, setGrantNote] = useState<string>('');

  // Kid Control Modal internal state
  const [editBoard, setEditBoard] = useState<Board>('CBSE');
  const [editGrade, setEditGrade] = useState<Grade>(10);
  const [coinAdjustAmount, setCoinAdjustAmount] = useState<number>(1000);
  const [coinAdjustType, setCoinAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [coinAdjustNote, setCoinAdjustNote] = useState<string>('Admin bonus grant');
  const [newParentPin, setNewParentPin] = useState<string>('');

  // Feedback banner
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const refreshList = async () => {
    await StorageRLSLayer.syncWithServer();
    const updated = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
    setLearners(updated);
    if (controllingLearner) {
      const refreshedTarget = updated.find(l => l.id === controllingLearner.id);
      if (refreshedTarget) setControllingLearner(refreshedTarget);
    }
  };

  React.useEffect(() => {
    StorageRLSLayer.syncWithServer().then(() => {
      setLearners(StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL));
    });
  }, []);

  // Helper to get active subscription info for any learner
  const getSubInfo = (learnerId: string) => {
    const activeSub = QuotaService.getActiveSubscription(learnerId);
    if (activeSub && activeSub.expiresAt) {
      const msLeft = new Date(activeSub.expiresAt).getTime() - Date.now();
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      return {
        isActive: true,
        tier: activeSub.planTier,
        daysLeft,
        expiresAt: activeSub.expiresAt,
        sub: activeSub
      };
    }
    // Check if pending payment exists
    const subs = StorageRLSLayer.getSubscriptionsForLearner(learnerId, learnerId);
    const pending = subs.find(s => s.status === 'PENDING_VERIFICATION');
    if (pending) {
      return {
        isActive: false,
        isPending: true,
        tier: pending.planTier,
        sub: pending
      };
    }
    return { isActive: false, isPending: false, tier: 'FREE' };
  };

  // One-Click Quick Grant
  const handleQuickGrant = async (learner: Learner, tier: 'LITE' | 'PLUS', days: number) => {
    try {
      const res = await PaymentService.grantPremiumDirect(SUPER_ADMIN_EMAIL, learner.id, tier, days, `Quick grant: ${days} days`);
      if (res.success) {
        showNotification(`🎉 Granted ${tier} Plan (${days} days) to ${learner.fullName}!`, 'success');
        await refreshList();
        setGrantingForLearner(null);
      } else {
        showNotification(res.error || 'Failed to grant premium.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // One-Click Quick Ungrant / Revoke
  const handleQuickUngrant = async (learner: Learner) => {
    if (!window.confirm(`Are you sure you want to revoke/ungrant premium for ${learner.fullName}? They will be immediately returned to the Free Tier.`)) {
      return;
    }
    try {
      const res = await PaymentService.revokePremiumDirect(SUPER_ADMIN_EMAIL, learner.id, 'Super-Admin manual ungrant');
      if (res.success) {
        showNotification(`Revoked premium for ${learner.fullName}. Account is now on Free Tier.`, 'success');
        await refreshList();
      } else {
        showNotification(res.error || 'Failed to revoke premium.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Toggle Suspend
  const handleToggleSuspend = (learner: Learner) => {
    learner.isActive = !learner.isActive;
    StorageRLSLayer.saveLearner(learner, learner.id);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      learner.isActive ? 'UNSUSPEND_LEARNER' : 'SUSPEND_LEARNER',
      learner.id,
      `Student ${learner.fullName} (${learner.email}) suspension state toggled to ${learner.isActive}.`
    );
    showNotification(`Student ${learner.fullName} is now ${learner.isActive ? 'Active' : 'Suspended'}.`);
    refreshList();
  };

  // Open Full Control Drawer
  const handleOpenControl = (learner: Learner) => {
    setControllingLearner(learner);
    setEditBoard(learner.board);
    setEditGrade(learner.grade);
    setNewParentPin(learner.parentPin || '');
  };

  // Save Curriculum Override
  const handleSaveCurriculum = () => {
    if (!controllingLearner) return;
    controllingLearner.board = editBoard;
    controllingLearner.grade = editGrade;
    StorageRLSLayer.saveLearner(controllingLearner, controllingLearner.id);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'ADMIN_OVERRIDE_CURRICULUM',
      controllingLearner.id,
      `Changed student curriculum to ${editBoard} Class ${editGrade} without consuming learner change quotas.`
    );
    showNotification(`Updated ${controllingLearner.fullName}'s curriculum to ${editBoard} Class ${editGrade}!`);
    refreshList();
  };

  // Reset Class Change Limits
  const handleResetClassLock = (learner: Learner) => {
    learner.classChangesUsedPremium = 0;
    learner.classChangesUsedPostExpiry = 0;
    StorageRLSLayer.saveLearner(learner, learner.id);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'RESET_CLASS_CHANGE_LOCK',
      learner.id,
      `Reset class-change locks for ${learner.fullName}.`
    );
    showNotification(`Class-change limits successfully reset for ${learner.fullName}.`);
    refreshList();
  };

  // Adjust Study Coins
  const handleAdjustCoins = (e: React.FormEvent) => {
    e.preventDefault();
    if (!controllingLearner || coinAdjustAmount <= 0) return;

    const delta = coinAdjustType === 'ADD' ? coinAdjustAmount : -coinAdjustAmount;
    if (coinAdjustType === 'DEDUCT' && controllingLearner.coinBalance < coinAdjustAmount) {
      showNotification(`Cannot deduct ${coinAdjustAmount} coins; student only has ${controllingLearner.coinBalance} coins.`, 'error');
      return;
    }

    const tx = CoinLedgerService.appendTransaction(
      controllingLearner.id,
      delta,
      'ADMIN_ADJUSTMENT',
      { admin: SUPER_ADMIN_EMAIL, note: coinAdjustNote }
    );

    if (tx.success) {
      controllingLearner.coinBalance = Math.max(0, controllingLearner.coinBalance + delta);
      StorageRLSLayer.saveLearner(controllingLearner, controllingLearner.id);
      showNotification(`Successfully ${coinAdjustType === 'ADD' ? 'credited' : 'debited'} ${coinAdjustAmount.toLocaleString()} coins for ${controllingLearner.fullName}.`);
      refreshList();
    } else {
      showNotification(tx.error || 'Failed to adjust coins.', 'error');
    }
  };

  // Reset Quiz & Level Quotas
  const handleResetQuotas = () => {
    if (!controllingLearner) return;
    controllingLearner.quizzesCompletedCount = 0;
    controllingLearner.levelsCompletedCount = 0;
    StorageRLSLayer.saveLearner(controllingLearner, controllingLearner.id);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'RESET_QUOTAS',
      controllingLearner.id,
      `Reset quiz and level counters for ${controllingLearner.fullName}.`
    );
    showNotification(`Reset quiz & level usage counters for ${controllingLearner.fullName}.`);
    refreshList();
  };

  // Save Parent PIN
  const handleSaveParentPin = () => {
    if (!controllingLearner) return;
    if (newParentPin && !/^[0-9]{4}$/.test(newParentPin)) {
      showNotification('Parent PIN must be exactly 4 digits.', 'error');
      return;
    }
    controllingLearner.parentPin = newParentPin || undefined;
    StorageRLSLayer.saveLearner(controllingLearner, controllingLearner.id);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'UPDATE_PARENT_PIN',
      controllingLearner.id,
      `Updated Parent PIN for ${controllingLearner.fullName}.`
    );
    showNotification(`Updated Parent PIN for ${controllingLearner.fullName}.`);
    refreshList();
  };

  // Filter learners
  const filtered = learners.filter(l => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      l.fullName.toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term) ||
      (l.phone && l.phone.toLowerCase().includes(term)) ||
      l.referralCode.toLowerCase().includes(term) ||
      l.id.toLowerCase().includes(term);

    const matchesBoard = boardFilter === 'ALL' || l.board === boardFilter;
    const matchesGrade = gradeFilter === 'ALL' || l.grade.toString() === gradeFilter;

    const subInfo = getSubInfo(l.id);
    let matchesTier = true;
    if (tierFilter === 'FREE') matchesTier = !subInfo.isActive && !subInfo.isPending;
    else if (tierFilter === 'LITE') matchesTier = subInfo.isActive && subInfo.tier === 'LITE';
    else if (tierFilter === 'PLUS') matchesTier = subInfo.isActive && subInfo.tier === 'PLUS';
    else if (tierFilter === 'PENDING') matchesTier = Boolean(subInfo.isPending);
    else if (tierFilter === 'SUSPENDED') matchesTier = !l.isActive;

    return matchesSearch && matchesBoard && matchesGrade && matchesTier;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-white">Kid Control & Finder Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Super-Admin Control Plane
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search any kid, inspect their curriculum, add/deduct coins, and instantly <strong>Grant or Ungrant Premium</strong> with one click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Total Registered</span>
            <span className="text-sm font-extrabold text-white">{learners.length} Kids</span>
          </div>
          <div className="bg-slate-950 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-indigo-400 block font-medium">Showing Matches</span>
            <span className="text-sm font-extrabold text-indigo-300">{filtered.length} Kids</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              : 'bg-red-950/50 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionNotice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Multi-Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Main Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Find kid by name, email, phone, code, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Board Filter */}
          <div>
            <select
              value={boardFilter}
              onChange={e => setBoardFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Boards (CBSE/ICSE/IGCSE)</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE / CISCE</option>
              <option value="IGCSE">Cambridge IGCSE</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Classes (1 to 12)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g.toString()}>
                  Class {g}
                </option>
              ))}
            </select>
          </div>

          {/* Subscription Tier Filter */}
          <div>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Membership States</option>
              <option value="FREE">Free Tier Only</option>
              <option value="PLUS">Plus Plan Active</option>
              <option value="LITE">Lite Plan Active</option>
              <option value="PENDING">Pending Verification</option>
              <option value="SUSPENDED">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kid Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-4">Kid Identity</th>
                <th className="p-4">Board & Class</th>
                <th className="p-4">Subscription Status</th>
                <th className="p-4">Economy & Quota</th>
                <th className="p-4">Account</th>
                <th className="p-4 text-right">Quick Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No kids found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(learner => {
                  const subInfo = getSubInfo(learner.id);
                  return (
                    <tr key={learner.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Identity */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                            {learner.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-white text-sm">{learner.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{learner.email}</p>
                            <p className="text-[10px] text-indigo-400 font-mono">
                              Code: <strong className="text-indigo-300">{learner.referralCode}</strong>
                              {learner.phone ? ` • 📞 ${learner.phone}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Board & Class */}
                      <td className="p-4">
                        <span className="font-bold text-slate-200 block text-xs">{learner.board}</span>
                        <span className="text-[11px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-900/50 inline-block mt-0.5 font-semibold">
                          Class {learner.grade}
                        </span>
                      </td>

                      {/* Subscription Status & Grant/Ungrant info */}
                      <td className="p-4">
                        {subInfo.isActive ? (
                          <div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center space-x-1 ${
                                subInfo.tier === 'PLUS'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                              }`}
                            >
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>{subInfo.tier} Active ({subInfo.daysLeft}d left)</span>
                            </span>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Exp: {new Date(subInfo.expiresAt!).toLocaleDateString()}
                            </p>
                          </div>
                        ) : subInfo.isPending ? (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800 inline-flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                              <span>Pending Review ({subInfo.tier})</span>
                            </span>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              UTR: {subInfo.sub?.utrReference || 'Submitted'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              Free Tier
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">Standard Allowance</p>
                          </div>
                        )}
                      </td>

                      {/* Economy & Quota */}
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-amber-400 font-mono font-bold text-xs">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>{learner.coinBalance.toLocaleString()} Coins</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {learner.quizzesCompletedCount}/25 Quizzes • {learner.levelsCompletedCount}/3 Levels
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">Streak: {learner.currentStreakDays}d</p>
                      </td>

                      {/* Account State */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            learner.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {learner.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Quick Action Controls */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                          {/* Grant Premium Button */}
                          <button
                            onClick={() => setGrantingForLearner(learner)}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold transition-all shadow-md flex items-center space-x-1"
                            title="Grant Lite, Plus, or Custom Days"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Grant Premium</span>
                          </button>

                          {/* Ungrant Premium Button (if active) */}
                          {subInfo.isActive && (
                            <button
                              onClick={() => handleQuickUngrant(learner)}
                              className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-[11px] font-bold transition-all"
                              title="Immediately ungrant/revoke premium back to Free Tier"
                            >
                              <span>Ungrant</span>
                            </button>
                          )}

                          {/* Full Control Kid Drawer */}
                          <button
                            onClick={() => handleOpenControl(learner)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold transition-all flex items-center space-x-1"
                            title="Open full kid control drawer"
                          >
                            <Settings className="w-3 h-3 text-slate-400" />
                            <span>Control Kid</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK GRANT PREMIUM MODAL                                */}
      {/* ======================================================== */}
      {grantingForLearner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  Super-Admin Entitlement Grant
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Grant Premium to {grantingForLearner.fullName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{grantingForLearner.email}</p>
              </div>
              <button
                onClick={() => setGrantingForLearner(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Choose Plan Tier</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setGrantTier('PLUS');
                    setGrantDays(180);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    grantTier === 'PLUS'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-extrabold text-sm text-white">Plus Plan (180 Days)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Olympiad + Full Mastery</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGrantTier('LITE');
                    setGrantDays(60);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    grantTier === 'LITE'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-extrabold text-sm text-white">Lite Plan (60 Days)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Standard Unlimited Quota</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={730}
                  value={grantDays}
                  onChange={e => setGrantDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quick Presets</label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGrantDays(30)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    30d
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrantDays(60)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    60d
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrantDays(180)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    180d
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrantDays(365)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                  >
                    1 Year
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Memo / Reason</label>
              <input
                type="text"
                placeholder="e.g. Scholarship award or verified manual offline payment"
                value={grantNote}
                onChange={e => setGrantNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setGrantingForLearner(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleQuickGrant(grantingForLearner, grantTier, grantDays)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Confirm & Activate Premium ({grantDays} Days)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL KID CONTROL MODAL / DRAWER                          */}
      {/* ======================================================== */}
      {controllingLearner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  Deep Student Control
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  {controllingLearner.fullName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Learner ID: <span className="text-slate-300">{controllingLearner.id}</span> • Email: <span className="text-slate-300">{controllingLearner.email}</span>
                </p>
              </div>
              <button
                onClick={() => setControllingLearner(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Curriculum Override */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Curriculum & Board Control</span>
                </h4>
                <span className="text-[10px] text-slate-400">Admin override (does not consume student limit)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Target Board</label>
                  <select
                    value={editBoard}
                    onChange={e => setEditBoard(e.target.value as Board)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE">ICSE / CISCE</option>
                    <option value="IGCSE">Cambridge IGCSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Target Class (1 to 12)</label>
                  <select
                    value={editGrade}
                    onChange={e => setEditGrade(Number(e.target.value) as Grade)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>
                        Class {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveCurriculum}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
              >
                Save Curriculum Override
              </button>
            </div>

            {/* Section 2: Study Coin Economy Control */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Study Coins Balance & Ledger Adjustment</span>
                </h4>
                <span className="text-xs font-mono font-bold text-amber-400">
                  Current: {controllingLearner.coinBalance.toLocaleString()} Coins
                </span>
              </div>

              <form onSubmit={handleAdjustCoins} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Operation</label>
                    <select
                      value={coinAdjustType}
                      onChange={e => setCoinAdjustType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="ADD">➕ Add Coins</option>
                      <option value="DEDUCT">➖ Deduct Coins</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Coin Amount</label>
                    <input
                      type="number"
                      min={1}
                      max={1000000}
                      value={coinAdjustAmount}
                      onChange={e => setCoinAdjustAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Quick Add</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setCoinAdjustAmount(5000)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-300 font-mono rounded-lg border border-slate-800"
                      >
                        +5K
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoinAdjustAmount(50000)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-300 font-mono rounded-lg border border-slate-800"
                      >
                        +50K
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoinAdjustAmount(200000)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-300 font-mono rounded-lg border border-slate-800"
                        title="Level 1 Gift Card amount (2L)"
                      >
                        +2L
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ledger Audit Note</label>
                  <input
                    type="text"
                    value={coinAdjustNote}
                    onChange={e => setCoinAdjustNote(e.target.value)}
                    placeholder="Reason for coin addition or deduction..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Apply Coin Ledger Adjustment ({coinAdjustType === 'ADD' ? '+' : '-'}{coinAdjustAmount.toLocaleString()} Coins)
                </button>
              </form>
            </div>

            {/* Section 3: Quota, Class Lock & Streak Overrides */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>Quotas, Class-Change Locks & Streaks</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Class Changes Consumed</span>
                    <span className="text-xs font-mono font-bold text-white">
                      Prem: {controllingLearner.classChangesUsedPremium}/1 • Post: {controllingLearner.classChangesUsedPostExpiry}/1
                    </span>
                  </div>
                  <button
                    onClick={() => handleResetClassLock(controllingLearner)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                  >
                    Reset Lock
                  </button>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Free Tier Usage Meter</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {controllingLearner.quizzesCompletedCount} Quizzes • {controllingLearner.levelsCompletedCount} Levels
                    </span>
                  </div>
                  <button
                    onClick={handleResetQuotas}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                  >
                    Reset Quota
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Security & Parent PIN Control */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Parent PIN & Security Control</span>
              </h4>

              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-400 mb-1">Set 4-Digit Parent PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={newParentPin}
                    onChange={e => setNewParentPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveParentPin}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                >
                  Update PIN
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleSuspend(controllingLearner)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold border ${
                    controllingLearner.isActive
                      ? 'bg-red-950 hover:bg-red-900 text-red-300 border-red-800'
                      : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {controllingLearner.isActive ? 'Suspend Account' : 'Unsuspend Account'}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setControllingLearner(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Close Control Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
