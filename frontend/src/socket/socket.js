import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (userData) => {
  socket = io('http://localhost:3001');
  // socket = io('/');

  return socket;
};

export const getSocket = () => socket;