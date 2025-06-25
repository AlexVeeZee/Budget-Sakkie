#!/usr/bin/env node

import { ProductScraper } from './productScraper.js';
import { ScrapingUtils } from './utils.js';

async function main() {
  console.log('🛒 South African Grocery Data Scraper');
  console.log('=====================================\n');
  
  const scraper = new ProductScraper();
  
  try {
    const startTime = Date.now();
    
    const results = await scraper.scrapeAllRetailers();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n📊 SCRAPING COMPLETED');
    console.log('=====================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📦 Total products: ${results.products.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    console.log('\n📈 Summary by Retailer:');
    Object.entries(results.summary.byRetailer).forEach(([retailer, count]) => {
      console.log(`   ${retailer}: ${count} products`);
    });
    
    console.log('\n📈 Summary by Category:');
    Object.entries(results.summary.byCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    console.log(`\n💰 Price Range: R${results.summary.priceRange.min.toFixed(2)} - R${results.summary.priceRange.max.toFixed(2)}`);
    console.log(`💰 Average Price: R${results.summary.priceRange.average.toFixed(2)}`);
    
    if (results.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      results.errors.forEach(error => {
        console.log(`   ${error.retailer}: ${error.error}`);
      });
    }
    
    console.log('\n✅ Data scraping completed successfully!');
    console.log('📁 Check the /data/scraped directory for output files');
    
  } catch (error) {
    console.error('💥 Fatal error during scraping:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, cleaning up...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the scraper
main().catch(console.error);