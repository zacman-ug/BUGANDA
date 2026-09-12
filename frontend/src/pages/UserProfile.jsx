import { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { useHeritage } from '../context/HeritageContext';

import { useToast } from '../components/Toast';



export default function UserProfile() {

  const { user, logout, token, individuals, api, updateProfile } = useHeritage();

  const navigate = useNavigate();

  const { show: showToast, ToastContainer } = useToast();

  const [isEditing, setIsEditing] = useState(false);

  const [profileMeta, setProfileMeta] = useState({ created_at: null });

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

        const { data } = await api.get('/api/auth/profile');

        setFormData({

          full_name: data.full_name,

          phone: data.phone || '',

          bio: data.bio || ''

        });

        setProfileMeta({ created_at: data.created_at });

      } catch (err) {

        console.error('Error fetching profile:', err);

      }

    };



    fetchProfile();

  }, [token, api]);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);



    try {

      await updateProfile(formData);

      showToast('Profile updated successfully', 'success');

      setIsEditing(false);

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



  const userStats = {

    totalRecords: individuals.length,

    accountSince: profileMeta.created_at

      ? new Date(profileMeta.created_at).toLocaleDateString()

      : '—'

  };



  return (

    <div className="min-h-screen bg-heritage-cream">

      <ToastContainer />

      <header className="bg-heritage-dark text-white p-4 flex justify-between items-center">

        <h1 className="text-xl font-bold">Your Profile</h1>

        <div className="flex flex-wrap gap-4 text-sm">

          <Link to="/" className="text-heritage-gold hover:underline">Home</Link>

          <Link to="/dashboard" className="text-heritage-gold hover:underline">Lineage Home</Link>

          <Link to="/heritage" className="text-heritage-gold">Heritage Experience</Link>

          <Link to="/family-tree" className="text-heritage-gold">Family Tree</Link>

        </div>

      </header>



      <div className="max-w-4xl mx-auto p-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="space-y-4">

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-heritage-gold">

              <h3 className="font-bold text-heritage-dark mb-3">Heritage Preserved</h3>

              <p className="text-sm text-gray-600">Lives connected in your lineage</p>

              <p className="text-3xl font-bold text-heritage-gold">{userStats.totalRecords}</p>

              <p className="text-xs text-gray-500 mt-3">Member since {userStats.accountSince}</p>

            </div>

            <div className="bg-white rounded-lg shadow p-6">

              <h3 className="font-bold text-heritage-dark mb-3">Account</h3>

              <p className="text-sm text-gray-600">Role</p>

              <p className="font-semibold capitalize">{user?.role || 'viewer'}</p>

              <p className="text-sm text-gray-600 mt-3">Email</p>

              <p className="font-semibold">{user?.email}</p>

            </div>

          </div>



          <div className="lg:col-span-2 bg-white rounded-lg shadow p-8">

            <h2 className="text-2xl font-bold text-heritage-dark mb-6">

              {isEditing ? 'Edit Profile' : 'Profile Information'}

            </h2>



            {!isEditing ? (

              <div className="space-y-5">

                <div>

                  <p className="text-sm text-gray-600">Full Name</p>

                  <p className="text-xl font-bold">{formData.full_name}</p>

                </div>

                <div>

                  <p className="text-sm text-gray-600">Phone</p>

                  <p>{formData.phone || 'Not provided'}</p>

                </div>

                <div>

                  <p className="text-sm text-gray-600">About You</p>

                  <p className="text-gray-700">{formData.bio || 'No bio added yet.'}</p>

                </div>

                <div className="flex gap-3 pt-4">

                  <button onClick={() => setIsEditing(true)} className="bg-heritage-gold text-white px-4 py-2 rounded font-semibold">

                    Edit Profile

                  </button>

                  <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded font-semibold">

                    Logout

                  </button>

                </div>

              </div>

            ) : (

              <form onSubmit={handleSubmit} className="space-y-4">

                <label className="block">

                  <span className="text-sm text-gray-600">Full Name</span>

                  <input

                    type="text"

                    value={formData.full_name}

                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}

                    className="w-full mt-1 p-2 border rounded"

                    required

                  />

                </label>

                <label className="block">

                  <span className="text-sm text-gray-600">Phone</span>

                  <input

                    type="tel"

                    value={formData.phone}

                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

                    className="w-full mt-1 p-2 border rounded"

                  />

                </label>

                <label className="block">

                  <span className="text-sm text-gray-600">About You</span>

                  <textarea

                    value={formData.bio}

                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}

                    rows={4}

                    className="w-full mt-1 p-2 border rounded"

                  />

                </label>

                <div className="flex gap-3">

                  <button type="submit" disabled={loading} className="bg-heritage-dark text-white px-4 py-2 rounded font-semibold disabled:opacity-50">

                    {loading ? 'Saving...' : 'Save Changes'}

                  </button>

                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">

                    Cancel

                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

