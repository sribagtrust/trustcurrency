const mongoose = require('mongoose');

const rechargeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amountRequested: { type: Number, required: true },
  utrNumber: { type: String, required: true }, // 👈 Added UTR Number
  screenshotPath: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RechargeRequest', rechargeSchema);