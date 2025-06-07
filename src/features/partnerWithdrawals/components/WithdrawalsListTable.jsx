// src/features/partnerWithdrawals/components/WithdrawalsListTable.jsx
import React from 'react';
import styles from '../css/PartnerWithdrawalsPage.module.css';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import { SortAscIcon, SortDescIcon, SortNeutralIcon } from '../../../components/icons/SortIcons';

const WithdrawalsListTable = ({
  withdrawals,
  isLoading,
  handleEdit,
  handleDelete,
  handleSort,
  sortColumn,
  sortDirection
}) => {
  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: isLoading ? 0.5 : 1 }}>
      <h2 className={styles.sectionTitle}>Retiradas Registradas</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('withdrawal_date')}>Data <span className={styles.sortIcon}>{renderSortIcon('withdrawal_date')}</span></th>
            <th onClick={() => handleSort('partner.name')}>Sócio <span className={styles.sortIcon}>{renderSortIcon('partner.name')}</span></th>
            <th onClick={() => handleSort('description')}>Descrição <span className={styles.sortIcon}>{renderSortIcon('description')}</span></th>
            <th className={styles.currencyCell} onClick={() => handleSort('amount')}>Valor (R$) <span className={styles.sortIcon}>{renderSortIcon('amount')}</span></th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.length === 0 && !isLoading ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhuma retirada encontrada.</td></tr>
          ) : (
            withdrawals.map((wd) => (
              <tr key={wd.withdrawal_id}>
                <td data-label="Data">{new Date(wd.withdrawal_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Sócio">{wd.partner?.name || 'N/A'}</td>
                <td data-label="Descrição">{wd.description}</td>
                <td data-label="Valor (R$)" className={styles.currencyCell}>{parseFloat(wd.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <IconButton variant="warning" onClick={() => handleEdit(wd)} title="Editar"><EditIcon /></IconButton>
                    <IconButton variant="danger" onClick={() => handleDelete(wd)} title="Excluir"><DeleteIcon /></IconButton>
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