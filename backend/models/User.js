const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true }, // The new generated ID (e.g., TC-123456)
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true }, // Phone is now required and unique
  email: { type: String, default: '' }, // Email is now optional
  password: { type: String, required: true },
  referralCodeUsed: { type: String, default: '' }, // Tracks who referred them
  role: { type: String, default: 'Customer' },
  walletBalance: { type: Number, default: 0 },
  networkTransfers: [{
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);