import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ProgressSummaryWidget from './ProgressSummaryWidget';
import TaskWidget from './TaskWidget';
import HabitWidget from './HabitWidget';
import FocusTimerWidget from './FocusTimerWidget';
import NotesWidget from './NotesWidget';
import { Loader2 } from 'lucide-react';

const DashboardLayout = () => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [focusTime, setFocusTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
  const isInitialMount = useRef(true);

  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  useEffect(() => {
    const fetchDailyLog = async () => {
      try {
        const targetDate = getTodayDate();
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/${targetDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setTasks(res.data.tasks || []);
          setHabits(res.data.habits || []);
          setFocusTime(res.data.focusTime || 0);
        }
      } catch (error) {
        console.error('Failed to sync daily log with database:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchDailyLog();
    else setIsLoading(false);
  }, [token]);

  useEffect(() => {
    if (isInitialMount.current) {
      if (!isLoading) isInitialMount.current = false;
      return; 
    }

    const syncTimeout = setTimeout(async () => {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/dashboard/${getTodayDate()}`, {
          tasks, habits, focusTime
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch(e) { 
        console.error("Cloud sync conflict:", e); 
      }
    }, 400);

    return () => clearTimeout(syncTimeout);
  }, [tasks, habits, focusTime, token, isLoading]);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="font-semibold text-sm tracking-wide uppercase">Syncing LifeOS Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex">
      <TopNav />
      <Sidebar />
      
      <main className="flex-1 ml-[260px] pt-24 p-8 overflow-y-auto w-full">
        <div className="w-full space-y-6 max-w-[1400px] mx-auto">
          
          <ProgressSummaryWidget 
            completedTasks={completedTasks} 
            totalTasks={totalTasks}
            completedHabits={completedHabits}
            totalHabits={totalHabits}
            focusTime={focusTime}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <TaskWidget tasks={tasks} setTasks={setTasks} />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <HabitWidget habits={habits} setHabits={setHabits} />
              <FocusTimerWidget focusTime={focusTime} setFocusTime={setFocusTime} />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <NotesWidget />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
