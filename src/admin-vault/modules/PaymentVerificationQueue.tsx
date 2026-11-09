import React, { useState, useEffect } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { PaymentService } from '../../services/paymentService';
import { Subscription } from '../../core/types';
import { Check, X, ShieldCheck, Clock, AlertCircle, RefreshCw, FileText, Copy } from 'lucide-react';

export const PaymentVerificationQueue: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    StorageRLSLayer.getAllSubscriptionsAdmin(SUPER_ADMIN_EMAIL)
  );
  const [actionNotice, setActionNotice] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const refreshList = async () => {
    await StorageRLSLayer.syncWithServer();
    setSubscriptions(StorageRLSLayer.getAllSubscriptionsAdmin(SUPER_ADMIN_EMAIL));
  };

  useEffect(() => {
    refreshList();
  }, []);

  const copyPayerUpi = (upi: string) => {
    navigator.clipboard?.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const handleApprove = (subId: string) => {
    try {
      const res = PaymentService.approvePaymentAdmin(SUPER_ADMIN_EMAIL, subId);
      if (res.success) {
        setActionNotice(`Subscription ${subId} successfully approved and activated!`);
        refreshList();
        setTimeout(() => setActionNotice(''), 3500);
      } else {
        setActionNotice(res.error || 'Approval failed.');
      }
    } catch (err: any) {
      setActionNotice(err.message || 'Error occurred.');
    }
  };

  const handleReject = (subId: string) => {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    try {
      const res = PaymentService.rejectPaymentAdmin(SUPER_ADMIN_EMAIL, subId, rejectReason.trim());
      if (res.success) {
        setActionNotice(`Subscription ${subId} rejected.`);
        setRejectingSubId(null);
        setRejectReason('');
        refreshList();
        setTimeout(() => setActionNotice(''), 3500);
      }
    } catch (err: any) {
      setActionNotice(err.message || 'Error occurred.');
    }
  };

  const pendingSubs = subscriptions.filter(s => s.status === 'PENDING_VERIFICATION');
  const processedSubs = subscriptions.filter(s => s.status !== 'PENDING_VERIFICATION');

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>UPI Payment Verification Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            One-tick approval for student submitted 12-digit UTRs and Payer UPI IDs.
          </p>
        </div>

        <button
          onClick={refreshList}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* PENDING QUEUE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Pending Audited Requests ({pendingSubs.length})</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">12-Digit Strict UTR Check</span>
        </div>

        {pendingSubs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Queue is clear. No pending UPI submissions awaiting verification.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {pendingSubs.map(sub => {
              const learner = StorageRLSLayer.getLearnerById(sub.learnerId, sub.learnerId);
              return (
                <div key={sub.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{learner?.fullName || sub.learnerId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                        {sub.planTier} (₹{sub.amountInr} • {sub.durationDays}d)
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 space-y-1 sm:space-y-0 sm:space-x-3 font-mono flex flex-wrap items-center">
                      <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400">Payer UPI:</span>
                        <strong className="text-white font-bold">{sub.payerUpiId}</strong>
                        {sub.payerUpiId && (
                          <button
                            type="button"
                            onClick={() => copyPayerUpi(sub.payerUpiId!)}
                            className="text-indigo-400 hover:text-indigo-300 ml-1 p-0.5"
                            title="Copy Payer UPI ID"
                          >
                            {copiedUpi === sub.payerUpiId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400">UTR:</span>
                        <strong className="text-amber-400 font-bold tracking-wider">{sub.utrReference || 'Not provided'}</strong>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Submitted: {new Date(sub.createdAt).toLocaleString()} • Inv #{sub.invoiceNumber}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(sub.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Activate</span>
                    </button>
                    <button
                      onClick={() => setRejectingSubId(sub.id)}
                      className="px-3 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-semibold text-xs rounded-xl border border-red-800 transition-all flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectingSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Reject Payment Verification</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter reason for rejection (e.g. UTR not reflected on bank statement, mismatched amount).
            </p>
            <input
              type="text"
              placeholder="Rejection reason..."
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

      {/* PROCESSED AUDIT LOG */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white">Processed Payment Ledger ({processedSubs.length})</h3>
        <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
          {processedSubs.map(s => (
            <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">{s.planTier} (₹{s.amountInr})</span>
                <span className="text-slate-400 ml-2 font-mono">UTR: {s.utrReference || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {s.status}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(s.verifiedAt || s.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
