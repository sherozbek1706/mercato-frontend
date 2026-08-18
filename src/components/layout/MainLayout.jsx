import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Home, ShoppingCart, Trophy, Settings, LogOut, Coins, Battery, Shield, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return <>{children}</>;

  const menuItems = [
    { path: '/', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
    { path: '/market', icon: <ShoppingCart className="w-5 h-5" />, label: 'Bozor' },
    { path: '/quests', icon: <ScrollText className="w-5 h-5" />, label: 'Davlat Buyurtmasi' },
    // { path: '/leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Reyting' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-surfaceSolid border-r border-slate-800 flex flex-col justify-between h-full shadow-2xl relative z-20"
      >
        <div>
          <div className="p-6 pb-2 border-b border-slate-800">
            <h1 className="text-3xl game-title text-center mb-2">MERCATO</h1>
            <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-bold">Simulator</p>
          </div>
          
          <div className="p-4 flex flex-col items-center border-b border-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-primary p-1 mb-3 relative animate-float">
               <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} alt="avatar" className="rounded-full w-full h-full object-cover bg-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <div className="flex items-center text-secondary text-sm mt-1 bg-secondary/10 px-3 py-1 rounded-full font-medium">
               <Shield className="w-4 h-4 mr-1" />
               {user.profession || 'Yangi boshlovchi'}
            </div>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center justify-center w-full space-x-2 text-slate-400 hover:text-danger hover:bg-danger/10 p-3 rounded-xl transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Topbar (Status Bar) */}
        <header className="h-20 bg-surfaceSolid/50 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between z-10">
           <div className="flex-1">
             <h2 className="text-xl font-bold text-slate-200 capitalize">{location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}</h2>
           </div>
           
           <div className="flex items-center space-x-8">
              {/* Energy Bar */}
              <div className="flex flex-col w-48">
                 <div className="flex justify-between text-xs font-bold mb-1">
                   <span className="text-slate-400 uppercase tracking-wider flex items-center"><Battery className="w-3 h-3 mr-1 text-green-400"/> Energiya</span>
                   <span className="text-green-400">{user.energy} / {user.max_energy}</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (user.energy / user.max_energy) * 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${user.energy < 20 ? 'bg-danger' : 'bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'}`}
                    />
                 </div>
              </div>

              {/* Balance */}
              <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl flex items-center space-x-2 shadow-inner">
                <Coins className="w-6 h-6 text-accent" />
                <span className="text-xl font-black text-white">{Number(user.balance).toFixed(2)}</span>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
           {/* Background decorative blobs */}
           <div className="fixed top-[20%] right-[10%] w-[30%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
           <div className="fixed bottom-[10%] left-[20%] w-[40%] h-[30%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
           
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="relative z-10"
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
