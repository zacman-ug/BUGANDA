import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeritageContext } from '../context/HeritageContext';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { token, individuals, logout } = useContext(HeritageContext);
  const [clans, setClans] = useState([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalClans: 0,
    maleCount: 0,
    femaleCount: 0
  });

  useEffect(() => {
    const fetchClans = async () => {
      try {
        const response = await axios.get('/api/clans');
        setClans(response.data);
      } catch (err) {
        console.error("Could not load clans", err);
      }
    };
    fetchClans();
  }, []);

  useEffect(() => {
    const maleCount = individuals.filter(p => p.gender === 'Male').length;
    const femaleCount = individuals.filter(p => p.gender === 'Female').length;
    setStats({
      totalMembers: individuals.length,
      totalClans: clans.length > 0 ? clans.length : new Set(individuals.map(p => p.clan_id)).size,
      maleCount,
      femaleCount
    });
  }, [individuals, clans]);

  const nextPath = '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: loginData.email,
        password: loginData.password
      });
      const { token: tkn, user } = res.data;
      localStorage.setItem('token', tkn);
      localStorage.setItem('user', JSON.stringify(user));
      // update context
      if (typeof window !== 'undefined') {
        // use global event or navigate to refresh context via provider state
      }
      // set via context
      // We don't have direct access to setToken/setUser here; use a short workaround by dispatching a custom event
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { token: tkn, user } }));
      navigate(nextPath);
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (registerData.password !== registerData.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    setAuthLoading(true);
    try {
      await axios.post('/api/auth/register', {
        full_name: registerData.full_name,
        email: registerData.email,
        password: registerData.password
      });
      // try auto-login
      const res = await axios.post('/api/auth/login', { email: registerData.email, password: registerData.password });
      const { token: tkn, user } = res.data;
      localStorage.setItem('token', tkn);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { token: tkn, user } }));
      navigate(nextPath);
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Listen for the auth event to update context
  useEffect(() => {
    const handler = (e) => {
      const { token: tkn, user } = e.detail || {};
      // Gracefully update context by using window.history state change that HeritageProvider watches via localStorage
      // HeritageProvider sets token from localStorage on mount and listens for changes via effect, so set nothing else here.
      // Optionally we can reload the page to ensure context updates, but we'll avoid reload and instead dispatch storage event
      try {
        localStorage.setItem('token', tkn);
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {}
    };
    window.addEventListener('auth:login', handler);
    return () => window.removeEventListener('auth:login', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-dark via-gray-900 to-black">
      {/* Navbar */}
      <nav className="bg-heritage-dark bg-opacity-95 text-white p-6 flex justify-between items-center shadow-2xl">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🏛️</span>
          <h1 className="text-2xl font-bold text-heritage-gold font-serif">Buganda Heritage Archives</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clans')}
            className="px-6 py-2 text-heritage-gold border border-heritage-gold rounded-full font-bold hover:bg-heritage-gold hover:text-heritage-dark transition"
          >
            Clan Directory
          </button>
          {token ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-heritage-gold text-heritage-dark px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="px-4 py-2 border border-heritage-gold text-heritage-gold rounded-full font-bold hover:bg-red-600 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-3">
              <button
                onClick={() => navigate('/login?next=' + encodeURIComponent('/dashboard'))}
                className="px-6 py-2 border border-heritage-gold text-heritage-gold rounded-full font-bold hover:bg-heritage-gold hover:text-heritage-dark transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register?next=' + encodeURIComponent('/dashboard'))}
                className="px-6 py-2 bg-heritage-gold text-heritage-dark rounded-full font-bold hover:bg-yellow-400 transition"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white py-32 px-6 text-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-heritage-gold opacity-5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-heritage-gold opacity-5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-6xl font-bold font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-heritage-gold via-yellow-300 to-heritage-gold drop-shadow-lg" style={{textShadow: '0 0 30px rgba(212, 175, 55, 0.3)'}}>
            Preserve Your Ancestral Legacy
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-heritage-gold to-transparent mx-auto mb-6"></div>
          <p className="text-2xl text-gray-200 mb-8">
            Welcome to the Buganda Digital Archives - where ancient lineages meet modern technology.
            Documenting the "Abaana ba Kintu" and their clans for generations to come.
          </p>
          <p className="text-lg text-gray-300 italic font-serif mb-10">
            "In every person lies a story, in every clan lies a legacy"
          </p>
          {!token && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-3xl mx-auto text-gray-800">
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`px-4 py-2 rounded-lg font-bold ${authTab === 'login' ? 'bg-heritage-gold text-heritage-dark' : 'border border-gray-200 text-gray-700'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`px-4 py-2 rounded-lg font-bold ${authTab === 'register' ? 'bg-heritage-gold text-heritage-dark' : 'border border-gray-200 text-gray-700'}`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { setAuthTab('guest'); navigate('/clans'); }}
                  className="px-4 py-2 rounded-lg text-gray-600 border"
                >
                  Continue as guest
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border-l-4 border-red-500">
                  {authError}
                </div>
              )}

              {authTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-heritage-gold outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-heritage-gold outline-none"
                  />
                  <div className="flex justify-between items-center">
                    <button type="submit" disabled={authLoading} className="px-6 py-2 bg-heritage-gold text-heritage-dark rounded-xl font-bold">
                      {authLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-heritage-gold">Forgot?</button>
                  </div>
                </form>
              )}

              {authTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-heritage-gold outline-none"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-heritage-gold outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-heritage-gold outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-heritage-gold outline-none"
                  />
                  <div className="flex justify-end">
                    <button type="submit" disabled={authLoading} className="px-6 py-2 bg-heritage-gold text-heritage-dark rounded-xl font-bold">
                      {authLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-black/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-heritage-gold text-center mb-12 font-serif">📊 Heritage Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-heritage hover:shadow-heritage-lg transition-all duration-300 transform hover:scale-105 border-2 border-blue-400/20 hover:border-blue-400">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-5xl font-bold mb-3 text-blue-100">{stats.totalMembers}</div>
                <div className="text-blue-100 font-serif text-lg">👥 Members Registered</div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-white shadow-heritage hover:shadow-heritage-lg transition-all duration-300 transform hover:scale-105 border-2 border-purple-400/20 hover:border-purple-400">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-5xl font-bold mb-3 text-purple-100">{stats.totalClans}</div>
                <div className="text-purple-100 font-serif text-lg">🏛️ Clans Tracked</div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-heritage hover:shadow-heritage-lg transition-all duration-300 transform hover:scale-105 border-2 border-green-400/20 hover:border-green-400">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-5xl font-bold mb-3 text-green-100">{stats.maleCount}</div>
                <div className="text-green-100 font-serif text-lg">♂ Male Ancestors</div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-pink-600 to-pink-800 rounded-2xl p-8 text-white shadow-heritage hover:shadow-heritage-lg transition-all duration-300 transform hover:scale-105 border-2 border-pink-400/20 hover:border-pink-400">
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-5xl font-bold mb-3 text-pink-100">{stats.femaleCount}</div>
                <div className="text-pink-100 font-serif text-lg">♀ Female Ancestors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clans Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black/50 to-heritage-dark">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-heritage-gold to-yellow-300 text-center mb-4 font-serif">
            👑 The Great Clans (Kika za Buganda)
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-heritage-gold to-transparent mx-auto mb-12"></div>

          {clans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clans.slice(0, 9).map(clan => {
                const clanMemberCount = individuals.filter(p => p.clan_id === clan.id).length;
                return (
                  <div
                    key={clan.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-6 border-2 border-heritage-gold/30 hover:border-heritage-gold hover:shadow-heritage-lg transition-all duration-300 transform hover:scale-105 text-white animate-slide-up"
                  >
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-heritage-gold opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-heritage-gold opacity-5 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">🦁</div>
                      <h4 className="text-2xl font-bold text-heritage-gold mb-2 group-hover:text-yellow-300 transition-colors font-serif">{clan.name}</h4>
                      <p className="text-gray-400 mb-4 border-l-2 border-heritage-gold pl-3">
                        <span className="font-semibold text-gray-300">Totem:</span> <span className="text-gray-300">{clan.totem || 'Not specified'}</span>
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-heritage-gold/20">
                        <span className="text-sm text-gray-300 font-serif">{clanMemberCount} {clanMemberCount === 1 ? 'member' : 'members'}</span>
                        <span className="bg-gradient-to-r from-heritage-gold to-yellow-400 text-heritage-dark px-4 py-2 rounded-full font-bold text-lg hover:shadow-heritage">
                          {clanMemberCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-lg">Loading clans...</div>
          )}
        </div>
      </section>

      {/* Heritage Information */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-10 border border-heritage-gold border-opacity-30">
          <h3 className="text-3xl font-bold text-heritage-gold mb-6 font-serif">🌍 About Buganda Heritage</h3>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              The kingdom of Buganda has one of the richest cultural heritages in East Africa. The intricate system of 
              <span className="text-heritage-gold font-semibold"> clans (kika)</span> forms the backbone of Buganda's social structure, 
              with each clan tracing its lineage back to ancient ancestors and legendary founders.
            </p>
            <p>
              This digital archive serves to preserve these historical narratives, genealogical records, and cultural traditions 
              for future generations. By documenting family lineages, occupations, residences, and oral histories, we ensure that 
              the stories of our forefathers continue to inspire and educate.
            </p>
            <p>
              <span className="text-heritage-gold font-semibold">Join us</span> in this mission to digitally preserve the legacy 
              of Buganda's greatest families and their contributions to our kingdom's history.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-heritage-dark text-gray-400 text-center py-6 border-t border-gray-800">
        <p>© 2026 Buganda Heritage Archives | Preserving Our Past, Building Our Future</p>
      </footer>
    </div>
  );
};

export default Home;
