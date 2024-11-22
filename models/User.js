// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nickname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  point: { type: Number, default: 0 },
  role: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
