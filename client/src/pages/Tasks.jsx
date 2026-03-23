import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
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
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  
  // Advanced Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: null, end: null });
  const [categoryFilter, setCategoryFilter] = useState('all');

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
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data || []);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchTasks();
  }, [token, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    console.log('FRONTEND: Adding task with category:', newTaskCategory);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, 
        { text: newTaskText, category: newTaskCategory }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('FRONTEND: Server responded with task:', res.data);
      setTasks([res.data, ...tasks]);
      setNewTaskText('');
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

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex overflow-hidden">
      <TopNav />
      <Sidebar />
      <main className="flex-1 ml-[260px] pt-[72px] flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex overflow-hidden bg-white shadow-sm border-t border-l border-slate-200 mt-2 ml-2 rounded-tl-3xl relative">
          
          <div className="w-full flex flex-col h-full overflow-hidden">
             
             {/* Header Section */}
             <div className="px-8 py-6 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <ListTodo className="w-6 h-6 text-indigo-500" />
                        Master Tasks
                      </h1>
                      <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your tasks.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                        <div className="text-center">
                          <span className="block text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                          <span className="text-lg font-black text-indigo-500 leading-none">{stats.active}</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <div className="text-center">
                          <span className="block text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Done</span>
                          <span className="text-lg font-black text-emerald-500 leading-none">{stats.completed}</span>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Creation Area - Elevated */}
                <form onSubmit={handleAdd} className="flex gap-3 bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm focus-within:border-indigo-200 transition-all">
                   <div className="flex-1 flex items-center gap-3 pl-4">
                      <Plus className="w-5 h-5 text-slate-300" />
                      <input 
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Create a new task..."
                        className="w-full bg-transparent py-2.5 focus:outline-none font-bold text-slate-700 placeholder:text-slate-300"
                      />
                   </div>
                   <div className="flex items-center gap-2 pr-1">
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <select 
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-6 text-xs font-bold text-slate-600 appearance-none outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <button 
                        type="submit"
                        disabled={!newTaskText.trim()}
                        className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-indigo-600 disabled:opacity-40 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                      >
                        Create Task
                      </button>
                   </div>
                </form>
             </div>

             {/* View Controls & Filters */}
             <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-4">
               <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all"
                    />
                  </div>

                  {/* Calendar Range Picker */}
                  <div className="relative" ref={calendarRef}>
                    <button 
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-white hover:border-indigo-300 transition-all shadow-sm"
                    >
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {(!dateFilter.start && !dateFilter.end) 
                        ? 'All Time' 
                        : (dateFilter.start && !dateFilter.end)
                          ? `${parseDateNatively(dateFilter.start)}`
                          : `${parseDateNatively(dateFilter.start)} - ${parseDateNatively(dateFilter.end)}`
                      }
                      {(dateFilter.start || dateFilter.end) && (
                        <X 
                          className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 ml-1" 
                          onClick={(e) => { e.stopPropagation(); setDateFilter({ start: null, end: null }); }} 
                        />
                      )}
                    </button>

                    {isCalendarOpen && (
                      <div className="absolute top-11 left-0 w-[280px] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronLeft className="w-5 h-5"/></button>
                          <span className="font-bold text-sm text-slate-700">
                            {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ChevronRight className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                            <div key={d} className="text-center text-[0.65rem] font-bold text-slate-400">{d}</div>
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
                                  isSelected ? 'bg-indigo-500 text-white font-bold' :
                                  isInRange ? 'bg-indigo-100 text-indigo-700 font-bold' :
                                  hasTasks ? 'bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100' :
                                  'hover:bg-slate-50 text-slate-400'
                                } ${isToday && !isSelected ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
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
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm font-bold text-slate-600 appearance-none outline-none focus:ring-2 focus:ring-indigo-500/10 hover:border-indigo-300 transition-all cursor-pointer"
                    >
                      <option value="all">Every Category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
               </div>
             </div>

             {/* Main Board - Split Kanban */}
             <div className="flex-1 flex gap-6 p-8 overflow-hidden bg-slate-50/30">
                
                {/* PENDING COLUMN */}
                <div className="flex-1 flex flex-col min-w-[400px]">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-slate-700 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        Pending
                        <span className="text-slate-400 font-bold text-sm ml-1">({stats.active})</span>
                      </h3>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-6">
                      {pendingData.sorted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 opacity-40">
                           <ListTodo className="w-12 h-12 text-slate-300 mb-4" />
                           <p className="font-bold text-slate-400">No pending tasks found.</p>
                        </div>
                      ) : (
                        pendingData.sorted.map(dateStr => (
                          <div key={dateStr} className="space-y-3">
                            <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                               <div className="w-1 h-3 bg-indigo-200 rounded-full"></div>
                               {parseLongDate(dateStr)}
                            </h4>
                            <div className="space-y-2.5">
                              {pendingData.groups[dateStr].map(task => (
                                <div 
                                  key={task._id} 
                                  onClick={() => toggleTask(task)}
                                  className="group flex flex-col p-3 rounded-xl border-2 bg-white border-white shadow-sm hover:border-indigo-100 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-[0.98]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="transition-all duration-300 transform text-slate-200 group-hover:text-indigo-500">
                                      <Circle className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                      <span className="text-[1.05rem] font-semibold text-slate-700 leading-tight truncate">
                                        {task.text}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider flex-shrink-0 ${CATEGORY_COLORS[task.category || 'General'] || 'bg-slate-100 text-slate-600'}`}>
                                        {task.category || 'General'}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
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
                <div className="flex-1 flex flex-col min-w-[400px]">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-slate-700 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        Completed
                        <span className="text-slate-400 font-bold text-sm ml-1">({stats.completed})</span>
                      </h3>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-6">
                      {completedData.sorted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 opacity-40">
                           <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
                           <p className="font-bold text-slate-400 text-sm">No tasks completed yet.</p>
                        </div>
                      ) : (
                        completedData.sorted.map(dateStr => (
                          <div key={dateStr} className="space-y-3">
                            <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest pl-2">
                               {parseLongDate(dateStr)}
                            </h4>
                            <div className="space-y-2.5">
                              {completedData.groups[dateStr].map(task => (
                                <div
                                  key={task._id}
                                  onClick={() => toggleTask(task)}
                                  className="group flex flex-col p-3 rounded-xl border-2 bg-white/40 border-slate-100/50 hover:bg-white hover:border-emerald-100 transition-all duration-300 cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="text-emerald-500">
                                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                      <span className="text-[1.05rem] font-semibold text-slate-400 line-through decoration-slate-300 leading-tight truncate">
                                        {task.text}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider flex-shrink-0 opacity-50 ${CATEGORY_COLORS[task.category || 'General'] || 'bg-slate-100 text-slate-600'}`}>
                                        {task.category || 'General'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
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
