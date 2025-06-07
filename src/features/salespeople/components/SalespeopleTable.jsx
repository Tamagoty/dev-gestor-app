// src/features/salespeople/components/SalespeopleTable.jsx
import React from 'react';
import styles from '../css/SalespeoplePage.module.css';
import ToggleSwitch from '../../../components/ToggleSwitch';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';

const SortAscIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> );
const SortDescIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> );
const SortNeutralIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg> );

const SalespeopleTable = ({ 
  salespeople, 
  handleEditSalesperson, 
  handleDeleteSalesperson, 
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
      {/* CORREÇÃO PRINCIPAL: Usando "styles.table" em vez de "styles.listTable" */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Nome <span className={styles.sortIcon}>{renderSortIcon('name')}</span></th>
            <th onClick={() => handleSort('email')}>Email <span className={styles.sortIcon}>{renderSortIcon('email')}</span></th>
            <th onClick={() => handleSort('phone')}>Telefone <span className={styles.sortIcon}>{renderSortIcon('phone')}</span></th>
            <th onClick={() => handleSort('is_active')}>Status <span className={styles.sortIcon}>{renderSortIcon('is_active')}</span></th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {salespeople.length === 0 && !isLoading ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Nenhum vendedor encontrado.</td></tr>
          ) : (
            salespeople.map((person) => (
              <tr key={person.salesperson_id}>
                <td data-label="Nome">{person.name}</td>
                <td data-label="Email">{person.email || '-'}</td>
                <td data-label="Telefone">{person.phone || '-'}</td>
                <td data-label="Status">
                  <ToggleSwitch checked={person.is_active} disabled={true} />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <IconButton variant="warning" onClick={() => handleEditSalesperson(person)} title="Editar"><EditIcon /></IconButton>
                    <IconButton variant="danger" onClick={() => handleDeleteSalesperson(person)} title="Excluir"><DeleteIcon /></IconButton>
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

export default SalespeopleTable;