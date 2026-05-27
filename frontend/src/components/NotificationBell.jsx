import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Loader } from 'lucide-react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json();
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const NotificationBell = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const hasUnread = unreadCount > 0;

  const loadNotifications = async () => {
    setLoading(true);
    const [listRes, countRes] = await Promise.all([
      apiFetch('/api/notifications?limit=10'),
      apiFetch('/api/notifications/unread-count'),
    ]);

    if (listRes.success) setNotifications(listRes.data.notifications);
    if (countRes.success) setUnreadCount(countRes.data.count);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();

    const socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev.filter((n) => n._id !== notification._id)].slice(0, 10));
      setUnreadCount((count) => count + 1);
    });

    return () => socket.disconnect();
  }, []);

  const markAllRead = async () => {
    const data = await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
    if (data.success) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    }
  };

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && notifications.length === 0) await loadNotifications();
  };

  const emptyText = useMemo(
    () => loading ? 'Loading notifications...' : 'No notifications yet',
    [loading]
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative p-2 hover:bg-gray-100 rounded-full"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <p className="font-bold text-gray-900">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              disabled={!hasUnread}
              className="text-xs font-semibold text-indigo-600 disabled:text-gray-300 flex items-center gap-1"
            >
              <CheckCheck size={14} /> Mark read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 flex items-center justify-center text-gray-400">
                <Loader className="animate-spin" size={20} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">{emptyText}</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (notification.link && onNavigate) onNavigate(notification.link);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-indigo-50/60 transition-colors ${
                    notification.readAt ? 'bg-white' : 'bg-indigo-50/40'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.readAt ? 'bg-gray-200' : 'bg-indigo-600'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
