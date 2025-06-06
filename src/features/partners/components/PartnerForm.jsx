// src/features/partners/components/PartnerForm.jsx
import React from 'react';
import { IMaskInput } from 'react-imask';
import styles from '../css/PartnersPage.module.css';

const cpfCnpjMask = [
  { mask: '000.000.000-00', lazy: false },
  { mask: '00.000.000/0000-00', lazy: false }
];

const PartnerForm = ({ formData, handleInputChange, handleMaskedValueChange, handleSubmit, isEditing, isSubmitting, resetForm, formRef }) => {
  // Estilos inline que estavam no original, mantidos por simplicidade aqui
  const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem' };
  const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };
  const toggleContainerStyle = { display: 'flex', alignItems: 'center', margin: '15px 0', color: '#333' };
  
  return (
    <form onSubmit={handleSubmit} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
      <h2>{isEditing ? 'Editar Sócio' : 'Adicionar Novo Sócio'}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label htmlFor="name">Nome Completo: *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle}/>
        </div>
        <div>
          <label htmlFor="cpf_cnpj">CPF/CNPJ:</label>
          <IMaskInput mask={cpfCnpjMask} value={formData.cpf_cnpj} onAccept={(value) => handleMaskedValueChange(value, 'cpf_cnpj')} placeholder="CPF ou CNPJ" id="cpf_cnpj" style={inputStyle}/>
        </div>
      </div>
      
      {/* ... outros campos ... */}
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="email">Email:</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle}/></div>
          <div><label htmlFor="phone">Telefone:</label><IMaskInput mask="(00) 0.0000-0000" value={formData.phone} onAccept={(value, maskRef) => handleMaskedValueChange(maskRef.value, 'phone')} placeholder="(##) #.####-####" id="phone" style={inputStyle}/></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div><label htmlFor="equity_percentage">Participação (%):</label><input type="number" id="equity_percentage" name="equity_percentage" value={formData.equity_percentage} onChange={handleInputChange} min="0" max="100" step="0.01" placeholder="Ex: 25.5" style={inputStyle}/></div>
            <div><label htmlFor="entry_date">Data de Entrada:</label><input type="date" id="entry_date" name="entry_date" value={formData.entry_date} onChange={handleInputChange} style={inputStyle}/></div>
        </div>
      
      <div style={toggleContainerStyle}>
        <label htmlFor="status_form_toggle" style={{ cursor: 'pointer', marginRight: '10px' }}>Status:</label>
        <label className={styles.toggleSwitch}>
          <input type="checkbox" id="status_form_toggle" name="status_form" checked={formData.status_form} onChange={handleInputChange} />
          <span className={styles.slider}></span>
        </label>
        <span style={{ marginLeft: '10px', fontWeight: formData.status_form ? 'bold' : 'normal', color: formData.status_form ? 'green' : '#777' }}>
          {formData.status_form ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      
      {/* ... */}

      <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Sócio')}
        </button>
        {isEditing && <button type="button" onClick={resetForm}>Cancelar Edição</button>}
      </div>
    </form>
  );
};

export default PartnerForm;