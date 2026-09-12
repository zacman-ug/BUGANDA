import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useHeritage } from '../context/HeritageContext';

import PasswordInput from '../components/PasswordInput';



const ROLES = ['admin', 'contributor', 'viewer', 'moderator'];

const TABS = ['users', 'roles', 'audit'];



export default function AdminDashboard() {

  const { api, user, logout } = useHeritage();

  const [tab, setTab] = useState('users');

  const [users, setUsers] = useState([]);

  const [roles, setRoles] = useState([]);

  const [selectedRole, setSelectedRole] = useState('admin');

  const [rolePermissions, setRolePermissions] = useState(null);

  const [auditLogs, setAuditLogs] = useState([]);

  const [health, setHealth] = useState(null);

  const [error, setError] = useState('');

  const [createForm, setCreateForm] = useState({

    full_name: '',

    email: '',

    password: '',

    phone: '',

    role: 'viewer'

  });



  const loadUsers = async () => {

    const { data } = await api.get('/api/admin/users');

    setUsers(data);

  };



  const loadRoles = async () => {

    const { data } = await api.get('/api/admin/roles');

    setRoles(data);

  };



  const loadRolePermissions = async (roleName) => {

    const { data } = await api.get(`/api/admin/permissions/${roleName}`);

    setRolePermissions(data);

  };



  const loadAuditLogs = async () => {

    const { data } = await api.get('/api/admin/audit-log?limit=50');

    setAuditLogs(data);

  };



  const loadHealth = async () => {

    const { data } = await api.get('/health');

    setHealth(data);

  };



  useEffect(() => {

    const load = async () => {

      try {

        await Promise.all([loadUsers(), loadRoles(), loadHealth()]);

      } catch (err) {

        setError(err.response?.data?.error || 'Failed to load admin data');

      }

    };

    load();

  }, [api]);



  useEffect(() => {

    if (tab === 'roles') {

      loadRolePermissions(selectedRole).catch(() => setRolePermissions(null));

    }

    if (tab === 'audit') {

      loadAuditLogs().catch(() => setAuditLogs([]));

    }

  }, [tab, selectedRole, api]);



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

    <div className="min-h-screen bg-heritage-cream p-4 md:p-8">

      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">

        <div>

          <h1 className="text-2xl font-bold text-heritage-dark">Admin Dashboard</h1>

          {health && (

            <p className="text-xs text-green-700 mt-1">API status: {health.status} · {new Date(health.timestamp).toLocaleString()}</p>

          )}

        </div>

        <div className="flex flex-wrap gap-4 text-sm">

          <Link to="/" className="text-heritage-gold hover:underline">Home</Link>

          <Link to="/dashboard" className="text-heritage-gold hover:underline">Dashboard</Link>

          <button onClick={logout} className="text-red-600">Logout</button>

        </div>

      </div>



      <div className="flex gap-2 mb-6">

        {TABS.map((t) => (

          <button

            key={t}

            onClick={() => setTab(t)}

            className={`px-4 py-2 rounded font-semibold capitalize ${

              tab === t ? 'bg-heritage-gold text-white' : 'bg-white border'

            }`}

          >

            {t === 'audit' ? 'Audit Log' : t}

          </button>

        ))}

      </div>



      {error && <p className="text-red-600 mb-4">{error}</p>}



      {tab === 'users' && (

        <>

          <form onSubmit={handleCreateUser} className="bg-white rounded-lg shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">

            <h2 className="md:col-span-3 font-bold text-heritage-dark">Create User</h2>

            <input placeholder="Full name" value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} className="p-2 border rounded" required />

            <input type="email" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="p-2 border rounded" required />

            <PasswordInput placeholder="Password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} inputClassName="mt-0 p-2" className="mt-0" autoComplete="new-password" required />

            <input placeholder="Phone" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} className="p-2 border rounded" />

            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="p-2 border rounded">

              {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}

            </select>

            <button type="submit" className="bg-heritage-gold text-white px-4 py-2 rounded font-semibold">Create User</button>

          </form>



          <div className="bg-white rounded-lg shadow overflow-x-auto">

            <table className="w-full min-w-[600px]">

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

                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={u.id === user?.id} className="p-1 border rounded text-sm">

                        {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}

                      </select>

                    </td>

                    <td className="p-3">

                      {u.id !== user?.id && (

                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 text-sm hover:underline">Delete</button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </>

      )}



      {tab === 'roles' && (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-lg shadow p-6">

            <h2 className="font-bold text-heritage-dark mb-4">Roles</h2>

            <ul className="space-y-2">

              {roles.map((role) => (

                <li key={role.id}>

                  <button

                    onClick={() => setSelectedRole(role.name)}

                    className={`w-full text-left p-3 rounded border ${

                      selectedRole === role.name ? 'border-heritage-gold bg-heritage-gold/10' : 'border-gray-200'

                    }`}

                  >

                    <p className="font-semibold capitalize">{role.name}</p>

                    <p className="text-sm text-gray-600">{role.description}</p>

                  </button>

                </li>

              ))}

            </ul>

          </div>

          <div className="bg-white rounded-lg shadow p-6">

            <h2 className="font-bold text-heritage-dark mb-4 capitalize">{selectedRole} Permissions</h2>

            {rolePermissions ? (

              <ul className="space-y-2">

                {rolePermissions.permissions.map((perm) => (

                  <li key={perm.id} className="p-2 border rounded text-sm">

                    <span className="font-semibold">{perm.name}</span>

                    <span className="text-gray-500"> — {perm.description}</span>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="text-gray-500">Loading permissions...</p>

            )}

          </div>

        </div>

      )}



      {tab === 'audit' && (

        <div className="bg-white rounded-lg shadow overflow-x-auto">

          <table className="w-full min-w-[700px] text-sm">

            <thead className="bg-gray-50">

              <tr>

                <th className="p-3 text-left">Time</th>

                <th className="p-3 text-left">User</th>

                <th className="p-3 text-left">Action</th>

                <th className="p-3 text-left">Entity</th>

              </tr>

            </thead>

            <tbody>

              {auditLogs.length === 0 ? (

                <tr><td colSpan={4} className="p-6 text-center text-gray-500">No audit entries yet</td></tr>

              ) : (

                auditLogs.map((log) => (

                  <tr key={log.id} className="border-t">

                    <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>

                    <td className="p-3">{log.user?.full_name || log.user_id}</td>

                    <td className="p-3">{log.action}</td>

                    <td className="p-3">{log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}</td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

