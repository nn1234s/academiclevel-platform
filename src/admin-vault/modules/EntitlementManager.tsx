import React, { useState } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { PaymentService } from '../../services/paymentService';
import { Learner, Subscription } from '../../core/types';
import { ShieldCheck, Plus, X, Award, Zap } from 'lucide-react';

export const EntitlementManager: React.FC = () => {
  const [learners] = useState<Learner[]>(() =>
    StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL)
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    StorageRLSLayer.getAllSubscriptionsAdmin(SUPER_ADMIN_EMAIL)
  );

  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');
  const [trialDays, setTrialDays] = useState<number>(30);
  const [trialTier, setTrialTier] = useState<'LITE' | 'PLUS'>('PLUS');
  const [notice, setNotice] = useState<string>('');

  const refreshSubs = () => {
    setSubscriptions(StorageRLSLayer.getAllSubscriptionsAdmin(SUPER_ADMIN_EMAIL));
  };

  const handleGrantTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearnerId) return;

    const res = PaymentService.grantTrialAdmin(SUPER_ADMIN_EMAIL, selectedLearnerId, trialDays, trialTier);
    if (res.success) {
      setNotice(`Granted ${trialDays}-day ${trialTier} entitlement to learner.`);
      refreshSubs();
      setTimeout(() => setNotice(''), 3500);
    }
  };

  const handleRevoke = (subId: string) => {
    const res = PaymentService.revokeSubscriptionAdmin(SUPER_ADMIN_EMAIL, subId, 'Admin Manual Revocation');
    if (res.success) {
      setNotice(`Subscription ${subId} revoked.`);
      refreshSubs();
      setTimeout(() => setNotice(''), 3500);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          <span>Premium & Entitlement Manager</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Grant institutional trials, extend periods, and revoke suspicious or fraudulent subscriptions.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300">
          {notice}
        </div>
      )}

      {/* Grant Trial Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Direct Grant Entitlement</h3>
        <form onSubmit={handleGrantTrial} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Target Learner</label>
            <select
              value={selectedLearnerId}
              onChange={e => setSelectedLearnerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              {learners.map(l => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.board} Cl.{l.grade})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Plan Tier</label>
            <select
              value={trialTier}
              onChange={e => setTrialTier(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="LITE">Lite Plan (Basic)</option>
              <option value="PLUS">Plus Plan (Full + Olympiad)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Duration (Days)</label>
            <input
              type="number"
              min={1}
              max={365}
              value={trialDays}
              onChange={e => setTrialDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Entitlement</span>
          </button>
        </form>
      </div>

      {/* Active Subscriptions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
          Active & Historical Subscriptions ({subscriptions.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-4">Subscription ID</th>
                <th className="p-4">Learner</th>
                <th className="p-4">Plan & Method</th>
                <th className="p-4">Validity Period</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subscriptions.map(s => {
                const learner = learners.find(l => l.id === s.learnerId);
                return (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono text-slate-300">
                      {s.id}
                      <p className="text-[10px] text-slate-500">UTR: {s.utrReference || 'None'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{learner?.fullName || s.learnerId}</p>
                      <p className="text-[11px] text-slate-400">{learner?.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-indigo-300">{s.planTier}</span>
                      <p className="text-slate-400 text-[11px]">{s.paymentMethod}</p>
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-[11px]">
                      {s.startsAt ? new Date(s.startsAt).toLocaleDateString() : 'N/A'} →{' '}
                      {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : s.status === 'REVOKED'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevoke(s.id)}
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 rounded-lg text-[11px] font-semibold"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
