const express = require('express');
const app = express();
const fs = require('fs');
const path = require("path");
const cors = require('cors');
const process = require('process');
const { clear } = require('console');

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

app.use(
    cors({
        credentials: true,
    })
);

let users = [];
let rooms = {};
let uuidToSocketMap = {};
let disconnectTimers = {};

const channels = [
    { channelId: "ANNONCES", users: [], msgs: [] },
    { channelId: "Général", users: [], msgs: [] },
    { channelId: "18-25 ans", users: [], msgs: [] },
    { channelId: "Gay", users: [], msgs: [] },
    { channelId: "Lesbiennes", users: [], msgs: [] },
    { channelId: "Trav-trans", users: [], msgs: [] },
    { channelId: "Fantasmes", users: [], msgs: [] },
    { channelId: "Lycéennes", users: [], msgs: [] },
    { channelId: "Au boulot", users: [], msgs: [] },
    { channelId: "Hébergement", users: [], msgs: [] },
    { channelId: "BDSM", users: [], msgs: [] },
    { channelId: "Voyeur", users: [], msgs: [] },
    { channelId: "Maillots de bain", users: [], msgs: [] },
    { channelId: "Jeune pour vieux", users: [], msgs: [] },
    { channelId: "ScenarSsTabou", users: [], msgs: [] },
    { channelId: "Jeune et jolie", users: [], msgs: [] },
    { channelId: "mari cocu", users: [], msgs: [] },
    { channelId: "cougar", users: [], msgs: [] },
    { channelId: "Naturisme", users: [], msgs: [] },
    { channelId: "Rebeu Renoi", users: [], msgs: [] },
    { channelId: "mamans", users: [], msgs: [] },
    { channelId: "Domination", users: [], msgs: [] },
    { channelId: "Vieux pervers", users: [], msgs: [] },
    { channelId: "Insultes", users: [], msgs: [] },
    { channelId: "Papa cokin", users: [], msgs: [] },
]

