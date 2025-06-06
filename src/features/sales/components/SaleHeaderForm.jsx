// src/features/sales/components/SaleHeaderForm.jsx
import React from 'react';
import styles from '../css/SalesPage.module.css';

const SaleHeaderForm = ({ formData, handleInputChange, customers, salespeople, costCentersList, loading }) => {
  return (
    <div className={styles.formGrid}>
      <div>
        <label>Data Venda: *</label>
        <input type="date" name="sale_date" value={formData.sale_date} onChange={handleInputChange} required className={styles.input} />
      </div>
      <div>
        <label>Centro de Custo: *</label>
        <select name="cost_center_id" value={formData.cost_center_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
          <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
          {costCentersList.map(cc => <option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}
        </select>
      </div>
      <div>
        <label>Cliente: *</label>
        <select name="customer_id" value={formData.customer_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
          <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
          {customers.map(c => <option key={c.merchant_id} value={c.merchant_id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label>Vendedor: *</label>
        <select name="salesperson_id" value={formData.salesperson_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
          <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
          {salespeople.map(s => <option key={s.salesperson_id} value={s.salesperson_id}>{s.name}</option>)}
        </select>
      </div>
    </div>
  );
};
export default SaleHeaderForm;