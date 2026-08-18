import React, { useState, useEffect, useContext } from 'react';
import GlassCard from '../components/common/GlassCard';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ScrollText, Coins, CheckCircle, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import socket from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';

const Quests = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fulfill Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillQty, setFulfillQty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const handleUpdate = () => fetchOrders();
    socket.on('orders_update', handleUpdate);
    return () => socket.off('orders_update', handleUpdate);
  }, []);

  const openModal = (order) => {
    setSelectedOrder(order);
    setFulfillQty('');
    setModalOpen(true);
  };

  const confirmFulfill = async () => {
    if (!fulfillQty || parseInt(fulfillQty) <= 0) return toast.error("Miqdorni to'g'ri kiriting");
    
    setIsSubmitting(true);
    try {
      const res = await api.post(`/orders/${selectedOrder.id}/fulfill`, { quantity: parseInt(fulfillQty) });
      toast.success(res.data.message, { duration: 4000, icon: '🏛️' });
      setModalOpen(false);
      fetchOrders();
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserInventoryQty = (itemId) => {
    const item = user?.inventory?.find(i => i.item_id === itemId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <GlassCard className="text-center p-8 bg-gradient-to-br from-primary/10 to-transparent">
        <ScrollText className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Davlat Buyurtmalari</h1>
        <p className="text-slate-400">
          Davlatga zudlik bilan resurslar kerak! O'zingizdagi ortiqcha mahsulotlarni to'g'ridan-to'g'ri (soliqsiz) davlatga sotib, mo'maygina daromad qiling. Kim birinchi topshirsa, foyda o'shaniki!
        </p>
      </GlassCard>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Yuklanmoqda...</div>
      ) : orders.length === 0 ? (
        <GlassCard className="text-center py-20">
          <CheckCircle className="w-16 h-16 mx-auto text-success mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-slate-400">Hozircha buyurtmalar yo'q</h3>
          <p className="text-slate-500 mt-2">Barcha buyurtmalar bajarilgan yoki e'lon qilinmagan. Keyinroq qaytib ko'ring!</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(order => {
            const percent = Math.min(100, Math.round((order.quantity_fulfilled / order.quantity_required) * 100));
            const remaining = order.quantity_required - order.quantity_fulfilled;
            const myStock = getUserInventoryQty(order.item_id);

            return (
              <GlassCard key={order.id} className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                  <Target className="w-24 h-24 text-primary" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <span className="text-5xl mr-4 drop-shadow-md">{order.item_icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">{order.item_name}</h3>
                      <p className="text-accent font-black text-lg flex items-center">
                        {order.reward_per_unit} <Coins className="w-4 h-4 ml-1" /> <span className="text-sm font-medium text-slate-400 ml-1">/ dona</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6">
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-slate-400">Holat: <span className="text-white">{order.quantity_fulfilled}</span> / {order.quantity_required} yig'ildi</span>
                      <span className="text-primary">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${percent}%` }} 
                        className="bg-primary h-3 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-3 flex justify-between">
                      <span>Sizda bor: <span className={myStock > 0 ? 'text-success font-bold' : ''}>{myStock} ta</span></span>
                      <span>Hali kerak: <span className="text-warning font-bold">{remaining} ta</span></span>
                    </p>
                  </div>

                  <button 
                    onClick={() => openModal(order)}
                    disabled={myStock <= 0}
                    className={`w-full py-3 rounded-xl font-bold text-lg flex justify-center items-center transition-all ${
                      myStock > 0 
                        ? 'btn-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {myStock > 0 ? 'Topshirish (Sotish)' : 'Sizda bu mahsulot yo\'q'}
                  </button>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Fulfill Modal */}
      <AnimatePresence>
        {modalOpen && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-surfaceSolid border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative"
            >
              <h2 className="text-2xl font-black text-white uppercase text-center mb-6">Mahsulot Topshirish</h2>
              
              <div className="text-center mb-6">
                <span className="text-5xl drop-shadow-md">{selectedOrder.item_icon}</span>
                <p className="text-slate-400 mt-2">Sizda jami <span className="font-bold text-white">{getUserInventoryQty(selectedOrder.item_id)} ta</span> bor.</p>
                <p className="text-slate-400">Davlatga yana <span className="font-bold text-primary">{selectedOrder.quantity_required - selectedOrder.quantity_fulfilled} ta</span> kerak.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nechta topshirasiz?</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={Math.min(getUserInventoryQty(selectedOrder.item_id), selectedOrder.quantity_required - selectedOrder.quantity_fulfilled)}
                    className="w-full input-glass text-center text-xl font-bold"
                    value={fulfillQty}
                    onChange={(e) => setFulfillQty(e.target.value)}
                  />
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                  <p className="text-sm text-slate-500 mb-1">Siz olasiz (Soliqsiz!)</p>
                  <p className="text-2xl font-black text-success flex items-center justify-center">
                    + {fulfillQty ? (parseInt(fulfillQty) * selectedOrder.reward_per_unit).toFixed(2) : '0.00'} <Coins className="w-5 h-5 ml-2" />
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                    Bekor qilish
                  </button>
                  <button onClick={confirmFulfill} disabled={isSubmitting} className="flex-1 btn-success py-3 flex justify-center items-center">
                    {isSubmitting ? 'Kuting...' : 'Sotish!'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quests;
