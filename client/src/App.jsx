import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Habits from './pages/Habits';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import axios from 'axios';
import { ShieldAlert, Zap } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" replace />;
};

const AuthGate = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? <Navigate to="/" replace /> : children;
};

function App() {
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
        if (res.data) {
          setSettings(res.data);
          // Apply theme
          if (res.data.defaultTheme) {
            document.documentElement.setAttribute('data-theme', res.data.defaultTheme);
          }
          // Apply primary color
          if (res.data.primaryColor) {
            document.documentElement.style.setProperty('--color-primary', res.data.primaryColor);
            document.documentElement.style.setProperty('--color-primary-hover', `${res.data.primaryColor}dd`);
          }
          // Apply favicon
          if (res.data.favicon) {
            const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.rel = 'icon';
            link.href = res.data.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
          }
        }
      } catch (err) {
        console.error('Failed to fetch global settings:', err);
      }
    };
    fetchSettings();
  }, []);

  if (settings?.maintenanceMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Under Maintenance</h1>
          <p className="text-slate-500 font-medium mb-8">We're currently performing some system updates. {settings.appName} will be back shortly!</p>
          <div className="py-3 px-6 bg-slate-50 rounded-xl inline-flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Zap className="w-3 h-3" /> System: Online
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          <AuthGate>
            <Login />
          </AuthGate>
        } />
        <Route path="/register" element={
          <AuthGate>
            <Register />
          </AuthGate>
        } />
        <Route path="/forgot-password" element={
          <AuthGate>
            <ForgotPassword />
          </AuthGate>
        } />
        <Route path="/reset-password/:token" element={
          <AuthGate>
            <ResetPassword />
          </AuthGate>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute>
            <Habits />
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Catch-all route - redirect to home if logged in, or login if not */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
