// src/features/reports/ReportsPage.jsx (VERSÃO REATORADA)
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import styles from './css/ReportsPage.module.css';

import SalesReportDisplay from './components/SalesReportDisplay'; // Componente de exibição
import PurchaseReportDisplay from './components/PurchaseReportDisplay'; // Componente de exibição de compras
import CommissionReportDisplay from './components/CommissionReportDisplay';
import PrimaryButton from '../../components/PrimaryButton';
import { useSalespeople } from '../salespeople/useSalespeople'; // Hook para buscar vendedores

function ReportsPage() {
  const [activeReport, setActiveReport] = useState('sales'); // sales, purchases, commissions
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSalesperson, setSelectedSalesperson] = useState('');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { salespeople } = useSalespeople();

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      if (activeReport === 'commissions' && !selectedSalesperson) {
        toast.error('Por favor, selecione um vendedor para gerar o relatório de comissões.');
        return;
      }

       const params = {
        report_type: activeReport,
        p_start_date: startDate, // De 'start_date' para 'p_start_date'
        p_end_date: endDate,     // De 'end_date' para 'p_end_date'
        salesperson_id_param: activeReport === 'commissions' ? selectedSalesperson : null
      };
      
      const { data, error } = await supabase.rpc('get_financial_report', params);

      if (error) throw error;
      
      setReportData(data);
      // Ajuste na condição para verificar se existem detalhes no relatório
      if (!data || !data.details || data.details.length === 0) {
        toast.success("Nenhum dado encontrado para os filtros selecionados.");
      }
    } catch (error) {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
   const renderReport = () => {
  if (!reportData) return <p>Selecione os filtros e gere um relatório.</p>;
  
  switch(activeReport) {
    case 'sales':
      return <SalesReportDisplay data={reportData} />;
    case 'purchases':
      return <PurchaseReportDisplay data={reportData} />;
    case 'commissions':
      // Passando os filtros e a função de recarregar como props
      return <CommissionReportDisplay 
                data={reportData} 
                filters={{ start: startDate, end: endDate, salesperson: selectedSalesperson }}
                onPaymentSuccess={handleGenerateReport} 
              />;
    default:
      return null;
  }
};

  return (
    <div className={styles.pageContainer}>
      <h1>Módulo de Relatórios</h1>

      <div className={styles.tabsContainer}>
        <button className={activeReport === 'sales' ? styles.activeTab : styles.tab} onClick={() => setActiveReport('sales')}>Vendas</button>
        <button className={activeReport === 'purchases' ? styles.activeTab : styles.tab} onClick={() => setActiveReport('purchases')}>Compras</button>
        <button className={activeReport === 'commissions' ? styles.activeTab : styles.tab} onClick={() => setActiveReport('commissions')}>Comissões</button>
      </div>

      <div className={styles.filtersContainer}>
        <div><label>Data de Início:</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        <div><label>Data de Fim:</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
        
        {activeReport === 'commissions' && (
          <div>
            <label>Vendedor:</label>
            <select value={selectedSalesperson} onChange={e => setSelectedSalesperson(e.target.value)} required>
              <option value="">Selecione...</option>
              {salespeople.map(s => <option key={s.salesperson_id} value={s.salesperson_id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <PrimaryButton onClick={handleGenerateReport} disabled={loading}>
          {loading ? 'Gerando...' : 'Gerar Relatório'}
        </PrimaryButton>
      </div>

      <div className={styles.resultsContainer}>
        {loading ? <p>Carregando resultados...</p> : renderReport()}
      </div>
    </div>
  );
}

export default ReportsPage;