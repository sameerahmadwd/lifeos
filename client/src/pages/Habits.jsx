import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
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

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex">
      <TopNav />
      <Sidebar />
      <main className="flex-1 ml-[260px] pt-24 p-8 overflow-y-auto w-full">
        <div className="max-w-[1400px] mx-auto space-y-8">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Habit Tracker</h1>
              <p className="text-slate-500 font-medium mt-1">Configure daily habits and instantly map your sequential history cleanly effortlessly.</p>
            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 h-fit">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Define Habits</h2>

              <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="e.g. Meditate for 20 minutes..."
                  className="flex-1 bg-transparent px-4 py-3 text-slate-700 outline-none focus:ring-0 font-bold text-[1.05rem] placeholder:font-semibold placeholder:text-slate-400"
                />
                <button type="submit" disabled={!newHabitName.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm text-[0.95rem]">
                  <Plus className="w-5 h-5" strokeWidth={2.5} /> Add
                </button>
              </form>

              <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[440px] pr-2">
                {activeHabits.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-bold uppercase tracking-wider text-sm border-2 border-dashed border-slate-200 rounded-xl">Define custom habits actively above</div>
                ) : (
                  activeHabits.map((habit) => (
                    <div key={habit._id} className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:border-indigo-300 transition-colors group/row">

                      {editingId === habit._id ? (
                        <div className="flex items-center gap-4 w-full">
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 border-b-2 border-indigo-400 bg-indigo-50/50 rounded-t px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-bold text-slate-700 text-[1rem]" autoFocus />
                          <div className="flex items-center gap-1">
                            <button onClick={saveEdit} disabled={!editName.trim()} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"><Check className="w-5 h-5" strokeWidth={3} /> </button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"><X className="w-5 h-5" strokeWidth={3} /> </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-slate-700 tracking-wide text-[1.05rem] px-2">{habit.name}</span>
                          <div className="flex items-center gap-2 transition-opacity">
                            <button onClick={() => startEdit(habit)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" strokeWidth={2.5} /></button>
                            <button onClick={() => handleDelete(habit._id)} className="p-2 text-slate-400 hover:text-[#d93839] hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" strokeWidth={2.5} /></button>
                          </div>
                        </>
                      )}

                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 h-fit">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[1.3rem] font-bold text-slate-800">Tracking Heatmap</h2>
                <div className="flex items-center gap-5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <button onClick={handlePrevMonth} className="text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all"><ChevronLeft className="w-5 h-5" strokeWidth={3} /></button>
                  <span className="text-[0.95rem] font-bold text-slate-700 uppercase tracking-widest min-w-[150px] text-center">
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </span>
                  <button onClick={handleNextMonth} className="text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all"><ChevronRight className="w-5 h-5" strokeWidth={3} /></button>
                </div>
              </div>

              {/* UI Legend Panel Natively Displayed Explicitly Tracking Colors Identically Correctly Effectively Properly Efficiently */}
              <div className="flex items-center gap-6 mb-6 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl relative">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-indigo-50 border border-indigo-200"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partial Effort</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/30"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flawless 100%</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div key={i} className="text-center text-[0.8rem] font-bold text-slate-400 uppercase tracking-widest mb-2 bg-slate-50/50 py-1 rounded">{d}</div>
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

                  let cellColor = 'bg-slate-50 border-slate-100 hover:border-slate-300';
                  let textColor = 'text-slate-300';

                  if (comps > 0 && comps < total) {
                    cellColor = 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 cursor-pointer shadow-sm';
                    textColor = 'text-indigo-600';
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
