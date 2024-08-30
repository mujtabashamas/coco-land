import { io } from 'socket.io-client';

// Connect to the same URL where both frontend and backend are hosted
const socket = io('https://coco-chat-c426881ffc0e.herokuapp.com');

export default socket;