// src/features/purchases/components/PurchasesListTable.jsx (VERSÃO FINAL CORRIGIDA)
import React from 'react';
import styles from '../css/PurchasesPage.module.css';
import IconButton from '../../../components/IconButton';
import PaymentsIcon from '../../../components/icons/PaymentsIcon';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';

const SortAscIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> );
const SortDescIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> );
const SortNeutralIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg> );

// =================================================================
// COMPONENTE DA BARRA DE PROGRESSO TOTALMENTE REFEITO
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
      {/* A barra de progresso visual */}
      <div style={{ backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden', height: '8px' }}>
        <div style={{ width: `${percentage}%`, backgroundColor: barColor, height: '8px', transition: 'width 0.5s ease-in-out' }}></div>
      </div>
      {/* Textos descritivos com Flexbox */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', color: '#495057' }}>
        <span>Pago: <strong>{paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
        <span>Total: <strong>{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
      </div>
    </div>
  );
};

const PurchasesListTable = ({ purchases, isLoading, handleEdit, handleDelete, openPaymentModal, handleSort, sortColumn, sortDirection }) => {
  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: isLoading ? 0.5 : 1, overflowX: 'auto' }}>
      <h2 className={styles.sectionTitle}>Compras Registradas</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('purchase_date')}>Data <span className={styles.sortIcon}>{renderSortIcon('purchase_date')}</span></th>
            <th onClick={() => handleSort('supplier_name')}>Fornecedor <span className={styles.sortIcon}>{renderSortIcon('supplier_name')}</span></th>
            <th onClick={() => handleSort('cost_center_name')}>Centro de Custo <span className={styles.sortIcon}>{renderSortIcon('cost_center_name')}</span></th>
            <th className={styles.statusCell}>Status Pag.</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {purchases.length === 0 && !isLoading ? (
            <tr><td colSpan="5" style={{textAlign: 'center'}}>Nenhuma compra encontrada.</td></tr>
          ) : (
            purchases.map((purchase) => (
              <tr key={purchase.purchase_id}>
                {/* Atributos data-label são usados pelo CSS para a responsividade */}
                <td data-label="Data">{new Date(purchase.purchase_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Fornecedor">{purchase.supplier_name}</td>
                <td data-label="Centro de Custo">{purchase.cost_center_name}</td>
                <td data-label="Status Pag." className={styles.statusCell}>
                  <PaymentProgressBar paid={purchase.total_paid} total={purchase.total_amount} />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <IconButton variant="info" onClick={() => openPaymentModal(purchase)} title="Pagamentos"><PaymentsIcon /></IconButton>
                    <IconButton variant="warning" onClick={() => handleEdit(purchase)} title="Editar"><EditIcon /></IconButton>
                    <IconButton variant="danger" onClick={() => handleDelete(purchase)} title="Excluir"><DeleteIcon /></IconButton>
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

export default PurchasesListTable;