// src/features/merchants/useMerchants.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15;

export function useMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // 1. ADICIONANDO ESTADOS PARA PAGINAÇÃO, FILTRO E ORDENAÇÃO
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('merchants')
        .select('*', { count: 'exact' });

      // Aplicando filtro por nome ou apelido
      if (filterText.trim() !== '') {
        query = query.or(`name.ilike.%${filterText.trim()}%,nickname.ilike.%${filterText.trim()}%`);
      }

      // Aplicando ordenação e paginação
      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to);
      
      const { data, error, count } = await query;
      if (error) throw error;

      setMerchants(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      const errorMessage = 'Falha ao carregar clientes/fornecedores.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterText, sortColumn, sortDirection]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  // Função para mudar a ordenação
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
    merchants,
    loading,
    listError,
    refetchMerchants: fetchMerchants,
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