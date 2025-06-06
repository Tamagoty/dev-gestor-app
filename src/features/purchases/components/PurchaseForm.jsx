// src/features/purchases/components/PurchaseForm.jsx
import React from 'react';
import styles from '../css/PurchasesPage.module.css';

const PurchaseForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  suppliers,
  productsList,
  costCentersList,
  loading,
  displayTotalAmount,
  formRef
}) => {
  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Compra' : 'Nova Compra'}</h2>
      
      <div className={styles.formGrid}>
        <div>
          <label>Data Compra: *</label>
          <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} required className={styles.input} />
        </div>
        <div>
          <label>Fornecedor: *</label>
          <select name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {suppliers.map(s => <option key={s.merchant_id} value={s.merchant_id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label>Centro de Custo: *</label>
          <select name="cost_center_id" value={formData.cost_center_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {costCentersList.map(cc => <option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label>Produto/Serviço (Catálogo): *</label>
          <select name="product_id" value={formData.product_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {productsList.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Nome do Produto (nesta compra):</label>
          <input type="text" value={formData.product_name} readOnly className={styles.readOnlyInput} />
        </div>
      </div>

      <div className={styles.formGrid}>
        <div>
          <label>Preço Unitário: *</label>
          <input type="number" name="unit_price" value={formData.unit_price} onChange={handleInputChange} required min="0.01" step="any" className={styles.input} />
        </div>
        <div>
          <label>Quantidade: *</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0.01" step="any" className={styles.input} />
        </div>
        <div>
          <label>Valor Total:</label>
          <input type="text" value={`R$ ${displayTotalAmount.toFixed(2)}`} readOnly className={styles.readOnlyInput} />
        </div>
      </div>
      
      <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
        <button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Registrar Compra')}
        </button>
        {isEditing && <button type="button" onClick={resetForm}>Cancelar Edição</button>}
      </div>
    </form>
  );
};

export default PurchaseForm;