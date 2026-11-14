import React, { useState, useEffect } from 'react';
import { SiteConfigService, HomeConfig, LegalConfig } from '../../services/siteConfigService';
import { SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { FileText, Home, Shield, Save, Check, AlertCircle, RotateCcw, Eye, Sparkles } from 'lucide-react';

export const SiteContentManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'HOME' | 'LEGAL'>('HOME');
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(() => SiteConfigService.getHome());
  const [legalConfig, setLegalConfig] = useState<LegalConfig>(() => SiteConfigService.getLegal());
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    return SiteConfigService.subscribe(() => {
      setHomeConfig(SiteConfigService.getHome());
      setLegalConfig(SiteConfigService.getLegal());
    });
  }, []);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await SiteConfigService.updateHome(SUPER_ADMIN_EMAIL, homeConfig);
      if (ok) {
        showNotice('Homepage content & headlines published live!');
      } else {
        showNotice('Homepage content saved locally, server sync reported warning.', 'error');
      }
    } catch (err: any) {
      showNotice(`Error saving home content: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLegal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ok = await SiteConfigService.updateLegal(SUPER_ADMIN_EMAIL, legalConfig);
      if (ok) {
        showNotice('Privacy Policy & Terms updated and published live!');
      } else {
        showNotice('Legal policies saved locally, server sync reported warning.', 'error');
      }
    } catch (err: any) {
      showNotice(`Error saving legal policies: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
              Live Content Management System (CMS)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Home Page &amp; Legal Privacy Policy Editor
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Update the homepage hero statements, announcement ticker, statistics, contact details, and formal Privacy Policy terms. Changes publish immediately across the web application.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('HOME')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'HOME'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home Page</span>
          </button>
          <button
            onClick={() => setActiveSubTab('LEGAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'LEGAL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy &amp; Terms</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
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

      {/* SUB-TAB 1: HOME PAGE EDITOR */}
      {activeSubTab === 'HOME' && (
        <form onSubmit={handleSaveHome} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Home className="w-4 h-4 text-indigo-400" />
              <span>Hero Headline &amp; Positioning</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Main Hero Title
                </label>
                <input
                  type="text"
                  value={homeConfig.heroTitle}
                  onChange={e => setHomeConfig({ ...homeConfig, heroTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-extrabold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Hero Subtitle Description
                </label>
                <textarea
                  rows={3}
                  value={homeConfig.heroSubtitle}
                  onChange={e => setHomeConfig({ ...homeConfig, heroSubtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Primary Call to Action (CTA) Button Text
                </label>
                <input
                  type="text"
                  value={homeConfig.bannerCtaText}
                  onChange={e => setHomeConfig({ ...homeConfig, bannerCtaText: e.target.value })}
                  className="w-full sm:w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Announcement Bar Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Top Announcement Ticker Bar</span>
              </h3>

              <label className="flex items-center space-x-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeConfig.announcementActive}
                  onChange={e => setHomeConfig({ ...homeConfig, announcementActive: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-300 font-bold">Show Announcement Bar</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Announcement Message Text
              </label>
              <input
                type="text"
                value={homeConfig.announcementText}
                onChange={e => setHomeConfig({ ...homeConfig, announcementText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Platform Performance Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white">
              Platform Social Proof &amp; Statistics Counters
            </h3>
            <p className="text-xs text-slate-400">
              Numbers displayed across the homepage metric bar to build parent trust.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Active Students Metric
                </label>
                <input
                  type="text"
                  value={homeConfig.statsStudents}
                  onChange={e => setHomeConfig({ ...homeConfig, statsStudents: e.target.value })}
                  placeholder="e.g. 10,000+"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Quizzes Solved Metric
                </label>
                <input
                  type="text"
                  value={homeConfig.statsQuizzes}
                  onChange={e => setHomeConfig({ ...homeConfig, statsQuizzes: e.target.value })}
                  placeholder="e.g. 500,000+"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Verified Pass Rate Metric
                </label>
                <input
                  type="text"
                  value={homeConfig.statsPassRate}
                  onChange={e => setHomeConfig({ ...homeConfig, statsPassRate: e.target.value })}
                  placeholder="e.g. 99.4%"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-950 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Save & Publish Home Page'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: PRIVACY POLICY & TERMS EDITOR */}
      {activeSubTab === 'LEGAL' && (
        <form onSubmit={handleSaveLegal} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Privacy Policy &amp; Data Protection</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Grievance Officer &amp; Support Contact Email
                  </label>
                  <input
                    type="email"
                    value={legalConfig.contactEmail}
                    onChange={e => setLegalConfig({ ...legalConfig, contactEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Effective Last Updated Date
                  </label>
                  <input
                    type="text"
                    value={legalConfig.lastUpdatedDate}
                    onChange={e => setLegalConfig({ ...legalConfig, lastUpdatedDate: e.target.value })}
                    placeholder="e.g. November 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Privacy Policy Section Heading
                </label>
                <input
                  type="text"
                  value={legalConfig.privacyPolicyHeading}
                  onChange={e => setLegalConfig({ ...legalConfig, privacyPolicyHeading: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Privacy &amp; Child Safety Policy Summary
                </label>
                <textarea
                  rows={4}
                  value={legalConfig.privacySummary}
                  onChange={e => setLegalConfig({ ...legalConfig, privacySummary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  required
                />
              </div>
            </div>
          </div>

          {/* Terms & Refund Policy */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Terms of Service &amp; Cancellation / Refund Policy</span>
            </h3>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Terms of Service Section Heading
                </label>
                <input
                  type="text"
                  value={legalConfig.termsHeading}
                  onChange={e => setLegalConfig({ ...legalConfig, termsHeading: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Terms of Service &amp; Coin Economy Summary
                </label>
                <textarea
                  rows={4}
                  value={legalConfig.termsSummary}
                  onChange={e => setLegalConfig({ ...legalConfig, termsSummary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Cancellation &amp; Refund Policy Terms
                </label>
                <textarea
                  rows={3}
                  value={legalConfig.refundPolicySummary}
                  onChange={e => setLegalConfig({ ...legalConfig, refundPolicySummary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Save & Publish Policies & Terms'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
