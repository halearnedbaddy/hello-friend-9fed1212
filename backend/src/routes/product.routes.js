// ═══════════════════════════════════════════════════════════════════════════
// Product Routes
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const ProductService = require('../services/product.service');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Get All Products (Public)
router.get('/', async (req, res, next) => {
  try {
    const { category = 'All', search = '', limit = 20, offset = 0 } = req.query;
    
    const products = await ProductService.getProducts(
      category,
      search,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ count: products.length, data: products });
  } catch (error) {
    next(error);
  }
});

// Get Product Detail
router.get('/:productId', async (req, res, next) => {
  try {
    const product = await ProductService.getProductDetail(req.params.productId);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Get Categories
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await ProductService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Get Featured Products
router.get('/featured/list', async (req, res, next) => {
  try {
    const products = await ProductService.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get Agent's Products (Protected)
router.get('/agent/products', authMiddleware, async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const products = await ProductService.getAgentProducts(
      req.user.userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ count: products.length, data: products });
  } catch (error) {
    next(error);
  }
});

// Create Product (Agent)
router.post('/', authMiddleware, requireRole('agent'), async (req, res, next) => {
  try {
    const { name, description, price, cost, originalPrice, stockQty, category, imageEmoji, badge } = req.body;
    
    if (!name || !price || !stockQty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await ProductService.createProduct(req.user.userId, {
      name, description, price, cost, originalPrice, stockQty, category, imageEmoji, badge
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// Update Product (Agent)
router.put('/:productId', authMiddleware, requireRole('agent'), async (req, res, next) => {
  try {
    const product = await ProductService.updateProduct(
      req.params.productId,
      req.user.userId,
      req.body
    );

    res.json(product);
  } catch (error) {
    next(error);
  }
});

const productRoutes = router;
module.exports = { productRoutes };
