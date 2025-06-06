// src/features/products/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      const errorMessage = 'Falha ao carregar produtos/serviços.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    listError,
    refetchProducts: fetchProducts,
  };
}