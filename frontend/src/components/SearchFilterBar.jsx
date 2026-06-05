import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchFilterBar = ({ data, onFilteredDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClan, setFilterClan] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterOccupation, setFilterOccupation] = useState('');
  const [clans, setClans] = useState([]);
  const [occupations, setOccupations] = useState([]);

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
    if (data && data.length > 0) {
      const uniqueOccupations = [...new Set(data.map(p => p.occupation).filter(Boolean))];
      setOccupations(uniqueOccupations);
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;

    let filtered = data;

    // Search by full name or alternative name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.full_name.toLowerCase().includes(term) ||
          (p.alternative_name && p.alternative_name.toLowerCase().includes(term)) ||
          (p.occupation && p.occupation.toLowerCase().includes(term)) ||
          (p.residence && p.residence.toLowerCase().includes(term))
      );
    }

    // Filter by clan
    if (filterClan) {
      filtered = filtered.filter(p => p.clan_id === parseInt(filterClan));
    }

    // Filter by gender
    if (filterGender) {
      filtered = filtered.filter(p => p.gender === filterGender);
    }

    // Filter by occupation
    if (filterOccupation) {
      filtered = filtered.filter(p => p.occupation === filterOccupation);
    }

    onFilteredDataChange(filtered);
  }, [searchTerm, filterClan, filterGender, filterOccupation, data]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterClan('');
    setFilterGender('');
    setFilterOccupation('');
  };

  return (
    <div className="relative animate-slide-up mb-8">
      {/* Decorative top accent */}
      <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-heritage-gold to-transparent rounded-full"></div>
      
      <div className="bg-gradient-to-br from-white via-heritage-light to-white p-8 rounded-2xl shadow-heritage border-2 border-heritage-gold/20 hover:border-heritage-gold/40 transition-all duration-300 group overflow-hidden relative">
        {/* Background decorative element */}
        <div className="absolute top-4 right-4 text-heritage-gold text-opacity-10 text-6xl font-serif font-bold">🔎</div>
        
        <h3 className="text-2xl font-bold mb-6 text-heritage-dark font-serif relative z-10 flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-heritage-dark to-heritage-gold">Search & Discover</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10">
          {/* Search Bar */}
          <div className="lg:col-span-2 relative group/search">
            <input
              type="text"
              placeholder="Search by name, clan, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all bg-white hover:border-heritage-gold/50 group-hover/search:border-heritage-gold/40"
            />
            <span className="absolute right-4 top-4 text-heritage-gold opacity-60 group-hover/search:opacity-100 transition-opacity">🔍</span>
          </div>

          {/* Clan Filter */}
          <div className="group/filter">
            <select
              value={filterClan}
              onChange={(e) => setFilterClan(e.target.value)}
              className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 bg-white focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all hover:border-heritage-gold/50 group-hover/filter:border-heritage-gold/40"
            >
              <option value="">🏛️ All Clans</option>
              {clans.map(clan => (
                <option key={clan.id} value={clan.id}>🏛️ {clan.name}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="group/filter">
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 bg-white focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all hover:border-heritage-gold/50 group-hover/filter:border-heritage-gold/40"
            >
              <option value="">👥 All</option>
              <option value="Male">♂️ Male</option>
              <option value="Female">♀️ Female</option>
            </select>
          </div>

          {/* Occupation Filter */}
          <div className="group/filter">
            <select
              value={filterOccupation}
              onChange={(e) => setFilterOccupation(e.target.value)}
              className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 bg-white focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all hover:border-heritage-gold/50 group-hover/filter:border-heritage-gold/40"
            >
              <option value="">👔 Any Role</option>
              {occupations.map((occ, idx) => (
                <option key={idx} value={occ}>👔 {occ}</option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <div>
            <button
              onClick={handleClearFilters}
              className="relative overflow-hidden w-full bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold py-4 px-4 rounded-xl hover:shadow-lg transition-all duration-300 group before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300"
            >
              <span className="relative z-10 group-hover:text-gray-600 transition-colors duration-300 flex items-center justify-center gap-2">
                ✕ Reset
              </span>
            </button>
          </div>
        </div>

        {/* Active filters display */}
        <div className="mt-6 pt-6 border-t-2 border-heritage-gold/20 flex flex-wrap gap-3 items-center relative z-10">
          <span className="text-sm font-semibold text-heritage-dark font-serif">✨ Active Filters:</span>
          {searchTerm && (
            <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border-2 border-blue-200 hover:shadow-md transition-all">
              🔍 "{searchTerm}"
            </span>
          )}
          {filterClan && (
            <span className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold border-2 border-purple-200 hover:shadow-md transition-all">
              🏛️ {clans.find(c => c.id === parseInt(filterClan))?.name}
            </span>
          )}
          {filterGender && (
            <span className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border-2 border-green-200 hover:shadow-md transition-all">
              {filterGender === "Male" ? "♂️" : "♀️"} {filterGender}
            </span>
          )}
          {filterOccupation && (
            <span className="bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold border-2 border-yellow-200 hover:shadow-md transition-all">
              👔 {filterOccupation}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
