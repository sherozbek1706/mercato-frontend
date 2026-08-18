import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Bot } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminBots = () => {
  const [bots, setBots] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    bot_name: 'Davlat Do\'koni',
    item_id: 1,
    price_per_unit: 10,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [botRes, itemRes] = await Promise.all([
        api.get('/admin/bots'),
        api.get('/admin/items')
      ]);
      setBots(botRes.data);
      setItems(itemRes.data);
      if (itemRes.data.length > 0) {
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
      const res = await api.post('/admin/bots', formData);
      toast.success(res.data.message);
      setIsEditing(false);
      fetchData();
    } catch (error) {
      toast.error('Saqlashda xatolik');
    }
  };

  const openEdit = (bot = null) => {
    if (bot) {
      setFormData({
        id: bot.id,
        bot_name: bot.bot_name,
        item_id: bot.item_id,
        price_per_unit: bot.price_per_unit,
        is_active: bot.is_active
      });
    } else {
      setFormData({ 
        id: null, 
        bot_name: 'Davlat Do\'koni', 
        item_id: items[0]?.id || 1, 
        price_per_unit: 10, 
        is_active: true 
      });
    }
    setIsEditing(true);
  };

  const confirmDelete = (id) => {
    setBotToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!botToDelete) return;
    try {
      const res = await api.delete(`/admin/bots/${botToDelete}`);
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    } finally {
      setBotToDelete(null);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center"><Bot className="mr-2 text-primary" /> {formData.id ? 'Botni tahrirlash' : 'Yangi Tizim Boti qo\'shish'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bot Ismi (Sotuvchi)</label>
              <input required value={formData.bot_name} onChange={e => setFormData({...formData, bot_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="Masalan: Davlat Bozori" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sotadigan Mahsuloti</label>
              <select required value={formData.item_id} onChange={e => setFormData({...formData, item_id: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg bg-white">
                {items.map(i => <option key={i.id} value={i.id}>{i.icon} {i.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Narxi (1 donasi uchun)</label>
              <input type="number" step="0.01" required value={formData.price_per_unit} onChange={e => setFormData({...formData, price_per_unit: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-slate-700">Hozir bozorda sotuvda (Aktiv)</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-lg hover:bg-slate-50">Bekor qilish</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Saqlash</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <Bot className="w-6 h-6 mr-2" /> Tizim Botlari (Cheksiz Savdo)
        </h2>
        <button onClick={() => openEdit()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-5 h-5 mr-2" /> Yangi Bot Qo'shish
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map(bot => (
          <div key={bot.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">🤖 {bot.bot_name}</h3>
                <p className="text-sm text-slate-500">Sotmoqda: <span className="font-bold text-slate-800">{bot.item_name}</span></p>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${bot.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {bot.is_active ? 'Sotuvda' : 'To\'xtatilgan'}
              </span>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Miqdor:</span>
                <span className="font-bold text-primary">Cheksiz (∞)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Narxi:</span>
                <span className="font-bold text-accent">{bot.price_per_unit} Tanga</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="flex gap-2 w-full justify-end">
                <button onClick={() => openEdit(bot)} className="text-blue-600 font-medium hover:underline text-sm px-3 py-1 bg-blue-50 rounded-md">Tahrirlash</button>
                <button onClick={() => confirmDelete(bot.id)} className="text-red-600 font-medium hover:underline text-sm px-3 py-1 bg-red-50 rounded-md">O'chirish</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="O'chirishni tasdiqlang"
        message="Haqiqatan ham bu botni o'chirib tashlamoqchimisiz? (Botni shunchaki to'xtatib qo'yishingiz ham mumkin edi)"
      />
    </div>
  );
};

export default AdminBots;
