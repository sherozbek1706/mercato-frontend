import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminLevels() {
  const [levels, setLevels] = useState([]);
  const [form, setForm] = useState({ id: null, level: '', required_xp: '' });

  useEffect(() => { fetchLevels(); }, []);
  const fetchLevels = async () => {
    try {
      const res = await api.get('/admin/levels');
      setLevels(res.data);
    } catch (e) { toast.error("Xato"); }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/levels', form);
      toast.success("Saqlandi");
      setForm({ id: null, level: '', required_xp: '' });
      fetchLevels();
    } catch(e) { toast.error("Xato"); }
  };

  const del = async (id) => {
    if(!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/admin/levels/${id}`);
      fetchLevels();
    } catch(e) { toast.error("Xato"); }
  };

  const edit = (l) => {
    setForm({ id: l.id, level: l.level, required_xp: l.required_xp });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Darajalar (Levels)</h2>
      <form onSubmit={save} className="bg-white p-4 rounded shadow mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm">Level</label>
          <input type="number" required value={form.level} onChange={e=>setForm({...form, level: e.target.value})} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Kerakli XP</label>
          <input type="number" required value={form.required_xp} onChange={e=>setForm({...form, required_xp: e.target.value})} className="border p-2 rounded" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">
          {form.id ? "Yangilash" : "Qo'shish"}
        </button>
        {form.id && (
          <button type="button" onClick={() => setForm({id: null, level: '', required_xp: ''})} className="bg-gray-400 text-white px-4 py-2 rounded">
            Bekor qilish
          </button>
        )}
      </form>

      <table className="w-full bg-white shadow rounded text-left">
        <thead><tr className="border-b bg-gray-50">
          <th className="p-3">Level</th><th className="p-3">Kerakli XP</th><th className="p-3">Amallar</th>
        </tr></thead>
        <tbody>
          {levels.map(l => (
            <tr key={l.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-bold">{l.level}</td>
              <td className="p-3">{l.required_xp}</td>
              <td className="p-3 flex gap-3">
                <button onClick={() => edit(l)} className="text-blue-600 hover:text-blue-800" title="Tahrirlash"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => del(l.id)} className="text-red-500 hover:text-red-700" title="O'chirish"><Trash2 className="w-5 h-5" /></button>
              </td>
            </tr>
          ))}
          {levels.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-500">Hech qanday ma'lumot yo'q</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
