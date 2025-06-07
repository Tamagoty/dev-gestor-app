// src/features/purchases/usePurchases.js
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
        .from('purchases')
        .select(`*, supplier:merchants(name), product:products(name), cost_center:cost_centers(name)`, { count: 'exact' });

      if (filterText.trim() !== '') {
        query = query.or(`product_name.ilike.%${filterText.trim()}%`);
      }
      
      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to);

      const { data: purchasesData, error: purchasesError, count } = await query;
      if (purchasesError) throw purchasesError;

      if (purchasesData) {
        const purchasesWithPaymentInfo = await Promise.all(
          purchasesData.map(async (purchase) => {
            const { data: payments } = await supabase.from('transactions').select('amount').eq('reference_id', purchase.purchase_id).eq('transaction_type', 'Compra');
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            return { ...purchase, total_paid: totalPaid };
          })
        );
        setPurchases(purchasesWithPaymentInfo);
        setTotalItems(count || 0);
      } else {
        setPurchases([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Erro ao buscar compras:', err.message);
      setListError(err.message);
    } finally {
      setLoadingPurchases(false);
    }
  }, [currentPage, filterText, sortColumn, sortDirection]);

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

  return {
    purchases, loadingPurchases, listError, refetchPurchases: fetchPurchases,
    suppliers, productsList, costCentersList, loadingFormDataSources,
    currentPage, totalPages, totalItems, itemsPerPage: ITEMS_PER_PAGE, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  };
}