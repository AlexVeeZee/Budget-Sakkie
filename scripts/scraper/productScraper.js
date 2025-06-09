import puppeteer from 'puppeteer';
import { RETAILERS, TARGET_PRODUCTS, SCRAPING_CONFIG } from './config.js';
import { ScrapingUtils, RateLimiter } from './utils.js';

export class ProductScraper {
  constructor() {
    this.browser = null;
    this.rateLimiter = new RateLimiter(0.5); // 0.5 requests per second
    this.scrapedProducts = [];
    this.errors = [];
  }

  async initialize() {
    console.log('🚀 Initializing browser...');
    
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Browser initialized successfully');
  }

  async scrapeRetailer(retailerKey) {
    const retailer = RETAILERS[retailerKey];
    console.log(`\n📊 Starting to scrape ${retailer.name}...`);
    
    const page = await this.browser.newPage();
    
    // Set user agent and headers
    await page.setUserAgent(ScrapingUtils.getRandomUserAgent());
    await page.setExtraHTTPHeaders(SCRAPING_CONFIG.headers);
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    const retailerProducts = [];
    
    try {
      for (const [categoryName, categoryUrl] of Object.entries(retailer.categoryUrls)) {
        console.log(`\n🔍 Scraping category: ${categoryName}`);
        
        await this.rateLimiter.waitIfNeeded();
        
        const categoryProducts = await this.scrapeCategory(
          page, 
          retailer, 
          categoryName, 
          categoryUrl
        );
        
        retailerProducts.push(...categoryProducts);
        
        // Save progress after each category
        ScrapingUtils.saveToFile(
          retailerProducts, 
          `${retailer.name.toLowerCase().replace(/\s+/g, '-')}-products-partial.json`
        );
      }
      
    } catch (error) {
      console.error(`❌ Error scraping ${retailer.name}:`, error.message);
      this.errors.push({
        retailer: retailer.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      await page.close();
    }
    
    return retailerProducts;
  }

  async scrapeCategory(page, retailer, categoryName, categoryUrl) {
    const products = [];
    const fullUrl = `${retailer.baseUrl}${categoryUrl}`;
    
    try {
      console.log(`📄 Loading: ${fullUrl}`);
      
      await page.goto(fullUrl, { 
        waitUntil: 'networkidle2', 
        timeout: SCRAPING_CONFIG.timeout 
      });
      
      // Wait for products to load
      await page.waitForSelector(retailer.selectors.productCard, { timeout: 10000 });
      
      // Scroll to load more products (for infinite scroll)
      await this.autoScroll(page);
      
      // Extract product data
      const productElements = await page.$$(retailer.selectors.productCard);
      console.log(`📦 Found ${productElements.length} products in ${categoryName}`);
      
      let processedCount = 0;
      
      for (const element of productElements.slice(0, 20)) { // Limit to 20 products per category
        try {
          const productData = await this.extractProductData(
            page, 
            element, 
            retailer, 
            categoryName
          );
          
          if (productData && ScrapingUtils.validateProduct(productData)) {
            products.push(productData);
          }
          
          processedCount++;
          ScrapingUtils.logProgress(processedCount, Math.min(productElements.length, 20), retailer.name, categoryName);
          
        } catch (error) {
          console.warn(`⚠️ Error extracting product data:`, error.message);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error scraping category ${categoryName}:`, error.message);
      this.errors.push({
        retailer: retailer.name,
        category: categoryName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return products;
  }

  async extractProductData(page, element, retailer, categoryName) {
    try {
      // Extract basic product information
      const name = await this.extractText(element, retailer.selectors.name);
      const priceText = await this.extractText(element, retailer.selectors.price);
      const imageUrl = await this.extractAttribute(element, retailer.selectors.image, 'src');
      const availability = await this.extractText(element, retailer.selectors.availability);
      const unit = await this.extractText(element, retailer.selectors.unit);
      
      if (!name || !priceText) {
        return null;
      }
      
      // Check if this product matches our target list
      const isTargetProduct = TARGET_PRODUCTS.some(target => 
        name.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(name.toLowerCase().split(' ')[0])
      );
      
      if (!isTargetProduct) {
        return null;
      }
      
      const price = ScrapingUtils.sanitizePrice(priceText);
      if (!price || price <= 0) {
        return null;
      }
      
      // Generate product data
      const productData = {
        productId: ScrapingUtils.generateProductId(retailer.name, name, categoryName),
        productName: ScrapingUtils.sanitizeText(name),
        category: categoryName,
        retailer: retailer.name,
        price: price,
        unit: ScrapingUtils.sanitizeText(unit) || 'each',
        availability: this.parseAvailability(availability),
        imageUrl: ScrapingUtils.sanitizeImageUrl(imageUrl, retailer.baseUrl),
        lastUpdated: new Date().toISOString(),
        nutritionalInfo: {
          servingSize: null,
          calories: null,
          ingredients: []
        }
      };
      
      return productData;
      
    } catch (error) {
      console.warn(`⚠️ Error extracting product data:`, error.message);
      return null;
    }
  }

  async extractText(element, selector) {
    try {
      const textElement = await element.$(selector);
      if (textElement) {
        return await textElement.evaluate(el => el.textContent?.trim());
      }
    } catch (error) {
      // Selector not found, try direct text content
      try {
        return await element.evaluate(el => el.textContent?.trim());
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async extractAttribute(element, selector, attribute) {
    try {
      const targetElement = await element.$(selector);
      if (targetElement) {
        return await targetElement.evaluate((el, attr) => el.getAttribute(attr), attribute);
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  parseAvailability(availabilityText) {
    if (!availabilityText) return 'unknown';
    
    const text = availabilityText.toLowerCase();
    
    if (text.includes('in stock') || text.includes('available')) {
      return 'in-stock';
    } else if (text.includes('low stock') || text.includes('limited')) {
      return 'low-stock';
    } else if (text.includes('out of stock') || text.includes('unavailable')) {
      return 'out-of-stock';
    }
    
    return 'in-stock'; // Default assumption
  }

  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight || totalHeight > 3000) { // Limit scroll
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async scrapeAllRetailers() {
    console.log('🎯 Starting comprehensive grocery data scraping...');
    console.log(`📋 Target products: ${TARGET_PRODUCTS.length} items`);
    console.log(`🏪 Target retailers: ${Object.keys(RETAILERS).length} stores`);
    
    await this.initialize();
    
    const allProducts = [];
    
    for (const retailerKey of Object.keys(RETAILERS)) {
      try {
        const retailerProducts = await this.scrapeRetailer(retailerKey);
        allProducts.push(...retailerProducts);
        
        console.log(`✅ Completed ${RETAILERS[retailerKey].name}: ${retailerProducts.length} products`);
        
        // Save individual retailer data
        ScrapingUtils.saveToFile(
          retailerProducts, 
          `${RETAILERS[retailerKey].name.toLowerCase().replace(/\s+/g, '-')}-products.json`
        );
        
      } catch (error) {
        console.error(`❌ Failed to scrape ${RETAILERS[retailerKey].name}:`, error.message);
      }
    }
    
    // Save combined data
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `grocery-products-${timestamp}.json`;
    
    ScrapingUtils.saveToFile(allProducts, filename);
    
    // Save error log
    if (this.errors.length > 0) {
      ScrapingUtils.saveToFile(this.errors, `scraping-errors-${timestamp}.json`);
    }
    
    await this.cleanup();
    
    return {
      products: allProducts,
      errors: this.errors,
      summary: this.generateSummary(allProducts)
    };
  }

  generateSummary(products) {
    const summary = {
      totalProducts: products.length,
      byRetailer: {},
      byCategory: {},
      priceRange: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price)),
        average: products.reduce((sum, p) => sum + p.price, 0) / products.length
      },
      scrapingDate: new Date().toISOString()
    };
    
    // Group by retailer
    products.forEach(product => {
      summary.byRetailer[product.retailer] = (summary.byRetailer[product.retailer] || 0) + 1;
      summary.byCategory[product.category] = (summary.byCategory[product.category] || 0) + 1;
    });
    
    return summary;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser cleanup completed');
    }
  }
}