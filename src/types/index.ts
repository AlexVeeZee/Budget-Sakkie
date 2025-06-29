export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  barcode?: string;
  image: string;
  unit: string;
  unitSize: string;
}

export interface Price {
  id: string;
  productId: string;
  retailer: Retailer;
  price: number;
  originalPrice?: number;
  onSale: boolean;
  lastUpdated: string;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface Retailer {
  id: string;
  name: string;
  logo: string;
  color: string;
  locations: Store[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  coordinates: [number, number];
  openingHours: string;
}

export interface ShoppingListItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
  sharedWith: string[];
  budget?: number;
  familyId?: string;
}

export interface PriceHistory {
  date: string;
  price: number;
  retailer: string;
}

export interface Deal {
  id: string;
  productId: string;
  retailer: Retailer;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
  validUntil: string;
  conditions?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  preferredLanguage: 'en' | 'af';
  loyaltyCards: LoyaltyCard[];
  monthlyBudget?: number;
}

export interface LoyaltyCard {
  retailerId: string;
  cardNumber: string;
  pointsBalance?: number;
}