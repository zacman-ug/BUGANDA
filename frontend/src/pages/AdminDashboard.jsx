import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';

const ROLES = ['admin', 'contributor', 'viewer', 'moderator'];

export default function AdminDashboard() {
  const { api, user, logout } = useHeritage();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'viewer'
  });

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [api]);

  const handleRoleChange = async (userId, role) => {
    setError('');
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their family records?')) return;
    setError('');
    try {
      await api.delete(`/api/admin/users/${userId}`);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/admin/users', createForm);
      setCreateForm({ full_name: '', email: '', password: '', phone: '', role: 'viewer' });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  return (
    <div className="min-h-screen bg-heritage-cream p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-heritage-dark">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/dashboard" className="text-heritage-gold">Family Dashboard</Link>
          <button onClick={logout} className="text-red-600">Logout</button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleCreateUser} className="bg-white rounded-lg shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <h2 className="md:col-span-3 font-bold text-heritage-dark">Create User</h2>
        <input
          placeholder="Full name"
          value={createForm.full_name}
          onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={createForm.email}
          onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={createForm.password}
          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          placeholder="Phone"
          value={createForm.phone}
          onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
          className="p-2 border rounded"
        />
        <select
          value={createForm.role}
          onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
          className="p-2 border rounded"
        >
          {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <button type="submit" className="bg-heritage-gold text-white px-4 py-2 rounded font-semibold">
          Create User
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === user?.id}
                    className="p-1 border rounded text-sm"
                  >
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  {u.id !== user?.id && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
