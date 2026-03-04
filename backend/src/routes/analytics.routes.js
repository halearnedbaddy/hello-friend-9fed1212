// ═══════════════════════════════════════════════════════════════════════════
// Analytics Routes
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Get Agent Dashboard Stats
router.get('/agent', authMiddleware, requireRole('agent'), async (req, res, next) => {
  try {
    const agentId = req.user.userId;

    const statsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM orders WHERE agent_id = $1) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE agent_id = $1 AND status = 'delivered') as delivered_orders,
        (SELECT SUM(total_amount) FROM orders WHERE agent_id = $1 AND status = 'delivered') as total_sales,
        (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE agent_id = $1) as unique_customers,
        (SELECT ROUND(AVG(rating), 1) FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.agent_id = $1) as avg_rating
       `,
      [agentId]
    );

    res.json(statsResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get Admin Dashboard Stats
router.get('/admin', authMiddleware, requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const statsResult = await query(
      `SELECT 
        (SELECT COUNT(DISTINCT id) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_customers_30d,
        (SELECT COUNT(DISTINCT id) FROM agents) as total_agents,
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as delivered_orders,
        (SELECT SUM(total_amount) FROM orders WHERE status = 'delivered') as total_revenue,
        (SELECT SUM(total_sold) FROM products) as total_products_sold,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders
       `
    );

    res.json(statsResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get Sales Report (Last 7 Days)
router.get('/sales-report', authMiddleware, requireRole('agent', 'admin'), async (req, res, next) => {
  try {
    const dateFilter = req.user.role === 'agent' 
      ? 'o.agent_id = $1'
      : 'true';
    
    const params = req.user.role === 'agent' ? [req.user.userId] : [];

    const reportResult = await query(
      `SELECT 
        DATE(o.created_at) as date,
        COUNT(*) as orders,
        SUM(o.total_amount) as sales_amount,
        COUNT(DISTINCT o.customer_id) as unique_customers
       FROM orders o
       WHERE ${dateFilter} AND o.created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(o.created_at)
       ORDER BY date DESC`,
      params
    );

    res.json(reportResult.rows);
  } catch (error) {
    next(error);
  }
});

const analyticsRoutes = router;
module.exports = { analyticsRoutes };
