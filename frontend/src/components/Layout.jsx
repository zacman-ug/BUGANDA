import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeritageContext } from '../context/HeritageContext';

/**
 * Layout Component
 * @param {Object} props - children (page content), setView (function to change pages), currentView (the active page)
 */
const Layout = ({ children, setView, currentView, onFamilyTreeClick }) => {
  const { user, logout, hasRole } = useContext(HeritageContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-heritage-cream flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-gradient-to-b from-heritage-dark via-gray-900 to-black text-white p-6 shadow-2xl fixed h-full flex flex-col justify-between border-r-4 border-heritage-gold">
        {/* Header with decorative element */}
        <div>
          <div className="relative mb-10">
            <div className="absolute -left-6 -top-6 w-32 h-32 bg-heritage-gold opacity-5 rounded-full blur-3xl"></div>
            <Link
              to="/dashboard"
              className="text-2xl font-bold text-heritage-gold mb-10 border-b-2 border-heritage-gold pb-4 font-serif hover:text-yellow-300 transition block relative z-10"
            >
              ✦ Buganda Heritage
            </Link>
          </div>

          <ul className="space-y-3">
            {/* Home Link */}
            <li>
              <Link
                to="/"
                className="flex items-center space-x-3 text-gray-300 hover:text-heritage-gold hover:bg-gray-800 transition-all duration-200 p-3 rounded-lg group border-l-4 border-transparent hover:border-heritage-gold hover:pl-4"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
                <span className="font-semibold group-hover:text-heritage-gold">Home</span>
              </Link>
            </li>

            {/* Dashboard Link */}
            <li
              className={`flex items-center space-x-3 cursor-pointer transition-all duration-200 p-3 rounded-lg group border-l-4 ${
                currentView === 'tree'
                  ? 'text-heritage-gold bg-gray-800 border-heritage-gold pl-4'
                  : 'text-gray-300 hover:text-heritage-gold hover:bg-gray-800 border-transparent hover:border-heritage-gold hover:pl-4'
              }`}
              onClick={() => setView('tree')}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
              <span className="font-semibold">Dashboard</span>
            </li>

            {/* Family Tree Link */}
            <li
              className={`flex items-center space-x-3 cursor-pointer transition-all duration-200 p-3 rounded-lg group border-l-4 ${
                currentView === 'tree'
                  ? 'text-heritage-gold bg-gray-800 border-heritage-gold pl-4'
                  : 'text-gray-300 hover:text-heritage-gold hover:bg-gray-800 border-transparent hover:border-heritage-gold hover:pl-4'
              }`}
              onClick={onFamilyTreeClick || (() => setView('tree'))}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🌳</span>
              <span className="font-semibold">Family Tree</span>
            </li>

            {/* Add Record Link */}
            <li
              className={`flex items-center space-x-3 cursor-pointer transition-all duration-200 p-3 rounded-lg group border-l-4 ${
                currentView === 'add'
                  ? 'text-heritage-gold bg-gray-800 border-heritage-gold pl-4'
                  : 'text-gray-300 hover:text-heritage-gold hover:bg-gray-800 border-transparent hover:border-heritage-gold hover:pl-4'
              }`}
              onClick={() => setView('add')}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
              <span className="font-semibold">Add Record</span>
            </li>

            {/* Clan Directory Link */}
            <li>
              <Link
                to="/clans"
                className="flex items-center space-x-3 text-gray-300 hover:text-heritage-gold hover:bg-gray-800 transition-all duration-200 p-3 rounded-lg group border-l-4 border-transparent hover:border-heritage-gold hover:pl-4"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🏛️</span>
                <span className="font-semibold group-hover:text-heritage-gold">Clans Directory</span>
              </Link>
            </li>

            <li className="text-gray-500 text-xs mt-8 border-t border-gray-700 pt-4 italic flex items-center gap-2">
              <span>✨</span>
              Features
            </li>
          </ul>
        </div>

        {/* User Section at Bottom */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-bold text-white truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-heritage-gold mt-1">
              Role: {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Viewer'}
            </p>
          </div>

          {hasRole('admin') && (
            <Link
              to="/admin"
              className="block w-full text-center bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition text-sm"
            >
              👑 Admin Dashboard
            </Link>
          )}

          <Link
            to="/profile"
            className="block w-full text-center bg-heritage-gold text-white py-2 rounded-lg font-bold hover:bg-yellow-600 transition text-sm"
          >
            👤 Profile
          </Link>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-10 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;