const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); 

router.post('/transfer', auth, async (req, res) => {
  try {
    // Note: We still receive 'coins' from the frontend to keep the math engine running!
    const { recipientPhone, rupees, coins } = req.body; 
    const costAmount = Number(rupees);
    const rewardAmount = Number(coins);

    if (!recipientPhone || !costAmount || !rewardAmount) {
      return res.status(400).json({ message: 'Invalid transfer package details.' });
    }

    const sender = await User.findById(req.user.id);
    if (!sender) return res.status(404).json({ message: 'Sender account not found.' });

    if (sender.walletBalance < costAmount) {
      return res.status(400).json({ message: `Insufficient balance. You need ₹${costAmount} to send this package.` });
    }

    const recipient = await User.findOne({ phone: recipientPhone });
    if (!recipient) {
      return res.status(404).json({ message: `No account found for ${recipientPhone}.` });
    }

    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: 'You cannot send packages to yourself.' });
    }

    // 👇 THE NEW "ONE-WAY STREET" ANTI-LOOP RULE 👇
    // The database searches history to see if the current recipient EVER sent money to the current sender.
    const previousTransfer = await Transaction.findOne({
      sender: recipient._id,
      recipient: sender._id,
      type: 'Transfer'
    });

    if (previousTransfer) {
      return res.status(400).json({ 
        message: 'Transfer Blocked: You cannot send currency back to someone who previously sent it to you.' 
      });
    }

    // 👇 THE 20,000 MAXIMUM LIMIT CHECK 👇
    if (recipient.walletBalance + rewardAmount > 20000) {
      return res.status(400).json({ 
        message: `Transfer Blocked: This package would push the recipient over the 20,000 currency maximum limit.` 
      });
    }

    // Process the transfer
    sender.walletBalance -= costAmount;
    recipient.walletBalance += rewardAmount;

    await sender.save();
    await recipient.save();

    // Save the receipt
    const newTransaction = new Transaction({
      sender: sender._id,
      recipient: recipient._id,
      amount: rewardAmount,
      type: 'Transfer'
    });
    await newTransaction.save();

    res.json({ 
      message: `Success! Deducted ₹${costAmount} and sent ${rewardAmount} Currency to ${recipientPhone}!`,
      newBalance: sender.walletBalance
    });

  } catch (err) {
    console.error("Transfer Error:", err);
    res.status(500).json({ message: 'Server error during transfer processing.' });
  }
});

module.exports = router;