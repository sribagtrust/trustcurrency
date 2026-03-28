const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); // 👈 Added for secure profile editing

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // 👇 1. Added referralCode to the incoming data
    const { name, phone, email, password, referralCode } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Please provide name, phone, and password.' });
    }

    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // 👇 2. Check if a valid referral code was used
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ uniqueId: referralCode });
      if (referrer) {
        referredBy = referrer.uniqueId; // Lock them to their parent!
      }
    }

    const year = new Date().getFullYear().toString().slice(-2);
    const uniqueId = `${year}SBGA-` + Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 👇 3. Save the referredBy tag into the database
    user = new User({ name, phone, email, password: hashedPassword, uniqueId, referredBy });
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("🔥 REGISTRATION ERROR:", err);
    res.status(500).send('Server error');
  }
});
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    let user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// 👇 THE NEW ROUTE: Allow users to edit Name and Email 👇
// @route   PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Find the logged-in user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update their details
    if (name) user.name = name;
    if (email !== undefined) user.email = email; 

    await user.save();
    res.json({ message: 'Profile updated successfully!' });

  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, uniqueId, newPassword } = req.body;

    if (!phone || !uniqueId || !newPassword) return res.status(400).json({ message: 'Please provide all required fields.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    const user = await User.findOne({ phone: phone, uniqueId: uniqueId });
    if (!user) return res.status(404).json({ message: 'Identity verification failed. Invalid Phone Number or Unique ID.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    res.json({ message: 'Password reset successfully! You can now log in.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

module.exports = router;