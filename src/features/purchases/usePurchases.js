// src/features/purchases/usePurchases.js (VERSÃO FINAL COM FILTROS AVANÇADOS)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15;

export function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [listError, setListError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState('purchase_date');
  const [sortDirection, setSortDirection] = useState('desc');

  // =================================================================
  // 1. ADICIONADO NOVO ESTADO PARA O FILTRO DE SALDO EM ABERTO
  // =================================================================
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormDataSources, setLoadingFormDataSources] = useState(true);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchPurchases = useCallback(async () => {
    setLoadingPurchases(true);
    try {
      setListError(null);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('purchases_with_status_view')
        .select('*', { count: 'exact' });

      // =================================================================
      // 2. LÓGICA DO FILTRO DE TEXTO ATUALIZADA
      // =================================================================
      if (filterText.trim() !== '') {
        // Agora busca em ambas as colunas: nome do fornecedor E nome do centro de custo
        const filterQuery = `supplier_name.ilike.%${filterText.trim()}%,cost_center_name.ilike.%${filterText.trim()}%`;
        query = query.or(filterQuery);
      }

      // =================================================================
      // 3. LÓGICA DO NOVO FILTRO DE SALDO EM ABERTO ADICIONADA
      // =================================================================
      if (showOnlyOpen) {
        // balance é a coluna da nossa VIEW que calcula (total - pago)
        query = query.gt('balance', 0); // gt = Greater Than (maior que)
      }
      
      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to);

      const { data: purchasesData, error: purchasesError, count } = await query;
      if (purchasesError) throw purchasesError;
      
      setPurchases(purchasesData || []);
      setTotalItems(count || 0);

    } catch (err) {
      console.error('Erro ao buscar compras:', err.message);
      setListError(err.message);
      toast.error(`Falha ao carregar compras: ${err.message}`);
    } finally {
      setLoadingPurchases(false);
    }
  // 4. ADICIONADO `showOnlyOpen` ÀS DEPENDÊNCIAS DO CALLBACK
  }, [currentPage, filterText, sortColumn, sortDirection, showOnlyOpen]);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const fetchFormDataSources = useCallback(async () => {
    // ... (esta função não muda)
    setLoadingFormDataSources(true);
    try {
       const [suppliersRes, productsRes, costCentersRes] = await Promise.all([
        supabase.from('merchants').select('merchant_id, name').or('merchant_type.eq.Fornecedor,merchant_type.eq.Ambos').order('name'),
        supabase.from('products').select('product_id, name, purchase_price').or('product_type.eq.Compra,product_type.eq.Ambos').eq('is_active', true).order('name'),
        supabase.from('cost_centers').select('cost_center_id, name').eq('is_active', true).order('name'),
      ]);
      setSuppliers(suppliersRes.data || []);
      setProductsList(productsRes.data || []);
      setCostCentersList(costCentersRes.data || []);
    } catch (error) {
       toast.error("Falha ao carregar dados dos formulários.");
    } finally {
       setLoadingFormDataSources(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    fetchFormDataSources();
  }, [fetchFormDataSources]);

  // =================================================================
  // 5. RETORNANDO O NOVO ESTADO E O SETTER DO HOOK
  // =================================================================
  return {
    purchases, loadingPurchases, listError, refetchPurchases: fetchPurchases,
    suppliers, productsList, costCentersList, loadingFormDataSources,
    currentPage, totalPages, totalItems, itemsPerPage: ITEMS_PER_PAGE, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort,
    showOnlyOpen, setShowOnlyOpen, // Exportando para a página usar
  };
}