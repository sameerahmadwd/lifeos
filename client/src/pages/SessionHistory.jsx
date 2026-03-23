import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { 
  Clock, Calendar as CalendarIcon, ChevronLeft, 
  Activity, Zap, ShieldCheck, Timer
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';

const SessionHistory = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDates, setActiveDates] = useState([]);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchSessionData = async (date) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/sessions/history?date=${formatDate(date)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data.sessions || []);
      setTotalDuration(res.data.totalDuration || 0);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendarStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/sessions/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveDates(res.data.map(d => d._id));
    } catch (err) {
      console.error('Failed to fetch calendar stats:', err);
    }
  };

  useEffect(() => {
    fetchSessionData(selectedDate);
    fetchCalendarStats();
  }, [selectedDate]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex">
      <TopNav />
      <Sidebar />

      <main className="flex-1 ml-[260px] pt-24 p-8 overflow-y-auto w-full">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1 flex items-center gap-3">
                <Activity className="w-8 h-8 text-indigo-500" />
                Active Time History
              </h1>
              <p className="text-slate-400 font-medium">Track your deep work and daily engagement in LifeOS.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-end">
                <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Active Time</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tighter tabular-nums leading-none">
                  {formatDuration(totalDuration)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Calendar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-28">
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Select Date</span>
                </div>
                <div className="custom-calendar-wrapper">
                  <Calendar 
                    onChange={setSelectedDate} 
                    value={selectedDate}
                    className="border-none font-sans !w-full"
                    tileClassName={({ date, view }) => {
                      if (view === 'month' && activeDates.includes(formatDate(date))) {
                        return 'has-activity';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Session List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[500px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    Sessions on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <div className="px-3 py-1 bg-slate-50 rounded-full text-[0.65rem] font-bold text-slate-400 uppercase">
                    {sessions.length} Sessions
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>
                    ))}
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map((session, idx) => (
                      <div key={session._id} className="group relative bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 border border-transparent hover:border-indigo-100 rounded-2xl p-5 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${session.duration > 1500 ? 'bg-indigo-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                              {session.duration > 1500 ? <ShieldCheck className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-800 mb-0.5">
                                {formatTime(session.startTime)} – {formatTime(session.endTime || session.lastActiveAt)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">
                                  {session.status === 'active' ? 'Active Now' : 'Closed Session'}
                                </span>
                                {session.duration > 1500 && (
                                  <span className="flex items-center gap-1 text-[0.6rem] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                                    <Zap className="w-2.5 h-2.5" /> Deep Work
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-slate-800 tracking-tighter tabular-nums mb-0.5">
                              {formatDuration(session.duration)}
                            </div>
                            <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest leading-none">
                              Duration
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Clock className="w-10 h-10 text-slate-200" />
                    </div>
                    <h4 className="text-lg font-black text-slate-400 mb-2 tracking-tight">No activity recorded</h4>
                    <p className="max-w-[280px] text-xs font-medium text-slate-300">Start using LifeOS to automatically track your active sessions here.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-calendar-wrapper .react-calendar {
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        .custom-calendar-wrapper .react-calendar__tile--active {
          background: #6366f1 !important;
          border-radius: 12px;
          color: white !important;
        }
        .custom-calendar-wrapper .react-calendar__tile--now {
          background: #f1f5f9 !important;
          border-radius: 12px;
          color: #6366f1 !important;
          font-weight: 800;
        }
        .custom-calendar-wrapper .has-activity {
          position: relative;
        }
        .custom-calendar-wrapper .has-activity::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #10b981;
          border-radius: 50%;
        }
        .custom-calendar-wrapper .react-calendar__tile:hover {
          background: #f1f5f9 !important;
          border-radius: 12px;
        }
        .custom-calendar-wrapper .react-calendar__navigation button:hover {
          background: #f1f5f9 !important;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default SessionHistory;
