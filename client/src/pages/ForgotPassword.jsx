import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && (
          <div className="success-msg flex items-center gap-2 bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 font-medium mb-4">
            <CheckCircle2 className="w-5 h-5" /> {success}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <Input 
              label="Email Address" 
              icon={Mail} 
              name="email"
              type="email" 
              placeholder="john@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />

            <Button type="submit" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm mb-6">
              Check your inbox (and spam folder) for the reset link.
            </p>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="flex items-center justify-center gap-2 auth-link">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
