// src/pages/PartnersPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { IMaskInput } from 'react-imask'; // Usado para CPF/CNPJ e Telefone

// Estilos (reutilizados)
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };

const initialFormData = {
  name: '',
  cpf_cnpj: '',
  email: '',
  phone: '',
  address: '',
  equity_percentage: '',
  entry_date: '',
  status: 'Ativo',
  observations: ''
};

// Máscaras para CPF/CNPJ
const cpfCnpjMask = [
  { mask: '000.000.000-00', lazy: false, placeholderChar: '_' }, // CPF
  { mask: '00.000.000/0000-00', lazy: false, placeholderChar: '_' } // CNPJ
];

function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartnerId, setCurrentPartnerId] = useState(null);

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
    const { name, value, type } = event.target; // Removido 'checked' pois não há checkbox neste form
    setFormData(prev => ({
      ...prev,
      [name]: value // Simplificado, pois não há checkbox; type 'number' é tratado no submit
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
      status: formData.status,
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
      status: partnerToEdit.status || 'Ativo',
      observations: partnerToEdit.observations || ''
    });
    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    toast.info(`Editando: ${partnerToEdit.name}`);
  };

  const handleDeletePartner = async (partnerId, partnerName) => {
    if (!window.confirm(`Excluir "${partnerName}"?`)) return;
    try {
      // Verificar se sócio tem retiradas antes de excluir
      const { count, error: checkError } = await supabase.from('partner_withdrawals').select('partner_id', {count: 'exact', head: true}).eq('partner_id', partnerId);
      if (checkError) console.warn('Não foi possível checar retiradas do sócio.');
      if (count > 0) {
        toast.error('Este sócio não pode ser excluído pois possui retiradas registradas.'); return;
      }
      const { error } = await supabase.from('partners').delete().eq('partner_id', partnerId);
      if (error) throw error;
      setPartners(prev => prev.filter(p => p.partner_id !== partnerId));
      toast.success(`"${partnerName}" excluído!`);
    } catch (err) { console.error('Erro ao excluir:', err.message); toast.error(`Erro ao excluir: ${err.message}`);}
  };

  if (loading && partners.length === 0) return <p style={{ padding: '20px' }}>Carregando...</p>;
  if (listError && partners.length === 0) return <p style={{ color: 'red', padding: '20px' }}>Erro: {listError}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* CSS para a tabela responsiva de Sócios */}
      <style>{`
        .responsive-table-partners { /* Classe específica */
          width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden;
        }
        .responsive-table-partners thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-partners th, 
        .responsive-table-partners td {
          padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; 
        }
        .responsive-table-partners th { font-weight: bold; }
        .responsive-table-partners tbody tr { background-color: #fff; border-bottom: 1px solid #eee; }
        .responsive-table-partners tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-partners tbody tr:hover { background-color: #e9ecef; }
        .responsive-table-partners .actions-cell { text-align: right; min-width: 160px; }
        .responsive-table-partners .percentage-cell { text-align: right; min-width: 80px; }

        @media screen and (max-width: 768px) { /* Ajuste o breakpoint se necessário */
          .responsive-table-partners thead { display: none; }
          .responsive-table-partners tr {
            display: block; margin-bottom: 15px; border: 1px solid #ccc; 
            border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .responsive-table-partners td {
            display: block; text-align: right; padding-left: 45%; 
            position: relative; border-bottom: 1px dotted #eee; 
          }
          .responsive-table-partners td:last-child { border-bottom: none; }
          .responsive-table-partners td::before {
            content: attr(data-label); position: absolute; left: 10px; width: calc(45% - 20px); 
            padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; 
          }
          .responsive-table-partners td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-partners td.actions-cell::before { content: "Ações:"; }
          .responsive-table-partners td.actions-cell div { justify-content: center; flex-wrap: wrap; }
          .responsive-table-partners td.actions-cell div button { margin: 5px; }
          .responsive-table-partners td.percentage-cell { text-align: right; padding-left: 50%;}
          .responsive-table-partners td.percentage-cell::before { width: calc(50% - 20px); }
        }
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div><label htmlFor="equity_percentage">Participação (%):</label><input type="number" id="equity_percentage" name="equity_percentage" value={formData.equity_percentage} onChange={handleInputChange} min="0" max="100" step="0.01" placeholder="Ex: 25.5" style={inputStyle}/></div>
            <div><label htmlFor="entry_date">Data de Entrada:</label><input type="date" id="entry_date" name="entry_date" value={formData.entry_date} onChange={handleInputChange} style={inputStyle}/></div>
            <div><label htmlFor="status">Status:</label><select id="status" name="status" value={formData.status} onChange={handleInputChange} style={selectStyle}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div>
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
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Email</th>
              <th>Telefone</th>
              <th className="percentage-cell">Participação</th>
              <th>Data Entrada</th>
              <th>Status</th>
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
                    <button onClick={() => handleEditPartner(partner)} style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Editar</button>
                    <button onClick={() => handleDeletePartner(partner.partner_id, partner.name)} style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PartnersPage;