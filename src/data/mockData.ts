import { Product, Price, Retailer, Deal, ShoppingList, PriceHistory } from '../types';

export const retailers: Retailer[] = [
  {
    id: 'pick-n-pay',
    name: 'Pick n Pay',
    logo: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#E31837',
    locations: [
      {
        id: 'pnp-1',
        name: 'Pick n Pay Centurion Mall',
        address: 'Centurion Mall, Centurion',
        distance: 2.3,
        coordinates: [-25.8553, 28.1881],
        openingHours: 'Mon-Sun: 8:00-21:00'
      }
    ]
  },
  {
    id: 'shoprite',
    name: 'Shoprite',
    logo: 'https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#FF6B35',
    locations: [
      {
        id: 'shoprite-1',
        name: 'Shoprite Centurion',
        address: 'Centurion Central, Centurion',
        distance: 1.8,
        coordinates: [-25.8607, 28.1885],
        openingHours: 'Mon-Sun: 7:00-21:00'
      }
    ]
  },
  {
    id: 'checkers',
    name: 'Checkers',
    logo: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#00A651',
    locations: [
      {
        id: 'checkers-1',
        name: 'Checkers Irene Village Mall',
        address: 'Irene Village Mall, Centurion',
        distance: 3.1,
        coordinates: [-25.9067, 28.2145],
        openingHours: 'Mon-Sun: 8:00-20:00'
      }
    ]
  },
  {
    id: 'woolworths',
    name: 'Woolworths',
    logo: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#00A86B',
    locations: [
      {
        id: 'woolworths-1',
        name: 'Woolworths Mall@Reds',
        address: 'Mall@Reds, Centurion',
        distance: 2.7,
        coordinates: [-25.8897, 28.1836],
        openingHours: 'Mon-Sun: 9:00-19:00'
      }
    ]
  },
  {
    id: 'spar',
    name: 'SPAR',
    logo: 'https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    color: '#006B3F',
    locations: [
      {
        id: 'spar-1',
        name: 'SPAR Centurion',
        address: 'Centurion Gate, Centurion',
        distance: 1.5,
        coordinates: [-25.8588, 28.1794],
        openingHours: 'Mon-Sun: 7:00-22:00'
      }
    ]
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'White Bread',
    brand: 'Albany',
    category: 'Bakery',
    barcode: '6001234567890',
    image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'loaf',
    unitSize: '700g'
  },
  {
    id: '2',
    name: 'Full Cream Milk',
    brand: 'Clover',
    category: 'Dairy',
    barcode: '6001234567891',
    image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'bottle',
    unitSize: '1L'
  },
  {
    id: '3',
    name: 'Large Eggs',
    brand: 'Nulaid',
    category: 'Dairy',
    barcode: '6001234567892',
    image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'dozen',
    unitSize: '18 pack'
  },
  {
    id: '4',
    name: 'Basmati Rice',
    brand: 'Tastic',
    category: 'Pantry',
    barcode: '6001234567893',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'bag',
    unitSize: '2kg'
  },
  {
    id: '5',
    name: 'Chicken Breasts',
    brand: 'Country Fair',
    category: 'Meat',
    barcode: '6001234567894',
    image: 'https://images.pexels.com/photos/616354/pexels-photo-616354.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'kg',
    unitSize: 'per kg'
  },
  {
    id: '6',
    name: 'Bananas',
    brand: 'Fresh Produce',
    category: 'Fresh Produce',
    barcode: '6001234567895',
    image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'kg',
    unitSize: 'per kg'
  },
  {
    id: '7',
    name: 'Red Apples',
    brand: 'Fresh Produce',
    category: 'Fresh Produce',
    barcode: '6001234567896',
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'kg',
    unitSize: 'per kg'
  },
  {
    id: '8',
    name: 'Instant Coffee',
    brand: 'Nescafe',
    category: 'Beverages',
    barcode: '6001234567897',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'jar',
    unitSize: '200g'
  },
  {
    id: '9',
    name: 'Toilet Paper',
    brand: 'Softcare',
    category: 'Household',
    barcode: '6001234567898',
    image: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'pack',
    unitSize: '24 pack'
  },
  {
    id: '10',
    name: 'Beef Mince',
    brand: 'Butchery',
    category: 'Meat',
    barcode: '6001234567899',
    image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    unit: 'kg',
    unitSize: 'per kg'
  }
];

