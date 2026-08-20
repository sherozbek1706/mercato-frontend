import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserEditModal = ({ isOpen, onClose, user, onSaved }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [professionId, setProfessionId] = useState('');
  const [professions, setProfessions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(user?.username || '');
      setPassword('');
      // `user` in AdminUsers doesn't have profession_id, it has profession_name
      // But we need profession_id. Let's fetch details to get profession_id.
      fetchUserDetails(user.id);
      fetchProfessions();
    }
  }, [isOpen, user]);

  const fetchUserDetails = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setProfessionId(res.data.profession_id || '');
    } catch (err) {}
  };

  const fetchProfessions = async () => {
    try {
      const res = await api.get('/admin/professions');
      setProfessions(res.data);
    } catch (err) {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/users/${user.id}`, {
        username,
        password,
        profession_id: professionId
      });
      toast.success("Muvaffaqiyatli saqlandi");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Foydalanuvchini Tahrirlash</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Yangi Parol (ixtiyoriy)</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Yangi parol (bo'sh qoldirsa o'zgarmaydi)"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">Faqatgina o'zgartirish kerak bo'lsa kiriting.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Kasb</label>
            <select 
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={professionId || ''}
              onChange={e => setProfessionId(e.target.value)}
            >
              <option value="">Kasb tanlanmagan</option>
              {professions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Bekor qilish</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserEditModal;
