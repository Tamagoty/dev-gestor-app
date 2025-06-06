// src/features/salespeople/useSalespeople.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function useSalespeople() {
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterText, setFilterText] = useState('');

  const fetchSalespeople = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      let query = supabase.from('salespeople').select('*');

      if (filterText.trim() !== '') {
        query = query.or(`name.ilike.%${filterText.trim()}%,email.ilike.%${filterText.trim()}%`);
      }

      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      
      setSalespeople(data || []);
    } catch (err) {
      const errorMessage = 'Falha ao carregar vendedores.';
      console.error(errorMessage, err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sortColumn, sortDirection, filterText]);

  useEffect(() => {
    fetchSalespeople();
  }, [fetchSalespeople]); // O useCallback garante que a função só mude quando necessário

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prevDir => (prevDir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  // A função de refetch é retornada para ser usada após uma exclusão, edição ou adição bem-sucedida.
  return {
    salespeople,
    loading,
    error,
    filterText,
    setFilterText,
    sortColumn,
    sortDirection,
    handleSort,
    refetch: fetchSalespeople,
  };
}