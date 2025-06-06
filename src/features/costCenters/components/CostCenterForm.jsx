// src/features/costCenters/components/CostCenterForm.jsx
import React from 'react';
import styles from '../css/CostCentersPage.module.css';
import ToggleSwitch from '../../../components/ToggleSwitch'; // 1. IMPORTA O COMPONENTE

const CostCenterForm = ({
  formData,
  handleInputChange,
  handleToggleChange, // 2. RECEBE A NOVA FUNÇÃO
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
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
      
      {/* 3. SUBSTITUI O CHECKBOX ANTIGO PELO TOGGLE SWITCH */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
        <label>Status Ativo:</label>
        <ToggleSwitch
          checked={formData.is_active}
          onChange={handleToggleChange}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Centro de Custo')}
        </button>
        {isEditing && <button type="button" onClick={resetForm}>Cancelar Edição</button>}
      </div>
    </form>
  );
};

export default CostCenterForm;