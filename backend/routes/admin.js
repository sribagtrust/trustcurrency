const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 👈 FIX 1: Added bcrypt to fix Admin Registration
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const RechargeRequest = require('../models/RechargeRequest');
const Transaction = require('../models/Transaction'); // 👈 FIX 2: Added Transaction model to fix the Graph!

// @route   GET /api/admin/pending-requests
router.get('/pending-requests', auth, async (req, res) => {
  try {
    const requests = await RechargeRequest.find({ status: 'Pending' })
      .populate('user', 'name phone uniqueId email') 
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// @route   POST /api/admin/resolve-request/:id
router.post('/resolve-request/:id', auth, async (req, res) => {
  try {
    const { action } = req.body;
    const requestId = req.params.id;

    const request = await RechargeRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Request already resolved' });

    if (action === 'Approve') {
      const user = await User.findById(request.user);
      
      if (user.walletBalance + request.amountRequested > 20000) {
        return res.status(400).json({ 
          message: `Approval Blocked: This would push the user over the 20,000 limit. (Current: ${user.walletBalance})` 
        });
      }

      // Add the currency
      user.walletBalance += request.amountRequested;
      request.status = 'Approved';
      await user.save();

      // 👇 FIX 2: CREATE A RECEIPT SO THE GRAPH CAN DRAW IT! 👇
      const newTransaction = new Transaction({
        recipient: user._id, // No sender, because it comes from the System!
        amount: request.amountRequested,
        type: 'Recharge'
      });
      await newTransaction.save();
      
    } else if (action === 'Reject') {
      request.status = 'Rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await request.save();
    res.json({ message: `Request successfully ${action}d!` });

  } catch (err) {
    console.error("Resolve Error:", err);
    res.status(500).json({ message: 'Server error resolving request' });
  }
});

// @route   GET /api/admin/dashboard-stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingCount = await RechargeRequest.countDocuments({ status: 'Pending' });
    
    const adminGraphData = [
      { day: 'Mon', coinsDistributed: 1000, requests: 5 },
      { day: 'Tue', coinsDistributed: 2500, requests: 8 },
      { day: 'Wed', coinsDistributed: 1500, requests: 4 },
      { day: 'Thu', coinsDistributed: 4000, requests: 12 },
      { day: 'Fri', coinsDistributed: 8000, requests: 20 },
      { day: 'Sat', coinsDistributed: 12000, requests: 35 },
      { day: 'Sun', coinsDistributed: 15000, requests: 42 }
    ];

    res.json({ totalUsers, pendingCount, graphData: adminGraphData });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
});

// @route   GET /api/admin/users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user directory' });
  }
});

// @route   POST /api/admin/add-user
router.post('/add-user', auth, async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    
    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ message: 'User already exists with this phone.' });

    // Generate the 26SBGA- ID
    const year = new Date().getFullYear().toString().slice(-2);
    const uniqueId = `${year}SBGA-` + Math.floor(100000 + Math.random() * 900000).toString();
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, phone, email, password: hashedPassword, uniqueId });
    await user.save();
    
    res.json({ message: `Successfully created user ${name} with ID ${uniqueId}!` });
  } catch (err) {
    console.error("Add User Error:", err);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

module.exports = router;