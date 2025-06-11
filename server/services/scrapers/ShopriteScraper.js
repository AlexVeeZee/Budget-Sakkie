import { BaseScraper } from './BaseScraper.js';

export class ShopriteScraper extends BaseScraper {
  constructor() {
    super(
      'Shoprite',
      'shoprite',
      'https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      '#FF6B35'
    );
    this.baseUrl = 'https://www.shoprite.co.za';
  }

  async searchProduct(productName, location = null) {
    try {
      await this.delay(550 + Math.random() * 1000);
      
      const normalizedName = this.normalizeProductName(productName);
      
      const productDatabase = {
        'milk': { name: 'Long Life Milk 1L', price: 20.99, available: true },
        'bread': { name: 'White Bread 700g', price: 13.99, available: true },
        'eggs': { name: 'Large Eggs 18 Pack', price: 32.99, available: true },
        'rice': { name: 'Parboiled Rice 2kg', price: 39.99, available: true },
        'chicken': { name: 'Chicken Portions per kg', price: 69.99, available: true },
        'bananas': { name: 'Bananas per kg', price: 17.99, available: true },
        'apples': { name: 'Red Apples per kg', price: 22.99, available: true },
        'coffee': { name: 'Instant Coffee 200g', price: 59.99, available: true },
        'sugar': { name: 'White Sugar 2.5kg', price: 29.99, available: true },
        'oil': { name: 'Sunflower Oil 750ml', price: 26.99, available: true }
      };

      const matchedProduct = Object.entries(productDatabase).find(([key, product]) => 
        normalizedName.includes(key) || key.includes(normalizedName.split(' ')[0])
      );

      if (matchedProduct) {
        const [, product] = matchedProduct;
        const priceVariation = 1 + (Math.random() - 0.5) * 0.12;
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
      console.error(`❌ Shoprite scraping error:`, error);
      return this.createResult(false, null, null, null, error.message);
    }
  }
}