io.on("connection", (socket) => {
    console.log('connected', socket.id);

    socket.on('login', (userData) => {
        if (uuidToSocketMap[userData.userID]) {
            clearTimeout(disconnectTimers[userData.userID]);
            delete disconnectTimers[userData.userID];
            uuidToSocketMap[userData.userID] = socket.id;
            const userIndex = users.findIndex(user => user.userID === userData.userID)
            if (userIndex !== -1) {
                users[userIndex].id = socket.id;
                io.emit('userReconnected', { id: socket.id });
            }
        }
        else {
            users.push(userData);
            uuidToSocketMap[userData.userID] = socket.id;

        }
        io.emit('updateUserList', users);
    })

    socket.on('getUpdatedUser', (userID) => {
        const user = users.find(user => user.userID === userID);
        if (user) {
            io.to(socket.id).emit('updatedUser', user);
        }
    });

    socket.on('updateUserImage', (imageData, socketID) => {
        const user = users.find(user => user.id === socketID);
        if (user) {
            user.image = imageData;
            io.emit('updateUserList', users);
        }
    });

    socket.on('requestUsers', () => {
        io.emit('updateUserList', users);
    });

    socket.on('sendMessage', (messageData) => {
        console.log('messageData', messageData);
        const sender = messageData.message.sender.userID;
        const recipient = messageData.message.recipient;
        const recipientExist = users.some((user) => user.userID === messageData.message.recipient);

        if (recipientExist) {
            socket.to(recipient).emit('recieveMessage', messageData.message);
            const roomName = [sender, recipient].sort().join('-');
            console.log('roomName', roomName);
            rooms[roomName] = rooms[roomName] || [];
            rooms[roomName].push(messageData.message);
        }
    });

    socket.on('getUpdatedGroup', (channelId) => {
        const channel = channels.find(channel => channel.channelId === channelId);
        if (channel) {
            io.emit('updatedGroup', channel);
        }
    }
    );

    socket.on('removeUserFromChannel', (channelId, socketID) => {
        channels.map(channel => {
            if (channel.channelId === channelId) {
                channel.users = channel.users.filter(channelUser => channelUser.id !== socketID);
            }
            return channel;
        });
        io.emit('userChannels', channels);
    }
    );

    socket.on('joinChannel', (channelId, user) => {
        channels.map((channel) => {
            if (channel.channelId === channelId) {
                channel.users.push(user);
            }
        })
        io.emit('userChannels', channels)
    });

    // need to correct typings and stoptypings
    socket.on('typing', (recipient) => {
        socket.to(recipient).emit('typing', socket.id);
    });

    socket.on('stopTyping', (recipient) => {
        socket.to(recipient).emit('stopTyping', socket.id
        );
    });

    socket.on('groupTyping', (channelId) => {
        const channel = channels.find(channel => channel.channelId === channelId);
        if (channel) {
            channel.users.forEach(user => {
                if (user.id !== socket.id) {
                    io.to(user.id).emit('groupTyping', channelId);
                }
            });
        }
    });

    socket.on('stopGroupTyping', (channelId) => {
        const channel = channels.find(channel => channel.channelId === channelId);
        if (channel) {
            channel.users.forEach(user => {
                io.to(user.id).emit('stopGroupTyping', channelId);
            });
        }
    });

    socket.on('requestChannels', () => {
        socket.emit('userChannels', channels);
    });

    socket.on('sendChannelMessage', (channelId, message) => {
        const channel = channels.find(ch => ch.channelId === channelId);
        if (channel) {
            channel.msgs.push(message);
            channel.users.forEach(user => {
                io.to(user.id).emit('recieveChannelMessaage', message, channelId);
            });
        }
    });

    socket.on('addChannel', (channelName, admin) => {
        const channel = {
            channelId: channelName,
            users: [],
            admin: admin,
            messages: []
        };
        channels.push(channel);
        io.emit('userChannels', channels);
    });

    socket.on('updateChannel', (updateChannelId, newChannelName) => {
        channels = channels.map(channel => {
            if (channel.channelId === updateChannelId) {
                channel.channelId = newChannelName;
            }
            return channel;
        });
        io.emit('userChannels', channels);
    });

    socket.on('removeUser', (user) => {
        channels = channels.map(channel => {
            channel.users = channel.users.filter(channelUser => channelUser.id !== user.id);
            return channel;
        });
        io.emit('userChannels', channels);
    });

    socket.on('deleteChannel', (channelId) => {
        channels = channels.filter(channel => channel.channelId !== channelId);
        io.emit('userChannels', channels);
    });

    socket.on('disconnect', (socketID) => {
        const user = users.find(u => u.id === socketID);
        if (user) {
            const { userID } = user.userID;
            disconnectTimers[userID] = setTimeout(() => {
                users = users.filter(u => u.userID !== userID);
                delete uuidToSocketMap[userID];
                io.emit('updateUserList', users);
            }, 1000 * 60); // 30 minutes

        }
        // const user = users.find(u => u.id === socket.id);
        // if (user) {
        //     // Store socket ID and timestamp for reconnection handling
        //     userSockets.set(user.id, { socketId: socket.id, timestamp: Date.now() });
        //     disconnectTimers[user.id] = setTimeout(() => {
        //         users = users.filter(u => u.id !== user.id);
        //         io.emit('updateUserList', users);
        //     }, 1000 * 60 * 30); // 30 minutes
        // }
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        channels.forEach(channel => {
            channel.users = channel.users.filter(channelUser => channelUser.id !== socket.id);
            channel.msgs = channel.msgs.filter(msg => {
                const messageDate = new Date(msg.timestamp);
                return msg.sender.id !== socket.id && messageDate > oneDayAgo;
                io.emit('userChannels', channels);
            });
        });
        io.emit('userDisconnected', { id: socket.id });
    });
})

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get('/api/validate-postalcode/:postalcode', (req, res) => {
    const postalcode = req.params.postalcode;
    fs.readFile('./zipcodes.fr.json', (err, data) => {
        if (err) {
            console.error('Error reading zipcodes.json', err);
            res.status(500).send('Error reading zipcodes.json');
            return;
        }
        const zipcodes = JSON.parse(data);
        const place = zipcodes.find((item) => item.zipcode === postalcode)?.place;
        if (place) {
            res.json({ place });
        }
    });
});


app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/frontend/dist/index.html"));
});

const port = process.env.PORT || 3001;
server.listen(port);
console.log(`server running on ${port}`);

