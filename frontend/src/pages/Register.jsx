import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate name
    if (formData.full_name.trim().length < 2) {
      setError('Please enter a valid full name');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      // Redirect to login with success message and preserve next path
      navigate(`/login?registered=true${nextPath ? '&next=' + encodeURIComponent(nextPath) : ''}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
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
          <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
          <h1 className="text-3xl font-bold text-heritage-dark mb-2 font-serif">
            Join Our Community
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Create your account and preserve your family heritage
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border-l-4 border-red-500 shadow-sm">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  checkPasswordStrength(e.target.value);
                }}
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800"
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3">
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
                  Use uppercase, lowercase, numbers, and symbols for a strong password
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800"
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {formData.password && formData.confirmPassword && (
              <p className={`text-xs mt-2 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">Phone Number (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800"
              placeholder="+256 (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.full_name || !formData.email || !formData.password || formData.password !== formData.confirmPassword}
            className="w-full bg-gradient-to-r from-heritage-gold to-heritage-bronze text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-gray-600 text-center mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>

        {/* Footer Navigation */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link
              to={`/login?next=${encodeURIComponent(nextPath)}`}
              className="text-heritage-gold font-bold hover:text-heritage-bronze transition"
            >
              Login here
            </Link>
          </p>
          <p className="text-gray-600 text-sm">
            Forgot your password?{' '}
            <Link
              to="/forgot-password"
              className="text-heritage-gold font-bold hover:text-heritage-bronze transition"
            >
              Reset it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
