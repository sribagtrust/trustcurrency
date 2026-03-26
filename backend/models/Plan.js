// models/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  tierLevel: { type: Number, required: true, unique: true }, // 1 to 7
  name: { type: String, required: true },
  inrCost: { type: Number, required: true },
  coinReward: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Plan', planSchema);

/* Example Seed Data for Plans:
  { tierLevel: 1, name: "Starter", inrCost: 39, coinReward: 250 }
  { tierLevel: 2, name: "Bronze", inrCost: 100, coinReward: 650 }
  ...up to Tier 7
*/