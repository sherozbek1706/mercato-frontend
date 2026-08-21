import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Market from './pages/Market';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import './index.css';
import socket from './services/socket';
import MainLayout from './components/layout/MainLayout';

import Quests from './pages/Quests';
import Leaderboard from './pages/Leaderboard';
import ProfessionModal from './components/modals/ProfessionModal';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfessions from './pages/admin/AdminProfessions';
import AdminItems from './pages/admin/AdminItems';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBots from './pages/admin/AdminBots';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStatistics from './pages/admin/AdminStatistics';
import AdminBotPurchases from './pages/admin/AdminBotPurchases';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="text-slate-400 text-center mt-20 font-medium">Yuklanmoqda...</div>;
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

const GlobalListener = () => {
  const { user, fetchUser } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;
    const handleItemSold = (data) => {
      toast.success(data.message, { 
        duration: 5000, 
        icon: '💰',
        style: { background: '#1e293b', color: '#fff', border: '1px solid #fbbf24' }
      });
      fetchUser();
    };

    socket.on('item_sold', handleItemSold);
    return () => {
      socket.off('item_sold', handleItemSold);
    };
  }, [user, fetchUser]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalListener />
        <ProfessionModal />
        <Routes>
          {/* Public & Player Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/market" element={<PrivateRoute><Market /></PrivateRoute>} />
          <Route path="/quests" element={<PrivateRoute><Quests /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="professions" element={<AdminProfessions />} />
            <Route path="items" element={<AdminItems />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="bots" element={<AdminBots />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="stats" element={<AdminStatistics />} />
            <Route path="bot-purchases" element={<AdminBotPurchases />} />
          </Route>
        </Routes>
        <Toaster position="top-right" toastOptions={{
          className: 'bg-surfaceSolid text-slate-200 border border-slate-700',
        }} />
      </Router>
    </AuthProvider>
  );
}

export default App;