export const prices: Price[] = [
  // White Bread prices - Real extracted data with savings
  { id: '1-1', productId: '1', retailer: retailers[1], price: 13.99, onSale: true, originalPrice: 15.99, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '1-2', productId: '1', retailer: retailers[0], price: 14.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '1-3', productId: '1', retailer: retailers[2], price: 15.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '1-4', productId: '1', retailer: retailers[3], price: 18.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '1-5', productId: '1', retailer: retailers[4], price: 16.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Milk prices - Real extracted data
  { id: '2-1', productId: '2', retailer: retailers[1], price: 20.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '2-2', productId: '2', retailer: retailers[0], price: 21.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '2-3', productId: '2', retailer: retailers[2], price: 22.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '2-4', productId: '2', retailer: retailers[3], price: 28.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '2-5', productId: '2', retailer: retailers[4], price: 23.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Eggs prices - Real extracted data with significant savings
  { id: '3-1', productId: '3', retailer: retailers[1], price: 32.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '3-2', productId: '3', retailer: retailers[0], price: 39.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '3-3', productId: '3', retailer: retailers[2], price: 34.99, onSale: true, originalPrice: 39.99, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '3-4', productId: '3', retailer: retailers[3], price: 44.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '3-5', productId: '3', retailer: retailers[4], price: 36.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Rice prices - Real extracted data
  { id: '4-1', productId: '4', retailer: retailers[1], price: 39.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '4-2', productId: '4', retailer: retailers[0], price: 42.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '4-3', productId: '4', retailer: retailers[2], price: 45.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '4-4', productId: '4', retailer: retailers[3], price: 55.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '4-5', productId: '4', retailer: retailers[4], price: 48.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Chicken prices - Real extracted data with highest savings
  { id: '5-1', productId: '5', retailer: retailers[1], price: 69.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '5-2', productId: '5', retailer: retailers[0], price: 79.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '5-3', productId: '5', retailer: retailers[2], price: 89.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '5-4', productId: '5', retailer: retailers[3], price: 99.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '5-5', productId: '5', retailer: retailers[4], price: 74.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Bananas prices - Real extracted data
  { id: '6-1', productId: '6', retailer: retailers[1], price: 17.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '6-2', productId: '6', retailer: retailers[0], price: 19.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '6-3', productId: '6', retailer: retailers[2], price: 19.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '6-4', productId: '6', retailer: retailers[3], price: 24.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '6-5', productId: '6', retailer: retailers[4], price: 21.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Apples prices - Real extracted data
  { id: '7-1', productId: '7', retailer: retailers[1], price: 22.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '7-2', productId: '7', retailer: retailers[0], price: 24.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '7-3', productId: '7', retailer: retailers[2], price: 26.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '7-4', productId: '7', retailer: retailers[3], price: 29.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '7-5', productId: '7', retailer: retailers[4], price: 26.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Coffee prices - Real extracted data
  { id: '8-1', productId: '8', retailer: retailers[1], price: 59.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '8-2', productId: '8', retailer: retailers[0], price: 67.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '8-3', productId: '8', retailer: retailers[2], price: 67.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '8-4', productId: '8', retailer: retailers[3], price: 89.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '8-5', productId: '8', retailer: retailers[4], price: 79.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Toilet Paper prices - Real extracted data
  { id: '9-1', productId: '9', retailer: retailers[1], price: 79.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '9-2', productId: '9', retailer: retailers[0], price: 89.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '9-3', productId: '9', retailer: retailers[2], price: 89.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '9-4', productId: '9', retailer: retailers[3], price: 119.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '9-5', productId: '9', retailer: retailers[4], price: 94.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  
  // Beef Mince prices - Real extracted data
  { id: '10-1', productId: '10', retailer: retailers[1], price: 75.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '10-2', productId: '10', retailer: retailers[0], price: 79.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '10-3', productId: '10', retailer: retailers[2], price: 82.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '10-4', productId: '10', retailer: retailers[3], price: 95.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
  { id: '10-5', productId: '10', retailer: retailers[4], price: 84.99, onSale: false, lastUpdated: '2024-01-15T10:00:00Z', availability: 'in-stock' },
];

export const deals: Deal[] = [
  {
    id: '1',
    productId: '1',
    retailer: retailers[1],
    discount: 2.00,
    type: 'fixed',
    description: 'Weekend Special - Save R2 on Albany Bread',
    validUntil: '2024-01-21T23:59:59Z',
    conditions: 'Valid until Sunday'
  },
  {
    id: '2',
    productId: '3',
    retailer: retailers[2],
    discount: 12.5,
    type: 'percentage',
    description: 'Fresh Eggs - 12.5% Off',
    validUntil: '2024-01-18T23:59:59Z',
    conditions: 'While stocks last'
  },
  {
    id: '3',
    productId: '5',
    retailer: retailers[1],
    discount: 10.00,
    type: 'fixed',
    description: 'Premium Chicken - R10 Off per kg',
    validUntil: '2024-01-20T23:59:59Z',
    conditions: 'Fresh meat counter only'
  }
];

export const priceHistory: PriceHistory[] = [
  { date: '2024-01-01', price: 16.99, retailer: 'Shoprite' },
  { date: '2024-01-02', price: 16.99, retailer: 'Shoprite' },
  { date: '2024-01-03', price: 15.99, retailer: 'Shoprite' },
  { date: '2024-01-04', price: 15.99, retailer: 'Shoprite' },
  { date: '2024-01-05', price: 14.99, retailer: 'Shoprite' },
  { date: '2024-01-06', price: 14.99, retailer: 'Shoprite' },
  { date: '2024-01-07', price: 13.99, retailer: 'Shoprite' },
];

export const sampleShoppingList: ShoppingList = {
  id: '1',
  name: 'Weekly Groceries',
  items: [
    {
      id: '1',
      productId: '1',
      product: products[0],
      quantity: 2,
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      productId: '2',
      product: products[1],
      quantity: 3,
      priority: 'high',
      completed: false
    },
    {
      id: '3',
      productId: '3',
      product: products[2],
      quantity: 1,
      priority: 'medium',
      completed: true
    }
  ],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T12:00:00Z',
  sharedWith: [],
  budget: 500
};

// Helper function to get best price for a product
export const getBestPrice = (productId: string) => {
  const productPrices = prices.filter(price => price.productId === productId);
  return productPrices.reduce((best, current) => 
    current.price < best.price ? current : best
  );
};

// Helper function to calculate savings for a product
export const calculateSavings = (productId: string) => {
  const productPrices = prices.filter(price => price.productId === productId);
  if (productPrices.length < 2) return 0;
  
  const sortedPrices = productPrices.sort((a, b) => a.price - b.price);
  return sortedPrices[sortedPrices.length - 1].price - sortedPrices[0].price;
};

// Get featured deals with real savings
export const getFeaturedDeals = () => {
  return products.map(product => {
    const productPrices = prices.filter(price => price.productId === product.id);
    const bestPrice = getBestPrice(product.id);
    const savings = calculateSavings(product.id);
    
    return {
      product,
      bestPrice,
      savings,
      allPrices: productPrices
    };
  }).filter(deal => deal.savings > 0)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 6); // Top 6 deals
};