const express = require('express');
const app = express();
const fs = require('fs');
const path = require("path");
const cors = require('cors');
const { channel } = require('process');
const { isRegExp } = require('util');

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
       // origin: 'http://localhost:5173',
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

    // io.emit('userList', users);

    socket.on('login', (userData) => {
        let saveUserData = {
            ...userData,
            score: 0,
            id: socket.id
        }
        users.push(saveUserData);
    })

    socket.on('requestUsers', () => {
        // Send the current list of users to the requesting client
        io.emit('updateUserList', users);
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
        } else {
            console.log(`Recipient  is not connected.`);
        }
    }),

        socket.on('joinChannel', (channelId, user) => {
            // channels.map((channel, index) {
            //     if(channel.channelId === )
            // })
            channels.map((channel) => {
                if (channel.channelId === channelId) {
                    channel.users.push(user);
                }
            })
            io.emit('userChannels', channels)

            // Check if the channel already exists in the channels array
            // let channel = channels.find(ch => ch.groupName === channelName);

            // if (!channel) {
            //     // If the channel doesn't exist, create a new one and add it to the channels array
            //     channel = {
            //         groupName: channelName,
            //         groupUsers: [...usernames],
            //         admin: admin,
            //         messages: []
            //     };
            //     channels.push(channel);
            // } else {
            //     // If the channel exists, add new users to the groupUsers array (if not already present)
            //     usernames.forEach(username => {
            //         if (!channel.groupUsers.includes(username)) {
            //             channel.groupUsers.push(username);
            //         }
            //     });
            // }
            // socket.join(channelName);
            // // Notify the users in the channel about the updated channel data
            // usernames.forEach(username => {
            //     io.to(username.id).emit('userChannels', channel);
            // });
        });

    // socket.on('requestChannels', (username) => {
    socket.on('requestChannels', () => {
        // let userChannels = [];

        // channels.forEach(channel => {
        //     if (channel.groupUsers.includes(username) || channel.admin === username) {
        //         userChannels.push(channel);
        //     }
        // });
        // Emit the user's channels back to the requesting user only
        socket.emit('userChannels', channels);
    });

    // Handle sending messages to a channel
    socket.on('sendChannelMessage', (channelId, message) => {
        console.log('message from the groupchat', message)
        console.log('channel id of above message', channelId)
        // Find the channel by its group name in the channels array
        const channel = channels.find(ch => ch.channelId === channelId);
        console.log('found channel', channel)

        if (channel) {
            // Add the message to the channel's messages array
            channel.msgs.push(message);

            // Emit the new message to all users in the channel
            channel.users.forEach(user => {
                io.to(user.id).emit('recieveChannelMessaage', message, channelId);
                // io.to(user.id).emit('userChannels', channels)
            });
        }
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
        io.emit('updateUserList', users);
    })
})

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get('/validate-postalcode/:postalcode', (req, res) => {
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

// module.exports = app;
