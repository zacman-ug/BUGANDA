import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';
import { useToast } from '../components/Toast';
import ClanStoryPanel from '../components/heritage/ClanStoryPanel';
import PersonPhoto from '../components/PersonPhoto';

/**
 * ClanDirectory - Browse and explore all clans
 * Shows clan members, totems, and information
 */
const ClanDirectory = () => {
  const navigate = useNavigate();
  const { individuals = [], token, clans: contextClans, api } = useHeritage();
  const { show: showToast, ToastContainer } = useToast();
  const [clans, setClans] = useState([]);
  const [selectedClan, setSelectedClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (contextClans.length > 0) {
      setClans(contextClans);
      setLoading(false);
      return;
    }

    if (hasInitialized.current || !token) {
      if (!token) setLoading(false);
      return;
    }
    hasInitialized.current = true;

    const fetchClans = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/clans');
        setClans(data || []);
      } catch (err) {
        console.error('Failed to load clans:', err);
        showToast('Failed to load clan directory', 'error');
        setClans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClans();
  }, [api, contextClans, showToast, token]);

  // Enrich clans with member data when individuals or clans change
  const enrichedClans = clans.map(clan => ({
    ...clan,
    memberCount: individuals.filter(p => p.clan_id === clan.id).length,
    members: individuals.filter(p => p.clan_id === clan.id)
  })).sort((a, b) => b.memberCount - a.memberCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-heritage-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-gold mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading clan directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-cream to-white">
      {/* Navbar */}
      <nav className="bg-heritage-dark bg-opacity-95 text-white p-6 flex justify-between items-center shadow-2xl">
        <div className="flex items-center space-x-3">
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
            Buganda Clans Directory
          </h1>
          <p className="text-gray-600 text-lg">Explore the {enrichedClans.length} great clans of Buganda</p>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
            Shared Buganda cultural heritage is public here. Sign in to connect your private family lineage to these clans.
          </p>
          {token && (
            <Link to="/heritage" className="inline-block mt-4 text-heritage-gold font-semibold hover:underline">
              Open your Heritage Experience →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clan List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-heritage-gold/20">
              <div className="bg-gradient-to-r from-heritage-dark to-black text-white p-4">
                <h2 className="font-bold text-lg">
                  All Clans ({enrichedClans.length})
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
                      <p className="font-semibold text-heritage-dark">{clan.name}</p>
                      {clan.totem && (
                        <p className="text-xs text-heritage-gold mt-0.5">Totem: {clan.totem}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{clan.memberCount} members</p>
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
          <div className="lg:col-span-2 space-y-4">
            {selectedClan ? (
              <>
                <ClanStoryPanel
                  clan={selectedClan}
                  memberCount={selectedClan.memberCount}
                  isPublic={!token}
                />

                {token && selectedClan.members && selectedClan.members.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-heritage-gold/20 p-6">
                    <h3 className="font-bold text-xl text-heritage-dark mb-4">
                      Your lineage in {selectedClan.name}
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedClan.members.map((member) => (
                        <div key={member.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-heritage-gold/50 transition flex items-center gap-3">
                          {member.photo_url ? (
                            <PersonPhoto src={member.photo_url} alt={member.full_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="w-10 h-10 rounded-full bg-heritage-cream flex items-center justify-center text-xs font-bold text-heritage-dark">
                              {member.gender === 'Male' ? 'M' : 'F'}
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-heritage-dark">{member.full_name}</p>
                            <p className="text-sm text-gray-600">{member.gender}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!token && (
                  <div className="bg-heritage-cream rounded-lg p-4 text-center text-sm text-gray-600">
                    <Link to="/login" className="text-heritage-gold font-semibold hover:underline">Sign in</Link>
                    {' '}to see how your private lineage connects to this clan.
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center border-2 border-heritage-gold/20">
                <p className="text-gray-600 text-lg">Select a clan from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClanDirectory;
