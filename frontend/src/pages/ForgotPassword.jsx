import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Reset password
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password-request', {
        email: formData.email
      });

      setSuccess('✓ Verification code sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        email: formData.email,
        code: formData.code,
        password: formData.password
      });

      setSuccess('✓ Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please check your code and try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-300';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-cream via-gray-50 to-heritage-cream flex items-center justify-center p-4">
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-heritage-gold opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-heritage-dark opacity-5 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-t-4 border-heritage-gold relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-heritage-gold/10 rounded-full mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-heritage-dark mb-2 font-serif">
            Reset Password
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 1 ? 'Enter your email to receive a verification code' : 'Enter your verification code and new password'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-heritage-gold' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-heritage-gold' : 'bg-gray-200'}`}></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border-l-4 border-red-500 shadow-sm">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border-l-4 border-green-500 shadow-sm">
            <p className="font-semibold text-sm">{success}</p>
          </div>
        )}

        {/* Step 1: Email Entry */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="your@email.com"
                required
              />
              <p className="text-xs text-gray-500 mt-2">We'll send a verification code to this email</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-heritage-gold to-heritage-bronze text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: Password Reset */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5">Verification Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter 6-digit code"
                required
                maxLength="6"
              />
              <p className="text-xs text-gray-500 mt-2">Check your email for the code</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5">New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  checkPasswordStrength(e.target.value);
                }}
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="••••••••"
                required
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password should include uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="••••••••"
                required
              />
              {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-600 mt-2">✓ Passwords match</p>
              )}
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-2">✗ Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !formData.code || !formData.password || !formData.confirmPassword}
              className="w-full bg-gradient-to-r from-heritage-gold to-heritage-bronze text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
          <p className="text-gray-600 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="text-heritage-gold font-bold hover:text-heritage-bronze transition">
              Login
            </Link>
          </p>
          <p className="text-gray-600 text-sm">
            Need an account?{' '}
            <Link to="/register" className="text-heritage-gold font-bold hover:text-heritage-bronze transition">
              Register
            </Link>
          </p>
        </div>

        {/* Contact Support */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            <span className="font-bold">💬 Having trouble?</span> Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
