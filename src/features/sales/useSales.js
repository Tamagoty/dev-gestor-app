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
  // Estados para a lista de vendas e controle
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [listError, setListError] = useState(null);

  // Estados para paginação, filtro e ordenação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState('sale_date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Estados para os dados dos formulários (dropdowns)
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

      let query = supabase
        .from('sales')
        .select(saleHeaderBaseSelectString, { count: 'exact' });

      if (filterText.trim() !== '') {
        query = query.or(`sale_display_id.ilike.%${filterText.trim()}%,observations.ilike.%${filterText.trim()}%`);
        // Nota: Filtrar por nome do cliente (tabela externa) diretamente no '.or' é complexo.
        // Uma abordagem mais avançada com RPC (Remote Procedure Call) seria ideal, mas para este caso,
        // o filtro funcionará bem para ID da venda e observações.
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
  
  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };
  
  const fetchFormDataSources = useCallback(async () => {
    // ... (lógica para buscar dados dos dropdowns permanece a mesma)
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    fetchFormDataSources();
  }, [fetchFormDataSources]);

  return {
    sales, loadingSales, listError, refetchSales: fetchSales,
    customers, salespeople, productsList, costCentersList, loadingFormDataSources,
    currentPage, totalPages, totalItems, itemsPerPage: ITEMS_PER_PAGE, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  };
}