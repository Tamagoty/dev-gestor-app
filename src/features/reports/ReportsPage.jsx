// src/features/reports/ReportsPage.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import styles from './css/ReportsPage.module.css';
import SalesReportTable from './components/SalesReportTable';
import PrimaryButton from '../../components/PrimaryButton';

function ReportsPage() {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Por favor, selecione as datas de início e fim.");
      return;
    }
    setLoading(true);
    setReportData(null); // Limpa os dados anteriores
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*, customer:merchants(name)')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: true });

      if (error) throw error;
      
      setReportData(data);
      if (data.length === 0) {
        toast.success("Nenhuma venda encontrada para o período selecionado.");
      }
    } catch (error) {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Módulo de Relatórios</h1>

      <div className={styles.reportSelector}>
        <h3>Relatório de Vendas por Período</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="start-date">Data de Início:</label>
            <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="end-date">Data de Fim:</label>
            <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <PrimaryButton onClick={handleGenerateReport} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </PrimaryButton>
        </div>
      </div>

      <div className={styles.resultsContainer}>
        {loading && <p>Carregando resultados...</p>}
        {reportData && <SalesReportTable data={reportData} />}
      </div>
    </div>
  );
}

export default ReportsPage;