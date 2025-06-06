// src/features/merchants/components/MerchantForm.jsx
import React from 'react';
import { IMaskInput } from 'react-imask';
import styles from '../css/MerchantsPage.module.css';

const brazilianStates = [
  { sigla: '', nome: 'Selecione UF...' }, { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' }, { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' }, { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' }, { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' }, { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' }
];
const pixTypes = ['', 'CPF', 'CNPJ', 'Celular', 'E-mail', 'Aleatória'];

const MerchantForm = ({
  formData,
  handleInputChange,
  handleMaskedValueChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  formRef
}) => {
  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Cliente/Fornecedor' : 'Adicionar Novo'}</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label>Nome/Razão Social: *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={styles.input}/>
        </div>
        <div style={{ flex: 1 }}>
          <label>Apelido/Nome Fantasia:</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} className={styles.input}/>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label>Telefone:</label>
          <IMaskInput mask="(00) 0.0000-0000" value={formData.phone} onAccept={(value) => handleMaskedValueChange(value, 'phone')} placeholder="(##) #.####-####" type="tel" className={styles.input}/>
        </div>
        <div style={{ flex: 1 }}>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={styles.input}/>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label>Tipo: *</label>
          <select name="merchant_type" value={formData.merchant_type} onChange={handleInputChange} required className={styles.select}>
            <option value="Cliente">Cliente</option>
            <option value="Fornecedor">Fornecedor</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <label style={{ marginRight: '10px' }}>Status:</label>
          <label className={styles.toggleSwitch}>
            <input type="checkbox" name="status_toggle" checked={formData.status_toggle} onChange={handleInputChange} />
            <span className={styles.slider}></span>
          </label>
          <span style={{ marginLeft: '10px', fontWeight: formData.status_toggle ? 'bold' : 'normal', color: formData.status_toggle ? 'green' : '#777' }}>
            {formData.status_toggle ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>
      
      {/* ... (Restante do formulário com as classes corrigidas) ... */}
      
      <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar' : 'Adicionar')}
        </button>
        {isEditing && (<button type="button" onClick={resetForm}>Cancelar</button>)}
      </div>
    </form>
  );
};

export default MerchantForm;