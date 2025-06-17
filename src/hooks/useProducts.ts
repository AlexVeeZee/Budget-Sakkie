import { useState, useEffect, useCallback } from 'react';
import { ProductService, type ProductWithCategory } from '../services/productService';
import type { Database } from '../types/database';

type Category = Database['public']['Tables']['categories']['Row'];

interface UseProductsState {
  products: ProductWithCategory[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const useProducts = () => {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    categories: [],
    loading: true,
    error: null
  });

  const fetchProducts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [products, categories] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getAllCategories()
      ]);

      setState({
        products,
        categories,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const products = await ProductService.searchProducts(query);
      
      setState(prev => ({
        ...prev,
        products,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search products';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  const getProductsByCategory = useCallback(async (categoryId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const products = await ProductService.getProductsByCategory(categoryId);
      
      setState(prev => ({
        ...prev,
        products,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products by category';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  const getProductsByStore = useCallback(async (storeId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const products = await ProductService.getProductsByStore(storeId);
      
      setState(prev => ({
        ...prev,
        products,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products by store';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  const getPriceComparison = useCallback(async (productName: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const products = await ProductService.getProductPriceComparison(productName);
      
      setState(prev => ({
        ...prev,
        products,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get price comparison';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  const refreshProducts = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    ...state,
    searchProducts,
    getProductsByCategory,
    getProductsByStore,
    getPriceComparison,
    refreshProducts
  };
};