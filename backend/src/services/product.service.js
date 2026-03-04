// ═══════════════════════════════════════════════════════════════════════════
// Product Service
// ═══════════════════════════════════════════════════════════════════════════

const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { cacheSet, cacheGet } = require('../config/redis');
const { ApiError } = require('../middleware/error.middleware');

class ProductService {
  // Get All Products (with filtering & search)
  static async getProducts(category = 'All', search = '', limit = 20, offset = 0) {
    try {
      // Check cache
      const cacheKey = `products:${category}:${search}:${limit}:${offset}`;
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;

      let sql = `SELECT * FROM products WHERE status = 'active'`;
      const params = [];

      if (category && category !== 'All') {
        sql += ` AND category_id IN (SELECT id FROM categories WHERE name = $1)`;
        params.push(category);
      }

      if (search) {
        sql += ` AND name ILIKE $${params.length + 1}`;
        params.push(`%${search}%`);
      }

      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);

      // Cache for 1 hour
      await cacheSet(cacheKey, result.rows, 3600);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get Product Detail
  static async getProductDetail(productId) {
    try {
      const cacheKey = `product:${productId}`;
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;

      const result = await query(
        `SELECT p.*, c.name as category_name, a.business_name, a.tier
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN agents a ON p.agent_id = a.id
         WHERE p.id = $1`,
        [productId]
      );

      if (result.rows.length === 0) {
        throw new ApiError('Product not found', 404);
      }

      // Get reviews
      const reviewsResult = await query(
        `SELECT rating, comment, created_at FROM reviews WHERE product_id = $1 ORDER BY created_at DESC LIMIT 5`,
        [productId]
      );

      const product = {
        ...result.rows[0],
        reviews: reviewsResult.rows
      };

      // Cache for 1 hour
      await cacheSet(cacheKey, product, 3600);

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Get Agent's Products
  static async getAgentProducts(agentId, limit = 20, offset = 0) {
    try {
      const result = await query(
        `SELECT * FROM products 
         WHERE agent_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [agentId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Create Product (Agent)
  static async createProduct(agentId, productData) {
    try {
      const productId = uuidv4();
      const categoryResult = await query(
        'SELECT id FROM categories WHERE name = $1',
        [productData.category]
      );

      const categoryId = categoryResult.rows[0]?.id;

      const result = await query(
        `INSERT INTO products (
          id, agent_id, category_id, name, description, price, cost, 
          original_price, stock_qty, image_emoji, badge, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
        RETURNING *`,
        [
          productId, agentId, categoryId, productData.name, productData.description,
          productData.price, productData.cost, productData.originalPrice,
          productData.stockQty, productData.imageEmoji, productData.badge
        ]
      );

      // Clear cache
      // TODO: Invalidate product cache

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update Product (Agent)
  static async updateProduct(productId, agentId, updateData) {
    try {
      const updates = [];
      const params = [agentId, productId];
      let paramIndex = 3;

      if (updateData.name) {
        updates.push(`name = $${paramIndex++}`);
        params.push(updateData.name);
      }
      if (updateData.price !== undefined) {
        updates.push(`price = $${paramIndex++}`);
        params.push(updateData.price);
      }
      if (updateData.stockQty !== undefined) {
        updates.push(`stock_qty = $${paramIndex++}`);
        params.push(updateData.stockQty);
      }
      if (updateData.status) {
        updates.push(`status = $${paramIndex++}`);
        params.push(updateData.status);
      }

      const sql = `UPDATE products SET ${updates.join(', ')}, updated_at = NOW()
                   WHERE id = $1 AND agent_id = $2
                   RETURNING *`;

      const result = await query(sql, [productId, agentId, ...params.slice(2)]);

      if (result.rows.length === 0) {
        throw new ApiError('Product not found or unauthorized', 404);
      }

      // Clear cache
      // TODO: Invalidate product cache

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Search Products
  static async searchProducts(query, limit = 20) {
    try {
      const result = await query(
        `SELECT * FROM products 
         WHERE status = 'active' AND name ILIKE $1
         ORDER BY total_sold DESC
         LIMIT $2`,
        [`%${query}%`, limit]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get Featured Products
  static async getFeaturedProducts(limit = 10) {
    try {
      const result = await query(
        `SELECT * FROM products 
         WHERE status = 'active' AND is_featured = true
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get Categories
  static async getCategories() {
    try {
      const cacheKey = 'categories:all';
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;

      const result = await query(
        `SELECT * FROM categories WHERE is_active = true ORDER BY name`
      );

      // Cache for 24 hours
      await cacheSet(cacheKey, result.rows, 86400);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductService;
