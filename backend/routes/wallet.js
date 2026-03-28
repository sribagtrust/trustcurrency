const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 👈 ADDED BCRYPT FOR PASSWORD CHECK
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

      if (agent.walletBalance < request.amountRequested) {
        return res.status(400).json({ message: 'You do not have enough Currency to approve this!' });
      }
      if (subUser.walletBalance + request.amountRequested > 20000) {
        return res.status(400).json({ message: 'Approval Blocked: Exceeds sub-user maximum limit.' });
      }

      agent.walletBalance -= request.amountRequested;
      subUser.walletBalance += request.amountRequested;
      request.status = 'Approved';
      
      await agent.save();
      await subUser.save();

      const newTx = new Transaction({
        sender: agent._id,
        recipient: subUser._id,
        amount: request.amountRequested,
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

// 👇 THE UPDATED "EXIT NETWORK" ROUTE (Chain-Link Logic) 👇
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

    // 👇 1. Find who this exiting user's Boss is (could be an ID, could be null if they are top-level)
    const grandBossId = user.referredBy;

    // 👇 2. Move all their Sub-Users up the chain to the Grand-Boss!
    await User.updateMany(
      { referredBy: user.uniqueId },
      { $set: { referredBy: grandBossId } }
    );

    // 👇 3. Reroute any pending requests to the Grand-Boss (Or Admin if null)
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

// 👇 Route to handle the "Edit Profile Details" form
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email !== undefined) user.email = email; // Allows clearing the email

    await user.save();
    res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;