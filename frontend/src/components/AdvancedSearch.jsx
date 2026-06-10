import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { HeritageContext } from '../context/HeritageContext';

/**
 * AdvancedSearch - Comprehensive search and filter component
 * Allows filtering by multiple criteria
 */
const AdvancedSearch = ({ onResults }) => {
  const { individuals } = useContext(HeritageContext);
  const [clans, setClans] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    gender: '',
    clan: '',
    hasParents: '',
    hasChildren: '',
    hasAncestors: ''
  });

  useEffect(() => {
    const fetchClans = async () => {
      try {
        const response = await axios.get('/api/clans');
        setClans(response.data || []);
      } catch (err) {
        console.error('Could not load clans', err);
      }
    };

    fetchClans();
  }, []);

  const fallbackClans = [...new Set(individuals.map(p => p.clan_name))]
    .filter(Boolean)
    .sort()
    .map((name, index) => ({ id: index + 1, name }));

  const clanOptions = clans.length > 0 ? clans : fallbackClans;

  const applyFilters = () => {
    let results = individuals;

    // Name search
    if (filters.name) {
      results = results.filter(p =>
        p.full_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Gender filter
    if (filters.gender) {
      results = results.filter(p => p.gender === filters.gender);
    }

    // Clan filter
    if (filters.clan) {
      results = results.filter(p => p.clan_id === parseInt(filters.clan, 10));
    }

    // Has parents
    if (filters.hasParents === 'yes') {
      results = results.filter(p => p.father_id || p.mother_id);
    } else if (filters.hasParents === 'no') {
      results = results.filter(p => !p.father_id && !p.mother_id);
    }

    // Has children
    if (filters.hasChildren === 'yes') {
      results = results.filter(p =>
        individuals.some(child => child.father_id === p.id || child.mother_id === p.id)
      );
    } else if (filters.hasChildren === 'no') {
      results = results.filter(p =>
        !individuals.some(child => child.father_id === p.id || child.mother_id === p.id)
      );
    }

    onResults(results);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      name: '',
      gender: '',
      clan: '',
      hasParents: '',
      hasChildren: '',
      hasAncestors: ''
    };
    setFilters(emptyFilters);
    onResults(individuals);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-heritage-gold/20">
      <h3 className="text-xl font-bold text-heritage-dark mb-6 flex items-center gap-2">
        <span>🔍</span> Advanced Search
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Name Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Full Name</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-transparent"
          />
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">⚤ Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-transparent"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Clan Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">🏛️ Clan</label>
          <select
            value={filters.clan}
            onChange={(e) => handleFilterChange('clan', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-transparent"
          >
            <option value="">All Clans</option>
            {clanOptions.map(clan => (
              <option key={clan.id} value={clan.id}>{clan.name}</option>
            ))}
          </select>
        </div>

        {/* Has Parents */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍👩‍👧 Parents</label>
          <select
            value={filters.hasParents}
            onChange={(e) => handleFilterChange('hasParents', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="yes">Has Parents</option>
            <option value="no">Root Ancestors</option>
          </select>
        </div>

        {/* Has Children */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">👶 Children</label>
          <select
            value={filters.hasChildren}
            onChange={(e) => handleFilterChange('hasChildren', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-transparent"
          >
            <option value="">Any</option>
            <option value="yes">Has Children</option>
            <option value="no">No Children</option>
          </select>
        </div>

        {/* Placeholder */}
        <div className="text-gray-500 text-sm py-2">
          More filters coming soon...
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 bg-heritage-gold hover:bg-yellow-500 text-heritage-dark font-bold py-2 px-4 rounded-lg transition"
        >
          🔎 Search
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
        >
          ↻ Reset
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearch;
