import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogIn } from 'lucide-react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Standard registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create LifeOs Account</h2>
          <p className="auth-subtitle">Join us to organize your life seamlessly.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Full Name" 
            icon={User} 
            name="name"
            type="text" 
            placeholder="John Doe" 
            value={formData.name} 
            onChange={handleChange} 
            required
          />
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
            value={formData.password} 
            onChange={handleChange} 
            required
          />

          <Button type="submit" isLoading={isLoading}>
            <LogIn className="btn-icon" /> Sign Up
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
