// src/features/salespeople/components/SalespersonForm.jsx
import React from 'react';
import styles from '../css/SalespeoplePage.module.css';
import ToggleSwitch from '../../../components/ToggleSwitch';
import FormActions from '../../../components/FormActions';

const SalespersonForm = ({
  formData,
  handleInputChange,
  handleToggleChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  formRef
}) => {
  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Vendedor' : 'Adicionar Novo Vendedor'}</h2>

      {/* Usando o grid para garantir o espaçamento */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome: *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={styles.input} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Telefone:</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={styles.input} />
        </div>
      </div>

      {/* ============================================= */}
      {/* ========= INÍCIO DA MUDANÇA DE LAYOUT ========= */}
      {/* ============================================= */}
      <div className={styles.formRow}>
        {/* Item da Esquerda: Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>Status Ativo:</label>
          <ToggleSwitch
            checked={formData.is_active}
            onChange={handleToggleChange}
          />
        </div>

        {/* Item da Direita: Botões */}
        <FormActions
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          onCancel={resetForm}
        />
      </div>
      {/* =========================================== */}
      {/* ========= FIM DA MUDANÇA DE LAYOUT ======== */}
      {/* =========================================== */}
    </form>
  );
};

export default SalespersonForm;