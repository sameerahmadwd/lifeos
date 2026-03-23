import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import { 
  Settings as SettingsIcon, Sun, Moon, Monitor, Bell, 
  LayoutDashboard, CheckCircle2, Loader2, AlertCircle,
  ToggleLeft, ToggleRight, Trash2, ShieldAlert
} from 'lucide-react';

const SettingsSection = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
    <div className="flex items-start gap-4 mb-6">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-indigo-500" />
      </div>
      <div>
        <h3 className="text-base font-black text-slate-800 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Toggle = ({ label, enabled, onChange, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
    <button 
      onClick={() => onChange(!enabled)}
      className={`transition-colors duration-200 focus:outline-none ${enabled ? 'text-indigo-500' : 'text-slate-300'}`}
    >
      {enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
    </button>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    dashboardWidgets: {
      showTasks: true,
      showHabits: true,
      showNotes: true,
      showFocus: true
    }
  });

  useEffect(() => {
    if (!token) return navigate('/login');
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
        if (res.data) setSettings(res.data);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchSettings();
  }, [token, navigate]);

  const updateSettings = async (updates) => {
    setIsSaving(true);
    setSuccess(false);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/settings`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex overflow-hidden">
      <TopNav />
      <Sidebar />
      <main className="flex-1 ml-[260px] pt-[72px] flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex overflow-hidden bg-white shadow-sm border-t border-l border-slate-200 mt-2 ml-2 rounded-tl-3xl">
          <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <SettingsIcon className="w-6 h-6 text-indigo-500" />
                  Settings
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-0.5">Customize your LifeOS experience and account preferences.</p>
              </div>
              {success && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Changes saved!
                </div>
              )}
            </div>

            <div className="max-w-4xl p-8 space-y-2">
              
              {/* Appearance */}
              <SettingsSection 
                icon={Sun} 
                title="Appearance" 
                description="Customize how LifeOS looks on your device."
              >
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id })}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                        settings.theme === t.id 
                          ? 'border-indigo-500 bg-indigo-50/50' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <t.icon className={`w-6 h-6 ${settings.theme === t.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className={`text-sm font-black ${settings.theme === t.id ? 'text-indigo-600' : 'text-slate-600'}`}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </SettingsSection>

              {/* Notifications */}
              <SettingsSection 
                icon={Bell} 
                title="Notifications" 
                description="Manage how and when you receive alerts."
              >
                <Toggle 
                  label="System Notifications" 
                  enabled={settings.notifications} 
                  onChange={(val) => updateSettings({ notifications: val })}
                />
              </SettingsSection>

              {/* Dashboard Layout */}
              <SettingsSection 
                icon={LayoutDashboard} 
                title="Global Dashboard Layout" 
                description="Control which widgets are visible for all users on the site."
              >
                <div className="space-y-1">
                  <Toggle 
                    label="Show Tasks" 
                    enabled={settings.dashboardWidgets.showTasks} 
                    onChange={(val) => updateSettings({ dashboardWidgets: { showTasks: val } })}
                  />
                  <Toggle 
                    label="Show Habits" 
                    enabled={settings.dashboardWidgets.showHabits} 
                    onChange={(val) => updateSettings({ dashboardWidgets: { showHabits: val } })}
                  />
                  <Toggle 
                    label="Show Notes" 
                    enabled={settings.dashboardWidgets.showNotes} 
                    onChange={(val) => updateSettings({ dashboardWidgets: { showNotes: val } })}
                  />
                  <Toggle 
                    label="Show Focus" 
                    enabled={settings.dashboardWidgets.showFocus} 
                    onChange={(val) => updateSettings({ dashboardWidgets: { showFocus: val } })}
                  />
                </div>
              </SettingsSection>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
