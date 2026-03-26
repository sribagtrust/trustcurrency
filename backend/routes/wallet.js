const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const RechargeRequest = require('../models/RechargeRequest');
const Transaction = require('../models/Transaction'); // 👈 We added this to pull real history!
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });

// @route   GET /api/wallet/dashboard-data
// @desc    Get user profile, balance, and REAL transaction history
// @access  Private
router.get('/dashboard-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // 1. Fetch ALL real transactions where this user is either the sender OR the receiver
    const transactions = await Transaction.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    })
    .populate('sender', 'name phone') // Pull the sender's name/phone so we can show it in the ledger
    .populate('recipient', 'name phone') // Pull the recipient's name/phone
    .sort({ date: -1 }); // Sort by newest first

    // 2. Send everything to the React Frontend
    res.json({
      name: user.name,
      phone: user.phone, // Sending for the new Profile section
      email: user.email, // Sending for the new Profile section
      uniqueId: user.uniqueId,
      walletBalance: user.walletBalance,
      transactions: transactions // 👈 The REAL data for the Graph and Ledger!
    });

  } catch (err) {
    console.error("Dashboard Data Error:", err);
    res.status(500).json({ message: 'Server Error fetching dashboard data' });
  }
});

router.post('/recharge-request', [auth, upload.single('screenshot')], async (req, res) => {
  try {
    const { amount, utrNumber } = req.body; // 👈 Catch UTR from frontend

    if (!req.file || !utrNumber) {
      return res.status(400).json({ message: 'Please provide both a UTR number and a screenshot.' });
    }

    const newRequest = new RechargeRequest({
      user: req.user.id,
      amountRequested: amount,
      utrNumber: utrNumber, // 👈 Save to database
      screenshotPath: `/uploads/${req.file.filename}` 
    });

    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully! Waiting for Admin approval.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error processing request' });
  }
});

module.exports = router;