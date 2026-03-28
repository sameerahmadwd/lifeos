import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Plus, Target, Calendar, 
  ChevronRight, TrendingUp, Flag, Loader2,
  PieChart, BarChart3, Rocket
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';

const CATEGORY_COLORS = {
  Finance: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Health: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  Learning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Career: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  General: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetValue: '',
    unit: '',
    category: 'General',
    deadline: '',
    startValue: 0,
    numberOfLevels: 5,
    levelLabels: ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master']
  });

  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const handleLevelCountChange = (count) => {
    const default5 = ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master'];
    const default10 = Array.from({length: 10}, (_, i) => `Level ${i + 1}`);
    setNewGoal({
      ...newGoal, 
      numberOfLevels: count, 
      levelLabels: count === 10 ? default10 : default5
    });
  };

  const handleLabelChange = (idx, val) => {
    const updated = [...newGoal.levelLabels];
    updated[idx] = val;
    setNewGoal({ ...newGoal, levelLabels: updated });
  };

  useEffect(() => {
    fetchGoals();
  }, [token]);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/goals`, newGoal, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setNewGoal({ title: '', targetValue: '', unit: '', category: 'General', deadline: '', startValue: 0 });
      fetchGoals();
    } catch (err) {
      console.error('Create goal failed:', err);
    }
  };

  const calculateProgress = (curr, target) => {
    if (!target) return 0;
    return Math.min(Math.round((curr / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-site font-sans flex text-main">
      <TopNav />
      <Sidebar />
      <BottomNav />

      <main className="flex-1 ml-0 md:ml-[260px] pt-16 md:pt-24 p-4 md:p-8 pb-24 md:pb-8 w-full overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-black tracking-tight">Goals Tracker</h1>
              </div>
              <p className="text-muted font-medium text-lg">Level up your life by tracking measurable milestones.</p>
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg"
            >
              <Plus className="w-6 h-6" /> New Goal
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-5">
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                   <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[0.65rem] font-black text-muted uppercase tracking-widest mb-1">Active Goals</div>
                  <div className="text-2xl font-black">{goals.length}</div>
                </div>
             </div>
             <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-5">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                   <Flag className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[0.65rem] font-black text-muted uppercase tracking-widest mb-1">Milestones Reached</div>
                  <div className="text-2xl font-black">
                    {goals.reduce((acc, g) => acc + g.milestones.filter(m => m.isCompleted).length, 0)}
                  </div>
                </div>
             </div>
             <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-5">
                <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
                   <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[0.65rem] font-black text-muted uppercase tracking-widest mb-1">Overall Progress</div>
                  <div className="text-2xl font-black">
                    {goals.length > 0 
                      ? Math.round(goals.reduce((acc, g) => acc + calculateProgress(g.currentValue, g.targetValue), 0) / goals.length) 
                      : 0}%
                  </div>
                </div>
             </div>
          </div>

          {/* Goals Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-64 bg-card border border-border rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map(goal => {
                const progress = calculateProgress(goal.currentValue, goal.targetValue);
                return (
                  <div 
                    key={goal._id}
                    onClick={() => navigate(`/goals/${goal._id}`)}
                    className="group bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  >
                    {/* Category Tag */}
                    <div className={`mb-6 inline-flex px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-widest border ${CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.General}`}>
                      {goal.category}
                    </div>

                    <h3 className="text-xl font-black text-main mb-2 leading-tight group-hover:text-primary transition-colors">
                      {goal.title}
                    </h3>

                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className="text-2xl font-black tracking-tighter tabular-nums">
                        {goal.currentValue.toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-muted uppercase">
                        / {goal.targetValue.toLocaleString()} {goal.unit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[0.65rem] font-black text-muted uppercase tracking-widest">
                        <span>Progress</span>
                        <span className="text-primary">{progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-input rounded-full overflow-hidden p-0.5 border border-border/50">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between text-muted">
                       <div className="flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-primary/60" />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            Level {Math.min(Math.floor(progress / (100 / (goal.levelConfig?.numberOfLevels || 5))) + 1, goal.levelConfig?.numberOfLevels || 5)}
                          </span>
                       </div>
                       <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-[3rem] border-2 border-dashed border-border p-20 text-center flex flex-col items-center justify-center space-y-6">
               <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center">
                 <Rocket className="w-12 h-12 text-primary/20" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-2xl font-black tracking-tight">Your Goal Journey starts here</h3>
                 <p className="text-muted max-w-sm mx-auto font-medium">Create your first measurable goal to unlock levels, milestones, and advanced tracking.</p>
               </div>
               <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
               >
                 Create First Goal
               </button>
            </div>
          )}
        </div>
      </main>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-site/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <div className="bg-card w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-border relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-8">Set New Goal</h2>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">What is your goal?</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 50km Run, Save ₹10L..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Target Value</label>
                  <input 
                    type="number" 
                    required
                    placeholder="10000"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Unit</label>
                  <input 
                    type="text" 
                    required
                    placeholder="km, INR, Steps"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Category</label>
                  <select 
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                  >
                    <option value="General">General</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                    <option value="Career">Career</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Deadline (Optional)</label>
                  <input 
                    type="date" 
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                  />
                </div>
              </div>

              {/* Level Definition Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                 <div className="flex items-center justify-between">
                    <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1 text-primary">Level Gamification</label>
                    <div className="flex bg-input rounded-xl p-1 gap-1">
                       {[5, 10].map(count => (
                         <button
                           key={count}
                           type="button"
                           onClick={() => handleLevelCountChange(count)}
                           className={`px-3 py-1 rounded-lg text-[0.65rem] font-black transition-all ${newGoal.numberOfLevels === count ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-main'}`}
                         >
                           {count} Levels
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {newGoal.levelLabels.map((lbl, i) => (
                      <div key={i} className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.5rem] font-black text-primary/40 uppercase">L{i+1}</span>
                        <input 
                          type="text"
                          value={lbl}
                          onChange={(e) => handleLabelChange(i, e.target.value)}
                          className="w-full bg-input/50 border border-border rounded-xl py-2 pl-8 pr-3 text-[0.75rem] font-bold outline-none focus:border-primary/30 transition-all placeholder:text-muted/20"
                        />
                      </div>
                    ))}
                 </div>
               </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xl mt-4"
              >
                Ignite Goal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Goals;
