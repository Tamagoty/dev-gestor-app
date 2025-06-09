// src/features/sales/useSales.js (VERSÃO FINAL COM FILTROS)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15;

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [listError, setListError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState('sale_date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // NOVO ESTADO PARA O FILTRO DE VENDAS EM ABERTO
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormDataSources, setLoadingFormDataSources] = useState(true);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchSales = useCallback(async () => {
    setLoadingSales(true);
    try {
      setListError(null);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from('sales_with_status_view').select('*', { count: 'exact' });

      // FILTRO DE TEXTO ATUALIZADO
      if (filterText.trim() !== '') {
        query = query.or(`sale_display_id.ilike.%${filterText.trim()}%,observations.ilike.%${filterText.trim()}%,customer_name.ilike.%${filterText.trim()}%`);
      }
      
      // NOVO FILTRO DE SALDO EM ABERTO
      if (showOnlyOpen) {
        query = query.gt('balance', 0);
      }

      query = query.order(sortColumn, { ascending: sortDirection === 'asc' }).range(from, to);

      const { data: salesData, error: salesError, count } = await query;
      if (salesError) throw salesError;
      
      setSales(salesData || []);
      setTotalItems(count || 0);

    } catch (err) {
      console.error('Erro ao buscar vendas:', err.message);
      setListError(err.message);
    } finally {
      setLoadingSales(false);
    }
  }, [currentPage, filterText, sortColumn, sortDirection, showOnlyOpen]); // Adicionada dependência

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);
  
  // O resto do hook não muda...
  useEffect(() => {
    const fetchFormDataSources = async () => {
      setLoadingFormDataSources(true);
      try {
        const [customersRes, salespeopleRes, productsRes, costCentersRes] = await Promise.all([
          supabase.from('merchants').select('merchant_id, name').or('merchant_type.eq.Cliente,merchant_type.eq.Ambos').order('name'),
          supabase.from('salespeople').select('salesperson_id, name').eq('is_active', true).order('name'),
          supabase.from('products').select('product_id, name, sale_price').or('product_type.eq.Venda,product_type.eq.Ambos').eq('is_active', true).order('name'),
          supabase.from('cost_centers').select('cost_center_id, name').eq('is_active', true).order('name'),
        ]);
        setCustomers(customersRes.data || []);
        setSalespeople(salespeopleRes.data || []);
        setProductsList(productsRes.data || []);
        setCostCentersList(costCentersRes.data || []);
      } catch (error) {
        toast.error("Falha ao carregar dados para os formulários.");
      } finally {
        setLoadingFormDataSources(false);
      }
    };
    fetchFormDataSources();
  }, []);
  
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
    sales, loadingSales, listError, refetchSales: fetchSales,
    customers, salespeople, productsList, costCentersList, loadingFormDataSources,
    currentPage, totalPages, totalItems, itemsPerPage: ITEMS_PER_PAGE, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort,
    showOnlyOpen, setShowOnlyOpen // Exportando o novo estado
  };
}