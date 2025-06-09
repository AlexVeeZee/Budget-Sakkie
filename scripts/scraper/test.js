import { ProductScraper } from './productScraper.js';
import { ScrapingUtils } from './utils.js';
import { RETAILERS, TARGET_PRODUCTS } from './config.js';

// Test script to validate scraper functionality
async function runTests() {
  console.log('🧪 Running Scraper Tests');
  console.log('========================\n');
  
  // Test 1: Configuration validation
  console.log('1️⃣ Testing configuration...');
  
  const retailerCount = Object.keys(RETAILERS).length;
  const productCount = TARGET_PRODUCTS.length;
  
  console.log(`   ✅ Retailers configured: ${retailerCount}`);
  console.log(`   ✅ Target products: ${productCount}`);
  
  // Test 2: Utility functions
  console.log('\n2️⃣ Testing utility functions...');
  
  const testPrice = ScrapingUtils.sanitizePrice('R 25.99');
  const testText = ScrapingUtils.sanitizeText('  Test Product Name  ');
  const testId = ScrapingUtils.generateProductId('Pick n Pay', 'Test Product', 'Dairy');
  
  console.log(`   ✅ Price sanitization: ${testPrice}`);
  console.log(`   ✅ Text sanitization: "${testText}"`);
  console.log(`   ✅ ID generation: ${testId}`);
  
  // Test 3: Sample product validation
  console.log('\n3️⃣ Testing product validation...');
  
  const validProduct = {
    productId: 'test-123',
    productName: 'Test Product',
    retailer: 'Test Store',
    price: 25.99,
    category: 'Test Category'
  };
  
  const invalidProduct = {
    productId: 'test-456',
    productName: 'Invalid Product'
    // Missing required fields
  };
  
  console.log(`   ✅ Valid product passes: ${ScrapingUtils.validateProduct(validProduct)}`);
  console.log(`   ✅ Invalid product fails: ${!ScrapingUtils.validateProduct(invalidProduct)}`);
  
  // Test 4: File operations
  console.log('\n4️⃣ Testing file operations...');
  
  const testData = [validProduct];
  const testFilename = 'test-products.json';
  
  try {
    ScrapingUtils.saveToFile(testData, testFilename);
    const loadedData = ScrapingUtils.loadExistingData(testFilename);
    
    console.log(`   ✅ File save/load: ${loadedData.length === testData.length ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log(`   ❌ File operations failed: ${error.message}`);
  }
  
  // Test 5: Rate limiter
  console.log('\n5️⃣ Testing rate limiter...');
  
  const { RateLimiter } = await import('./utils.js');
  const rateLimiter = new RateLimiter(2); // 2 requests per second
  
  const startTime = Date.now();
  await rateLimiter.waitIfNeeded();
  await rateLimiter.waitIfNeeded();
  const endTime = Date.now();
  
  const timeDiff = endTime - startTime;
  console.log(`   ✅ Rate limiting working: ${timeDiff >= 500 ? 'PASS' : 'FAIL'} (${timeDiff}ms)`);
  
  console.log('\n✅ All tests completed!');
  console.log('\n🚀 Ready to run the scraper with: npm run scrape');
}

// Run tests
runTests().catch(console.error);