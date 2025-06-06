// src/features/merchants/useMerchants.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function useMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMerchants(data || []);
    } catch (err) {
      const errorMessage = 'Falha ao carregar clientes/fornecedores.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  return {
    merchants,
    loading,
    listError,
    refetchMerchants: fetchMerchants,
  };
}