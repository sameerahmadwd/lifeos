import React, { useState, useEffect } from 'react';
import { 
  Clock, Bell, LogOut, Sun, Moon, CloudSun, 
  History, Zap, Megaphone, X, Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationCenter from './NotificationCenter';


const TopNav = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const { name: userName, timezone = 'UTC' } = userInfo;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
        if (res.data) {
          setSettings(res.data);
          const dismissedId = localStorage.getItem('dismissed_announcement_id');
          if (dismissedId === res.data.announcement?.id) {
            setAnnouncementDismissed(true);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    console.log('Switching to theme:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      if (token) {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    if (settings?.announcement?.id) {
      localStorage.setItem('dismissed_announcement_id', settings.announcement.id);
    }
  };

  const formatInTZ = (date, options) => {
    try {
      return new Intl.DateTimeFormat('en-US', { ...options, timeZone: timezone }).format(date);
    } catch (e) {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  };

  const formattedTime = formatInTZ(currentTime, { hour: '2-digit', minute: '2-digit', hour12: true });
  const formattedDate = formatInTZ(currentTime, { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = currentTime.getHours();
  
  const getGreeting = () => {
    if (hour < 12) return { text: 'Good Morning', icon: Sun };
    if (hour < 18) return { text: 'Good Afternoon', icon: CloudSun };
    return { text: 'Good Evening', icon: Moon };
  };

  const { text: greetingText, icon: GreetingIcon } = getGreeting();
  const lastLogin = userInfo.lastLogin;

  const showBanner = settings?.announcement?.enabled && settings?.announcement?.message && !announcementDismissed;

  return (
    <>
      {/* Global Announcement Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-indigo-600 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-md">
          <Megaphone className="w-4 h-4 animate-bounce" />
          <span className="text-sm font-black tracking-tight">{settings.announcement.message}</span>
          <button 
            onClick={dismissAnnouncement}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <header className={`fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-[60] flex items-center px-4 md:px-8 transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''} ${showBanner ? 'mt-10' : ''}`}>
        {/* Left: Brand */}
        <div className="flex items-center gap-3 w-auto md:w-[260px] md:-ml-8 md:px-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            {settings?.logo ? (
              <img src={settings.logo} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              <Zap className="text-white w-5 h-5" />
            )}
          </div>
          <h1 className="text-[1.7rem] font-black text-main tracking-tighter leading-none">
            {settings?.appName || 'LifeOS'}
          </h1>
        </div>

        {/* Center: Greeting + Clock + Last Login */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6">
          
          {/* Current Info (Greeting & Clock) */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-main mb-0.5">
              <GreetingIcon className="text-primary w-4 h-4" />
              <span className="text-[0.9rem] font-medium text-main">
                {greetingText}, <span className="font-bold">{userName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Clock className="w-3.5 h-3.5 text-primary/60" />
              <span className="text-[0.75rem] font-bold tracking-wide tabular-nums">{formattedDate} · {formattedTime}</span>
              {timezone !== 'UTC' && (
                <span className="text-[0.6rem] font-black text-muted bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  {timezone.split('/').pop().replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Vertical Separator */}
          {lastLogin && (
            <div className="w-px h-8 bg-border self-center"></div>
          )}


          {/* Last Login Info */}
          {lastLogin && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 text-slate-400">
                <History className="w-3 h-3" />
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Last Session</span>
              </div>
              <span className="text-[0.7rem] font-bold text-slate-500 tracking-tight">
                {formatInTZ(new Date(lastLogin), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 w-auto md:w-[260px] justify-end ml-auto">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-black text-slate-800 leading-none dark:text-slate-200">{userName}</span>
            <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Verified Account</span>
          </div>
          
          {/* Settings Link (Mobile Only) */}
          <button 
            onClick={() => navigate('/settings')}
            className="md:hidden p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-primary/20 rounded-xl transition-all duration-300 group"
            title="Settings"
          >
            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all duration-300 group"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            ) : (
              <Sun className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-400" />
            )}
          </button>

          <NotificationCenter />

          <button 
            onClick={handleLogout}

            className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 group"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>
    </>
  );
};

export default TopNav;
