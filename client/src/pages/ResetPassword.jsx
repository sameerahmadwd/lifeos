import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, { password: formData.password });
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Please enter your new password below.</p>
        </div>

        {error && <div className="error-msg flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium mb-4">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>}
        {success && (
          <div className="success-msg flex items-center gap-2 bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 font-medium mb-4">
            <CheckCircle2 className="w-5 h-5" /> {success}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <Input 
              label="New Password" 
              icon={Lock} 
              name="password"
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              required
            />
            <Input 
              label="Confirm New Password" 
              icon={Lock} 
              name="confirmPassword"
              type="password" 
              placeholder="••••••••" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required
            />

            <Button type="submit" isLoading={isLoading}>
              Reset Password
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm mb-6">
              You will be redirected to the login page shortly...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
