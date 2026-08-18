import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    icon: '📦',
    type: 'resource',
    energy_value: 0,
    description: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.get('/admin/items');
      setItems(res.data);
    } catch (error) {
      toast.error('Mahsulotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.post('/admin/items', formData);
      toast.success(res.data.message);
      setIsEditing(false);
      fetchItems();
    } catch (error) {
      toast.error('Saqlashda xatolik');
    }
  };

  const openEdit = (item = null) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        icon: item.icon || '📦',
        type: item.type,
        energy_value: item.energy_value,
        description: item.description || ''
      });
    } else {
      setFormData({ id: null, name: '', icon: '📦', type: 'resource', energy_value: 0, description: '' });
    }
    setIsEditing(true);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.delete(`/admin/items/${itemToDelete}`);
      toast.success(res.data.message);
      fetchItems();
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    } finally {
      setItemToDelete(null);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
        <h2 className="text-xl font-bold mb-6">{formData.id ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nomi</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Icon (Emoji)</label>
              <input required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-xl text-center" maxLength={2} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Turi (Type)</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white">
                <option value="resource">Xomashyo (resource)</option>
                <option value="food">Oziq-ovqat (food)</option>
                <option value="tool">Uskuna (tool)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Beradigan energiya (faqat ovqat)</label>
              <input type="number" required value={formData.energy_value} onChange={e => setFormData({...formData, energy_value: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ta'rifi</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
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
        <h2 className="text-2xl font-bold text-slate-900">Mahsulotlar</h2>
        <button onClick={() => openEdit()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-5 h-5 mr-2" /> Yangi qo'shish
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <span className="text-2xl mr-2">{item.icon}</span> {item.name}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'food' ? 'bg-green-100 text-green-700' : item.type === 'tool' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                {item.type}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3 h-10 overflow-hidden">{item.description}</p>
            <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">ID: {item.id}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="text-blue-600 text-sm font-medium hover:underline">Tahrirlash</button>
                <button onClick={() => confirmDelete(item.id)} className="text-red-600 text-sm font-medium hover:underline">O'chirish</button>
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
        message="Haqiqatan ham bu mahsulotni o'chirmoqchimisiz? Bunga ulangan inventar va retseptlar buzilishi mumkin."
      />
    </div>
  );
};

export default AdminItems;
