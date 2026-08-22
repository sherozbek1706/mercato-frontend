import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Target, Flag, Coins, Star, Package, ShieldCheck, Crown, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Quests() {
  const { user, fetchUser } = useContext(AuthContext);
  const [personalQuest, setPersonalQuest] = useState(null);
  const [globalQuests, setGlobalQuests] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [contributeModal, setContributeModal] = useState({ isOpen: false, gqId: null, itemId: null, myQty: 0 });
  const [contributeQty, setContributeQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [questRes, itemRes] = await Promise.all([
        api.get('/quests'),
        api.get('/items')
      ]);
      setPersonalQuest(questRes.data.personal);
      setGlobalQuests(questRes.data.global);
      setItems(itemRes.data);
      setLoading(false);
    } catch (e) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
      setLoading(false);
    }
  };

  const getItemDetails = (itemId) => {
    const item = items.find(i => i.id === itemId);
    return item ? { name: item.name, icon: item.icon } : { name: `Noma'lum (${itemId})`, icon: '📦' };
  };

  const getUserItemQty = (itemId) => {
    const item = user?.inventory?.find(i => i.item_id === itemId);
    return item ? item.quantity : 0;
  };

  const checkCanComplete = () => {
    if (!personalQuest || !personalQuest.required_items) return false;
    for (let req of personalQuest.required_items) {
      if (getUserItemQty(req.item_id) < req.qty) return false;
    }
    return true;
  };

  const completePersonal = async (id) => {
    try {
      const res = await api.post('/quests/complete', { quest_id: id });
      toast.success(res.data.message, { icon: '👑' });
      fetchUser();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const openContributeModal = (gqId, itemId, myQty, coinPerItem, xpPerItem) => {
    setContributeModal({ isOpen: true, gqId, itemId, myQty, coinPerItem, xpPerItem });
    setContributeQty('');
  };

  const confirmContribute = async () => {
    const qty = parseInt(contributeQty);
    if(isNaN(qty) || qty <= 0) return toast.error("Noto'g'ri miqdor");
    if(qty > contributeModal.myQty) return toast.error("Sizda buncha mahsulot yo'q!");
    
    setIsSubmitting(true);
    try {
      const res = await api.post('/quests/contribute', { global_quest_id: contributeModal.gqId, item_id: contributeModal.itemId, qty });
      
      const coins = res.data.earnedCoins ? res.data.earnedCoins.toFixed(1) : 0;
      const xp = res.data.earnedXp ? res.data.earnedXp.toFixed(1) : 0;
      
      toast.success(
        <div>
          <p>{res.data.message}</p>
          <p className="font-bold text-yellow-400 mt-1">+{coins} Coin, +{xp} XP</p>
        </div>, 
        { icon: '🛡️', duration: 5000 }
      );
      
      setContributeModal({ isOpen: false, gqId: null, itemId: null, myQty: 0, coinPerItem: 0, xpPerItem: 0 });
      fetchUser();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-20 text-slate-400">Qirollik arxividan ma'lumot qidirilmoqda...</div>;

  const canCompletePersonal = checkCanComplete();

  return (
    <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar relative">
      {/* Epic Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-10 mt-4">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 uppercase tracking-widest game-title drop-shadow-md">
            Qirollik Vazifalari
          </h1>
          <p className="text-slate-400 mt-3 font-medium">Imperiya ravnaqi uchun xizmat qiling va shon-sharafga erishing!</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 md:space-x-4 mb-10 bg-slate-900/80 p-2 rounded-2xl border border-yellow-900/30 backdrop-blur-sm shadow-2xl">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-4 px-4 rounded-xl font-black flex items-center justify-center transition-all uppercase tracking-wider text-sm md:text-base ${
              activeTab === 'personal' 
                ? 'bg-gradient-to-r from-red-900/80 to-red-600/80 text-white border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Target className="w-5 h-5 mr-2" /> Shoh Farmoni
          </button>
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-4 px-4 rounded-xl font-black flex items-center justify-center transition-all uppercase tracking-wider text-sm md:text-base ${
              activeTab === 'global' 
                ? 'bg-gradient-to-r from-blue-900/80 to-blue-600/80 text-white border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flag className="w-5 h-5 mr-2" /> Qirollik Loyihasi
          </button>
        </div>

        {activeTab === 'personal' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {!personalQuest ? (
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-12 text-center backdrop-blur-md">
                <ShieldCheck className="w-20 h-20 text-slate-600 mx-auto mb-6" />
                <h3 className="text-2xl text-slate-300 font-bold mb-2 uppercase tracking-widest">Barcha farmonlar bajarildi!</h3>
                <p className="text-slate-500">Hozircha Shoh tomonidan sizga yangi maxsus topshiriq yo'q. Qirollik sizdan minnatdor.</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-red-950/40 to-slate-900/90 border border-red-900/50 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden backdrop-blur-sm">
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex items-center space-x-4 mb-6 relative z-10">
                  <div className="bg-red-950 text-red-500 font-black text-2xl w-14 h-14 rounded-full border-2 border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    #{personalQuest.order_index}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white drop-shadow-md">{personalQuest.title}</h2>
                    <p className="text-red-400 font-bold text-sm tracking-widest uppercase">Shaxsiy Topshiriq</p>
                  </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-6 border border-slate-800/50 mb-8 relative z-10 text-slate-300 text-lg leading-relaxed italic">
                  "{personalQuest.description}"
                </div>
                
                <h3 className="text-sm uppercase font-black text-slate-500 mb-4 tracking-widest relative z-10">Talab qilinadigan resurslar:</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 relative z-10">
                  {personalQuest.required_items.map((req, idx) => {
                    const item = getItemDetails(req.item_id);
                    const myQty = getUserItemQty(req.item_id);
                    const hasEnough = myQty >= req.qty;
                    
                    return (
                      <div key={idx} className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all ${hasEnough ? 'border-green-500/30 hover:border-green-500/60' : 'border-red-500/30 hover:border-red-500/60 opacity-80'}`}>
                         <span className="text-5xl mb-3 filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform">{item.icon}</span>
                         <span className="text-sm font-bold text-slate-300 mb-2">{item.name}</span>
                         
                         <div className={`text-xs font-black px-3 py-1.5 rounded-lg flex items-center ${hasEnough ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                           {hasEnough ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                           {myQty} / {req.qty} ta
                         </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between bg-black/60 p-6 rounded-2xl border border-red-900/30 gap-6 relative z-10">
                   <div>
                     <h3 className="text-xs uppercase font-black text-slate-500 mb-2 tracking-widest">Mukofot:</h3>
                     <div className="flex items-center space-x-4">
                       <div className="flex items-center text-yellow-400 font-black text-xl bg-yellow-400/10 px-4 py-2 rounded-xl border border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                         <Coins className="w-6 h-6 mr-2" /> +{personalQuest.reward_coins}
                       </div>
                       <div className="flex items-center text-blue-400 font-black text-xl bg-blue-400/10 px-4 py-2 rounded-xl border border-blue-400/20 shadow-[0_0_15px_rgba(96,165,250,0.2)]">
                         <Star className="w-6 h-6 mr-2" /> +{personalQuest.reward_xp} XP
                       </div>
                     </div>
                   </div>
                   
                   <div className="w-full md:w-auto text-center">
                     <button 
                       onClick={() => completePersonal(personalQuest.id)}
                       disabled={!canCompletePersonal}
                       className={`w-full bg-gradient-to-r font-black text-lg py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all uppercase tracking-widest ${
                         canCompletePersonal 
                          ? 'from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                          : 'from-slate-800 to-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                       }`}
                     >
                       Vazifani Bajarish
                     </button>
                     {!canCompletePersonal && (
                        <p className="text-red-400 text-xs font-bold mt-3 animate-pulse">Sizda ba'zi resurslar yetishmayapti!</p>
                     )}
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'global' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {globalQuests.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-12 text-center backdrop-blur-md">
                <Flag className="w-20 h-20 text-slate-600 mx-auto mb-6" />
                <h3 className="text-2xl text-slate-300 font-bold mb-2 uppercase tracking-widest">Loyihalar yo'q</h3>
                <p className="text-slate-500">Hozircha qirollikda ommaviy qurilish yoki tayyorgarlik ketmayapti.</p>
              </div>
            ) : (
              globalQuests.map(gq => {
                let totalTarget = 0;
                gq.required_items.forEach(r => totalTarget += parseInt(r.target_qty));
                const coinPerItem = gq.reward_coins_pool / totalTarget;
                const xpPerItem = gq.reward_xp_pool / totalTarget;

                return (
                <div key={gq.id} className="bg-gradient-to-br from-blue-950/40 to-slate-900/90 border border-blue-900/50 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden backdrop-blur-sm">
                   
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                   
                   <div className="mb-8 relative z-10 flex flex-col md:flex-row justify-between items-start gap-4">
                     <div className="flex-1">
                       <h2 className="text-3xl font-black text-white drop-shadow-md mb-2">{gq.title}</h2>
                       <p className="text-blue-400 font-bold text-sm tracking-widest uppercase mb-4">Ommaviy Qirollik Loyihasi</p>
                       <div className="bg-black/40 rounded-2xl p-6 border border-slate-800/50 text-slate-300 text-lg leading-relaxed italic">
                          "{gq.description}"
                       </div>
                     </div>
                     
                     <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl w-full md:w-auto shrink-0 shadow-inner">
                       <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-3 text-center">Loyihaning Umumiy Byudjeti</h3>
                       <div className="flex flex-col gap-2">
                         <div className="flex items-center justify-between text-yellow-400 font-black bg-yellow-400/10 px-4 py-2 rounded-xl">
                           <span className="flex items-center"><Coins className="w-5 h-5 mr-2" /> Coin Pool:</span>
                           <span className="ml-4">{gq.reward_coins_pool.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center justify-between text-blue-400 font-black bg-blue-400/10 px-4 py-2 rounded-xl">
                           <span className="flex items-center"><Star className="w-5 h-5 mr-2" /> XP Pool:</span>
                           <span className="ml-4">{gq.reward_xp_pool.toLocaleString()}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-8 relative z-10">
                     {gq.required_items.map((req, idx) => {
                       const item = getItemDetails(req.item_id);
                       const myQty = getUserItemQty(req.item_id);
                       const target = parseInt(req.target_qty) || 1;
                       const current = parseInt(req.current_qty) || 0;
                       const userContribution = parseInt(req.user_contribution) || 0;
                       const percentage = Math.min(100, (current / target) * 100).toFixed(1);
                       
                       return (
                         <div key={idx} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
                           <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                             
                             <div className="flex items-center">
                                <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mr-4 border border-slate-700 shadow-md">
                                  {item.icon}
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold text-white">{item.name}</h4>
                                  <p className="text-sm text-slate-400">Kerakli resurs</p>
                                </div>
                             </div>
                             
                             <div className="text-center md:text-right bg-black/40 px-6 py-3 rounded-xl border border-slate-800">
                                <div className="text-2xl text-blue-400 font-black tracking-wider">
                                  {current.toLocaleString()} <span className="text-slate-500 text-lg">/ {target.toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-yellow-500 font-bold uppercase mt-1">
                                  Sizning hissangiz: {userContribution} ta
                                </div>
                             </div>
                             
                           </div>
                           
                           {/* Epic Progress Bar */}
                           <div className="w-full bg-slate-950 rounded-full h-6 border-2 border-slate-800 overflow-hidden mb-6 relative shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 transition-all duration-1000 relative"
                                style={{ width: `${percentage}%` }}
                              >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="absolute top-0 bottom-0 right-0 w-4 bg-white/30 blur-sm"></div>
                              </div>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-widest">
                                {percentage}% TAYYOR
                              </span>
                           </div>
                           
                           <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl">
                             <div className="text-sm font-bold text-slate-400 ml-2">
                               Xaltangizda: <span className={myQty > 0 ? "text-green-400" : "text-slate-500"}>{myQty} ta</span>
                             </div>
                             <button 
                               onClick={() => openContributeModal(gq.id, req.item_id, myQty, coinPerItem, xpPerItem)}
                               disabled={myQty <= 0}
                               className={`border font-black text-sm uppercase tracking-widest py-3 px-8 rounded-xl transition-all flex items-center ${
                                 myQty > 0 
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95'
                                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                               }`}
                             >
                               <Package className="w-5 h-5 mr-2" /> Topshirish
                             </button>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>
              )})
            )}
          </motion.div>
        )}
      </div>

      {/* Contribute Modal */}
      <AnimatePresence>
        {contributeModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] max-w-sm w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <h2 className="text-2xl font-black text-white uppercase tracking-widest text-center mb-6">Hissa Qo'shish</h2>
              
              <div className="text-center mb-6">
                <span className="text-6xl drop-shadow-lg mb-2 block">{getItemDetails(contributeModal.itemId).icon}</span>
                <p className="text-slate-400 font-bold">Xaltangizda bor: <span className="text-white">{contributeModal.myQty} ta</span></p>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Nechta bermoqchisiz?</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={contributeModal.myQty}
                    className="w-full bg-black/50 border border-blue-900 text-white rounded-xl text-center text-3xl font-black py-4 shadow-inner focus:outline-none focus:border-blue-500 transition-colors"
                    value={contributeQty}
                    onChange={(e) => setContributeQty(e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                </div>
                
                {contributeQty && !isNaN(parseInt(contributeQty)) && parseInt(contributeQty) > 0 && (
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kutilayotgan daromad:</p>
                    <div className="flex justify-center space-x-4">
                      <span className="text-yellow-400 font-black">+{ (parseInt(contributeQty) * contributeModal.coinPerItem).toFixed(1) } Coin</span>
                      <span className="text-blue-400 font-black">+{ (parseInt(contributeQty) * contributeModal.xpPerItem).toFixed(1) } XP</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setContributeModal({ isOpen: false, gqId: null, itemId: null, myQty: 0, coinPerItem: 0, xpPerItem: 0 })} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                    Bekor qilish
                  </button>
                  <button onClick={confirmContribute} disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold py-3 flex justify-center items-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    {isSubmitting ? 'Kuting...' : 'Tasdiqlash!'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
