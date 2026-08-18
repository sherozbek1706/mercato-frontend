import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'https://mercato-backend-9n0y.onrender.com';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
