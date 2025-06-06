// src/features/costCenters/useCostCenters.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function useCostCenters() {
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const fetchCostCenters = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCostCenters(data || []);
    } catch (err) {
      const errorMessage = 'Falha ao carregar centros de custo.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCostCenters();
  }, [fetchCostCenters]);

  return {
    costCenters,
    loading,
    listError,
    refetchCostCenters: fetchCostCenters,
  };
}