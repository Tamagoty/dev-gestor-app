// src/features/merchants/components/MerchantForm.jsx (VERSÃO ATUALIZADA)
import React from 'react';
import { IMaskInput } from 'react-imask';
import styles from '../css/MerchantsPage.module.css';
import FormActions from '../../../components/FormActions';

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
        <div>
          <label>Nome/Razão Social: *</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={styles.input} />
        </div>
        <div>
          <label>Apelido/Nome Fantasia:</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} className={styles.input} />
        </div>
        <div>
          <label>Telefone:</label>
          <IMaskInput mask="(00) 00000-0000" value={formData.phone} onAccept={(value) => handleMaskedValueChange(value, 'phone')} placeholder="(##) #####-####" type="tel" className={styles.input} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={styles.input} />
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '15px', alignItems: 'center' }}>
        <div>
          <label>Tipo: *</label>
          <select name="merchant_type" value={formData.merchant_type} onChange={handleInputChange} required className={styles.select}>
            <option value="Cliente">Cliente</option>
            <option value="Fornecedor">Fornecedor</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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

      <hr style={{margin: '25px 0'}} />

      {/* ================================================================= */}
      {/* ===== NOVA SEÇÃO DE ENDEREÇO COM OS CAMPOS FALTANTES ===== */}
      {/* ================================================================= */}
      <fieldset style={{border: '1px solid #ddd', padding: '15px', borderRadius: '4px'}}>
        <legend>Endereço</legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label>CEP:</label>
            <IMaskInput mask="00000-000" value={formData.zip_code} onAccept={(value) => handleMaskedValueChange(value, 'zip_code')} placeholder="00000-000" className={styles.input} />
          </div>
          <div>
            <label>Logradouro:</label>
            <input type="text" name="address_street" value={formData.address_street} onChange={handleInputChange} className={styles.input} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label>Número:</label>
            <input type="text" name="address_number" value={formData.address_number} onChange={handleInputChange} className={styles.input} />
          </div>
          <div>
            <label>Bairro:</label>
            <input type="text" name="address_district" value={formData.address_district} onChange={handleInputChange} className={styles.input} />
          </div>
          {/* CAMPO CIDADE ADICIONADO */}
          <div>
            <label>Cidade:</label>
            <input type="text" name="address_city" value={formData.address_city} onChange={handleInputChange} className={styles.input} />
          </div>
          {/* CAMPO UF ADICIONADO */}
          <div>
            <label>UF:</label>
            <select name="address_state" value={formData.address_state} onChange={handleInputChange} className={styles.select}>
              {brazilianStates.map(s => <option key={s.sigla} value={s.sigla}>{s.sigla}</option>)}
            </select>
          </div>
        </div>
      </fieldset>
      
      <div style={{ marginTop: '20px' }}>
        <label>Observações:</label>
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

export default MerchantForm;