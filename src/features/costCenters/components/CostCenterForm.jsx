// src/features/costCenters/components/CostCenterForm.jsx
import React from 'react';
import styles from '../css/CostCentersPage.module.css';
import ToggleSwitch from '../../../components/ToggleSwitch';
import FormActions from '../../../components/FormActions'; // 1. IMPORTAMOS NOSSO NOVO COMPONENTE

const CostCenterForm = ({
  formData,
  handleInputChange,
  handleToggleChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm, // A função para cancelar, que será passada para o onCancel
  formRef,
}) => {
  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Centro de Custo' : 'Adicionar Novo Centro de Custo'}</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Nome do Centro de Custo: *</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={styles.input} />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Descrição:</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className={styles.textarea} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label>Data de Início: *</label>
          <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required className={styles.input} />
        </div>
        <div>
          <label>Data de Finalização:</label>
          <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className={styles.input} disabled={formData.is_active} />
          {formData.is_active && <small style={{ display: 'block', marginTop: '5px' }}>Só pode ser definida se o centro de custo estiver inativo.</small>}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label>Status Ativo:</label>
        <ToggleSwitch
          checked={formData.is_active}
          onChange={handleToggleChange}
        />
      </div>

      {/* 2. A DIV ANTIGA DOS BOTÕES É REMOVIDA E SUBSTITUÍDA PELO NOSSO COMPONENTE */}
      <FormActions
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onCancel={resetForm}
      />
    </form>
  );
};

export default CostCenterForm;