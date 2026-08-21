import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import GlassCard from '../components/common/GlassCard';
import { Trophy, Coins, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaders(res.data);
    } catch (error) {
      toast.error('Reytingni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 md:w-16 md:h-16 text-accent mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">Top O'yinchilar Reytingi</h2>
        <p className="text-sm md:text-base text-slate-400 mt-2">Eng boy va eng faol o'yinchilar ro'yxati</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {leaders.length > 0 ? (
            leaders.map((user, index) => {
              const isTop3 = index < 3;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={user.id} 
                  className={`flex items-center p-4 md:p-5 transition-colors hover:bg-slate-800/50 ${index === 0 ? 'bg-amber-500/10' : index === 1 ? 'bg-slate-300/10' : index === 2 ? 'bg-amber-700/10' : ''}`}
                >
                  <div className={`flex-shrink-0 mr-4 md:mr-6 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-black text-lg md:text-xl border-2
                    ${index === 0 ? 'bg-amber-500/20 text-accent border-accent shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 
                      index === 1 ? 'bg-slate-300/20 text-slate-300 border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.3)]' : 
                      index === 2 ? 'bg-amber-700/20 text-amber-600 border-amber-700 shadow-[0_0_15px_rgba(180,83,9,0.3)]' : 
                      'bg-slate-800/50 text-slate-500 border-slate-700'}
                  `}>
                    {index < 3 ? <Medal className="w-5 h-5 md:w-6 md:h-6" /> : index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex items-center space-x-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 border border-slate-700 p-0.5 overflow-hidden flex-shrink-0">
                      <img src={user.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${api.defaults.baseURL.replace('/api', '')}${user.profile_picture}`) : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} alt="avatar" className="w-full h-full object-cover bg-slate-900" />
                    </div>
                    <div>
                      <p className={`text-base md:text-lg font-bold truncate ${isTop3 ? 'text-white' : 'text-slate-200'}`}>
                        {user.username}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500 truncate capitalize font-medium">
                        {user.profession_name || 'Yangi Boshlovchi'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right ml-4">
                    <div className={`text-lg md:text-2xl font-black flex items-center justify-end ${isTop3 ? 'text-accent drop-shadow-md' : 'text-slate-300'}`}>
                      {Number(user.balance).toLocaleString()} <Coins className={`w-4 h-4 md:w-5 md:h-5 ml-1.5 ${isTop3 ? 'text-accent' : 'text-slate-400'}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-10 text-center text-slate-500 font-medium">
              Hozircha o'yinchilar yo'q.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Leaderboard;
