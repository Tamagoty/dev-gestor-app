// src/features/partnerWithdrawals/components/WithdrawalForm.jsx
import React from 'react';
import styles from '../css/PartnerWithdrawalsPage.module.css';
import FormActions from '../../../components/FormActions';

const paymentMethods = ["Dinheiro", "PIX", "Transferência Bancária", "Cheque"];

const WithdrawalForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  partners,
  costCentersList,
  loading,
  formRef,
}) => {
  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Retirada' : 'Registrar Nova Retirada'}</h2>

      <div className={styles.formGrid}>
        <div>
          <label>Sócio: *</label>
          <select name="partner_id" value={formData.partner_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {partners.map(p => <option key={p.partner_id} value={p.partner_id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label>Data da Retirada: *</label>
          <input type="date" name="withdrawal_date" value={formData.withdrawal_date} onChange={handleInputChange} required className={styles.input} />
        </div>
        <div>
          <label>Centro de Custo: *</label>
          <select name="cost_center_id" value={formData.cost_center_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {costCentersList.map(cc => <option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label>Valor (R$): *</label>
          <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required min="0.01" step="any" placeholder="0.00" className={styles.input} />
        </div>
        <div>
          <label>Método de Pagamento: *</label>
          <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} required className={styles.select}>
            {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label>Descrição/Motivo: *</label>
        <input type="text" name="description" value={formData.description} onChange={handleInputChange} required className={styles.input} placeholder="Ex: Pró-labore, Adiantamento" />
      </div>

      <div style={{ marginTop: '15px' }}>
        <label>Observações Adicionais:</label>
        <textarea name="observations" value={formData.observations} onChange={handleInputChange} rows="3" className={styles.textarea} />
      </div>

      <FormActions
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onCancel={resetForm}
      />
    </form>
  );
};

export default WithdrawalForm;