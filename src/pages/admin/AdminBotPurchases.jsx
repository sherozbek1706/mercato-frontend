import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminBotPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await api.get('/admin/bot-purchases');
      setPurchases(res.data);
    } catch (error) {
      toast.error('Xaridlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Sirli Xaridor (NPC) Tarixi</h2>
        <button onClick={fetchPurchases} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
          Yangilash
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Sana</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kim Sotib Oldi (Bot)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Sotuvchi (O'yinchi)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Mahsulot</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Miqdor</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Summa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {new Date(p.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                  {p.bot_buyer_name}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {p.seller_name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 flex items-center">
                  <span className="text-xl mr-2">{p.item_icon}</span> {p.item_name}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                  {p.quantity_sold} ta
                </td>
                <td className="px-6 py-4 text-sm font-black text-amber-600 text-right">
                  {Number(p.total_price).toFixed(2)}
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Hozircha bot hech narsa sotib olmagan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBotPurchases;
