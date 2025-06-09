#!/usr/bin/env python3
"""
Data Integration Script for Budget Sakkie
Imports CSV data and updates the React application with latest prices
"""

import csv
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataIntegrator:
    """Integrates scraped data with the React application"""
    
    def __init__(self):
        self.data_dir = Path("data")
        self.src_dir = Path("src")
        self.retailers = ["checkers", "pick_n_pay", "woolworths", "shoprite", "spar"]
    
    def find_latest_csv(self, retailer: str) -> Path:
        """Find the most recent CSV file for a retailer"""
        retailer_dir = self.data_dir / retailer
        
        if not retailer_dir.exists():
            logger.warning(f"⚠️ Directory not found: {retailer_dir}")
            return None
        
        csv_files = list(retailer_dir.glob("*_prices.csv"))
        
        if not csv_files:
            logger.warning(f"⚠️ No CSV files found in {retailer_dir}")
            return None
        
        # Sort by modification time and return the latest
        latest_file = max(csv_files, key=lambda f: f.stat().st_mtime)
        logger.info(f"📄 Latest file for {retailer}: {latest_file.name}")
        
        return latest_file
    
    def load_csv_data(self, csv_file: Path) -> List[Dict[str, Any]]:
        """Load data from CSV file"""
        products = []
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    # Convert price to float
                    try:
                        row['current_price'] = float(row['current_price'])
                    except (ValueError, TypeError):
                        row['current_price'] = 0.0
                    
                    products.append(row)
            
            logger.info(f"✅ Loaded {len(products)} products from {csv_file.name}")
            
        except Exception as e:
            logger.error(f"❌ Error loading {csv_file}: {str(e)}")
        
        return products
    
    def find_best_prices(self, all_products: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Find best prices for each product across all retailers"""
        product_groups = {}
        
        # Group products by name (normalize for comparison)
        for product in all_products:
            normalized_name = product['product_name'].lower().strip()
            
            if normalized_name not in product_groups:
                product_groups[normalized_name] = []
            
            product_groups[normalized_name].append(product)
        
        best_prices = {}
        
        for product_name, products in product_groups.items():
            if not products:
                continue
            
            # Find the product with the lowest price
            best_product = min(products, key=lambda p: p['current_price'])
            
            # Calculate savings (difference between highest and lowest price)
            prices = [p['current_price'] for p in products if p['current_price'] > 0]
            if len(prices) > 1:
                max_price = max(prices)
                min_price = min(prices)
                savings = max_price - min_price
            else:
                savings = 0
            
            best_prices[product_name] = {
                'best_product': best_product,
                'all_prices': products,
                'savings': savings,
                'price_range': {
                    'min': min(prices) if prices else 0,
                    'max': max(prices) if prices else 0
                }
            }
        
        return best_prices
    
    def generate_mock_data_update(self, best_prices: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Generate updated mock data for the React application"""
        
        # Map retailer names to IDs
        retailer_mapping = {
            "Checkers": "checkers",
            "Pick n Pay": "pick-n-pay", 
            "Woolworths": "woolworths",
            "Shoprite": "shoprite",
            "SPAR": "spar"
        }
        
        # Create updated products array
        updated_products = []
        updated_prices = []
        
        product_id = 1
        price_id = 1
        
        for product_name, price_data in list(best_prices.items())[:20]:  # Limit to 20 products
            best_product = price_data['best_product']
            
            # Create product entry
            product_entry = {
                "id": str(product_id),
                "name": best_product['product_name'],
                "brand": "Generic",  # Could be enhanced with brand detection
                "category": best_product.get('category', 'General'),
                "barcode": f"600123456789{product_id}",
                "image": best_product.get('image_url', f"https://images.pexels.com/photos/{300000 + product_id}/product.jpg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop"),
                "unit": "each",
                "unitSize": best_product.get('unit', 'each')
            }
            
            updated_products.append(product_entry)
            
            # Create price entries for all retailers selling this product
            for product in price_data['all_prices']:
                retailer_id = retailer_mapping.get(product['retailer'], 'unknown')
                
                price_entry = {
                    "id": f"{product_id}-{price_id}",
                    "productId": str(product_id),
                    "retailer": {
                        "id": retailer_id,
                        "name": product['retailer'],
                        "logo": f"https://images.pexels.com/photos/{400000 + price_id}/logo.jpg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                        "color": self.get_retailer_color(product['retailer']),
                        "locations": [{
                            "id": f"{retailer_id}-1",
                            "name": f"{product['retailer']} Centurion",
                            "address": "Centurion Mall, Centurion",
                            "distance": 2.3,
                            "coordinates": [-25.8553, 28.1881],
                            "openingHours": "Mon-Sun: 8:00-21:00"
                        }]
                    },
                    "price": product['current_price'],
                    "onSale": False,
                    "lastUpdated": product['last_updated'],
                    "availability": product['availability_status'].replace('_', '-')
                }
                
                updated_prices.append(price_entry)
                price_id += 1
            
            product_id += 1
        
        return {
            "products": updated_products,
            "prices": updated_prices,
            "lastUpdated": datetime.now().isoformat(),
            "summary": {
                "totalProducts": len(updated_products),
                "totalPrices": len(updated_prices),
                "avgSavings": sum(data['savings'] for data in best_prices.values()) / len(best_prices) if best_prices else 0
            }
        }
    
    def get_retailer_color(self, retailer_name: str) -> str:
        """Get brand color for retailer"""
        colors = {
            "Checkers": "#00A651",
            "Pick n Pay": "#E31837", 
            "Woolworths": "#00A86B",
            "Shoprite": "#FF6B35",
            "SPAR": "#006B3F"
        }
        return colors.get(retailer_name, "#6B7280")
    
    def update_mock_data_file(self, updated_data: Dict[str, Any]):
        """Update the mockData.ts file with new data"""
        mock_data_file = self.src_dir / "data" / "mockData.ts"
        
        if not mock_data_file.exists():
            logger.error(f"❌ Mock data file not found: {mock_data_file}")
            return False
        
        try:
            # Read the current file
            with open(mock_data_file, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Create backup
            backup_file = mock_data_file.with_suffix('.ts.backup')
            with open(backup_file, 'w', encoding='utf-8') as file:
                file.write(content)
            
            # Generate new products and prices arrays
            products_js = self.dict_to_js_array(updated_data['products'])
            prices_js = self.dict_to_js_array(updated_data['prices'])
            
            # Replace the products array
            import re
            
            # Replace products array
            products_pattern = r'export const products: Product\[\] = \[.*?\];'
            new_products = f"export const products: Product[] = {products_js};"
            content = re.sub(products_pattern, new_products, content, flags=re.DOTALL)
            
            # Replace prices array  
            prices_pattern = r'export const prices: Price\[\] = \[.*?\];'
            new_prices = f"export const prices: Price[] = {prices_js};"
            content = re.sub(prices_pattern, new_prices, content, flags=re.DOTALL)
            
            # Write updated content
            with open(mock_data_file, 'w', encoding='utf-8') as file:
                file.write(content)
            
            logger.info(f"✅ Updated mock data file: {mock_data_file}")
            logger.info(f"💾 Backup saved to: {backup_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error updating mock data file: {str(e)}")
            return False
    
    def dict_to_js_array(self, data: List[Dict[str, Any]]) -> str:
        """Convert Python dict to JavaScript array string"""
        js_items = []
        
        for item in data:
            js_item = self.dict_to_js_object(item)
            js_items.append(js_item)
        
        return "[\n  " + ",\n  ".join(js_items) + "\n]"
    
    def dict_to_js_object(self, obj: Any, indent: int = 2) -> str:
        """Convert Python object to JavaScript object string"""
        if isinstance(obj, dict):
            items = []
            for key, value in obj.items():
                js_value = self.dict_to_js_object(value, indent + 2)
                items.append(f"{'  ' * indent}{key}: {js_value}")
            return "{\n" + ",\n".join(items) + f"\n{'  ' * (indent-2)}}}"
        
        elif isinstance(obj, list):
            if not obj:
                return "[]"
            items = [self.dict_to_js_object(item, indent + 2) for item in obj]
            return "[\n" + f"{'  ' * indent}" + f",\n{'  ' * indent}".join(items) + f"\n{'  ' * (indent-2)}]"
        
        elif isinstance(obj, str):
            return f"'{obj}'"
        
        elif isinstance(obj, bool):
            return "true" if obj else "false"
        
        elif obj is None:
            return "null"
        
        else:
            return str(obj)
    
    def integrate_data(self):
        """Main integration method"""
        logger.info("🔄 Starting data integration...")
        
        all_products = []
        
        # Load data from all retailers
        for retailer in self.retailers:
            latest_csv = self.find_latest_csv(retailer)
            
            if latest_csv:
                products = self.load_csv_data(latest_csv)
                all_products.extend(products)
            else:
                logger.warning(f"⚠️ No data found for {retailer}")
        
        if not all_products:
            logger.error("❌ No product data found to integrate")
            return False
        
        logger.info(f"📊 Total products loaded: {len(all_products)}")
        
        # Find best prices
        best_prices = self.find_best_prices(all_products)
        logger.info(f"🎯 Found best prices for {len(best_prices)} unique products")
        
        # Generate updated mock data
        updated_data = self.generate_mock_data_update(best_prices)
        
        # Update the mock data file
        success = self.update_mock_data_file(updated_data)
        
        if success:
            logger.info("✅ Data integration completed successfully!")
            logger.info(f"📈 Updated {len(updated_data['products'])} products")
            logger.info(f"💰 Average savings: R{updated_data['summary']['avgSavings']:.2f}")
            
            # Generate integration report
            self.generate_integration_report(updated_data, best_prices)
            
        return success
    
    def generate_integration_report(self, updated_data: Dict[str, Any], best_prices: Dict[str, Dict[str, Any]]):
        """Generate integration report"""
        report = {
            "integration_date": datetime.now().isoformat(),
            "summary": updated_data['summary'],
            "best_deals": [],
            "price_comparisons": []
        }
        
        # Find best deals (highest savings)
        sorted_deals = sorted(
            best_prices.items(), 
            key=lambda x: x[1]['savings'], 
            reverse=True
        )
        
        for product_name, data in sorted_deals[:10]:  # Top 10 deals
            if data['savings'] > 0:
                best_product = data['best_product']
                report["best_deals"].append({
                    "product": product_name,
                    "best_price": best_product['current_price'],
                    "best_retailer": best_product['retailer'],
                    "savings": data['savings'],
                    "price_range": data['price_range']
                })
        
        # Save report
        report_file = self.data_dir / f"integration_report_{datetime.now().strftime('%Y-%m-%d')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"📋 Integration report saved to {report_file}")

def main():
    """Main execution function"""
    integrator = DataIntegrator()
    
    try:
        success = integrator.integrate_data()
        
        if success:
            print("\n" + "="*50)
            print("🎉 DATA INTEGRATION SUCCESSFUL")
            print("="*50)
            print("✅ Latest CSV data imported")
            print("✅ Best prices calculated")
            print("✅ Mock data updated")
            print("✅ Ready for production!")
            print("\n🚀 You can now run the application to see updated prices")
            return 0
        else:
            print("\n❌ Data integration failed")
            return 1
            
    except Exception as e:
        logger.error(f"💥 Integration failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit(exit_code := main())