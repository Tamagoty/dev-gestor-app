// src/features/partners/usePartners.js (VERSÃO CORRIGIDA)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15;

export function usePartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('partners')
        .select('*', { count: 'exact' });
      
      if (filterText.trim() !== '') {
        // =================================================================
        // A CORREÇÃO ESTÁ AQUI: Adicionado espaço em 'const searchTerm'
        // =================================================================
        const searchTerm = `%${filterText.trim()}%`;
        query = query.or(`name.ilike.${searchTerm},cpf_cnpj.ilike.${searchTerm}`);
      }
      
      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to);
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      setPartners(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      const errorMessage = 'Falha ao carregar sócios.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterText, sortColumn, sortDirection]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return {
    partners,
    loading,
    listError,
    refetchPartners: fetchPartners,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage,
    filterText,
    setFilterText,
    sortColumn,
    sortDirection,
    handleSort,
  };
}