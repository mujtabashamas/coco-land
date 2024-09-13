import { io } from 'socket.io-client';

// Connect to the same URL where both frontend and backend are hosted
// const socket = io('http://localhost:3001');
const socket = io('/');

export default socket;