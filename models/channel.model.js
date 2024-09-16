// channel.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const channelSchema = new Schema({
  channelId: { type: String, required: true, unique: true },
  users: {
    type: Array,
    default: [],
  },
  admin: {
    type: Object,
    default: {},
  },
  msgs: {
    type: Array,
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
