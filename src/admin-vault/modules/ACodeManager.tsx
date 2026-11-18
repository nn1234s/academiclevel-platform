import React, { useState, useEffect } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { ACode } from '../../core/types';
import { KeyRound, Plus, Check, Copy, School, RefreshCw, Filter } from 'lucide-react';
import { ApiClient } from '../../core/api/apiClient';

interface ExtendedACode extends ACode {
  redeemedStudentName?: string;
  redeemedStudentEmail?: string;
  teacherName?: string;
  teacherEmail?: string;
}

export const ACodeManager: React.FC = () => {
  const [acodes, setAcodes] = useState<ExtendedACode[]>(() =>
    StorageRLSLayer.getAllACodesAdmin(SUPER_ADMIN_EMAIL)
  );
  const [planTier, setPlanTier] = useState<'LITE' | 'PLUS'>('PLUS');
  const [durationDays, setDurationDays] = useState<number>(180);
  const [customSuffix, setCustomSuffix] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SCHOOL' | 'STANDARD'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'REDEEMED'>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchServerCodes = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.adminGetACodes(SUPER_ADMIN_EMAIL);
      if (res && res.success && Array.isArray(res.acodes) && res.acodes.length > 0) {
        // Merge server codes with local storage codes
        const codeMap = new Map<string, ExtendedACode>();
        res.acodes.forEach((c: any) => {
          codeMap.set(c.code, {
            ...c,
            isRedeemed: Boolean(c.isRedeemed)
          });
        });
        // Include any local-only codes not yet synced
        const local = StorageRLSLayer.getAllACodesAdmin(SUPER_ADMIN_EMAIL);
        local.forEach(l => {
          if (!codeMap.has(l.code)) {
            codeMap.set(l.code, l);
          }
        });
        setAcodes(Array.from(codeMap.values()));
      }
    } catch {
      // Fallback to local storage
      setAcodes(StorageRLSLayer.getAllACodesAdmin(SUPER_ADMIN_EMAIL));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerCodes();
  }, []);

  const refreshList = () => {
    fetchServerCodes();
  };

  const handleGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();

    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const suffix = customSuffix.trim() ? customSuffix.trim().toUpperCase() : randomPart;
    const newCode = `AL-${suffix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year validity to redeem

    const acodeObj: ExtendedACode = {
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

  const filteredCodes = acodes.filter(c => {
    const isSchoolPack = c.code.startsWith('AL-SCH-');
    if (typeFilter === 'SCHOOL' && !isSchoolPack) return false;
    if (typeFilter === 'STANDARD' && isSchoolPack) return false;

    if (statusFilter === 'AVAILABLE' && c.isRedeemed) return false;
    if (statusFilter === 'REDEEMED' && !c.isRedeemed) return false;

    return true;
  });

  const schoolCodesCount = acodes.filter(c => c.code.startsWith('AL-SCH-')).length;
  const redeemedCount = acodes.filter(c => c.isRedeemed).length;

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <span>ACode Vouchers &amp; School Pack Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real database audit of all School 40/20 Pack student vouchers, promotional scholarships, and institutional keys.
          </p>
        </div>
        <button
          onClick={refreshList}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 block font-medium">Total A-Codes</span>
          <span className="text-lg font-black text-white">{acodes.length}</span>
        </div>
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl">
          <span className="text-[11px] text-amber-400 block font-medium flex items-center space-x-1">
            <School className="w-3.5 h-3.5 inline mr-1" />
            <span>School Pack Vouchers</span>
          </span>
          <span className="text-lg font-black text-amber-300">{schoolCodesCount}</span>
        </div>
        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl">
          <span className="text-[11px] text-emerald-400 block font-medium">Available (Unredeemed)</span>
          <span className="text-lg font-black text-emerald-300">{acodes.length - redeemedCount}</span>
        </div>
        <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-2xl">
          <span className="text-[11px] text-purple-400 block font-medium">Redeemed by Kids</span>
          <span className="text-lg font-black text-purple-300">{redeemedCount}</span>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300">
          {notice}
        </div>
      )}

      {/* Generator Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Mint New Admin ACode Voucher</h3>
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

      {/* ACodes List with Category & Status Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="font-bold text-xs text-white">
            ACodes Master Table ({filteredCodes.length} of {acodes.length})
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Voucher Type */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="SCHOOL">🏫 School Pack (AL-SCH-*)</option>
              <option value="STANDARD">Promo &amp; Scholarship Vouchers</option>
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">🟢 Available Only</option>
              <option value="REDEEMED">🔴 Redeemed Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-4">Voucher Code</th>
                <th className="p-4">Owner / Issuer</th>
                <th className="p-4">Entitlement</th>
                <th className="p-4">Redemption Status</th>
                <th className="p-4">Expires</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No A-Codes found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCodes.map(c => {
                  const isSchoolCode = c.code.startsWith('AL-SCH-');
                  return (
                    <tr key={c.code} className="hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-bold ${isSchoolCode ? 'text-amber-400' : 'text-indigo-300'}`}>
                            {c.code}
                          </span>
                          {isSchoolCode && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              School
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        {isSchoolCode ? (
                          <div>
                            <span className="font-semibold text-amber-300 flex items-center space-x-1">
                              <School className="w-3 h-3 text-amber-400 inline mr-1" />
                              <span>{c.teacherName || 'Teacher Admin'}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {c.teacherEmail || c.createdBy || 'Institutional Batch'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-300 font-medium">
                              {c.createdBy === 'SYSTEM_SCHOLARSHIP' ? '🏆 Scholarship Sprint' : (c.createdBy || 'Super-Admin')}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-white">{c.planTier}</span>
                        <span className="text-slate-400 ml-1 font-mono">({c.durationDays} days)</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.isRedeemed ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {c.isRedeemed ? 'Redeemed' : 'Available'}
                        </span>
                        {c.isRedeemed && (
                          <div className="mt-1">
                            <span className="text-[10px] text-indigo-300 font-medium block">
                              🎓 {c.redeemedStudentName || c.redeemedStudentEmail || c.redeemedBy || 'Enrolled Student'}
                            </span>
                          </div>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
