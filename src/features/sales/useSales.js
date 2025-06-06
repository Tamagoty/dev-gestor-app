// src/features/sales/useSales.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// String de SELECT para o cabeçalho da venda
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
  // Estados para a lista de vendas
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [listError, setListError] = useState(null);
  const [filterTextSales, setFilterTextSales] = useState('');

  // Estados para os dados dos formulários (dropdowns)
  const [customers, setCustomers] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormDataSources, setLoadingFormDataSources] = useState(true);

  // Função para buscar a lista de vendas (depende do filtro)
  const fetchSales = useCallback(async () => {
    setLoadingSales(true);
    try {
      setListError(null);
      let query = supabase.from('sales').select(saleHeaderBaseSelectString);

      if (filterTextSales.trim() !== '') {
        const searchTerm = `%${filterTextSales.trim()}%`;
        query = query.or(`sale_display_id.ilike.${searchTerm},observations.ilike.${searchTerm},customer.name.ilike.${searchTerm},cost_center.name.ilike.${searchTerm}`);
      }

      query = query.order('sale_year', { ascending: false }).order('sale_number_in_year', { ascending: false });
      const { data: salesData, error: salesError } = await query;
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
      } else {
        setSales([]);
      }
    } catch (err) {
      console.error('Erro ao buscar vendas:', err.message);
      setListError(err.message);
    } finally {
      setLoadingSales(false);
    }
  }, [filterTextSales]);

  // Função para buscar dados dos dropdowns (só roda uma vez)
  const fetchFormDataSources = useCallback(async () => {
    setLoadingFormDataSources(true);
    try {
      const [customersRes, salespeopleRes, productsRes, costCentersRes] = await Promise.all([
        supabase.from('merchants').select('merchant_id, name').or('merchant_type.eq.Cliente,merchant_type.eq.Ambos').order('name'),
        supabase.from('salespeople').select('salesperson_id, name').eq('is_active', true).order('name'),
        supabase.from('products').select('product_id, name, sale_price').or('product_type.eq.Venda,product_type.eq.Ambos').eq('is_active', true).order('name'),
        supabase.from('cost_centers').select('cost_center_id, name').eq('is_active', true).order('name'),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (salespeopleRes.error) throw salespeopleRes.error;
      if (productsRes.error) throw productsRes.error;
      if (costCentersRes.error) throw costCentersRes.error;

      setCustomers(customersRes.data || []);
      setSalespeople(salespeopleRes.data || []);
      setProductsList(productsRes.data || []);
      setCostCentersList(costCentersRes.data || []);

    } catch (error) {
      toast.error("Falha ao carregar dados para os formulários.");
      console.error("Erro carregando fontes de dados:", error);
    } finally {
      setLoadingFormDataSources(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    fetchFormDataSources();
  }, [fetchFormDataSources]);

  return {
    sales,
    loadingSales,
    listError,
    filterTextSales,
    setFilterTextSales,
    customers,
    salespeople,
    productsList,
    costCentersList,
    loadingFormDataSources,
    refetchSales: fetchSales
  };
}