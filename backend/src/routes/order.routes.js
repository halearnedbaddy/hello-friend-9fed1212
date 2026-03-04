// ═══════════════════════════════════════════════════════════════════════════
// Order Routes
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const OrderService = require('../services/order.service');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Create Order
router.post('/', authMiddleware, requireRole('customer'), async (req, res, next) => {
  try {
    const { items, deliveryAddress, deliveryPhone } = req.body;
    
    if (!items || items.length === 0 || !deliveryAddress || !deliveryPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await OrderService.createOrder(
      req.user.userId,
      items,
      deliveryAddress,
      deliveryPhone
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// Get Order Detail (Customer)
router.get('/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const order = await OrderService.getOrder(req.params.orderId, req.user.userId);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Get Customer Orders
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    const orders = await OrderService.getCustomerOrders(
      req.user.userId,
      status,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

// Get Agent Orders
router.get('/agent/list', authMiddleware, requireRole('agent'), async (req, res, next) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    const orders = await OrderService.getAgentOrders(
      req.user.userId,
      status,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

// Update Order Status (Admin)
router.patch('/:orderId/status', authMiddleware, requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const order = await OrderService.updateOrderStatus(req.params.orderId, status);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Cancel Order (Customer)
router.post('/:orderId/cancel', authMiddleware, async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const order = await OrderService.cancelOrder(
      req.params.orderId,
      req.user.userId,
      reason
    );

    res.json(order);
  } catch (error) {
    next(error);
  }
});

const orderRoutes = router;
module.exports = { orderRoutes };
