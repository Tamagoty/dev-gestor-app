// src/components/Pagination.jsx
import React from 'react';
import styles from './css/Pagination.module.css';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  isLoading = false, // 1. RECEBE A NOVA PROP 'isLoading'
}) => {
  if (totalItems === 0) {
    return <div className={styles.paginationContainer}><span className={styles.pageInfo}>Nenhum item encontrado.</span></div>;
  }
  if (totalPages <= 1) {
    return null;
  }

  const firstItem = (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles.paginationContainer}>
      <span className={styles.pageInfo}>
        Mostrando itens {firstItem}-{lastItem} de {totalItems}
      </span>

      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading || currentPage === 1} // 2. DESABILITA SE ESTIVER CARREGANDO
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          className={styles.button}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading || currentPage === totalPages} // 2. DESABILITA SE ESTIVER CARREGANDO
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default Pagination;