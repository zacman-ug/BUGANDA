import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set axios base URL from environment variable (Vite exposes vars as import.meta.env)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const HeritageContext = createContext();

export const HeritageProvider = ({ children }) => {
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Set axios default headers with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Listen for auth events (from other parts of the app) and storage changes
  useEffect(() => {
    const onAuthLogin = (e) => {
      const detail = e.detail || {};
      if (detail.token) {
        setToken(detail.token);
      }
      if (detail.user) {
        setUser(detail.user);
      }
    };

    const onStorage = () => {
      const t = localStorage.getItem('token');
      const u = localStorage.getItem('user');
      setToken(t);
      setUser(u ? JSON.parse(u) : null);
    };

    window.addEventListener('auth:login', onAuthLogin);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth:login', onAuthLogin);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Fetch data from our Node.js Backend
  const fetchHeritageData = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/api/individuals');
      setIndividuals(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHeritageData();
    } else {
      setIndividuals([]);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIndividuals([]);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Check if user has specific role(s)
  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Check if user has permission for actions
  const canCreateRecord = () => hasRole(['admin', 'contributor', 'moderator']);
  const canEditRecord = () => hasRole(['admin', 'contributor', 'moderator']);
  const canDeleteRecord = () => hasRole(['admin']);
  const canApproveRecord = () => hasRole(['admin', 'moderator']);
  const canManageUsers = () => hasRole(['admin']);
  const canExportData = () => hasRole(['admin', 'contributor', 'moderator']);

  return (
    <HeritageContext.Provider value={{
      individuals,
      fetchHeritageData,
      loading,
      token,
      setToken,
      user,
      setUser,
      logout,
      hasRole,
      canCreateRecord,
      canEditRecord,
      canDeleteRecord,
      canApproveRecord,
      canManageUsers,
      canExportData
    }}>
      {children}
    </HeritageContext.Provider>
  );
};