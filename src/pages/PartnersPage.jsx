// src/pages/PartnersPage.jsx
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
// const selectStyle = { ...inputStyle }; // Não será mais usado para status
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };

// Estilos para o container do toggle switch
const toggleContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '15px 0',
  color: '#333', 
};

const initialFormData = {
  name: '',
  cpf_cnpj: '',
  email: '',
  phone: '',
  address: '',
  equity_percentage: '',
  entry_date: '',
  status_form: true, // true para 'Ativo', false para 'Inativo' (para o toggle)
  observations: ''
};

const cpfCnpjMask = [
  { mask: '000.000.000-00', lazy: false, placeholderChar: '_' },
  { mask: '00.000.000/0000-00', lazy: false, placeholderChar: '_' }
];

// Ícones SVG para os botões
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


function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartnerId, setCurrentPartnerId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Gestor App - Sócios';
    fetchPartners();
  }, []);

  async function fetchPartners() {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error('Erro ao buscar sócios:', err.message);
      setListError(err.message);
      setPartners([]);
      toast.error('Falha ao carregar sócios.');
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
    setCurrentPartnerId(null);
  };

  const handleSubmitPartner = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error('O Nome do sócio é obrigatório.'); return;
    }
    const percentageString = String(formData.equity_percentage).trim();
    let equityPercentageValue = null;
    if (percentageString !== '') {
      equityPercentageValue = parseFloat(percentageString.replace(',', '.'));
      if (isNaN(equityPercentageValue) || equityPercentageValue < 0 || equityPercentageValue > 100) {
        toast.error('Participação deve ser um nº válido entre 0 e 100.'); return;
      }
    }
    let totalPercentageOfOtherPartners = 0;
    partners.forEach(partner => {
      if (isEditing && partner.partner_id === currentPartnerId) {/*Não soma*/}
      else if (partner.equity_percentage !== null && !isNaN(parseFloat(partner.equity_percentage))) {
        totalPercentageOfOtherPartners += parseFloat(partner.equity_percentage);
      }
    });
    const proposedNewTotalPercentage = totalPercentageOfOtherPartners + (equityPercentageValue || 0);
    if (proposedNewTotalPercentage > 100) {
      toast.error(`Soma da participação (${proposedNewTotalPercentage.toFixed(2)}%) excede 100%. Outros: ${totalPercentageOfOtherPartners.toFixed(2)}%.`); return;
    }

    setIsSubmitting(true);
    const dataToSubmit = {
      name: formData.name.trim(),
      cpf_cnpj: formData.cpf_cnpj.trim() === '' ? null : formData.cpf_cnpj,
      email: formData.email.trim() === '' ? null : formData.email.trim(),
      phone: formData.phone.trim() === '' ? null : formData.phone,
      address: formData.address.trim() === '' ? null : formData.address.trim(),
      equity_percentage: equityPercentageValue,
      entry_date: formData.entry_date === '' ? null : formData.entry_date,
      status: formData.status_form ? 'Ativo' : 'Inativo', // Converte booleano para string
      observations: formData.observations.trim() === '' ? null : formData.observations.trim(),
    };

    try {
      let savedPartner = null;
      let successMessage = '';
      if (isEditing && currentPartnerId) {
        const { data: updated, error } = await supabase.from('partners').update(dataToSubmit).eq('partner_id', currentPartnerId).select().single();
        if (error) { if (error.message.includes('unique constraint') && error.message.includes('cpf_cnpj')) { toast.error('Erro: CPF/CNPJ já cadastrado.');} else { throw error; }}
        else { savedPartner = updated; successMessage = 'Sócio atualizado!'; }
      } else {
        const { data: created, error } = await supabase.from('partners').insert([dataToSubmit]).select().single();
        if (error) { if (error.message.includes('unique constraint') && error.message.includes('cpf_cnpj')) { toast.error('Erro: CPF/CNPJ já cadastrado.');} else { throw error; }}
        else { savedPartner = created; successMessage = 'Sócio adicionado!'; }
      }
      if (savedPartner) { await fetchPartners(); toast.success(successMessage); resetForm(); }
    } catch (err) {
      if (!(err.message.includes('unique constraint') && err.message.includes('cpf_cnpj'))) {
        console.error(`Erro:`, err.message); toast.error(`Erro: ${err.message}`);
      }
    } finally { setIsSubmitting(false); }
  };
  
  const handleEditPartner = (partnerToEdit) => {
    setIsEditing(true);
    setCurrentPartnerId(partnerToEdit.partner_id);
    setFormData({
      name: partnerToEdit.name || '',
      cpf_cnpj: partnerToEdit.cpf_cnpj || '',
      email: partnerToEdit.email || '',
      phone: partnerToEdit.phone || '',
      address: partnerToEdit.address || '',
      equity_percentage: partnerToEdit.equity_percentage !== null ? String(partnerToEdit.equity_percentage) : '',
      entry_date: partnerToEdit.entry_date ? new Date(partnerToEdit.entry_date + 'T00:00:00Z').toISOString().split('T')[0] : '',
      status_form: partnerToEdit.status === 'Ativo', // Converte string para booleano
      observations: partnerToEdit.observations || ''
    });
    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    toast.info(`Editando: ${partnerToEdit.name}`);
  };

  const handleDeletePartner = (partner) => {
    setPartnerToDelete(partner); 
    setShowDeleteModal(true);
  };

  const confirmDeletePartner = async () => {
    if (!partnerToDelete) return;
    setIsDeleting(true);
    try {
      const { count, error: checkError } = await supabase.from('partner_withdrawals').select('partner_id', {count: 'exact', head: true}).eq('partner_id', partnerToDelete.partner_id);
      if (checkError) {
        toast.error("Erro ao verificar uso do sócio.");
      } else if (count > 0) {
        toast.error(`"${partnerToDelete.name}" não pode ser excluído pois possui ${count} retirada(s).`);
      } else {
        const { error } = await supabase.from('partners').delete().eq('partner_id', partnerToDelete.partner_id);
        if (error) throw error;
        setPartners(prev => prev.filter(p => p.partner_id !== partnerToDelete.partner_id));
        toast.success(`Sócio "${partnerToDelete.name}" excluído!`);
      }
    } catch (err) { 
      console.error('Erro ao excluir sócio:', err.message); 
      toast.error(`Erro ao excluir: ${err.message}`);
    } finally {
      setShowDeleteModal(false);
      setPartnerToDelete(null);
      setIsDeleting(false);
    }
  };

  if (loading && partners.length === 0) return <p style={{ padding: '20px' }}>Carregando...</p>;
  if (listError && partners.length === 0) return <p style={{ color: 'red', padding: '20px' }}>Erro: {listError}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <style>{`
        /* ... (CSS da tabela responsiva .responsive-table-partners como antes) ... */
        .responsive-table-partners { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; }
        .responsive-table-partners thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-partners th, .responsive-table-partners td { padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; }
        .responsive-table-partners th { font-weight: bold; }
        .responsive-table-partners tbody tr { background-color: #fff; }
        .responsive-table-partners tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-partners tbody tr:hover { background-color: #e2e6ea; }
        .responsive-table-partners .actions-cell { text-align: right; min-width: 120px; } /* Ajustado para 2 botões com ícone */
        .responsive-table-partners .percentage-cell { text-align: right; min-width: 80px; }
        @media screen and (max-width: 768px) { 
          .responsive-table-partners thead { display: none; }
          .responsive-table-partners tr { display: block; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .responsive-table-partners td { display: block; text-align: right; padding-left: 45%; position: relative; border-bottom: 1px dotted #eee; }
          .responsive-table-partners td:last-child { border-bottom: none; }
          .responsive-table-partners td::before { content: attr(data-label); position: absolute; left: 10px; width: calc(45% - 20px); padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; }
          .responsive-table-partners td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-partners td.actions-cell::before { content: "Ações:"; }
          .responsive-table-partners td.actions-cell div { justify-content: center; flex-wrap: wrap; }
          .responsive-table-partners td.actions-cell div button { margin: 5px; }
          .responsive-table-partners td.percentage-cell { text-align: right; padding-left: 50%;}
          .responsive-table-partners td.percentage-cell::before { width: calc(50% - 20px); }
        }
        /* Estilos para o Toggle Switch (adaptado da SalespeoplePage) */
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 28px; }
        .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .toggle-slider { background-color: #28a745; }
        input:focus + .toggle-slider { box-shadow: 0 0 1px #28a745; }
        input:checked + .toggle-slider:before { transform: translateX(22px); }
      `}</style>

      <h1>Gerenciar Sócios</h1>
      
      <form onSubmit={handleSubmitPartner} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? `Editar Sócio` : 'Adicionar Novo Sócio'}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="name">Nome Completo: *</label><input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle}/></div>
          <div><label htmlFor="cpf_cnpj">CPF/CNPJ:</label><IMaskInput mask={cpfCnpjMask} value={formData.cpf_cnpj} onAccept={(value) => handleMaskedValueChange(value, 'cpf_cnpj')} placeholder="CPF ou CNPJ" id="cpf_cnpj" style={inputStyle}/></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="email">Email:</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle}/></div>
          <div><label htmlFor="phone">Telefone:</label><IMaskInput mask="(00) 0.0000-0000" value={formData.phone} onAccept={(value, maskRef) => handleMaskedValueChange(maskRef.value, 'phone')} placeholder="(##) #.####-####" id="phone" style={inputStyle}/></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}> {/* Ajustado para 2 colunas */}
            <div><label htmlFor="equity_percentage">Participação (%):</label><input type="number" id="equity_percentage" name="equity_percentage" value={formData.equity_percentage} onChange={handleInputChange} min="0" max="100" step="0.01" placeholder="Ex: 25.5" style={inputStyle}/></div>
            <div><label htmlFor="entry_date">Data de Entrada:</label><input type="date" id="entry_date" name="entry_date" value={formData.entry_date} onChange={handleInputChange} style={inputStyle}/></div>
        </div>
        {/* CAMPO DE STATUS TRANSFORMADO EM TOGGLE */}
        <div style={toggleContainerStyle}>
          <label htmlFor="status_form_toggle" style={{ cursor: 'pointer', marginRight: '10px' }}>Status:</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              id="status_form_toggle" // ID único para o input
              name="status_form"      // Nome do campo no formData
              checked={formData.status_form}
              onChange={handleInputChange}
            />
            <span className="toggle-slider"></span>
          </label>
          <span style={{ marginLeft: '10px', fontWeight: formData.status_form ? 'bold' : 'normal', color: formData.status_form ? 'green' : '#777' }}>
            {formData.status_form ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <div style={{ marginBottom: '15px' }}><label htmlFor="address">Endereço:</label><input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Rua, Número, Bairro, Cidade - UF, CEP" style={inputStyle}/></div>
        <div style={{ marginBottom: '20px' }}><label htmlFor="observations">Observações:</label><textarea id="observations" name="observations" value={formData.observations} onChange={handleInputChange} rows="3" style={textareaStyle}/></div>
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1, fontSize: '1rem' }}>
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Sócio')}
            </button>
            {isEditing && (<button type="button" onClick={resetForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar Edição</button>)}
        </div>
      </form>

      <h2>Sócios Cadastrados</h2>
      {loading && partners.length > 0 && <p>Atualizando lista...</p>}
      {partners.length === 0 && !loading && (<p>Nenhum sócio cadastrado ainda.</p>)}
      
      {partners.length > 0 && (
        <table className="responsive-table-partners">
          <thead>
            <tr>
              <th>Nome</th><th>CPF/CNPJ</th><th>Email</th><th>Telefone</th>
              <th className="percentage-cell">Participação</th><th>Data Entrada</th><th>Status</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.partner_id}> 
                <td data-label="Nome">{partner.name}</td>
                <td data-label="CPF/CNPJ">{partner.cpf_cnpj || '-'}</td>
                <td data-label="Email">{partner.email || '-'}</td>
                <td data-label="Telefone">{partner.phone || '-'}</td>
                <td data-label="Participação" className="percentage-cell">{partner.equity_percentage !== null ? `${partner.equity_percentage}%` : '-'}</td>
                <td data-label="Data Entrada">{partner.entry_date ? new Date(partner.entry_date + 'T00:00:00Z').toLocaleDateString() : '-'}</td>
                <td data-label="Status" style={{color: partner.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold'}}>{partner.status}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                    <button 
                      onClick={() => handleEditPartner(partner)} 
                      title="Editar"
                      style={{ padding: '6px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <EditIcon />
                    </button>
                    <button 
                      onClick={() => handleDeletePartner(partner)} 
                      title="Excluir"
                      style={{ padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeletePartner}
        title="Confirmar Exclusão de Sócio"
        message={ partnerToDelete ? <>Deseja realmente excluir o sócio <strong>{partnerToDelete.name}</strong>? Esta ação não pode ser desfeita e pode afetar registros de retiradas.</> : "Deseja realmente excluir este sócio?" }
        confirmText="Excluir Sócio"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PartnersPage;
