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
    market_tax_percent: 5,
    bot_buyer_enabled: false,
    bot_buyer_probability: 70,
    bot_buyer_min_qty: 1,
    bot_buyer_max_qty: 5,
    bot_buyer_min_price: 0.01,
    bot_buyer_max_price: 1000,
    bot_buyer_names: 'Ali, Hasan, Boyota, Savdogar'
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
        market_tax_percent: res.data.market_tax_percent !== undefined ? Number(res.data.market_tax_percent) : 5,
        bot_buyer_enabled: res.data.bot_buyer_enabled === 'true',
        bot_buyer_probability: res.data.bot_buyer_probability !== undefined ? Number(res.data.bot_buyer_probability) : 70,
        bot_buyer_min_qty: res.data.bot_buyer_min_qty !== undefined ? Number(res.data.bot_buyer_min_qty) : 1,
        bot_buyer_max_qty: res.data.bot_buyer_max_qty !== undefined ? Number(res.data.bot_buyer_max_qty) : 5,
        bot_buyer_min_price: res.data.bot_buyer_min_price !== undefined ? Number(res.data.bot_buyer_min_price) : 0.01,
        bot_buyer_max_price: res.data.bot_buyer_max_price !== undefined ? Number(res.data.bot_buyer_max_price) : 1000,
        bot_buyer_names: res.data.bot_buyer_names || 'Ali, Hasan, Boyota, Savdogar'
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

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Sirli Xaridor Boti (NPC)</h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.bot_buyer_enabled}
                  onChange={(e) => setFormData({...formData, bot_buyer_enabled: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Tizim avtomatik ravishda foydalanuvchilardan narsa sotib olishi yoqilganmi?</span>
              </label>
              
              {formData.bot_buyer_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Xarid ehtimolligi (0-100%)
                    </label>
                    <input 
                      type="number" 
                      min="1" max="100"
                      value={formData.bot_buyer_probability} 
                      onChange={e => setFormData({...formData, bot_buyer_probability: Number(e.target.value)})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white" 
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Bot har 1 daqiqada shuncha foiz ehtimollik bilan kimdandir narsa sotib oladi.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Min. miqdor
                    </label>
                    <input 
                      type="number" min="1"
                      value={formData.bot_buyer_min_qty} 
                      onChange={e => setFormData({...formData, bot_buyer_min_qty: Number(e.target.value)})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max. miqdor
                    </label>
                    <input 
                      type="number" min="1"
                      value={formData.bot_buyer_max_qty} 
                      onChange={e => setFormData({...formData, bot_buyer_max_qty: Number(e.target.value)})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Min. narx (1 dona uchun)
                    </label>
                    <input 
                      type="number" step="0.01" min="0"
                      value={formData.bot_buyer_min_price} 
                      onChange={e => setFormData({...formData, bot_buyer_min_price: Number(e.target.value)})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max. narx (1 dona uchun)
                    </label>
                    <input 
                      type="number" step="0.01" min="0"
                      value={formData.bot_buyer_max_price} 
                      onChange={e => setFormData({...formData, bot_buyer_max_price: Number(e.target.value)})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white" 
                    />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bot ismlari (vergul bilan ajrating)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ali, Hasan, Savdogar_1, Boyota"
                      value={formData.bot_buyer_names} 
                      onChange={e => setFormData({...formData, bot_buyer_names: e.target.value})} 
                      className="w-full px-4 py-2 border rounded-lg bg-white" 
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Bot xarid qilganda shu ismlardan birini tasodifiy (random) tanlaydi.</p>
                  </div>
                </div>
              )}
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
