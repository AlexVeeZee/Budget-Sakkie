import { BaseScraper } from './BaseScraper.js';

export class CheckersScraper extends BaseScraper {
  constructor() {
    super(
      'Checkers',
      'checkers',
      'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      '#00A651'
    );
    this.baseUrl = 'https://www.checkers.co.za';
  }

  async searchProduct(productName, location = null) {
    try {
      await this.delay(600 + Math.random() * 1000);
      
      const normalizedName = this.normalizeProductName(productName);
      
      const productDatabase = {
        'milk': { name: 'Fresh Milk 1L', price: 23.49, available: true },
        'bread': { name: 'White Bread 700g', price: 16.49, available: true },
        'eggs': { name: 'Farm Fresh Eggs 12 Pack', price: 36.49, available: true },
        'rice': { name: 'Long Grain Rice 2kg', price: 42.99, available: true },
        'chicken': { name: 'Chicken Breast Fillets per kg', price: 94.99, available: true },
        'bananas': { name: 'Bananas per kg', price: 18.99, available: true },
        'apples': { name: 'Granny Smith Apples per kg', price: 26.99, available: true },
        'coffee': { name: 'Ground Coffee 250g', price: 72.99, available: true },
        'sugar': { name: 'Granulated Sugar 2.5kg', price: 34.99, available: true },
        'oil': { name: 'Cooking Oil 750ml', price: 31.99, available: true }
      };

      const matchedProduct = Object.entries(productDatabase).find(([key, product]) => 
        normalizedName.includes(key) || key.includes(normalizedName.split(' ')[0])
      );

      if (matchedProduct) {
        const [, product] = matchedProduct;
        const priceVariation = 1 + (Math.random() - 0.5) * 0.08;
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
      console.error(`❌ Checkers scraping error:`, error);
      return this.createResult(false, null, null, null, error.message);
    }
  }
}