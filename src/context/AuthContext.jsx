import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      if (data && data.id) {
        if (!socket.connected) {
          socket.connect();
        }
        socket.emit('join_room', data.id);
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
      localStorage.removeItem('token');
      if (socket.connected) socket.disconnect();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    await fetchUser();
  };

  const register = async (username, password, profession_id) => {
    const { data } = await api.post('/auth/register', { username, password, profession_id });
    localStorage.setItem('token', data.token);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (socket.connected) socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
