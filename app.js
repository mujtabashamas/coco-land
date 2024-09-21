const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { Server } = require('http');
const socketIO = require('socket.io');
const bodyParser = require("body-parser");

const User = require('./models/user.model');
const Room = require('./models/room.model');
const Channel = require('./models/channel.model');

const app = express();
const server = Server(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// support parsing of application/json type post data
app.use(bodyParser.json({ limit: "20mb" }));

//support parsing of application/x-www-form-urlencoded post data
app.use(
  bodyParser.urlencoded({
    limit: "20mb",
    extended: true,
  })
);

let mongoConnected = false;
mongoose.set('strictQuery', true);

app.use(cors({ credentials: true }));

// Predefined channels
const predefinedChannels = [
  { channelId: "ANNONCES" },
  { channelId: "Général" },
  { channelId: "18-25 ans" },
  { channelId: "Gay" },
  { channelId: "Lesbiennes" },
  { channelId: "Trav-trans" },
  { channelId: "Fantasmes" },
  { channelId: "Lycéennes" },
  { channelId: "Au boulot" },
  { channelId: "Hébergement" },
  { channelId: "BDSM" },
  { channelId: "Voyeur" },
  { channelId: "Maillots de bain" },
  { channelId: "Jeune pour vieux" },
  { channelId: "ScenarSsTabou" },
  { channelId: "Jeune et jolie" },
  { channelId: "mari cocu" },
  { channelId: "cougar" },
  { channelId: "Naturisme" },
  { channelId: "Rebeu Renoi" },
  { channelId: "mamans" },
  { channelId: "Domination" },
  { channelId: "Vieux pervers" },
  { channelId: "Insultes" },
  { channelId: "Papa cokin" },
];

// Check and add channels to DB if not present
const checkAndAddChannels = async () => {
  try {
    for (const channelData of predefinedChannels) {
      const existingChannel = await Channel.findOne({ channelId: channelData.channelId });
      if (!existingChannel) {
        const newChannel = new Channel({ ...channelData, users: [], msgs: [] });
        await newChannel.save();
        console.log(`Channel ${channelData.channelId} added to the database.`);
      }
    }
  } catch (error) {
    console.error('Error checking or adding channels:', error);
  }
  return true;
};

const disconnectAllUsers = async () => {
  try {
    await User.updateMany({}, { disconnected: true });
    console.log('All users disconnected');
  } catch (error) {
    console.error('Error disconnecting all users:', error);
  }
};

io.on('connection', (socket) => {
  console.log('connected', socket.id);

  // User login handler
  socket.on('login', async (userData) => {
    try {
      // console.log(userData)
      let user = await User.findOne({ userID: userData.userID });

      if (user) {
        // User reconnects, update socket ID
        user.id = socket.id;
        user.disconnected = false;
        user.lastActiveAt = Date.now();
        await user.save();
        io.emit('reconnected', user.userID)
      } else {
        // New user login
        user = new User({
          ...userData,
          id: socket.id,
          disconnected: false,
          lastActiveAt: Date.now(),
        });
        await user.save();
        io.emit('refresh');
      }

      // const connectedUsers = await User.find({ disconnected: false });
      // io.emit('updateUserList', connectedUsers);
    } catch (error) {
      console.error('Error in login:', error);
    }
  });

  // Update User Image
  // socket.on('updateUserImage', async (imageData, userID) => {
  //   try {
  //     await User.findOneAndUpdate(
  //       { userID },
  //       { image: imageData },
  //       { new: true }
  //     );
  //     // const connectedUsers = await User.find({ disconnected: false });
  //     // io.emit('updateUserList', connectedUsers);
  //   } catch (error) {
  //     console.error('Error updating user image:', error);
  //   }
  // });

  // Request users
  // socket.on('requestUsers', async () => {
  //   try {
  //     const connectedUsers = await User.find({ disconnected: false });
  //     io.emit('updateUserList', connectedUsers);
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   }
  // });

  // Send direct message
  socket.on('sendMessage', async (messageData) => {
    try {
      const recipient = await User.findOne({ userID: messageData.recipient });

      if (recipient) {
        socket.to(recipient.id).emit('recieveMessage', messageData);

        const roomName = [messageData.sender.userID, messageData.recipient].sort().join('-');
        await Room.findOneAndUpdate(
          { roomName },
          { $push: { messages: messageData } },
          { upsert: true, new: true }
        );
      }
      console.log(messageData.message)
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('typing', async (userID) => {
    // userid = user234
    try {
      const reciever = await User.findOne({ userID });
      const sender = await User.findOne({ id: socket.id });
      if (sender && reciever) {
        socket.to(reciever.id).emit('typing', sender.userID);
      }
    } catch (error) {
      console.error('Error in typing:', error);
    }
  });

  socket.on('stopTyping', async (userID) => {
    try {
      const reciever = await User.findOne({ userID });
      const sender = await User.findOne({ id: socket.id });
      if (sender && reciever) {
        socket.to(reciever.id).emit('stopTyping', sender.userID);
      }
    } catch (error) {
      console.error('Error in stop typing:', error);
    }
  });

  socket.on('groupTyping', async (channelId) => {
    try {
      const channel = await Channel.findOne({ channelId });
      // if (channel && channel.users) {
      //   channel.users.map(u =>
      //     socket.to(u.id).emit('groupType', channelId)
      //   )
      // }
      if (channel) {
        await Promise.all(
          channel.users.map(async (user) => {
            const userData = await User.findOne({ userID: user.userID });
            if (userData) {
              socket.to(userData.id).emit('groupType', channelId);
            }
          })
        );
      }
    } catch (error) {
      console.error('Error in group typing:', error);
    }

  });

  socket.on('stopGroupTyping', async (channelId) => {
    try {
      const channel = await Channel.findOne({ channelId });
      if (channel) {
        await Promise.all(
          channel.users.map(async (user) => {
            const userData = await User.findOne({ userID: user.userID });
            if (userData) {
              socket.to(userData.id).emit('stopGroupType', channelId);
            }
          })
        );
      }
    } catch (error) {
      console.error('Error in stop group typing:', error);
    }
  });


  // Get updated group info
  // socket.on('getUpdatedGroup', async (channelId) => {
  //   try {
  //     const channel = await Channel.findOne({ channelId });
  //     if (channel) {
  //       io.emit('updatedGroup', channel);
  //     }
  //   } catch (error) {
  //     console.error('Error getting group info:', error);
  //   }
  // });

  socket.on('updateUser', (userID) => {
    io.emit('userUpdated', userID);
  });

  socket.on('updateChannel', (channelId) => {
    io.emit('channelUpdated', channelId);
    io.emit('refresh');
  });



  // socket.on('requestChannels', async () => {
  //   let channels = await Channel.find({});
  //   socket.emit('userChannels', channels);
  // });


  // Remove user from channel
  // socket.on('removeUserFromChannel', async (channelId, userID) => {
  //   try {
  //     await Channel.findOneAndUpdate(
  //       { channelId },
  //       { $pull: { users: userID } },
  //       { new: true }
  //     );
  //     // const channels = await Channel.find({});
  //     // io.emit('userChannels', channels);
  //     const channel = await Channel.findOne({ channelId })
  //     console.log('removed', channel.users.length)

  //   } catch (error) {
  //     console.error('Error removing user from channel:', error);
  //   }
  // });

  // Join channel
  // socket.on('joinChannel', async (userID, channelId) => {
  //   try {
  //     const user = await User.findOne({ userID });
  //     await Channel.findOneAndUpdate(
  //       { channelId },
  //       { $push: user },
  //       { new: true, }
  //     );
  //     const channel = await Channel.findOne({ channelId })
  //     console.log('joined', channel.users.length)
  //   } catch (error) {
  //     console.error('Error joining channel:', error);
  //   }
  // });



  // Send channel message
  socket.on('sendChannelMessage', async (channelId, message) => {
    try {
      const channel = await Channel.findOneAndUpdate(
        { channelId },
        { $push: { msgs: message } },
        { new: true }
      );

      if (channel) {
        await Promise.all(
          channel.users.map(async (user) => {
            const userData = await User.findOne({ userID: user.userID });
            const socketID = userData?.id;
            if (socketID) {
              io.to(socketID).emit('recieveChannelMessage', message);
              console.log('msg sent to user', userData.pseudo);
            }
          })
        );
        console.log('Total users in channel:', channel.users.length);
      }
    } catch (error) {
      console.error('Error sending channel message:', error);
    }
  });

  // Add channel
  // socket.on('addChannel', async (channelName, admin) => {
  //   try {
  //     const channel = new Channel({ channelId: channelName, admin, users: [], msgs: [] });
  //     await channel.save();
  //     const channels = await Channel.find({});
  //     io.emit('userChannels', channels);
  //   } catch (error) {
  //     console.error('Error adding channel:', error);
  //   }
  // });

  // Update channel
  // socket.on('updateChannel', async (updateChannelId, newChannelName) => {
  //   try {
  //     await Channel.findOneAndUpdate(
  //       { channelId: updateChannelId },
  //       { channelId: newChannelName },
  //       { new: true }
  //     );
  //     const channels = await Channel.find({});
  //     io.emit('userChannels', channels);
  //   } catch (error) {
  //     console.error('Error updating channel:', error);
  //   }
  // });

  // Remove user
  // socket.on('removeUser', async (user) => {
  //   try {
  //     await Channel.updateMany(
  //       {},
  //       { $pull: { users: user._id } }
  //     );
  //     const channels = await Channel.find({});
  //     io.emit('userChannels', channels);
  //   } catch (error) {
  //     console.error('Error removing user:', error);
  //   }
  // });

  // Delete channel
  // socket.on('deleteChannel', async (channelId) => {
  //   try {
  //     await Channel.deleteOne({ channelId });
  //     const channels = await Channel.find({});
  //     io.emit('userChannels', channels);
  //   } catch (error) {
  //     console.error('Error deleting channel:', error);
  //   }
  // });

  // Handle disconnect
  socket.on('disconnect', async () => {
    const user = await User.findOne({ id: socket.id });
    try {
      if (user) {
        // Mark user as disconnected
        user.disconnected = true;
        await user.save();

        io.emit('userDisconnected', user.userID); // Notify clients
        io.emit('refresh');

        setTimeout(async () => {
          const stillDisconnectedUser = await User.findOne({ userID: user.userID });
          if (stillDisconnectedUser && stillDisconnectedUser.disconnected) {
            await User.deleteOne({ userID: user.userID });
            await Channel.findOneAndUpdate(
              { 'users.userID': user.userID },
              { $pull: { users: { userID: user.userID } } }
            );
            console.log(`User ${user.userID} removed from the system and channels`);
            io.emit('userRemoved', user.userID);
          }
        }, 1 * 60 * 1000);
      }
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
});

(async () => {
  // keep checking after 5 mins in users, if the user has been disconnected for more than 30 mins delete it
  if (!mongoConnected) return true;
  setInterval(async () => {
    try {
      const users = await User.find({ disconnected: true });
      for (const user of users) {
        if (Date.now() - user.lastActiveAt > 1000 * 60 * 30) {
          await User.deleteOne({ userID: user.userID });
          const connectedUsers = await User.find({ disconnected: false });
          // io.emit('updateUserList', connectedUsers);
        }
      }
    } catch (error) {
      console.error('Error checking disconnected users:', error);
    }
  }, 1000 * 60 * 5); // 5 minutes interval
})();

// remove user filter
app.post("/api/remove-user-filter", async (req, res) => {
  const { filterData, userID } = req.body;
  try {
    const user = await User
      .findOneAndUpdate
      (
        { userID },
        { $pull: { filters: filterData } },
        { new: true }
      );
    res.json({ success: true });
    console.log('user', user)
  }
  catch (error) {
    console.error('Error removing user filter:', error);
    res.status(500).json({ success: false });
  }
});

// update user filter
app.post("/api/add-user-filter", async (req, res) => {
  const { filterData, userID } = req.body;
  try {
    const user = await User.findOneAndUpdate
      (
        { userID },
        { $addToSet: { filters: filterData } },
        { new: true }
      );
    res.json({ success: true });
    console.log('user', user)
  }
  catch (error) {
    console.error('Error updating user filter:', error);
    res.status(500).json({ success: false });
  }
});

// remove user from channel api
app.post("/api/remove-user", async (req, res) => {
  try {
    const { channelId, userID } = req.body;

    await Channel.findOneAndUpdate(
      { channelId }, // Find the channel by channelId
      { $pull: { users: { userID: userID } } }, // Remove the userID from the users array
      { new: true } // Return the updated document
    )
    // Remove the channel from the user's channels list
    await User.findOneAndUpdate(
      { userID }, // Find the user by userID
      { $pull: { channels: channelId } }, // Remove the channelId from the user's channels array
      { new: true } // Return the updated document
    );

    res.json({ msg: 'User removed' });
  } catch (error) {
    console.error('Error removing user from channel:', error);
    res.status(500).json({ success: false });
  }
});

// join channel api
app.post("/api/join-channel", async (req, res) => {
  try {
    const { channelId, userID } = req.body;
    const user = await User.findOne({ userID });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await Channel.findOneAndUpdate
      (
        { channelId },
        { $addToSet: { users: user } },
        { new: true }
      );
    await User.findOneAndUpdate
      (
        { userID },
        { $addToSet: { channels: channelId } },
        { new: true }
      );
    console.log('joined')
    const channel = await Channel.findOne({ channelId });
    console.log(`${user.pseudo} joined`, channel.users.length);
    res.json({ success: true });
  }
  catch (error) {
    console.error('Error joining channel:', error);
    res.status(500).json({ success: false });
  }
});

// add channel api post
app.post("/api/addChannel", async (req, res) => {
  const { channelId, admin } = req.body;
  const channel = new Channel({ channelId, admin, users: [], msgs: [] });
  await channel.save();
  const channels = await Channel.find({});
  res.json({ success: true });
});

// update channel api post
app.post("/api/updateChannel", async (req, res) => {
  const { channelId, newChannelName } = req.body;
  await Channel.findOneAndUpdate
    (
      { channelId },
      {
        channelId
          : newChannelName
      },
      { new: true }
    );
  const channels = await Channel.find({});
  res.json({ success: true });
});

// api to delete channel
app.delete('/api/deleteChannel/:channelId', async (req, res) => {
  const { channelId } = req.params;
  await Channel
    .findOneAndDelete
    (
      { channelId }
    );
  res.json({ success: true });
}
);

// getUsers api get
app.get("/api/getUsers", async (req, res) => {
  const users = await User.find({ disconnected: false });
  res.json(users);
});

// getChannels api get
app.get("/api/getChannels", async (req, res) => {
  const channels = await Channel.find({});
  res.json(channels);
});

// get user 
app.get("/api/getUser/:userID", async (req, res) => {
  const { userID } = req.params;
  const user = await User.findOne({ userID });
  console.log('user', user);
  res.json(user);
});

// get channel
app.get("/api/getChannel/:channelId", async (req, res) => {
  const { channelId } = req.params;
  const channel = await Channel
    .findOne({ channelId })
    .populate('users');
  res.json(channel);
}
);

// update user image api post
app.post("/api/update-user-image", async (req, res) => {
  const { imageData, userID } = req.body;
  try {
    await User.findOneAndUpdate
      (
        { userID },
        { image: imageData },
        { new: true }
      );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user image:', error);
    res.status(500).json({ success: false });
  }
});

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

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/frontend/dist/index.html"));
});

const port = process.env.PORT || 3001;


(async () => {
  while (true) {
    if (mongoConnected) {
      await checkAndAddChannels();
      await disconnectAllUsers();

      server.listen(port);
      console.log(`server running on ${port}`);
      break;
    }

    try {
      await mongoose.connect("mongodb+srv://devuser:wKGiVjkwtQBBIgaY@myatlasclusteredu.6qo1rsk.mongodb.net/chat-dev-db?retryWrites=true&w=majority");
      console.log("Mongo Connected");
      mongoConnected = true;
    } catch (err) {
      console.log("Mongo Connection Error:", err);
      process.exit(1);
    }
  }
})();