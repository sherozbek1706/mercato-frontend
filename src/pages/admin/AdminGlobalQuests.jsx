import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil } from 'lucide-react';

export default function AdminGlobalQuests() {
  const [quests, setQuests] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ id: null, title: '', description: '', reward_coins_pool: 0, reward_xp_pool: 0, is_active: true });
  const [requiredItems, setRequiredItems] = useState([{ item_id: '', target_qty: 1000 }]);

  useEffect(() => { 
    fetchQuests(); 
    fetchItems();
  }, []);

  const fetchQuests = async () => {
    try {
      const res = await api.get('/admin/global-quests');
      setQuests(res.data);
    } catch (e) { toast.error("Vazifalarni yuklashda xato"); }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch (e) { toast.error("Buyumlarni yuklashda xato"); }
  };

  const save = async (e) => {
    e.preventDefault();
    const validItems = requiredItems.filter(i => i.item_id && i.target_qty > 0);
    if (validItems.length === 0) return toast.error("Kamida bitta xomashyo kiritilishi kerak");

    try {
      await api.post('/admin/global-quests', {
        ...form, 
        required_items: validItems
      });
      toast.success("Saqlandi");
      fetchQuests();
      setForm({ id: null, title: '', description: '', reward_coins_pool: 0, reward_xp_pool: 0, is_active: true });
      setRequiredItems([{ item_id: '', target_qty: 1000 }]);
    } catch(e) { toast.error("Xato yuz berdi"); }
  };

  const del = async (id) => {
    if(!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await api.delete(`/admin/global-quests/${id}`);
      fetchQuests();
    } catch(e) { toast.error("Xato"); }
  };

  const edit = (q) => {
    setForm({ id: q.id, title: q.title, description: q.description, reward_coins_pool: q.reward_coins_pool, reward_xp_pool: q.reward_xp_pool, is_active: q.is_active });
    try {
       const parsed = typeof q.required_items === 'string' ? JSON.parse(q.required_items) : q.required_items;
       setRequiredItems(parsed.length ? parsed : [{ item_id: '', target_qty: 1000 }]);
    } catch(e) {
       setRequiredItems([{ item_id: '', target_qty: 1000 }]);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Qirollik Loyihasi (Ommaviy Missiyalar)</h2>
      <form onSubmit={save} className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-sm font-bold mb-1">Nomi</label><input required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border p-2 rounded w-full" /></div>
        <div className="col-span-2"><label className="block text-sm font-bold mb-1">Ta'rifi</label><textarea required value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="border p-2 rounded w-full" /></div>
        
        {/* Dynamic Required Items */}
        <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <label className="block text-sm font-bold mb-3">Kerakli xomashyolar (Yig'iladigan mahsulotlar)</label>
          
          {requiredItems.map((req, idx) => (
            <div key={idx} className="flex gap-4 mb-3 items-center">
               <select 
                 required 
                 value={req.item_id} 
                 onChange={e => {
                   const newArr = [...requiredItems];
                   newArr[idx].item_id = parseInt(e.target.value);
                   setRequiredItems(newArr);
                 }} 
                 className="border p-2 rounded flex-1"
               >
                 <option value="">Mahsulotni tanlang...</option>
                 {items.map(item => (
                   <option key={item.id} value={item.id}>{item.icon} {item.name}</option>
                 ))}
               </select>
               
               <input 
                 type="number" 
                 min="1"
                 required 
                 value={req.target_qty} 
                 onChange={e => {
                   const newArr = [...requiredItems];
                   newArr[idx].target_qty = parseInt(e.target.value);
                   setRequiredItems(newArr);
                 }} 
                 className="border p-2 rounded w-32" 
                 placeholder="Jami kerak"
               />
               
               {requiredItems.length > 1 && (
                 <button type="button" onClick={() => setRequiredItems(requiredItems.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded">
                   <Trash2 className="w-5 h-5" />
                 </button>
               )}
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={() => setRequiredItems([...requiredItems, { item_id: '', target_qty: 1000 }])}
            className="flex items-center text-blue-600 text-sm font-bold hover:underline mt-2"
          >
            <Plus className="w-4 h-4 mr-1" /> Yana mahsulot qo'shish
          </button>
        </div>

        <div><label className="block text-sm font-bold mb-1">Mukofot Puli Jami (Coin)</label><input type="number" required value={form.reward_coins_pool} onChange={e=>setForm({...form, reward_coins_pool: e.target.value})} className="border p-2 rounded w-full" /></div>
        <div><label className="block text-sm font-bold mb-1">Mukofot XP Jami</label><input type="number" required value={form.reward_xp_pool} onChange={e=>setForm({...form, reward_xp_pool: e.target.value})} className="border p-2 rounded w-full" /></div>
        
        <div className="col-span-2 mt-2 flex gap-3">
           <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded">
             {form.id ? "Yangilash" : "Saqlash"}
           </button>
           {form.id && (
             <button type="button" onClick={() => { setForm({ id: null, title: '', description: '', reward_coins_pool: 0, reward_xp_pool: 0, is_active: true }); setRequiredItems([{ item_id: '', target_qty: 1000 }]); }} className="bg-gray-400 text-white px-4 py-2 rounded font-bold">
               Bekor qilish
             </button>
           )}
        </div>
      </form>

      <table className="w-full bg-white shadow rounded text-left">
        <thead><tr className="border-b bg-gray-50">
          <th className="p-3">Nomi</th><th className="p-3">Jami yig'ilgan</th><th className="p-3">Amallar</th>
        </tr></thead>
        <tbody>
          {quests.map(q => (
            <tr key={q.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-bold">{q.title}</td>
              <td className="p-3 text-green-600 font-bold">{q.current_qty}</td>
              <td className="p-3 flex gap-3">
                <button onClick={() => edit(q)} className="text-blue-600 hover:text-blue-800" title="Tahrirlash"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => del(q.id)} className="text-red-500 hover:text-red-800" title="O'chirish"><Trash2 className="w-5 h-5" /></button>
              </td>
            </tr>
          ))}
          {quests.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-500">Hech qanday loyiha yo'q</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
