import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://10.31.1.156:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;
