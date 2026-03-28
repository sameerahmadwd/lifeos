import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';
import { 
  Settings as SettingsIcon, Sun, Moon, Monitor, Bell, 
  LayoutDashboard, CheckCircle2, Loader2, AlertCircle,
  ToggleLeft, ToggleRight, Trash2, ShieldAlert,
  Globe, Zap, Megaphone, Palette, Type, Clock
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

const Toggle = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <button 
      onClick={() => onChange(!enabled)}
      className={`transition-colors duration-200 focus:outline-none ${enabled ? 'text-indigo-500' : 'text-slate-300'}`}
    >
      {enabled ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
    </button>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
    />
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    appName: 'LifeOS',
    siteTitle: 'LifeOS',
    defaultTimezone: 'UTC',
    maintenanceMode: false,
    autoDeleteInactiveDays: 30,
    autoArchiveTasksDays: 7,
    backupFrequency: 'daily',
    announcement: { message: '', enabled: false },
    primaryColor: '#6366f1',
    logo: '',
    favicon: ''
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
    setSuccess(false);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/settings`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Apply theme/branding immediately if changed
      if (updates.primaryColor) {
        document.documentElement.style.setProperty('--color-primary', updates.primaryColor);
        document.documentElement.style.setProperty('--color-primary-hover', `${updates.primaryColor}dd`);
      }
      if (updates.favicon) {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = updates.favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      if (updates.siteTitle) {
        document.title = updates.siteTitle;
      }
    } catch (err) {
      console.error(err);
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
      <BottomNav />
      <main className="flex-1 ml-0 md:ml-[260px] pt-[72px] pb-[72px] md:pb-0 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex overflow-hidden bg-white shadow-sm md:border-t md:border-l border-slate-200 mt-0 md:mt-2 ml-0 md:ml-2 md:rounded-tl-3xl">
          <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="px-5 md:px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Globe className="w-6 h-6 text-indigo-500" />
                  System Settings
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-0.5">Global configuration and website-wide management.</p>
              </div>
              {success && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-bold animate-pulse">
                  <CheckCircle2 className="w-4 h-4" /> System Updated
                </div>
              )}
            </div>

            <div className="max-w-4xl p-4 md:p-8 space-y-6 mx-auto w-full">
              
              {/* 1. General Settings */}
              <SettingsSection 
                icon={SettingsIcon} 
                title="General Configuration" 
                description="Core application identifiers and operational modes."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <InputField 
                    label="App Name" 
                    value={settings.appName} 
                    onChange={(val) => updateSettings({ appName: val })}
                    placeholder="e.g. LifeOS"
                  />
                  <InputField 
                    label="Browser Tab Title" 
                    value={settings.siteTitle} 
                    onChange={(val) => updateSettings({ siteTitle: val })}
                    placeholder="e.g. LifeOS - Your Hub"
                  />
                  <InputField 
                    label="Default Timezone" 
                    value={settings.defaultTimezone} 
                    onChange={(val) => updateSettings({ defaultTimezone: val })}
                  />
                </div>

              </SettingsSection>

              {/* 2. Automation & Data */}
              <SettingsSection 
                icon={Zap} 
                title="Automation & Data" 
                description="Manage automated cleanup and data retention policies."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4">
                  <InputField 
                    label="Auto-delete inactive users (Days)" 
                    type="number"
                    value={settings.autoDeleteInactiveDays} 
                    onChange={(val) => updateSettings({ autoDeleteInactiveDays: parseInt(val) })}
                  />
                  <InputField 
                    label="Auto-archive completed tasks (Days)" 
                    type="number"
                    value={settings.autoArchiveTasksDays} 
                    onChange={(val) => updateSettings({ autoArchiveTasksDays: parseInt(val) })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Backup Frequency</label>
                  <select 
                    value={settings.backupFrequency}
                    onChange={(e) => updateSettings({ backupFrequency: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </SettingsSection>

              {/* 9. Global Announcements */}
              <SettingsSection 
                icon={Megaphone} 
                title="Global Announcements" 
                description="Broadcast messages to all users on their dashboards."
              >
                <InputField 
                  label="Announcement Message" 
                  value={settings.announcement.message} 
                  onChange={(val) => updateSettings({ announcement: { message: val } })}
                  placeholder="e.g. New feature released 🚀"
                />
                <Toggle 
                  label="Enable Live Announcement" 
                  enabled={settings.announcement.enabled} 
                  onChange={(val) => updateSettings({ announcement: { enabled: val } })}
                />
              </SettingsSection>

              {/* 10. UI/Brand Control */}
              <SettingsSection 
                icon={Palette} 
                title="UI & Brand Control" 
                description="Customize the visual identity of the entire website."
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <InputField 
                    label="Primary Brand Color (Hex)" 
                    value={settings.primaryColor} 
                    onChange={(val) => updateSettings({ primaryColor: val })}
                    placeholder="#6366f1"
                  />
                  <InputField 
                    label="Logo URL (Icon)" 
                    value={settings.logo} 
                    onChange={(val) => updateSettings({ logo: val })}
                    placeholder="https://example.com/logo.png"
                  />
                  <InputField 
                    label="Favicon URL" 
                    value={settings.favicon} 
                    onChange={(val) => updateSettings({ favicon: val })}
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
