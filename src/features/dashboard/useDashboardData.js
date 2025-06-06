// src/features/dashboard/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const initialCounts = { sales: 0, customers: 0, salespeople: 0, products: 0, costCenters: 0 };
const initialFinancials = { monthlySalesTotal: 0, monthlyPurchasesTotal: 0, cashBalance: 0 };

export function useDashboardData(session) {
  const [counts, setCounts] = useState(initialCounts);
  const [financialSummaries, setFinancialSummaries] = useState(initialFinancials);
  const [monthlySalesChartData, setMonthlySalesChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // --- 1. Buscando Contagens Gerais ---
      const [salesCount, customersCount, salespeopleCount, productsCount] = await Promise.all([
        supabase.from('sales').select('*', { count: 'exact', head: true }),
        supabase.from('merchants').select('*', { count: 'exact', head: true }).or('merchant_type.eq.Cliente,merchant_type.eq.Ambos'),
        supabase.from('salespeople').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setCounts({
        sales: salesCount.count || 0,
        customers: customersCount.count || 0,
        salespeople: salespeopleCount.count || 0,
        products: productsCount.count || 0,
      });

      // --- 2. Lógica Financeira ---
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
      const endOfMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

      const { data: monthlySalesData } = await supabase.from('sales').select('overall_total_amount').gte('sale_date', firstDayOfMonth).lte('sale_date', endOfMonthStr);
      const monthlySalesTotal = monthlySalesData?.reduce((sum, sale) => sum + (sale.overall_total_amount || 0), 0) || 0;

      const { data: monthlyPurchasesData } = await supabase.from('purchases').select('total_amount').gte('purchase_date', firstDayOfMonth).lte('purchase_date', endOfMonthStr);
      const monthlyPurchasesTotal = monthlyPurchasesData?.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0) || 0;
      
      const { data: salePaymentsData } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Venda');
      const totalSalePayments = salePaymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;

      const { data: purchasePaymentsData } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Compra');
      const totalPurchasePayments = purchasePaymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;

      const { data: withdrawalData } = await supabase.from('partner_withdrawals').select('amount');
      const totalWithdrawals = withdrawalData?.reduce((sum, wd) => sum + wd.amount, 0) || 0;

      const cashBalance = totalSalePayments - (totalPurchasePayments + totalWithdrawals);
      
      setFinancialSummaries({ monthlySalesTotal, monthlyPurchasesTotal, cashBalance });

      // --- 3. Lógica do Gráfico ---
      const { data: salesForChart, error: salesChartError } = await supabase.from('sales').select('sale_date, overall_total_amount').order('sale_date');
      if (salesChartError) throw salesChartError;
      
      if (salesForChart) {
        const monthlyData = salesForChart.reduce((acc, sale) => {
          // A verificação 'if (sale.sale_date)' garante que não tentaremos usar substring em um valor nulo
          if (sale.sale_date) {
            // ===================================================================
            // AQUI ESTÁ A CORREÇÃO PRINCIPAL
            // ===================================================================
            const yearMonth = sale.sale_date.substring(0, 7); // De 'sale.date' para 'sale.sale_date'
            acc[yearMonth] = (acc[yearMonth] || 0) + parseFloat(sale.overall_total_amount || 0);
          }
          return acc;
        }, {});
        const chartData = Object.keys(monthlyData).sort().slice(-6).map(key => ({ name: key, Vendas: monthlyData[key] }));
        setMonthlySalesChartData(chartData);
      }
      
    } catch (error) {
      toast.error(`Falha ao carregar dados do painel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { counts, financialSummaries, monthlySalesChartData, loading };
}