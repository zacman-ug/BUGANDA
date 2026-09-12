import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useHeritage } from '../context/HeritageContext';

import PasswordInput from '../components/PasswordInput';

import AuthLayout from '../components/AuthLayout';

import { useToast } from '../components/Toast';

import { validateEmail, validateFullName, getPasswordStrength } from '../utils/validation';



const inputClass = 'w-full mt-1.5 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition';



const STRENGTH_COLORS = {

  weak: 'bg-red-500',

  medium: 'bg-yellow-500',

  strong: 'bg-green-500'

};



export default function Register() {

  const { register, token } = useHeritage();

  const navigate = useNavigate();

  const { show: showToast, ToastContainer } = useToast();

  const [form, setForm] = useState({

    full_name: '',

    email: '',

    password: '',

    confirmPassword: '',

    phone: ''

  });

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);



  const passwordStrength = form.password ? getPasswordStrength(form.password) : null;



  useEffect(() => {

    if (token) navigate('/dashboard', { replace: true });

  }, [token, navigate]);



  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

    setError('');

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');



    if (!validateFullName(form.full_name)) {

      setError('Please enter your full name (at least 2 characters)');

      return;

    }

    if (!validateEmail(form.email)) {

      setError('Please enter a valid email address');

      return;

    }

    if (form.password.length < 6) {

      setError('Password must be at least 6 characters');

      return;

    }

    if (form.password !== form.confirmPassword) {

      setError('Passwords do not match');

      return;

    }



    setLoading(true);

    try {

      await register({

        full_name: form.full_name.trim(),

        email: form.email.trim(),

        password: form.password,

        phone: form.phone.trim() || undefined

      });

      showToast('Account created! Please sign in.', 'success');

      navigate('/login');

    } catch (err) {

      const msg = err.response?.data?.error || 'Registration failed. Please try again.';

      setError(msg);

      showToast(msg, 'error');

    } finally {

      setLoading(false);

    }

  };



  return (

    <AuthLayout

      title="Begin your heritage"

      subtitle="Create your account to preserve your Buganda lineage, omuziro, and family stories for generations."

      footer={

        <Link to="/" className="text-sm text-gray-600 hover:text-heritage-gold transition">

          ← Back to home

        </Link>

      }

    >

      <ToastContainer />



      <div className="mb-8">

        <h2 className="font-serif text-2xl font-bold text-heritage-dark">Create Account</h2>

        <p className="text-gray-500 text-sm mt-1">The first registered user becomes admin</p>

      </div>



      {error && (

        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">

          {error}

        </div>

      )}



      <form onSubmit={handleSubmit} className="space-y-4">

        <label className="block">

          <span className="text-sm font-semibold text-gray-700">Full Name</span>

          <input

            type="text"

            name="full_name"

            value={form.full_name}

            onChange={handleChange}

            className={inputClass}

            placeholder="e.g. John Mukasa"

            autoComplete="name"

            required

          />

        </label>



        <label className="block">

          <span className="text-sm font-semibold text-gray-700">Email Address</span>

          <input

            type="email"

            name="email"

            value={form.email}

            onChange={handleChange}

            className={inputClass}

            placeholder="you@example.com"

            autoComplete="email"

            required

          />

        </label>



        <label className="block">

          <span className="text-sm font-semibold text-gray-700">Password</span>

          <PasswordInput

            name="password"

            value={form.password}

            onChange={handleChange}

            inputClassName="mt-1.5 px-4 py-3 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold"

            autoComplete="new-password"

            placeholder="At least 6 characters"

            required

          />

          {passwordStrength && (

            <div className="mt-2">

              <div className="flex gap-1 mb-1">

                {[1, 2, 3].map((i) => (

                  <div

                    key={i}

                    className={`h-1 flex-1 rounded-full ${

                      (passwordStrength.level === 'weak' && i === 1) ||

                      (passwordStrength.level === 'medium' && i <= 2) ||

                      (passwordStrength.level === 'strong')

                        ? STRENGTH_COLORS[passwordStrength.level]

                        : 'bg-gray-200'

                    }`}

                  />

                ))}

              </div>

              <p className="text-xs text-gray-500">Strength: {passwordStrength.text}</p>

            </div>

          )}

        </label>



        <label className="block">

          <span className="text-sm font-semibold text-gray-700">Confirm Password</span>

          <PasswordInput

            name="confirmPassword"

            value={form.confirmPassword}

            onChange={handleChange}

            inputClassName="mt-1.5 px-4 py-3 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold"

            autoComplete="new-password"

            placeholder="Re-enter your password"

            required

          />

          {form.confirmPassword && form.password !== form.confirmPassword && (

            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>

          )}

        </label>



        <label className="block">

          <span className="text-sm font-semibold text-gray-700">

            Phone <span className="font-normal text-gray-400">(optional)</span>

          </span>

          <input

            type="tel"

            name="phone"

            value={form.phone}

            onChange={handleChange}

            className={inputClass}

            placeholder="+256 700 000000"

            autoComplete="tel"

          />

        </label>



        <button

          type="submit"

          disabled={loading}

          className="w-full bg-heritage-gold hover:bg-yellow-500 text-heritage-dark py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"

        >

          {loading ? 'Creating account...' : 'Create Account'}

        </button>

      </form>



      <p className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">

        Already have an account?{' '}

        <Link to="/login" className="text-heritage-gold font-semibold hover:underline">

          Sign in

        </Link>

      </p>

    </AuthLayout>

  );

}

