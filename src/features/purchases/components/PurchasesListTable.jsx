// src/features/purchases/components/PurchasesListTable.jsx
import React from 'react';
import styles from '../css/PurchasesPage.module.css';

const PurchasesListTable = ({ purchases, handleEdit, handleDelete, openPaymentModal }) => {
  const getPaymentStatusStyle = (status) => {
    const baseStyle = { padding: '3px 8px', fontSize: '0.8em', borderRadius: '4px', color: 'white', border: '1px solid' };
    switch (status) {
      case 'Pago': return { ...baseStyle, backgroundColor: '#28a745', borderColor: '#1e7e34' };
      case 'Parcial': return { ...baseStyle, backgroundColor: '#ffc107', color: '#333', borderColor: '#e0a800' };
      case 'A Pagar': return { ...baseStyle, backgroundColor: '#dc3545', borderColor: '#b02a37' };
      default: return { ...baseStyle, backgroundColor: '#6c757d', borderColor: '#545b62' };
    }
  };

  return (
    <div>
      <h2>Compras Registradas</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Fornecedor</th>
            <th>Produto</th>
            <th className={styles.currencyCell}>Total</th>
            <th>Status Pag.</th>
            <th className={styles.currencyCell}>Saldo</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => {
            const saldoAPagar = (purchase.total_amount || 0) - (purchase.total_paid || 0);
            return (
              <tr key={purchase.purchase_id}>
                <td>{new Date(purchase.purchase_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td>{purchase.supplier?.name || 'N/A'}</td>
                <td>{purchase.product_name}</td>
                <td className={styles.currencyCell}>R$ {parseFloat(purchase.total_amount).toFixed(2)}</td>
                <td><span style={getPaymentStatusStyle(purchase.payment_status)}>{purchase.payment_status}</span></td>
                <td className={styles.currencyCell} style={{color: saldoAPagar > 0.005 ? '#dc3545' : '#28a745', fontWeight: 'bold'}}>
                  R$ {saldoAPagar.toFixed(2)}
                </td>
                <td className={styles.actionsCell}>
                  <div>
                    <button onClick={() => openPaymentModal(purchase)}>Pagamentos</button>
                    <button onClick={() => handleEdit(purchase)}>Editar</button>
                    <button onClick={() => handleDelete(purchase.purchase_id, purchase.product_name)}>Excluir</button>
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