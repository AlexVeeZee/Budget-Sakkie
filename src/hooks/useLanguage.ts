import { useState, useCallback } from 'react';

type Language = 'en' | 'af';

interface Translations {
  [key: string]: {
    en: string;
    af: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.search': { en: 'Search', af: 'Soek' },
  'nav.compare': { en: 'Compare', af: 'Vergelyk' },
  'nav.lists': { en: 'Lists', af: 'Lyste' },
  'nav.deals': { en: 'Deals', af: 'Spesiale' },
  'nav.profile': { en: 'Profile', af: 'Profiel' },
  'nav.family': { en: 'Family', af: 'Familie' },
  
  // Common
  'common.save': { en: 'Save', af: 'Stoor' },
  'common.cancel': { en: 'Cancel', af: 'Kanselleer' },
  'common.back': { en: 'Back', af: 'Terug' },
  'common.next': { en: 'Next', af: 'Volgende' },
  'common.loading': { en: 'Loading...', af: 'Laai...' },
  'common.search': { en: 'Search', af: 'Soek' },
  'common.filter': { en: 'Filter', af: 'Filter' },
  'common.sort': { en: 'Sort', af: 'Sorteer' },
  
  // Header
  'header.title': { en: 'Budget Sakkie', af: 'Budget Sakkie' },
  'header.subtitle': { en: 'Smart Grocery Shopping', af: 'Slim Kruideniersware Inkopies' },
  
  // Search
  'search.placeholder': { en: 'Search for products...', af: 'Soek vir produkte...' },
  'search.recent': { en: 'Recent Searches', af: 'Onlangse Soektogte' },
  'search.suggestions': { en: 'Suggestions', af: 'Voorstelle' },
  'search.no_results': { en: 'No results found', af: 'Geen resultate gevind nie' },
  
  // Products
  'product.compare_prices': { en: 'Compare Prices', af: 'Vergelyk Pryse' },
  'product.add_to_list': { en: 'Add to List', af: 'Voeg by Lys' },
  'product.view_history': { en: 'Price History', af: 'Prys Geskiedenis' },
  'product.best_price': { en: 'Best Price', af: 'Beste Prys' },
  'product.save_amount': { en: 'Save', af: 'Bespaar' },
  'product.on_sale': { en: 'On Sale', af: 'Op Verkoop' },
  'product.out_of_stock': { en: 'Out of Stock', af: 'Uit Voorraad' },
  
  // Shopping Lists
  'lists.create_new': { en: 'Create New List', af: 'Skep Nuwe Lys' },
  'lists.my_lists': { en: 'My Lists', af: 'My Lyste' },
  'lists.shared_lists': { en: 'Shared Lists', af: 'Gedeelde Lyste' },
  'lists.total_items': { en: 'items', af: 'items' },
  'lists.estimated_total': { en: 'Estimated Total', af: 'Geskatte Totaal' },
  'lists.optimized_savings': { en: 'Optimized Savings', af: 'Geoptimaliseerde Besparings' },
  
  // Deals
  'deals.hot_deals': { en: 'Hot Deals', af: 'Warm Spesiale' },
  'deals.expires_in': { en: 'Expires in', af: 'Verval oor' },
  'deals.save_up_to': { en: 'Save up to', af: 'Bespaar tot' },
  'deals.view_all': { en: 'View All Deals', af: 'Bekyk Alle Spesiale' },
  
  // Profile
  'profile.settings': { en: 'Settings', af: 'Instellings' },
  'profile.language': { en: 'Language', af: 'Taal' },
  'profile.location': { en: 'Location', af: 'Ligging' },
  'profile.budget': { en: 'Monthly Budget', af: 'Maandelikse Begroting' },
  'profile.loyalty_cards': { en: 'Loyalty Cards', af: 'Lojaliteitskaarte' },
  
  // Family
  'family.title': { en: 'Family Sharing', af: 'Familie Deel' },
  'family.members': { en: 'Family Members', af: 'Familie Lede' },
  'family.add_member': { en: 'Add Member', af: 'Voeg Lid By' },
  'family.create_group': { en: 'Create Family Group', af: 'Skep Familie Groep' },
  'family.shared_lists': { en: 'Shared Lists', af: 'Gedeelde Lyste' },
  
  // Retailers
  'retailer.pick_n_pay': { en: 'Pick n Pay', af: 'Pick n Pay' },
  'retailer.shoprite': { en: 'Shoprite', af: 'Shoprite' },
  'retailer.checkers': { en: 'Checkers', af: 'Checkers' },
  'retailer.woolworths': { en: 'Woolworths', af: 'Woolworths' },
  'retailer.spar': { en: 'SPAR', af: 'SPAR' },
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'af' : 'en');
  }, []);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t
  };
};