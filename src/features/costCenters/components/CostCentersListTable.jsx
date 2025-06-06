// src/features/costCenters/components/CostCentersListTable.jsx
import React from 'react';
import styles from '../css/CostCentersPage.module.css';

const CostCentersListTable = ({ costCenters, handleEdit, handleDelete }) => {
  return (
    <div>
      <h2>Centros de Custo Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Data Início</th>
            <th>Data Fim</th>
            <th>Status</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {costCenters.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum centro de custo cadastrado.</td></tr>
          ) : (
            costCenters.map((cc) => (
              <tr key={cc.cost_center_id}>
                <td>{cc.name}</td>
                <td>{cc.description || '-'}</td>
                <td>{cc.start_date ? new Date(cc.start_date + 'T00:00:00Z').toLocaleDateString() : '-'}</td>
                <td>{cc.end_date ? new Date(cc.end_date + 'T00:00:00Z').toLocaleDateString() : (cc.is_active ? 'Em aberto' : '-')}</td>
                <td style={{ color: cc.is_active ? 'green' : 'red', fontWeight: 'bold' }}>{cc.is_active ? 'Ativo' : 'Inativo'}</td>
                <td className={styles.actionsCell}>
                  <div>
                    <button onClick={() => handleEdit(cc)}>Editar</button>
                    <button onClick={() => handleDelete(cc)} style={{ backgroundColor: '#dc3545', color: 'white' }}>Excluir</button>
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