import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Send, Loader, MessageSquare, ArrowLeft,
  CheckCheck, Check, Circle, Phone, Video,
  AlertCircle, RefreshCw, User
} from 'lucide-react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

// ─── API helper ───────────────────────────────────────────────────────────────
const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include', // 🔥 THIS FIXES EVERYTHING
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json();
};

// ─── Format timestamp ─────────────────────────────────────────────────────────
const fmtTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now  = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
    ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const fmtLastSeen = (d) => {
  if (!d) return '';
  return 'Last message ' + fmtTime(d);
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 10, showRing = false }) => (
  <img
    src={user?.profilePicture || `https://i.pravatar.cc/150?u=${user?._id || user?.email || 'default'}`}
    alt={user?.fullName || 'User'}
    className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 ${showRing ? 'ring-2 ring-indigo-400' : ''}`}
  />
);

// ─── Single message bubble ────────────────────────────────────────────────────
const MessageBubble = ({ message, isMine, showAvatar, otherUser }) => {
  const isRead = message.readBy?.includes(otherUser?._id);
  return (
    <div className={`flex items-end gap-2 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Other person's avatar */}
      {!isMine && (
        <div className="w-7 h-7 flex-shrink-0">
          {showAvatar && <Avatar user={otherUser} size={7} />}
        </div>
      )}

      <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isMine
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
        }`}>
          {message.text}
        </div>
        <div className={`flex items-center gap-1 text-[10px] text-gray-400 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{fmtTime(message.createdAt)}</span>
          {isMine && (
            isRead
              ? <CheckCheck size={12} className="text-indigo-400" />
              : <Check size={12} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Conversation list item ───────────────────────────────────────────────────
const ConversationItem = ({ conv, currentUserId, isSelected, onClick, onlineUsers }) => {
  const myRole    = localStorage.getItem('userRole');
  const otherUser = myRole === 'organizer' ? conv.workerId : conv.organizerId;
  const unread    = conv.myUnread || 0;
  const isOnline  = onlineUsers.has(String(otherUser?._id));

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-all text-left border-b border-gray-100 ${
        isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar user={otherUser} size={11} />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-gray-900 text-sm truncate">{otherUser?.fullName}</p>
          {conv.lastMessage?.sentAt && (
            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
              {fmtTime(conv.lastMessage.sentAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          <span className="text-gray-400">{conv.jobId?.title}</span>
        </p>
        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
          {conv.lastMessage?.text || 'No messages yet'}
        </p>
      </div>
      {unread > 0 && (
        <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = ({ typingUsers, currentUserId }) => {
  const others = typingUsers.filter(u => u.userId !== currentUserId);
  if (!others.length) return null;
  return (
    <div className="flex items-end gap-2">
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ChatWindow = ({ applicationId = null, onClose = null, embeddedMode = false , selectedConversation}) => {
  const myUserId   = localStorage.getItem('userId');
  const myRole     = localStorage.getItem('userRole');
  const myUserName = localStorage.getItem('userName') || 'You';

  // Socket
  const socketRef    = useRef(null);
  const [connected,   setConnected]   = useState(false);
  const [socketError, setSocketError] = useState('');

  // Conversations list
  const [conversations,     setConversations]     = useState([]);
  const [loadingConvs,      setLoadingConvs]      = useState(true);
  const [selectedConvId,    setSelectedConvId]    = useState(null);
  const [selectedConv,      setSelectedConv]      = useState(null);

  // Messages
  const [messages,     setMessages]     = useState([]);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [hasMore,      setHasMore]      = useState(false);
  const [msgPage,      setMsgPage]      = useState(1);

  // Compose
  const [text,        setText]        = useState('');
  const [sending,     setSending]     = useState(false);

  // Presence & typing
  const [onlineUsers,  setOnlineUsers]  = useState(new Set());
  const [typingUsers,  setTypingUsers]  = useState([]);
  const typingTimerRef = useRef(null);
  const isTypingRef    = useRef(false);

  // Notification badge (total unread across all conversations)
  const [totalUnread, setTotalUnread] = useState(0);

  // Mobile view state
  const [showConvList, setShowConvList] = useState(!applicationId);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typingUsers]);

  // ── Connect Socket.IO ────────────────────────────────────────────────────────
  useEffect(() => {
    // const token = localStorage.getItem('token');
    // if (!token) return;

    const socket = io(API_URL, {
  withCredentials: true, // 🔥 IMPORTANT
  transports: ['websocket', 'polling'],
});

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setSocketError('');
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('connect_error', (err) => {
      setSocketError(err.message || 'Connection failed');
      setConnected(false);
    });

    // Receive a message
    socket.on('message:receive', (message) => {
     setMessages(prev => {
    // 🔥 remove optimistic duplicate
    const filtered = prev.filter(m => {
      return !(m._optimistic && m.text === message.text);
    });

    // 🔥 prevent real duplicate
    if (filtered.some(m => m._id === message._id)) return filtered;

    return [...filtered, message];
  });
});

    // Read receipts
    socket.on('messages:read', ({ conversationId, readBy }) => {
      setMessages(prev => prev.map(m =>
        String(m.conversationId) === String(conversationId) && !m.readBy?.includes(readBy)
          ? { ...m, readBy: [...(m.readBy || []), readBy] }
          : m
      ));
    });

    // Typing
    socket.on('typing:start', ({ userId, fullName }) => {
      setTypingUsers(prev => prev.some(u => u.userId === userId) ? prev : [...prev, { userId, fullName }]);
    });
    socket.on('typing:stop', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    });

    // Presence
    socket.on('user:online',  ({ userId }) => setOnlineUsers(prev => new Set([...prev, userId])));
    socket.on('user:offline', ({ userId }) => setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; }));
    socket.on('user:status',  ({ userId, online }) => {
      setOnlineUsers(prev => {
        const s = new Set(prev);
        online ? s.add(userId) : s.delete(userId);
        return s;
      });
    });

    // Notification for messages while chat is not open
    socket.on('notification:message', ({ conversationId, senderName, text }) => {
      setTotalUnread(n => n + 1);
      setConversations(prev => prev.map(c =>
        String(c._id) === String(conversationId)
          ? { ...c, myUnread: (c.myUnread || 0) + 1, lastMessage: { text, sentAt: new Date() } }
          : c
      ));
    });

    socket.on('error', ({ message }) => console.error('Socket error:', message));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const openedConversationRef = useRef(null);
    // ── Open a conversation ──────────────────────────────────────────────────────
  const openConversation = useCallback(async (conv) => {

    if (openedConversationRef.current === conv._id) return;

   openedConversationRef.current = conv._id;
    // Leave previous room
    if (selectedConvId === conv._id) {
    return;
}
    if (selectedConvId && socketRef.current) {
      socketRef.current.emit('conversation:leave', { conversationId: selectedConvId });
      socketRef.current.emit('typing:stop', { conversationId: selectedConvId });
    }

    setSelectedConvId(conv._id);
    setSelectedConv(conv);
    setMessages([]);
    setMsgPage(1);
    setTypingUsers([]);
    setShowConvList(false);

    // Join new room
    if (socketRef.current) {
      socketRef.current.emit('conversation:join', { conversationId: conv._id });
    }
    console.log("Opening conversation:", conv);
    console.log("Conversation ID:", conv._id);
    // Load messages
    setLoadingMsgs(true);
    const data = await apiFetch(`/api/chat/conversations/${conv._id}/messages?page=1&limit=50`);
    if (data.success) {
      setMessages(data.data.messages);
      setHasMore(data.data.page < data.data.pages);
    }
    setLoadingMsgs(false);

    // Mark unread to 0 in list
    setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, myUnread: 0 } : c));
    setTotalUnread(prev => Math.max(0, prev - (conv.myUnread || 0)));

    inputRef.current?.focus();
  }, []);

  // ── Load all conversations on mount ─────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    const data = await apiFetch('/api/chat/conversations');
    if (data.success) {
      setConversations(data.data.conversations);
      const unread = data.data.conversations.reduce((s, c) => s + (c.myUnread || 0), 0);
      setTotalUnread(unread);
    }
    setLoadingConvs(false);
  }, []);

  useEffect(() => { loadConversations(); }, []);

// Automatically open conversation when OrganizerDashboard
// passes a selected application
useEffect(() => {
    if (!selectedConversation) return;

    if (!conversations.length) return;

    const conversation = conversations.find(
        conv =>
            String(
                typeof conv.applicationId === "object"
                    ? conv.applicationId._id
                    : conv.applicationId
            ) === String(selectedConversation._id)
    );

    if (!conversation) return;

    // Already opened
    if (selectedConvId === conversation._id) return;

    openConversation(conversation);

}, [selectedConversation, conversations]);

  // ── If applicationId is passed, open that conversation immediately ───────────
  useEffect(() => {
    if (!applicationId) return;
    const open = async () => {
      const data = await apiFetch('/api/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ applicationId }),
      });
      if (data.success) {
        const conv = data.data.conversation;
        setConversations(prev =>
          prev.some(c => c._id === conv._id) ? prev : [conv, ...prev]
        );
        openConversation(conv);
        setShowConvList(false);
      }
    };
    open();
  }, [applicationId]);

  

  // ── Load earlier messages ────────────────────────────────────────────────────
  const loadMoreMessages = async () => {
    if (!hasMore || !selectedConvId) return;
    const nextPage = msgPage + 1;
    const data = await apiFetch(`/api/chat/conversations/${selectedConvId}/messages?page=${nextPage}&limit=50`);
    if (data.success) {
      setMessages(prev => [...data.data.messages, ...prev]);
      setHasMore(nextPage < data.data.pages);
      setMsgPage(nextPage);
    }
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !selectedConvId || !socketRef.current) return;

    // Optimistic update
    const optimistic = {
      _id:            `temp-${Date.now()}`,
      conversationId: selectedConvId,
      senderId:       { _id: myUserId, fullName: myUserName },
      senderRole:     myRole,
      text:           trimmed,
      readBy:         [myUserId],
      createdAt:      new Date().toISOString(),
      _optimistic:    true,
    };
    setMessages(prev => [...prev, optimistic]);
    setText('');

    // Stop typing indicator
    stopTyping();

    // Emit via socket
    socketRef.current.emit('message:send', { conversationId: selectedConvId, text: trimmed });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Typing indicators ─────────────────────────────────────────────────────────
  const stopTyping = () => {
    if (isTypingRef.current && socketRef.current && selectedConvId) {
      socketRef.current.emit('typing:stop', { conversationId: selectedConvId });
      isTypingRef.current = false;
    }
    clearTimeout(typingTimerRef.current);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socketRef.current || !selectedConvId) return;
    if (!isTypingRef.current) {
      socketRef.current.emit('typing:start', { conversationId: selectedConvId });
      isTypingRef.current = true;
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, 2000);
  };

  // ── Derived values ───────────────────────────────────────────────────────────
  const otherUser = selectedConv
    ? (myRole === 'organizer' ? selectedConv.workerId : selectedConv.organizerId)
    : null;

  const isOtherOnline = otherUser ? onlineUsers.has(String(otherUser._id)) : false;

  // ── UI helpers ────────────────────────────────────────────────────────────────
  const isMine = (msg) => {
  if (!msg.senderId) return false;

  const senderId =
    typeof msg.senderId === "object"
      ? msg.senderId._id
      : msg.senderId;

  console.log("MY ID:", myUserId);
  console.log("MSG SENDER:", msg.senderId._id);

  return String(senderId) === String(myUserId);
};

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  const containerCls = embeddedMode
    ? 'flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl'
    : 'fixed inset-0 z-50 flex flex-col bg-white';
  
  return (
    <div className={containerCls}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-shrink-0">
        {/* Mobile back to list */}
        {!showConvList && (
          <button
            onClick={() => { setShowConvList(true); setSelectedConvId(null); }}
            className="lg:hidden p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {selectedConv && !showConvList ? (
          <>
            <div className="relative">
              <Avatar user={otherUser} size={9} showRing />
              {isOtherOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-indigo-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight truncate">{otherUser?.fullName}</p>
              <p className="text-xs text-indigo-200 truncate">
                {isOtherOnline
                  ? '🟢 Online'
                  : selectedConv.lastMessage?.sentAt
                  ? fmtLastSeen(selectedConv.lastMessage.sentAt)
                  : 'Offline'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <MessageSquare size={20} />
            <p className="font-bold">
              Messages
              {totalUnread > 0 && (
                <span className="ml-2 bg-white text-indigo-600 text-xs font-bold rounded-full px-1.5 py-0.5">
                  {totalUnread}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Connection indicator */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? 'bg-green-400' : 'bg-red-400'}`}
          title={connected ? 'Connected' : 'Disconnected'} />

        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-all flex-shrink-0">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Socket error banner */}
      {socketError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={14} />
          <span>Connection issue: {socketError}</span>
          <button onClick={() => socketRef.current?.connect()}
            className="ml-auto flex items-center gap-1 text-xs font-semibold underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ── BODY ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── CONVERSATION LIST ─────────────────────────────────────────────── */}
        <div className={`${showConvList ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-gray-100 flex-shrink-0`}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Conversations</p>
            <button onClick={loadConversations} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-all">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-11 h-11 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
                <MessageSquare size={48} className="text-gray-200 mb-3" />
                <p className="font-semibold text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Conversations appear when a volunteer is hired
                </p>
              </div>
            ) : (
              conversations.map(conv => (
                <ConversationItem
                  key={conv._id}
                  conv={conv}
                  currentUserId={myUserId}
                  isSelected={selectedConvId === conv._id}
                  onClick={() => openConversation(conv)}
                  onlineUsers={onlineUsers}
                />
              ))
            )}
          </div>
        </div>

        {/* ── CHAT PANEL ────────────────────────────────────────────────────── */}
        <div className={`${!showConvList ? 'flex' : 'hidden'} lg:flex flex-col flex-1 min-w-0`}>

          {!selectedConv ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-400">
                Choose a chat from the left to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Job context banner */}
              {selectedConv.jobId && (
                <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                  <span className="text-xs text-indigo-600 font-medium truncate">
                    📋 {selectedConv.jobId.title}
                    {selectedConv.jobId.location?.city && ` • ${selectedConv.jobId.location.city}`}
                    {selectedConv.jobId.date && ` • ${new Date(selectedConv.jobId.date).toLocaleDateString('en-IN')}`}
                  </span>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50">
                {/* Load more */}
                {hasMore && (
                  <div className="flex justify-center py-2">
                    <button onClick={loadMoreMessages}
                      className="text-xs text-indigo-600 font-semibold px-4 py-1.5 bg-white border border-indigo-200 rounded-full hover:bg-indigo-50 transition-all">
                      Load earlier messages
                    </button>
                  </div>
                )}

                {loadingMsgs ? (
                  <div className="flex justify-center py-8">
                    <Loader className="animate-spin text-indigo-500" size={28} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                      <MessageSquare size={24} className="text-indigo-400" />
                    </div>
                    <p className="font-semibold text-gray-600">Start the conversation!</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Say hi to {otherUser?.fullName?.split(' ')[0]}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const mine      = isMine(msg);
                    const prevMsg   = messages[idx - 1];
                    const prevSame  = prevMsg && (isMine(prevMsg) === mine);
                    const showAvatar = !mine && !prevSame;

                    return (
                      <div key={msg._id} className={idx === 0 ? '' : prevSame ? 'mt-0.5' : 'mt-3'}>
                        <MessageBubble
                          message={msg}
                          isMine={mine}
                          showAvatar={showAvatar}
                          otherUser={otherUser}
                        />
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                <TypingIndicator typingUsers={typingUsers} currentUserId={myUserId} />

                <div ref={messagesEndRef} />
              </div>

              {/* ── COMPOSE BAR ────────────────────────────────────────────── */}
              <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={text}
                      onChange={handleTextChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      maxLength={1000}
                      placeholder="Type a message… (Enter to send)"
                      className="w-full px-4 py-2.5 bg-gray-100 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all max-h-32 overflow-y-auto"
                      style={{ height: 'auto' }}
                      onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || !connected}
                    className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-indigo-200"
                  >
                    {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>

                {/* Char counter */}
                {text.length > 800 && (
                  <p className="text-xs text-gray-400 mt-1 text-right">{text.length}/1000</p>
                )}
              </div>
             
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;