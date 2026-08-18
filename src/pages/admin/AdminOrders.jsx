import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, ScrollText } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    item_id: 1,
    quantity_required: 100,
    reward_per_unit: 15,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderRes, itemRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/items')
      ]);
      setOrders(orderRes.data);
      setItems(itemRes.data);
      if (itemRes.data.length > 0 && !formData.id) {
        setFormData(prev => ({ ...prev, item_id: itemRes.data[0].id }));
      }
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/orders', formData);
      toast.success(res.data.message);
      setIsEditing(false);
      fetchData();
    } catch (error) {
      toast.error('Saqlashda xatolik');
    }
  };

  const openEdit = (order = null) => {
    if (order) {
      setFormData({
        id: order.id,
        item_id: order.item_id,
        quantity_required: order.quantity_required,
        reward_per_unit: order.reward_per_unit,
        is_active: order.is_active
      });
    } else {
      setFormData({ 
        id: null, 
        item_id: items[0]?.id || 1, 
        quantity_required: 100,
        reward_per_unit: 15, 
        is_active: true 
      });
    }
    setIsEditing(true);
  };

  const confirmDelete = (id) => {
    setOrderToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      const res = await api.delete(`/admin/orders/${orderToDelete}`);
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    } finally {
      setOrderToDelete(null);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <ScrollText className="mr-2 text-primary" /> 
          {formData.id ? 'Buyurtmani tahrirlash' : 'Yangi Davlat Buyurtmasi E\'lon Qilish'}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qaysi mahsulot kerak?</label>
              <select required value={formData.item_id} onChange={e => setFormData({...formData, item_id: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg bg-white">
                {items.map(i => <option key={i.id} value={i.id}>{i.icon} {i.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nechta kerak (Jami miqdor)?</label>
              <input type="number" min="1" required value={formData.quantity_required} onChange={e => setFormData({...formData, quantity_required: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">1 donasi uchun qancha to'lanadi? (Tanga)</label>
              <input type="number" step="0.01" required value={formData.reward_per_unit} onChange={e => setFormData({...formData, reward_per_unit: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-slate-700">Hozir aktiv (O'yinchilarga ko'rinadi)</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-lg hover:bg-slate-50">Bekor qilish</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">E'lon Qilish</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <ScrollText className="w-6 h-6 mr-2" /> Davlat Buyurtmalari
        </h2>
        <button onClick={() => openEdit()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-5 h-5 mr-2" /> Yangi Buyurtma Qilish
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {orders.map(order => {
          const percent = Math.min(100, Math.round((order.quantity_fulfilled / order.quantity_required) * 100));
          return (
            <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center">
                    <span className="text-2xl mr-2">{order.item_icon}</span> {order.item_name} kerak!
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Jami qisqacha: <span className="font-bold text-primary">{order.quantity_required} ta</span> kerak. Donasiga <span className="font-bold text-accent">{order.reward_per_unit} Tanga</span> beriladi.
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {order.is_active ? 'Faol' : 'Tugagan/To\'xtatilgan'}
                </span>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Yig'ildi:</span>
                  <span className="font-bold text-primary">{order.quantity_fulfilled} / {order.quantity_required}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="flex gap-2 w-full justify-end">
                  <button onClick={() => openEdit(order)} className="text-blue-600 font-medium hover:underline text-sm px-3 py-1 bg-blue-50 rounded-md">Tahrirlash</button>
                  <button onClick={() => confirmDelete(order.id)} className="text-red-600 font-medium hover:underline text-sm px-3 py-1 bg-red-50 rounded-md">O'chirish</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="O'chirishni tasdiqlang"
        message="Haqiqatan ham bu buyurtmani o'chirib tashlamoqchimisiz?"
      />
    </div>
  );
};

export default AdminOrders;
