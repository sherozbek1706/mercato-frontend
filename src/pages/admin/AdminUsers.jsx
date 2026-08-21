import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import UserDetailsModal from '../../components/admin/UserDetailsModal';
import UserEditModal from '../../components/admin/UserEditModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [userToShow, setUserToShow] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const openDetails = (id) => {
    setUserToShow(id);
    setDetailsModalOpen(true);
  };

  const openEdit = (user) => {
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await api.delete(`/admin/users/${userToDelete}`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error('O\'chirishda xatolik');
    } finally {
      setUserToDelete(null);
    }
  };

  if (loading) return <div>Yuklanmoqda...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Foydalanuvchilar ({users.length})</h2>

      {users.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {Object.entries(
            users.reduce((acc, user) => {
              const profName = user.profession_name || 'Kasbsiz';
              acc[profName] = (acc[profName] || 0) + 1;
              return acc;
            }, {})
          ).map(([prof, count]) => (
            <div key={prof} className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm flex items-center gap-2">
              <span className="font-bold text-blue-600">{count} ta</span> 
              <span className="text-slate-700 font-medium capitalize">{prof.toLowerCase()}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Foydalanuvchi</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kasb</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Balans</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Energiya</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500 font-mono truncate max-w-[100px]">{user.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      {user.profile_picture ? (
                        <img src={`${api.defaults.baseURL.replace('/api', '')}${user.profile_picture}`} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} alt="avatar" className="w-full h-full object-cover bg-slate-100" />
                      )}
                    </div>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.profession_name}</td>
                <td className="px-6 py-4 text-sm text-amber-600 font-bold">{Number(user.balance).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-blue-600 font-medium">{user.energy}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openDetails(user.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded-md"
                    >
                      Batafsil
                    </button>
                    <button 
                      onClick={() => openEdit(user)}
                      className="text-amber-600 hover:text-amber-800 font-medium bg-amber-50 px-3 py-1 rounded-md"
                    >
                      Tahrirlash
                    </button>
                    <button 
                      onClick={() => confirmDelete(user.id)}
                      className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1 rounded-md"
                    >
                      O'chirish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Hozircha foydalanuvchilar yo'q</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="O'chirishni tasdiqlang"
        message="Haqiqatan ham bu foydalanuvchini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
      />

      <UserDetailsModal 
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        userId={userToShow}
      />

      <UserEditModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={userToEdit}
        onSaved={fetchUsers}
      />
    </div>
  );
};

export default AdminUsers;
