// src/features/sales/components/SalesListTable.jsx (VERSÃO FINAL COM AJUSTES FINOS)
import React from 'react';
import styles from '../css/SalesPage.module.css';

import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import PaymentsIcon from '../../../components/icons/PaymentsIcon';

// Ícones de Ordenação (não mudam)
const SortAscIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> );
const SortDescIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> );
const SortNeutralIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg> );

// =================================================================
// MUDANÇA 1: USANDO A BARRA DE PROGRESSO PADRONIZADA DE COMPRAS
// =================================================================
const PaymentProgressBar = ({ paid, total }) => {
  const paidValue = parseFloat(paid) || 0;
  const totalValue = parseFloat(total) || 0;
  let percentage = totalValue > 0 ? (paidValue / totalValue) * 100 : 100;
  if (percentage > 100) percentage = 100;
  
  let barColor = '#dc3545'; // Não pago (vermelho)
  if (percentage > 0) barColor = '#007bff'; // Parcialmente pago (azul)
  if (percentage >= 99.9) barColor = '#28a745'; // Pago (verde)

  return (
    <div style={{ fontFamily: 'sans-serif', minWidth: '200px' }}>
      <div style={{ backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden', height: '8px' }}>
        <div style={{ width: `${percentage}%`, backgroundColor: barColor, height: '8px', transition: 'width 0.5s ease-in-out' }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', color: '#495057' }}>
        <span>Pago: <strong>{paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
        <span>Total: <strong>{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
      </div>
    </div>
  );
};


const SalesListTable = ({ sales, loading, handleEdit, handleDelete, openPaymentModal, handleSort, sortColumn, sortDirection }) => {
  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: loading ? 0.5 : 1 }}>
       <h2 className={styles.sectionTitle}>Vendas Registradas</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('sale_display_id')}>Venda # <span className={styles.sortIcon}>{renderSortIcon('sale_display_id')}</span></th>
            <th onClick={() => handleSort('sale_date')}>Data <span className={styles.sortIcon}>{renderSortIcon('sale_date')}</span></th>
            <th onClick={() => handleSort('customer_name')}>Cliente <span className={styles.sortIcon}>{renderSortIcon('customer_name')}</span></th>
            <th onClick={() => handleSort('salesperson_name')}>Vendedor/CC <span className={styles.sortIcon}>{renderSortIcon('salesperson_name')}</span></th>
            <th className={styles.statusCell}>Status Pag.</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && !loading ? (
            <tr><td colSpan="6" style={{textAlign: 'center'}}>Nenhuma venda encontrada.</td></tr>
          ) : (
            sales.map((sale) => (
              <tr key={sale.sale_id}>
                <td data-label="Venda #">{sale.sale_display_id}</td>
                <td data-label="Data">{new Date(sale.sale_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Cliente">{sale.customer_name || 'N/A'}</td>
                {/* ================================================================= */}
                {/* MUDANÇA 2: EXIBINDO O CENTRO DE CUSTO ABAIXO DO VENDEDOR       */}
                {/* ================================================================= */}
                <td data-label="Vendedor/CC">
                    <div style={{fontWeight: 'bold'}}>{sale.salesperson_name || 'N/A'}</div>
                    {sale.cost_center_name && <small style={{color: '#555'}}>CC: {sale.cost_center_name}</small>}
                </td>
                <td data-label="Status Pag." className={styles.statusCell}>
                  <PaymentProgressBar paid={sale.total_paid} total={sale.overall_total_amount} />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                    <div>
                        <IconButton variant="info" onClick={() => openPaymentModal(sale)} title="Ver/Adicionar Pagamentos"><PaymentsIcon /></IconButton>
                        <IconButton variant="warning" onClick={() => handleEdit(sale)} title="Editar Venda"><EditIcon /></IconButton>
                        <IconButton variant="danger" onClick={() => handleDelete(sale.sale_id, sale.sale_display_id)} title="Excluir Venda"><DeleteIcon /></IconButton>
                    </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesListTable;