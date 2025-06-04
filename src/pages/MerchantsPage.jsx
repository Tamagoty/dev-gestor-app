// src/pages/MerchantsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { IMaskInput } from 'react-imask';
import ConfirmationModal from '../components/ConfirmationModal';

// Estilos
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };

// Estilos para o container do toggle switch
const toggleContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '15px 0', 
  color: '#333', 
};


const initialFormData = {
  name: '', nickname: '', phone: '', email: '',
  merchant_type: 'Cliente', pix_type: '', pix_key: '',
  zip_code: '', address_street: '', address_number: '',
  address_district: '', address_city: '', address_state: '',
  status_toggle: true, 
  observations: ''
};

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

// Ícones SVG CORRIGIDOS
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
const DetailsIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);


function MerchantsPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMerchantId, setCurrentMerchantId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMerchantForDetails, setSelectedMerchantForDetails] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Gestor App - Clientes/Fornecedores';
    fetchMerchants();
  }, []);

  async function fetchMerchants() {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase.from('merchants').select('*').order('name', { ascending: true });
      if (error) throw error;
      setMerchants(data || []);
    } catch (err) {
      console.error('Erro ao buscar merchants:', err.message);
      setListError(err.message);
      setMerchants([]);
      toast.error('Falha ao carregar clientes/fornecedores.');
    } finally {
      setLoading(false);
    }
  }
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  const handleMaskedValueChange = (value, fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };
  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentMerchantId(null);
  };
  
  const handleSubmitMerchant = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) { toast.error('O Nome é obrigatório.'); return; }
    if (!formData.merchant_type) { toast.error('O Tipo é obrigatório.'); return; }
    
    setIsSubmitting(true);
    const dataToSubmit = {
      name: formData.name.trim(),
      nickname: formData.nickname.trim() === '' ? null : formData.nickname.trim(),
      phone: formData.phone, 
      email: formData.email.trim() === '' ? null : formData.email.trim(),
      merchant_type: formData.merchant_type,
      pix_type: formData.pix_type === '' ? null : formData.pix_type,
      pix_key: formData.pix_key.trim() === '' ? null : formData.pix_key.trim(),
      zip_code: formData.zip_code, 
      address_street: formData.address_street.trim() === '' ? null : formData.address_street.trim(),
      address_number: formData.address_number.trim() === '' ? null : formData.address_number.trim(),
      address_district: formData.address_district.trim() === '' ? null : formData.address_district.trim(),
      address_city: formData.address_city.trim() === '' ? null : formData.address_city.trim(),
      address_state: formData.address_state === '' ? null : formData.address_state,
      status: formData.status_toggle ? 'Ativo' : 'Inativo',
      observations: formData.observations.trim() === '' ? null : formData.observations.trim(),
    };

    try {
      let savedMerchant = null;
      let successMessage = '';
      if (isEditing && currentMerchantId) {
        const { data: updatedMerchant, error: updateError } = await supabase
          .from('merchants').update(dataToSubmit).eq('merchant_id', currentMerchantId)
          .select().single();
        if (updateError) throw updateError;
        savedMerchant = updatedMerchant;
        successMessage = 'Dados atualizados com sucesso!';
      } else {
        const { data: newMerchant, error: insertError } = await supabase
          .from('merchants').insert([dataToSubmit]).select().single();
        if (insertError) throw insertError;
        savedMerchant = newMerchant;
        successMessage = 'Cliente/Fornecedor adicionado!';
      }
      if (savedMerchant) {
        await fetchMerchants(); toast.success(successMessage); resetForm();
      }
    } catch (err) {
      console.error('Erro ao salvar:', err.message);
      if (err.message.includes('unique constraint')) {
          toast.error('Erro: Violação de constraint única (ex: Email ou CPF/CNPJ já existe).');
      } else {
          toast.error(`Erro ao salvar: ${err.message}`);
      }
    } finally { setIsSubmitting(false); }
  };
  
  const handleEditMerchant = (merchantToEdit) => {
    setIsEditing(true);
    setCurrentMerchantId(merchantToEdit.merchant_id);
    const dataForForm = {};
    for (const key in initialFormData) {
      if (key !== 'status_toggle') {
        dataForForm[key] = merchantToEdit[key] === null || merchantToEdit[key] === undefined ? '' : merchantToEdit[key];
      }
    }
    dataForForm.merchant_type = merchantToEdit.merchant_type || 'Cliente';
    dataForForm.status_toggle = merchantToEdit.status === 'Ativo';
    
    setFormData(dataForForm);
    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });}
    toast.info(`Editando: ${merchantToEdit.name}`);
  };

  const handleDeleteMerchant = (merchant) => {
    setMerchantToDelete(merchant); 
    setShowDeleteModal(true);
  };
  const confirmDeleteMerchant = async () => {
    if (!merchantToDelete) return; setIsDeleting(true);
    try {
      const tablesToCheck = ['sales', 'purchases'];
      for (const table of tablesToCheck) {
          const fkColumn = table === 'sales' ? 'customer_id' : 'supplier_id';
          const { count, error: checkError } = await supabase.from(table).select(fkColumn, {count: 'exact', head: true}).eq(fkColumn, merchantToDelete.merchant_id);
          if (checkError) { console.warn(`Aviso: Não foi possível checar uso em ${table}`); }
          else if (count > 0) {
              toast.error(`Este item não pode ser excluído pois está associado a ${table === 'sales' ? 'Vendas' : 'Compras'}.`);
              setIsDeleting(false); setShowDeleteModal(false); setMerchantToDelete(null); return;
          }
      }
      const { error } = await supabase.from('merchants').delete().eq('merchant_id', merchantToDelete.merchant_id);
      if (error) throw error;
      setMerchants(prev => prev.filter(m => m.merchant_id !== merchantToDelete.merchant_id));
      toast.success(`"${merchantToDelete.name}" excluído!`);
    } catch (err) { console.error('Erro ao excluir:', err.message); toast.error(`Erro ao excluir: ${err.message}`);
    } finally { setShowDeleteModal(false); setMerchantToDelete(null); setIsDeleting(false); }
  };
  const openDetailsModal = (merchant) => { setSelectedMerchantForDetails(merchant); setShowDetailsModal(true); };
  const closeDetailsModal = () => { setShowDetailsModal(false); setSelectedMerchantForDetails(null); };


  if (loading && merchants.length === 0) return <p style={{ padding: '20px' }}>Carregando...</p>;
  if (listError && merchants.length === 0) return <p style={{ color: 'red', padding: '20px' }}>Erro: {listError}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .responsive-table-merchants { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; }
        .responsive-table-merchants thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-merchants th, .responsive-table-merchants td { padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; }
        .responsive-table-merchants th { font-weight: bold; }
        .responsive-table-merchants tbody tr { background-color: #fff; border-bottom: 1px solid #eee; }
        .responsive-table-merchants tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-merchants tbody tr:hover { background-color: #e9ecef; }
        .responsive-table-merchants .actions-cell { text-align: right; min-width: 200px; }
        @media screen and (max-width: 768px) {
          .responsive-table-merchants thead { display: none; }
          .responsive-table-merchants tr { display: block; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .responsive-table-merchants td { display: block; text-align: right; padding-left: 40%; position: relative; border-bottom: 1px dotted #eee; }
          .responsive-table-merchants td:last-child { border-bottom: none; }
          .responsive-table-merchants td::before { content: attr(data-label); position: absolute; left: 10px; width: calc(40% - 20px); padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; }
          .responsive-table-merchants td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-merchants td.actions-cell::before { content: "Ações:"; }
          .responsive-table-merchants td.actions-cell div { justify-content: center; flex-wrap: wrap; }
          .responsive-table-merchants td.actions-cell div button { margin: 5px; }
        }
        .details-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; }
        .details-modal-content { background-color: #fff; padding: 25px; border-radius: 8px; width: 90%; max-width: 650px; max-height: 85vh; overflow-y: auto; color: #333; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .details-modal-content h3 { margin-top: 0; color: #007bff; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .details-modal-content p { margin: 8px 0; line-height: 1.6; }
        .details-modal-content p strong { color: #555; min-width: 150px; display: inline-block; }
        .details-modal-close-button { display: block; margin: 25px auto 0 auto; padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
        .details-modal-close-button:hover { background-color: #5a6268; }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 28px; }
        .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .toggle-slider { background-color: #28a745; }
        input:focus + .toggle-slider { box-shadow: 0 0 1px #28a745; }
        input:checked + .toggle-slider:before { transform: translateX(22px); }
      `}</style>

      <h1>Gerenciar Clientes e Fornecedores</h1>
      
      <form onSubmit={handleSubmitMerchant} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? 'Editar Cliente/Fornecedor' : 'Adicionar Novo'}</h2>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}><label>Nome/Razão Social: *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle}/></div>
          <div style={{ flex: 1 }}><label>Apelido/Nome Fantasia:</label><input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} style={inputStyle}/></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}><label>Telefone:</label><IMaskInput mask="(00) 0.0000-0000" value={formData.phone} onAccept={(value) => handleMaskedValueChange(value, 'phone')} placeholder="(##) #.####-####" type="tel" id="phone" style={inputStyle}/></div>
          <div style={{ flex: 1 }}><label>Email:</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle}/></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}><label>Tipo: *</label><select name="merchant_type" value={formData.merchant_type} onChange={handleInputChange} required style={selectStyle}><option value="Cliente">Cliente</option><option value="Fornecedor">Fornecedor</option><option value="Ambos">Ambos</option></select></div>
            <div style={{ flex: 1, ...toggleContainerStyle }}>
                <label htmlFor="status_toggle_merchant" style={{ cursor: 'pointer', marginRight: '10px' }}>Status:</label>
                <label className="toggle-switch">
                    <input type="checkbox" id="status_toggle_merchant" name="status_toggle" checked={formData.status_toggle} onChange={handleInputChange}/>
                    <span className="toggle-slider"></span>
                </label>
                <span style={{ marginLeft: '10px', fontWeight: formData.status_toggle ? 'bold' : 'normal', color: formData.status_toggle ? 'green' : '#777' }}>
                    {formData.status_toggle ? 'Ativo' : 'Inativo'}
                </span>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}><label>Tipo Chave PIX:</label><select name="pix_type" value={formData.pix_type} onChange={handleInputChange} style={selectStyle}>{pixTypes.map(pt=><option key={pt} value={pt}>{pt || 'Selecione...'}</option>)}</select></div>
          <div style={{ flex: 1 }}><label>Chave PIX:</label><input type="text" name="pix_key" value={formData.pix_key} onChange={handleInputChange} style={inputStyle}/></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div style={{ flex: 0.7 }}><label>CEP:</label><IMaskInput mask="00.000-000" value={formData.zip_code} unmask={true} onAccept={(value) => handleMaskedValueChange(value, 'zip_code')} placeholder="##.###-###" type="tel" id="zip_code" style={inputStyle}/></div>
            <div style={{ flex: 1.3 }}><label>Logradouro:</label><input type="text" name="address_street" value={formData.address_street} onChange={handleInputChange} style={inputStyle}/></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div style={{ flex: 0.5 }}><label>Número:</label><input type="text" name="address_number" value={formData.address_number} onChange={handleInputChange} style={inputStyle}/></div>
            <div style={{ flex: 1.5 }}><label>Bairro:</label><input type="text" name="address_district" value={formData.address_district} onChange={handleInputChange} style={inputStyle}/></div>
        </div>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div style={{ flex: 1.5 }}><label>Cidade:</label><input type="text" name="address_city" value={formData.address_city} onChange={handleInputChange} style={inputStyle}/></div>
            <div style={{ flex: 0.5 }}><label>UF:</label><select name="address_state" value={formData.address_state} onChange={handleInputChange} style={selectStyle}>{brazilianStates.map(s=><option key={s.sigla} value={s.sigla}>{s.sigla || s.nome}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: '20px' }}><label>Observações:</label><textarea name="observations" value={formData.observations} onChange={handleInputChange} rows="3" style={textareaStyle}/></div>
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1, fontSize: '1rem' }}>
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar' : 'Adicionar')}
            </button>
            {isEditing && (<button type="button" onClick={resetForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>)}
        </div>
      </form>

      <h2>Clientes e Fornecedores Cadastrados</h2>
      {loading && merchants.length > 0 && <p>Atualizando lista...</p>}
      {merchants.length === 0 && !loading && (<p>Nenhum cliente ou fornecedor cadastrado.</p>)}
      
      {merchants.length > 0 && (
        <table className="responsive-table-merchants">
          <thead>
            <tr>
              <th>Nome</th><th>Tipo</th><th>Telefone</th><th>Email</th><th>Cidade/UF</th><th>Status</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((merchant) => (
              <tr key={merchant.merchant_id}> 
                <td data-label="Nome">{merchant.name}{merchant.nickname && ` (${merchant.nickname})`}</td>
                <td data-label="Tipo">{merchant.merchant_type}</td>
                <td data-label="Telefone">{merchant.phone || '-'}</td>
                <td data-label="Email">{merchant.email || '-'}</td>
                <td data-label="Cidade/UF">{merchant.address_city && merchant.address_state ? `${merchant.address_city}/${merchant.address_state}` : (merchant.address_city || merchant.address_state || '-')}</td>
                <td data-label="Status" style={{color: merchant.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold'}}>{merchant.status}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                    <button onClick={() => openDetailsModal(merchant)} title="Ver Detalhes" style={{ padding: '6px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}><DetailsIcon /></button>
                    <button onClick={() => handleEditMerchant(merchant)} title="Editar" style={{ padding: '6px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}><EditIcon /></button>
                    <button onClick={() => handleDeleteMerchant(merchant)} title="Excluir" style={{ padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}><DeleteIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedMerchantForDetails && (
        <div className="details-modal-overlay" onClick={closeDetailsModal}>
          <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Detalhes de: {selectedMerchantForDetails.name}</h3>
            <p><strong>ID:</strong> {selectedMerchantForDetails.merchant_id}</p>
            <p><strong>Nome/Razão Social:</strong> {selectedMerchantForDetails.name}</p>
            {selectedMerchantForDetails.nickname && <p><strong>Apelido/Nome Fantasia:</strong> {selectedMerchantForDetails.nickname}</p>}
            <p><strong>Tipo:</strong> {selectedMerchantForDetails.merchant_type}</p>
            <p><strong>Status:</strong> <span style={{color: selectedMerchantForDetails.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold'}}>{selectedMerchantForDetails.status}</span></p>
            {selectedMerchantForDetails.phone && <p><strong>Telefone:</strong> {selectedMerchantForDetails.phone}</p>}
            {selectedMerchantForDetails.email && <p><strong>Email:</strong> {selectedMerchantForDetails.email}</p>}
            <hr style={{margin: '15px 0'}} />
            <h4>Endereço:</h4>
            <p><strong>CEP:</strong> {selectedMerchantForDetails.zip_code ? String(selectedMerchantForDetails.zip_code).replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2-$3') : '-'}</p>
            <p><strong>Logradouro:</strong> {selectedMerchantForDetails.address_street || '-'}</p>
            <p><strong>Número:</strong> {selectedMerchantForDetails.address_number || '-'}</p>
            <p><strong>Bairro:</strong> {selectedMerchantForDetails.address_district || '-'}</p>
            <p><strong>Cidade:</strong> {selectedMerchantForDetails.address_city || '-'}</p>
            <p><strong>UF:</strong> {selectedMerchantForDetails.address_state || '-'}</p>
            { (selectedMerchantForDetails.pix_type || selectedMerchantForDetails.pix_key) && <hr style={{margin: '15px 0'}} /> }
            {selectedMerchantForDetails.pix_type && <p><strong>Tipo Chave PIX:</strong> {selectedMerchantForDetails.pix_type}</p>}
            {selectedMerchantForDetails.pix_key && <p><strong>Chave PIX:</strong> {selectedMerchantForDetails.pix_key}</p>}
            {selectedMerchantForDetails.observations && (
                <><hr style={{margin: '15px 0'}} /><p><strong>Observações:</strong></p><p style={{whiteSpace: 'pre-wrap'}}>{selectedMerchantForDetails.observations}</p></>
            )}
            <hr style={{margin: '15px 0'}} />
            <p><small>Criado em: {new Date(selectedMerchantForDetails.created_at).toLocaleString()}</small></p>
            <p><small>Última atualização: {new Date(selectedMerchantForDetails.updated_at).toLocaleString()}</small></p>
            <button onClick={closeDetailsModal} className="details-modal-close-button">Fechar</button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO PARA EXCLUSÃO */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteMerchant}
        title="Confirmar Exclusão"
        message={ merchantToDelete ? <>Deseja realmente excluir <strong>{merchantToDelete.name}</strong>? Esta ação não pode ser desfeita.</> : "Deseja realmente excluir este item?" }
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MerchantsPage;
