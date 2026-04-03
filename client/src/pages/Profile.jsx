import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNav from '../components/dashboard/TopNav';
import BottomNav from '../components/dashboard/BottomNav';
import {
  User, Mail, Phone, Briefcase, Globe, Edit3, Save, X,
  Lock, Eye, EyeOff, CheckCircle2, Loader2, ListTodo,
  BookOpen, Flame, AlertCircle, History
} from 'lucide-react';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6'
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Tokyo',
  'Australia/Sydney'
];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-input rounded-xl p-4 border border-border flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-[0.65rem] font-black text-muted uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-main leading-tight">{value}</p>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: '', bio: '', phone: '', jobTitle: '', timezone: 'UTC', avatarColor: '#6366f1' });

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    if (!token) return navigate('/login');
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setStats(res.data.stats);
        setForm({
          name: res.data.name || '',
          bio: res.data.bio || '',
          phone: res.data.phone || '',
          jobTitle: res.data.jobTitle || '',
          timezone: res.data.timezone || 'UTC',
          avatarColor: res.data.avatarColor || '#6366f1',
        });
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchProfile();
  }, [token, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, ...res.data });
      // Update name + timezone in localStorage so TopNav syncs immediately
      const stored = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...stored, name: res.data.name, timezone: res.data.timezone }));
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError('New passwords do not match.');
    }
    if (pwForm.newPassword.length < 6) {
      return setPwError('Password must be at least 6 characters.');
    }
    setPwLoading(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/profile/password`,
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwSuccess(res.data.message);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    } finally { setPwLoading(false); }
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (isLoading) return (
    <div className="min-h-screen bg-site flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-site font-sans flex overflow-hidden">
      <TopNav />
      <Sidebar />
      <BottomNav />
      <main className="flex-1 ml-0 md:ml-[260px] pt-nav pb-nav p-4 md:p-8 overflow-y-auto">
        <div className="flex-1 flex overflow-hidden bg-card shadow-sm md:border-t md:border-l border-border mt-0 md:mt-2 ml-0 md:ml-2 md:rounded-tl-3xl">
          <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="px-5 md:px-8 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
              <div>
                <h1 className="text-2xl font-black text-main tracking-tight flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  My Profile
                </h1>
                <p className="text-muted text-sm font-medium mt-0.5">Manage your personal info and account settings.</p>
              </div>
              {saveSuccess && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Profile saved!
                </div>
              )}
            </div>

            <div className="flex-1 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 content-start">

              {/* Left Column: Avatar + Stats */}
              <div className="space-y-6">

                {/* Avatar Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg mb-4 transition-all"
                    style={{ backgroundColor: form.avatarColor || profile?.avatarColor || '#6366f1' }}
                  >
                    {getInitials(profile?.name)}
                  </div>
                  <h2 className="text-xl font-black text-main">{profile?.name}</h2>
                  <p className="text-sm text-muted font-medium mt-0.5">{profile?.jobTitle || 'No title set'}</p>
                  <p className="text-xs text-muted/60 mt-1">{profile?.email}</p>

                  {/* Avatar Color Picker */}
                  {isEditing && (
                    <div className="mt-4">
                      <p className="text-[0.65rem] font-black text-muted uppercase tracking-wider mb-2">Avatar Color</p>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {AVATAR_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setForm(f => ({ ...f, avatarColor: color }))}
                            className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${form.avatarColor === color ? 'ring-2 ring-offset-2 ring-muted/50 scale-110' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                {stats && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-main mb-4 uppercase tracking-wider">Your Stats</h3>
                    <div className="space-y-3">
                      <StatCard icon={ListTodo} label="Total Tasks" value={stats.tasks} color="bg-primary/10 text-primary" />
                      <StatCard icon={CheckCircle2} label="Completed" value={stats.completedTasks} color="bg-emerald-500/10 text-emerald-500" />
                      <StatCard icon={BookOpen} label="Journal Entries" value={stats.notes} color="bg-purple-500/10 text-purple-500" />
                      <StatCard icon={Flame} label="Active Habits" value={stats.habits} color="bg-orange-500/10 text-orange-500" />
                    </div>
                  </div>
                )}

                {/* Activity History */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-main mb-4 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Activity History
                  </h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {profile?.activityLog?.length > 0 ? (
                      profile.activityLog.slice(0, 10).map((act, i) => (
                        <div key={i} className="flex items-start gap-3 border-l-2 border-border pl-4 py-1 relative">
                          <div className={`absolute -left-[5px] top-2 w-2 h-2 rounded-full ${act.type === 'login' ? 'bg-emerald-400' : 'bg-muted/30'}`}></div>
                          <div>
                            <p className="text-xs font-bold text-main capitalize">{act.type} Activity</p>
                            <p className="text-[0.65rem] text-muted font-medium tracking-tight">
                              {new Date(act.timestamp).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit',
                                timeZone: profile.timezone || 'UTC'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted text-center py-4 font-medium italic">No recent activity found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Profile + Change Password */}
              <div className="xl:col-span-2 space-y-6">

                {/* Profile Info */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h3 className="text-base font-black text-main">Personal Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex justify-center items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-bold transition-all w-full sm:w-auto"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex-1 sm:flex-none justify-center items-center flex gap-2 px-4 py-2 bg-input text-muted hover:bg-muted/10 rounded-xl text-sm font-bold transition-all"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex-1 sm:flex-none justify-center items-center flex gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-xl text-sm font-bold transition-all disabled:opacity-60 active:scale-95"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-[0.7rem] font-black text-muted uppercase tracking-wider mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-main bg-card outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:bg-input disabled:text-muted/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email (readonly) */}
                    <div>
                      <label className="block text-[0.7rem] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={profile?.email || ''}
                          disabled
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 bg-slate-50 outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[0.7rem] font-black text-muted uppercase tracking-wider mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="e.g. +91 300 1234567"
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-main bg-card outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:bg-input disabled:text-muted/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-[0.7rem] font-black text-muted uppercase tracking-wider mb-1.5">Job Title</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          type="text"
                          value={form.jobTitle}
                          onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="e.g. Software Engineer"
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-main bg-card outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:bg-input disabled:text-muted/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-[0.7rem] font-black text-muted uppercase tracking-wider mb-1.5">Timezone</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <select
                          value={form.timezone}
                          onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-main bg-card outline-none appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:bg-input disabled:text-muted/50 transition-all cursor-pointer"
                        >
                          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                      <label className="block text-[0.7rem] font-black text-muted uppercase tracking-wider mb-1.5">Bio</label>
                      <textarea
                        value={form.bio}
                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="A short bio about yourself..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-main bg-card outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:bg-input disabled:text-muted/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-black text-main mb-6 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted" /> Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {[
                      { key: 'currentPassword', label: 'Current Password' },
                      { key: 'newPassword', label: 'New Password' },
                      { key: 'confirmPassword', label: 'Confirm New Password' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-[0.7rem] font-black text-muted uppercase tracking-wider mb-1.5">{label}</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            type={showPw[key.replace('Password', '').replace('confirm', 'confirm')] ? 'text' : 'password'}
                            value={pwForm[key]}
                            onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl text-sm font-semibold text-main bg-card outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(s => ({ ...s, [key.replace('Password', '').replace('currentP', 'current').replace('newP', 'new').replace('confirmP', 'confirm')]: !s[key.replace('Password', '').replace('currentP', 'current').replace('newP', 'new').replace('confirmP', 'confirm')] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}

                    {pwError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl font-semibold">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                      </div>
                    )}
                    {pwSuccess && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl font-semibold">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {pwSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
                    >
                      {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Update Password
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
