// src/features/partners/components/PartnerForm.jsx (VERSÃO SEGURA)
import React from 'react';
import { IMaskInput } from 'react-imask';
import styles from '../css/PartnersPage.module.css';
import FormActions from '../../../components/FormActions';
import ToggleSwitch from '../../../components/ToggleSwitch';

const cpfCnpjMask = [
  { mask: '000.000.000-00', lazy: false },
  { mask: '00.000.000/0000-00', lazy: false }
];

export const PartnerForm = ({
  formData,
  handleInputChange,
  handleMaskedValueChange,
  handleToggleChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  formRef
}) => {
  // =================================================================
  // REDE DE SEGURANÇA ADICIONADA AQUI
  // =================================================================
  // Se, por qualquer motivo, formData não for um objeto válido,
  // o componente não tentará renderizar o formulário, evitando o crash.
  if (!formData) {
    console.error("PartnerForm tentou renderizar sem a prop 'formData'.");
    return <p>Carregando formulário...</p>; // Ou pode retornar 'null'
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Sócio' : 'Adicionar Novo Sócio'}</h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome Completo: *</label>
          {/* O erro acontece aqui, ao tentar ler 'formData.name' quando formData é undefined */}
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className={styles.input} />
        </div>
        {/* ... resto do formulário permanece igual ... */}
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
          <IMaskInput mask="(00) 00000-0000" value={formData.phone} onAccept={(value) => handleMaskedValueChange(value, 'phone')} placeholder="(##) #####-####" id="phone" className={styles.input} />
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