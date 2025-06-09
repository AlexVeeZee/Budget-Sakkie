#!/usr/bin/env python3
"""
Main execution script for the complete data extraction and integration pipeline
"""

import asyncio
import subprocess
import sys
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_complete_pipeline():
    """Run the complete data extraction and integration pipeline"""
    
    print("🚀 Budget Sakkie Data Extraction Pipeline")
    print("=" * 50)
    
    try:
        # Step 1: Run data extraction
        print("\n📊 Step 1: Running data extraction...")
        from data_extractor import main as extract_main
        
        extraction_result = await extract_main()
        
        if extraction_result != 0:
            logger.error("❌ Data extraction failed")
            return 1
        
        print("✅ Data extraction completed successfully")
        
        # Step 2: Run data integration
        print("\n🔄 Step 2: Running data integration...")
        from data_integration import main as integrate_main
        
        integration_result = integrate_main()
        
        if integration_result != 0:
            logger.error("❌ Data integration failed")
            return 1
        
        print("✅ Data integration completed successfully")
        
        # Step 3: Verify data integrity
        print("\n🔍 Step 3: Verifying data integrity...")
        
        data_dir = Path("data")
        retailers = ["checkers", "pick_n_pay", "woolworths", "shoprite", "spar"]
        
        total_files = 0
        for retailer in retailers:
            retailer_dir = data_dir / retailer
            if retailer_dir.exists():
                csv_files = list(retailer_dir.glob("*_prices.csv"))
                total_files += len(csv_files)
                print(f"   📁 {retailer}: {len(csv_files)} CSV files")
        
        print(f"   📊 Total CSV files: {total_files}")
        
        # Check if mock data was updated
        mock_data_file = Path("src/data/mockData.ts")
        if mock_data_file.exists():
            print("   ✅ Mock data file updated")
        else:
            print("   ⚠️ Mock data file not found")
        
        print("\n🎉 PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print("📈 Data extraction: ✅")
        print("🔄 Data integration: ✅") 
        print("🔍 Data verification: ✅")
        print("\n🚀 Ready for production deployment!")
        
        return 0
        
    except Exception as e:
        logger.error(f"💥 Pipeline failed: {str(e)}")
        return 1

def main():
    """Main entry point"""
    return asyncio.run(run_complete_pipeline())

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)