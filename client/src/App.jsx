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

const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" replace />;
};

const AuthGate = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? <Navigate to="/" replace /> : children;
};

function App() {
  React.useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
        if (res.data?.theme) {
          document.documentElement.setAttribute('data-theme', res.data.theme);
        }
      } catch (err) {
        console.error('Failed to fetch global theme:', err);
      }
    };
    fetchTheme();
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
