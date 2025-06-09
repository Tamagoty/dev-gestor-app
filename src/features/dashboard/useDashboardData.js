// src/features/dashboard/useDashboardData.js (VERSÃO OTIMIZADA)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// Os estados iniciais não mudam
const initialCounts = { customers: 0, salespeople: 0, products: 0 };
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
      // =================================================================
      // TODA A LÓGICA ANTIGA FOI SUBSTITUÍDA POR UMA ÚNICA CHAMADA RPC
      // =================================================================
      const { data, error } = await supabase.rpc('get_dashboard_summary');

      if (error) {
        throw error;
      }
      
      if (data) {
        // O objeto 'data' já vem com a estrutura que precisamos
        setCounts(data.counts);
        setFinancialSummaries(data.financials);
        // A lógica do gráfico espera os meses em ordem crescente
        setMonthlySalesChartData(data.chartData.reverse()); 
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