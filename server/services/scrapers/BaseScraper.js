import fetch from 'node-fetch';

export class BaseScraper {
  constructor(retailerName, retailerId, logo, color) {
    this.retailerName = retailerName;
    this.retailerId = retailerId;
    this.logo = logo;
    this.color = color;
    this.userAgent = process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.timeout = parseInt(process.env.REQUEST_TIMEOUT_MS) || 10000;
    this.maxRetries = parseInt(process.env.MAX_RETRIES) || 3;
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🌐 ${this.retailerName} - Attempt ${attempt}/${this.maxRetries}: ${url}`);
        
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
        
      } catch (error) {
        console.error(`❌ ${this.retailerName} - Attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Failed after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Extract price from text
   */
  extractPrice(text) {
    if (!text) return null;
    
    // Remove currency symbols and extract numeric value
    const priceMatch = text.replace(/[^\d.,]/g, '').match(/\d+(?:\.\d{2})?/);
    return priceMatch ? parseFloat(priceMatch[0]) : null;
  }

  /**
   * Normalize product name for searching
   */
  normalizeProductName(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Create standardized result object
   */
  createResult(available, price = null, productName = null, url = null, error = null) {
    return {
      retailer: this.retailerName,
      retailerId: this.retailerId,
      logo: this.logo,
      color: this.color,
      available,
      price,
      currency: 'ZAR',
      productName,
      url,
      error,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Search for product - to be implemented by subclasses
   */
  async searchProduct(productName, location = null) {
    throw new Error('searchProduct method must be implemented by subclass');
  }

  /**
   * Add delay between requests
   */
  async delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}