import React, { useState, useEffect } from 'react';
import { Learner, Friendship, StudentPackMessage } from '../../core/types';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { StudentPacksService } from '../../services/studentPacksService';
import {
  Users,
  UserPlus,
  MessageSquare,
  Shield,
  Send,
  UserCheck,
  UserX,
  Flag,
  AlertTriangle,
  Check,
  Search
} from 'lucide-react';

interface StudentPacksProps {
  learner: Learner;
}

export const StudentPacks: React.FC<StudentPacksProps> = ({ learner }) => {
  const [activeTab, setActiveTab] = useState<'FRIENDS' | 'DISCOVER' | 'CHAT'>('FRIENDS');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [discoverPeers, setDiscoverPeers] = useState<Learner[]>([]);
  const [activeChatPeer, setActiveChatPeer] = useState<Learner | null>(null);
  const [messages, setMessages] = useState<StudentPackMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [warningNotice, setWarningNotice] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const myFriends = await StudentPacksService.getFriendships(learner.id);
      setFriends(myFriends);
      const peers = await StudentPacksService.getDiscoverablePeers(learner);
      setDiscoverPeers(peers);

      if (activeChatPeer) {
        const msgs = await StudentPacksService.getMessages(learner.id, activeChatPeer.id);
        setMessages(msgs);
      }
    } catch (err) {
      console.error('[StudentPacks] Error loading live data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [learner.id, activeChatPeer]);

  const handleSendFriendRequest = async (peerId: string) => {
    const res = await StudentPacksService.sendFriendRequest(learner, peerId);
    setActionNotice(res.message);
    await loadData();
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleRespondRequest = async (friendshipId: string, action: 'ACCEPT' | 'DECLINE' | 'BLOCK') => {
    const res = await StudentPacksService.respondToRequest(learner.id, friendshipId, action);
    setActionNotice(res.message);
    await loadData();
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatPeer) return;

    setWarningNotice('');
    const text = messageInput.trim();
    setMessageInput('');

    const res = await StudentPacksService.sendMessage(learner, activeChatPeer.id, text);

    if (res.warning) {
      setWarningNotice(res.warning);
    }

    await loadData();
  };

  const handleReportActivePeer = () => {
    if (!activeChatPeer) return;
    const res = StudentPacksService.reportUser(learner, activeChatPeer.id, 'Inappropriate communication or safety breach');
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleBlockActivePeer = () => {
    if (!activeChatPeer) return;
    const myFriends = StorageRLSLayer.getFriends(learner.id);
    const friendship = myFriends.find(
      f =>
        (f.requesterId === learner.id && f.receiverId === activeChatPeer.id) ||
        (f.requesterId === activeChatPeer.id && f.receiverId === learner.id)
    );
    if (friendship) {
      handleRespondRequest(friendship.id, 'BLOCK');
      setActiveChatPeer(null);
      setActiveTab('FRIENDS');
    }
  };

  const acceptedFriends = friends.filter(f => f.status === 'ACCEPTED');
  const pendingRequests = friends.filter(f => f.status === 'PENDING' && f.receiverId === learner.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800">
      {/* Safety Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-indigo-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
            <Shield className="w-3 h-3" />
            <span>Safe &amp; Private Study Space</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            StudentPacks Community
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md">
            Connect with peer scholars in your Board & Class. Every message passes through an automated real-time PII & profanity safety firewall.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('FRIENDS')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'FRIENDS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Buddies ({acceptedFriends.length})
          </button>
          <button
            onClick={() => setActiveTab('DISCOVER')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'DISCOVER' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Discover Peers
          </button>
          {activeChatPeer && (
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'CHAT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chat: {activeChatPeer.fullName.split(' ')[0]}
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TAB 1: FRIENDS & PENDING */}
      {activeTab === 'FRIENDS' && (
        <div className="space-y-6">
          {/* Pending Invitations */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>Pending Connection Requests ({pendingRequests.length})</span>
              </h3>

              <div className="divide-y divide-amber-200">
                {pendingRequests.map(req => (
                  <div key={req.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{req.requesterName}</p>
                      <p className="text-[10px] text-slate-500">Wants to study together on AcademicLevel</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRespondRequest(req.id, 'ACCEPT')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.id, 'DECLINE')}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Friends List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Your Connected Study Buddies ({acceptedFriends.length})</span>
            </h3>

            {acceptedFriends.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                You have not connected with any study buddies yet. Switch to &quot;Discover Peers&quot; to find classmates!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {acceptedFriends.map(f => {
                  const friendId = f.requesterId === learner.id ? f.receiverId : f.requesterId;
                  const friendName = f.requesterId === learner.id ? f.receiverName : f.requesterName;
                  const friendLearner = StorageRLSLayer.getLearnerById(friendId, learner.id);

                  return (
                    <div
                      key={f.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-indigo-400 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs">
                          {friendName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{friendName}</p>
                          <p className="text-[10px] text-slate-500">
                            {friendLearner?.board || learner.board} • Class {friendLearner?.grade || learner.grade}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (friendLearner) {
                            setActiveChatPeer(friendLearner);
                            setActiveTab('CHAT');
                          }
                        }}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm transition-all"
                        title="Open Safe Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVER PEERS */}
      {activeTab === 'DISCOVER' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Find Classmates ({learner.board} Class {learner.grade})</h3>
              <p className="text-[11px] text-slate-500">Only verified students in your curriculum cohort are visible.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search peers by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {discoverPeers
              .filter(p => !searchQuery || p.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(peer => {
                const existing = friends.find(
                  f =>
                    (f.requesterId === learner.id && f.receiverId === peer.id) ||
                    (f.requesterId === peer.id && f.receiverId === learner.id)
                );

                return (
                  <div
                    key={peer.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {peer.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{peer.fullName}</p>
                        <p className="text-[10px] text-slate-500">
                          {peer.board} • Class {peer.grade} • Streak: {peer.currentStreakDays}d 🔥
                        </p>
                      </div>
                    </div>

                    <div>
                      {existing ? (
                        <span className="text-[11px] font-semibold text-slate-600 capitalize bg-slate-200 px-2.5 py-1 rounded-lg">
                          {existing.status.toLowerCase()}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendFriendRequest(peer.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME SAFE CHAT */}
      {activeTab === 'CHAT' && activeChatPeer && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[550px]">
          {/* Chat Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-xs">
                {activeChatPeer.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{activeChatPeer.fullName}</h4>
                <p className="text-[10px] text-emerald-600 flex items-center space-x-1">
                  <Shield className="w-2.5 h-2.5" />
                  <span>PII & Profanity Filter Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleReportActivePeer}
                className="p-2 text-slate-600 hover:text-amber-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition-colors flex items-center space-x-1"
                title="Report User for Safety Review"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Report</span>
              </button>
              <button
                onClick={handleBlockActivePeer}
                className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition-colors flex items-center space-x-1"
                title="Block User"
              >
                <UserX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Block</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                Say hello to {activeChatPeer.fullName}! Remember: phone numbers, emails, and external links are prohibited to ensure child safety.
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.senderId === learner.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Warning Notice if PII was blocked */}
          {warningNotice && (
            <div className="p-3 bg-red-50 border-t border-red-200 text-[11px] text-red-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{warningNotice}</span>
            </div>
          )}

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex space-x-2">
            <input
              type="text"
              placeholder={`Message ${activeChatPeer.fullName.split(' ')[0]} safely...`}
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
