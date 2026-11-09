import React, { useState } from 'react';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../../core/storage/StorageRLSLayer';
import { StudentPackMessage } from '../../core/types';
import { ShieldAlert, Check, AlertTriangle, Eye } from 'lucide-react';

export const ModerationReports: React.FC = () => {
  const [flagged] = useState<StudentPackMessage[]>(() =>
    StorageRLSLayer.getAllFlaggedMessagesAdmin(SUPER_ADMIN_EMAIL)
  );

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span>StudentPacks Moderation & Child Safety Queue</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Review automated regex PII violations (phone, email, URLs) and student-reported safety logs under DPDP Act 2023.
        </p>
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
