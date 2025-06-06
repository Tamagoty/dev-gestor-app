// src/features/products/components/ProductsListTable.jsx
import React from 'react';
import styles from '../css/ProductsPage.module.css';
import ToggleSwitch from '../../../components/ToggleSwitch'; // Importa o novo componente

const EditIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );

const ProductsListTable = ({ products, handleEdit, handleDelete }) => {
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  return (
    <div>
      <h2>Produtos/Serviços Cadastrados</h2>
      <table className={styles.listTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th className={styles.priceCell}>P. Compra</th>
            <th className={styles.priceCell}>P. Venda</th>
            <th>Status</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td></tr>
          ) : (
            products.map((product) => (
              <tr key={product.product_id}>
                <td data-label="Nome">{product.name}</td>
                <td data-label="Tipo">{product.product_type}</td>
                <td data-label="Categoria">{product.category || '-'}</td>
                <td data-label="P. Compra" className={styles.priceCell}>{formatCurrency(product.purchase_price)}</td>
                <td data-label="P. Venda" className={styles.priceCell}>{formatCurrency(product.sale_price)}</td>
                <td data-label="Status">
                  <ToggleSwitch
                    checked={product.is_active}
                    disabled={true}
                  />
                </td>
                <td className={styles.actionsCell} data-label="Ações">
                  <div>
                    <button onClick={() => handleEdit(product)} title="Editar" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(product)} title="Excluir" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                      <DeleteIcon />
                    </button>
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