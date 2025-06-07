// src/features/products/components/ProductsListTable.jsx
import React from 'react';
import styles from '../css/ProductsPage.module.css';
import ToggleSwitch from '../../../components/ToggleSwitch';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';

// Ícones de Ordenação
const SortAscIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> );
const SortDescIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> );
const SortNeutralIcon = () => ( <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" /></svg> );


const ProductsListTable = ({ products, handleEdit, handleDelete, isLoading, handleSort, sortColumn, sortDirection }) => {
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) return <SortNeutralIcon />;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  return (
    <div style={{ transition: 'opacity 0.3s ease', opacity: isLoading ? 0.5 : 1 }}>
      <h2>Produtos/Serviços Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Nome <span className={styles.sortIcon}>{renderSortIcon('name')}</span></th>
            <th onClick={() => handleSort('product_type')}>Tipo <span className={styles.sortIcon}>{renderSortIcon('product_type')}</span></th>
            <th onClick={() => handleSort('category')}>Categoria <span className={styles.sortIcon}>{renderSortIcon('category')}</span></th>
            <th className={styles.priceCell} onClick={() => handleSort('purchase_price')}>P. Compra <span className={styles.sortIcon}>{renderSortIcon('purchase_price')}</span></th>
            <th className={styles.priceCell} onClick={() => handleSort('sale_price')}>P. Venda <span className={styles.sortIcon}>{renderSortIcon('sale_price')}</span></th>
            <th onClick={() => handleSort('is_active')}>Status <span className={styles.sortIcon}>{renderSortIcon('is_active')}</span></th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && !isLoading ? (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Nenhum produto encontrado.</td></tr>
          ) : (
            products.map((product) => (
              <tr key={product.product_id}>
                <td data-label="Nome">{product.name}</td>
                <td data-label="Tipo">{product.product_type}</td>
                <td data-label="Categoria">{product.category || '-'}</td>
                <td data-label="P. Compra" className={styles.priceCell}>{formatCurrency(product.purchase_price)}</td>
                <td data-label="P. Venda" className={styles.priceCell}>{formatCurrency(product.sale_price)}</td>
                <td data-label="Status">
                  <ToggleSwitch checked={product.is_active} disabled={true} />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <IconButton variant="warning" onClick={() => handleEdit(product)} title="Editar"><EditIcon /></IconButton>
                    <IconButton variant="danger" onClick={() => handleDelete(product)} title="Excluir"><DeleteIcon /></IconButton>
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

export default ProductsListTable;