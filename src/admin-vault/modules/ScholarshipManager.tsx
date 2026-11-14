import React, { useState, useEffect } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { ApiClient } from '../../core/api/apiClient';
import { Scholarship, ScholarshipClaim, Board, Grade } from '../../core/types';
import {
  Award,
  Plus,
  Play,
  Pause,
  Trash2,
  Users,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Flame,
  X,
  Target,
  FileSpreadsheet
} from 'lucide-react';

export const ScholarshipManager: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [claims, setClaims] = useState<(ScholarshipClaim & { learnerName?: string; learnerEmail?: string; learnerGrade?: number; scholarshipTitle?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimsModalSch, setClaimsModalSch] = useState<Scholarship | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Scholarship Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetQuizCount, setTargetQuizCount] = useState<number>(10);
  const [rewardCoins, setRewardCoins] = useState<number>(250);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [targetGrade, setTargetGrade] = useState<number | 'ALL'>('ALL');
  const [targetBoard, setTargetBoard] = useState<Board | 'ALL'>('ALL');
  const [badgeTitle, setBadgeTitle] = useState('🏆 National Scholar Sprint Laureate');
  const [maxRecipients, setMaxRecipients] = useState<number>(0);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.adminGetScholarships(SUPER_ADMIN_EMAIL);
      if (res.success) {
        setScholarships(res.scholarships || []);
        setClaims(res.claims || []);
        setLoading(false);
        return;
      }
    } catch {
      // Local fallback
    }
    const localSch = StorageRLSLayer.getAllScholarships();
    const localClaims = StorageRLSLayer.getScholarshipClaims();
    setScholarships(localSch);
    setClaims(localClaims as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetQuizCount <= 0 || rewardCoins <= 0) {
      setNotice({ type: 'error', text: 'Please fill in a valid title, quiz target, and coin reward.' });
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || `Complete ${targetQuizCount} curriculum quizzes in ${durationDays} days to claim ${rewardCoins} coins!`,
      targetQuizCount: Number(targetQuizCount),
      rewardCoins: Number(rewardCoins),
      durationDays: Number(durationDays),
      targetGrade: targetGrade === 'ALL' ? undefined : Number(targetGrade),
      targetBoard: targetBoard === 'ALL' ? undefined : targetBoard,
      badgeTitle: badgeTitle.trim() || '🏆 National Scholar Sprint Laureate',
      maxRecipients: Number(maxRecipients) || 0
    };

    try {
      const res = await ApiClient.adminCreateScholarship(SUPER_ADMIN_EMAIL, payload);

      if (res.success && res.scholarship) {
        StorageRLSLayer.saveScholarship(res.scholarship);
        setNotice({ type: 'success', text: `Published scholarship: "${title}" live worldwide!` });
        setIsModalOpen(false);
        resetForm();
        await fetchScholarships();
        setTimeout(() => setNotice(null), 4000);
        return;
      } else {
        throw new Error(res.message || 'Server error creating scholarship.');
      }
    } catch (err: any) {
      // Offline fallback
      const now = new Date();
      const newSch: Scholarship = {
        id: 'sch_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        title: title.trim(),
        description: description.trim() || `Complete ${targetQuizCount} quizzes in ${durationDays} days to receive ${rewardCoins} coins!`,
        targetQuizCount: Number(targetQuizCount),
        rewardCoins: Number(rewardCoins),
        durationDays: Number(durationDays),
        targetGrade: targetGrade === 'ALL' ? undefined : Number(targetGrade),
        targetBoard: targetBoard === 'ALL' ? undefined : targetBoard,
        badgeTitle: badgeTitle.trim() || '🏆 National Scholar Sprint Laureate',
        maxRecipients: Number(maxRecipients) || 0,
        claimedCount: 0,
        isActive: true,
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + durationDays * 86400000).toISOString(),
        createdBy: SUPER_ADMIN_EMAIL,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      StorageRLSLayer.saveScholarship(newSch);
      setNotice({ type: 'success', text: `Published scholarship: "${title}" live worldwide!` });
      setIsModalOpen(false);
      resetForm();
      await fetchScholarships();
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetQuizCount(10);
    setRewardCoins(250);
    setDurationDays(7);
    setTargetGrade('ALL');
    setTargetBoard('ALL');
    setBadgeTitle('🏆 National Scholar Sprint Laureate');
    setMaxRecipients(0);
  };

  const handleToggle = async (sch: Scholarship) => {
    try {
      await ApiClient.adminToggleScholarship(SUPER_ADMIN_EMAIL, sch.id);
    } catch {
      // Offline
    }
    sch.isActive = !sch.isActive;
    sch.updatedAt = new Date().toISOString();
    StorageRLSLayer.saveScholarship(sch);
    setNotice({
      type: 'success',
      text: sch.isActive ? `Resumed "${sch.title}" live worldwide.` : `Paused "${sch.title}". Students cannot claim while paused.`
    });
    fetchScholarships();
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = async (sch: Scholarship) => {
    if (!window.confirm(`Are you sure you want to remove scholarship "${sch.title}"?`)) return;
    try {
      await ApiClient.adminDeleteScholarship(SUPER_ADMIN_EMAIL, sch.id);
      StorageRLSLayer.deleteScholarship(sch.id);
      setNotice({ type: 'success', text: `Scholarship "${sch.title}" deleted successfully.` });
      await fetchScholarships();
    } catch (err: any) {
      StorageRLSLayer.deleteScholarship(sch.id);
      setNotice({ type: 'success', text: `Scholarship "${sch.title}" deleted.` });
      await fetchScholarships();
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const totalCoinsDisbursed = claims.reduce((acc, c) => acc + (c.coinsAwarded || 0), 0);
  const activeCount = scholarships.filter(s => s.isActive).length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner & KPI Pods */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Worldwide Scholarships & Scholar Sprints</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Launch live nationwide scholarship challenges across all classes (e.g. Complete 10 quizzes in 1 week = 250 Coins).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-950 transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Worldwide Scholarship</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Worldwide Sprints</span>
          <div className="flex items-center space-x-2 mt-1">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-xl font-black text-white">{activeCount}</span>
            <span className="text-xs text-slate-500 font-normal">/ {scholarships.length} total</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Students Awarded</span>
          <div className="flex items-center space-x-2 mt-1">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-xl font-black text-white">{claims.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">Scholar Claims</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Coins Disbursed</span>
          <div className="flex items-center space-x-2 mt-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xl font-black text-amber-300">{totalCoinsDisbursed.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-normal">Coins</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eligible Audience</span>
          <div className="flex items-center space-x-2 mt-1">
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="text-xl font-black text-white">Classes 1–12</span>
            <span className="text-xs text-slate-500 font-normal">CBSE / ICSE / State</span>
          </div>
        </div>
      </div>

      {/* Scholarships List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>All Worldwide Scholarship Programs</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
              {scholarships.length}
            </span>
          </h3>
        </div>

        {scholarships.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">No scholarships created yet.</p>
            <p className="text-xs text-slate-500 mt-1">Click &quot;Create Worldwide Scholarship&quot; to publish your first sprint challenge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {scholarships.map(sch => {
              const isEnded = new Date(sch.endDate).getTime() < Date.now();
              const daysLeft = Math.max(0, Math.ceil((new Date(sch.endDate).getTime() - Date.now()) / 86400000));
              const schClaims = claims.filter(c => c.scholarshipId === sch.id);

              return (
                <div
                  key={sch.id}
                  className={`border rounded-2xl p-5 relative overflow-hidden transition-all flex flex-col justify-between ${
                    sch.isActive && !isEnded
                      ? 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50 shadow-md'
                      : 'bg-slate-950/30 border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            sch.isActive && !isEnded
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                              : isEnded
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-950 border border-amber-800 text-amber-300'
                          }`}
                        >
                          {isEnded ? 'Challenge Ended' : sch.isActive ? 'Active Worldwide' : 'Paused by Admin'}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950/80 border border-indigo-800 text-indigo-300">
                          {sch.durationDays} Days Sprint
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 font-black text-xs text-amber-400 bg-amber-950/50 border border-amber-800/80 px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+{sch.rewardCoins} Coins</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-base font-extrabold text-white leading-snug">{sch.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sch.description}</p>
                    </div>

                    {/* Criteria Pod */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block">Requirement:</span>
                        <span className="font-bold text-white flex items-center space-x-1">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{sch.targetQuizCount} Quizzes Completed</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Eligibility:</span>
                        <span className="font-bold text-white">
                          {sch.targetGrade ? `Class ${sch.targetGrade}` : 'All Classes (1-12)'}
                          {sch.targetBoard ? ` • ${sch.targetBoard}` : ''}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="text-slate-500 block">Window:</span>
                        <span className="font-medium text-slate-300 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{isEnded ? 'Expired' : `${daysLeft} days remaining`}</span>
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="text-slate-500 block">Awarded Students:</span>
                        <span className="font-bold text-emerald-400 flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{schClaims.length} Claimed {sch.maxRecipients ? `/ ${sch.maxRecipients}` : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setClaimsModalSch(sch)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Claim Ledger ({schClaims.length})</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggle(sch)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                          sch.isActive
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                        title={sch.isActive ? 'Pause challenge' : 'Resume challenge'}
                      >
                        {sch.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span className="text-[11px] hidden sm:inline">{sch.isActive ? 'Pause' : 'Resume'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(sch)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition-all"
                        title="Delete scholarship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Create Worldwide Scholarship</h3>
                <p className="text-xs text-slate-400">Publish a live quiz challenge for students across India & worldwide.</p>
              </div>
            </div>

            <form onSubmit={handleCreateScholarship} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Scholarship / Challenge Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-Day National Math & Science Scholar Sprint"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Explain what students must achieve and what reward they will receive..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Quizzes Required *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={targetQuizCount}
                    onChange={e => setTargetQuizCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">e.g. 10 quizzes</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Coin Reward *</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    step="10"
                    required
                    value={rewardCoins}
                    onChange={e => setRewardCoins(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">Credited to wallet</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Duration Window *</label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={3}>3 Days (Weekend)</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                    <option value={60}>60 Days (Term)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Class</label>
                  <select
                    value={targetGrade}
                    onChange={e => setTargetGrade(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Classes (1 to 12)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Target Education Board</label>
                  <select
                    value={targetBoard}
                    onChange={e => setTargetBoard(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Boards (CBSE / ICSE / State)</option>
                    <option value="CBSE">CBSE Board Only</option>
                    <option value="ICSE">ICSE Board Only</option>
                    <option value="STATE">State Board Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Achievement Badge / Title</label>
                  <input
                    type="text"
                    value={badgeTitle}
                    onChange={e => setBadgeTitle(e.target.value)}
                    placeholder="🏆 National Scholar Sprint Laureate"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Recipient Limit (0 = Unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxRecipients}
                    onChange={e => setMaxRecipients(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">e.g. 100 for First 100 students</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-950 transition-all"
                >
                  Publish Worldwide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claims Ledger Modal */}
      {claimsModalSch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setClaimsModalSch(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Scholarship Claim Ledger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {claimsModalSch.title} • {claimsModalSch.rewardCoins} Coins per recipient
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {claims.filter(c => c.scholarshipId === claimsModalSch.id).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No students have completed and claimed this scholarship reward yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {claims
                    .filter(c => c.scholarshipId === claimsModalSch.id)
                    .map(c => (
                      <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white block">{c.learnerName || 'Student'}</span>
                          <span className="text-[11px] text-slate-400">{c.learnerEmail}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-300 block">+{c.coinsAwarded} Coins</span>
                          <span className="text-[10px] text-slate-500">{new Date(c.claimedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
