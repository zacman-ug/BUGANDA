import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';

const inputClass = 'w-full mt-1.5 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition';

export default function ForgotPassword() {
  const { api } = useHeritage();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/forgot-password-request', { email });
      setMessage(data.message || 'If that email exists, a verification code has been sent.');
      setStep('reset');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running.');
      } else {
        setError(err.response.data?.error || 'Failed to send reset code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/reset-password', { email, code, password });
      setMessage(data.message || 'Password reset successfully');
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const subtitles = {
    request: 'Enter your email and we will send a 6-digit verification code (valid for 15 minutes).',
    reset: 'Enter the code from your email and choose a new password.',
    done: 'Your password has been updated. You can now sign in.'
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle={subtitles[step]}
    >
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-heritage-dark">Forgot Password</h2>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}
      {message && step !== 'done' && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg">{message}</div>
      )}

      {step === 'request' && (
        <form onSubmit={handleRequestCode} className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-heritage-gold hover:bg-yellow-500 text-heritage-dark py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} bg-gray-50`} required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Verification Code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClass} tracking-widest`}
              placeholder="6-digit code"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">New Password</span>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} inputClassName="mt-1.5 px-4 py-3 rounded-lg" autoComplete="new-password" required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Confirm Password</span>
            <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} inputClassName="mt-1.5 px-4 py-3 rounded-lg" autoComplete="new-password" required />
          </label>
          <button type="submit" disabled={loading} className="w-full bg-heritage-gold hover:bg-yellow-500 text-heritage-dark py-3 rounded-lg font-bold transition disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <Link to="/login" className="block w-full text-center bg-heritage-gold hover:bg-yellow-500 text-heritage-dark py-3 rounded-lg font-bold transition">
          Back to Sign In
        </Link>
      )}

      {step !== 'done' && (
        <p className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-heritage-gold font-semibold hover:underline">Sign In</Link>
        </p>
      )}
    </AuthLayout>
  );
}
