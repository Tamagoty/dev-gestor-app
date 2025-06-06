// src/features/products/components/ProductForm.jsx
import React from 'react';
import styles from '../css/ProductsPage.module.css';

const productTypeOptions = ['Ambos', 'Compra', 'Venda'];

const ProductForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  formRef
}) => {
  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Produto/Serviço' : 'Adicionar Novo Produto/Serviço'}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label>Nome: *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={styles.input}/>
        </div>
        <div>
          <label>Categoria:</label>
          <input type="text" name="category" value={formData.category} onChange={handleInputChange} className={styles.input}/>
        </div>
        <div>
          <label>Tipo: *</label>
          <select name="product_type" value={formData.product_type} onChange={handleInputChange} required className={styles.select}>
            {productTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Descrição:</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className={styles.textarea}/>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label>Un. Medida:</label>
          <input type="text" name="unit_of_measure" value={formData.unit_of_measure} onChange={handleInputChange} placeholder="un, kg, L, hr" className={styles.input}/>
        </div>
        <div>
          <label>Preço Compra (R$):</label>
          <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange} min="0" step="any" placeholder="0.00" className={styles.input}/>
        </div>
        <div>
          <label>Preço Venda (R$):</label>
          <input type="number" name="sale_price" value={formData.sale_price} onChange={handleInputChange} min="0" step="any" placeholder="0.00" className={styles.input}/>
        </div>
      </div>
      
      <label className={styles.checkboxLabel}>
        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className={styles.checkbox} />
        Ativo
      </label>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Produto/Serviço')}
        </button>
        {isEditing && <button type="button" onClick={resetForm}>Cancelar Edição</button>}
      </div>
    </form>
  );
};

export default ProductForm;