import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Home, ShoppingCart, Trophy, Settings, LogOut, Coins, Battery, Shield, ScrollText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MainLayout = ({ children }) => {
  const { user, logout, fetchUser } = useContext(AuthContext);
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const cost = user?.settings?.profile_picture_cost ? Number(user.settings.profile_picture_cost) : 0;
  const removeRefund = user?.settings?.profile_picture_remove_coin ? Number(user.settings.profile_picture_remove_coin) : 0;

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (user.profile_picture) {
      toast.error("Avval eski rasmni o'chirishingiz kerak!");
      e.target.value = '';
      return;
    }

    if (user.balance < cost) {
      toast.error(`Hisobingizda yetarli mablag' yo'q. Rasm yuklash narxi: ${cost} tanga`);
      e.target.value = '';
      return;
    }
    
    if (!window.confirm(`Profil rasmini o'rnatish narxi ${cost} tanga. Rozimisiz?`)) {
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    setIsUploading(true);
    try {
      const res = await api.post('/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(res.data.message);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleProfilePicRemove = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Rasmni o'chirsangiz ${removeRefund} tanga hisobingizga qaytariladi. Rozimisiz?`)) return;
    
    setIsUploading(true);
    try {
      const res = await api.delete('/auth/profile-picture');
      toast.success(res.data.message);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return <>{children}</>;

  const menuItems = [
    { path: '/', icon: <Home className="w-5 h-5 md:w-5 md:h-5" />, label: 'Dashboard' },
    { path: '/market', icon: <ShoppingCart className="w-5 h-5 md:w-5 md:h-5" />, label: 'Bozor' },
    { path: '/quests', icon: <ScrollText className="w-5 h-5 md:w-5 md:h-5" />, label: 'Buyurtma' },
    { path: '/leaderboard', icon: <Trophy className="w-5 h-5 md:w-5 md:h-5" />, label: 'Reyting' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="hidden md:flex w-64 bg-surfaceSolid border-r border-slate-800 flex-col justify-between h-full shadow-2xl relative z-20"
      >
        <div>
          <div className="p-6 pb-2 border-b border-slate-800">
            <h1 className="text-3xl game-title text-center mb-2">MERCATO</h1>
            <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-bold">Simulator</p>
          </div>
          
          <div className="p-4 flex flex-col items-center border-b border-slate-800">
            <div 
              className={`w-20 h-20 rounded-full bg-slate-800 border-2 border-primary p-1 mb-3 relative animate-float group ${!isUploading && !user.profile_picture ? 'cursor-pointer' : ''}`}
              onClick={() => !isUploading && !user.profile_picture && document.getElementById('profile-pic-upload').click()}
            >
               {isUploading ? (
                 <div className="rounded-full w-full h-full bg-slate-900 flex items-center justify-center">
                   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : (
                 <>
                   <img 
                     src={user.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${api.defaults.baseURL.replace('/api', '')}${user.profile_picture}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
                     alt="avatar" 
                     className="rounded-full w-full h-full object-cover bg-slate-900" 
                   />
                   {!user.profile_picture && (
                     <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[10px] text-white text-center font-bold px-2">{cost > 0 ? `Rasm yuklash (${cost} 🪙)` : 'Rasm yuklash'}</span>
                     </div>
                   )}
                 </>
               )}
               <input 
                 type="file" 
                 id="profile-pic-upload" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleProfilePicUpload} 
                 disabled={isUploading}
               />
               {user.profile_picture && !isUploading && (
                 <button 
                   onClick={handleProfilePicRemove}
                   className="absolute -top-1 -right-1 bg-danger text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                   title="Rasmni o'chirish"
                 >
                   <X className="w-3 h-3" />
                 </button>
               )}
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
        <header className="h-16 md:h-20 bg-surfaceSolid/50 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 flex items-center justify-between z-10 shrink-0">
           <div className="flex-1 hidden md:block">
             <h2 className="text-xl font-bold text-slate-200 capitalize">{location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}</h2>
           </div>
           
           <div className="flex-1 md:hidden flex items-center space-x-3">
             <div 
               className={`w-10 h-10 rounded-full bg-slate-800 border-2 border-primary p-0.5 relative group ${!isUploading && !user.profile_picture ? 'cursor-pointer' : ''}`}
               onClick={() => !isUploading && !user.profile_picture && document.getElementById('profile-pic-upload').click()}
             >
                {isUploading ? (
                  <div className="rounded-full w-full h-full bg-slate-900 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <img 
                      src={user.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${api.defaults.baseURL.replace('/api', '')}${user.profile_picture}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
                      alt="avatar" 
                      className="rounded-full w-full h-full object-cover bg-slate-900" 
                    />
                    {!user.profile_picture && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white">+</span >
                      </div>
                    )}
                  </>
                )}
                {user.profile_picture && !isUploading && (
                  <button 
                    onClick={handleProfilePicRemove}
                    className="absolute -top-1 -right-1 bg-danger text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
             </div>
             <h1 className="text-xl game-title text-primary tracking-widest">MERCATO</h1>
           </div>
           
           <div className="flex items-center space-x-3 md:space-x-8">
              {/* Energy Bar */}
              <div className="flex flex-col w-24 md:w-48">
                 <div className="flex justify-between text-[10px] md:text-xs font-bold mb-1">
                   <span className="text-slate-400 uppercase tracking-wider flex items-center hidden sm:flex"><Battery className="w-3 h-3 mr-1 text-green-400"/> Energiya</span>
                   <span className="text-green-400 sm:hidden"><Battery className="w-3 h-3 mr-1 inline"/></span>
                   <span className="text-green-400">{user.energy}/{user.max_energy}</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2 md:h-3 border border-slate-700 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (user.energy / user.max_energy) * 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${user.energy < 20 ? 'bg-danger' : 'bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'}`}
                    />
                 </div>
              </div>

              {/* Balance */}
              <div className="bg-slate-900 border border-slate-700 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center space-x-1 md:space-x-2 shadow-inner">
                <Coins className="w-4 h-4 md:w-6 md:h-6 text-accent" />
                <span className="text-sm md:text-xl font-black text-white">{Number(user.balance).toFixed(2)}</span>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative scroll-smooth">
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-surfaceSolid/90 backdrop-blur-lg border-t border-slate-800 z-50 flex justify-around items-center py-2 px-1 pb-safe">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <div className={`${isActive ? 'bg-primary/20 p-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'p-1.5'}`}>
                 {item.icon}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          )
        })}
        <button 
          onClick={logout} 
          className="flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 text-slate-400 hover:text-danger"
        >
          <div className="p-1.5">
             <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-medium">Chiqish</span>
        </button>
      </div>
    </div>
  );
};

export default MainLayout;
