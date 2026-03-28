import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to enter your LifeOs dashboard.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Email Address" 
            icon={Mail} 
            name="email"
            type="email" 
            placeholder="john@example.com" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
          <Input 
            label="Password" 
            icon={Lock} 
            name="password"
            type="password" 
            placeholder="••••••••" 
            onChange={handleChange} 
            required
          />

          <div className="flex justify-end mb-4">
            <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading}>
            <LogIn className="btn-icon" /> Log In
          </Button>
        </form>

      </div>
    </div>

  );
};

export default Login;
