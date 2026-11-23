import React, { useState, useEffect } from 'react';
import { SiteConfigService, PricingConfig } from '../../services/siteConfigService';
import { SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { CreditCard, Save, RotateCcw, Check, Sparkles, AlertCircle, ShieldCheck, QrCode } from 'lucide-react';

export const PricingManager: React.FC = () => {
  const [config, setConfig] = useState<PricingConfig>(() => SiteConfigService.getPricing());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    return SiteConfigService.subscribe(() => {
      setConfig(SiteConfigService.getPricing());
    });
  }, []);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await SiteConfigService.updatePricing(SUPER_ADMIN_EMAIL, config);
      if (ok) {
        showNotice('Plan pricing, durations & UPI details updated and published live!');
      } else {
        showNotice('Pricing saved locally, server sync reported a warning.', 'error');
      }
    } catch (err: any) {
      showNotice(`Error saving pricing: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaults: PricingConfig = {
      litePriceInr: 49,
      liteDurationDays: 60,
      plusPriceInr: 129,
      plusDurationDays: 180,
      upiVpa: 'theattirebbsr@okicici',
      merchantName: 'Academic Level',
      discountBadge: 'Special Launch Offer (95% Off)',
      liteFeatures: [
        'Unlimited Quizzes & Adaptive Assessments',
        'Full Access to All Syllabus Chapters',
        'Nova AI Socratic Tutor 24/7',
        'Level Mastery Certificates',
        'Max 1 Class Change during active cycle'
      ],
      plusFeatures: [
        'Everything in Lite, Extended to 180 Days',
        'Olympiad & Competitive Reasoning Track',
        'Annual Master Certificate Eligibility',
        'Offline Question Bank Full Synchronization',
        'Bonus 40-Coin Referral Jackpot eligibility',
        'Max 1 Class Change during active cycle'
      ],
      goldPriceInr: 205,
      goldDurationDays: 365,
      goldFeatures: [
        'Full 365-Day Academic Year Unrestricted Syllabus Coverage',
        'Both Terms, Midterms, Pre-Boards & Board Final Exams Covered',
        'VIP Priority Physical Store Rewards Eligibility',
        'Exclusive Gold Scholar Profile Badge & Frame',
        'Olympiad, NTSE & National Foundation Track',
        'Annual Master Certificate of Academic Excellence',
        '24/7 Nova AI Socratic Tutor with Priority Pool',
        'Max 2 Class Changes during active cycle'
      ]
    };
    setConfig(defaults);
    showNotice('Loaded default pricing parameters. Click Save Changes to publish.');
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Live Commercial Economy Control
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Platform Plan Pricing &amp; Payment Gateway Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Modify subscription fees, validity terms, discount badges, and merchant UPI parameters. Any change reflects dynamically across landing pages, ads pages, checkout screens, and UPI payment strings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200 ${
            notice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          {notice.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Pricing Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LITE PLAN CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    Primary Offer
                  </span>
                  <h3 className="text-lg font-black text-white">AcademicLevel Lite</h3>
                </div>
                <span className="text-2xl font-black text-indigo-400">₹{config.litePriceInr}</span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Lite Plan Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={config.litePriceInr}
                    onChange={e => setConfig({ ...config, litePriceInr: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: ₹49. Appears on Special ₹49 Ads &amp; Offer pages.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Validity Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={730}
                    value={config.liteDurationDays}
                    onChange={e => setConfig({ ...config, liteDurationDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: 60 days (2 months access).</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Features Included (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={config.liteFeatures.join('\n')}
                    onChange={e => setConfig({ ...config, liteFeatures: e.target.value.split('\n').filter(s => s.trim()) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Student Rate:</span>
              <span className="font-mono text-white font-bold">₹{(config.litePriceInr / (config.liteDurationDays || 1)).toFixed(2)} / day</span>
            </div>
          </div>

          {/* PLUS PLAN CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Half-Yearly Elite
                  </span>
                  <h3 className="text-lg font-black text-white">AcademicLevel Plus</h3>
                </div>
                <span className="text-2xl font-black text-amber-400">₹{config.plusPriceInr}</span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Plus Plan Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20000}
                    value={config.plusPriceInr}
                    onChange={e => setConfig({ ...config, plusPriceInr: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: ₹129. Unlocks Olympiad track and extended validity.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Validity Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={730}
                    value={config.plusDurationDays}
                    onChange={e => setConfig({ ...config, plusDurationDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: 180 days (6 months access).</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Features Included (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={config.plusFeatures.join('\n')}
                    onChange={e => setConfig({ ...config, plusFeatures: e.target.value.split('\n').filter(s => s.trim()) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Student Rate:</span>
              <span className="font-mono text-white font-bold">₹{(config.plusPriceInr / (config.plusDurationDays || 1)).toFixed(2)} / day</span>
            </div>
          </div>

          {/* GOLD PLAN CARD */}
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative ring-2 ring-amber-500/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    👑 1-Year Master Pass
                  </span>
                  <h3 className="text-lg font-black text-white">AcademicLevel Gold</h3>
                </div>
                <span className="text-2xl font-black text-amber-400">₹{config.goldPriceInr || 205}</span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Gold Plan Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30000}
                    value={config.goldPriceInr || 205}
                    onChange={e => setConfig({ ...config, goldPriceInr: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: ₹205. Complete 365-day annual pass (~56 paise/day).</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Validity Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={config.goldDurationDays || 365}
                    onChange={e => setConfig({ ...config, goldDurationDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default: 365 days (1 full year access).</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Features Included (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(config.goldFeatures || []).join('\n')}
                    onChange={e => setConfig({ ...config, goldFeatures: e.target.value.split('\n').filter(s => s.trim()) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Student Rate:</span>
              <span className="font-mono text-amber-300 font-bold">₹{((config.goldPriceInr || 205) / (config.goldDurationDays || 365)).toFixed(2)} / day</span>
            </div>
          </div>
        </div>

        {/* UPI GATEWAY & MERCHANT SETTINGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">
              UPI Merchant &amp; Payment Gateway Configuration
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All UPI deep links (`upi://pay?pa=...`) and on-screen QR codes automatically encode these merchant credentials.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Official UPI VPA ID
              </label>
              <input
                type="text"
                value={config.upiVpa}
                onChange={e => setConfig({ ...config, upiVpa: e.target.value.trim() })}
                placeholder="e.g. theattirebbsr@okicici"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Merchant / Beneficiary Name
              </label>
              <input
                type="text"
                value={config.merchantName}
                onChange={e => setConfig({ ...config, merchantName: e.target.value })}
                placeholder="e.g. 17 Pratyusha Nanda"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Global Discount Tag / Badge
              </label>
              <input
                type="text"
                value={config.discountBadge}
                onChange={e => setConfig({ ...config, discountBadge: e.target.value })}
                placeholder="e.g. Special Launch Offer (95% Off)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Real Automated Gateway Live Links Display */}
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
            <div className="font-bold text-emerald-300 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Official Automated UPI PG Gateway Endpoints</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">Lite Plan (₹49 - 60 Days):</span>
                <a
                  href="https://upipg.cit.org.in/pay/erNAH4FIOAgE4qMpUDmI?public=true"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-emerald-300 hover:underline break-all"
                >
                  https://upipg.cit.org.in/pay/erNAH4FIOAgE4qMpUDmI?public=true ↗
                </a>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-500/20">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">Plus Plan (₹129 - 180 Days):</span>
                <a
                  href="https://upipg.cit.org.in/pay/floCfjhckOsPisvVeVE0?public=true"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-indigo-300 hover:underline break-all"
                >
                  https://upipg.cit.org.in/pay/floCfjhckOsPisvVeVE0?public=true ↗
                </a>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30">
                <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">👑 Gold Plan (₹205 - 365 Days):</span>
                <a
                  href="https://upipg.cit.org.in/pay/YGTGmsXuO4SIz1onOC6o?public=true"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-amber-300 hover:underline break-all"
                >
                  https://upipg.cit.org.in/pay/YGTGmsXuO4SIz1onOC6o?public=true ↗
                </a>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-yellow-500/30">
                <span className="text-[10px] font-mono text-yellow-400 font-bold block mb-1">🏫 School Pack (₹2,499 - 20/40 Codes):</span>
                <a
                  href="https://upipg.cit.org.in/pay/VucCVS8VRxJC9iQWEjVv?public=true"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-yellow-300 hover:underline break-all"
                >
                  https://upipg.cit.org.in/pay/VucCVS8VRxJC9iQWEjVv?public=true ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Live...' : 'Save & Publish Live Prices'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
