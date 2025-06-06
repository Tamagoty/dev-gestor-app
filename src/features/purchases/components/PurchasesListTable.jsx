// src/features/purchases/components/PurchasesListTable.jsx
import React from 'react';
import styles from '../css/PurchasesPage.module.css';

// Ícones SVG
const PaymentsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> );
const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );

const PaymentProgressBar = ({ paid, total }) => {
  const paidValue = parseFloat(paid) || 0;
  const totalValue = parseFloat(total) || 0;
  const saldo = totalValue - paidValue;
  let percentage = 0;
  if (totalValue > 0) {
    percentage = Math.min((paidValue / totalValue) * 100, 100);
  } else if (totalValue === 0 && paidValue >= 0) {
    percentage = 100;
  }

  // --- LÓGICA DE CORES E CONTORNOS COMPLETA ---
  let borderColor = '#28a745'; // Verde (pago)
  let barColor = '#28a745';
  let textColor = '#fff';

  if (percentage < 99.9) {
    if (paidValue === 0) {
      borderColor = '#dc3545'; // Contorno Vermelho para zerado
      barColor = '#e9ecef';
      textColor = '#495057';
    } else {
      borderColor = '#007bff'; // Contorno Azul para parcial
      barColor = '#007bff';
      textColor = '#fff';
    }
  }

  const barContainerStyle = {
    width: '100%',
    height: '22px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    border: `1.5px solid ${borderColor}`, // Aplica o contorno dinâmico
    boxSizing: 'border-box',
  };

  const barFillStyle = { height: '100%', width: `${percentage}%`, backgroundColor: barColor, borderRadius: '2px', transition: 'width 0.4s ease-in-out' };
  const textStyle = { position: 'absolute', width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: textColor, lineHeight: '22px', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' };
  const saldoStyle = { fontSize: '0.75rem', color: saldo > 0.005 ? '#dc3545' : '#6c757d', fontWeight: 'bold', marginTop: '4px', textAlign: 'center' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={barContainerStyle} title={`Pago: R$ ${paidValue.toFixed(2)} de R$ ${totalValue.toFixed(2)}`}>
        <div style={barFillStyle}></div>
        <span style={textStyle}>
          {paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
      <small style={saldoStyle}>
        Saldo: {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </small>
    </div>
  );
};

const PurchasesListTable = ({ purchases, handleEdit, handleDelete, openPaymentModal }) => {
  return (
    <div>
      <h2>Compras Registradas</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Fornecedor</th>
            <th>Produto</th>
            <th>Status Pag.</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => {
            const purchaseIdentifier = `${purchase.product_name} (${new Date(purchase.purchase_date + 'T00:00:00Z').toLocaleDateString()})`;
            return (
              <tr key={purchase.purchase_id}>
                <td data-label="Data">{new Date(purchase.purchase_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Fornecedor">{purchase.supplier?.name || 'N/A'}</td>
                <td data-label="Produto">{purchase.product_name}</td>
                <td data-label="Status Pag.">
                    <PaymentProgressBar paid={purchase.total_paid} total={purchase.total_amount} />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <button onClick={() => openPaymentModal(purchase)} title="Ver/Adicionar Pagamentos"><PaymentsIcon /></button>
                    <button onClick={() => handleEdit(purchase)} title="Editar Compra"><EditIcon /></button>
                    <button onClick={() => handleDelete(purchase.purchase_id, purchaseIdentifier)} title="Excluir Compra"><DeleteIcon /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchasesListTable;