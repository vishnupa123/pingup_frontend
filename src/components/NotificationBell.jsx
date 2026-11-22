import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL, authHeaders } from '../lib/api';
import { useSocket } from '../context/SocketContext';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const unread = items.filter((n) => !n.read).length;

  const load = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/notifications`, { headers: authHeaders() });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onNotification = (n) => setItems((prev) => [n, ...prev].slice(0, 30));
    socket.on('notification', onNotification);
    return () => socket.off('notification', onNotification);
  }, [socket]);

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await axios.patch(`${API_URL}/api/notifications/read-all`, {}, { headers: authHeaders() });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const openItem = async (n) => {
    try {
      if (!n.read) {
        await axios.patch(`${API_URL}/api/notifications/${n._id}/read`, {}, { headers: authHeaders() });
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      }
    } catch {}
    setOpen(false);
    if (n.type === 'follow') navigate('/connections');
    if (n.type === 'post') navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-pink-500 hover:underline cursor-pointer">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
            ) : items.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => openItem(n)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${n.read ? '' : 'bg-pink-50/40'}`}
              >
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{n.type === 'follow' ? 'Follow' : 'Post'} · {new Date(n.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
