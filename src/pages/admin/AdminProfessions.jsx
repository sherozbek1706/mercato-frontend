import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminProfessions = () => {
  const [professions, setProfessions] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    energy_cost: 10,
    clicks_needed: 20,
    consume: [],
    produce: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      const [profRes, itemsRes] = await Promise.all([
        api.get('/admin/professions'),
        api.get('/admin/items')
      ]);
      setProfessions(profRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/professions', formData);
      toast.success(res.data.message);
      setIsEditing(false);
      fetchData();
    } catch (error) {
      toast.error('Saqlashda xatolik');
    }
  };

  const openEdit = (prof = null) => {
    if (prof) {
      setFormData({
        id: prof.id,
        name: prof.name,
        description: prof.description || '',
        energy_cost: prof.energy_cost,
        clicks_needed: prof.clicks_needed || 20,
        consume: typeof prof.consume === 'string' ? JSON.parse(prof.consume) : (prof.consume || []),
        produce: typeof prof.produce === 'string' ? JSON.parse(prof.produce) : (prof.produce || [])
      });
    } else {
      setFormData({ id: null, name: '', description: '', energy_cost: 10, clicks_needed: 20, consume: [], produce: [] });
    }
    setIsEditing(true);
  };

  const addRecipeItem = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { item_id: items[0]?.id || 1, qty: 1 }]
    }));
  };

  const updateRecipeItem = (type, index, field, value) => {
    const updated = [...formData[type]];
    updated[index][field] = Number(value);
    setFormData({ ...formData, [type]: updated });
  };

  const removeRecipeItem = (type, index) => {
    const updated = [...formData[type]];
    updated.splice(index, 1);
    setFormData({ ...formData, [type]: updated });
  };

  const confirmDelete = (id) => {
    setProfToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!profToDelete) return;
    try {
      const res = await api.delete(`/admin/professions/${profToDelete}`);
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    } finally {
      setProfToDelete(null);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6">{formData.id ? 'Kasbni tahrirlash' : 'Yangi kasb qo\'shish'}</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nomi</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Energiya xarajati</label>
              <input type="number" required value={formData.energy_cost} onChange={e => setFormData({...formData, energy_cost: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qancha marta bosish kerak (Clicks)</label>
              <input type="number" required value={formData.clicks_needed} onChange={e => setFormData({...formData, clicks_needed: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ta'rifi</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
            {/* Consume */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900">Kerakli xomashyo (Consume)</h3>
                <button type="button" onClick={() => addRecipeItem('consume')} className="text-sm bg-slate-100 px-3 py-1 rounded-md text-blue-600 hover:bg-slate-200">+ Qo'shish</button>
              </div>
              {formData.consume.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <select value={item.item_id} onChange={e => updateRecipeItem('consume', idx, 'item_id', e.target.value)} className="flex-1 border rounded p-2 text-sm">
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <input type="number" value={item.qty} onChange={e => updateRecipeItem('consume', idx, 'qty', e.target.value)} className="w-20 border rounded p-2 text-sm" />
                  <button type="button" onClick={() => removeRecipeItem('consume', idx)} className="text-red-500 font-bold px-2">X</button>
                </div>
              ))}
            </div>

            {/* Produce */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-900">Olinadigan mahsulot (Produce)</h3>
                <button type="button" onClick={() => addRecipeItem('produce')} className="text-sm bg-slate-100 px-3 py-1 rounded-md text-blue-600 hover:bg-slate-200">+ Qo'shish</button>
              </div>
              {formData.produce.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <select value={item.item_id} onChange={e => updateRecipeItem('produce', idx, 'item_id', e.target.value)} className="flex-1 border rounded p-2 text-sm">
                    {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                  <input type="number" value={item.qty} onChange={e => updateRecipeItem('produce', idx, 'qty', e.target.value)} className="w-20 border rounded p-2 text-sm" />
                  <button type="button" onClick={() => removeRecipeItem('produce', idx)} className="text-red-500 font-bold px-2">X</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
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
        <h2 className="text-2xl font-bold text-slate-900">Kasblar va Retseptlar</h2>
        <button onClick={() => openEdit()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-5 h-5 mr-2" /> Yangi qo'shish
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {professions.map(prof => (
          <div key={prof.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{prof.name} <span className="text-sm font-normal text-slate-500 ml-2">ID: {prof.id}</span></h3>
              <p className="text-sm text-slate-600 mt-1 mb-3">{prof.description}</p>
              <div className="text-sm">
                <p className="text-blue-600 font-medium">⚡ Energiya: {prof.energy_cost} | 🖱️ Clicks: {prof.clicks_needed || 20}</p>
                <div className="mt-2 text-slate-700">
                  <span className="font-semibold text-xs uppercase text-slate-500 tracking-wider">Xarajat:</span> 
                  {(() => {
                    const c = typeof prof.consume === 'string' ? JSON.parse(prof.consume) : prof.consume;
                    if (!c || c.length === 0) return " Yo'q";
                    return c.map(i => {
                      const item = items.find(it => it.id === i.item_id);
                      return ` ${item ? item.name : 'Noma\'lum'} (${i.qty}ta)`;
                    }).join(',');
                  })()}
                </div>
                <div className="mt-1 text-slate-700">
                  <span className="font-semibold text-xs uppercase text-slate-500 tracking-wider">Foyda:</span> 
                  {(() => {
                    const p = typeof prof.produce === 'string' ? JSON.parse(prof.produce) : prof.produce;
                    if (!p || p.length === 0) return " Yo'q";
                    return p.map(i => {
                      const item = items.find(it => it.id === i.item_id);
                      return ` ${item ? item.name : 'Noma\'lum'} (${i.qty}ta)`;
                    }).join(',');
                  })()}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => openEdit(prof)} className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 bg-blue-50 rounded-md">
                Tahrirlash
              </button>
              <button onClick={() => confirmDelete(prof.id)} className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 bg-red-50 rounded-md">
                O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="O'chirishni tasdiqlang"
        message="Haqiqatan ham bu kasbni o'chirmoqchimisiz? Bunga ulangan foydalanuvchilar bo'lishi mumkin. Bu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
};

export default AdminProfessions;
