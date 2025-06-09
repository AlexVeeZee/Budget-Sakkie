/**
 * Data Loader Utility for Budget Sakkie
 * Loads and processes the latest price data from CSV files
 */

import { Product, Price, Retailer } from '../types';

interface CSVProduct {
  product_id: string;
  product_name: string;
  current_price: string;
  availability_status: string;
  last_updated: string;
  retailer: string;
  category: string;
  unit: string;
  image_url: string;
}

interface PriceComparison {
  product: Product;
  prices: Price[];
  bestPrice: Price;
  savings: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export class DataLoader {
  private static instance: DataLoader;
  private cachedData: PriceComparison[] = [];
  private lastUpdate: Date | null = null;

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  /**
   * Load price data from the latest CSV files
   */
  async loadLatestPriceData(): Promise<PriceComparison[]> {
    try {
      // In a real implementation, this would fetch from an API or file system
      // For now, we'll simulate loading from the updated mock data
      
      const response = await fetch('/api/latest-prices');
      if (response.ok) {
        const data = await response.json();
        return this.processRawData(data);
      }
      
      // Fallback to mock data if API is not available
      return this.loadFromMockData();
      
    } catch (error) {
      console.warn('Failed to load latest price data, using mock data:', error);
      return this.loadFromMockData();
    }
  }

  /**
   * Process raw CSV data into structured format
   */
  private processRawData(rawData: CSVProduct[]): PriceComparison[] {
    const productGroups = new Map<string, CSVProduct[]>();
    
    // Group products by name
    rawData.forEach(item => {
      const normalizedName = item.product_name.toLowerCase().trim();
      if (!productGroups.has(normalizedName)) {
        productGroups.set(normalizedName, []);
      }
      productGroups.get(normalizedName)!.push(item);
    });

    const comparisons: PriceComparison[] = [];

    productGroups.forEach((products, productName) => {
      if (products.length === 0) return;

      // Create product object from first item
      const firstProduct = products[0];
      const product: Product = {
        id: firstProduct.product_id,
        name: firstProduct.product_name,
        brand: 'Generic', // Could be enhanced with brand detection
        category: firstProduct.category,
        barcode: `600123456789${firstProduct.product_id}`,
        image: firstProduct.image_url || this.getDefaultImage(firstProduct.category),
        unit: 'each',
        unitSize: firstProduct.unit
      };

      // Create price objects for each retailer
      const prices: Price[] = products.map((item, index) => ({
        id: `${item.product_id}-${index}`,
        productId: item.product_id,
        retailer: this.createRetailerObject(item.retailer),
        price: parseFloat(item.current_price),
        onSale: false, // Could be enhanced with sale detection
        lastUpdated: item.last_updated,
        availability: this.mapAvailabilityStatus(item.availability_status)
      }));

      // Find best price and calculate savings
      const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
      const bestPrice = sortedPrices[0];
      const worstPrice = sortedPrices[sortedPrices.length - 1];
      const savings = worstPrice.price - bestPrice.price;

      comparisons.push({
        product,
        prices,
        bestPrice,
        savings,
        priceRange: {
          min: bestPrice.price,
          max: worstPrice.price
        }
      });
    });

    return comparisons.sort((a, b) => b.savings - a.savings); // Sort by highest savings
  }

  /**
   * Create retailer object from name
   */
  private createRetailerObject(retailerName: string): Retailer {
    const retailerConfigs = {
      'Checkers': {
        id: 'checkers',
        color: '#00A651',
        logo: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      'Pick n Pay': {
        id: 'pick-n-pay',
        color: '#E31837',
        logo: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      'Woolworths': {
        id: 'woolworths',
        color: '#00A86B',
        logo: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      'Shoprite': {
        id: 'shoprite',
        color: '#FF6B35',
        logo: 'https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      },
      'SPAR': {
        id: 'spar',
        color: '#006B3F',
        logo: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
      }
    };

    const config = retailerConfigs[retailerName as keyof typeof retailerConfigs] || {
      id: 'unknown',
      color: '#6B7280',
      logo: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    };

    return {
      id: config.id,
      name: retailerName,
      logo: config.logo,
      color: config.color,
      locations: [{
        id: `${config.id}-1`,
        name: `${retailerName} Centurion`,
        address: 'Centurion Mall, Centurion',
        distance: 2.3,
        coordinates: [-25.8553, 28.1881],
        openingHours: 'Mon-Sun: 8:00-21:00'
      }]
    };
  }

  /**
   * Map availability status from CSV format
   */
  private mapAvailabilityStatus(status: string): 'in-stock' | 'low-stock' | 'out-of-stock' {
    switch (status) {
      case 'in_stock':
        return 'in-stock';
      case 'low_stock':
        return 'low-stock';
      case 'out_of_stock':
        return 'out-of-stock';
      default:
        return 'in-stock';
    }
  }

  /**
   * Get default image for category
   */
  private getDefaultImage(category: string): string {
    const categoryImages = {
      'Fresh Produce': 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Dairy': 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Meat': 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Bakery': 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Pantry': 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Beverages': 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      'Household': 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    };

    return categoryImages[category as keyof typeof categoryImages] || 
           'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop';
  }

  /**
   * Fallback to mock data
   */
  private async loadFromMockData(): Promise<PriceComparison[]> {
    // Import mock data and process it
    const { products, prices } = await import('../data/mockData');
    
    const comparisons: PriceComparison[] = [];

    products.forEach(product => {
      const productPrices = prices.filter(price => price.productId === product.id);
      
      if (productPrices.length > 0) {
        const sortedPrices = [...productPrices].sort((a, b) => a.price - b.price);
        const bestPrice = sortedPrices[0];
        const worstPrice = sortedPrices[sortedPrices.length - 1];
        const savings = worstPrice.price - bestPrice.price;

        comparisons.push({
          product,
          prices: productPrices,
          bestPrice,
          savings,
          priceRange: {
            min: bestPrice.price,
            max: worstPrice.price
          }
        });
      }
    });

    return comparisons.sort((a, b) => b.savings - a.savings);
  }

  /**
   * Get cached data or load fresh data
   */
  async getData(forceRefresh: boolean = false): Promise<PriceComparison[]> {
    const cacheExpiry = 30 * 60 * 1000; // 30 minutes
    const now = new Date();

    if (!forceRefresh && 
        this.cachedData.length > 0 && 
        this.lastUpdate && 
        (now.getTime() - this.lastUpdate.getTime()) < cacheExpiry) {
      return this.cachedData;
    }

    this.cachedData = await this.loadLatestPriceData();
    this.lastUpdate = now;

    return this.cachedData;
  }

  /**
   * Get best deals (highest savings)
   */
  async getBestDeals(limit: number = 10): Promise<PriceComparison[]> {
    const data = await this.getData();
    return data
      .filter(comparison => comparison.savings > 0)
      .slice(0, limit);
  }

  /**
   * Search products by name
   */
  async searchProducts(query: string): Promise<PriceComparison[]> {
    const data = await this.getData();
    const lowerQuery = query.toLowerCase();
    
    return data.filter(comparison => 
      comparison.product.name.toLowerCase().includes(lowerQuery) ||
      comparison.product.brand.toLowerCase().includes(lowerQuery) ||
      comparison.product.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<PriceComparison[]> {
    const data = await this.getData();
    return data.filter(comparison => 
      comparison.product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get price history for a product (simulated)
   */
  async getPriceHistory(productId: string): Promise<Array<{date: string, price: number, retailer: string}>> {
    // In a real implementation, this would fetch historical data
    // For now, we'll simulate some price history
    const data = await this.getData();
    const product = data.find(comparison => comparison.product.id === productId);
    
    if (!product) return [];

    const history = [];
    const currentDate = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      product.prices.forEach(price => {
        // Simulate price variation
        const variation = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
        const historicalPrice = price.price * variation;
        
        history.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(historicalPrice * 100) / 100,
          retailer: price.retailer.name
        });
      });
    }

    return history.sort((a, b) => a.date.localeCompare(b.date));
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();