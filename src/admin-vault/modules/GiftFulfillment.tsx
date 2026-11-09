import React, { useState } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { GiftRequest } from '../../core/types';
import { Gift, Check, X, Truck, Mail, Phone, Tag } from 'lucide-react';

export const GiftFulfillment: React.FC = () => {
  const [requests, setRequests] = useState<GiftRequest[]>(() =>
    StorageRLSLayer.getAllGiftRequestsAdmin(SUPER_ADMIN_EMAIL)
  );
  const [voucherCodes, setVoucherCodes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string>('');

  const refreshList = () => {
    setRequests(StorageRLSLayer.getAllGiftRequestsAdmin(SUPER_ADMIN_EMAIL));
  };

  const handleApproveDispatch = (req: GiftRequest) => {
    const code = voucherCodes[req.id]?.trim() || `GC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    req.status = 'APPROVED_DISPATCHED';
    req.updatedAt = new Date().toISOString();
    req.shippingAddress += ` | Voucher Code: ${code}`;
    StorageRLSLayer.saveGiftRequest(req);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'APPROVE_GIFT_DISPATCH',
      req.id,
      `Approved and dispatched voucher code ${code} for ${req.itemTitle} to ${req.learnerName}.`
    );
    setNotice(`Dispatched voucher ${code} to ${req.learnerName}!`);
    refreshList();
    setTimeout(() => setNotice(''), 3500);
  };

  const handleReject = (req: GiftRequest) => {
    req.status = 'REJECTED';
    req.updatedAt = new Date().toISOString();
    StorageRLSLayer.saveGiftRequest(req);
    StorageRLSLayer.recordAdminAction(
      SUPER_ADMIN_EMAIL,
      'REJECT_GIFT_DISPATCH',
      req.id,
      `Rejected gift request for ${req.itemTitle}.`
    );
    setNotice(`Rejected gift request ${req.id}.`);
    refreshList();
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <span>Gift Card & Reward Fulfillment Queue</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Fulfill ₹20 to ₹100 digital Gift Cards (Levels 1 to 9) and enter voucher redemption codes for dispatch.
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs text-emerald-300">
          {notice}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
          Queued Gift Card Redemptions ({requests.length})
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No gift card redemptions awaiting dispatch.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {requests.map(req => (
              <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{req.itemTitle}</span>
                    <span className="text-amber-400 font-mono font-bold">({req.coinsCost.toLocaleString()} Coins)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      ✉️ academiclevels@gmail.com
                    </span>
                  </div>
                  <p className="text-slate-300">Student: <strong className="text-white">{req.learnerName}</strong> (ID: {req.learnerId})</p>
                  <p className="text-slate-400 flex items-center space-x-1 font-mono text-[11px]">
                    <span>{req.shippingAddress}</span>
                  </p>
                  <p className="text-slate-400 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>WhatsApp / Phone: {req.contactPhone}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      req.status === 'APPROVED_DISPATCHED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : req.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {req.status === 'APPROVED_DISPATCHED' ? 'Delivered' : req.status}
                  </span>

                  {req.status === 'PENDING_APPROVAL' && (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Voucher Code/PIN"
                        value={voucherCodes[req.id] || ''}
                        onChange={e => setVoucherCodes({ ...voucherCodes, [req.id]: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white font-mono uppercase"
                      />
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleApproveDispatch(req)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Dispatch Code</span>
                        </button>
                        <button
                          onClick={() => handleReject(req)}
                          className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 rounded-xl"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
