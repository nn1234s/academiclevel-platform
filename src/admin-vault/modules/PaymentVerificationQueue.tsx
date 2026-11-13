import React, { useState, useEffect } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { PaymentService } from '../../services/paymentService';
import { Subscription, Learner } from '../../core/types';
import { ApiClient } from '../../core/api/apiClient';
import {
  Check,
  X,
  ShieldCheck,
  Clock,
  AlertCircle,
  RefreshCw,
  Copy,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Search,
  UserCheck,
  Sparkles
} from 'lucide-react';

export const PaymentVerificationQueue: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    StorageRLSLayer.getAllSubscriptionsAdmin(SUPER_ADMIN_EMAIL)
  );
  const [actionNotice, setActionNotice] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');

  const refreshList = async () => {
    try {
      const res = await ApiClient.adminGetPaymentsQueue(SUPER_ADMIN_EMAIL);
      if (res.success && Array.isArray(res.subscriptions)) {
        res.subscriptions.forEach(s => StorageRLSLayer.saveSubscription(s));
        setSubscriptions(res.subscriptions);
        // Also sync storage in background for learner details
        StorageRLSLayer.syncWithServer().catch(() => {});
        return;
      }
    } catch (e) {
      console.warn('Failed to fetch admin payment queue from backend:', e);
    }
    await StorageRLSLayer.syncWithServer();
    setSubscriptions(StorageRLSLayer.getAllSubscriptionsAdmin(SUPER_ADMIN_EMAIL));
  };

  // Auto-refresh every 8 seconds to listen for incoming payments
  useEffect(() => {
    refreshList();
    const interval = setInterval(() => {
      refreshList();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const copyPayerUpi = (upi: string) => {
    navigator.clipboard?.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const handleApproveTick = async (subId: string, studentName: string) => {
    try {
      const res = await PaymentService.approvePaymentAdmin(SUPER_ADMIN_EMAIL, subId);
      if (res.success) {
        setActionNotice(`✔ Successfully TICKED & APPROVED ${studentName}! Subscription is now ACTIVE.`);
        await refreshList();
        setTimeout(() => setActionNotice(''), 4500);
      } else {
        setActionNotice(res.error || 'Approval failed.');
      }
    } catch (err: any) {
      setActionNotice(err.message || 'Error occurred.');
    }
  };

  const handleReject = async (subId: string) => {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    try {
      const res = await PaymentService.rejectPaymentAdmin(SUPER_ADMIN_EMAIL, subId, rejectReason.trim());
      if (res.success) {
        setActionNotice(`Payment rejected.`);
        setRejectingSubId(null);
        setRejectReason('');
        await refreshList();
        setTimeout(() => setActionNotice(''), 3500);
      } else {
        setActionNotice(res.error || 'Rejection failed.');
      }
    } catch (err: any) {
      setActionNotice(err.message || 'Error occurred.');
    }
  };

  const pendingSubs = subscriptions.filter(s => s.status === 'PENDING_VERIFICATION');
  const approvedSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const allSubs = subscriptions;

  const currentDisplayList =
    filterTab === 'PENDING'
      ? pendingSubs
      : filterTab === 'APPROVED'
      ? approvedSubs
      : allSubs;

  const filteredSubs = currentDisplayList.filter(s => {
    const learner = StorageRLSLayer.getLearnerById(s.learnerId, s.learnerId);
    const searchLower = searchTerm.toLowerCase();
    return (
      (learner?.fullName && learner.fullName.toLowerCase().includes(searchLower)) ||
      (s.payerUpiId && s.payerUpiId.toLowerCase().includes(searchLower)) ||
      (s.utrReference && s.utrReference.toLowerCase().includes(searchLower)) ||
      (s.planTier && s.planTier.toLowerCase().includes(searchLower)) ||
      s.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 text-slate-100 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>PAID PAYMENT people</span>
                {pendingSubs.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-amber-400 text-slate-950 animate-bounce">
                    {pendingSubs.length} To Tick
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify student UPI transfers and tick them to instantly grant access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/80 px-3 py-1.5 rounded-xl font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Auto-Sync Active</span>
          </div>

          <button
            onClick={refreshList}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600 rounded-2xl text-xs text-emerald-200 flex items-center space-x-2.5 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* HOW'D I KNOW A KID HAS PAID EXPLAINER CARD */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white">
              How do I know a kid has paid? (3 Simple Steps)
            </h3>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHowItWorks && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs border-t border-slate-800">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-[11px]">1</span>
                <span>Kid Sends UPI Payment</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The student scans the Google Pay QR on their screen and pays <strong>₹49</strong> (Lite) or <strong>₹129</strong> (Plus) to <code>theattirebbsr@okicici</code> (17 Pratyusha Nanda).
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-indigo-400/20 flex items-center justify-center text-[11px]">2</span>
                <span>Check Your Phone / GPay</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Look at your GPay / bank SMS. Check if you received the money from the <strong>Payer UPI ID</strong> shown in the card below.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center text-[11px]">3</span>
                <span>Click &quot;Tick / Approve&quot;</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Click the big green <strong>&quot;Tick / Approve Payment ✔&quot;</strong> button. The kid&apos;s account instantly unlocks Unlimited Premium!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Filter Tabs */}
        <div className="flex space-x-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterTab === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Pending To Tick</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-white font-mono">
              {pendingSubs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('APPROVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              filterTab === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Already Approved</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {approvedSubs.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All ({allSubs.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search kid name, UPI ID, or UTR..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* LIST OF PAID PAYMENT PEOPLE */}
      <div className="space-y-4">
        {filteredSubs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">
              {filterTab === 'PENDING'
                ? 'No Pending Payments Waiting to be Ticked!'
                : 'No payments match your search.'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When a student submits their UPI payment on the website, their card will appear right here with a Tick button.
            </p>
          </div>
        ) : (
          filteredSubs.map(sub => {
            const learner: Learner | null = StorageRLSLayer.getLearnerById(sub.learnerId, sub.learnerId);
            const isPending = sub.status === 'PENDING_VERIFICATION';

            return (
              <div
                key={sub.id}
                className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 shadow-xl transition-all space-y-4 ${
                  isPending
                    ? 'border-amber-500/70 hover:border-amber-400 shadow-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Top Row: Kid Identity + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {learner?.fullName ? learner.fullName[0].toUpperCase() : 'K'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-white">
                          {learner?.fullName || 'Anonymous Student'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {learner?.board || 'CBSE'} Class {learner?.grade || '7'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Email: {learner?.email || sub.learnerId} {learner?.phone ? `• Phone: ${learner.phone}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : sub.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {isPending ? '⏳ AWAITING TICK APPROVAL' : sub.status}
                    </span>

                    <span className="text-base font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-xl">
                      ₹{sub.amountInr}.00
                    </span>
                  </div>
                </div>

                {/* Middle Grid: Payment Details for Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  {/* Payer UPI ID */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-sans font-bold">Payer UPI ID (To match in your GPay):</span>
                    <div className="flex items-center justify-between">
                      <strong className="text-indigo-300 font-bold text-xs truncate">
                        {sub.payerUpiId || 'Direct Settlement'}
                      </strong>
                      {sub.payerUpiId && (
                        <button
                          type="button"
                          onClick={() => copyPayerUpi(sub.payerUpiId!)}
                          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-sans font-semibold transition-all ml-2 flex-shrink-0"
                          title="Copy UPI ID to search in GPay"
                        >
                          {copiedUpi === sub.payerUpiId ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedUpi === sub.payerUpiId ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bank Reference / UTR */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-sans font-bold">Bank UTR / Ref Number:</span>
                    <strong className="text-amber-300 font-bold text-xs tracking-wider block">
                      {sub.utrReference || 'N/A (Identified by UPI ID)'}
                    </strong>
                  </div>

                  {/* Plan & Duration */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-sans font-bold">Plan Tier & Duration:</span>
                    <span className="text-white font-bold text-xs block">
                      {sub.planTier} ({sub.durationDays} Days Unlimited)
                    </span>
                  </div>
                </div>

                {/* Bottom Action Bar: TICK / APPROVE BUTTON */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-400">
                    <span>Submitted: {new Date(sub.createdAt).toLocaleString()}</span>
                    <span className="mx-2">•</span>
                    <span>Invoice #{sub.invoiceNumber}</span>
                  </div>

                  {isPending ? (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleApproveTick(sub.id, learner?.fullName || 'Student')}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center space-x-2 transform active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Tick / Approve Payment ✔</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectingSubId(sub.id)}
                        className="px-3.5 py-2.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800 transition-all flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Approved on {new Date(sub.verifiedAt || sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectingSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Reject Payment Verification</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter reason (e.g. money not received in GPay, invalid UPI ID).
            </p>
            <input
              type="text"
              placeholder="e.g. Not received on merchant statement..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setRejectingSubId(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingSubId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
