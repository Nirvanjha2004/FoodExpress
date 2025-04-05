const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get riders for restaurant owners
router.get('/riders', auth, async (req, res) => {
  try {
    // Only restaurant owners can see riders
    if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const riders = await User.find({ role: 'rider' })
      .select('name phone');
    
    res.json(riders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
