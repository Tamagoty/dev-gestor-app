// src/features/partnerWithdrawals/components/WithdrawalsListTable.jsx
import React from 'react';
import styles from '../css/PartnerWithdrawalsPage.module.css';

const WithdrawalsListTable = ({ withdrawals, handleEdit, handleDelete }) => {
  return (
    <div>
      <h2>Retiradas Registradas</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Sócio</th>
            <th>Centro de Custo</th>
            <th>Descrição</th>
            <th>Método</th>
            <th className={styles.currencyCell}>Valor (R$)</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>Nenhuma retirada registrada ainda.</td>
            </tr>
          ) : (
            withdrawals.map((wd) => (
              <tr key={wd.withdrawal_id}>
                <td>{new Date(wd.withdrawal_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td>{wd.partner?.name || 'N/A'}</td>
                <td>{wd.cost_center?.name || 'N/A'}</td>
                <td>{wd.description}</td>
                <td>{wd.payment_method}</td>
                <td className={styles.currencyCell}>R$ {parseFloat(wd.amount).toFixed(2)}</td>
                <td className={styles.actionsCell}>
                  <div>
                    <button onClick={() => handleEdit(wd)}>Editar</button>
                    <button onClick={() => handleDelete(wd)}>Excluir</button>
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

export default WithdrawalsListTable;