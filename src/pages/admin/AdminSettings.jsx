import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    work_clicks: 20,
    eat_clicks: 10,
    market_tax_percent: 5
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setFormData({
        work_clicks: Number(res.data.work_clicks) || 20,
        eat_clicks: Number(res.data.eat_clicks) || 10,
        market_tax_percent: res.data.market_tax_percent !== undefined ? Number(res.data.market_tax_percent) : 5
      });
    } catch (error) {
      toast.error('Sozlamalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/settings', formData);
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Global Sozlamalar</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">O'yin Sozlamalari (Clicker)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Barcha kasblar uchun ishlash marta bosilishi kerak (Work Clicks)
                </label>
                <input 
                  type="number" 
                  min="1"
                  required 
                  value={formData.work_clicks} 
                  onChange={e => setFormData({...formData, work_clicks: Number(e.target.value)})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">Bu raqam barcha o'yinchilarning "Yaratish" (ishlash) tugmasi uchun amal qiladi.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ovqatlanish marta bosilishi kerak (Eat Clicks)
                </label>
                <input 
                  type="number" 
                  min="1"
                  required 
                  value={formData.eat_clicks} 
                  onChange={e => setFormData({...formData, eat_clicks: Number(e.target.value)})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">Barcha foydalanuvchilar "Non yeyish" uchun shu raqamda bosishadi.</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bozor Solig'i (%)
                </label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  required 
                  value={formData.market_tax_percent} 
                  onChange={e => setFormData({...formData, market_tax_percent: Number(e.target.value)})} 
                  className="w-full px-4 py-2 border rounded-lg" 
                />
                <p className="text-xs text-slate-500 mt-1">O'yinchilar bozorda narsa sotganida shu foiz ularning daromadidan avtomatik ushlab qolinadi va tizimga yutiladi.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
