import React, { useState } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { CoinLedgerEntry } from '../../core/types';
import { Sparkles, ShieldCheck, Search, Filter } from 'lucide-react';

export const LedgerInspector: React.FC = () => {
  const [entries] = useState<CoinLedgerEntry[]>(() =>
    StorageRLSLayer.getAllLedgerAdmin(SUPER_ADMIN_EMAIL)
  );
  const [filterReason, setFilterReason] = useState<string>('ALL');

  const filtered = entries.filter(
    e => filterReason === 'ALL' || e.reasonCode === filterReason
  );

  const totalVolume = entries.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  const credits = entries.filter(e => e.transactionType === 'CREDIT').reduce((acc, c) => acc + c.amount, 0);
  const debits = entries.filter(e => e.transactionType === 'DEBIT').reduce((acc, c) => acc + Math.abs(c.amount), 0);

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Study Coin & Reward Ledger Inspector</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable cryptographic ledger tracking all credits (+25 Level, +40 Referral, +Spins) and debits.
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs text-slate-400">Total Coins Minted</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">+{credits}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs text-slate-400">Total Coins Spent / Burned</span>
          <p className="text-2xl font-black text-rose-400 mt-1">-{debits}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs text-slate-400">Total Ledger Entries</span>
          <p className="text-2xl font-black text-white mt-1">{entries.length}</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-white">Append-Only Transactions ({filtered.length})</span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Filter Event:</span>
            <select
              value={filterReason}
              onChange={e => setFilterReason(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="ALL">All Event Types</option>
              <option value="LEVEL_COMPLETED_REWARD">Level Completed (+25)</option>
              <option value="REFERRAL_SIGNUP_QUALIFIED">Referral Qualified (+40)</option>
              <option value="DAILY_SPIN_WHEEL">Daily Spin (+2/3/5/40)</option>
              <option value="MALL_PURCHASE">Mall Purchase</option>
              <option value="GIFT_STORE_REDEMPTION">Gift Store Redemption</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono sticky top-0">
              <tr>
                <th className="p-3">Entry & Signature</th>
                <th className="p-3">Learner ID</th>
                <th className="p-3">Reason Code</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Balance After</th>
                <th className="p-3 text-right">UTC Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {filtered.map(e => (
                <tr key={e.entryId} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <p className="text-white font-semibold">{e.entryId}</p>
                    <p className="text-slate-500 text-[10px]">{e.signatureHash}</p>
                  </td>
                  <td className="p-3 text-slate-300">{e.learnerId}</td>
                  <td className="p-3 text-indigo-300 font-bold">{e.reasonCode}</td>
                  <td className="p-3">
                    <span
                      className={`font-black ${
                        e.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {e.amount >= 0 ? `+${e.amount}` : e.amount}
                    </span>
                  </td>
                  <td className="p-3 text-amber-400 font-bold">{e.balanceAfter}</td>
                  <td className="p-3 text-right text-slate-500">
                    {new Date(e.timestampUtc).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
