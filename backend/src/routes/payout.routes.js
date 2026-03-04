// ═══════════════════════════════════════════════════════════════════════════
// Payout Routes
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const PayoutService = require('../services/payout.service');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Get Agent Earnings
router.get('/earnings', authMiddleware, requireRole('agent'), async (req, res, next) => {
  try {
    const earnings = await PayoutService.getAgentEarnings(req.user.userId);
    res.json(earnings);
  } catch (error) {
    next(error);
  }
});

// Request Payout (Agent)
router.post('/request', authMiddleware, requireRole('agent'), async (req, res, next) => {
  try {
    const { amount, notes } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const payout = await PayoutService.requestPayout(req.user.userId, amount, notes);
    res.status(201).json(payout);
  } catch (error) {
    next(error);
  }
});

// Get Payout History (Agent)
router.get('/history', authMiddleware, requireRole('agent'), async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const payouts = await PayoutService.getPayoutHistory(
      req.user.userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ count: payouts.length, data: payouts });
  } catch (error) {
    next(error);
  }
});

// Admin: Get All Payouts
router.get('/admin/list', authMiddleware, requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    const payouts = await PayoutService.getAllPayouts(
      status,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ count: payouts.length, data: payouts });
  } catch (error) {
    next(error);
  }
});

// Admin: Disburse Payouts (B2C)
router.post('/admin/disburse', authMiddleware, requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { payoutIds } = req.body;
    
    if (!payoutIds || !Array.isArray(payoutIds)) {
      return res.status(400).json({ error: 'Valid payoutIds array required' });
    }

    const results = await PayoutService.disbursePayouts(payoutIds, req.user.userId);
    res.json({ disbursed: results });
  } catch (error) {
    next(error);
  }
});

// M-Pesa B2C Callback (Queue Timeout)
router.post('/queue-timeout', (req, res) => {
  console.log('Queue timeout:', req.body);
  res.json({ ok: true });
});

// M-Pesa B2C Callback (Result)
router.post('/b2c-callback', async (req, res, next) => {
  try {
    // TODO: Handle B2C callback and update payout status
    console.log('B2C Callback:', req.body);
    
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    next(error);
  }
});

const payoutRoutes = router;
module.exports = { payoutRoutes };
