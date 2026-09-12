import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';

export default function Register() {
  const { register } = useHeritage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-heritage-cream p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-heritage-dark mb-6">Create Account</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {['full_name', 'email', 'password', 'phone'].map((field) => (
          <label key={field} className="block mb-4">
            <span className="text-sm text-gray-600 capitalize">{field.replace('_', ' ')}</span>
            <input
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              required={field !== 'phone'}
            />
          </label>
        ))}
        <button type="submit" disabled={loading} className="w-full bg-heritage-gold text-white py-2 rounded font-semibold">
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="mt-4 text-center text-sm">
          Have an account? <Link to="/login" className="text-heritage-gold">Login</Link>
        </p>
      </form>
    </div>
  );
}
