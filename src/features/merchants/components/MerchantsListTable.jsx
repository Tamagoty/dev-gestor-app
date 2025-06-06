// src/features/merchants/components/MerchantsListTable.jsx
import React from 'react';
import styles from '../css/MerchantsPage.module.css';

const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );
const DetailsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> );

const MerchantsListTable = ({ merchants, openDetailsModal, handleEdit, handleDelete }) => {
  return (
    <div>
      <h2>Clientes e Fornecedores Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th>Nome</th><th>Tipo</th><th>Telefone</th><th>Cidade/UF</th><th>Status</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant) => (
            <tr key={merchant.merchant_id}>
              <td data-label="Nome">{merchant.name}{merchant.nickname && ` (${merchant.nickname})`}</td>
              <td data-label="Tipo">{merchant.merchant_type}</td>
              <td data-label="Telefone">{merchant.phone || '-'}</td>
              <td data-label="Cidade/UF">{merchant.address_city && merchant.address_state ? `${merchant.address_city}/${merchant.address_state}` : '-'}</td>
              <td data-label="Status" style={{ color: merchant.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>{merchant.status}</td>
              <td className={styles.actionsCell} data-label="Ações">
                <div>
                  <button onClick={() => openDetailsModal(merchant)} title="Ver Detalhes"><DetailsIcon /></button>
                  <button onClick={() => handleEdit(merchant)} title="Editar"><EditIcon /></button>
                  <button onClick={() => handleDelete(merchant)} title="Excluir"><DeleteIcon /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MerchantsListTable;