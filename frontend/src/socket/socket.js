import { io } from 'socket.io-client';

const socket = io('https://coco-chat-c426881ffc0e.herokuapp.com');

export default socket;