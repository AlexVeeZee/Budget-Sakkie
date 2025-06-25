# Budget Sakkie Data Extraction Scripts

This directory contains the data extraction and integration scripts for Budget Sakkie.

## Overview

The data extraction system consists of three main components:

1. **`data_extractor.py`** - Main scraping script that extracts product data from SA retailers
2. **`data_integration.py`** - Integrates CSV data with the React application
3. **`run_extraction.py`** - Complete pipeline runner

## Quick Start

### Prerequisites

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### Run Complete Pipeline

```bash
# From the project root
npm run run-pipeline
```

This will:
1. Extract data from all retailers
2. Save to CSV files in `/data/[retailer]/`
3. Integrate with the React application
4. Verify data integrity

### Individual Commands

```bash
# Extract data only
npm run extract-data

# Integrate data only (after extraction)
npm run integrate-data
```

## Output Structure

### CSV Files
Each retailer gets its own folder with timestamped CSV files:
```
data/
├── checkers/
│   └── 2024-01-15_prices.csv
├── pick_n_pay/
│   └── 2024-01-15_prices.csv
├── woolworths/
│   └── 2024-01-15_prices.csv
├── shoprite/
│   └── 2024-01-15_prices.csv
└── spar/
    └── 2024-01-15_prices.csv
```

### CSV Format
```csv
product_id,product_name,current_price,availability_status,last_updated,retailer,category,unit,image_url
checkers-bakery-white-bread-1642345678,White Bread,15.99,in_stock,2024-01-15T10:30:00,Checkers,Bakery,700g,https://...
```

## Features

### ✅ **Ethical Scraping**
- Rate limiting (0.5 requests/second)
- Request delays (2 seconds between requests)
- User agent rotation
- Timeout handling

### ✅ **Data Quality**
- Comprehensive validation
- Price sanitization
- Text cleaning
- Error logging

### ✅ **Integration**
- Automatic best price detection
- Savings calculation
- React app integration
- Data integrity verification

### ✅ **Monitoring**
- Progress tracking
- Error reporting
- Summary reports
- Integration logs

## Target Products

The scraper focuses on the **top 50 most commonly purchased grocery items**:

- **Fresh Produce**: Bananas, Apples, Oranges, Potatoes, Onions...
- **Dairy & Eggs**: Milk, Eggs, Butter, Cheese, Yogurt...
- **Meat & Poultry**: Chicken, Beef Mince, Bacon, Sausages...
- **Pantry Staples**: Bread, Rice, Pasta, Oil, Sugar...
- **Beverages**: Coffee, Tea, Juice, Water...
- **Household**: Toilet Paper, Soap, Detergent...

## Retailers Supported

- **Checkers** - checkers.co.za
- **Pick n Pay** - pnp.co.za  
- **Woolworths** - woolworths.co.za
- **Shoprite** - shoprite.co.za
- **SPAR** - spar.co.za

## Configuration

### Rate Limiting
```python
# In data_extractor.py
self.rate_limiter = RateLimiter(0.5)  # 0.5 requests per second
```

### Target Products
```python
# In data_extractor.py
self.target_products = [
    "bananas", "apples", "milk", "bread", ...
]
```

### Retailer Settings
```python
# In data_extractor.py
self.retailers = {
    "checkers": {
        "name": "Checkers",
        "base_url": "https://www.checkers.co.za",
        ...
    }
}
```

## Error Handling

The system includes comprehensive error handling:

- **Network timeouts** - 30 second timeouts
- **Rate limiting** - Automatic delays
- **Data validation** - Price and text sanitization
- **Retry logic** - 3 retries for failed requests
- **Error logging** - Detailed error reports

## Data Integrity

Before publishing to production, the system validates:

- ✅ Required fields present
- ✅ Valid price ranges
- ✅ Proper availability status
- ✅ Retailer information complete
- ✅ Timestamp accuracy

## Legal Compliance

⚠️ **Important**: This scraper is designed for educational purposes. Always:

1. Check retailer terms of service
2. Respect robots.txt files
3. Use appropriate rate limiting
4. Comply with applicable laws

## Troubleshooting

### Common Issues

1. **Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Permission Errors**
   ```bash
   chmod +x scripts/*.py
   ```

3. **Network Issues**
   - Check internet connection
   - Verify retailer websites are accessible
   - Increase timeout values if needed

### Debug Mode

Enable verbose logging:
```bash
export DEBUG=true
python3 scripts/data_extractor.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.