// models/Store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  location: { type: String },
  collectedCoins: { type: Number, default: 0 },
  pendingInrSettlement: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);