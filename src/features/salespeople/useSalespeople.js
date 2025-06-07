// src/features/salespeople/useSalespeople.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15; // Define quantos itens queremos por página

export function useSalespeople() {
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  
  // 1. NOVOS ESTADOS PARA PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de filtro e ordenação
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterText, setFilterText] = useState('');

  // 2. LÓGICA DE CÁLCULO DE PÁGINAS
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchSalespeople = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);

      // 3. CÁLCULO DO INTERVALO PARA O SUPABASE
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('salespeople')
        .select('*', { count: 'exact' }); // Precisamos do 'count' para saber o total

      if (filterText.trim() !== '') {
        query = query.or(`name.ilike.%${filterText.trim()}%,email.ilike.%${filterText.trim()}%`);
      }

      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to); // 4. APLICANDO O FILTRO DE INTERVALO
      
      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;
      
      setSalespeople(data || []);
      setTotalItems(count || 0); // 5. ATUALIZANDO O TOTAL DE ITENS
    } catch (err) {
      const errorMessage = 'Falha ao carregar vendedores.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
    // 6. ATUALIZANDO AS DEPENDÊNCIAS DO HOOK
  }, [sortColumn, sortDirection, filterText, currentPage]);

  useEffect(() => {
    fetchSalespeople();
  }, [fetchSalespeople]);

  const handleSort = (columnName) => {
    setSortColumn(columnName);
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // 7. RETORNANDO OS NOVOS ESTADOS E FUNÇÕES
  return {
    salespeople,
    loading,
    listError,
    filterText,
    setFilterText,
    sortColumn,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage,
    refetch: fetchSalespeople,
  };
}