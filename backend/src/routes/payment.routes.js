// ═══════════════════════════════════════════════════════════════════════════
// Payment Routes
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const PaymentService = require('../services/payment.service');
const { authMiddleware } = require('../middleware/auth.middleware');

// Initiate STK Push (M-Pesa)
router.post('/initiate-stk', authMiddleware, async (req, res, next) => {
  try {
    const { orderId, phone, amount } = req.body;
    
    if (!orderId || !phone || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await PaymentService.initiateSTKPush(
      orderId,
      req.user.userId,
      phone,
      amount
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Query Payment Status
router.get('/status/:checkoutRequestId', authMiddleware, async (req, res, next) => {
  try {
    const status = await PaymentService.queryPaymentStatus(req.params.checkoutRequestId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// M-Pesa Webhook Callback (POST from Safaricom)
router.post('/mpesa-callback', async (req, res, next) => {
  try {
    // Verify webhook signature
    // TODO: Implement signature verification

    const result = await PaymentService.handleMpesaCallback(req.body);
    
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.json({
      ResultCode: 1,
      ResultDesc: 'Error'
    });
  }
});

// Stripe Payment (Coming Soon)
router.post('/stripe/initiate', authMiddleware, async (req, res, next) => {
  try {
    return res.status(501).json({ error: 'Stripe integration coming soon' });
  } catch (error) {
    next(error);
  }
});

// Flutterwave Payment (Coming Soon)
router.post('/flutterwave/initiate', authMiddleware, async (req, res, next) => {
  try {
    return res.status(501).json({ error: 'Flutterwave integration coming soon' });
  } catch (error) {
    next(error);
  }
});

const paymentRoutes = router;
module.exports = { paymentRoutes };
