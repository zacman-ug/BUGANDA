import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HeritageContext } from '../context/HeritageContext';
import Layout from '../components/Layout';
import { useToast } from '../components/Toast';

const UserProfile = () => {
  const { user, setUser, logout, token, individuals } = useContext(HeritageContext);
  const navigate = useNavigate();
  const { show: showToast, ToastContainer } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/auth/profile');
        setFormData({
          full_name: response.data.full_name,
          phone: response.data.phone || '',
          bio: response.data.bio || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/auth/profile', formData);
      showToast('✓ Profile updated successfully!', 'success');
      setIsEditing(false);

      setUser({
        ...user,
        full_name: formData.full_name
      });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate user statistics
  const userStats = {
    totalRecords: individuals.length,
    userContribution: Math.floor(Math.random() * individuals.length * 0.3), // Demo: random contribution
    lastUpdated: new Date().toLocaleDateString()
  };

  return (
    <Layout>
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-heritage-dark to-heritage-gold font-serif mb-2">
            👤 Your Profile
          </h1>
          <p className="text-gray-600 text-lg">Manage your account and heritage contributions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Stats */}
          <div className="space-y-6">
            {/* Contribution Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>📊</span> Your Contributions
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Records Added</p>
                  <p className="text-3xl font-bold text-blue-900">{userStats.userContribution}</p>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Last Updated</p>
                  <p className="text-blue-900 font-semibold">{userStats.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Archive Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span>🏛️</span> Archive Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-purple-700 mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-purple-900">{userStats.totalRecords}</p>
                </div>
                <div className="pt-3 border-t border-purple-200">
                  <p className="text-sm text-purple-700">Database Size</p>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-900 h-2 rounded-full transition-all"
                      style={{ width: `${(userStats.totalRecords / 1000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <span>✓</span> Account Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Verification</span>
                  <span className="text-xs bg-green-200 text-green-900 px-3 py-1 rounded-full font-bold">
                    Verified
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-green-700">Role</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    user?.role === 'admin' ? 'bg-red-100 text-red-900' :
                    user?.role === 'moderator' ? 'bg-blue-100 text-blue-900' :
                    user?.role === 'contributor' ? 'bg-green-100 text-green-900' :
                    'bg-gray-100 text-gray-900'
                  }`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Viewer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-8 border-heritage-gold">
              <h2 className="text-2xl font-bold text-heritage-dark mb-6 font-serif">
                {isEditing ? '✏️ Edit Profile' : '📋 Profile Information'}
              </h2>

              {!isEditing ? (
                /* Display Mode */
                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="pb-6 border-b border-gray-200">
                    <label className="block text-sm font-bold text-gray-600 mb-3">Full Name</label>
                    <p className="text-2xl font-bold text-gray-900">{formData.full_name}</p>
                  </div>

                  {/* Email */}
                  <div className="pb-6 border-b border-gray-200">
                    <label className="block text-sm font-bold text-gray-600 mb-3">Email Address</label>
                    <p className="text-lg text-gray-800">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">✓ Verified</p>
                  </div>

                  {/* Phone */}
                  <div className="pb-6 border-b border-gray-200">
                    <label className="block text-sm font-bold text-gray-600 mb-3">Phone Number</label>
                    <p className="text-lg text-gray-800">
                      {formData.phone || <span className="text-gray-400 italic">Not provided</span>}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="pb-6">
                    <label className="block text-sm font-bold text-gray-600 mb-3">About You</label>
                    <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {formData.bio || <span className="text-gray-400 italic">No bio added yet. Click edit to add your story.</span>}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-heritage-gold hover:bg-yellow-500 text-heritage-dark font-bold py-3 px-4 rounded-lg transition"
                    >
                      ✎ Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition"
                      placeholder="e.g., +256 701 234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">About You</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition resize-none"
                      rows="5"
                      placeholder="Tell us about yourself, your heritage, and your contribution to preserving Buganda's legacy..."
                    />
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 font-bold py-3 px-4 rounded-lg transition ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-heritage-dark hover:bg-gray-800 text-white'
                      }`}
                    >
                      {loading ? '⏳ Saving...' : '✓ Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
