// src/features/partners/components/PartnersListTable.jsx (VERSÃO ATUALIZADA)
import React from 'react';
import styles from '../css/PartnersPage.module.css';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import DetailsIcon from '../../../components/icons/DetailsIcon'; // Importando novo ícone
import ToggleSwitch from '../../../components/ToggleSwitch'; // Importando toggle
import { SortAscIcon, SortDescIcon, SortNeutralIcon } from '../../../components/icons/SortIcons';

const PartnersListTable = ({ partners, handleEdit, handleDelete, openDetailsModal, isLoading, handleSort, sortColumn, sortDirection }) => {
  const renderSortIcon = (columnName) => { /* ...código existente... */ };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: isLoading ? 0.5 : 1, overflowX: 'auto' }}>
      <h2 className={styles.sectionTitle}>Sócios Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Nome</th>
            <th onClick={() => handleSort('cpf_cnpj')}>CPF/CNPJ</th>
            <th className={styles.percentageCell} onClick={() => handleSort('equity_percentage')}>Participação</th>
            <th onClick={() => handleSort('status')}>Status</th>
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
                {/* MUDANÇA 1: Usando o ToggleSwitch para Status */}
                <td data-label="Status">
                  <ToggleSwitch checked={partner.status === 'Ativo'} disabled={true} />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    {/* MUDANÇA 2: Adicionado botão de Detalhes */}
                    <IconButton variant="info" onClick={() => openDetailsModal(partner)} title="Ver Detalhes"><DetailsIcon /></IconButton>
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