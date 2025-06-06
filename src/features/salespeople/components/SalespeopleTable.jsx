import React from 'react';
import styles from '../css/SalespeoplePage.module.css';

// Ícones SVG para ordenação e ações
const SortAscIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>);
const SortDescIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>);
const SortNeutralIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);

const SalespeopleTable = ({
  salespeople,
  handleEditSalesperson,
  handleDeleteSalesperson,
  filterText,
  setFilterText,
  handleSort,
  sortColumn,
  sortDirection,
}) => {

  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div>
      <h2>Vendedores Cadastrados</h2>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por nome ou email..."
          className={styles.filterInput}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <p style={{ color: '#333', fontWeight: 'bold', margin: '0 0 10px 0' }}>
        Total de Vendedores: {salespeople.length} (Exibindo)
      </p>

      {salespeople.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Nome <span className={styles.sortIcon}>{renderSortIcon('name')}</span>
              </th>
              <th onClick={() => handleSort('email')}>
                Email <span className={styles.sortIcon}>{renderSortIcon('email')}</span>
              </th>
              <th onClick={() => handleSort('phone')}>
                Telefone <span className={styles.sortIcon}>{renderSortIcon('phone')}</span>
              </th>
              <th onClick={() => handleSort('is_active')}>
                Status <span className={styles.sortIcon}>{renderSortIcon('is_active')}</span>
              </th>
              <th className={styles.actionsCell}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {salespeople.map((person) => (
              <tr key={person.salesperson_id}>
                <td data-label="Nome">{person.name}</td>
                <td data-label="Email">{person.email || '-'}</td>
                <td data-label="Telefone">{person.phone || '-'}</td>
                <td data-label="Status" style={{ color: person.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                  {person.is_active ? 'Ativo' : 'Inativo'}
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => handleEditSalesperson(person)} title="Editar"><EditIcon /></button>
                    <button onClick={() => handleDeleteSalesperson(person)} title="Excluir"><DeleteIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum vendedor encontrado {filterText ? `para "${filterText}"` : 'cadastrado ainda.'}</p>
      )}
    </div>
  );
};

export default SalespeopleTable;