import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { X, Battery, Coins, Briefcase, Calendar, Box } from 'lucide-react';

const UserDetailsModal = ({ isOpen, onClose, userId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      fetchDetails(userId);
    } else {
      setDetails(null);
    }
  }, [isOpen, userId]);

  const fetchDetails = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.get(`/admin/users/${id}`);
      setDetails(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Foydalanuvchi ma'lumotlari</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10 text-slate-500">Yuklanmoqda...</div>
          ) : details ? (
            <div className="space-y-6">
              {/* Header info */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold uppercase overflow-hidden border border-slate-200">
                  {details.profile_picture ? (
                     <img src={details.profile_picture.startsWith('http') ? details.profile_picture : `${api.defaults.baseURL.replace('/api', '')}${details.profile_picture}`} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                     <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${details.username}`} alt="avatar" className="w-full h-full object-cover bg-slate-100" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{details.username}</h2>
                  <p className="text-sm text-slate-500 font-mono">ID: {details.id}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-500 mb-2" />
                  <span className="text-xs text-slate-500 uppercase font-semibold">Balans</span>
                  <span className="text-lg font-bold text-slate-900">{Number(details.balance).toFixed(2)}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                  <Battery className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-xs text-slate-500 uppercase font-semibold">Energiya</span>
                  <span className="text-lg font-bold text-slate-900">{details.energy} / {details.max_energy}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Briefcase className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-xs text-slate-500 uppercase font-semibold">Kasb</span>
                  <span className="text-sm font-bold text-slate-900">{details.profession_name || 'Noma\'lum'}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Calendar className="w-6 h-6 text-purple-500 mb-2" />
                  <span className="text-xs text-slate-500 uppercase font-semibold">Ro'yxatdan o'tgan</span>
                  <span className="text-sm font-bold text-slate-900">{new Date(details.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Box className="w-5 h-5 mr-2 text-slate-600" /> 
                  Inventar
                </h3>
                {details.inventory && details.inventory.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-600">Mahsulot nomi</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-600">Turi</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Miqdori</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {details.inventory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.type === 'food' ? 'bg-green-100 text-green-700' :
                                item.type === 'tool' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                    Ushbu foydalanuvchining inventari bo'sh.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex justify-center py-10 text-red-500">Ma'lumot topilmadi.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
