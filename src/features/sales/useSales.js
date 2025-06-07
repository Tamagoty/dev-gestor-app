// src/features/sales/useSales.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15;

const saleHeaderBaseSelectString = `
  sale_id, sale_date, overall_total_amount, observations, 
  sale_display_id, sale_year, sale_number_in_year, 
  customer_id, salesperson_id, cost_center_id, 
  commission_percentage, commission_value, created_at,
  customer:merchants(name), 
  salesperson:salespeople(name),
  cost_center:cost_centers(name)
`;

export function useSales() {
  // Todos os estados permanecem os mesmos
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [listError, setListError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState('sale_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [customers, setCustomers] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormDataSources, setLoadingFormDataSources] = useState(true);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // =====================================================================
  // ========= INÍCIO DA CORREÇÃO: LÓGICA DE BUSCA DE DADOS REFINADA =========
  // =====================================================================

  // 1. DEFINIMOS A FUNÇÃO 'fetchSales' NO ESCOPO PRINCIPAL COM 'useCallback'
  const fetchSales = useCallback(async () => {
    setLoadingSales(true);
    try {
      setListError(null);
      
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('sales')
        .select(saleHeaderBaseSelectString, { count: 'exact' });

      if (filterText.trim() !== '') {
        query = query.or(`sale_display_id.ilike.%${filterText.trim()}%,observations.ilike.%${filterText.trim()}%`);
      }

      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to);

      const { data: salesData, error: salesError, count } = await query;
      if (salesError) throw salesError;

      if (salesData) {
        const salesWithDetails = await Promise.all(
          salesData.map(async (sale) => {
            const { data: payments } = await supabase.from('transactions').select('amount').eq('reference_id', sale.sale_id).eq('transaction_type', 'Venda');
            const totalPaid = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
            const { data: items } = await supabase.from('sale_items').select('product_name_at_sale').eq('sale_id', sale.sale_id).limit(1);
            const firstProductName = items && items.length > 0 ? items[0].product_name_at_sale : 'Itens Diversos';
            return { ...sale, total_paid: totalPaid, first_product_name: firstProductName };
          })
        );
        setSales(salesWithDetails);
        setTotalItems(count || 0);
      } else {
        setSales([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Erro ao buscar vendas:', err.message);
      setListError(err.message);
    } finally {
      setLoadingSales(false);
    }
  }, [currentPage, filterText, sortColumn, sortDirection]);


  // 2. O useEffect AGORA APENAS CHAMA A FUNÇÃO 'fetchSales'
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);
  

  // A busca dos dados do formulário continua igual, já estava correta
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
  
  // 3. O RETURN AGORA ENCONTRA A FUNÇÃO 'fetchSales' SEM PROBLEMAS
  return {
    sales, loadingSales, listError, refetchSales: fetchSales,
    customers, salespeople, productsList, costCentersList, loadingFormDataSources,
    currentPage, totalPages, totalItems, itemsPerPage: ITEMS_PER_PAGE, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  };
}