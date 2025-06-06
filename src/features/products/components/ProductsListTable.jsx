// src/features/products/components/ProductsListTable.jsx
import React from 'react';
import styles from '../css/ProductsPage.module.css';

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
            <th>Un. Med.</th>
            <th className={styles.priceCell}>P. Compra</th>
            <th className={styles.priceCell}>P. Venda</th>
            <th>Status</th>
            <th className={styles.actionsCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td></tr>
          ) : (
            products.map((product) => (
              <tr key={product.product_id}>
                <td>{product.name}</td>
                <td>{product.product_type}</td>
                <td>{product.category || '-'}</td>
                <td>{product.unit_of_measure || '-'}</td>
                <td className={styles.priceCell}>{formatCurrency(product.purchase_price)}</td>
                <td className={styles.priceCell}>{formatCurrency(product.sale_price)}</td>
                <td style={{ color: product.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                  {product.is_active ? 'Ativo' : 'Inativo'}
                </td>
                <td className={styles.actionsCell}>
                  <div>
                    <button onClick={() => handleEdit(product)}>Editar</button>
                    <button onClick={() => handleDelete(product)} style={{ backgroundColor: '#dc3545', color: 'white' }}>Excluir</button>
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