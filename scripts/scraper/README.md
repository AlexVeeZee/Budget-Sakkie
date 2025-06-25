# South African Grocery Data Scraper

A comprehensive web scraping solution for collecting product information from major South African retail stores.

## Features

- **Multi-Retailer Support**: Pick n Pay, Shoprite, Woolworths, SPAR
- **Intelligent Product Filtering**: Focuses on the top 50 most commonly purchased grocery items
- **Rate Limiting**: Respectful scraping with configurable delays
- **Error Handling**: Robust error handling and retry mechanisms
- **Data Validation**: Comprehensive data sanitization and validation
- **Progress Tracking**: Real-time progress indicators and logging
- **Structured Output**: Clean JSON format ready for database integration

## Installation

1. Navigate to the scraper directory:
```bash
cd scripts/scraper
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Run the Complete Scraper
```bash
npm run scrape
```

### Run Tests
```bash
npm test
```

### Configuration

Edit `config.js` to modify:
- Target retailers and their selectors
- Product categories and URLs
- Scraping parameters (delays, timeouts, etc.)
- Target product list

## Output Structure

The scraper generates JSON files with the following structure:

```json
{
  "productId": "pick-n-pay-dairy-milk-1642345678901",
  "productName": "Full Cream Milk",
  "category": "Dairy",
  "retailer": "Pick n Pay",
  "price": 22.99,
  "unit": "1L",
  "availability": "in-stock",
  "imageUrl": "https://www.pnp.co.za/images/products/milk.jpg",
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "nutritionalInfo": {
    "servingSize": null,
    "calories": null,
    "ingredients": []
  }
}
```

## Output Files

The scraper creates several output files in the `/data/scraped` directory:

- `grocery-products-YYYY-MM-DD.json` - Combined data from all retailers
- `[retailer-name]-products.json` - Individual retailer data
- `scraping-errors-YYYY-MM-DD.json` - Error log (if any errors occur)

## Target Products

The scraper focuses on these essential grocery categories:

### Fresh Produce
- Bananas, Apples, Oranges, Potatoes, Onions, Tomatoes, Carrots, Lettuce, Spinach, Avocados

### Dairy & Eggs
- Milk, Eggs, Butter, Cheese, Yogurt, Cream

### Meat & Poultry
- Chicken Breasts, Chicken Thighs, Beef Mince, Pork Chops, Bacon, Sausages

### Pantry Staples
- Bread, Rice, Pasta, Flour, Sugar, Salt, Cooking Oil, Olive Oil, Cereal, Oats
- Canned Tomatoes, Baked Beans, Tuna, Peanut Butter, Jam, Honey

### Beverages
- Coffee, Tea, Fruit Juice, Soft Drinks, Water, Beer, Wine

### Household Essentials
- Toilet Paper, Washing Powder, Dishwashing Liquid, Soap, Shampoo, Toothpaste, Deodorant

## Rate Limiting & Ethics

The scraper implements responsible scraping practices:

- **Request Delays**: 2-second delays between requests
- **Rate Limiting**: Maximum 0.5 requests per second
- **User Agent Rotation**: Mimics real browser behavior
- **Timeout Handling**: 30-second timeouts to prevent hanging
- **Error Recovery**: Automatic retries with exponential backoff

## Legal Considerations

⚠️ **Important**: This scraper is designed for educational and research purposes. Before using it:

1. **Check Terms of Service**: Review each retailer's terms of service
2. **Respect robots.txt**: Ensure compliance with robots.txt files
3. **Rate Limiting**: Use appropriate delays to avoid overwhelming servers
4. **Data Usage**: Use scraped data responsibly and in compliance with applicable laws

## Troubleshooting

### Common Issues

1. **Puppeteer Installation**: If Puppeteer fails to install, try:
   ```bash
   npm install puppeteer --unsafe-perm=true
   ```

2. **Memory Issues**: For large scraping jobs, increase Node.js memory:
   ```bash
   node --max-old-space-size=4096 index.js
   ```

3. **Selector Updates**: If scraping fails, retailers may have updated their HTML structure. Update selectors in `config.js`.

### Debug Mode

Enable verbose logging by setting the environment variable:
```bash
DEBUG=true npm run scrape
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is provided for educational purposes only. Users are responsible for ensuring their use complies with applicable laws and website terms of service.