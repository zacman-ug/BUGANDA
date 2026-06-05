import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HeritageContext } from '../context/HeritageContext';
import Layout from '../components/Layout';
import { useToast } from '../components/Toast';

const AdminDashboard = () => {
  const { user, token, hasRole } = useContext(HeritageContext);
  const navigate = useNavigate();
  const { show: showToast, ToastContainer } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      showToast('⚠️ You do not have admin access', 'error');
      navigate('/dashboard');
    }
  }, [user?.id, user?.role, navigate, showToast]);

  // Fetch all users
  useEffect(() => {
    if (!token || user?.role !== 'admin') return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        showToast('Failed to load users', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, user?.id]);

  // Handle role change
  const handleRoleChange = async (userId, roleValue) => {
    if (userId === user.id) {
      showToast('⚠️ Cannot change your own role', 'error');
      return;
    }

    try {
      await axios.put(`/api/admin/users/${userId}/role`, {
        role: roleValue
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: roleValue } : u
      ));
      
      showToast('✓ User role updated', 'success');
      setEditingUserId(null);
    } catch (err) {
      console.error('Error updating role:', err);
      showToast(err.response?.data?.error || 'Failed to update role', 'error');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      showToast('⚠️ Cannot delete your own account', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(users.filter(u => u.id !== userId));
      showToast('✓ User deleted', 'success');
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Role colors
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'contributor':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: 'Full system access',
      moderator: 'Content moderation',
      contributor: 'Can add records',
      viewer: 'View only'
    };
    return descriptions[role] || role;
  };

  return (
    <Layout>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-heritage-cream via-gray-50 to-heritage-cream py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">👑</span>
              <h1 className="text-4xl font-bold text-heritage-dark">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600 text-lg">Manage users and their roles</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">⚙️</div>
              <p className="text-gray-600 mt-3">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Search */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-gold"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-gold"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="admin">Admins ({users.filter(u => u.role === 'admin').length})</option>
                  <option value="moderator">Moderators ({users.filter(u => u.role === 'moderator').length})</option>
                  <option value="contributor">Contributors ({users.filter(u => u.role === 'contributor').length})</option>
                  <option value="viewer">Viewers ({users.filter(u => u.role === 'viewer').length})</option>
                </select>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                  <div className="text-3xl font-bold text-heritage-dark">
                    {users.filter(u => u.role === 'admin').length}
                  </div>
                  <div className="text-gray-600 text-sm">Admins</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                  <div className="text-3xl font-bold text-heritage-dark">
                    {users.filter(u => u.role === 'moderator').length}
                  </div>
                  <div className="text-gray-600 text-sm">Moderators</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                  <div className="text-3xl font-bold text-heritage-dark">
                    {users.filter(u => u.role === 'contributor').length}
                  </div>
                  <div className="text-gray-600 text-sm">Contributors</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-500">
                  <div className="text-3xl font-bold text-heritage-dark">
                    {users.filter(u => u.role === 'viewer').length}
                  </div>
                  <div className="text-gray-600 text-sm">Viewers</div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-heritage-dark text-white">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Name</th>
                        <th className="px-6 py-3 text-left font-semibold">Email</th>
                        <th className="px-6 py-3 text-left font-semibold">Current Role</th>
                        <th className="px-6 py-3 text-left font-semibold">Joined</th>
                        <th className="px-6 py-3 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{u.full_name}</div>
                            {u.id === user.id && (
                              <span className="text-sm text-heritage-gold font-medium">YOU</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(u.role)}`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {editingUserId === u.id ? (
                                <>
                                  <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-heritage-gold"
                                  >
                                    <option value="">Select role</option>
                                    <option value="admin">Admin</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="contributor">Contributor</option>
                                    <option value="viewer">Viewer</option>
                                  </select>
                                  <button
                                    onClick={() => handleRoleChange(u.id, newRole)}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingUserId(null)}
                                    className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingUserId(u.id);
                                      setNewRole(u.role);
                                    }}
                                    disabled={u.id === user.id}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Change Role
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={u.id === user.id}
                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No users found matching your criteria</p>
                  </div>
                )}
              </div>

              {/* Role Information */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-heritage-dark mb-4">Role Permissions Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="font-semibold text-red-700 mb-2">👑 Admin</div>
                    <p className="text-sm text-gray-700">{getRoleDescription('admin')}<br/>Manage users, delete records</p>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700 mb-2">🔍 Moderator</div>
                    <p className="text-sm text-gray-700">{getRoleDescription('moderator')}<br/>Approve submissions</p>
                  </div>
                  <div>
                    <div className="font-semibold text-green-700 mb-2">✏️ Contributor</div>
                    <p className="text-sm text-gray-700">{getRoleDescription('contributor')}<br/>Create & edit records</p>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">👁️ Viewer</div>
                    <p className="text-sm text-gray-700">{getRoleDescription('viewer')}<br/>View records only</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
