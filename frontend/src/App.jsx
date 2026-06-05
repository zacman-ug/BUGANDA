import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import FamilyTree from './pages/FamilyTree';
import AddMemberForm from './components/AddMemberForm';
import HeritageStats from './components/HeritageStats';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import ClanDirectory from './pages/ClanDirectory';
import { HeritageContext } from './context/HeritageContext';
import Dashboard from './pages/Dashboard';

/**
 * App Component - Root with Routing
 */
function AppRoutes() {
  const { token } = useContext(HeritageContext);
  const location = useLocation();

  return (
    <Routes>
      {/* Home Page - Public */}
      <Route path="/" element={<Home />} />

      {/* Authentication Routes - Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Public Feature Routes */}
      <Route path="/clans" element={<ClanDirectory />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} />}
      />

      <Route
        path="/profile"
        element={token ? <UserProfile /> : <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} />}
      />

      <Route
        path="/admin"
        element={token ? <AdminDashboard /> : <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} />}
      />

      {/* Fallback redirect for authenticated users */}
      <Route
        path="/app"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;