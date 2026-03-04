// ═══════════════════════════════════════════════════════════════════════════  
// Auth Routes
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const { authMiddleware } = require('../middleware/auth.middleware');

// Register Customer (Phone)
router.post('/register/customer', async (req, res, next) => {
  try {
    const { phone, name, email } = req.body;
    
    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone and name required' });
    }

    const result = await AuthService.registerCustomer(phone, name, email);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({ error: 'userId and otp required' });
    }

    const result = await AuthService.verifyOTP(userId, otp);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Register Agent
router.post('/register/agent', authMiddleware, async (req, res, next) => {
  try {
    const { businessName, mpesaAccount, idNumber } = req.body;
    
    if (!businessName || !mpesaAccount || !idNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await AuthService.registerAgent(
      req.user.userId,
      businessName,
      mpesaAccount,
      idNumber,
      null // TODO: Handle KYC document upload
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const result = await AuthService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get Profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const profile = await AuthService.getUserProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

const authRoutes = router;
module.exports = { authRoutes };
