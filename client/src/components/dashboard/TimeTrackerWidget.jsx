import React, { useState, useEffect } from 'react';
import { Clock, Zap, History, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TimeTrackerWidget = ({ variant = 'default' }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodayTime = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo?.token) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/sessions/today`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setTotalSeconds(res.data.totalDuration || 0);
    } catch (err) {
      console.error('Failed to fetch time stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayTime();
    const interval = setInterval(fetchTodayTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const isCompact = variant === 'compact';

  if (isLoading) {
    return (
      <div className={`${isCompact ? 'bg-card rounded-2xl' : 'bg-card rounded-3xl'} p-6 shadow-sm border border-border animate-pulse`}>
        <div className="h-4 w-24 bg-input rounded mb-4"></div>
        <div className="h-8 w-32 bg-input rounded"></div>
      </div>
    );
  }

  return (
    <div className={`bg-card ${isCompact ? 'rounded-2xl' : 'rounded-3xl'} p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 group relative overflow-hidden h-full flex flex-col justify-center`}>
      {/* Background Glow - Only for default */}
      {!isCompact && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      )}
      
      <div className="relative z-10 w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 ${isCompact ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-primary/10 text-primary'} rounded-xl`}>
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">Active Time Today</span>
          </div>
          <Link 
            to="/sessions" 
            className="p-1.5 hover:bg-input rounded-lg text-muted hover:text-primary transition-colors"
          >
            <History className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-black text-main tracking-tighter leading-none">
            {formatTime(totalSeconds)}
          </h2>
          <div className="flex items-center gap-1 text-[0.65rem] font-bold text-emerald-500 uppercase tracking-tighter">
            <TrendingUp className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-input rounded-full overflow-hidden">
            <div 
              className={`h-full ${isCompact ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-full transition-all duration-1000`}
              style={{ width: `${Math.min((totalSeconds / (8 * 3600)) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-[0.6rem] font-black text-muted uppercase">8h</span>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackerWidget;
