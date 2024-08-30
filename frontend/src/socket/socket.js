import { io } from 'socket.io-client';

// Connect to the same URL where both frontend and backend are hosted
const socket = io('https://coco-chat-c426881ffc0e.herokuapp.com', {
  transports: ['websocket'], // Ensures WebSocket transport is used
  withCredentials: true, // Ensure credentials are sent for authentication, if needed
});

export default socket;