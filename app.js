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

mongoose.set('strictQuery', true);
mongoose
  .connect("mongodb+srv://devuser:wKGiVjkwtQBBIgaY@myatlasclusteredu.6qo1rsk.mongodb.net/chat-dev-db?retryWrites=true&w=majority")
  .then(
    () => {
      console.log("Mongo Connected");
    },
    (err) => {
      /** handle initial connection error */
      console.log(err);
      process.exit(1);
    }
  );
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
};

// Run the check on server start
checkAndAddChannels();

io.on('connection', (socket) => {
  console.log('connected', socket.id);

  // User login handler
  socket.on('login', async (userData) => {
    try {
      let user = await User.findOne({ userID: userData.userID });

      if (user) {
        // User reconnects, update socket ID
        user.id = socket.id;
        user.disconnected = false;
        user.lastActiveAt = Date.now();
        await user.save();
      } else {
        // New user login
        user = new User({
          ...userData,
          id: socket.id,
          disconnected: false,
          lastActiveAt: Date.now(),
        });
        await user.save();
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
      const sender = await User.findOne({ userID: messageData.message.sender.userID });
      const recipient = await User.findOne({ userID: messageData.message.recipient.userID });

      if (recipient) {
        socket.to(recipient.id).emit('recieveMessage', messageData.message);

        const roomName = [sender.userID, recipient.userID].sort().join('-');
        await Room.findOneAndUpdate(
          { roomName },
          { $push: { messages: messageData.message } },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Get updated group info
  socket.on('getUpdatedGroup', async (channelId) => {
    try {
      const channel = await Channel.findOne({ channelId });
      if (channel) {
        io.emit('updatedGroup', channel);
      }
    } catch (error) {
      console.error('Error getting group info:', error);
    }
  });

  // socket.on('requestChannels', async () => {
  //   let channels = await Channel.find({});
  //   socket.emit('userChannels', channels);
  // });


  // Remove user from channel
  socket.on('removeUserFromChannel', async (channelId, userID) => {
    try {
      await Channel.findOneAndUpdate(
        { channelId },
        { $pull: { users: userID } },
        { new: true }
      );
      // const channels = await Channel.find({});
      // io.emit('userChannels', channels);
    } catch (error) {
      console.error('Error removing user from channel:', error);
    }
  });

  // Join channel
  socket.on('joinChannel', async (channelId, userID) => {
    try {
      await Channel.findOneAndUpdate(
        { channelId },
        { $addToSet: User.findOne({ userID }) },
        { new: true }
      );
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  });

  // Send channel message
  socket.on('sendChannelMessage', async (channelId, message) => {
    try {
      const channel = await Channel.findOneAndUpdate(
        { channelId },
        { $push: { msgs: message } },
        { new: true }
      );

      if (channel) {
        channel.users.forEach((user) => {
          io.to(user.id).emit('recieveChannelMessaage', message, channelId);
        });
      }
    } catch (error) {
      console.error('Error sending channel message:', error);
    }
  });

  // Add channel
  socket.on('addChannel', async (channelName, admin) => {
    try {
      const channel = new Channel({ channelId: channelName, admin, users: [], msgs: [] });
      await channel.save();
      const channels = await Channel.find({});
      io.emit('userChannels', channels);
    } catch (error) {
      console.error('Error adding channel:', error);
    }
  });

  // Update channel
  socket.on('updateChannel', async (updateChannelId, newChannelName) => {
    try {
      await Channel.findOneAndUpdate(
        { channelId: updateChannelId },
        { channelId: newChannelName },
        { new: true }
      );
      const channels = await Channel.find({});
      io.emit('userChannels', channels);
    } catch (error) {
      console.error('Error updating channel:', error);
    }
  });

  // Remove user
  socket.on('removeUser', async (user) => {
    try {
      await Channel.updateMany(
        {},
        { $pull: { users: user._id } }
      );
      const channels = await Channel.find({});
      io.emit('userChannels', channels);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  });

  // Delete channel
  socket.on('deleteChannel', async (channelId) => {
    try {
      await Channel.deleteOne({ channelId });
      const channels = await Channel.find({});
      io.emit('userChannels', channels);
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('disconnected', socket.id);
    try {
      const user = await User.findOne({ id: socket.id });
      if (user) {
        user.disconnected = true;
        // remove user from channel in which user is

        await user.save();

        // setTimeout(async () => {
        //   await User.deleteOne({ userID: user.userID });
        //   const connectedUsers = await User.find({ disconnected: false });
        //   io.emit('updateUserList', connectedUsers);
        // }, 1000 * 60); // 1 minute delay

        io.emit('userDisconnected', user.userID);
      }
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
});

(async () => {
  // keep checking after 5 mins in users, if the user has been disconnected for more than 30 mins delete it
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

app.use(express.static(path.join(__dirname, "/frontend/dist")));

// remove user from channel api
app.post("/api/remove-user", async (req, res) => {
  const { channelId, userID } = req.body;
  try {
    await Channel.findOneAndUpdate
      (
        { channelId },
        { $pull: { users: userID } },
        { new: true }
      );
    await User.findOneAndUpdate
      (
        { userID },
        { $pull: { channels: channelId } },
        { new: true }
      );
    res.json({ msg: 'USer removed' });
  }
  catch (error) {
    console.error('Error removing user from channel:', error);
    res.status(500).json({ success: false });
  }
});

// update user filter
app.post("/api/update-user-filter", async (req, res) => {
  const { filterData, userID } = req.body;
  try {
    await User.findOneAndUpdate
      (
        { userID },
        { filter: filterData },
        { new: true }
      );
    res.json({ success: true });
  }
  catch (error) {
    console.error('Error updating user filter:', error);
    res.status(500).json({ success: false });
  }
});

// join channel api
app.post("/api/joinChannel", async (req, res) => {
  const { channelId, user } = req.body;
  try {
    await Channel.findOneAndUpdate
      (
        { channelId },
        { $addToSet: { users: user } },
        { new: true }
      );
    await User.findOneAndUpdate
      (
        { userID: user.userID },
        { $addToSet: { channels: channelId } },
        { new: true }
      );
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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/frontend/dist/index.html"));
});

const port = process.env.PORT || 3001;
server.listen(port);
console.log(`server running on ${port}`);
