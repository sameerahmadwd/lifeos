import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Habits from './pages/Habits';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" replace />;
};

// Redundant monolithic assignments purged gracefully

// New AuthGate wrapper component to prevent authenticated users from accessing login/register pages
const AuthGate = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? <Navigate to="/" replace /> : children;
};

function App() {
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

        {/* Catch-all route - redirect to home if logged in, or login if not */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
