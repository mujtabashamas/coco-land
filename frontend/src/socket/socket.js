import { io } from 'socket.io-client';
// import { getUser } from '../features/userSlice'

// const userData = getUser();
// Connect to the same URL where both frontend and backend are hosted

// const socket = io('http://localhost:3001',
//   {
//     query: {
//       user: userData
//     }
//   });

// const socket = io('/', {
//   query: {
//     user: userData
//   }
// });
const socket = io('/');

export default socket;