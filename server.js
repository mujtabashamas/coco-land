const express = require('express');
const app = express();
const fs = require('fs');
const path = require("path");
const cors = require('cors');
const process = require('process');

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        mathods: ['GET', 'POST'],
    }
});

app.use(
    cors({
        credentials: true,
    })
);

let users = [];
let rooms = {};
let channels = [
    { channelId: "channel-1", users: [], msgs: [] },
    { channelId: "channel-2", users: [], msgs: [] },
    { channelId: "channel-3", users: [], msgs: [] },
    { channelId: "channel-4", users: [], msgs: [] },
    { channelId: "channel-5", users: [], msgs: [] },
    { channelId: "channel-6", users: [], msgs: [] },
    { channelId: "channel-7", users: [], msgs: [] },
    { channelId: "channel-8", users: [], msgs: [] },
    { channelId: "channel-9", users: [], msgs: [] },
    { channelId: "channel-10", users: [], msgs: [] },
    { channelId: "channel-11", users: [], msgs: [] },
    { channelId: "channel-12", users: [], msgs: [] },
    { channelId: "channel-13", users: [], msgs: [] },
    { channelId: "channel-14", users: [], msgs: [] },
    { channelId: "channel-15", users: [], msgs: [] },
    { channelId: "channel-16", users: [], msgs: [] },
    { channelId: "channel-17", users: [], msgs: [] },
    { channelId: "channel-18", users: [], msgs: [] },
    { channelId: "channel-19", users: [], msgs: [] },
    { channelId: "channel-20", users: [], msgs: [] },
    { channelId: "channel-21", users: [], msgs: [] },
    { channelId: "channel-22", users: [], msgs: [] },
    { channelId: "channel-23", users: [], msgs: [] },
    { channelId: "channel-24", users: [], msgs: [] },
    { channelId: "channel-25", users: [], msgs: [] },

]

io.on("connection", (socket) => {
    console.log('user conntect ', socket.id)

    socket.on('login', (userData) => {
        let saveUserData = {
            ...userData,
            score: 0,
            id: socket.id
        }
        users.push(saveUserData);
    })

    socket.on('updateUserImage', (imageData) => {
        const user = users.find(user => user.id === socket.id);
        user.image = imageData;
        io.emit('updateUserList', users);
    });

    socket.on('requestUsers', () => {
        io.emit('updateUserList', users);
    });

    socket.on('sendMessage', (messageData) => {
        const sender = messageData.message.sender;
        const recipient = messageData.message.recipient;
        const recipientExist = users.some((user) => user.id === messageData.message.recipient);

        if (recipientExist) {
            socket.to(recipient).emit('recieveMessage', messageData.message);
            const roomName = [sender, recipient].sort().join('-');
            if (rooms[roomName]) {
                rooms[roomName].push(messageData.message);
            } else {
                rooms[roomName] = [messageData.message]
            }
        } else {
            console.log(`Recipient  is not connected.`);
        }
    });

    socket.on('removeUserFromChannel', (channelId, user) => {
        channels = channels.map(channel => {
            if (channel.channelId === channelId) {
                channel.users = channel.users.filter(channelUser => channelUser.id !== user.id);
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
        console.log('message from the groupchat', message)
        console.log('channel id of above message', channelId)
        const channel = channels.find(ch => ch.channelId === channelId);
        console.log('found channel', channel)

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

    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        channels.forEach(channel => {
            channel.users = channel.users.filter(user => user.id !== socket.id);
            channel.msgs = channel.msgs.filter(msg => {
                const messageDate = new Date(msg.timestamp);
                return msg.sender.id !== socket.id && new Date(msg.timestamp) > oneDayAgo;
            });
        });
        io.emit('userDisconnected', { id: socket.id });
        io.emit('updateUserList', users);
    })
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

