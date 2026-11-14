import React, { useState, useEffect } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { GiftRequest } from '../../core/types';
import { ApiClient } from '../../core/api/apiClient';
import { StudyCoinIcon } from '../../modules/shared/StudyCoinIcon';
import confetti from 'canvas-confetti';
import {
  Gift,
  Check,
  X,
  Truck,
  Mail,
  Phone,
  Tag,
  Copy,
  Sparkles,
  ExternalLink,
  Edit3,
  Send,
  AlertCircle,
  Search,
  CheckCircle2,
  Clock,
  KeyRound
} from 'lucide-react';

export const GiftFulfillment: React.FC = () => {
  const [requests, setRequests] = useState<GiftRequest[]>(() =>
    StorageRLSLayer.getAllGiftRequestsAdmin(SUPER_ADMIN_EMAIL)
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Dedicated Dispatch / Edit Code Modal State
  const [modalReq, setModalReq] = useState<GiftRequest | null>(null);
  const [modalCodeInput, setModalCodeInput] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'DISPATCHED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from server and sync with storage
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.adminGetGifts(SUPER_ADMIN_EMAIL);
      if (res && res.success && Array.isArray(res.gifts)) {
        setRequests(res.gifts);
        res.gifts.forEach(g => StorageRLSLayer.saveGiftRequest(g));
        return;
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
    const local = StorageRLSLayer.getAllGiftRequestsAdmin(SUPER_ADMIN_EMAIL);
    setRequests(local);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openDispatchModal = (req: GiftRequest) => {
    setModalReq(req);
    setModalCodeInput(req.voucherCode || getExtractedVoucherCode(req) || '');
    setModalError(null);
  };

  const closeDispatchModal = () => {
    setModalReq(null);
    setModalCodeInput('');
    setModalError(null);
  };

  // Quick Preset Code Generator
  const generatePresetCode = (prefix: string) => {
    const rand1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const rand2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand1}-${num}-${rand2}`;
  };

  const handleApplyPreset = (prefix: string) => {
    const code = generatePresetCode(prefix);
    setModalCodeInput(code);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalReq) return;

    const trimmedCode = modalCodeInput.trim().toUpperCase();
    if (!trimmedCode) {
      setModalError('Please enter the real gift card voucher code or PIN before dispatching.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      // 1. Update backend database
      await ApiClient.adminDispatchGift(SUPER_ADMIN_EMAIL, modalReq.id, trimmedCode);
    } catch (err: any) {
      console.warn('Backend dispatch sync fallback:', err.message);
    }

    // 2. Update local state & RLS storage
    const updatedReq: GiftRequest = {
      ...modalReq,
      status: 'APPROVED_DISPATCHED',
      voucherCode: trimmedCode,
      updatedAt: new Date().toISOString()
    };

    let baseAddress = modalReq.shippingAddress || '';
    if (baseAddress.includes(' | Voucher Code:')) {
      baseAddress = baseAddress.split(' | Voucher Code:')[0].trim();
    }
    updatedReq.shippingAddress = `${baseAddress} | Voucher Code: ${trimmedCode}`;

    StorageRLSLayer.saveGiftRequest(updatedReq);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'APPROVE_GIFT_DISPATCH',
      modalReq.id,
      `Approved and dispatched voucher code ${trimmedCode} for ${modalReq.itemTitle} to ${modalReq.learnerName}.`
    );

    setRequests(prev => prev.map(r => r.id === modalReq.id ? updatedReq : r));
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setNotice(`Dispatched real voucher "${trimmedCode}" to ${modalReq.learnerName}! It is now immediately visible on the student's dashboard.`);
    setTimeout(() => setNotice(''), 5000);

    setIsSubmitting(false);
    closeDispatchModal();
    fetchRequests();
  };

  const handleReject = async (req: GiftRequest) => {
    if (!window.confirm(`Are you sure you want to reject this gift redemption for "${req.itemTitle}"?`)) return;

    try {
      await ApiClient.adminRejectGift(SUPER_ADMIN_EMAIL, req.id);
    } catch {}

    const updatedReq: GiftRequest = {
      ...req,
      status: 'REJECTED',
      updatedAt: new Date().toISOString()
    };
    StorageRLSLayer.saveGiftRequest(updatedReq);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'REJECT_GIFT_DISPATCH',
      req.id,
      `Rejected gift request for ${req.itemTitle}.`
    );

    setRequests(prev => prev.map(r => r.id === req.id ? updatedReq : r));
    setNotice(`Rejected gift request ${req.id}.`);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleCopyCode = (code: string, id: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {}
  };

  const handleShareWhatsApp = (req: GiftRequest, code: string) => {
    const rawPhone = (req.contactPhone || '').replace(/\D/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = encodeURIComponent(
      `🎉 Congratulations ${req.learnerName}!\n\n` +
      `Your AcademicLevel reward *"${req.itemTitle}"* has been approved and dispatched!\n\n` +
      `🎁 *Your Voucher Code:* ${code}\n\n` +
      `You can also view, copy, and track your gift cards anytime on your AcademicLevel dashboard: https://academiclevel.in/dashboard\n\n` +
      `Keep studying and leveling up on AcademicLevel! 🚀`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${msg}`, '_blank');
  };

  const getExtractedVoucherCode = (req: GiftRequest): string => {
    if (req.voucherCode && req.voucherCode.trim()) return req.voucherCode.trim();
    const match = req.shippingAddress?.match(/Voucher Code:\s*([^\s|]+)/i);
    if (match && match[1]) return match[1].trim();
    return '';
  };

  // Filtered requests
  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'PENDING' && req.status !== 'PENDING_APPROVAL') return false;
    if (filterStatus === 'DISPATCHED' && req.status !== 'APPROVED_DISPATCHED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (req.learnerName || '').toLowerCase().includes(q);
      const matchItem = (req.itemTitle || '').toLowerCase().includes(q);
      const matchPhone = (req.contactPhone || '').toLowerCase().includes(q);
      const matchCode = (req.voucherCode || '').toLowerCase().includes(q);
      if (!matchName && !matchItem && !matchPhone && !matchCode) return false;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING_APPROVAL').length;
  const dispatchedCount = requests.filter(r => r.status === 'APPROVED_DISPATCHED').length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <span>Gift Card & Voucher Dispatch Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fulfill real Amazon, Google Play, Flipkart & Swiggy gift cards. Dispatched voucher codes are instantly live on the student&apos;s dashboard.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <span>{loading ? 'Refreshing...' : '↻ Refresh Queue'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-700 rounded-2xl text-xs text-emerald-200 flex items-center space-x-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Pending Dispatch</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Action Needed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Dispatched & Live</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{dispatchedCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Visible to Students</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 block font-medium">Total Gift Redemptions</span>
          <p className="text-2xl font-black text-white mt-1">{requests.length}</p>
          <span className="text-[10px] text-slate-500 font-medium">All-Time Requests</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All ({requests.length})
          </button>

          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setFilterStatus('DISPATCHED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'DISPATCHED'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Dispatched ({dispatchedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student, item, code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Redemptions Queue List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No gift card redemptions found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredRequests.map(req => {
              const activeCode = getExtractedVoucherCode(req);
              const isDispatched = req.status === 'APPROVED_DISPATCHED';
              const isPending = req.status === 'PENDING_APPROVAL';

              return (
                <div key={req.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-white text-sm sm:text-base">{req.itemTitle}</span>
                      <span className="text-amber-400 font-mono font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <StudyCoinIcon className="w-3.5 h-3.5" />
                        <span>{req.coinsCost.toLocaleString()} Coins</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Destination: {req.shippingAddress.split('|')[0] || req.shippingAddress}
                      </span>
                    </div>

                    <div className="text-slate-300 space-y-0.5">
                      <p>
                        Student: <strong className="text-white">{req.learnerName}</strong> • ID: <code className="text-[11px] text-slate-400 font-mono">{req.learnerId}</code>
                      </p>
                      <p className="text-slate-400 flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Phone / WhatsApp: <strong className="text-slate-200">{req.contactPhone || 'N/A'}</strong></span>
                        <span className="text-slate-600">•</span>
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-[11px]">{new Date(req.requestedAt).toLocaleString()}</span>
                      </p>
                    </div>

                    {/* Dispatched Voucher Code Live Showcase */}
                    {isDispatched && (
                      <div className="mt-2 p-3 bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider flex items-center space-x-1">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Live Voucher Code:</span>
                          </span>
                          <span className="font-mono font-black text-amber-300 text-sm bg-slate-950 px-3 py-1 rounded-xl border border-emerald-500/40 tracking-wider">
                            {activeCode || 'AL-GC-PROCESSED'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyCode(activeCode, req.id)}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/40 flex items-center space-x-1 transition-all"
                          >
                            {copiedCodeId === req.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCodeId === req.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          {req.contactPhone && (
                            <button
                              onClick={() => handleShareWhatsApp(req, activeCode)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 transition-all shadow-sm"
                              title="Send Code via WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          )}

                          <button
                            onClick={() => openDispatchModal(req)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1 transition-all"
                            title="Edit Voucher Code"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Code</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status Column */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isDispatched
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : req.status === 'REJECTED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      }`}
                    >
                      {isDispatched ? '✓ Dispatched & Live' : req.status === 'REJECTED' ? 'Rejected' : '⏳ Pending Dispatch'}
                    </span>

                    {isPending && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDispatchModal(req)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-950 transition-all"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Enter Code &amp; Dispatch</span>
                        </button>

                        <button
                          onClick={() => handleReject(req)}
                          className="px-3 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 rounded-xl font-bold text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DEDICATED REAL CODE DISPATCH MODAL */}
      {modalReq && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={closeDispatchModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white text-center">
              Fulfill &amp; Dispatch Gift Card
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1 mb-4">
              Enter the real voucher code, gift certificate key, or PIN. It will be immediately delivered to the student&apos;s dashboard.
            </p>

            {/* Target Item Pill */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 mb-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{modalReq.itemTitle}</span>
                <span className="text-amber-400 font-mono font-bold">({modalReq.coinsCost} Coins)</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Student: <strong className="text-slate-200">{modalReq.learnerName}</strong> • Phone: {modalReq.contactPhone || 'N/A'}
              </div>
              <div className="text-[11px] text-indigo-300 font-mono truncate">
                Target: {modalReq.shippingAddress.split('|')[0] || modalReq.shippingAddress}
              </div>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Real Voucher Code / PIN (Required)
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={modalCodeInput}
                  onChange={e => setModalCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AMZN-9X2M-4819-K81M, GPLAY-XXXX-YYYY"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono font-black text-base text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                />
              </div>

              {/* Quick Format Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
                  Quick Format Helper (Click to Auto-Fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('AL-AMZ')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg border border-slate-700"
                  >
                    + Amazon Format
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('AL-GPLAY')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg border border-slate-700"
                  >
                    + Play Store
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('AL-FLPK')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg border border-slate-700"
                  >
                    + Flipkart
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('AL-SWIG')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg border border-slate-700"
                  >
                    + Swiggy
                  </button>
                </div>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={closeDispatchModal}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Dispatching...' : 'Confirm & Dispatch'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
