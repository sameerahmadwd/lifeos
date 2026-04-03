import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';
import { 
  Bell, CheckCircle2, Loader2, Save, 
  Settings, Zap, Target, BookOpen, Activity, LayoutDashboard
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CategoryToggle = ({ label, icon: Icon, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-input text-muted/30'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-bold text-main">{label}</span>
    </div>
    <button 
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary' : 'bg-input border border-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    enabledCategories: {
      tasks: true,
      habits: true,
      goals: true,
      journal: true,
      engagement: true,
      system: true
    },
    preferredTiming: 'morning',
    frequencyMode: 'balanced'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/notifications/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data) setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/notifications/settings`, settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) return (
    <div className="min-h-screen bg-site flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-site flex">
      <TopNav />
      <Sidebar />
      <BottomNav />
      
      <main className="flex-1 ml-0 md:ml-[260px] pt-[72px] pb-[72px] md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-main tracking-tight flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                Notification Settings
              </h1>
              <p className="text-muted text-sm font-medium">Customize how and when you want to be notified.</p>
            </div>
            <button 
              onClick={saveSettings}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-600 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">Settings saved successfully! High-five ✋</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Categories */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-main mb-6 flex items-center gap-2 uppercase tracking-wider text-[0.8rem] text-muted">
                Categories
              </h2>
              <div className="space-y-1">
                <CategoryToggle 
                  label="Tasks" 
                  icon={CheckCircle2} 
                  enabled={settings.enabledCategories.tasks}
                  onChange={(val) => setSettings({ ...settings, enabledCategories: { ...settings.enabledCategories, tasks: val } })}
                />
                <CategoryToggle 
                  label="Habits" 
                  icon={Zap} 
                  enabled={settings.enabledCategories.habits}
                  onChange={(val) => setSettings({ ...settings, enabledCategories: { ...settings.enabledCategories, habits: val } })}
                />
                <CategoryToggle 
                  label="Goals" 
                  icon={Target} 
                  enabled={settings.enabledCategories.goals}
                  onChange={(val) => setSettings({ ...settings, enabledCategories: { ...settings.enabledCategories, goals: val } })}
                />
                <CategoryToggle 
                  label="Journal" 
                  icon={BookOpen} 
                  enabled={settings.enabledCategories.journal}
                  onChange={(val) => setSettings({ ...settings, enabledCategories: { ...settings.enabledCategories, journal: val } })}
                />
                <CategoryToggle 
                  label="Engagement" 
                  icon={Activity} 
                  enabled={settings.enabledCategories.engagement}
                  onChange={(val) => setSettings({ ...settings, enabledCategories: { ...settings.enabledCategories, engagement: val } })}
                />
              </div>
            </div>

            {/* Smart Logic Settings */}
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-main mb-6 flex items-center gap-2 uppercase tracking-wider text-[0.8rem] text-muted">
                  Timing & Frequency
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-muted uppercase tracking-widest mb-3 leading-none">Preferred Summary Timing</label>
                    <select 
                      value={settings.preferredTiming}
                      onChange={(e) => setSettings({ ...settings, preferredTiming: e.target.value })}
                      className="w-full px-4 py-3 bg-input border border-border rounded-xl text-sm font-bold text-main outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="morning">Morning (8-10 AM)</option>
                      <option value="afternoon">Afternoon (1-3 PM)</option>
                      <option value="evening">Evening (7-9 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-muted uppercase tracking-widest mb-3 leading-none">Frequency Mode</label>
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-input rounded-xl border border-border">
                      {['minimal', 'balanced', 'aggressive'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setSettings({ ...settings, frequencyMode: mode })}
                          className={`py-2 rounded-lg text-[0.75rem] font-bold uppercase tracking-wider transition-all ${
                            settings.frequencyMode === mode 
                              ? 'bg-card text-primary shadow-sm' 
                              : 'text-muted/60 hover:text-main'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-[0.7rem] text-muted font-medium italic">
                      {settings.frequencyMode === 'minimal' && 'Only high priority alerts and weekly summaries.'}
                      {settings.frequencyMode === 'balanced' && 'Standard briefing and important milestone alerts.'}
                      {settings.frequencyMode === 'aggressive' && 'Real-time updates and frequent performance snapshots.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                       <Zap className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-main text-sm">Smart Assistant Mode</h4>
                       <p className="text-xs text-muted/70 mt-1 leading-relaxed">
                         Our AI will automatically bundle notifications to avoid spamming you. Daily cap is set to max 5 alerts.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationSettings;
