import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, X, Circle, Info, AlertTriangle, Zap, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.devxlab.tech/api';

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type, priority) => {
    if (priority === 'high') return <Zap className="w-4 h-4 text-rose-500" />;
    switch (type) {
      case 'task': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'habit': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'goal': return <Info className="w-4 h-4 text-blue-500" />;
      case 'system': return <AlertTriangle className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-input hover:bg-input-hover rounded-xl border border-border shadow-sm transition-all"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary animate-pulse' : 'text-muted/60'}`} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:mt-3 w-full sm:w-[400px] h-full sm:h-auto bg-card sm:border sm:border-border sm:rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom sm:slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-border flex items-center justify-between bg-input/50 sticky top-0">
            <h3 className="font-bold text-main">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-[0.75rem] font-bold text-primary hover:underline"
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={() => { setIsOpen(false); navigate('/settings/notifications'); }}
                className="p-1 hover:bg-input rounded-lg transition-colors"
                title="Notification Settings"
              >
                <Settings className="w-5 h-5 sm:w-4 sm:h-4 text-muted/60" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1 hover:bg-input rounded-lg"
              >
                <X className="w-6 h-6 text-muted" />
              </button>
            </div>
          </div>


          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-input rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-muted/20" />
                </div>
                <p className="text-muted/60 font-semibold italic text-[0.9rem]">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div 
                    key={n._id} 
                    className={`p-4 hover:bg-input/30 transition-colors relative group ${!n.isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => n.actionUrl && navigate(n.actionUrl)}
                  >
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary/10' : 'bg-input'}`}>
                        {getIcon(n.type, n.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[0.9rem] text-main truncate">{n.title}</span>
                          <span className="text-[0.7rem] font-semibold text-muted/40 uppercase tracking-wider">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[0.85rem] text-muted/70 leading-relaxed line-clamp-2 mb-2 font-medium">
                          {n.message}
                        </p>
                        {!n.isRead && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg text-[0.7rem] font-bold transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-3 h-3" strokeWidth={3} /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-border bg-input/20 text-center">
             <button 
               onClick={() => setIsOpen(false)}
               className="text-[0.8rem] font-bold text-muted/40 hover:text-main transition-colors uppercase tracking-widest"
             >
               Dismiss Center
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
