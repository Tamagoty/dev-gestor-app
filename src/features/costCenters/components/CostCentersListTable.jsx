// src/features/costCenters/components/CostCentersListTable.jsx
import React from 'react';
import styles from '../css/CostCentersPage.module.css';

// 1. IMPORTANDO OS NOVOS COMPONENTES
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';
import ToggleSwitch from '../../../components/ToggleSwitch';

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
          {costCenters.map((cc) => (
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
                  {/* 2. USANDO OS NOVOS BOTÕES PADRONIZADOS */}
                  <IconButton variant="warning" onClick={() => handleEdit(cc)} title="Editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton variant="danger" onClick={() => handleDelete(cc)} title="Excluir">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CostCentersListTable;