const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const RechargeRequest = require('../models/RechargeRequest');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// 👇 THE PRICING PLAN ALGORITHM FOR THE BACKEND 👇
const getRupeeCost = (currencyAmount) => {
  const plans = [
    { rupees: 39, currency: 250 },
    { rupees: 50.50, currency: 500 },
    { rupees: 76.50, currency: 1000 },
    { rupees: 126.50, currency: 2000 },
    { rupees: 276.50, currency: 5000 },
    { rupees: 533.00, currency: 10000 },
    { rupees: 1303.00, currency: 20000 }
  ];
  // Find the exact plan, otherwise fallback to the raw amount (prevents breaking on custom amounts)
  const plan = plans.find(p => p.currency === Number(currencyAmount));
  return plan ? plan.rupees : Number(currencyAmount); 
};

router.get('/dashboard-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const transactions = await Transaction.find({
      $or: [{ sender: req.user.id }, { recipient: req.user.id }]
    })
    .populate('sender', 'name phone')
    .populate('recipient', 'name phone')
    .sort({ date: -1 });

    const pendingSubRequests = await RechargeRequest.find({ 
      agentId: user.uniqueId, 
      status: 'Pending' 
    }).populate('user', 'name phone uniqueId');

    res.json({ ...user._doc, transactions, pendingSubRequests });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/recharge-request', [auth, upload.single('screenshot')], async (req, res) => {
  try {
    const { amount, utrNumber } = req.body;
    
    const requestingUser = await User.findById(req.user.id);
    const assignedAgent = requestingUser.referredBy ? requestingUser.referredBy : 'Admin';

    const newRequest = new RechargeRequest({
      user: req.user.id,
      amountRequested: amount,
      utrNumber: utrNumber,
      screenshotPath: req.file ? `/uploads/${req.file.filename}` : 'CASH',
      agentId: assignedAgent 
    });

    await newRequest.save();
    res.status(201).json({ message: `Success! Request sent to ${assignedAgent === 'Admin' ? 'the Admin' : 'your Agent'} for approval.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error processing request' });
  }
});

router.post('/resolve-sub-request/:id', auth, async (req, res) => {
  try {
    const { action } = req.body;
    const request = await RechargeRequest.findById(req.params.id);
    const agent = await User.findById(req.user.id);

    if (!request || request.agentId !== agent.uniqueId) return res.status(400).json({ message: 'Unauthorized' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Already resolved' });

    if (action === 'Approve') {
      const subUser = await User.findById(request.user);
      
      // 👇 USE THE ALGORITHM TO FIND THE ACTUAL COST (e.g., 39 instead of 250) 👇
      const costToAgent = getRupeeCost(request.amountRequested);

      // Check if the Agent has enough to cover the RUPEE cost
      if (agent.walletBalance < costToAgent) {
        return res.status(400).json({ message: `Insufficient balance! You need at least ₹${costToAgent} to approve this request.` });
      }
      if (subUser.walletBalance + request.amountRequested > 20000) {
        return res.status(400).json({ message: 'Approval Blocked: Exceeds sub-user maximum limit.' });
      }

      // 👇 DEDUCT THE RUPEE COST (39) FROM AGENT, BUT ADD THE CURRENCY (250) TO SUB-USER 👇
      agent.walletBalance -= costToAgent;
      subUser.walletBalance += request.amountRequested;
      
      request.status = 'Approved';
      
      await agent.save();
      await subUser.save();

      const newTx = new Transaction({
        sender: agent._id,
        recipient: subUser._id,
        amount: request.amountRequested, // We still log "250" in the DB so the receipt shows the currency sent
        type: 'Transfer'
      });
      await newTx.save();

    } else if (action === 'Reject') {
      request.status = 'Rejected';
    }

    await request.save();
    res.json({ message: `Request ${action}d successfully!` });
  } catch (err) {
    res.status(500).json({ message: 'Server error resolving sub-user request' });
  }
});

router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// The Chain-Link Collapse Exit Route
router.delete('/exit-account', auth, async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide your phone number and password.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.phone !== phone) return res.status(400).json({ message: 'Incorrect phone number.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password.' });

    const grandBossId = user.referredBy;

    await User.updateMany(
      { referredBy: user.uniqueId },
      { $set: { referredBy: grandBossId } }
    );

    await RechargeRequest.updateMany(
      { agentId: user.uniqueId, status: 'Pending' },
      { $set: { agentId: grandBossId || 'Admin' } }
    );

    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account securely closed. Sub-users successfully moved up the chain.' });
  } catch (err) {
    console.error("Exit Error:", err);
    res.status(500).json({ message: 'Server error during account exit.' });
  }
});

module.exports = router;