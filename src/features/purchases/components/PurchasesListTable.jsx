// src/features/purchases/components/PurchasesListTable.jsx
import React from 'react';
import styles from '../css/PurchasesPage.module.css';

import IconButton from '../../../components/IconButton';
import PaymentsIcon from '../../../components/icons/PaymentsIcon';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';

const SortAscIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> );
const SortDescIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> );
const SortNeutralIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg> );

const PaymentProgressBar = ({ paid, total }) => {
  const paidValue = parseFloat(paid) || 0;
  const totalValue = parseFloat(total) || 0;
  const saldo = totalValue - paidValue;
  let percentage = 0;
  if (totalValue > 0) { percentage = Math.min((paidValue / totalValue) * 100, 100); }
  else if (totalValue === 0 && paidValue >= 0) { percentage = 100; }
  
  let borderColor = '#28a745', barColor = '#28a745', textColor = '#fff';
  if (percentage < 99.9) {
    if (paidValue === 0 && totalValue > 0) { borderColor = '#dc3545'; barColor = 'transparent'; textColor = '#495057'; }
    else { borderColor = '#007bff'; barColor = '#007bff'; }
  }
  const barContainerStyle = { width: '100%', height: '22px', backgroundColor: '#e9ecef', borderRadius: '4px', position: 'relative', display: 'flex', alignItems: 'center', border: `1.5px solid ${borderColor}`, boxSizing: 'border-box' };
  const barFillStyle = { height: '100%', width: `${percentage}%`, backgroundColor: barColor, borderRadius: '2px', transition: 'width 0.4s ease-in-out' };
  const textStyle = { position: 'absolute', width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: textColor, lineHeight: '22px', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' };
  const saldoStyle = { fontSize: '0.75rem', color: saldo > 0.005 ? '#dc3545' : '#6c757d', fontWeight: 'bold', marginTop: '4px', textAlign: 'center' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={barContainerStyle} title={`Pago: R$ ${paidValue.toFixed(2)} de R$ ${totalValue.toFixed(2)}`}>
        <div style={barFillStyle}></div>
        <span style={textStyle}>{paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
      </div>
      <small style={saldoStyle}>Saldo: {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</small>
    </div>
  );
};

const PurchasesListTable = ({ purchases, isLoading, handleEdit, handleDelete, openPaymentModal, handleSort, sortColumn, sortDirection }) => {
  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: isLoading ? 0.5 : 1 }}>
      <h2 className={styles.sectionTitle}>Compras Registradas</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('purchase_date')}>Data <span className={styles.sortIcon}>{renderSortIcon('purchase_date')}</span></th>
            <th onClick={() => handleSort('supplier.name')}>Fornecedor <span className={styles.sortIcon}>{renderSortIcon('supplier.name')}</span></th>
            <th onClick={() => handleSort('product_name')}>Produto <span className={styles.sortIcon}>{renderSortIcon('product_name')}</span></th>
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
                <td data-label="Data">{new Date(purchase.purchase_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Fornecedor">{purchase.supplier?.name || 'N/A'}</td>
                <td data-label="Produto">{purchase.product_name}</td>
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