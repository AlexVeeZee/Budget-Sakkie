import { useState, useCallback, useEffect } from 'react';

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
  decimalPlaces: number;
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    position: 'prefix',
    decimalPlaces: 2
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'prefix',
    decimalPlaces: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'suffix',
    decimalPlaces: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'prefix',
    decimalPlaces: 2
  }
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('budgetSakkie_currency');
    return (saved as Currency) || 'ZAR';
  });

  useEffect(() => {
    localStorage.setItem('budgetSakkie_currency', currency);
  }, [currency]);

  const formatCurrency = useCallback((amount: number): string => {
    const config = CURRENCY_CONFIGS[currency];
    const formattedAmount = amount.toFixed(config.decimalPlaces);
    
    return config.position === 'prefix' 
      ? `${config.symbol}${formattedAmount}`
      : `${formattedAmount}${config.symbol}`;
  }, [currency]);

  const getCurrencyConfig = useCallback(() => {
    return CURRENCY_CONFIGS[currency];
  }, [currency]);

  const updateCurrency = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency);
  }, []);

  return {
    currency,
    formatCurrency,
    getCurrencyConfig,
    updateCurrency,
    availableCurrencies: Object.values(CURRENCY_CONFIGS)
  };
};