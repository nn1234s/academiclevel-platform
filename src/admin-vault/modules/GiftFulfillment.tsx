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
  KeyRound,
  Package,
  MapPin,
  Home,
  Globe
} from 'lucide-react';

export const GiftFulfillment: React.FC = () => {
  const [requests, setRequests] = useState<GiftRequest[]>(() =>
    StorageRLSLayer.getAllGiftRequestsAdmin(SUPER_ADMIN_EMAIL)
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  // Dedicated Status & Dispatch Modal State
  const [modalReq, setModalReq] = useState<GiftRequest | null>(null);
  const [modalStatus, setModalStatus] = useState<GiftRequest['status']>('APPROVED_DISPATCHED');
  const [modalCodeInput, setModalCodeInput] = useState<string>('');
  const [modalCourierName, setModalCourierName] = useState<string>('');
  const [modalTrackingId, setModalTrackingId] = useState<string>('');
  const [modalAdminNotes, setModalAdminNotes] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ORDERED' | 'SHIPPED' | 'DELIVERED' | 'DISPATCHED'>('ALL');
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

  const openStatusModal = (req: GiftRequest, targetStatus?: GiftRequest['status']) => {
    const isPhys = req.isPhysical || (req.shippingAddress && req.shippingAddress.includes('[PHYSICAL DELIVERY]')) || req.itemTitle.toLowerCase().includes('bottle');
    setModalReq(req);
    setModalStatus(targetStatus || (isPhys ? (req.status === 'PENDING_APPROVAL' ? 'ORDERED' : req.status) : (req.status === 'PENDING_APPROVAL' ? 'APPROVED_DISPATCHED' : req.status)));
    setModalCodeInput(req.voucherCode || getExtractedVoucherCode(req) || '');
    setModalCourierName(req.courierName || 'Amazon');
    setModalTrackingId(req.trackingId || '');
    setModalAdminNotes('');
    setModalError(null);
  };

  const closeStatusModal = () => {
    setModalReq(null);
    setModalCodeInput('');
    setModalCourierName('');
    setModalTrackingId('');
    setModalAdminNotes('');
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

  const handleUpdateStatus = async (
    req: GiftRequest,
    newStatus: GiftRequest['status'],
    details?: { voucherCode?: string; courierName?: string; trackingId?: string; adminNotes?: string }
  ) => {
    setIsSubmitting(true);
    try {
      // 1. Update backend database
      await ApiClient.adminUpdateGiftStatus(SUPER_ADMIN_EMAIL, req.id, {
        status: newStatus,
        voucherCode: details?.voucherCode,
        courierName: details?.courierName,
        trackingId: details?.trackingId,
        adminNotes: details?.adminNotes
      });
    } catch (err: any) {
      console.warn('Backend status update fallback:', err.message);
    }

    // 2. Storage RLS Layer update
    const updatedReq: GiftRequest = {
      ...req,
      status: newStatus,
      voucherCode: details?.voucherCode !== undefined ? details.voucherCode : req.voucherCode,
      courierName: details?.courierName !== undefined ? details.courierName : req.courierName,
      trackingId: details?.trackingId !== undefined ? details.trackingId : req.trackingId,
      updatedAt: new Date().toISOString()
    };

    if (details?.voucherCode) {
      let baseAddress = req.shippingAddress || '';
      if (baseAddress.includes(' | Voucher Code:')) {
        baseAddress = baseAddress.split(' | Voucher Code:')[0].trim();
      }
      updatedReq.shippingAddress = `${baseAddress} | Voucher Code: ${details.voucherCode}`;
    }

    StorageRLSLayer.saveGiftRequest(updatedReq);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'UPDATE_GIFT_STATUS',
      req.id,
      `Updated status to ${newStatus} for ${req.itemTitle} (${req.learnerName}). Tracking: ${details?.trackingId || 'N/A'}`
    );

    setRequests(prev => prev.map(r => r.id === req.id ? updatedReq : r));
    if (newStatus === 'APPROVED_DISPATCHED' || newStatus === 'SHIPPED' || newStatus === 'DELIVERED') {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    setNotice(`Updated status to "${newStatus}" for ${req.learnerName}'s ${req.itemTitle}!`);
    setTimeout(() => setNotice(''), 4500);
    setIsSubmitting(false);
    closeStatusModal();
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalReq) return;

    if (modalStatus === 'APPROVED_DISPATCHED') {
      const trimmedCode = modalCodeInput.trim().toUpperCase();
      if (!trimmedCode) {
        setModalError('Please enter the real gift card voucher code or PIN before dispatching.');
        return;
      }
      await handleUpdateStatus(modalReq, 'APPROVED_DISPATCHED', { voucherCode: trimmedCode });
      return;
    }

    if (modalStatus === 'SHIPPED') {
      const tracking = modalTrackingId.trim();
      const carrier = modalCourierName.trim() || 'Amazon';
      await handleUpdateStatus(modalReq, 'SHIPPED', {
        trackingId: tracking || undefined,
        courierName: carrier,
        adminNotes: modalAdminNotes.trim() || undefined
      });
      return;
    }

    await handleUpdateStatus(modalReq, modalStatus, {
      courierName: modalCourierName.trim() || undefined,
      trackingId: modalTrackingId.trim() || undefined,
      adminNotes: modalAdminNotes.trim() || undefined
    });
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

  const handleCopyAddress = (address: string, id: string) => {
    try {
      const cleanAddress = address
        .replace('[PHYSICAL DELIVERY VIA AMAZON WORLDWIDE]', '')
        .replace('[PHYSICAL DELIVERY VIA AMAZON]', '')
        .replace('[PHYSICAL DELIVERY]', '')
        .trim();
      navigator.clipboard.writeText(cleanAddress);
      setCopiedAddressId(id);
      setTimeout(() => setCopiedAddressId(null), 2500);
    } catch {}
  };

  const getExtractedCountry = (address?: string): string => {
    if (!address) return '';
    const match = address.match(/Country:\s*([^|]+)/i);
    return match && match[1] ? match[1].trim() : '';
  };

  const handleShareWhatsAppShipping = (req: GiftRequest, status: string, trackingId?: string, courierName?: string) => {
    const rawPhone = (req.contactPhone || '').replace(/\D/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    let messageBody = '';
    if (status === 'SHIPPED') {
      messageBody = `🎉 Hello ${req.learnerName}!\n\n` +
        `Great news! Your AcademicLevel scholar reward *"${req.itemTitle}"* has been dispatched via courier!\n\n` +
        `🚚 *Courier Partner:* ${courierName || 'Amazon Logistics'}\n` +
        `📦 *Tracking / AWB:* ${trackingId || 'Track on portal'}\n\n` +
        `Track your delivery anytime on your dashboard: https://academiclevel.in/dashboard\n\n` +
        `Keep studying and achieving on AcademicLevel! 🚀`;
    } else if (status === 'ORDERED') {
      messageBody = `🎉 Hello ${req.learnerName}!\n\n` +
        `Your AcademicLevel scholar reward *"${req.itemTitle}"* has been verified and placed for Amazon delivery!\n\n` +
        `Our fulfillment team is preparing your package. We will share your tracking number shortly.\n\n` +
        `Keep studying on AcademicLevel! 🚀`;
    } else {
      messageBody = `Hello ${req.learnerName}, your AcademicLevel reward "${req.itemTitle}" status is now: ${status}. Check: https://academiclevel.in/dashboard`;
    }
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(messageBody)}`, '_blank');
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
    if (filterStatus === 'ORDERED' && req.status !== 'ORDERED') return false;
    if (filterStatus === 'SHIPPED' && req.status !== 'SHIPPED') return false;
    if (filterStatus === 'DELIVERED' && req.status !== 'DELIVERED') return false;
    if (filterStatus === 'DISPATCHED' && req.status !== 'APPROVED_DISPATCHED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (req.learnerName || '').toLowerCase().includes(q);
      const matchItem = (req.itemTitle || '').toLowerCase().includes(q);
      const matchPhone = (req.contactPhone || '').toLowerCase().includes(q);
      const matchCode = (req.voucherCode || '').toLowerCase().includes(q);
      const matchAddress = (req.shippingAddress || '').toLowerCase().includes(q);
      const matchTracking = (req.trackingId || '').toLowerCase().includes(q);
      if (!matchName && !matchItem && !matchPhone && !matchCode && !matchAddress && !matchTracking) return false;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING_APPROVAL').length;
  const orderedCount = requests.filter(r => r.status === 'ORDERED').length;
  const shippedCount = requests.filter(r => r.status === 'SHIPPED').length;
  const deliveredCount = requests.filter(r => r.status === 'DELIVERED').length;
  const dispatchedCount = requests.filter(r => r.status === 'APPROVED_DISPATCHED').length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <span>Scholar Rewards Fulfillment &amp; Courier Dispatch Console</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage physical scholar bottles (Milton Costa 1000 &amp; Stainless Steel) and digital vouchers. Enter courier tracking or voucher codes live to students.
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Pending Review</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Action Needed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Ordered (Vendor)</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">{orderedCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Placed with Courier</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Shipped (In Transit)</span>
          <p className="text-2xl font-black text-sky-400 mt-1">{shippedCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">With Tracking ID</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Delivered / Dispatched</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{deliveredCount + dispatchedCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Fulfilled</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400 block font-medium">Total Redemptions</span>
          <p className="text-2xl font-black text-white mt-1">{requests.length}</p>
          <span className="text-[10px] text-slate-500 font-medium">All-Time Requests</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
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
            onClick={() => setFilterStatus('ORDERED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ORDERED'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Ordered ({orderedCount})
          </button>

          <button
            onClick={() => setFilterStatus('SHIPPED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'SHIPPED'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Shipped ({shippedCount})
          </button>

          <button
            onClick={() => setFilterStatus('DELIVERED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'DELIVERED'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Delivered ({deliveredCount})
          </button>

          <button
            onClick={() => setFilterStatus('DISPATCHED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'DISPATCHED'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Vouchers ({dispatchedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student, item, address, tracking..."
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
            No gift redemptions found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredRequests.map(req => {
              const activeCode = getExtractedVoucherCode(req);
              const isPhysical = req.isPhysical || (req.shippingAddress && (req.shippingAddress.includes('[PHYSICAL DELIVERY]') || req.shippingAddress.includes('[PHYSICAL DELIVERY VIA AMAZON]'))) || req.itemTitle.toLowerCase().includes('bottle') || req.itemTitle.toLowerCase().includes('squishy') || req.itemTitle.toLowerCase().includes('blaster') || req.itemTitle.toLowerCase().includes('stationery');
              const isDispatched = req.status === 'APPROVED_DISPATCHED';
              const isOrdered = req.status === 'ORDERED';
              const isShipped = req.status === 'SHIPPED';
              const isDelivered = req.status === 'DELIVERED';
              const isPending = req.status === 'PENDING_APPROVAL';

              return (
                <div key={req.id} className="p-5 flex flex-col space-y-3.5 text-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        {isPhysical && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                            <Package className="w-3 h-3 text-amber-400" />
                            <span>Amazon Courier Parcel</span>
                          </span>
                        )}
                        <span className="font-black text-white text-sm sm:text-base">{req.itemTitle}</span>
                        <span className="text-amber-400 font-mono font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          <StudyCoinIcon className="w-3.5 h-3.5" />
                          <span>{req.coinsCost.toLocaleString()} Coins</span>
                        </span>
                      </div>

                      <div className="text-slate-300 space-y-0.5">
                        <p>
                          Student: <strong className="text-white">{req.learnerName}</strong> • Learner ID: <code className="text-[11px] text-slate-400 font-mono">{req.learnerId}</code>
                        </p>
                        <p className="text-slate-400 flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Phone / WhatsApp: <strong className="text-slate-200">{req.contactPhone || 'N/A'}</strong></span>
                          <span className="text-slate-600">•</span>
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-[11px]">{new Date(req.requestedAt).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center space-x-2 self-start lg:self-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isDelivered
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isShipped
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : isOrdered
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : isDispatched
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : req.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {isDelivered
                          ? '🎉 Delivered'
                          : isShipped
                          ? '🚚 Shipped (In Transit)'
                          : isOrdered
                          ? '📦 Ordered with Vendor'
                          : isDispatched
                          ? '✓ Dispatched & Live'
                          : req.status === 'REJECTED'
                          ? 'Rejected'
                          : '⏳ Pending Action'}
                      </span>
                    </div>
                  </div>

                  {/* PHYSICAL ITEMS: FULL ADDRESS SHOWCASE */}
                  {isPhysical ? (
                    <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-2xl space-y-2.5 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Full Courier Shipping Address (Doorstep Delivery)</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyAddress(req.shippingAddress, req.id)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1 shadow-sm transition-all"
                            title="Copy Full Address for Courier / Amazon"
                          >
                            {copiedAddressId === req.id ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedAddressId === req.id ? 'Copied Full Address!' : '📋 Copy Full Address'}</span>
                          </button>

                          {req.contactPhone && (
                            <button
                              onClick={() => handleShareWhatsAppShipping(req, req.status, req.trackingId, req.courierName)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 transition-all shadow-sm"
                              title="WhatsApp Shipping Update to Student"
                            >
                              <Send className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Destination Country Badge & Worldwide Indicator */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getExtractedCountry(req.shippingAddress) ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold flex items-center space-x-1">
                            <Globe className="w-3 h-3 text-indigo-400" />
                            <span>Destination: <strong className="text-white">{getExtractedCountry(req.shippingAddress)}</strong></span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            <span>Destination: <strong className="text-white">India (Domestic)</strong></span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono">
                          🌍 Amazon Worldwide &amp; Global Courier
                        </span>
                      </div>

                      {/* FULL UN-TRUNCATED COURIER ADDRESS DISPLAY */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/25 text-xs text-white font-mono leading-relaxed select-all">
                        {req.shippingAddress.replace('[PHYSICAL DELIVERY VIA AMAZON WORLDWIDE]', '').replace('[PHYSICAL DELIVERY VIA AMAZON]', '').replace('[PHYSICAL DELIVERY]', '').trim()}
                      </div>

                      {/* Shipping Tracking Status Strip */}
                      {(isShipped || isOrdered || req.trackingId) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-400">Carrier:</span>
                            <span className="font-bold text-sky-400 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded">
                              {req.courierName || 'Courier Partner'}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Tracking / AWB:</span>
                            <span className="font-mono font-black text-amber-300 bg-slate-900 px-2.5 py-0.5 rounded border border-amber-500/30">
                              {req.trackingId || 'Order Processing'}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                            Live on Student Dashboard
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* DIGITAL VOUCHERS: FULL DESTINATION ADDRESS & VOUCHER CODE */
                    <div className="space-y-2">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-300 font-mono text-[11px]">
                        <strong>Target Destination:</strong> {req.shippingAddress}
                      </div>

                      {isDispatched && (
                        <div className="p-3 bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/50 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
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
                              onClick={() => openStatusModal(req, 'APPROVED_DISPATCHED')}
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
                  )}

                  {/* ACTION CONTROLS FOR ADMIN */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isPhysical ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req, 'ORDERED')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1 transition-all ${
                              isOrdered
                                ? 'bg-indigo-600 text-white border border-indigo-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                            }`}
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Mark Ordered</span>
                          </button>

                          <button
                            onClick={() => openStatusModal(req, 'SHIPPED')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1 transition-all ${
                              isShipped
                                ? 'bg-sky-600 text-white border border-sky-400'
                                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sm'
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{isShipped ? 'Update Shipping / Tracking' : 'Mark Shipped'}</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(req, 'DELIVERED')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1 transition-all ${
                              isDelivered
                                ? 'bg-emerald-600 text-white border border-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Delivered</span>
                          </button>

                          <button
                            onClick={() => openStatusModal(req)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Status &amp; Notes</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openStatusModal(req, 'APPROVED_DISPATCHED')}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-950 transition-all"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{isDispatched ? 'Edit Voucher Code' : 'Enter Code & Dispatch'}</span>
                          </button>
                        </>
                      )}
                    </div>

                    {req.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleReject(req)}
                        className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 rounded-xl font-bold text-xs transition-all"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPREHENSIVE STATUS & COURIER DISPATCH MODAL */}
      {modalReq && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={closeStatusModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
              {modalReq.itemTitle.toLowerCase().includes('bottle') ? (
                <Package className="w-6 h-6" />
              ) : (
                <Gift className="w-6 h-6" />
              )}
            </div>

            <h3 className="text-lg font-black text-white text-center">
              Update Reward Status &amp; Fulfillment
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1 mb-4">
              Set courier tracking, status (Ordered, Shipped, Delivered) or voucher codes. Updates are immediately visible to the student.
            </p>

            {/* Target Item Pill */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 mb-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{modalReq.itemTitle}</span>
                <span className="text-amber-400 font-mono font-bold">({modalReq.coinsCost.toLocaleString()} Coins)</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Student: <strong className="text-white">{modalReq.learnerName}</strong> • Phone: {modalReq.contactPhone || 'N/A'}
              </div>
              <div className="text-[11px] text-amber-300 font-mono leading-relaxed bg-slate-900 p-2 rounded-lg border border-slate-800 select-all">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Address / Target:</span>
                {modalReq.shippingAddress.replace('[PHYSICAL DELIVERY]', '').trim()}
              </div>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              {/* Status Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Update Status
                </label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="ORDERED">📦 ORDERED (Order placed with vendor / merchant)</option>
                  <option value="SHIPPED">🚚 SHIPPED (Courier parcel dispatched with tracking)</option>
                  <option value="DELIVERED">🎉 DELIVERED (Delivered to student&apos;s home)</option>
                  <option value="APPROVED_DISPATCHED">🎁 APPROVED &amp; DISPATCHED (Voucher code ready)</option>
                  <option value="PENDING_APPROVAL">⏳ PENDING APPROVAL (Verification in progress)</option>
                  <option value="REJECTED">❌ REJECTED</option>
                </select>
              </div>

              {/* If SHIPPED or ORDERED: Show Courier Carrier & Tracking Number inputs */}
              {(modalStatus === 'SHIPPED' || modalStatus === 'ORDERED' || modalReq.isPhysical || (modalReq.shippingAddress && (modalReq.shippingAddress.includes('[PHYSICAL DELIVERY]') || modalReq.shippingAddress.includes('[PHYSICAL DELIVERY VIA AMAZON]') || modalReq.shippingAddress.includes('[PHYSICAL DELIVERY VIA AMAZON WORLDWIDE]'))) || modalReq.itemTitle.toLowerCase().includes('bottle') || modalReq.itemTitle.toLowerCase().includes('squishy') || modalReq.itemTitle.toLowerCase().includes('blaster') || modalReq.itemTitle.toLowerCase().includes('stationery')) && (
                <div className="space-y-3 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Courier Partner / Delivery Carrier
                    </label>
                    <input
                      type="text"
                      value={modalCourierName}
                      onChange={e => setModalCourierName(e.target.value)}
                      placeholder="e.g. Amazon Logistics, BlueDart, Delhivery, DTDC, India Post"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-medium"
                    />
                    {/* Global Courier Carrier Presets */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['Amazon Global', 'Amazon Logistics', 'DHL Express', 'FedEx', 'UPS', 'Aramex', 'BlueDart', 'Delhivery', 'India Post'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setModalCourierName(c)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 font-medium"
                        >
                          + {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Courier Tracking ID / Consignment / AWB No.
                    </label>
                    <input
                      type="text"
                      value={modalTrackingId}
                      onChange={e => setModalTrackingId(e.target.value.toUpperCase())}
                      placeholder="e.g. DELH-1928491823, AWB984128"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-amber-300 text-sm focus:outline-none focus:border-amber-400 font-bold uppercase"
                    />
                  </div>
                </div>
              )}

              {/* If APPROVED_DISPATCHED: Show Real Voucher Code */}
              {modalStatus === 'APPROVED_DISPATCHED' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Real Voucher Code / PIN (Required)
                  </label>
                  <input
                    type="text"
                    required
                    value={modalCodeInput}
                    onChange={e => setModalCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AMZN-9X2M-4819-K81M, GPLAY-XXXX-YYYY"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-center font-mono font-black text-base text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                  />

                  {/* Quick Format Presets */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
                      Quick Format Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('AL-AMZ')}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded-lg border border-slate-700"
                      >
                        + Amazon
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
                </div>
              )}

              {/* Admin Internal Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Internal Admin Notes (Optional)
                </label>
                <input
                  type="text"
                  value={modalAdminNotes}
                  onChange={e => setModalAdminNotes(e.target.value)}
                  placeholder="e.g. Dispatched via Amazon Prime, delivered on Friday"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950 transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save & Update Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
