import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Pickaxe, Tractor, Hammer, ShieldAlert, ArrowRight, Loader2, Info } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const getProfessionIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('konchi')) return <Pickaxe className="w-8 h-8 text-slate-300" />;
  if (n.includes('dehqon')) return <Tractor className="w-8 h-8 text-green-400" />;
  if (n.includes('ishchi') || n.includes('usta')) return <Hammer className="w-8 h-8 text-orange-400" />;
  return <Briefcase className="w-8 h-8 text-primary" />;
};

const getProfessionDescription = (name) => {
  const n = name.toLowerCase();
  if (n.includes('konchi')) return "Temir, ko'mir kabi qimmatbaho rudalarni qazib olasiz. Xomashyoga ehtiyojingiz yo'q, lekin ko'p energiya sarflaysiz.";
  if (n.includes('dehqon')) return "Bug'doy, paxta va boshqa ekinlarni yetishtirasiz. Ishlab chiqarish zanjirining eng muhim bo'g'ini hisoblanasiz.";
  if (n.includes('novvoy')) return "Dehqonlardan bug'doy sotib olib, barcha o'yinchilar uchun zarur bo'lgan NON pishirasiz. Doimiy daromad kafolatlangan.";
  if (n.includes('temirchi')) return "Konchilardan ruda sotib olib, kerakli qurollar, asbob-uskunalar yasaysiz.";
  if (n.includes('tikuvchi')) return "Dehqonlardan paxta sotib olib, kiyim-kechaklar tikasiz.";
  return "Sarguzashtingiz uchun kerakli kasbni tanlang.";
};

const ProfessionModal = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfId, setSelectedProfId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !user.profession_id) {
      fetchProfessions();
    }
  }, [user]);

  const fetchProfessions = async () => {
    try {
      const res = await api.get('/professions');
      setProfessions(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Kasblarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    if (!selectedProfId) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/auth/set-profession', { profession_id: selectedProfId });
      toast.success('Kasb muvaffaqiyatli tanlandi! O\'yinni boshlashingiz mumkin.', { duration: 4000 });
      await fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
      setIsSubmitting(false);
    }
  };

  if (!user || user.profession_id) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-slate-950/80">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 relative border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border-2 border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-4"
            >
              <Briefcase className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3">
              Yo'nalishingizni Tanlang
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Mercato iqtisodiyotida o'z o'rningizni toping. Har bir kasbning o'ziga xos afzalliklari va bozordagi roli bor.
            </p>
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-8 flex gap-3 text-amber-200/90 text-sm">
            <Info className="w-5 h-5 shrink-0 text-amber-500" />
            <p><strong>Diqqat:</strong> Kasbni faqat bir marta tanlash mumkin. O'z qaroringizni qabul qilishdan oldin har bir kasbning ishlab chiqarish zanjiridagi o'rnini o'ylab ko'ring.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-slate-400 animate-pulse">Kasblar ro'yxati yuklanmoqda...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {professions.map((prof) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={prof.id}
                  onClick={() => setSelectedProfId(prof.id)}
                  className={`relative p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300 overflow-hidden ${
                    selectedProfId === prof.id 
                      ? 'bg-primary/10 border-primary shadow-[0_0_25px_rgba(59,130,246,0.25)]' 
                      : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  {selectedProfId === prof.id && (
                    <div className="absolute top-0 right-0 p-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute"></div>
                      <div className="w-3 h-3 bg-primary rounded-full relative"></div>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 bg-slate-800/80 rounded-xl shadow-inner border border-slate-700">
                      {getProfessionIcon(prof.name)}
                    </div>
                    <h3 className={`text-xl font-black uppercase tracking-wider mb-2 ${selectedProfId === prof.id ? 'text-primary' : 'text-white'}`}>
                      {prof.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 h-16 line-clamp-3">
                      {getProfessionDescription(prof.name)}
                    </p>
                    
                    <div className="w-full space-y-1.5 mt-auto">
                      <div className="flex justify-between items-center text-xs bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Energiya sarfi:</span>
                        <span className="font-bold text-danger">-{prof.energy_cost}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Talab qiladi:</span>
                        <span className="font-bold text-accent">
                          {(() => {
                            try {
                              const c = JSON.parse(prof.consume || '[]');
                              return c.length ? 'Xomashyo' : 'Hech narsa';
                            } catch { return 'Noma\'lum'; }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-700/50">
            <p className="text-sm text-slate-400 font-medium">
              {selectedProfId ? (
                <span className="text-primary flex items-center"><ShieldAlert className="w-4 h-4 mr-1.5"/> Sizning tanlovingiz tayyor</span>
              ) : (
                'Davom etish uchun kasblardan birini tanlang'
              )}
            </p>
            <button
              onClick={handleSelect}
              disabled={!selectedProfId || isSubmitting}
              className={`px-8 py-3 rounded-xl font-bold flex items-center justify-center transition-all duration-300 min-w-[200px] ${
                selectedProfId && !isSubmitting
                  ? 'bg-primary hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Tasdiqlanmoqda...</>
              ) : (
                <>O'yinni Boshlash <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfessionModal;
