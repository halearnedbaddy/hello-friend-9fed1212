// ═══════════════════════════════════════════════════════════════════════════
// Order Service
// ═══════════════════════════════════════════════════════════════════════════

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');

class OrderService {
  // Create Order from Cart
  static async createOrder(customerId, items, deliveryAddress, deliveryPhone) {
    try {
      const orderId = uuidv4();
      const orderNumber = `PLI-${Date.now()}`;
      
      // Calculate total
      let totalAmount = 0;
      const productsData = [];

      for (const item of items) {
        const productResult = await query(
          'SELECT id, price, agent_id FROM products WHERE id = $1',
          [item.productId]
        );

        if (productResult.rows.length === 0) {
          throw new ApiError(`Product ${item.productId} not found`, 404);
        }

        const product = productResult.rows[0];
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        
        productsData.push({
          productId: product.id,
          agentId: product.agent_id,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal
        });
      }

      // Create order
      const orderResult = await query(
        `INSERT INTO orders (id, order_number, customer_id, total_amount, delivery_address, delivery_phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [orderId, orderNumber, customerId, totalAmount, deliveryAddress, deliveryPhone]
      );

      // Create order items
      for (const product of productsData) {
        await query(
          `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), orderId, product.productId, product.quantity, product.unitPrice, product.totalPrice]
        );
      }

      // Get agent ID (usually the same for demo, but could be multiple)
      if (productsData.length > 0) {
        await query(
          'UPDATE orders SET agent_id = $1 WHERE id = $2',
          [productsData[0].agentId, orderId]
        );
      }

      return {
        ...orderResult.rows[0],
        items: productsData
      };
    } catch (error) {
      throw error;
    }
  }

  // Get Order Details
  static async getOrder(orderId, userId) {
    try {
      const result = await query(
        `SELECT o.*, 
                json_agg(json_build_object('id', oi.id, 'productId', oi.product_id, 'quantity', oi.quantity, 'unitPrice', oi.unit_price, 'totalPrice', oi.total_price)) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id = $1 AND o.customer_id = $2
         GROUP BY o.id`,
        [orderId, userId]
      );

      if (result.rows.length === 0) {
        throw new ApiError('Order not found', 404);
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get Customer Orders
  static async getCustomerOrders(customerId, status = null, limit = 20, offset = 0) {
    try {
      let sql = `SELECT * FROM orders WHERE customer_id = $1`;
      const params = [customerId];

      if (status) {
        sql += ` AND status = $2`;
        params.push(status);
      }

      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update Order Status
  static async updateOrderStatus(orderId, newStatus) {
    try {
      const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(newStatus)) {
        throw new ApiError('Invalid order status', 400);
      }

      const result = await query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [newStatus, orderId]
      );

      if (result.rows.length === 0) {
        throw new ApiError('Order not found', 404);
      }

      // TODO: Send notification based on status change
      // TODO: Update agent commission if order delivered

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get Agent Orders
  static async getAgentOrders(agentId, status = null, limit = 20, offset = 0) {
    try {
      let sql = `SELECT o.*, 
                        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
                        (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as total_items
                 FROM orders o
                 WHERE o.agent_id = $1`;
      const params = [agentId];

      if (status) {
        sql += ` AND o.status = $2`;
        params.push(status);
      }

      sql += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Cancel Order
  static async cancelOrder(orderId, customerId, reason = null) {
    try {
      const result = await query(
        `UPDATE orders 
         SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND customer_id = $2 AND status IN ('pending', 'confirmed')
         RETURNING *`,
        [orderId, customerId]
      );

      if (result.rows.length === 0) {
        throw new ApiError('Order cannot be cancelled', 400);
      }

      // TODO: Refund payment
      // TODO: Send notification

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderService;
