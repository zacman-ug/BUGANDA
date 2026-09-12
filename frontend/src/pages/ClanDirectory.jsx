import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HeritageContext } from '../context/HeritageContext';
import { useToast } from "../components/Toast";

/**
 * ClanDirectory - Browse and explore all clans
 * Shows clan members, totems, and information
 */
const ClanDirectory = () => {
  const navigate = useNavigate();
  const { individuals = [], token } = useContext(HeritageContext);
  const { show: showToast, ToastContainer } = useToast();
  const [clans, setClans] = useState([]);
  const [selectedClan, setSelectedClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Fetch clans only once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchClans = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/clans');
        setClans(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load clans:', err);
        showToast('Failed to load clan directory', 'error');
        setClans([]);
        setLoading(false);
      }
    };

    fetchClans();
  }, []);

  // Enrich clans with member data when individuals or clans change
  const enrichedClans = clans.map(clan => ({
    ...clan,
    memberCount: individuals.filter(p => p.clan_id === clan.id).length,
    members: individuals.filter(p => p.clan_id === clan.id)
  })).sort((a, b) => b.memberCount - a.memberCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-heritage-light to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Loading clan directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-light to-white">
      {/* Navbar */}
      <nav className="bg-heritage-dark bg-opacity-95 text-white p-6 flex justify-between items-center shadow-2xl">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🏛️</span>
          <h1 className="text-2xl font-bold text-heritage-gold font-serif">Buganda Clans</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 text-heritage-gold border border-heritage-gold rounded-full font-bold hover:bg-heritage-gold hover:text-heritage-dark transition"
          >
            ← Home
          </button>
          {token ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-heritage-gold text-heritage-dark px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-heritage-gold text-heritage-dark px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      <ToastContainer />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-heritage-dark to-heritage-gold mb-4">
            🏛️ Buganda Clans Directory
          </h1>
          <p className="text-gray-600 text-lg">Explore the {enrichedClans.length} great clans of Buganda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clan List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-heritage-gold/20">
              <div className="bg-gradient-to-r from-heritage-dark to-black text-white p-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <span>📋</span> All Clans ({enrichedClans.length})
                </h2>
              </div>
              <div className="overflow-y-auto max-h-96">
                {enrichedClans && enrichedClans.length > 0 ? (
                  enrichedClans.map(clan => (
                    <button
                      key={clan.id}
                      onClick={() => setSelectedClan(clan)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-heritage-gold/10 transition ${
                        selectedClan?.id === clan.id ? 'bg-heritage-gold/20 border-l-4 border-heritage-gold' : ''
                      }`}
                    >
                      <p className="font-semibold text-heritage-dark">{clan.display_name || clan.name}</p>
                      <p className="text-sm text-gray-600 mt-1">👥 {clan.memberCount} members</p>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No clans available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clan Details */}
          <div className="lg:col-span-2">
            {selectedClan ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-heritage-gold/20 max-h-96 overflow-y-auto">
                {/* Clan Header */}
                <div className="bg-gradient-to-r from-heritage-dark to-black text-white p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-4xl font-bold font-serif mb-2">{selectedClan.display_name || selectedClan.name}</h2>
                      {selectedClan.totem && (
                        <p className="text-heritage-gold text-lg">Totem: {selectedClan.totem}</p>
                      )}
                    </div>
                    <div className="text-6xl opacity-20">🦁</div>
                  </div>
                </div>

                {/* Clan Info */}
                <div className="p-8 border-b border-gray-200">
                  {selectedClan.description && (
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">Description</p>
                      <p className="text-gray-700 italic">{selectedClan.description}</p>
                    </div>
                  )}
                  <div className="bg-heritage-gold/10 rounded-lg p-4 border border-heritage-gold/20">
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-3xl font-bold text-heritage-gold">{selectedClan.memberCount}</p>
                  </div>
                </div>

                {/* Members List */}
                <div className="p-8">
                  <h3 className="font-bold text-xl text-heritage-dark mb-4 flex items-center gap-2">
                    <span>👥</span> Members of {selectedClan.display_name || selectedClan.name}
                  </h3>
                  <div className="space-y-3">
                    {selectedClan.members && selectedClan.members.length > 0 ? (
                      selectedClan.members.map(member => (
                        <div key={member.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-heritage-gold/50 transition">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-heritage-dark">{member.full_name}</p>
                              <p className="text-sm text-gray-600">{member.gender}</p>
                            </div>
                            <span className="text-2xl">{member.gender === 'Male' ? '👨' : '👩'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">No members recorded yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center border-2 border-heritage-gold/20">
                <p className="text-4xl mb-4">👈</p>
                <p className="text-gray-600 text-lg">Select a clan to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClanDirectory;
