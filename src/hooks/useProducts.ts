import { useState, useEffect } from 'react';
import { ProductService, ProductFilters } from '../services/productService';
import { ProductWithCategory, Category } from '../types/database';

export const useProducts = (filters: ProductFilters = {}) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await ProductService.getProducts(filters);

    if (fetchError) {
      setError(fetchError.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await ProductService.getCategories();

    if (fetchError) {
      setError(fetchError.message);
      setCategories([]);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await ProductService.getFeaturedProducts();

    if (fetchError) {
      setError(fetchError.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchFeaturedProducts
  };
};