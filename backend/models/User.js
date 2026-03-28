const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  walletBalance: { type: Number, default: 0 },
  // 👇 NEW: Tracks who invited them! (Null if they are a top-level user)
  referredBy: { type: String, default: null }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);