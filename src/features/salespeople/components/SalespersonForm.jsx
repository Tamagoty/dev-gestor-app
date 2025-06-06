// src/features/salespeople/components/SalespersonForm.jsx
import React from 'react';
import styles from '../css/SalespeoplePage.module.css';


// Estilos básicos. O ideal é que o Toggle Switch também vire um componente genérico no futuro.
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', fontSize: '1rem'
};
const toggleContainerStyle = {
  display: 'flex', alignItems: 'center', margin: '15px 0', color: '#333',
};

const SalespersonForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  formRef
}) => {
  return (
    <>
      {/* O CSS do Toggle Switch. Idealmente, isso viraria um componente <Toggle /> separado */}
      <style>{`
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 28px; }
        .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .toggle-slider { background-color: #28a745; }
        input:focus + .toggle-slider { box-shadow: 0 0 1px #28a745; }
        input:checked + .toggle-slider:before { transform: translateX(22px); }
      `}</style>
      
      <form onSubmit={handleSubmit} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? 'Editar Vendedor' : 'Adicionar Novo Vendedor'}</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Nome: *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle} />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>Telefone:</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} />
        </div>
        
        <div style={toggleContainerStyle}>
          <label htmlFor="is_active_salesperson" style={{ cursor: 'pointer', marginRight: '10px' }}>Status:</label>
          <label className="toggle-switch">
            <input type="checkbox" id="is_active_salesperson" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
            <span className="toggle-slider"></span>
          </label>
          <span style={{ marginLeft: '10px', fontWeight: formData.is_active ? 'bold' : 'normal', color: formData.is_active ? 'green' : '#777' }}>
            {formData.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#28a745', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1 }}>
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Vendedor')}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar Edição
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default SalespersonForm;