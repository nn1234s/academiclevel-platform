import React, { useState } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { ACode } from '../../core/types';
import { KeyRound, Plus, Check, Copy } from 'lucide-react';

export const ACodeManager: React.FC = () => {
  const [acodes, setAcodes] = useState<ACode[]>(() =>
    StorageRLSLayer.getAllACodesAdmin(SUPER_ADMIN_EMAIL)
  );
  const [planTier, setPlanTier] = useState<'LITE' | 'PLUS'>('PLUS');
  const [durationDays, setDurationDays] = useState<number>(180);
  const [customSuffix, setCustomSuffix] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  const refreshList = () => {
    setAcodes(StorageRLSLayer.getAllACodesAdmin(SUPER_ADMIN_EMAIL));
  };

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();

    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const suffix = customSuffix.trim() ? customSuffix.trim().toUpperCase() : randomPart;
    const newCode = `AL-${suffix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year validity to redeem

    const acodeObj: ACode = {
      code: newCode,
      planTier,
      durationDays,
      isRedeemed: false,
      createdBy: SUPER_ADMIN_EMAIL,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    StorageRLSLayer.saveACode(acodeObj);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'GENERATE_ACODE',
      newCode,
      `Generated ${planTier} ACode voucher for ${durationDays} days.`
    );

    setCustomSuffix('');
    setNotice(`Generated ACode: ${newCode}`);
    refreshList();
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          <span>ACode Scholarship & Promotional Vouchers</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate single-use or institutional batch vouchers format `AL-XXXX-XXXX`.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300">
          {notice}
        </div>
      )}

      {/* Generator Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Mint New ACode Voucher</h3>
        <form onSubmit={handleGenerateCode} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Entitlement Tier</label>
            <select
              value={planTier}
              onChange={e => {
                const tier = e.target.value as 'LITE' | 'PLUS';
                setPlanTier(tier);
                setDurationDays(tier === 'LITE' ? 60 : 180);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="LITE">Lite Plan (60 Days)</option>
              <option value="PLUS">Plus Plan (180 Days)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Duration (Days)</label>
            <input
              type="number"
              min={1}
              max={365}
              value={durationDays}
              onChange={e => setDurationDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Optional Tag / Suffix</label>
            <input
              type="text"
              placeholder="e.g. TOPPER, OLYMPIAD"
              value={customSuffix}
              onChange={e => setCustomSuffix(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Mint ACode</span>
          </button>
        </form>
      </div>

      {/* ACodes List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
          Active ACodes Ledger ({acodes.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-4">Voucher Code</th>
                <th className="p-4">Entitlement</th>
                <th className="p-4">Redemption Status</th>
                <th className="p-4">Expires</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {acodes.map(c => (
                <tr key={c.code} className="hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-bold text-indigo-300">{c.code}</td>
                  <td className="p-4">
                    <span className="font-semibold text-white">{c.planTier}</span>
                    <span className="text-slate-400 ml-1 font-mono">({c.durationDays} days)</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.isRedeemed ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {c.isRedeemed ? 'Redeemed' : 'Available'}
                    </span>
                    {c.redeemedBy && (
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">By: {c.redeemedBy}</p>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(c.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(c.code);
                        alert(`Copied ${c.code}`);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
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
