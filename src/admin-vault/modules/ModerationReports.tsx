import React, { useState, useEffect } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { StudentPackMessage } from '../../core/types';
import { ShieldAlert, Check, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

export const ModerationReports: React.FC = () => {
  const [flagged, setFlagged] = useState<StudentPackMessage[]>(() =>
    StorageRLSLayer.getAllFlaggedMessagesAdmin(SUPER_ADMIN_EMAIL)
  );
  const [loading, setLoading] = useState(false);

  const loadFlagged = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('al_admin_token') || localStorage.getItem('al_admin_token') || '';
      const res = await fetch('/api/admin/moderation/flagged-messages', {
        headers: { ...(token ? { 'x-admin-token': token } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.flagged) {
          setFlagged(data.flagged.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            receiverId: m.receiverId,
            content: m.content,
            flaggedForReview: Boolean(m.flaggedForReview),
            flagReason: m.flagReason,
            isDelivered: true,
            sentAt: m.createdAt
          })));
        }
      }
    } catch {
      // Local fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlagged();
  }, []);

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>StudentPacks Moderation & Child Safety Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review automated regex PII violations (phone, email, URLs) and student-reported safety logs under DPDP Act 2023.
          </p>
        </div>
        <button
          onClick={loadFlagged}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
          Intercepted & Flagged Content ({flagged.length})
        </div>

        {flagged.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Zero active safety violations. The PII & profanity firewall is actively filtering interactions.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {flagged.map(msg => (
              <div key={msg.id} className="p-4 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-white">From: {msg.senderName} ({msg.senderId})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                    {msg.flagReason || 'PII_DETECTED'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 font-mono">
                  {msg.content}
                </div>
                <p className="text-[10px] text-slate-500">
                  Target Peer: {msg.receiverId} • Intercepted: {new Date(msg.sentAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
