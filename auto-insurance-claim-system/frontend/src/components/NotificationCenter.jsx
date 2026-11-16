import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, FileText, AlertTriangle, CheckCircle2, Shield, Calendar, ArrowRight, X } from 'lucide-react';
import { notificationAPI } from '../services/api';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 101,
    title: 'Claim Registration Confirmed',
    message: 'Your claim AS-CLM-2026-00101 for Toyota Camry SE was received and dispatched for document review.',
    type: 'SUCCESS',
    timestamp: '15 mins ago',
    read: false,
    claimNumber: 'CLM-2026-00101'
  },
  {
    id: 102,
    title: 'Certified Surveyor Assigned',
    message: 'Surveyor David Miller has been allocated to inspect vehicle damage at Springfield Body Works.',
    type: 'INFO',
    timestamp: '2 hours ago',
    read: false,
    claimNumber: 'CLM-2026-00101'
  },
  {
    id: 103,
    title: 'AI Damage Preliminary Score Ready',
    message: 'Computer Vision assessed frontal damage with 96.4% confidence score ($1,500 estimated).',
    type: 'AI',
    timestamp: '5 hours ago',
    read: true,
    claimNumber: 'CLM-2026-00101'
  },
  {
    id: 104,
    title: 'Policy Renewal Reminder',
    message: 'Comprehensive Policy POL-2026-88491 is active and valid until Jan 1, 2027.',
    type: 'POLICY',
    timestamp: '1 day ago',
    read: true
  }
];

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.getMyNotifications();
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        // Merge with defaults
        const merged = list.map((item, idx) => ({
          id: item.id || 200 + idx,
          title: item.title || 'System Notification',
          message: item.message,
          type: item.type || 'INFO',
          timestamp: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          read: item.read || false,
          claimNumber: item.claimNumber || 'CLM-2026-00101'
        }));
        setNotifications(merged);
      }
    } catch (err) {
      // Keep default notifications if API call fails
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.claimNumber) {
      navigate(`/claims/track?number=${notif.claimNumber}`);
    }
  };

  const filteredNotifications = filter === 'UNREAD' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case 'WARNING':
        return <AlertTriangle size={16} className="text-amber-600" />;
      case 'AI':
        return <Shield size={16} className="text-teal-600" />;
      case 'POLICY':
        return <Calendar size={16} className="text-sky-600" />;
      default:
        return <FileText size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-600 text-white text-[10px] font-bold items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-teal-400" />
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-teal-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Filter & Actions Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`font-semibold px-2 py-1 rounded-md transition ${filter === 'ALL' ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`font-semibold px-2 py-1 rounded-md transition ${filter === 'UNREAD' ? 'bg-white shadow-sm text-teal-700 border border-slate-200' : 'text-slate-500 hover:text-teal-700'}`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-slate-500 hover:text-teal-600 font-medium flex items-center gap-1 transition"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications found in this view.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex gap-3 hover:bg-slate-50 cursor-pointer transition ${!n.read ? 'bg-teal-50/40' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-bold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.claimNumber && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 mt-1 hover:underline">
                        Track {n.claimNumber} <ArrowRight size={10} />
                      </span>
                    )}
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time Camunda 7 Event Dispatcher
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;