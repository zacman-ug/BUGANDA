import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';

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
      setMessage(data.message || 'If email exists, verification code will be sent');
      setStep('reset');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
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
      const { data } = await api.post('/api/auth/reset-password', {
        email,
        code,
        password
      });
      setMessage(data.message || 'Password reset successfully');
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-heritage-cream p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-heritage-dark mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6">
          {step === 'request' && 'Enter your email and we will send you a verification code.'}
          {step === 'reset' && 'Enter the code from your email and choose a new password.'}
          {step === 'done' && 'Your password has been updated. You can now sign in.'}
        </p>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {message && step !== 'done' && <p className="text-green-700 mb-4">{message}</p>}

        {step === 'request' && (
          <form onSubmit={handleRequestCode}>
            <label className="block mb-6">
              <span className="text-sm text-gray-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-heritage-gold text-white py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <label className="block mb-4">
              <span className="text-sm text-gray-600">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border rounded bg-gray-50"
                required
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-gray-600">Verification Code</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full mt-1 p-2 border rounded tracking-widest"
                placeholder="6-digit code"
                required
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-gray-600">New Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                required
              />
            </label>
            <label className="block mb-6">
              <span className="text-sm text-gray-600">Confirm Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-heritage-gold text-white py-2 rounded font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <Link
            to="/login"
            className="block w-full text-center bg-heritage-gold text-white py-2 rounded font-semibold hover:opacity-90"
          >
            Back to Login
          </Link>
        )}

        {step !== 'done' && (
          <p className="mt-4 text-center text-sm">
            Remember your password? <Link to="/login" className="text-heritage-gold">Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
