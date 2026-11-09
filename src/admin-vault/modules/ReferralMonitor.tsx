import React from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { Learner } from '../../core/types';
import { Users, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export const ReferralMonitor: React.FC = () => {
  const learners = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
  const referrals = learners.filter(l => l.referredBy);

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>Referral Fraud & Qualification Monitor</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Audit referrer/referee pairs. Reward (+40 coins) is strictly locked until genuine 1st quiz completion.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
          Active Referral Pairs ({referrals.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-4">Referee (Joined Student)</th>
                <th className="p-4">Referrer (Invited By)</th>
                <th className="p-4">Quizzes Finished</th>
                <th className="p-4">Qualification Status</th>
                <th className="p-4 text-right">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {referrals.map(ref => {
                const referrer = learners.find(l => l.id === ref.referredBy);
                return (
                  <tr key={ref.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <p className="font-bold text-white">{ref.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{ref.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-indigo-300">{referrer?.fullName || ref.referredBy}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{referrer?.email}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {ref.quizzesCompletedCount} Quizzes Completed
                    </td>
                    <td className="p-4">
                      {ref.referralQualified ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Qualified (+40 Credited)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          <span>Pending First Quiz</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500 text-[11px]">
                      {new Date(ref.createdAt).toLocaleDateString()}
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
