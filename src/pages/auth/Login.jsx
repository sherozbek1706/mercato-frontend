import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GlassCard from '../../components/common/GlassCard';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Xush kelibsiz!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <GlassCard className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Tizimga kirish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 font-medium mb-1">Username</label>
            <input 
              type="text" 
              className="w-full input-glass"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 font-medium mb-1">Parol</label>
            <input 
              type="password" 
              className="w-full input-glass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full btn-primary mt-4">Kirish</button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-accent hover:underline">Akkauntingiz yo'qmi? Ro'yxatdan o'tish</Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
