// src/features/partners/components/PartnerForm.jsx
import React from 'react';
import { IMaskInput } from 'react-imask';
import styles from '../css/PartnersPage.module.css';
import FormActions from '../../../components/FormActions';
import ToggleSwitch from '../../../components/ToggleSwitch';

const cpfCnpjMask = [
  { mask: '000.000.000-00', lazy: false },
  { mask: '00.000.000/0000-00', lazy: false }
];

const PartnerForm = ({
  formData,
  handleInputChange,
  handleMaskedValueChange,
  handleToggleChange, // Recebendo a função correta para o toggle
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  formRef
}) => {
  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Sócio' : 'Adicionar Novo Sócio'}</h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome Completo: *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cpf_cnpj">CPF/CNPJ:</label>
          <IMaskInput mask={cpfCnpjMask} value={formData.cpf_cnpj} onAccept={(value) => handleMaskedValueChange(value, 'cpf_cnpj')} placeholder="CPF ou CNPJ" id="cpf_cnpj" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Telefone:</label>
          <IMaskInput mask="(00) 0.0000-0000" value={formData.phone} onAccept={(value, maskRef) => handleMaskedValueChange(maskRef.value, 'phone')} placeholder="(##) #.####-####" id="phone" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="equity_percentage">Participação (%):</label>
          <input type="number" id="equity_percentage" name="equity_percentage" value={formData.equity_percentage} onChange={handleInputChange} min="0" max="100" step="0.01" placeholder="Ex: 25.5" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="entry_date">Data de Entrada:</label>
          <input type="date" id="entry_date" name="entry_date" value={formData.entry_date} onChange={handleInputChange} className={styles.input} />
        </div>
      </div>
      
      <div className={styles.toggleContainer} style={{ justifyContent: 'flex-start' }}>
        <label style={{ cursor: 'pointer', marginRight: '10px' }}>Status:</label>
        <ToggleSwitch
          checked={formData.status_form}
          onChange={handleToggleChange}
        />
      </div>

      <FormActions
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onCancel={resetForm}
      />
    </form>
  );
};

export default PartnerForm;