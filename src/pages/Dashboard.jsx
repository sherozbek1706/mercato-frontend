import React, { useContext, useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import { Activity, Battery, Coins, Briefcase, Loader2, Play, Utensils, Zap, Package, Hammer, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [workClicks, setWorkClicks] = useState(0);
  const [eatClicks, setEatClicks] = useState(0);
  const [isWorkingAPI, setIsWorkingAPI] = useState(false);
  const [isEatingAPI, setIsEatingAPI] = useState(false);

  const workRequired = user?.settings?.work_clicks ? Number(user.settings.work_clicks) : 20;
  const eatRequired = user?.settings?.eat_clicks ? Number(user.settings.eat_clicks) : 10;

  const handleWork = async () => {
    if (isWorkingAPI || isEatingAPI) return;
    
    if (user.energy < (user.recipeDetails?.energy_cost || 10)) {
       return toast.error("Energiya yetarli emas");
    }

    const newClicks = workClicks + 1;
    setWorkClicks(newClicks);

    if (newClicks >= workRequired) {
      setIsWorkingAPI(true);
      try {
        const res = await api.post('/work');
        toast.success(res.data.message);
        fetchUser();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
      } finally {
        setWorkClicks(0);
        setIsWorkingAPI(false);
      }
    }
  };

  const handleEat = async () => {
    if (isWorkingAPI || isEatingAPI) return;

    const newClicks = eatClicks + 1;
    setEatClicks(newClicks);
    
    if (newClicks >= eatRequired) {
      setIsEatingAPI(true);
      try {
        const res = await api.post('/work/eat');
        toast.success(res.data.message);
        fetchUser();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
      } finally {
        setEatClicks(0);
        setIsEatingAPI(false);
      }
    }
  };

  if (!user) return null;

  // Inventory logic
  const inventorySlots = Array(16).fill(null); // Fixed 16 slots like RPG bag
  if (user.inventory) {
    user.inventory.forEach((item, index) => {
      if (index < 16) inventorySlots[index] = item;
    });
  }

  const getItemIcon = (item) => {
    if (item && item.icon) return item.icon;
    return '📦';
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassCard delay={0.1} className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <h3 className="text-sm uppercase tracking-wider text-primary font-bold mb-4 flex items-center">
            <Hammer className="w-4 h-4 mr-2" /> Ishlash qismi
          </h3>
          
          <button 
            onClick={handleWork} 
            disabled={isWorkingAPI || isEatingAPI || user.energy < (user.recipeDetails?.energy_cost || 10)}
            className="w-full relative bg-surfaceSolid border border-primary/50 hover:border-primary rounded-xl h-24 flex items-center justify-center overflow-hidden transition-all group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
          >
            {workClicks > 0 && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(workClicks / workRequired) * 100}%` }}
                className="absolute left-0 top-0 bottom-0 bg-primary/20"
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center">
              {isWorkingAPI ? (
                <>
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-1" />
                  <span className="font-bold text-primary">Ishlanmoqda...</span>
                </>
              ) : user.energy < (user.recipeDetails?.energy_cost || 10) ? (
                <>
                  <Zap className="w-8 h-8 text-danger mb-1 opacity-50" />
                  <span className="font-bold text-slate-500">Energiya yetarli emas</span>
                </>
              ) : (
                <>
                  <Play className="w-8 h-8 text-primary mb-1 transform group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white text-[10px] md:text-lg sm:text-xs tracking-widest uppercase">
                    {workClicks > 0 ? `Bosing (${workClicks}/${workRequired})` : 'Yaratish'}
                  </span>
                  <span className="text-xs text-primary">- {user.recipeDetails?.energy_cost || 10} Energiya</span>
                </>
              )}
            </div>
          </button>
        </GlassCard>

        <GlassCard delay={0.2} className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent pointer-events-none" />
          <h3 className="text-sm uppercase tracking-wider text-success font-bold mb-4 flex items-center">
            <Utensils className="w-4 h-4 mr-2" /> Oziqlanish
          </h3>
          
          <button 
            onClick={handleEat} 
            disabled={isWorkingAPI || isEatingAPI}
            className="w-full relative bg-surfaceSolid border border-success/50 hover:border-success rounded-xl h-24 flex items-center justify-center overflow-hidden transition-all group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
          >
            {eatClicks > 0 && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(eatClicks / eatRequired) * 100}%` }}
                className="absolute left-0 top-0 bottom-0 bg-success/20"
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center">
              {isEatingAPI ? (
                <>
                  <Loader2 className="w-8 h-8 text-success animate-spin mb-1" />
                  <span className="font-bold text-success">Ovqatlanilmoqda...</span>
                </>
              ) : (
                <>
                  <Utensils className="w-8 h-8 text-success mb-1 transform group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white text-[10px] md:text-lg sm:text-xs tracking-widest uppercase">
                     {eatClicks > 0 ? `Bosing (${eatClicks}/${eatRequired})` : 'Non yeyish'}
                  </span>
                  <span className="text-xs text-success">+ 50 Energiya</span>
                </>
              )}
            </div>
          </button>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Inventory Bag */}
        <GlassCard delay={0.3} className="xl:col-span-2 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg md:text-2xl font-black text-white flex items-center tracking-wider">
              <Package className="mr-2 md:mr-3 text-accent w-5 h-5 md:w-6 md:h-6" /> Mening Xaltam
            </h2>
            <div className="text-[10px] md:text-sm text-slate-400 bg-slate-900 px-2 md:px-3 py-1 rounded-full border border-slate-700">
              {user.inventory?.length || 0} / 16 Slot
            </div>
          </div>
          
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {inventorySlots.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                    item 
                    ? 'bg-surfaceSolid border border-slate-600 hover:border-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                    : 'bg-slate-800/40 border border-slate-800 border-dashed'
                  }`}
                  title={item ? `${item.name} (${item.quantity} ta)` : 'Bo\'sh slot'}
                >
                  {item ? (
                    <>
                      <span className="text-3xl mb-1 filter drop-shadow-md">{getItemIcon(item)}</span>
                      <span className="absolute bottom-1 right-1 bg-slate-900 text-white text-[10px] font-bold px-1.5 rounded border border-slate-700">
                        x{item.quantity}
                      </span>
                    </>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
        
        {/* Profession Details */}
        <GlassCard delay={0.4} className="min-h-[400px]">
          <h2 className="text-lg md:text-xl font-bold text-white mb-6 flex items-center border-b border-slate-700 pb-4">
            <Briefcase className="mr-2 text-secondary w-5 h-5 md:w-6 md:h-6" /> 
            <span>{user.profession || 'Noma\'lum'}</span>
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">Retsept (Nima kerak)</h3>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-400">⚡ Energiya</span>
                   <span className="text-danger font-bold">-{user.recipeDetails?.energy_cost || 10}</span>
                </div>
                {user.recipeDetails?.consume?.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center"><span className="mr-2 opacity-70">{getItemIcon(c)}</span> {c.name}</span>
                    <span className="text-danger font-bold">-{c.qty}</span>
                  </div>
                ))}
                {(!user.recipeDetails?.consume || user.recipeDetails.consume.length === 0) && (
                  <div className="text-xs text-slate-500 italic mt-2">Boshqa xomashyo talab qilinmaydi.</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold">Natija (Nima olinadi)</h3>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
                {user.recipeDetails?.produce?.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-primary font-medium flex items-center"><span className="mr-2">{getItemIcon(p)}</span> {p.name}</span>
                    <span className="text-success font-bold">+{p.qty}</span>
                  </div>
                ))}
                {(!user.recipeDetails?.produce || user.recipeDetails.produce.length === 0) && (
                  <div className="text-xs text-slate-500 italic">Hech narsa ishlab chiqarmaydi.</div>
                )}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-bold flex items-center">
                <Search className="w-3 h-3 mr-1" /> Bozor holati (Kalkulyator)
              </h3>
              
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                <div className="space-y-3 mb-4">
                  {user.recipeDetails?.consume?.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-400">
                      <span>{c.name} x{c.qty} <span className="opacity-50">({c.avg_price ? Number(c.avg_price).toFixed(2) : '0'} dan)</span></span>
                      <span className="text-danger font-bold">-{(c.qty * (c.avg_price || 0)).toFixed(2)} <Coins className="w-3 h-3 inline ml-0.5 text-slate-500"/></span>
                    </div>
                  ))}
                  
                  {user.recipeDetails?.produce?.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-400">
                      <span>{p.name} x{p.qty} <span className="opacity-50">sotish narxi ({p.avg_price ? Number(p.avg_price).toFixed(2) : '0'})</span></span>
                      <span className="text-success font-bold">+{(p.qty * (p.avg_price || 0)).toFixed(2)} <Coins className="w-3 h-3 inline ml-0.5 text-slate-500"/></span>
                    </div>
                  ))}
                </div>
                
                {(() => {
                  const cost = user.recipeDetails?.consume?.reduce((acc, c) => acc + (c.qty * (c.avg_price || 0)), 0) || 0;
                  const revenue = user.recipeDetails?.produce?.reduce((acc, p) => acc + (p.qty * (p.avg_price || 0)), 0) || 0;
                  const profit = revenue - cost;
                  return (
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-sm text-slate-300 font-bold">Sof foyda (1 ta sikl)</span>
                      <span className={`text-lg font-black flex items-center ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {profit > 0 ? '+' : ''}{profit.toFixed(2)} <Coins className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
              <p className="text-sm text-accent/80 font-medium">💡 Maslahat: Retsept ostidagi kalkulyator orqali bozordagi hozirgi narxlar asosida foyda yo zararni ko'rishingiz mumkin.</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
