import fs from 'fs';
import path from 'path';

// Utility functions for data scraping
export class ScrapingUtils {
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static sanitizeText(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,()]/g, '')
      .substring(0, 200); // Limit length
  }

  static sanitizePrice(priceText) {
    if (!priceText) return null;
    
    // Extract numeric value from price string
    const match = priceText.match(/R?\s*(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : null;
  }

  static sanitizeImageUrl(url, baseUrl) {
    if (!url) return null;
    
    // Handle relative URLs
    if (url.startsWith('//')) {
      return `https:${url}`;
    } else if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    } else if (url.startsWith('http')) {
      return url;
    }
    
    return null;
  }

  static generateProductId(retailer, productName, category) {
    const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanRetailer = retailer.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    return `${cleanRetailer}-${cleanCategory}-${cleanName}-${Date.now()}`;
  }

  static validateProduct(product) {
    const required = ['productId', 'productName', 'retailer', 'price'];
    return required.every(field => product[field] !== null && product[field] !== undefined);
  }

  static saveToFile(data, filename) {
    const outputDir = path.join(process.cwd(), 'data', 'scraped');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Data saved to: ${filepath}`);
    return filepath;
  }

  static loadExistingData(filename) {
    const filepath = path.join(process.cwd(), 'data', 'scraped', filename);
    
    if (fs.existsSync(filepath)) {
      try {
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        console.warn(`⚠️ Could not load existing data from ${filepath}:`, error.message);
      }
    }
    
    return [];
  }

  static getRandomUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    ];
    
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  static logProgress(current, total, retailer, category) {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    
    process.stdout.write(`\r🔄 [${progressBar}] ${percentage}% - ${retailer} - ${category} (${current}/${total})`);
    
    if (current === total) {
      console.log('\n');
    }
  }
}

export class RateLimiter {
  constructor(requestsPerSecond = 0.5) {
    this.requestsPerSecond = requestsPerSecond;
    this.lastRequestTime = 0;
  }

  async waitIfNeeded() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.requestsPerSecond;
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await ScrapingUtils.delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }
}