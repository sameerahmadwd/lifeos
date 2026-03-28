import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, ArrowLeft, Plus, Target, 
  Calendar, CheckCircle2, Circle, 
  TrendingUp, Rocket, Medal, Star,
  LineChart as LineChartIcon, Clock, ChevronRight, Loader2,
  Trash2, Edit, Save, X as CloseIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newLog, setNewLog] = useState({ value: '', note: '' });
  const [editData, setEditData] = useState(null);

  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  useEffect(() => {
    fetchGoalData();
  }, [id, token]);

  const fetchGoalData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoal(res.data.goal);
      setLogs(res.data.logs);
      setEditData({
        title: res.data.goal.title,
        targetValue: res.data.goal.targetValue,
        unit: res.data.goal.unit,
        category: res.data.goal.category,
        deadline: res.data.goal.deadline ? res.data.goal.deadline.split('T')[0] : '',
        numberOfLevels: res.data.goal.levelConfig?.numberOfLevels || 5,
        levelLabels: [...(res.data.goal.levelConfig?.levelLabels || [])]
      });
    } catch (err) {
      console.error('Failed to fetch goal:', err);
      if (err.response?.status === 404) navigate('/goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/goals/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      fetchGoalData();
    } catch (err) {
      console.error('Editing goal failed:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this goal and all its progress history? This cannot be undone.')) {
       try {
         await axios.delete(`${import.meta.env.VITE_API_URL}/goals/${id}`, {
           headers: { Authorization: `Bearer ${token}` }
         });
         navigate('/goals');
       } catch (err) {
         console.error('Deletion failed:', err);
       }
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/goals/${id}/progress`, newLog, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowLogModal(false);
      setNewLog({ value: '', note: '' });
      fetchGoalData();
    } catch (err) {
      console.error('Logging progress failed:', err);
    }
  };

  const progressPercentage = useMemo(() => {
    if (!goal || !goal.targetValue) return 0;
    return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
  }, [goal]);

  const currentLevel = useMemo(() => {
    if (!goal) return { level: 1, label: 'Novice' };
    const numLevels = goal.levelConfig?.numberOfLevels || 5;
    const labels = goal.levelConfig?.levelLabels || ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master'];
    const segment = 100 / numLevels;
    
    // Calculate which segment the progress falls into
    const levelIdx = Math.min(Math.floor(progressPercentage / segment), numLevels - 1);
    
    return {
      level: levelIdx + 1,
      label: labels[levelIdx] || `Level ${levelIdx + 1}`
    };
  }, [goal, progressPercentage]);

  const chartData = useMemo(() => {
    if (!logs.length || !goal) return [];
    
    // Sort logs by date created
    const sortedLogs = [...logs].reverse();
    let cumulative = goal.startValue;
    
    return sortedLogs.map(log => {
      cumulative += log.value;
      return {
        date: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: cumulative
      };
    });
  }, [logs, goal]);

  if (isLoading || !goal) {
    return (
      <div className="min-h-screen bg-site flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-site font-sans flex text-main">
      <TopNav />
      <Sidebar />
      <BottomNav />

      <main className="flex-1 ml-0 md:ml-[260px] pt-16 md:pt-24 p-4 md:p-8 pb-24 md:pb-8 w-full overflow-y-auto">
        <div className="max-w-[1000px] mx-auto space-y-8">
          
          {/* Back Navigation */}
          <Link to="/goals" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors font-bold text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to all goals
          </Link>

          {/* Top Section: Goal Overview */}
          <div className="bg-card rounded-[2.5rem] p-8 md:p-10 border border-border shadow-sm space-y-8 relative overflow-hidden">
             {/* Decorative Background Glow */}
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
             
             <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
               <div className="space-y-4 flex-1">
                 <div className="flex items-center justify-between gap-4 w-full">
                    <div className="inline-flex px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[0.7rem] font-black uppercase tracking-widest">
                       {goal.category}
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => setShowEditModal(true)}
                         className="p-2.5 bg-card border border-border rounded-xl text-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm group"
                         title="Edit Goal"
                       >
                         <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                       </button>
                       <button 
                         onClick={handleDelete}
                         className="p-2.5 bg-card border border-border rounded-xl text-muted hover:text-red-500 hover:border-red-500/30 transition-all shadow-sm group"
                         title="Delete Goal"
                       >
                         <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                       </button>
                    </div>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{goal.title}</h1>
                 <div className="flex flex-wrap items-center gap-6 text-muted">
                    <div className="flex items-center gap-2">
                       <Target className="w-5 h-5" />
                       <span className="font-bold text-sm tracking-tight">{goal.targetValue.toLocaleString()} {goal.unit} Target</span>
                    </div>
                    {goal.deadline && (
                      <div className="flex items-center gap-2">
                         <Calendar className="w-5 h-5" />
                         <span className="font-bold text-sm tracking-tight">Ends {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                 </div>
               </div>

               <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 text-center min-w-[160px] backdrop-blur-sm">
                  <Medal className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <div className="text-[0.65rem] font-black text-muted uppercase tracking-widest leading-none mb-1">Current Status</div>
                  <div className="text-2xl font-black text-primary tracking-tighter">Level {currentLevel.level}</div>
                  <div className="text-[0.7rem] font-bold text-amber-600/70 uppercase tracking-wider">{currentLevel.label}</div>
               </div>
             </div>

             {/* Progress Bar & Value Display */}
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[1.1rem] font-black tracking-tighter tabular-nums text-main">
                       {goal.currentValue.toLocaleString()} <span className="text-muted text-sm font-bold uppercase transition-opacity">/ {goal.targetValue.toLocaleString()} {goal.unit}</span>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-primary tracking-tighter">{progressPercentage}%</div>
                </div>
                <div className="w-full h-5 bg-input rounded-full overflow-hidden p-1 border border-border shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-indigo-400 to-indigo-500 rounded-full shadow-lg transition-all duration-1000 ease-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white/20 to-transparent" />
                  </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Left Column: Stats & Charts */}
             <div className="lg:col-span-8 space-y-8">
                
                {/* Visual Chart Area */}
                <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Growth Progress
                      </h3>
                      <div className="text-[0.65rem] font-black text-muted uppercase tracking-widest bg-input px-3 py-1 rounded-full">Cumulative History</div>
                   </div>
                   
                   <div className="h-[300px] w-full mt-4">
                     {chartData.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                           <defs>
                             <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                           <XAxis 
                             dataKey="date" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                             dy={10}
                           />
                           <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                             dx={-10}
                           />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: 'rgba(255,255,255,0.95)', 
                               borderRadius: '16px', 
                               border: 'none', 
                               boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                               padding: '12px'
                             }}
                             labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                             itemStyle={{ fontWeight: 700, color: '#6366f1' }}
                           />
                           <Area 
                             type="monotone" 
                             dataKey="value" 
                             stroke="#6366f1" 
                             strokeWidth={4} 
                             fillOpacity={1} 
                             fill="url(#colorValue)" 
                             animationDuration={2000}
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-muted/30">
                          <LineChartIcon className="w-12 h-12 mb-2" />
                          <p className="font-bold text-sm underline underline-offset-4">Log progress to visualize growth</p>
                       </div>
                     )}
                   </div>
                </div>

                {/* Progress History List */}
                <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                        <Clock className="w-6 h-6 text-primary" />
                        Activity History
                      </h3>
                      <button 
                        onClick={() => setShowLogModal(true)}
                        className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all shadow-sm"
                      >
                         <Plus className="w-6 h-6" />
                      </button>
                   </div>

                   <div className="space-y-1">
                      {logs.length > 0 ? logs.map((log, idx) => (
                        <div key={log._id} className="group flex items-center gap-6 p-5 rounded-2xl hover:bg-input/50 transition-all relative border border-transparent hover:border-border/30">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors flex-shrink-0" />
                           <div className="flex-1">
                              <div className="flex items-baseline justify-between mb-0.5">
                                 <div className="text-lg font-black tracking-tight">+{log.value.toLocaleString()} <span className="text-[0.6rem] font-bold text-muted uppercase">{goal.unit}</span></div>
                                 <div className="text-[0.65rem] font-bold text-muted uppercase tracking-widest">{new Date(log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                              {log.note && <p className="text-xs font-medium text-muted/80">{log.note}</p>}
                           </div>
                        </div>
                      )) : (
                        <p className="text-center py-10 text-muted font-bold text-sm">No progress logs found.</p>
                      )}
                   </div>
                </div>
             </div>

             {/* Right Column: Milestones & Actions */}
             <div className="lg:col-span-4 space-y-8">
                
                {/* Milestone System */}
                <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm overflow-hidden relative">
                   <div className="flex items-center gap-3 mb-8">
                      <Medal className="w-6 h-6 text-indigo-500" />
                      <h3 className="text-xl font-black tracking-tight">Milestones</h3>
                   </div>
                   
                   <div className="space-y-5">
                      {goal.milestones.map((milestone, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                            milestone.isCompleted 
                              ? 'bg-emerald-500/5 border-emerald-500/10' 
                              : 'bg-input/30 border-transparent hover:border-border/50'
                          }`}
                        >
                           <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                milestone.isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-input text-muted border border-border mt-0.5'
                              }`}>
                                {milestone.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </div>
                              <div className="space-y-0.5">
                                <div className={`text-[0.9rem] font-black tracking-tight ${milestone.isCompleted ? 'text-main' : 'text-muted'}`}>{milestone.label}</div>
                                <div className={`text-[0.65rem] font-bold uppercase tracking-widest ${milestone.isCompleted ? 'text-emerald-600/70' : 'text-muted/40'}`}>
                                   Threshold: {milestone.value.toLocaleString()} {goal.unit}
                                </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Productivity Action Card */}
                <div className="bg-primary rounded-[2.5rem] p-8 shadow-2xl shadow-primary/30 text-white space-y-6 relative overflow-hidden group">
                   <Rocket className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500" />
                   <div className="space-y-2 relative z-10">
                     <h4 className="text-2xl font-black tracking-tight">Feeling Productive?</h4>
                     <p className="text-white/70 text-sm font-medium leading-relaxed">Regular updates increase goal achievement probability by 42%. Log your wins now!</p>
                   </div>
                   <button 
                     onClick={() => setShowLogModal(true)}
                     className="w-full bg-white text-primary px-4 py-4 rounded-2xl font-black shadow-lg hover:bg-slate-50 active:scale-95 transition-all text-sm relative z-10 uppercase tracking-widest"
                   >
                     Update Progress
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Logging Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-site/80 backdrop-blur-md" onClick={() => setShowLogModal(false)} />
          <div className="bg-card w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-border relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                  <Medal className="w-8 h-8" />
               </div>
               <h2 className="text-2xl font-black tracking-tight">Log Progress</h2>
            </div>
            
            <form onSubmit={handleAddLog} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Amount to Add ({goal.unit})</label>
                <div className="relative">
                   <input 
                    type="number" 
                    required
                    autoFocus
                    placeholder="e.g. 500, 1.5, 10..."
                    value={newLog.value}
                    onChange={(e) => setNewLog({...newLog, value: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-5 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-black text-3xl tracking-tighter tabular-nums text-main transition-all placeholder:text-muted/20"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-muted text-sm uppercase">{goal.unit}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Quick Note (Optional)</label>
                <textarea 
                  placeholder="What did you accomplish?"
                  value={newLog.note}
                  onChange={(e) => setNewLog({...newLog, note: e.target.value})}
                  className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all min-h-[100px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 bg-input text-muted py-4 rounded-xl font-black hover:bg-border transition-all text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-site/80 backdrop-blur-md" onClick={() => setShowEditModal(false)} />
          <div className="bg-card w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-border relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
                    <Edit className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight">Edit Goal</h2>
               </div>
               <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-input rounded-full transition-colors">
                  <CloseIcon className="w-6 h-6 text-muted" />
               </button>
            </div>
            
            <form onSubmit={handleEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Goal Title</label>
                  <input 
                    type="text" 
                    required
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Category</label>
                  <select 
                    value={editData.category}
                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all appearance-none"
                  >
                    {['Finance', 'Health', 'Learning', 'Personal', 'Fitness', 'Career', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Target Value</label>
                  <input 
                    type="number" 
                    required
                    value={editData.targetValue}
                    onChange={(e) => setEditData({...editData, targetValue: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Unit (e.g. kg, INR, steps)</label>
                  <input 
                    type="text" 
                    required
                    value={editData.unit}
                    onChange={(e) => setEditData({...editData, unit: e.target.value})}
                    className="w-full bg-input border border-border rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-main transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.7rem] font-black text-muted uppercase tracking-widest pl-1">Deadline</label>
                  <input 
                    type="date" 
                    value={editData.deadline}
                    onChange={(e) => setEditData({...editData, deadline: e.target.value})}
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
                           onClick={() => {
                              const default5 = ['Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master'];
                              const default10 = Array.from({length: 10}, (_, i) => `Level ${i + 1}`);
                              setEditData({
                                ...editData, 
                                numberOfLevels: count, 
                                levelLabels: count === 10 ? default10 : default5
                              });
                           }}
                           className={`px-3 py-1 rounded-lg text-[0.65rem] font-black transition-all ${editData.numberOfLevels === count ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-main'}`}
                         >
                           {count} Levels
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {editData.levelLabels.map((lbl, i) => (
                      <div key={i} className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.5rem] font-black text-primary/40 uppercase">L{i+1}</span>
                        <input 
                          type="text"
                          value={lbl}
                          onChange={(e) => {
                            const updated = [...editData.levelLabels];
                            updated[i] = e.target.value;
                            setEditData({ ...editData, levelLabels: updated });
                          }}
                          className="w-full bg-input/50 border border-border rounded-xl py-2 pl-8 pr-3 text-[0.75rem] font-bold outline-none focus:border-primary/30 transition-all placeholder:text-muted/20"
                        />
                      </div>
                    ))}
                 </div>
               </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-input text-muted py-5 rounded-2xl font-black hover:bg-border transition-all text-sm uppercase tracking-widest"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Style Overrides for Recharts Font */}
      <style>{`
        .recharts-cartesian-axis-tick-value {
          font-family: 'Inter', sans-serif !important;
          font-weight: 700;
        }
        .recharts-tooltip-label {
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default GoalDetail;
