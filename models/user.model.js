// user.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userID: { type: String, required: true, unique: true },
  pseudo: { type: String, required: true },
  genre: { type: String, enum: ['Homme', 'Femme', 'Autre'], required: true },
  age: { type: Number, required: true, min: 0 },
  postalcode: { type: String, required: true },
  place: { type: String, required: true },
  image: { type: String, default: '' },
  filters: { type: Array, default: '' },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  id: { type: String, default: '' },  // Socket ID
  disconnected: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: Date.now },
  channels: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
