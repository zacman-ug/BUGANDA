import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { HeritageContext } from '../context/HeritageContext';

const Login = () => {
  const { setToken, setUser } = useContext(HeritageContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('✓ Account created successfully! Please login.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update context
      setToken(token);
      setUser(user);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Please use your own credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-cream via-gray-50 to-heritage-cream flex items-center justify-center p-4">
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-heritage-gold opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-heritage-dark opacity-5 rounded-full blur-3xl"></div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-t-4 border-heritage-gold relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏛️</div>
          <h1 className="text-4xl font-bold text-heritage-dark mb-2 font-serif">
            Buganda Heritage
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Preserving lineage. One family at a time.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border-l-4 border-green-500 shadow-sm animate-fade-in">
            <p className="font-semibold text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border-l-4 border-red-500 shadow-sm">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">Email Address</label>
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
            <div className="flex justify-between items-center mb-2.5">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-heritage-gold font-bold hover:text-heritage-bronze transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl p-3.5 focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold focus:ring-opacity-10 outline-none transition-all duration-200 bg-gray-50 hover:bg-white text-gray-800"
                placeholder="••••••••"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-heritage-gold to-heritage-bronze text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>🎭</span> Try Demo Account
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Email: test@example.com | Password: password123
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-heritage-gold font-bold hover:text-heritage-bronze transition"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
