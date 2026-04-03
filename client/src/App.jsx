import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Habits from './pages/Habits';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SessionHistory from './pages/SessionHistory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import NotificationSettings from './pages/NotificationSettings';
import axios from 'axios';

import { ShieldAlert, Zap } from 'lucide-react';
import useActiveSession from './hooks/useActiveSession';

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
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || null;

  // Active Time Tracking
  const { isActive, isIdle } = useActiveSession(userInfo);

  React.useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
          if (res.data) {
            setSettings(res.data);
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
          // Apply browser title
          if (res.data.siteTitle) {
            document.title = res.data.siteTitle;
          }
        }
      } catch (err) {
        console.error('Failed to fetch global settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (

    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          <AuthGate>
            <Login />
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
        <Route path="/sessions" element={
          <ProtectedRoute>
            <SessionHistory />
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />
        <Route path="/goals/:id" element={
          <ProtectedRoute>
            <GoalDetail />
          </ProtectedRoute>
        } />
        <Route path="/settings/notifications" element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        } />


        {/* Catch-all route - redirect to home if logged in, or login if not */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
