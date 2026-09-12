import { Routes, Route, Navigate } from 'react-router-dom';

import { useHeritage } from './context/HeritageContext';

import Home from './pages/Home';

import Login from './pages/Login';

import Register from './pages/Register';

import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';

import AdminDashboard from './pages/AdminDashboard';

import ClanDirectory from './pages/ClanDirectory';

import FamilyTree from './pages/FamilyTree';

import HeritageHub from './pages/HeritageHub';

import UserProfile from './pages/UserProfile';



function ProtectedRoute({ children }) {

  const { token } = useHeritage();

  return token ? children : <Navigate to="/login" replace />;

}



function AdminRoute({ children }) {

  const { token, user } = useHeritage();

  if (!token) return <Navigate to="/login" replace />;

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;

}



function App() {

  return (

    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/clans" element={<ClanDirectory />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/family-tree" element={<ProtectedRoute><FamilyTree fullView /></ProtectedRoute>} />
      <Route path="/heritage" element={<ProtectedRoute><HeritageHub /></ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );

}



export default App;

