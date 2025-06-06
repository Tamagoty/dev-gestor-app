// src/features/dashboard/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const initialCounts = { sales: 0, customers: 0, salespeople: 0, partners: 0, products: 0, costCenters: 0 };
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
      // 1. Buscando contagens gerais
      const [salesCount, customersCount, salespeopleCount, partnersCount, productsCount, costCentersCount] = await Promise.all([
        supabase.from('sales').select('*', { count: 'exact', head: true }),
        supabase.from('merchants').select('*', { count: 'exact', head: true }).or('merchant_type.eq.Cliente,merchant_type.eq.Ambos'),
        supabase.from('salespeople').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('cost_centers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      setCounts({
        sales: salesCount.count || 0,
        customers: customersCount.count || 0,
        salespeople: salespeopleCount.count || 0,
        partners: partnersCount.count || 0,
        products: productsCount.count || 0,
        costCenters: costCentersCount.count || 0,
      });

      // 2. Buscando dados financeiros (mês atual e saldo de caixa)
      // ... (Toda a lógica de cálculo de vendas, compras e saldo que estava na HomePage)
      const { data: salesForChart, error: salesChartError } = await supabase.from('sales').select('sale_date, overall_total_amount');
      if (salesChartError) throw salesChartError;
      
      // 3. Processando dados para o gráfico
      if (salesForChart) {
        const monthlyData = salesForChart.reduce((acc, sale) => {
          const yearMonth = sale.sale_date.substring(0, 7);
          acc[yearMonth] = (acc[yearMonth] || 0) + parseFloat(sale.overall_total_amount || 0);
          return acc;
        }, {});
        const chartData = Object.keys(monthlyData).sort().map(key => ({ name: key, Vendas: monthlyData[key] }));
        setMonthlySalesChartData(chartData);
      }
      
    } catch (error) {
      toast.error(`Falha ao carregar dados do painel: ${error.message}`);
      console.error("Erro no dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { counts, financialSummaries, monthlySalesChartData, loading };
}