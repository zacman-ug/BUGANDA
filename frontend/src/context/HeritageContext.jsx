import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const HeritageContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
});

export function HeritageProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('heritage_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('heritage_token'));
  const [individuals, setIndividuals] = useState([]);
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIndividuals([]);
    setClans([]);
    localStorage.removeItem('heritage_token');
    localStorage.removeItem('heritage_user');
  }, []);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('heritage_token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('heritage_token', data.token);
    localStorage.setItem('heritage_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/api/auth/register', formData);
    return data;
  };

  const fetchIndividuals = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/individuals');
      setIndividuals(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchClans = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get('/api/clans');
    setClans(data);
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchIndividuals();
      fetchClans();
    }
  }, [token, fetchIndividuals, fetchClans]);

  const hasRole = (roles) => user && roles.includes(user.role);

  const canCreateRecord = () => hasRole(['admin', 'contributor']);
  const canEditRecord = () => hasRole(['admin', 'contributor']);
  const canDeleteRecord = () => hasRole(['admin', 'contributor']);

  const value = {
    user,
    token,
    individuals,
    clans,
    loading,
    api,
    login,
    logout,
    register,
    fetchIndividuals,
    fetchClans,
    hasRole,
    canCreateRecord,
    canEditRecord,
    canDeleteRecord,
    setIndividuals
  };

  return (
    <HeritageContext.Provider value={value}>
      {children}
    </HeritageContext.Provider>
  );
}

export function useHeritage() {
  const context = useContext(HeritageContext);
  if (!context) {
    throw new Error('useHeritage must be used within HeritageProvider');
  }
  return context;
}
