// room.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  roomName: { type: String, required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: {
    type: Array,
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
