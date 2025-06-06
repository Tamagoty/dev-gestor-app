// src/features/partners/usePartners.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function usePartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      const errorMessage = 'Falha ao carregar sócios.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    listError,
    refetchPartners: fetchPartners,
  };
}