import React, { useState, useEffect } from 'react';
import { Clock, Bell, LogOut, Sun, Moon, Sunrise, Sunset, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TopNav = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const userName = userInfo?.name || 'User';
  const lastLogin = userInfo?.lastLogin;

  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState(userInfo?.timezone || 'UTC');

  // Re-read timezone from localStorage whenever it changes (e.g. after profile save)
  useEffect(() => {
    const sync = () => {
      const info = JSON.parse(localStorage.getItem('userInfo')) || {};
      setTimezone(info.timezone || 'UTC');
    };
    window.addEventListener('storage', sync);
    // Poll every 5 seconds in case same-tab update
    const poller = setInterval(sync, 5000);
    return () => { window.removeEventListener('storage', sync); clearInterval(poller); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in user's timezone
  const formatInTZ = (date, options) => {
    try {
      return new Date(date).toLocaleString('en-US', { ...options, timeZone: timezone });
    } catch (e) {
      return new Date(date).toLocaleString('en-US', options);
    }
  };

  const formattedTime = formatInTZ(time, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formattedDate = formatInTZ(time, { weekday: 'short', month: 'short', day: 'numeric' });

  const getGreeting = () => {
    const hourStr = formatInTZ(time, { hour: 'numeric', hour12: false });
    const hour = parseInt(hourStr, 10);
    if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: Sunrise };
    if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: Sun };
    if (hour >= 17 && hour < 21) return { text: 'Good Evening', icon: Sunset };
    return { text: 'Good Night', icon: Moon };
  };

  const handleLogout = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (token) {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) { console.error("Logout activity tracking failed", e); }
    finally {
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };

  const { text: greetingText, icon: GreetingIcon } = getGreeting();

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center fixed top-0 w-full z-30 font-sans shadow-sm px-8">

      {/* Left: Branding */}
      <div className="w-[200px] flex-shrink-0">
        <h1 className="text-[1.7rem] font-bold text-slate-800 tracking-tight leading-none">LifeOS</h1>
      </div>

      {/* Center: Greeting + Clock + Last Login */}
      <div className="flex-1 flex items-center justify-center gap-6">
        
        {/* Current Info (Greeting & Clock) */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-slate-700 mb-0.5">
            <GreetingIcon className="text-indigo-500 w-4 h-4" />
            <span className="text-[0.9rem] font-medium">
              {greetingText}, <span className="font-bold">{userName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[0.75rem] font-bold tracking-wide tabular-nums">{formattedDate} · {formattedTime}</span>
            {timezone !== 'UTC' && (
              <span className="text-[0.6rem] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                {timezone.split('/').pop().replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Vertical Separator */}
        {lastLogin && (
          <div className="w-px h-8 bg-slate-200 self-center"></div>
        )}

        {/* Last Login Info */}
        {lastLogin && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 text-slate-400">
              <History className="w-3 h-3" />
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Last Session</span>
            </div>
            <span className="text-[0.7rem] font-bold text-slate-500 tracking-tight">
              {formatInTZ(lastLogin, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="w-[200px] flex-shrink-0 flex items-center justify-end gap-4">
        <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
          <Bell className="w-5 h-5" strokeWidth={2} />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[0.85rem] font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.5} />
          Logout
        </button>
      </div>

    </header>
  );
};

export default TopNav;
