import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ProgressSummaryWidget from './ProgressSummaryWidget';
import TaskWidget from './TaskWidget';
import HabitWidget from './HabitWidget';
import NotesWidget from './NotesWidget';
import BottomNav from './BottomNav';
import { Loader2 } from 'lucide-react';

const DashboardLayout = () => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState({
    dashboardWidgets: { showTasks: true, showHabits: true, showNotes: true },
    theme: 'light'
  });
  
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
  const isInitialMount = useRef(true);

  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const targetDate = getTodayDate();
        const [logRes, settingsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/dashboard/${targetDate}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/settings`),
          axios.get(`${import.meta.env.VITE_API_URL}/goals`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        if (logRes.data) {
          setTasks(logRes.data.tasks || []);
          setHabits(logRes.data.habits || []);
        }
        if (settingsRes.data) {
          setGlobalSettings(settingsRes.data);
        }
        if (goalsRes.data) {
          setGoals(goalsRes.data);
        }
      } catch (error) {
        console.error('Failed to sync data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchEverything();
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
          tasks, habits
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch(e) { 
        console.error("Cloud sync conflict:", e); 
      }
    }, 400);

    return () => clearTimeout(syncTimeout);
  }, [tasks, habits, token, isLoading]);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-site flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-semibold text-sm tracking-wide uppercase text-muted">Syncing LifeOS Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-site font-sans flex transition-colors duration-300">
      <TopNav />
      <Sidebar />
      <BottomNav />
      
      <main className="flex-1 ml-0 md:ml-[260px] pt-20 md:pt-24 pb-20 md:pb-8 p-4 md:p-8 overflow-y-auto w-full bg-site transition-colors duration-300">
        <div className="w-full space-y-6 max-w-[1400px] mx-auto">
          <ProgressSummaryWidget 
            completedTasks={completedTasks} 
            totalTasks={totalTasks}
            completedHabits={completedHabits}
            totalHabits={totalHabits}
            topGoal={goals[0]}
          />



          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {globalSettings.dashboardWidgets?.showTasks && (
              <div className="lg:col-span-4 space-y-6">
                <TaskWidget tasks={tasks} setTasks={setTasks} />
              </div>
            )}

            {globalSettings.dashboardWidgets?.showHabits && (
              <div className="lg:col-span-4 space-y-6">
                <HabitWidget habits={habits} setHabits={setHabits} />
              </div>
            )}

            {globalSettings.dashboardWidgets?.showNotes && (
              <div className="lg:col-span-4 space-y-6">
                <NotesWidget />
              </div>
            )}
          </div>


        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
