import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';
import { 
  Plus, Trash2, CheckCircle2, Circle, Loader2, ListTodo, Search, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Tag, 
  Filter, MoreVertical, LayoutGrid, LayoutList
} from 'lucide-react';

const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Urgent'];

const CATEGORY_COLORS = {
  General: 'bg-slate-100 text-slate-600',
  Work: 'bg-blue-100 text-blue-600',
  Personal: 'bg-purple-100 text-purple-600',
  Health: 'bg-emerald-100 text-emerald-600',
  Finance: 'bg-amber-100 text-amber-600',
  Urgent: 'bg-red-100 text-red-600'
};

const Tasks = () => {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
  
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [newTaskGoal, setNewTaskGoal] = useState('');
  const [newTaskProgressValue, setNewTaskProgressValue] = useState(0);
  
  // Advanced Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: null, end: null });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mobileView, setMobileView] = useState('pending'); // 'pending' or 'completed'

  // Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return navigate('/login');
    const fetchData = async () => {
      try {
        const [tasksRes, goalsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/goals`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setTasks(tasksRes.data || []);
        setGoals(goalsRes.data || []);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [token, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    console.log('FRONTEND: Adding task with category:', newTaskCategory);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, 
        { 
          text: newTaskText, 
          category: newTaskCategory,
          goal: newTaskGoal || undefined,
          progressValue: Number(newTaskProgressValue) || 0
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks([res.data, ...tasks]);
      setNewTaskText('');
      setNewTaskGoal('');
      setNewTaskProgressValue(0);
    } catch(err) { console.error(err); }
  };

  const toggleTask = async (task) => {
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t._id === task._id ? { ...t, completed: !t.completed } : t));
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${task._id}`,
        { completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch(err) {
      console.error(err);
      setTasks(prevTasks); 
    }
  };

  const deleteTask = async (id) => {
    const prevTasks = [...tasks];
    setTasks(tasks.filter(t => t._id !== id));
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(err) {
      console.error(err);
      setTasks(prevTasks);
    }
  };

  const parseDateNatively = (dateStr) => {
     if (!dateStr) return '';
     let [y, m, d] = dateStr.split('-');
     let dateObj = new Date(y, m - 1, d);
     return dateObj.toLocaleString('default', { month: 'short', day: 'numeric' });
  };
  
  const parseLongDate = (dateStr) => {
     if (!dateStr) return '';
     let [y, m, d] = dateStr.split('-');
     let dateObj = new Date(y, m - 1, d);
     return dateObj.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const uniqueDates = useMemo(() => {
    const validDates = tasks.map(t => t.date).filter(Boolean);
    const set = new Set(validDates);
    return Array.from(set).sort((a,b) => new Date(b) - new Date(a));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.text.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (dateFilter.start && dateFilter.end) {
        matchesDate = t.date >= dateFilter.start && t.date <= dateFilter.end;
      } else if (dateFilter.start && !dateFilter.end) {
        matchesDate = t.date === dateFilter.start;
      }

      const matchesCategory = categoryFilter === 'all' || (t.category || 'General') === categoryFilter;

      return matchesSearch && matchesDate && matchesCategory;
    });
  }, [tasks, searchQuery, dateFilter, categoryFilter]);

  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const groupTasks = (taskList) => {
    const groups = taskList.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      acc[task.date].push(task);
      return acc;
    }, {});
    const sorted = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
    return { groups, sorted };
  };

  const pendingData = groupTasks(pendingTasks);
  const completedData = groupTasks(completedTasks);

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  const selectDateFilter = (day) => {
    const yStr = year;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    setDateFilter(prev => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: dateStr, end: null };
      }
      
      if (prev.start && !prev.end) {
        if (dateStr < prev.start) {
          return { start: dateStr, end: prev.start };
        } else {
          setIsCalendarOpen(false); 
          return { start: prev.start, end: dateStr };
        }
      }
      return prev;
    });
  };

  if (isLoading) return <div className="min-h-screen bg-site flex items-center justify-center transition-colors duration-300"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-site font-sans flex overflow-hidden transition-colors duration-300">
      <TopNav />
      <Sidebar />
      <BottomNav />
      <main className="flex-1 ml-0 md:ml-[260px] pt-[72px] pb-[72px] md:pb-0 flex flex-col h-screen overflow-hidden bg-site transition-colors duration-300">
        <div className="flex-1 min-h-0 flex overflow-hidden bg-card shadow-sm md:border-t md:border-l border-border mt-0 md:mt-2 ml-0 md:ml-2 md:rounded-tl-3xl relative">
          
          <div className="w-full flex-1 min-h-0 flex flex-col overflow-y-auto md:overflow-hidden">
             
             {/* Header Section */}
             <div className="px-4 md:px-8 py-3 md:py-4 border-b border-border bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 md:mb-4">
                   <div>
                      <h1 className="text-xl font-black text-main tracking-tight flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-primary" />
                        Master Tasks
                      </h1>
                      <p className="text-muted text-[0.7rem] font-medium mt-1 uppercase tracking-wider opacity-60">Manage and track your tasks.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-input rounded-xl border border-border shadow-sm">
                        <div className="text-center">
                          <span className="block text-[0.55rem] font-bold text-muted uppercase tracking-widest">Active</span>
                          <span className="text-base font-black text-primary leading-none">{stats.active}</span>
                        </div>
                        <div className="w-px h-5 bg-border mx-1"></div>
                        <div className="text-center">
                          <span className="block text-[0.55rem] font-bold text-muted uppercase tracking-widest">Done</span>
                          <span className="text-base font-black text-emerald-500 leading-none">{stats.completed}</span>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Creation Area - Elevated */}
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 bg-card p-1.5 rounded-2xl border-2 border-border shadow-sm focus-within:border-primary/30 transition-all">
                   <div className="flex-1 flex items-center gap-3 pl-3">
                      <Plus className="w-4 h-4 text-muted/30" />
                      <input 
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Create a new task..."
                        className="w-full bg-transparent py-1.5 focus:outline-none font-bold text-sm text-main placeholder:text-muted/30"
                      />
                   </div>
                   <div className="flex items-center gap-2 pr-1">
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" />
                        <select 
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          className="bg-input border border-border rounded-xl py-1.5 pl-8 pr-5 text-[0.65rem] font-bold text-muted appearance-none outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer hover:bg-muted/5 transition-colors"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      
                      {/* Goal Link Selection */}
                      {goals.length > 0 && (
                        <>
                          <div className="relative">
                            <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/40" />
                            <select 
                              value={newTaskGoal}
                              onChange={(e) => setNewTaskGoal(e.target.value)}
                              className="bg-input border border-border rounded-xl py-1.5 pl-9 pr-5 text-[0.65rem] font-bold text-primary appearance-none outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer hover:bg-muted/5 transition-colors max-w-[120px] truncate"
                            >
                              <option value="">No Goal</option>
                              {goals.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                            </select>
                          </div>
                          {newTaskGoal && (
                            <div className="relative w-16">
                              <Plus className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500" />
                              <input 
                                type="number"
                                value={newTaskProgressValue}
                                onChange={(e) => setNewTaskProgressValue(e.target.value)}
                                placeholder="0"
                                className="w-full bg-input border border-border rounded-xl py-1.5 pl-6 pr-2 text-[0.65rem] font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <button 
                        type="submit"
                        disabled={!newTaskText.trim()}
                        className="bg-primary text-white px-5 py-1.5 rounded-xl font-black text-[0.7rem] hover:bg-primary-hover disabled:opacity-40 transition-all shadow-md shadow-primary/20 active:scale-95 uppercase tracking-wider"
                      >
                        Create Task
                      </button>
                   </div>
                </form>
             </div>

             {/* View Controls & Filters */}
             <div className="px-4 md:px-8 py-2 md:py-3 bg-site/50 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
               <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full bg-card border border-border rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-main focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all"
                    />
                  </div>

                  {/* Calendar Range Picker */}
                  <div className="relative" ref={calendarRef}>
                    <button 
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="bg-card border border-border rounded-xl py-2 px-4 text-sm font-bold text-muted flex items-center gap-2 hover:bg-card hover:border-primary/30 transition-all shadow-sm"
                    >
                      <CalendarIcon className="w-4 h-4 text-muted" />
                      {(!dateFilter.start && !dateFilter.end) 
                        ? 'All Time' 
                        : (dateFilter.start && !dateFilter.end)
                          ? `${parseDateNatively(dateFilter.start)}`
                          : `${parseDateNatively(dateFilter.start)} - ${parseDateNatively(dateFilter.end)}`
                      }
                      {(dateFilter.start || dateFilter.end) && (
                        <X 
                          className="w-3.5 h-3.5 text-muted hover:text-red-500 ml-1" 
                          onClick={(e) => { e.stopPropagation(); setDateFilter({ start: null, end: null }); }} 
                        />
                      )}
                    </button>

                    {isCalendarOpen && (
                      <div className="absolute top-11 left-0 w-[280px] bg-card border border-border rounded-2xl shadow-xl p-4 z-50">
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={handlePrevMonth} className="p-1 hover:bg-input rounded text-muted"><ChevronLeft className="w-5 h-5"/></button>
                          <span className="font-bold text-sm text-main">
                            {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <button onClick={handleNextMonth} className="p-1 hover:bg-input rounded text-muted"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                            <div key={d} className="text-center text-[0.65rem] font-bold text-muted/40">{d}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const hasTasks = uniqueDates.includes(dStr);
                            const isSelected = dateFilter.start === dStr || dateFilter.end === dStr;
                            const isInRange = dateFilter.start && dateFilter.end && dStr > dateFilter.start && dStr < dateFilter.end;
                            const today = new Date();
                            const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                            const isToday = dStr === todayStr;

                            return (
                              <button
                                key={day}
                                onClick={() => selectDateFilter(day)}
                                className={`aspect-square rounded flex items-center justify-center text-xs transition-all ${
                                  isSelected ? 'bg-primary text-white font-bold' :
                                  isInRange ? 'bg-primary/10 text-primary font-bold' :
                                  hasTasks ? 'bg-primary/5 text-primary font-bold hover:bg-primary/15' :
                                  'hover:bg-input text-muted/40'
                                } ${isToday && !isSelected ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-card' : ''}`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-sm font-bold text-muted appearance-none outline-none focus:ring-2 focus:ring-primary/10 hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <option value="all">Every Category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
               </div>
             </div>
             
             {/* Mobile View Switcher */}
             <div className="md:hidden flex p-1 bg-input/50 mx-4 mt-3 rounded-xl border border-border shadow-inner">
                <button 
                  onClick={() => setMobileView('pending')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black transition-all ${
                    mobileView === 'pending' ? 'bg-card text-primary shadow-md border border-border' : 'text-muted/60'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${mobileView === 'pending' ? 'bg-primary' : 'bg-muted/20'}`}></div>
                  Pending
                  <span className="text-[0.6rem] opacity-50 font-bold">({stats.active})</span>
                </button>
                <button 
                  onClick={() => setMobileView('completed')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black transition-all ${
                    mobileView === 'completed' ? 'bg-card text-emerald-500 shadow-md border border-border' : 'text-muted/60'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${mobileView === 'completed' ? 'bg-emerald-500' : 'bg-muted/20'}`}></div>
                  Completed
                  <span className="text-[0.6rem] opacity-50 font-bold">({stats.completed})</span>
                </button>
             </div>

             {/* Main Board - Split Kanban */}
             <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6 p-4 md:p-8 overflow-visible md:overflow-y-auto md:overflow-x-auto bg-site/10 custom-scrollbar pb-32 md:pb-8 overscroll-contain transition-colors duration-300" style={{ WebkitOverflowScrolling: 'touch' }}>
                
                {/* PENDING COLUMN */}
                <div className={`${mobileView === 'pending' ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col min-w-full md:min-w-[400px]`}>
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-main flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        Pending
                        <span className="text-muted font-bold text-sm ml-1">({stats.active})</span>
                      </h3>
                   </div>
                   
                   <div className="flex-1 pr-3 space-y-6">
                      {pendingData.sorted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 opacity-40">
                           <ListTodo className="w-12 h-12 text-muted mb-4" />
                           <p className="font-bold text-muted">No pending tasks found.</p>
                        </div>
                      ) : (
                        pendingData.sorted.map(dateStr => (
                          <div key={dateStr} className="space-y-3">
                            <h4 className="text-[0.65rem] font-black text-muted uppercase tracking-widest pl-2 flex items-center gap-2">
                               <div className="w-1 h-3 bg-primary/20 rounded-full"></div>
                               {parseLongDate(dateStr)}
                            </h4>
                            <div className="space-y-2.5">
                              {pendingData.groups[dateStr].map(task => (
                                <div 
                                  key={task._id} 
                                  onClick={() => toggleTask(task)}
                                  className="group flex flex-col p-3 rounded-xl border-2 bg-input/50 border-transparent hover:bg-card hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="transition-all duration-300 transform text-muted/30 group-hover:text-primary">
                                      <Circle className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                      <span className="text-[1.05rem] font-semibold text-main leading-tight truncate">
                                        {task.text}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider flex-shrink-0 ${CATEGORY_COLORS[task.category || 'General'] || 'bg-input text-muted'}`}>
                                        {task.category || 'General'}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-muted/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* COMPLETED COLUMN */}
                <div className={`${mobileView === 'completed' ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col min-w-full md:min-w-[400px]`}>
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-main flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        Completed
                        <span className="text-muted font-bold text-sm ml-1">({stats.completed})</span>
                      </h3>
                   </div>

                   <div className="flex-1 pr-3 space-y-6">
                      {completedData.sorted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 opacity-40">
                           <CheckCircle2 className="w-12 h-12 text-muted mb-4" />
                           <p className="font-bold text-muted text-sm">No tasks completed yet.</p>
                        </div>
                      ) : (
                        completedData.sorted.map(dateStr => (
                          <div key={dateStr} className="space-y-3">
                            <h4 className="text-[0.65rem] font-black text-muted uppercase tracking-widest pl-2">
                               {parseLongDate(dateStr)}
                            </h4>
                            <div className="space-y-2.5">
                              {completedData.groups[dateStr].map(task => (
                                <div
                                  key={task._id}
                                  onClick={() => toggleTask(task)}
                                  className="group flex flex-col p-3 rounded-xl border-2 bg-card/40 border-border/50 hover:bg-card hover:border-emerald-100 transition-all duration-300 cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="text-emerald-500">
                                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                      <span className="text-[1.05rem] font-semibold text-muted line-through decoration-muted/50 leading-tight truncate">
                                        {task.text}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider flex-shrink-0 opacity-50 ${CATEGORY_COLORS[task.category || 'General'] || 'bg-input text-muted'}`}>
                                        {task.category || 'General'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Tasks;
