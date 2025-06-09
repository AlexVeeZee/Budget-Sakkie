// Configuration for South African retail store scraping
export const RETAILERS = {
  PICK_N_PAY: {
    name: 'Pick n Pay',
    baseUrl: 'https://www.pnp.co.za',
    searchUrl: 'https://www.pnp.co.za/pnpstorefront/pnp/en/search',
    categoryUrls: {
      'Fresh Produce': '/c/fresh-food',
      'Dairy': '/c/dairy-eggs-milk',
      'Meat': '/c/meat-poultry-seafood',
      'Pantry': '/c/food-cupboard',
      'Beverages': '/c/drinks',
      'Household': '/c/household-cleaning'
    },
    selectors: {
      productCard: '.product-item',
      name: '.product-item-name',
      price: '.price',
      image: '.product-image img',
      availability: '.stock-status',
      unit: '.product-unit'
    }
  },
  SHOPRITE: {
    name: 'Shoprite',
    baseUrl: 'https://www.shoprite.co.za',
    searchUrl: 'https://www.shoprite.co.za/search',
    categoryUrls: {
      'Fresh Produce': '/c/fresh-produce',
      'Dairy': '/c/dairy-and-eggs',
      'Meat': '/c/meat-and-poultry',
      'Pantry': '/c/pantry-essentials',
      'Beverages': '/c/beverages',
      'Household': '/c/household-essentials'
    },
    selectors: {
      productCard: '.product-tile',
      name: '.product-name',
      price: '.price-current',
      image: '.product-image img',
      availability: '.availability',
      unit: '.unit-size'
    }
  },
  WOOLWORTHS: {
    name: 'Woolworths',
    baseUrl: 'https://www.woolworths.co.za',
    searchUrl: 'https://www.woolworths.co.za/cat?Ntt=',
    categoryUrls: {
      'Fresh Produce': '/cat/Food/Fresh-Food/Fruit-Vegetables/_/N-1z13y8l',
      'Dairy': '/cat/Food/Fresh-Food/Dairy-Eggs/_/N-1z13y8m',
      'Meat': '/cat/Food/Fresh-Food/Meat-Poultry-Seafood/_/N-1z13y8n',
      'Pantry': '/cat/Food/Food-Cupboard/_/N-1z13y8o',
      'Beverages': '/cat/Food/Drinks/_/N-1z13y8p',
      'Household': '/cat/Home-Garden/Household-Essentials/_/N-1z13y8q'
    },
    selectors: {
      productCard: '.product-list-item',
      name: '.product-name',
      price: '.now-price',
      image: '.product-image img',
      availability: '.stock-level',
      unit: '.product-size'
    }
  },
  SPAR: {
    name: 'SPAR',
    baseUrl: 'https://www.spar.co.za',
    searchUrl: 'https://www.spar.co.za/search',
    categoryUrls: {
      'Fresh Produce': '/fresh-produce',
      'Dairy': '/dairy-eggs',
      'Meat': '/meat-seafood',
      'Pantry': '/grocery',
      'Beverages': '/beverages',
      'Household': '/household'
    },
    selectors: {
      productCard: '.product-item',
      name: '.product-title',
      price: '.price-value',
      image: '.product-img img',
      availability: '.stock-info',
      unit: '.unit-info'
    }
  }
};

// Top 50 most commonly purchased grocery items in South Africa
export const TARGET_PRODUCTS = [
  // Fresh Produce
  'bananas', 'apples', 'oranges', 'potatoes', 'onions', 'tomatoes', 'carrots', 'lettuce', 'spinach', 'avocados',
  
  // Dairy & Eggs
  'milk', 'eggs', 'butter', 'cheese', 'yogurt', 'cream',
  
  // Meat & Poultry
  'chicken breasts', 'chicken thighs', 'beef mince', 'pork chops', 'bacon', 'sausages',
  
  // Pantry Staples
  'bread', 'rice', 'pasta', 'flour', 'sugar', 'salt', 'cooking oil', 'olive oil', 'cereal', 'oats',
  'canned tomatoes', 'baked beans', 'tuna', 'peanut butter', 'jam', 'honey',
  
  // Beverages
  'coffee', 'tea', 'fruit juice', 'soft drinks', 'water', 'beer', 'wine',
  
  // Household Essentials
  'toilet paper', 'washing powder', 'dishwashing liquid', 'soap', 'shampoo', 'toothpaste', 'deodorant'
];

export const SCRAPING_CONFIG = {
  requestDelay: 2000, // 2 seconds between requests
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
};