// src/features/merchants/components/MerchantsListTable.jsx (VERSÃO ATUALIZADA)
import React from 'react';
import styles from '../css/MerchantsPage.module.css';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import DetailsIcon from '../../../components/icons/DetailsIcon';
import ToggleSwitch from '../../../components/ToggleSwitch'; // Importe o ToggleSwitch

// Ícones de Ordenação
const SortAscIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> );
const SortDescIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> );
const SortNeutralIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg> );

const MerchantsListTable = ({ merchants, openDetailsModal, handleEdit, handleDelete, isLoading, handleSort, sortColumn, sortDirection }) => {
  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: isLoading ? 0.5 : 1, overflowX: 'auto' }}>
      <h2>Clientes e Fornecedores Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Nome <span className={styles.sortIcon}>{renderSortIcon('name')}</span></th>
            <th onClick={() => handleSort('merchant_type')}>Tipo <span className={styles.sortIcon}>{renderSortIcon('merchant_type')}</span></th>
            <th onClick={() => handleSort('phone')}>Telefone <span className={styles.sortIcon}>{renderSortIcon('phone')}</span></th>
            <th onClick={() => handleSort('address_city')}>Cidade/UF <span className={styles.sortIcon}>{renderSortIcon('address_city')}</span></th>
            <th onClick={() => handleSort('status')}>Status <span className={styles.sortIcon}>{renderSortIcon('status')}</span></th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {merchants.length === 0 && !isLoading ? (
            <tr><td colSpan="6" style={{textAlign: 'center'}}>Nenhum registro encontrado.</td></tr>
          ) : (
            merchants.map((merchant) => (
              <tr key={merchant.merchant_id}>
                <td data-label="Nome">{merchant.name}{merchant.nickname && ` (${merchant.nickname})`}</td>
                <td data-label="Tipo">{merchant.merchant_type}</td>
                <td data-label="Telefone">{merchant.phone || '-'}</td>
                <td data-label="Cidade/UF">{merchant.address_city && merchant.address_state ? `${merchant.address_city}/${merchant.address_state}` : '-'}</td>
                {/* ================================================================= */}
                {/* MUDANÇA AQUI: Trocando o texto pelo ToggleSwitch                  */}
                {/* ================================================================= */}
                <td data-label="Status">
                  <ToggleSwitch 
                    checked={merchant.status === 'Ativo'} 
                    disabled={true} // Apenas para exibição
                  />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <IconButton variant="info" onClick={() => openDetailsModal(merchant)} title="Ver Detalhes"><DetailsIcon /></IconButton>
                    <IconButton variant="warning" onClick={() => handleEdit(merchant)} title="Editar"><EditIcon /></IconButton>
                    <IconButton variant="danger" onClick={() => handleDelete(merchant)} title="Excluir"><DeleteIcon /></IconButton>
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

export default MerchantsListTable;