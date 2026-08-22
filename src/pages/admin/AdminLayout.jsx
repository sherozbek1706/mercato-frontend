import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, Briefcase, Box, LogOut, Settings, Bot, ScrollText, Star, Target, Flag } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menu = [
    { name: 'Foydalanuvchilar', path: '/admin/users', icon: <Users className="w-5 h-5 mr-2" /> },
    { name: 'Kasblar va Retseptlar', path: '/admin/professions', icon: <Briefcase className="w-5 h-5 mr-2" /> },
    { name: 'Mahsulotlar', path: '/admin/items', icon: <Box className="w-5 h-5 mr-2" /> },
    { name: 'Darajalar (Levels)', path: '/admin/levels', icon: <Star className="w-5 h-5 mr-2 text-yellow-500" /> },
    { name: 'Shoh Farmoni', path: '/admin/quests', icon: <Target className="w-5 h-5 mr-2 text-red-500" /> },
    { name: 'Qirollik Loyihasi', path: '/admin/global-quests', icon: <Flag className="w-5 h-5 mr-2 text-blue-500" /> },
    { name: 'Tizim Botlari', path: '/admin/bots', icon: <Bot className="w-5 h-5 mr-2" /> },
    { name: 'Davlat Buyurtmalari', path: '/admin/orders', icon: <ScrollText className="w-5 h-5 mr-2" /> },
    { name: 'Statistika', path: '/admin/stats', icon: <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { name: 'Bot Xaridlari', path: '/admin/bot-purchases', icon: <Bot className="w-5 h-5 mr-2" /> },
    { name: 'Sozlamalar', path: '/admin/settings', icon: <Settings className="w-5 h-5 mr-2" /> }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 absolute inset-0 z-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
