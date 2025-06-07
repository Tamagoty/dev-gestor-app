// src/features/costCenters/components/CostCentersListTable.jsx
import React from 'react';
import styles from '../css/CostCentersPage.module.css';
import ToggleSwitch from '../../../components/ToggleSwitch';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';

// Ícones de Ordenação
const SortAscIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> );
const SortDescIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> );
const SortNeutralIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg> );

const CostCentersListTable = ({ costCenters, handleEdit, handleDelete, isLoading, handleSort, sortColumn, sortDirection }) => {
  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: isLoading ? 0.5 : 1 }}>
      <h2>Centros de Custo Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Nome <span className={styles.sortIcon}>{renderSortIcon('name')}</span></th>
            <th onClick={() => handleSort('description')}>Descrição <span className={styles.sortIcon}>{renderSortIcon('description')}</span></th>
            <th onClick={() => handleSort('start_date')}>Data Início <span className={styles.sortIcon}>{renderSortIcon('start_date')}</span></th>
            <th onClick={() => handleSort('end_date')}>Data Fim <span className={styles.sortIcon}>{renderSortIcon('end_date')}</span></th>
            <th onClick={() => handleSort('is_active')}>Status <span className={styles.sortIcon}>{renderSortIcon('is_active')}</span></th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {costCenters.length === 0 && !isLoading ? (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum centro de custo encontrado.</td></tr>
          ) : (
            costCenters.map((cc) => (
              <tr key={cc.cost_center_id}>
                <td data-label="Nome">{cc.name}</td>
                <td data-label="Descrição">{cc.description || '-'}</td>
                <td data-label="Data Início">{cc.start_date ? new Date(cc.start_date + 'T00:00:00Z').toLocaleDateString() : '-'}</td>
                <td data-label="Data Fim">{cc.end_date ? new Date(cc.end_date + 'T00:00:00Z').toLocaleDateString() : (cc.is_active ? 'Em aberto' : '-')}</td>
                <td data-label="Status">
                  <ToggleSwitch checked={cc.is_active} disabled={true} />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <IconButton variant="warning" onClick={() => handleEdit(cc)} title="Editar"><EditIcon /></IconButton>
                    <IconButton variant="danger" onClick={() => handleDelete(cc)} title="Excluir"><DeleteIcon /></IconButton>
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

export default CostCentersListTable;