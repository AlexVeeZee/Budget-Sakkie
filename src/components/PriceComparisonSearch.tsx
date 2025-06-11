import React, { useState } from 'react';
import { Search, Loader2, TrendingDown, AlertCircle, RefreshCw, Clock } from 'lucide-react';

interface PriceResult {
  retailer: string;
  retailerId: string;
  logo: string;
  color: string;
  available: boolean;
  price: number | null;
  currency: string;
  productName: string | null;
  url: string | null;
  error: string | null;
  lastUpdated: string;
}

interface ComparisonResult {
  item: string;
  prices: PriceResult[];
  cheapest: PriceResult | null;
  savings: number;
  priceRange: {
    min: number;
    max: number;
  } | null;
  timestamp: string;
  metadata: {
    searchTerm: string;
    location: string;
    responseTime: string;
    timestamp: string;
    totalRetailers: number;
    availableRetailers: number;
  };
}

export const PriceComparisonSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async (term: string = searchTerm) => {
    if (!term.trim()) {
      setError('Please enter a product name to search');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🔍 Searching for: ${term}`);
      
      const response = await fetch(`http://localhost:3001/api/price?item=${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ComparisonResult = await response.json();
      setResult(data);
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [term, ...prev.filter(item => item !== term)];
        return newHistory.slice(0, 5); // Keep only last 5 searches
      });
      
      console.log(`✅ Search completed in ${data.metadata.responseTime}`);
      
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price comparison');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const getAvailabilityColor = (available: boolean) => {
    return available ? 'text-green-600' : 'text-red-600';
  };

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Price Comparison Search</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products (e.g., milk, bread, eggs)..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {loading ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <button
                  type="submit"
                  disabled={loading || !searchTerm.trim()}
                  className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Comparing Prices...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Compare Prices</span>
              </>
            )}
          </button>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                  disabled={loading}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Error</p>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={() => handleSearch()}
            className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Price Comparison for "{result.item}"
              </h3>
              <div className="text-sm text-gray-500">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatLastUpdated(result.timestamp)}
              </div>
            </div>

            {result.cheapest ? (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={result.cheapest.logo}
                      alt={result.cheapest.retailer}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-green-900">Best Price Found</p>
                      <p className="text-green-700">{result.cheapest.retailer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">
                      R{result.cheapest.price?.toFixed(2)}
                    </p>
                    {result.savings > 0 && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">Save R{result.savings.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-yellow-800">No prices found for this product across any retailers.</p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">{result.metadata.totalRetailers}</p>
                <p className="text-gray-600">Retailers Checked</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">{result.metadata.availableRetailers}</p>
                <p className="text-gray-600">Have Stock</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">{result.metadata.responseTime}</p>
                <p className="text-gray-600">Response Time</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">
                  {result.priceRange ? `R${(result.priceRange.max - result.priceRange.min).toFixed(2)}` : 'N/A'}
                </p>
                <p className="text-gray-600">Price Range</p>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">All Retailers</h4>
            </div>
            <div className="divide-y divide-gray-200">
              {result.prices.map((price, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={price.logo}
                        alt={price.retailer}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <h5 className="font-semibold text-gray-900">{price.retailer}</h5>
                        {price.available && price.productName && (
                          <p className="text-sm text-gray-600">{price.productName}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-sm font-medium ${getAvailabilityColor(price.available)}`}>
                            {price.available ? 'In Stock' : 'Not Available'}
                          </span>
                          {price.error && (
                            <span className="text-xs text-red-600">• {price.error}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {price.available && price.price ? (
                        <div>
                          <p className="text-xl font-bold text-gray-900">
                            R{price.price.toFixed(2)}
                          </p>
                          {price === result.cheapest && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              Best Price
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">—</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};