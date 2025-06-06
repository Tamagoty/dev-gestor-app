// src/features/partners/components/PartnersListTable.jsx
import React from 'react';
import styles from '../css/PartnersPage.module.css';

// Ícones SVG
const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> </svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <polyline points="3 6 5 6 21 6"></polyline> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> <line x1="10" y1="11" x2="10" y2="17"></line> <line x1="14" y1="11" x2="14" y2="17"></line> </svg> );

const PartnersListTable = ({ partners, handleEdit, handleDelete }) => {
  return (
    <div>
      <h2>Sócios Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th>Nome</th><th>CPF/CNPJ</th><th>Email</th><th>Telefone</th>
            <th className={styles.percentageCell}>Participação</th>
            <th>Data Entrada</th><th>Status</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {partners.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: 'center' }}>Nenhum sócio cadastrado.</td></tr>
          ) : (
            partners.map((partner) => (
              <tr key={partner.partner_id}>
                <td data-label="Nome">{partner.name}</td>
                <td data-label="CPF/CNPJ">{partner.cpf_cnpj || '-'}</td>
                <td data-label="Email">{partner.email || '-'}</td>
                <td data-label="Telefone">{partner.phone || '-'}</td>
                <td data-label="Participação" className={styles.percentageCell}>{partner.equity_percentage !== null ? `${partner.equity_percentage}%` : '-'}</td>
                <td data-label="Data Entrada">{partner.entry_date ? new Date(partner.entry_date + 'T00:00:00Z').toLocaleDateString() : '-'}</td>
                <td data-label="Status" style={{ color: partner.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>{partner.status}</td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <button onClick={() => handleEdit(partner)} title="Editar" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><EditIcon /></button>
                    <button onClick={() => handleDelete(partner)} title="Excluir" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><DeleteIcon /></button>
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