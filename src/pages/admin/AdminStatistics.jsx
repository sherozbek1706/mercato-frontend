import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStatistics = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats/market', {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setStats(res.data);
    } catch (error) {
      toast.error('Statistikani yuklashda xatolik yuz berdi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Bozor Statistikasi
        </h1>
        <button onClick={fetchStats} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">
          Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 text-slate-100 opacity-50 z-0" style={{ fontSize: '100px' }}>
                {item.icon}
             </div>
             <div className="relative z-10">
               <div className="flex items-center mb-4">
                 <span className="text-4xl mr-3">{item.icon}</span>
                 <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
               </div>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                   <span className="text-slate-500 flex items-center"><TrendingUp className="w-4 h-4 mr-1 text-slate-400"/> O'rtacha narx:</span>
                   <span className="font-bold text-blue-600">{item.avg_price ? Number(item.avg_price).toFixed(2) : 'Bozorda yo\'q'}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-100 p-2 rounded text-sm border-l-2 border-indigo-500">
                   <span className="text-slate-600 font-semibold">Tannarx (Ishlab chiqarish):</span>
                   <span className="font-bold text-indigo-700">
                     {item.base_cost === -1 ? 'Xomashyo' : (item.base_cost !== null && item.base_cost !== undefined ? Number(item.base_cost).toFixed(2) : 'Noma\'lum')}
                   </span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                   <span className="text-slate-500 flex items-center"><DollarSign className="w-4 h-4 mr-1 text-slate-400"/> Eng arzon:</span>
                   <span className="font-bold text-emerald-600">{item.min_price ? Number(item.min_price).toFixed(2) : '-'}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                   <span className="text-slate-500 flex items-center"><DollarSign className="w-4 h-4 mr-1 text-slate-400"/> Eng qimmat:</span>
                   <span className="font-bold text-red-500">{item.max_price ? Number(item.max_price).toFixed(2) : '-'}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm">
                   <span className="text-slate-500 flex items-center"><Package className="w-4 h-4 mr-1 text-slate-400"/> Jami sotuvda:</span>
                   <span className="font-bold text-slate-800">{item.total_quantity ? (item.total_quantity > 100000 ? 'Cheksiz' : item.total_quantity) : '0'} ta</span>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStatistics;
