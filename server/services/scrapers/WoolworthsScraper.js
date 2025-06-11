import { BaseScraper } from './BaseScraper.js';

export class WoolworthsScraper extends BaseScraper {
  constructor() {
    super(
      'Woolworths',
      'woolworths',
      'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      '#00A86B'
    );
    this.baseUrl = 'https://www.woolworths.co.za';
  }

  async searchProduct(productName, location = null) {
    try {
      await this.delay(700 + Math.random() * 1000);
      
      const normalizedName = this.normalizeProductName(productName);
      
      const productDatabase = {
        'milk': { name: 'Organic Full Cream Milk 1L', price: 28.99, available: true },
        'bread': { name: 'Artisan White Bread 600g', price: 18.99, available: true },
        'eggs': { name: 'Free Range Eggs 12 Pack', price: 44.99, available: true },
        'rice': { name: 'Organic Basmati Rice 1kg', price: 55.99, available: true },
        'chicken': { name: 'Free Range Chicken Breast per kg', price: 119.99, available: true },
        'bananas': { name: 'Organic Bananas per kg', price: 24.99, available: true },
        'apples': { name: 'Organic Red Apples per kg', price: 34.99, available: true },
        'coffee': { name: 'Premium Ground Coffee 250g', price: 89.99, available: true },
        'sugar': { name: 'Raw Sugar 2kg', price: 39.99, available: true },
        'oil': { name: 'Extra Virgin Olive Oil 500ml', price: 79.99, available: true }
      };

      const matchedProduct = Object.entries(productDatabase).find(([key, product]) => 
        normalizedName.includes(key) || key.includes(normalizedName.split(' ')[0])
      );

      if (matchedProduct) {
        const [, product] = matchedProduct;
        const priceVariation = 1 + (Math.random() - 0.5) * 0.06;
        const finalPrice = Math.round(product.price * priceVariation * 100) / 100;
        
        return this.createResult(
          true,
          finalPrice,
          product.name,
          `${this.baseUrl}/product/${encodeURIComponent(product.name)}`
        );
      } else {
        return this.createResult(false, null, null, null, 'Product not found');
      }
      
    } catch (error) {
      console.error(`❌ Woolworths scraping error:`, error);
      return this.createResult(false, null, null, null, error.message);
    }
  }
}