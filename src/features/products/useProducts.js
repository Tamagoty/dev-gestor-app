// src/features/products/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15;

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  // Estados de Paginação e Filtro
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');

  // Estados para Controle da Ordenação
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      setListError(null);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (filterText.trim() !== '') {
        query = query.or(`name.ilike.%${filterText.trim()}%,category.ilike.%${filterText.trim()}%`);
      }

      // Aplicando a ordenação na consulta
      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;

      setProducts(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      const errorMessage = 'Falha ao carregar produtos/serviços.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterText, sortColumn, sortDirection]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Função para mudar a ordenação
  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Volta para a primeira página ao reordenar
  };

  return {
    products,
    loading,
    listError,
    refetchProducts: fetchProducts,
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