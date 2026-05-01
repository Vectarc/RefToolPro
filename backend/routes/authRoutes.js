// backend/routes/authRoutes.js — Supabase version
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const emailService = require('../services/emailService');
const { verifyAdmin } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least 1 number';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least 1 special character';
  return null;
};

// User Registration (Request Creation)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email and password are required' });

    if (username.length < 3 || username.length > 15)
      return res.status(400).json({ error: 'Username must be between 3 and 15 characters' });
    if (!/^[a-zA-Z0-9]+$/.test(username))
      return res.status(400).json({ error: 'Username must contain only letters and numbers' });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    try {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already exists' });

      const user = await User.create({ username, email, password });
      
      // Send notification to admin
      await emailService.sendAdminNotification({ username, email });

      return res.status(201).json({ 
        success: true, 
        message: 'Account creation request sent to admin. You will receive an email once approved.', 
        username: user.username 
      });
    } catch (dbError) {
      console.error('Database error during registration:', dbError.message);
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    try {
      const user = await User.findOne({ username });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      // Check if account is approved
      // Note: If status is null, we treat it as approved (for legacy users)
      if (user.status === 'pending') {
        return res.status(403).json({ 
          error: 'Your account is pending approval. You will receive an email once the admin approves your request.' 
        });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, role: 'user' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ success: true, token, username: user.username, role: 'user' });
    } catch (dbError) {
      console.error('Database error during login:', dbError.message);
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required' });

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid admin credentials' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid admin credentials' });

    const token = jwt.sign(
      { userId: admin.id, username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ success: true, token, username: admin.username, role: 'admin' });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// Verify Token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: { username: decoded.username, role: decoded.role } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ADMIN ROUTES FOR USER APPROVAL

// Get all pending registration requests
router.get('/pending-requests', verifyAdmin, async (req, res) => {
  try {
    const requests = await User.findAllPending();
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Approve a user request
router.post('/approve-request', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const user = await User.approve(userId);
    
    // Notify the user
    if (user && user.email) {
      await emailService.sendApprovalNotification(user.email, user.username);
    }

    res.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject a user request
router.post('/reject-request', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    await User.reject(userId);
    res.json({ success: true, message: 'User request rejected and removed' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

module.exports = router;
