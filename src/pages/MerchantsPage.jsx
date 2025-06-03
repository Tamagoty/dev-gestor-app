// src/pages/MerchantsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { IMaskInput } from 'react-imask';

// Estilos (como na sua versão funcional anterior)
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };

const initialFormData = {
  name: '', nickname: '', phone: '', email: '',
  merchant_type: 'Cliente', pix_type: '', pix_key: '',
  zip_code: '', address_street: '', address_number: '',
  address_district: '', address_city: '', address_state: '',
  status: 'Ativo', observations: ''
};

// Constantes que estavam no seu código funcional
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


function MerchantsPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMerchantId, setCurrentMerchantId] = useState(null);

  // --- NOVOS ESTADOS PARA O MODAL DE DETALHES ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMerchantForDetails, setSelectedMerchantForDetails] = useState(null);
  // --- FIM DOS NOVOS ESTADOS ---

  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Gestor App - Clientes/Fornecedores';
    fetchMerchants();
  }, []);

  async function fetchMerchants() {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('merchants')
        .select('*') // '*' busca todos os campos para o modal de detalhes
        .order('name', { ascending: true });
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
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.name.trim()) {
      toast.error('O Nome é obrigatório.'); return;
    }
    if (!formData.merchant_type) {
        toast.error('O Tipo é obrigatório.'); return;
    }
    // if (!formData.address_state && formData.address_city) { // Validação opcional
    //     toast.error('A UF é recomendada se a cidade foi preenchida.');
    // }
    
    setIsSubmitting(true);
    const dataToSubmit = {
      name: formData.name.trim(),
      nickname: formData.nickname.trim() === '' ? null : formData.nickname.trim(),
      phone: formData.phone, 
      email: formData.email.trim() === '' ? null : formData.email.trim(),
      merchant_type: formData.merchant_type,
      pix_type: formData.pix_type === '' ? null : formData.pix_type,
      pix_key: formData.pix_key.trim() === '' ? null : formData.pix_key.trim(),
      zip_code: formData.zip_code, // Assume que já está apenas com números
      address_street: formData.address_street.trim() === '' ? null : formData.address_street.trim(),
      address_number: formData.address_number.trim() === '' ? null : formData.address_number.trim(),
      address_district: formData.address_district.trim() === '' ? null : formData.address_district.trim(),
      address_city: formData.address_city.trim() === '' ? null : formData.address_city.trim(),
      address_state: formData.address_state === '' ? null : formData.address_state,
      status: formData.status,
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
      // Tratar erro de constraint única para email ou cpf_cnpj se houver
      if (err.message.includes('unique constraint')) {
          if (err.message.includes('merchants_email_key')) { // Supondo que você tenha essa constraint
              toast.error('Erro: Email já cadastrado.');
          } else {
              toast.error('Erro: Violação de constraint única (ex: CPF/CNPJ já existe).');
          }
      } else {
          toast.error(`Erro ao salvar: ${err.message}`);
      }
    } finally { setIsSubmitting(false); }
  };
  
  const handleEditMerchant = (merchantToEdit) => {
    setIsEditing(true);
    setCurrentMerchantId(merchantToEdit.merchant_id);
    // Preenche formData com os dados do merchant, convertendo null para string vazia para inputs controlados
    const dataForForm = {};
    for (const key in initialFormData) {
      dataForForm[key] = merchantToEdit[key] === null || merchantToEdit[key] === undefined ? '' : merchantToEdit[key];
    }
    // Garante que os campos que podem ser booleanos ou ter padrões específicos sejam tratados
    dataForForm.merchant_type = merchantToEdit.merchant_type || 'Cliente';
    dataForForm.status = merchantToEdit.status || 'Ativo';
    // zip_code já deve estar como string de números no merchantToEdit se foi salvo corretamente
    
    setFormData(dataForForm);

    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });}
    toast.info(`Editando: ${merchantToEdit.name}`);
  };

  const handleDeleteMerchant = async (merchantId, merchantName) => {
    if (!window.confirm(`Excluir "${merchantName}"?`)) return;
    try {
      const tablesToCheck = ['sales', 'purchases'];
      for (const table of tablesToCheck) {
          const fkColumn = table === 'sales' ? 'customer_id' : 'supplier_id';
          const { count, error } = await supabase.from(table).select(fkColumn, {count: 'exact', head: true}).eq(fkColumn, merchantId);
          if (error) { console.warn(`Aviso: Não foi possível checar uso em ${table}`); }
          else if (count > 0) {
              toast.error(`Este item não pode ser excluído pois está associado a ${table === 'sales' ? 'Vendas' : 'Compras'}.`);
              return; // Impede a exclusão
          }
      }
      const { error } = await supabase.from('merchants').delete().eq('merchant_id', merchantId);
      if (error) throw error;
      setMerchants(prev => prev.filter(m => m.merchant_id !== merchantId));
      toast.success(`"${merchantName}" excluído!`);
    } catch (err) {
      console.error('Erro ao excluir:', err.message);
      toast.error(`Erro ao excluir: ${err.message}`);
    }
  };

  // --- NOVAS FUNÇÕES PARA O MODAL DE DETALHES ---
  const openDetailsModal = (merchant) => {
    setSelectedMerchantForDetails(merchant);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedMerchantForDetails(null);
  };
  // --- FIM DAS NOVAS FUNÇÕES ---

  if (loading && merchants.length === 0) return <p style={{ padding: '20px' }}>Carregando...</p>;
  if (listError && merchants.length === 0) return <p style={{ color: 'red', padding: '20px' }}>Erro: {listError}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .responsive-table-merchants {
          width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden;
        }
        .responsive-table-merchants thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-merchants th, .responsive-table-merchants td {
          padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; 
        }
        .responsive-table-merchants th { font-weight: bold; }
        .responsive-table-merchants tbody tr { background-color: #fff; border-bottom: 1px solid #eee; }
        .responsive-table-merchants tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-merchants tbody tr:hover { background-color: #e9ecef; }
        .responsive-table-merchants .actions-cell { text-align: right; min-width: 200px; } /* Aumentado para 3 botões */

        @media screen and (max-width: 768px) {
          .responsive-table-merchants thead { display: none; }
          .responsive-table-merchants tr {
            display: block; margin-bottom: 15px; border: 1px solid #ccc; 
            border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .responsive-table-merchants td {
            display: block; text-align: right; padding-left: 40%; 
            position: relative; border-bottom: 1px dotted #eee; 
          }
          .responsive-table-merchants td:last-child { border-bottom: none; }
          .responsive-table-merchants td::before {
            content: attr(data-label); position: absolute; left: 10px; width: calc(40% - 20px); 
            padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; 
          }
          .responsive-table-merchants td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-merchants td.actions-cell::before { content: "Ações:"; }
          .responsive-table-merchants td.actions-cell div { justify-content: center; flex-wrap: wrap; }
          .responsive-table-merchants td.actions-cell div button { margin: 5px; }
        }
        /* Estilos para o Modal de Detalhes */
        .details-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
          background-color: rgba(0,0,0,0.6); display: flex; 
          justify-content: center; align-items: center; z-index: 1050;
        }
        .details-modal-content {
          background-color: #fff; padding: 25px; border-radius: 8px; 
          width: 90%; max-width: 650px; max-height: 85vh; overflow-y: auto;
          color: #333; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .details-modal-content h3 {
          margin-top: 0; color: #007bff; border-bottom: 1px solid #eee; padding-bottom: 10px;
        }
        .details-modal-content p { margin: 8px 0; line-height: 1.6; }
        .details-modal-content p strong { color: #555; min-width: 150px; display: inline-block; } /* Aumentado min-width */
        .details-modal-close-button {
          display: block; margin: 25px auto 0 auto; padding: 10px 20px;
          background-color: #6c757d; color: white; border: none;
          border-radius: 4px; cursor: pointer; font-size: 1rem;
        }
        .details-modal-close-button:hover { background-color: #5a6268; }
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
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}><label>Tipo: *</label><select name="merchant_type" value={formData.merchant_type} onChange={handleInputChange} required style={selectStyle}><option value="Cliente">Cliente</option><option value="Fornecedor">Fornecedor</option><option value="Ambos">Ambos</option></select></div>
            <div style={{ flex: 1 }}><label>Status:</label><select name="status" value={formData.status} onChange={handleInputChange} style={selectStyle}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div>
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
              <th>Nome</th>
              <th>Tipo</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Cidade/UF</th>
              <th>Status</th>
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
                    {/* BOTÃO DE DETALHES ADICIONADO */}
                    <button 
                      onClick={() => openDetailsModal(merchant)}
                      style={{ padding: '6px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}
                    >
                      Detalhes
                    </button>
                    <button onClick={() => handleEditMerchant(merchant)} style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Editar</button>
                    <button onClick={() => handleDeleteMerchant(merchant.merchant_id, merchant.name)} style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* JSX DO MODAL DE DETALHES */}
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
                <>
                    <hr style={{margin: '15px 0'}} />
                    <p><strong>Observações:</strong></p>
                    <p style={{whiteSpace: 'pre-wrap'}}>{selectedMerchantForDetails.observations}</p>
                </>
            )}
            <hr style={{margin: '15px 0'}} />
            <p><small>Criado em: {new Date(selectedMerchantForDetails.created_at).toLocaleString()}</small></p>
            <p><small>Última atualização: {new Date(selectedMerchantForDetails.updated_at).toLocaleString()}</small></p>

            <button onClick={closeDetailsModal} className="details-modal-close-button">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MerchantsPage;