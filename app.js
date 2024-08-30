const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require("path");

app.use(
    cors({
        credentials: true,
    })
);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'https://coco-chat-c426881ffc0e.herokuapp.com',
        mathods: ['GET', 'POST'],
    }
})

let users = [];
let rooms = {};

io.on("connection", (socket) => {
    console.log('user conntect ', socket.id)

    io.emit('userList', users);

    socket.on('login', (userData) => {
        users.push({ id: socket.id, ...userData });
        // io.emit('updateUserList', users);

        console.log('user login: ', userData)
        console.log('users: ', users)
    })

    socket.on('requestUsers', () => {
        // Send the current list of users to the requesting client
        console.log('giving users', users)
        io.emit('updateUserList', users);
    });

    socket.on('getRooms', () => {
        socket.broadcast.emit('roomList', rooms)
    })

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('sendMessage', (messageData) => {
        // socket.broadcast.emit('recieveMessage', messageData)
        const sender = messageData.message.sender;
        const recipient = messageData.message.recipient;
        const recipientExist = users.some((user) => user.id === messageData.message.recipient);

        if (recipientExist) {
            socket.to(recipient).emit('recieveMessage', messageData.message);
            // create room
            const roomName = [sender, recipient].sort().join('-');
            if (rooms[roomName]) {
                rooms[roomName].push(messageData.message);
            } else {
                rooms[roomName] = [messageData.message]
            }
            // const roomExist = rooms.some((room) => room = roomName)
            // if (!roomExist) {

            // }
            console.log('room exist')
            console.log('room', rooms)
            // const room = [socket.current.id, selectedUser.id].sort().join('-');

        } else {
            console.log(`Recipient  is not connected.`);
        }
    }),

        socket.on('createRoom', (user1, user2) => {
            const roomName = [user1, user2].sort().join('-');
            if (rooms[roomName]) {

            } else {

            }
        })

    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        io.emit('updateUserList', users);
    })
})


app.use(express.static(path.join(__dirname, "/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/frontend/dist/index.html"));
});

module.exports = app;