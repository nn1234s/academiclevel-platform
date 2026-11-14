import React, { useState, useEffect } from 'react';
import { SiteConfigService, AdsConfig } from '../../services/siteConfigService';
import { SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { Megaphone, Save, Check, AlertCircle, RotateCcw, Flame, Tag, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdPagesManager: React.FC = () => {
  const [config, setConfig] = useState<AdsConfig>(() => SiteConfigService.getAds());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    return SiteConfigService.subscribe(() => {
      setConfig(SiteConfigService.getAds());
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
      const ok = await SiteConfigService.updateAds(SUPER_ADMIN_EMAIL, config);
      if (ok) {
        showNotice('Special ₹49 Ads page & funnels updated and published live!');
      } else {
        showNotice('Ad settings saved locally, server sync reported warning.', 'error');
      }
    } catch (err: any) {
      showNotice(`Error saving ad page configuration: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaults: AdsConfig = {
      mainHeading: 'Score 95%+ in School Exams Without Expensive Tuitions',
      subHeading: 'CBSE & ICSE Classes 1 to 12: Adaptive Daily Quizzes, 24/7 Socratic Nova AI Tutor & Real Study Coin Rewards.',
      offerPriceInr: 49,
      originalPriceInr: 999,
      discountPercent: 95,
      guaranteeDays: 60,
      timerHours: 48,
      ctaText: 'Claim 60-Day Unlimited Pass for ₹49',
      urgentNotice: '⚡ FLASH OFFER: Only 17 spots remaining at ₹49 for today\'s cohort.'
    };
    setConfig(defaults);
    showNotice('Loaded default ads funnel parameters. Click Save Changes to publish.');
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">
              Live Conversion Funnel Control
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Special ₹49 Ads Landing Page &amp; Offer Funnel Editor
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Customize copy, discount rates, pricing anchors, urgency timers, and conversion calls-to-action on <code>/special49</code>, <code>/ad</code>, and <code>/offer</code>.
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

      {/* Live Preview Pod */}
      <div className="bg-gradient-to-r from-orange-950/50 via-slate-900 to-amber-950/40 border border-orange-500/40 rounded-3xl p-6 shadow-xl space-y-3">
        <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">
          Live Funnel Hero Preview
        </span>
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs font-bold text-orange-300 inline-block">
          {config.urgentNotice}
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {config.mainHeading}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          {config.subHeading}
        </p>
        <div className="pt-2 flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-mono">
            <span className="text-slate-400 line-through text-xs">₹{config.originalPriceInr}</span>
            <span className="text-2xl font-black text-amber-400">₹{config.offerPriceInr}</span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {config.discountPercent}% OFF
            </span>
          </div>

          <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-950 flex items-center space-x-1.5">
            <span>{config.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-extrabold text-white">
              Ad Headlines &amp; Urgency Triggers
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Urgent Notice / Top Flash Banner
              </label>
              <input
                type="text"
                value={config.urgentNotice}
                onChange={e => setConfig({ ...config, urgentNotice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-orange-300 font-bold focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Main High-Converting Heading
              </label>
              <input
                type="text"
                value={config.mainHeading}
                onChange={e => setConfig({ ...config, mainHeading: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-black focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Supporting Value Proposition Subtitle
              </label>
              <textarea
                rows={3}
                value={config.subHeading}
                onChange={e => setConfig({ ...config, subHeading: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500 leading-relaxed font-sans"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing Anchor & Conversion Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">
              Price Anchoring, Guarantees &amp; Countdown Timer
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Offer Price (INR ₹)
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={config.offerPriceInr}
                onChange={e => setConfig({ ...config, offerPriceInr: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Default: ₹49</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Original Strikethrough Price (INR ₹)
              </label>
              <input
                type="number"
                min={1}
                max={50000}
                value={config.originalPriceInr}
                onChange={e => setConfig({ ...config, originalPriceInr: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Default: ₹999</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={config.discountPercent}
                onChange={e => setConfig({ ...config, discountPercent: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Default: 95%</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Urgency Timer (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={168}
                value={config.timerHours}
                onChange={e => setConfig({ ...config, timerHours: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Hours before deal resets.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Guarantee Term (Days)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={config.guaranteeDays}
                onChange={e => setConfig({ ...config, guaranteeDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">e.g. 60-Day Money-Back Guarantee.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Primary CTA Button Label
              </label>
              <input
                type="text"
                value={config.ctaText}
                onChange={e => setConfig({ ...config, ctaText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-950 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Funnel...' : 'Save & Publish Ad Pages'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
