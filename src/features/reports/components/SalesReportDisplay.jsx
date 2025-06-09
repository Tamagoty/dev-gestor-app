// src/features/reports/components/SalesReportDisplay.jsx
import React from 'react';
import styles from '../css/ReportsPage.module.css';

const SalesReportDisplay = ({ data }) => {
  if (!data || !data.summary || !data.details) return null;

  const { summary, details } = data;

  return (
    <>
      <div className={styles.summary}>
        <span>Total de Vendas: {summary.count}</span>
        <span>Valor Total: {summary.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        <span>Ticket Médio: {summary.avg_ticket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
      </div>

      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Venda #</th>
            <th>Cliente</th>
            <th style={{ textAlign: 'right' }}>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {details.map((sale, index) => (
            <tr key={index}>
              <td>{new Date(sale.date + 'T00:00:00Z').toLocaleDateString()}</td>
              <td>{sale.display_id}</td>
              <td>{sale.customer_name || 'N/A'}</td>
              <td style={{ textAlign: 'right' }}>{sale.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default SalesReportDisplay;