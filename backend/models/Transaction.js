const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  
  // 👇 Look right here! We added 'Transfer' to the official VIP list
  type: { 
    type: String, 
    enum: ['Recharge', 'Withdrawal', 'Transfer'], 
    required: true 
  }, 
  
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);