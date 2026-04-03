import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';
import { Plus, Trash2, Edit2, Check, X, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const Habits = () => {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [activeHabits, setActiveHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthLogs, setMonthLogs] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

  const fetchMonthLogs = async (monthStr) => {
    try {
      const logRes = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/month/${monthStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthLogs(logRes.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!token) return navigate('/login');
    const fetchInitial = async () => {
      try {
        const habitRes = await axios.get(`${import.meta.env.VITE_API_URL}/habits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveHabits(habitRes.data || []);
        await fetchMonthLogs(currentMonthStr);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchInitial();
  }, [token, navigate]);

  useEffect(() => {
    if (!isLoading) fetchMonthLogs(currentMonthStr);
  }, [currentMonthStr]);

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/habits`,
        { name: newHabitName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveHabits([...activeHabits, res.data]);
      setNewHabitName('');
    } catch (e) { console.error(e); }
  };

  const startEdit = (habit) => {
    setEditingId(habit._id);
    setEditName(habit.name);
  };

  const saveEdit = async () => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/habits/${editingId}`,
        { name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveHabits(activeHabits.map(h => h._id === editingId ? res.data : h));
      setEditingId(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/habits/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveHabits(activeHabits.filter(h => h._id !== id));
      fetchMonthLogs(currentMonthStr);
    } catch (e) { console.error(e); }
  };

  const getLogForDay = (day) => {
    const target = `${currentMonthStr}-${String(day).padStart(2, '0')}`;
    return monthLogs.find(log => log.date === target);
  };

  if (isLoading) return <div className="min-h-screen bg-site flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-site font-sans flex">
      <TopNav />
      <Sidebar />
      <BottomNav />
      <main className="flex-1 ml-0 md:ml-[260px] pt-20 md:pt-24 pb-32 md:pb-8 pb-safe p-4 md:p-8 overflow-y-auto bg-site transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-main tracking-tight">Habit Tracker</h1>
              <p className="text-muted font-medium mt-1 text-sm md:text-base">Configure daily habits and instantly map your sequential history cleanly effortlessly.</p>
            </div>
            <button onClick={() => navigate('/')} className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-card border border-border shadow-sm rounded-lg hover:bg-input text-muted font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">

            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 h-fit">
              <h2 className="text-xl font-bold text-main mb-6">Define Habits</h2>

              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-8 bg-input p-1.5 rounded-2xl border border-border">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="e.g. Meditate for 20 minutes..."
                  className="flex-1 bg-transparent px-4 py-3 text-main outline-none focus:ring-0 font-bold text-[1.05rem] placeholder:font-semibold placeholder:text-muted/30"
                />
                <button type="submit" disabled={!newHabitName.trim()} className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-[0.95rem] w-full sm:w-auto">
                  <Plus className="w-5 h-5" strokeWidth={2.5} /> Add
                </button>
              </form>

              <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[440px] pr-2">
                {activeHabits.length === 0 ? (
                  <div className="text-center py-8 text-muted font-bold uppercase tracking-wider text-sm border-2 border-dashed border-border rounded-xl">Define custom habits actively above</div>
                ) : (
                  activeHabits.map((habit) => (
                    <div key={habit._id} className="flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:border-primary/30 transition-colors group/row">

                      {editingId === habit._id ? (
                        <div className="flex items-center gap-4 w-full">
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 border-b-2 border-primary bg-input rounded-t px-3 py-1.5 focus:outline-none focus:border-primary font-bold text-main text-[1rem]" autoFocus />
                          <div className="flex items-center gap-1">
                            <button onClick={saveEdit} disabled={!editName.trim()} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"><Check className="w-5 h-5" strokeWidth={3} /> </button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-input text-muted rounded-lg hover:bg-muted/10 transition-colors"><X className="w-5 h-5" strokeWidth={3} /> </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-main tracking-wide text-[1.05rem] px-2">{habit.name}</span>
                          <div className="flex items-center gap-2 transition-opacity">
                            <button onClick={() => startEdit(habit)} className="p-2 text-muted/30 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" strokeWidth={2.5} /></button>
                            <button onClick={() => handleDelete(habit._id)} className="p-2 text-muted/30 hover:text-[#d93839] hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" strokeWidth={2.5} /></button>
                          </div>
                        </>
                      )}

                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 h-fit">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-[1.3rem] font-bold text-main">Tracking Heatmap</h2>
                <div className="flex items-center gap-3 sm:gap-5 bg-input px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border shadow-sm w-full sm:w-auto justify-between sm:justify-center">
                  <button onClick={handlePrevMonth} className="text-muted/40 hover:text-primary hover:scale-110 transition-all p-1"><ChevronLeft className="w-5 h-5" strokeWidth={3} /></button>
                  <span className="text-[0.8rem] sm:text-[0.95rem] font-bold text-main uppercase tracking-widest min-w-[100px] sm:min-w-[150px] text-center">
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="text-muted/40 hover:text-primary hover:scale-110 transition-all p-1"><ChevronRight className="w-5 h-5" strokeWidth={3} /></button>
                </div>
              </div>


              {/* UI Legend Panel */}
              <div className="flex items-center gap-6 mb-6 px-4 py-3 bg-input border border-border rounded-xl relative">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-primary/5 border border-primary/20"></div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Partial Effort</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/30"></div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Flawless 100%</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div key={i} className="text-center text-[0.8rem] font-bold text-muted uppercase tracking-widest mb-2 bg-input/50 py-1 rounded">{d}</div>
                ))}
                {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-xl bg-transparent"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const log = getLogForDay(day);
                  const comps = log ? log.completedCount : 0;
                  const total = log ? log.totalCount : activeHabits.length;
                  const completedNames = log ? log.completedHabits : [];

                  let cellColor = 'bg-input border-border hover:border-muted/30';
                  let textColor = 'text-muted/30';

                  if (comps > 0 && comps < total) {
                    cellColor = 'bg-primary/10 border-primary/20 hover:border-primary/40 cursor-pointer shadow-sm';
                    textColor = 'text-primary';
                  } else if (comps > 0 && comps === total) {
                    cellColor = 'bg-emerald-500 border-emerald-600 hover:bg-emerald-400 cursor-pointer shadow-md text-white shadow-emerald-500/20';
                    textColor = 'text-white';
                  }

                  return (
                    <div
                      key={day}
                      onClick={() => {
                        if (comps > 0) alert(`Habits completed on ${currentMonthStr}-${String(day).padStart(2, '0')}:\n\n- ${completedNames.join('\n- ')}`);
                      }}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center border relative transition-all duration-300 transform hover:scale-[1.05] ${cellColor}`}
                      title={comps > 0 ? `Click to view ${comps} habits completed` : 'No habits completed'}
                    >
                      <span className={`font-black text-[1.2rem] ${textColor}`}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
export default Habits;
