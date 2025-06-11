import express from 'express';
import { PriceComparisonService } from '../services/PriceComparisonService.js';
import { validatePriceRequest } from '../middleware/validation.js';
import { cache } from '../middleware/cache.js';

const router = express.Router();
const priceService = new PriceComparisonService();

/**
 * GET /api/price
 * Compare prices across all supported retailers
 * Query params:
 *   - item: string (required) - Product name to search for
 *   - location: string (optional) - User location for store filtering
 */
router.get('/price', validatePriceRequest, cache, async (req, res) => {
  try {
    const { item, location } = req.query;
    
    console.log(`🔍 Price comparison request for: "${item}"`);
    
    const startTime = Date.now();
    const result = await priceService.comparePrice(item, location);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Price comparison completed in ${duration}ms`);
    
    // Add metadata to response
    const response = {
      ...result,
      metadata: {
        searchTerm: item,
        location: location || 'default',
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString(),
        totalRetailers: result.prices.length,
        availableRetailers: result.prices.filter(p => p.available).length
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Price comparison error:', error);
    res.status(500).json({
      error: 'Failed to fetch price comparison',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/price/retailers
 * Get list of supported retailers
 */
router.get('/price/retailers', (req, res) => {
  const retailers = priceService.getSupportedRetailers();
  res.json({
    retailers,
    count: retailers.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/price/history/:productId
 * Get price history for a specific product
 */
router.get('/price/history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const history = await priceService.getPriceHistory(productId);
    
    res.json({
      productId,
      history,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Price history error:', error);
    res.status(500).json({
      error: 'Failed to fetch price history',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;