import { PickNPayScraper } from './scrapers/PickNPayScraper.js';
import { CheckersScraper } from './scrapers/CheckersScraper.js';
import { WoolworthsScraper } from './scrapers/WoolworthsScraper.js';
import { ShopriteScraper } from './scrapers/ShopriteScraper.js';
import { SparScraper } from './scrapers/SparScraper.js';

export class PriceComparisonService {
  constructor() {
    this.scrapers = [
      new PickNPayScraper(),
      new CheckersScraper(),
      new WoolworthsScraper(),
      new ShopriteScraper(),
      new SparScraper()
    ];
    
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Compare prices across all retailers
   */
  async comparePrice(item, location = null) {
    const cacheKey = `${item}-${location || 'default'}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📦 Returning cached result for: ${item}`);
        return cached.data;
      }
    }

    console.log(`🔍 Fetching fresh prices for: ${item}`);
    
    // Fetch prices from all retailers concurrently
    const pricePromises = this.scrapers.map(async (scraper) => {
      try {
        console.log(`🏪 Fetching from ${scraper.retailerName}...`);
        const result = await scraper.searchProduct(item, location);
        console.log(`✅ ${scraper.retailerName}: ${result.available ? `R${result.price}` : 'Not available'}`);
        return result;
      } catch (error) {
        console.error(`❌ ${scraper.retailerName} error:`, error.message);
        return {
          retailer: scraper.retailerName,
          available: false,
          error: error.message,
          price: null,
          currency: 'ZAR',
          lastUpdated: new Date().toISOString()
        };
      }
    });

    const prices = await Promise.all(pricePromises);
    
    // Filter available prices and find cheapest
    const availablePrices = prices.filter(p => p.available && p.price !== null);
    const cheapest = availablePrices.length > 0 
      ? availablePrices.reduce((min, current) => 
          current.price < min.price ? current : min
        )
      : null;

    // Calculate savings
    const maxPrice = availablePrices.length > 0 
      ? Math.max(...availablePrices.map(p => p.price))
      : 0;
    
    const savings = cheapest && maxPrice > cheapest.price 
      ? maxPrice - cheapest.price 
      : 0;

    const result = {
      item,
      prices,
      cheapest,
      savings: Math.round(savings * 100) / 100,
      priceRange: availablePrices.length > 0 ? {
        min: Math.min(...availablePrices.map(p => p.price)),
        max: Math.max(...availablePrices.map(p => p.price))
      } : null,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Get supported retailers
   */
  getSupportedRetailers() {
    return this.scrapers.map(scraper => ({
      name: scraper.retailerName,
      id: scraper.retailerId,
      logo: scraper.logo,
      color: scraper.color,
      status: 'active'
    }));
  }

  /**
   * Get price history for a product (simulated for now)
   */
  async getPriceHistory(productId) {
    // In a real implementation, this would fetch from a database
    // For now, we'll simulate some price history
    const history = [];
    const currentDate = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Simulate price variations
      const basePrice = 20 + Math.random() * 30;
      const variation = 1 + (Math.random() - 0.5) * 0.2; // ±10% variation
      const price = Math.round(basePrice * variation * 100) / 100;
      
      history.push({
        date: date.toISOString().split('T')[0],
        price,
        retailer: 'Average',
        currency: 'ZAR'
      });
    }

    return history;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Price comparison cache cleared');
  }
}