import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeritageContext } from '../context/HeritageContext';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { token, individuals } = useContext(HeritageContext);
  const [clans, setClans] = useState([]);
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
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-heritage-gold text-heritage-dark px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 border border-heritage-gold text-heritage-gold rounded-full font-bold hover:bg-heritage-gold hover:text-heritage-dark transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
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
            <button
              onClick={() => navigate('/register')}
              className="relative overflow-hidden bg-gradient-to-r from-heritage-gold via-yellow-300 to-heritage-gold text-heritage-dark px-10 py-4 rounded-full font-bold text-lg hover:shadow-heritage-lg transition-all duration-300 group before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-heritage-dark before:to-black before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 group-hover:text-heritage-gold transition-colors duration-300">
                ✨ Start Preserving Your Heritage
              </span>
            </button>
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
