import React, { useState, useEffect } from 'react';
import { Clock, Zap, History, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TimeTrackerWidget = () => {
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
    // Refresh every 30 seconds to show updates
    const interval = setInterval(fetchTodayTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded mb-4"></div>
        <div className="h-8 w-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Time Today</span>
          </div>
          <Link 
            to="/sessions" 
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
            title="View History"
          >
            <History className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-end gap-3">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">
            {formatTime(totalSeconds)}
          </h2>
          <div className="flex items-center gap-1 text-[0.7rem] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            {/* Simple progress bar - 8 hours as default daily goal */}
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((totalSeconds / (8 * 3600)) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-[0.65rem] font-black text-slate-400 uppercase">Goal: 8h</span>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackerWidget;
