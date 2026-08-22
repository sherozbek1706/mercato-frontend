import React, { useState, useEffect, useContext } from 'react';
import GlassCard from '../components/common/GlassCard';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ShoppingCart, TrendingUp, Tag, PlusCircle, History, X, Coins, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

const Market = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [listings, setListings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('market'); // market | history | sell
  const [marketFilter, setMarketFilter] = useState('users'); // users | bots
  
  // Sell Form States
  const [sellItemId, setSellItemId] = useState('');
  const [sellQty, setSellQty] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  // Buy Modal States
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [buyQty, setBuyQty] = useState('1');

  const fetchData = async () => {
    try {
      const [listingsRes, historyRes] = await Promise.all([
        api.get('/market'),
        api.get('/market/history')
      ]);
      setListings(listingsRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleMarketUpdate = () => fetchData();
    socket.on('market_update', handleMarketUpdate);
    return () => socket.off('market_update', handleMarketUpdate);
  }, []);

  const openBuyModal = (listing) => {
    setSelectedListing(listing);
    setBuyQty('1');
    setBuyModalOpen(true);
  };

  const closeBuyModal = () => {
    setBuyModalOpen(false);
    setSelectedListing(null);
    setBuyQty('1');
  };

  const confirmBuy = async () => {
    if (!buyQty || isNaN(buyQty) || parseInt(buyQty) <= 0) {
       return toast.error("To'g'ri miqdor kiriting");
    }
    if (user.balance < (selectedListing.price_per_unit * parseInt(buyQty))) {
      return toast.error("Mablag'ingiz yetarli emas!");
    }

    try {
      const res = await api.post(`/market/buy/${selectedListing.id}`, { quantity_to_buy: parseInt(buyQty) });
      toast.success(res.data.message);
      closeBuyModal();
      fetchData();
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    if (!sellItemId || !sellQty || !sellPrice) return toast.error("Barcha maydonlarni to'ldiring");
    if (isSelling) return;
    
    setIsSelling(true);
    try {
      const res = await api.post('/market/sell', {
        item_id: parseInt(sellItemId),
        quantity: parseInt(sellQty),
        price_per_unit: parseFloat(sellPrice)
      });
      toast.success(res.data.message);
      setSellItemId(''); setSellQty(''); setSellPrice('');
      setActiveTab('market'); // switch back to market view
      fetchData();
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsSelling(false);
    }
  };

  const handleCancel = async (listingId) => {
    try {
      const res = await api.post(`/market/cancel/${listingId}`);
      toast.success(res.data.message);
      fetchData();
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const getItemIcon = (item) => {
    if (item && item.item_icon) return item.item_icon;
    if (item && item.icon) return item.icon;
    return '📦';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-surfaceSolid p-1.5 md:p-2 rounded-2xl border border-slate-800 shadow-lg">
         <div className="flex w-full overflow-x-auto no-scrollbar space-x-1 md:space-x-2 p-1">
           <button 
             onClick={() => setActiveTab('market')}
             className={`flex-1 flex items-center justify-center px-2 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all text-[11px] sm:text-sm md:text-base whitespace-nowrap ${activeTab === 'market' ? 'bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <Store className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" /> Bozor
           </button>
           <button 
             onClick={() => setActiveTab('sell')}
             className={`flex-1 flex items-center justify-center px-2 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all text-[11px] sm:text-sm md:text-base whitespace-nowrap ${activeTab === 'sell' ? 'bg-accent text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <Tag className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" /> Sotish
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`flex-1 flex items-center justify-center px-2 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all text-[11px] sm:text-sm md:text-base whitespace-nowrap ${activeTab === 'history' ? 'bg-secondary text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             <History className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2" /> Tarix
           </button>
         </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* MARKET TAB */}
        {activeTab === 'market' && (
          <motion.div 
            key="market"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            {/* Sub-tabs for Users vs Bots */}
            <div className="flex justify-center mb-6 space-x-2">
              <button 
                onClick={() => setMarketFilter('users')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${marketFilter === 'users' ? 'bg-primary text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Foydalanuvchilar
              </button>
              <button 
                onClick={() => setMarketFilter('bots')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${marketFilter === 'bots' ? 'bg-accent text-slate-900 shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Davlat Do'koni
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
            ) : listings.filter(l => marketFilter === 'bots' ? l.is_bot : !l.is_bot).length === 0 ? (
              <GlassCard className="text-center py-20">
                <Store className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                <h3 className="text-2xl font-bold text-slate-400">Bozor hozircha bo'sh</h3>
                <p className="text-slate-500 mt-2">Hozircha bu bo'limda mahsulotlar yo'q</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {listings.filter(l => marketFilter === 'bots' ? l.is_bot : !l.is_bot).map((listing) => {
                  const isMine = user?.username === listing.seller_name;
                  return (
                    <GlassCard key={listing.id} className="p-0 overflow-hidden flex flex-col hover:border-primary/50 transition-colors group">
                       <div className="bg-slate-900/80 p-6 flex flex-col items-center justify-center border-b border-slate-800 relative">
                         {isMine && <span className="absolute top-2 right-2 bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-1 rounded">Sizniki</span>}
                         <span className="text-4xl md:text-5xl mb-2 md:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform">{getItemIcon(listing)}</span>
                         <h3 className="text-lg font-bold text-white flex items-center">
                           {listing.seller_name.startsWith('🤖') && <span className="mr-2 text-xl" title="Tizim Boti">🤖</span>}
                           {listing.item_name}
                         </h3>
                         <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                           Miqdor: <span className="text-slate-300 font-bold">{listing.quantity === 999999 ? 'Cheksiz (∞)' : listing.quantity}</span>{listing.quantity !== 999999 && ' ta'}
                         </p>
                       </div>
                       <div className="p-4 bg-surfaceSolid flex-1 flex flex-col justify-between">
                         <div className="flex justify-between items-center mb-4">
                           <span className="text-sm text-slate-400">Sotuvchi:</span>
                           <span className="text-sm font-semibold text-secondary">{listing.seller_name}</span>
                         </div>
                         <div className="flex justify-between items-end mb-4">
                           <span className="text-xs text-slate-500 uppercase">Narx / dona</span>
                           <div className="flex items-center text-xl font-black text-accent">
                             {Number(listing.price_per_unit).toFixed(2)} <Coins className="w-4 h-4 ml-1" />
                           </div>
                         </div>
                         
                         {isMine ? (
                           <button onClick={() => handleCancel(listing.id)} className="w-full bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 font-bold py-2 rounded-lg transition-colors">
                             Qaytarib olish
                           </button>
                         ) : (
                           <button onClick={() => openBuyModal(listing)} className="w-full btn-primary text-sm shadow-none">
                             Sotib Olish
                           </button>
                         )}
                       </div>
                    </GlassCard>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* SELL TAB */}
        {activeTab === 'sell' && (
          <motion.div 
            key="sell"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto"
          >
            <GlassCard>
              <div className="text-center mb-6 md:mb-8">
                <Tag className="w-10 h-10 md:w-12 md:h-12 text-accent mx-auto mb-2 md:mb-3" />
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Mahsulot Sotish</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Inventaringizdagi narsalarni bozorga joylashtiring</p>
              </div>

              <form onSubmit={handleSell} className="space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sotish uchun mahsulotni tanlang</label>
                    {sellItemId && (
                      <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
                        {user?.inventory?.find(i => String(i.item_id) === String(sellItemId))?.name} tanlandi
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-900/40 p-3 md:p-4 rounded-xl border border-slate-800">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 md:gap-3 max-h-56 overflow-y-auto no-scrollbar">
                      {user?.inventory?.filter(i => i.quantity > 0).length === 0 ? (
                         <div className="col-span-full text-center py-6 text-slate-500 text-sm">
                           Sotish uchun hech qanday mahsulot yo'q.
                         </div>
                      ) : (
                        user?.inventory?.filter(i => i.quantity > 0).map(item => {
                          const isSelected = String(sellItemId) === String(item.item_id);
                          return (
                            <div 
                              key={item.item_id} 
                              onClick={() => setSellItemId(String(item.item_id))}
                              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                                isSelected
                                ? 'bg-accent/10 border-2 border-accent shadow-[0_0_15px_rgba(251,191,36,0.3)] z-10' 
                                : 'bg-surfaceSolid border border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                              }`}
                            >
                              <span className="text-2xl md:text-3xl filter drop-shadow-md mb-1">{getItemIcon(item)}</span>
                              <span className="text-[9px] md:text-[10px] text-slate-400 font-bold truncate w-full text-center px-1">
                                {item.name}
                              </span>
                              <span className="absolute top-1 right-1 bg-slate-900 text-white text-[9px] font-bold px-1 rounded border border-slate-700 shadow-sm">
                                x{item.quantity}
                              </span>
                              {isSelected && (
                                 <div className="absolute -top-1.5 -left-1.5 bg-accent text-slate-900 rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                                   <span className="text-[10px] font-black">✓</span>
                                 </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sotish Miqdori</label>
                    <input 
                      type="number" min="1" 
                      className="w-full input-glass"
                      placeholder="10"
                      value={sellQty}
                      onChange={(e) => setSellQty(e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                       Narx (1 dona uchun) <Coins className="w-3 h-3 ml-1 text-accent" />
                    </label>
                    <input 
                      type="number" step="0.01" min="0.01"
                      className="w-full input-glass"
                      placeholder="5.50"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-sm">
                  <p className="text-slate-400 mb-2">Siz oladigan taxminiy daromad:</p>
                  <div className="flex justify-between items-center font-black">
                    <span className="text-slate-500">Soliq ({user?.settings?.market_tax_percent || 5}%):</span>
                    <span className="text-danger">
                       -{((sellQty && sellPrice) ? (sellQty * sellPrice * (user?.settings?.market_tax_percent || 5) / 100) : 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-black text-xl mt-1">
                    <span className="text-slate-300">Sof foyda:</span>
                    <span className="text-success flex items-center">
                       + {((sellQty && sellPrice) ? (sellQty * sellPrice * (1 - (user?.settings?.market_tax_percent || 5) / 100)) : 0).toFixed(2)} <Coins className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>

                <button type="submit" disabled={isSelling} className="w-full btn-accent text-slate-900 text-lg mt-6 shadow-lg py-3 flex justify-center items-center">
                  {isSelling ? <><div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2" /> Joylashtirilmoqda...</> : "Bozorga Chiqarish"}
                </button>
                <button 
                  type="button" 
                  onClick={async () => {
                    if (!sellItemId || !sellQty) return toast.error("Mahsulot va miqdorni tanlang");
                    if (isSelling) return;
                    
                    if (!window.confirm("Rostdan ham ushbu mahsulotni davlatga sotmoqchimisiz? Davlat bozordagi o'rtacha narxdan 40% arzonroqqa oladi, lekin darhol sotiladi!")) {
                      return;
                    }

                    // eslint-disable-next-line no-undef
                    setIsSelling(true);
                    try {
                      const res = await api.post('/market/sell-to-bot', { item_id: parseInt(sellItemId), quantity: parseInt(sellQty) });
                      toast.success(res.data.message);
                      setSellItemId(''); setSellQty(''); setSellPrice('');
                      setActiveTab('market');
                      fetchData();
                      fetchUser();
                    } catch (error) {
                      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
                    } finally {
                      setIsSelling(false);
                    }
                  }}
                  disabled={isSelling} 
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 md:py-4 rounded-xl border border-slate-700 transition-colors mt-3 shadow-lg flex justify-center items-center"
                >
                  Davlatga Sotish (Darhol Sotiladi)
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          >
            <GlassCard>
              <div className="flex flex-col items-center justify-center mb-6 md:mb-8 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-3 md:mb-4 border border-secondary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                  <History className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
                </div>
                <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider">Savdo Tarixi</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Bozordagi barcha oldi-sotdi operatsiyalaringiz</p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <History className="w-16 h-16 mx-auto text-slate-700 mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-slate-400">Tarix bo'sh</h3>
                  <p className="text-slate-500 mt-2 text-sm">Sizda hali savdo operatsiyalari mavjud emas</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {history.map((tx) => {
                    const isSeller = tx.seller_name === user.username;
                    return (
                      <div 
                        key={tx.id} 
                        className="group relative overflow-hidden bg-slate-900/60 p-3 sm:p-4 md:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300"
                      >
                        {/* Status Indicator Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSeller ? 'bg-success/50' : 'bg-danger/50'}`}></div>
                        
                        <div className="flex items-center space-x-3 sm:space-x-4 pl-1 sm:pl-2">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl bg-surfaceSolid border shadow-inner ${isSeller ? 'border-success/30 shadow-success/10' : 'border-danger/30 shadow-danger/10'}`}>
                            {getItemIcon(tx)}
                          </div>
                          
                          <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isSeller ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                {isSeller ? 'Sotuv' : 'Xarid'}
                              </span>
                              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                                {new Date(tx.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </span>
                            </div>
                            
                            <h4 className="font-extrabold text-white text-base sm:text-lg leading-tight mb-1">
                              {tx.item_name} <span className="text-sm font-medium text-slate-400">x{tx.quantity_sold}</span>
                            </h4>
                            
                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center">
                              <span className="mr-1">{isSeller ? 'Xaridor:' : 'Sotuvchi:'}</span>
                              <span className="text-slate-300">
                                {isSeller ? (tx.buyer_name || tx.bot_buyer_name || 'Noma\'lum') : (tx.seller_name || tx.bot_seller_name || 'Noma\'lum')}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 mt-1 sm:mt-0">
                          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-0.5 sm:mb-1 ${isSeller ? 'text-success/70' : 'text-danger/70'}`}>
                            {isSeller ? '+ Foyda' : '- Xarajat'}
                          </span>
                          <div className={`text-lg sm:text-xl md:text-2xl font-black flex items-center justify-end ${isSeller ? 'text-success' : 'text-danger'} drop-shadow-sm`}>
                            {isSeller ? '+' : '-'}{Number(tx.total_price).toFixed(2)} <Coins className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 opacity-80" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Modal */}
      <AnimatePresence>
        {buyModalOpen && selectedListing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-surfaceSolid border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative"
            >
              <button onClick={closeBuyModal} className="absolute top-4 right-4 text-slate-500 hover:text-white bg-slate-800 rounded-full p-1">
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{getItemIcon(selectedListing)}</div>
                <h3 className="text-2xl font-black text-white uppercase">{selectedListing.item_name}</h3>
                <p className="text-slate-400 text-sm mt-1">Sotuvchi: <span className="text-secondary font-bold">{selectedListing.seller_name}</span></p>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Miqdor (Bor: {selectedListing.quantity === 999999 ? 'Cheksiz' : selectedListing.quantity})</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedListing.quantity}
                    className="w-full input-glass text-center text-lg font-bold"
                    value={buyQty}
                    onChange={(e) => setBuyQty(e.target.value)}
                  />
                </div>
                
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Jami to'lov:</span>
                  <span className="text-2xl font-black text-accent flex items-center drop-shadow-md">
                    {buyQty && !isNaN(buyQty) ? (selectedListing.price_per_unit * parseInt(buyQty)).toFixed(2) : '0.00'} <Coins className="w-5 h-5 ml-1" />
                  </span>
                </div>
                
                <button 
                  onClick={confirmBuy}
                  className="w-full btn-primary py-4 text-lg tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                >
                  Sotib Olish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Market;
