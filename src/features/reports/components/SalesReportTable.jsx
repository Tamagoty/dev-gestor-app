// src/features/reports/components/SalesReportTable.jsx
import React from 'react';
import styles from '../css/ReportsPage.module.css';

const SalesReportTable = ({ data }) => {
  const totalAmount = data.reduce((sum, sale) => sum + sale.overall_total_amount, 0);

  return (
    <>
      <div className={styles.summary}>
        <span>Período: {data.length > 0 ? `${new Date(data[0].sale_date + 'T00:00:00Z').toLocaleDateString()} a ${new Date(data[data.length - 1].sale_date + 'T00:00:00Z').toLocaleDateString()}` : '-'}</span>
        <span>Total de Vendas: {data.length}</span>
        <span>Valor Total: {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
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
          {data.map((sale) => (
            <tr key={sale.sale_id}>
              <td>{new Date(sale.sale_date + 'T00:00:00Z').toLocaleDateString()}</td>
              <td>{sale.sale_display_id}</td>
              <td>{sale.customer?.name || 'N/A'}</td>
              <td style={{ textAlign: 'right' }}>{sale.overall_total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default SalesReportTable;