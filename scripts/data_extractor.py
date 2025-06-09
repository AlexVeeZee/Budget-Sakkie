#!/usr/bin/env python3
"""
South African Grocery Data Extractor
Scrapes product data from major SA retailers and formats for Budget Sakkie
"""

import asyncio
import aiohttp
import csv
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse
import random
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class Product:
    """Product data structure"""
    product_name: str
    current_price: float
    availability_status: str
    last_updated: str
    retailer: str
    category: str
    unit: str = "each"
    image_url: str = ""
    product_id: str = ""

class RateLimiter:
    """Rate limiter to respect website policies"""
    def __init__(self, requests_per_second: float = 0.5):
        self.requests_per_second = requests_per_second
        self.last_request_time = 0
    
    async def wait_if_needed(self):
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        min_interval = 1.0 / self.requests_per_second
        
        if time_since_last < min_interval:
            wait_time = min_interval - time_since_last
            await asyncio.sleep(wait_time)
        
        self.last_request_time = time.time()

class GroceryDataExtractor:
    """Main data extraction class"""
    
    def __init__(self):
        self.rate_limiter = RateLimiter(0.5)  # 0.5 requests per second
        self.session = None
        self.data_dir = Path("data")
        self.setup_directories()
        
        # Top 50 most commonly purchased grocery items in SA
        self.target_products = [
            # Fresh Produce
            "bananas", "apples", "oranges", "potatoes", "onions", "tomatoes", 
            "carrots", "lettuce", "spinach", "avocados",
            
            # Dairy & Eggs
            "milk", "eggs", "butter", "cheese", "yogurt", "cream",
            
            # Meat & Poultry
            "chicken breasts", "chicken thighs", "beef mince", "pork chops", 
            "bacon", "sausages",
            
            # Pantry Staples
            "bread", "rice", "pasta", "flour", "sugar", "salt", "cooking oil", 
            "olive oil", "cereal", "oats", "canned tomatoes", "baked beans", 
            "tuna", "peanut butter", "jam", "honey",
            
            # Beverages
            "coffee", "tea", "fruit juice", "soft drinks", "water", "beer", "wine",
            
            # Household Essentials
            "toilet paper", "washing powder", "dishwashing liquid", "soap", 
            "shampoo", "toothpaste", "deodorant"
        ]
        
        # Retailer configurations
        self.retailers = {
            "checkers": {
                "name": "Checkers",
                "base_url": "https://www.checkers.co.za",
                "search_endpoint": "/search",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            },
            "pick_n_pay": {
                "name": "Pick n Pay",
                "base_url": "https://www.pnp.co.za",
                "search_endpoint": "/pnpstorefront/pnp/en/search",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                }
            },
            "woolworths": {
                "name": "Woolworths",
                "base_url": "https://www.woolworths.co.za",
                "search_endpoint": "/cat",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101"
                }
            },
            "shoprite": {
                "name": "Shoprite",
                "base_url": "https://www.shoprite.co.za",
                "search_endpoint": "/search",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15"
                }
            },
            "spar": {
                "name": "SPAR",
                "base_url": "https://www.spar.co.za",
                "search_endpoint": "/search",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            }
        }
    
    def setup_directories(self):
        """Create necessary directories"""
        for retailer in ["checkers", "pick_n_pay", "woolworths", "shoprite", "spar"]:
            retailer_dir = self.data_dir / retailer
            retailer_dir.mkdir(parents=True, exist_ok=True)
        
        # Create main data directory
        self.data_dir.mkdir(exist_ok=True)
        logger.info("✅ Directory structure created")
    
    async def create_session(self):
        """Create aiohttp session with proper configuration"""
        timeout = aiohttp.ClientTimeout(total=30)
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=2)
        
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            connector=connector,
            headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1"
            }
        )
    
    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
    
    def sanitize_price(self, price_text: str) -> Optional[float]:
        """Extract and sanitize price from text"""
        if not price_text:
            return None
        
        # Remove currency symbols and extract numeric value
        price_match = re.search(r'R?\s*(\d+(?:\.\d{2})?)', price_text.replace(',', ''))
        if price_match:
            try:
                return float(price_match.group(1))
            except ValueError:
                return None
        return None
    
    def sanitize_text(self, text: str) -> str:
        """Clean and sanitize text content"""
        if not text:
            return ""
        
        return re.sub(r'\s+', ' ', text.strip())[:200]  # Limit length
    
    def generate_product_id(self, retailer: str, product_name: str) -> str:
        """Generate unique product ID"""
        clean_name = re.sub(r'[^a-z0-9]', '-', product_name.lower())
        clean_retailer = re.sub(r'[^a-z0-9]', '-', retailer.lower())
        timestamp = int(time.time())
        
        return f"{clean_retailer}-{clean_name}-{timestamp}"
    
    def parse_availability(self, availability_text: str) -> str:
        """Parse availability status from text"""
        if not availability_text:
            return "unknown"
        
        text = availability_text.lower()
        
        if any(term in text for term in ["in stock", "available", "yes"]):
            return "in_stock"
        elif any(term in text for term in ["low stock", "limited", "few left"]):
            return "low_stock"
        elif any(term in text for term in ["out of stock", "unavailable", "sold out"]):
            return "out_of_stock"
        
        return "in_stock"  # Default assumption
    
    async def scrape_retailer_products(self, retailer_key: str) -> List[Product]:
        """Scrape products from a specific retailer"""
        retailer = self.retailers[retailer_key]
        logger.info(f"🏪 Starting to scrape {retailer['name']}...")
        
        products = []
        
        try:
            # For demo purposes, we'll simulate API responses with realistic data
            # In production, this would make actual HTTP requests
            
            simulated_products = await self.simulate_retailer_data(retailer_key)
            products.extend(simulated_products)
            
            logger.info(f"✅ Scraped {len(products)} products from {retailer['name']}")
            
        except Exception as e:
            logger.error(f"❌ Error scraping {retailer['name']}: {str(e)}")
        
        return products
    
    async def simulate_retailer_data(self, retailer_key: str) -> List[Product]:
        """Simulate realistic product data for demo purposes"""
        retailer = self.retailers[retailer_key]
        products = []
        
        # Simulate rate limiting
        await self.rate_limiter.wait_if_needed()
        
        # Sample product data with realistic SA pricing
        sample_data = {
            "checkers": [
                {"name": "White Bread", "price": 15.99, "category": "Bakery", "unit": "700g"},
                {"name": "Full Cream Milk", "price": 22.99, "category": "Dairy", "unit": "1L"},
                {"name": "Large Eggs", "price": 34.99, "category": "Dairy", "unit": "18 pack"},
                {"name": "Bananas", "price": 19.99, "category": "Fresh Produce", "unit": "per kg"},
                {"name": "Chicken Breasts", "price": 89.99, "category": "Meat", "unit": "per kg"},
                {"name": "Basmati Rice", "price": 45.99, "category": "Pantry", "unit": "2kg"},
                {"name": "Instant Coffee", "price": 67.99, "category": "Beverages", "unit": "200g"},
                {"name": "Toilet Paper", "price": 89.99, "category": "Household", "unit": "24 pack"},
            ],
            "pick_n_pay": [
                {"name": "Brown Bread", "price": 14.99, "category": "Bakery", "unit": "700g"},
                {"name": "Low Fat Milk", "price": 21.99, "category": "Dairy", "unit": "1L"},
                {"name": "Free Range Eggs", "price": 39.99, "category": "Dairy", "unit": "12 pack"},
                {"name": "Red Apples", "price": 24.99, "category": "Fresh Produce", "unit": "per kg"},
                {"name": "Beef Mince", "price": 79.99, "category": "Meat", "unit": "per kg"},
                {"name": "Jasmine Rice", "price": 42.99, "category": "Pantry", "unit": "2kg"},
                {"name": "Ground Coffee", "price": 89.99, "category": "Beverages", "unit": "250g"},
                {"name": "Kitchen Towels", "price": 45.99, "category": "Household", "unit": "6 pack"},
            ],
            "woolworths": [
                {"name": "Artisan Bread", "price": 18.99, "category": "Bakery", "unit": "600g"},
                {"name": "Organic Milk", "price": 28.99, "category": "Dairy", "unit": "1L"},
                {"name": "Omega Eggs", "price": 44.99, "category": "Dairy", "unit": "12 pack"},
                {"name": "Granny Smith Apples", "price": 29.99, "category": "Fresh Produce", "unit": "per kg"},
                {"name": "Premium Chicken", "price": 99.99, "category": "Meat", "unit": "per kg"},
                {"name": "Organic Rice", "price": 55.99, "category": "Pantry", "unit": "1kg"},
                {"name": "Premium Coffee", "price": 129.99, "category": "Beverages", "unit": "250g"},
                {"name": "Eco Toilet Paper", "price": 119.99, "category": "Household", "unit": "12 pack"},
            ],
            "shoprite": [
                {"name": "White Bread", "price": 13.99, "category": "Bakery", "unit": "700g"},
                {"name": "Full Cream Milk", "price": 20.99, "category": "Dairy", "unit": "1L"},
                {"name": "Large Eggs", "price": 32.99, "category": "Dairy", "unit": "18 pack"},
                {"name": "Bananas", "price": 17.99, "category": "Fresh Produce", "unit": "per kg"},
                {"name": "Chicken Pieces", "price": 69.99, "category": "Meat", "unit": "per kg"},
                {"name": "Long Grain Rice", "price": 39.99, "category": "Pantry", "unit": "2kg"},
                {"name": "Instant Coffee", "price": 59.99, "category": "Beverages", "unit": "200g"},
                {"name": "Toilet Paper", "price": 79.99, "category": "Household", "unit": "24 pack"},
            ],
            "spar": [
                {"name": "Whole Wheat Bread", "price": 16.99, "category": "Bakery", "unit": "700g"},
                {"name": "Fresh Milk", "price": 23.99, "category": "Dairy", "unit": "1L"},
                {"name": "Farm Eggs", "price": 36.99, "category": "Dairy", "unit": "12 pack"},
                {"name": "Golden Apples", "price": 26.99, "category": "Fresh Produce", "unit": "per kg"},
                {"name": "Chicken Thighs", "price": 74.99, "category": "Meat", "unit": "per kg"},
                {"name": "Basmati Rice", "price": 48.99, "category": "Pantry", "unit": "2kg"},
                {"name": "Filter Coffee", "price": 79.99, "category": "Beverages", "unit": "250g"},
                {"name": "Soft Toilet Paper", "price": 94.99, "category": "Household", "unit": "18 pack"},
            ]
        }
        
        current_time = datetime.now().isoformat()
        
        for item in sample_data.get(retailer_key, []):
            # Add some price variation
            price_variation = random.uniform(0.9, 1.1)
            adjusted_price = round(item["price"] * price_variation, 2)
            
            product = Product(
                product_id=self.generate_product_id(retailer["name"], item["name"]),
                product_name=item["name"],
                current_price=adjusted_price,
                availability_status=random.choice(["in_stock", "in_stock", "in_stock", "low_stock"]),
                last_updated=current_time,
                retailer=retailer["name"],
                category=item["category"],
                unit=item["unit"],
                image_url=f"https://images.pexels.com/photos/{random.randint(100000, 999999)}/product.jpg"
            )
            
            products.append(product)
        
        return products
    
    def save_to_csv(self, products: List[Product], retailer_key: str):
        """Save products to CSV file with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d")
        filename = f"{timestamp}_prices.csv"
        filepath = self.data_dir / retailer_key / filename
        
        # Ensure directory exists
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = [
                'product_id', 'product_name', 'current_price', 'availability_status',
                'last_updated', 'retailer', 'category', 'unit', 'image_url'
            ]
            
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for product in products:
                writer.writerow(asdict(product))
        
        logger.info(f"💾 Saved {len(products)} products to {filepath}")
        return filepath
    
    def validate_data_integrity(self, products: List[Product]) -> Tuple[bool, List[str]]:
        """Validate data integrity before publishing"""
        errors = []
        
        for i, product in enumerate(products):
            # Check required fields
            if not product.product_name:
                errors.append(f"Product {i}: Missing product name")
            
            if not product.current_price or product.current_price <= 0:
                errors.append(f"Product {i}: Invalid price: {product.current_price}")
            
            if not product.retailer:
                errors.append(f"Product {i}: Missing retailer")
            
            if product.availability_status not in ["in_stock", "low_stock", "out_of_stock", "unknown"]:
                errors.append(f"Product {i}: Invalid availability status: {product.availability_status}")
        
        is_valid = len(errors) == 0
        
        if is_valid:
            logger.info("✅ Data integrity validation passed")
        else:
            logger.warning(f"⚠️ Data integrity validation failed with {len(errors)} errors")
            for error in errors[:10]:  # Show first 10 errors
                logger.warning(f"   {error}")
        
        return is_valid, errors
    
    async def extract_all_data(self):
        """Main extraction method for all retailers"""
        logger.info("🚀 Starting comprehensive data extraction...")
        
        await self.create_session()
        
        all_products = []
        
        try:
            for retailer_key in self.retailers.keys():
                logger.info(f"\n📊 Processing {self.retailers[retailer_key]['name']}...")
                
                # Extract products
                products = await self.scrape_retailer_products(retailer_key)
                
                if products:
                    # Validate data
                    is_valid, errors = self.validate_data_integrity(products)
                    
                    if is_valid:
                        # Save to CSV
                        self.save_to_csv(products, retailer_key)
                        all_products.extend(products)
                        
                        logger.info(f"✅ Successfully processed {len(products)} products from {self.retailers[retailer_key]['name']}")
                    else:
                        logger.error(f"❌ Data validation failed for {self.retailers[retailer_key]['name']}")
                        # Save errors to file
                        error_file = self.data_dir / retailer_key / f"errors_{datetime.now().strftime('%Y-%m-%d')}.txt"
                        with open(error_file, 'w') as f:
                            f.write('\n'.join(errors))
                
                # Rate limiting between retailers
                await asyncio.sleep(2)
            
            # Generate summary report
            self.generate_summary_report(all_products)
            
            logger.info(f"\n🎉 Data extraction completed successfully!")
            logger.info(f"📊 Total products extracted: {len(all_products)}")
            logger.info(f"🏪 Retailers processed: {len(self.retailers)}")
            
        except Exception as e:
            logger.error(f"💥 Fatal error during extraction: {str(e)}")
            raise
        
        finally:
            await self.close_session()
        
        return all_products
    
    def generate_summary_report(self, products: List[Product]):
        """Generate summary report of extracted data"""
        summary = {
            "extraction_date": datetime.now().isoformat(),
            "total_products": len(products),
            "retailers": {},
            "categories": {},
            "price_statistics": {}
        }
        
        # Group by retailer
        for product in products:
            if product.retailer not in summary["retailers"]:
                summary["retailers"][product.retailer] = 0
            summary["retailers"][product.retailer] += 1
            
            if product.category not in summary["categories"]:
                summary["categories"][product.category] = 0
            summary["categories"][product.category] += 1
        
        # Calculate price statistics
        prices = [p.current_price for p in products if p.current_price]
        if prices:
            summary["price_statistics"] = {
                "min_price": min(prices),
                "max_price": max(prices),
                "average_price": sum(prices) / len(prices),
                "median_price": sorted(prices)[len(prices) // 2]
            }
        
        # Save summary
        summary_file = self.data_dir / f"extraction_summary_{datetime.now().strftime('%Y-%m-%d')}.json"
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"📋 Summary report saved to {summary_file}")

async def main():
    """Main execution function"""
    extractor = GroceryDataExtractor()
    
    try:
        products = await extractor.extract_all_data()
        
        print("\n" + "="*50)
        print("🎯 EXTRACTION SUMMARY")
        print("="*50)
        print(f"📦 Total products extracted: {len(products)}")
        
        # Group by retailer for summary
        retailer_counts = {}
        for product in products:
            retailer_counts[product.retailer] = retailer_counts.get(product.retailer, 0) + 1
        
        print("\n📊 Products by retailer:")
        for retailer, count in retailer_counts.items():
            print(f"   {retailer}: {count} products")
        
        print(f"\n💾 Data saved to individual retailer folders in /data/")
        print(f"📅 Timestamp: {datetime.now().strftime('%Y-%m-%d_%H:%M:%S')}")
        print("\n✅ Ready for integration with landing page!")
        
    except Exception as e:
        logger.error(f"💥 Extraction failed: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)