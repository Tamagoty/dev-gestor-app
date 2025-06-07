// src/features/partners/components/PartnersListTable.jsx
import React from 'react';
import styles from '../css/PartnersPage.module.css';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import { SortAscIcon, SortDescIcon, SortNeutralIcon } from '../../../components/icons/SortIcons';

const PartnersListTable = ({ 
  partners, 
  handleEdit, 
  handleDelete, 
  isLoading,
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
      <h2 className={styles.sectionTitle}>Sócios Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Nome <span className={styles.sortIcon}>{renderSortIcon('name')}</span></th>
            <th onClick={() => handleSort('cpf_cnpj')}>CPF/CNPJ <span className={styles.sortIcon}>{renderSortIcon('cpf_cnpj')}</span></th>
            <th className={styles.percentageCell} onClick={() => handleSort('equity_percentage')}>Participação <span className={styles.sortIcon}>{renderSortIcon('equity_percentage')}</span></th>
            <th onClick={() => handleSort('status')}>Status <span className={styles.sortIcon}>{renderSortIcon('status')}</span></th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {partners.length === 0 && !isLoading ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhum sócio encontrado.</td></tr>
          ) : (
            partners.map((partner) => (
              <tr key={partner.partner_id}>
                <td data-label="Nome">{partner.name}</td>
                <td data-label="CPF/CNPJ">{partner.cpf_cnpj || '-'}</td>
                <td data-label="Participação" className={styles.percentageCell}>{partner.equity_percentage !== null ? `${partner.equity_percentage}%` : '-'}</td>
                <td data-label="Status" style={{ color: partner.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>{partner.status}</td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <IconButton variant="warning" onClick={() => handleEdit(partner)} title="Editar"><EditIcon /></IconButton>
                    <IconButton variant="danger" onClick={() => handleDelete(partner)} title="Excluir"><DeleteIcon /></IconButton>
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

export default PartnersListTable;