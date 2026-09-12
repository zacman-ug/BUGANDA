import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useHeritage } from '../context/HeritageContext';

import PasswordInput from '../components/PasswordInput';

import AuthLayout from '../components/AuthLayout';

import { validateEmail } from '../utils/validation';



const inputClass = 'w-full mt-1.5 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition';



export default function Login() {

  const { login, token } = useHeritage();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (token) navigate('/dashboard', { replace: true });

  }, [token, navigate]);



  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');



    if (!validateEmail(email)) {

      setError('Please enter a valid email address');

      return;

    }



    setLoading(true);

    try {

      await login(email.trim(), password);

      navigate('/dashboard');

    } catch (err) {

      setError(err.response?.data?.error || 'Login failed. Check your email and password.');

    } finally {

      setLoading(false);

    }

  };



  return (

    <AuthLayout

      title="Welcome back"

      subtitle="Sign in to explore your Buganda heritage — lineage, totems, and clan stories."

      footer={

        <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm text-gray-600">

          <Link to="/" className="hover:text-heritage-gold transition">Back to home</Link>

          <span className="hidden sm:inline text-gray-300">|</span>

          <Link to="/clans" className="hover:text-heritage-gold transition">Browse clans without signing in</Link>

        </div>

      }

    >

      <div className="mb-8">

        <h2 className="font-serif text-2xl font-bold text-heritage-dark">Sign In</h2>

        <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>

      </div>



      {error && (

        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">

          {error}

        </div>

      )}



      <form onSubmit={handleSubmit} className="space-y-5">

        <label className="block">

          <span className="text-sm font-semibold text-gray-700">Email Address</span>

          <input

            type="email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            className={inputClass}

            placeholder="you@example.com"

            autoComplete="email"

            required

          />

        </label>



        <label className="block">

          <span className="text-sm font-semibold text-gray-700">Password</span>

          <PasswordInput

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            inputClassName="mt-1.5 px-4 py-3 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold"

            autoComplete="current-password"

            placeholder="Your password"

            required

          />

        </label>



        <div className="text-right">

          <Link to="/forgot-password" className="text-sm text-heritage-gold hover:underline font-medium">

            Forgot password?

          </Link>

        </div>



        <button

          type="submit"

          disabled={loading}

          className="w-full bg-heritage-gold hover:bg-yellow-500 text-heritage-dark py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"

        >

          {loading ? 'Signing in...' : 'Sign In'}

        </button>

      </form>



      <p className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">

        Don&apos;t have an account?{' '}

        <Link to="/register" className="text-heritage-gold font-semibold hover:underline">

          Create one free

        </Link>

      </p>

    </AuthLayout>

  );

}

