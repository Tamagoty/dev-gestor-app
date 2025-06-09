// src/features/reports/components/PurchaseReportDisplay.jsx
import React from 'react';
import styles from '../css/ReportsPage.module.css';

const PurchaseReportDisplay = ({ data }) => {
  // Garante que não tentaremos renderizar com dados ausentes
  if (!data || !data.summary || !data.details) return null;

  const { summary, details } = data;

  return (
    <>
      {/* Seção de Resumo do Relatório */}
      <div className={styles.summary}>
        <span>Total de Compras: {summary.count}</span>
        <span>Valor Total: {summary.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
      </div>

      {/* Tabela com os Detalhes das Compras */}
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Fornecedor</th>
            <th>Centro de Custo</th>
            <th style={{ textAlign: 'right' }}>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {details.map((purchase, index) => (
            <tr key={index}>
              <td>{new Date(purchase.date + 'T00:00:00Z').toLocaleDateString()}</td>
              <td>{purchase.supplier_name || 'N/A'}</td>
              <td>{purchase.cost_center_name || 'N/A'}</td>
              <td style={{ textAlign: 'right' }}>{purchase.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default PurchaseReportDisplay;