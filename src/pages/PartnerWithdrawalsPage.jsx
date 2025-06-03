// src/pages/PartnerWithdrawalsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal'; // 1. Importar o modal

// Estilos (reutilizados)
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };

const initialFormData = {
  partner_id: '',
  withdrawal_date: new Date().toISOString().split('T')[0],
  amount: '',
  payment_method: 'Transferência Bancária',
  description: '',
  observations: '',
  cost_center_id: '',
};

const paymentMethods = ["Dinheiro", "PIX", "Transferência Bancária", "Cheque"];

function PartnerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [listError, setListError] = useState(null);

  const [partners, setPartners] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormSources, setLoadingFormSources] = useState(true);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWithdrawalId, setCurrentWithdrawalId] = useState(null);

  // --- NOVOS ESTADOS PARA O MODAL DE EXCLUSÃO ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { id, identifier }
  const [isDeleting, setIsDeleting] = useState(false);
  // --- FIM DOS NOVOS ESTADOS ---

  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Gestor App - Retiradas de Sócios';
    async function loadInitialData() {
      setLoadingFormSources(true);
      fetchWithdrawals(); 
      const partnersDataPromise = fetchPartnersForSelect();
      const costCentersDataPromise = fetchCostCentersForSelect();
      try {
        await Promise.all([partnersDataPromise, costCentersDataPromise]);
      } catch (e) { 
        console.error("Erro ao carregar dados para selects (Retiradas):", e); 
      } finally { 
        setLoadingFormSources(false); 
      }
    }
    loadInitialData();
  }, []);

  async function fetchWithdrawals() {
    setLoadingWithdrawals(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('partner_withdrawals')
        .select(`*, partner:partners(name), cost_center:cost_centers!cost_center_id(name)`)
        .order('withdrawal_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error('Erro ao buscar retiradas:', err.message);
      setListError(err.message);
      setWithdrawals([]);
    } finally {
      setLoadingWithdrawals(false);
    }
  }

  async function fetchPartnersForSelect() {
    try {
      const { data, error } = await supabase
        .from('partners').select('partner_id, name').order('name', { ascending: true });
      if (error) throw error;
      setPartners(data || []);
    } catch (err) {
      console.error('Erro ao buscar sócios:', err.message);
      toast.error('Falha ao carregar lista de sócios.');
      setPartners([]);
    }
  }

  async function fetchCostCentersForSelect() {
    try {
      const { data, error } = await supabase
        .from('cost_centers').select('cost_center_id, name').eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      setCostCentersList(data || []);
    } catch (err) {
      console.error('Erro ao buscar Centros de Custo:', err.message);
      toast.error('Falha ao carregar Centros de Custo.');
      setCostCentersList([]);
    }
  }
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    // Se quiser persistir o cost_center_id ou partner_id após o reset, adicione lógica aqui
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentWithdrawalId(null);
  };

  const handleSubmitWithdrawal = async (event) => {
    event.preventDefault();
    if (!formData.partner_id) { toast.error('Sócio é obrigatório.'); return; }
    if (!formData.withdrawal_date) { toast.error('Data da retirada é obrigatória.'); return; }
    if (!formData.cost_center_id) { toast.error('Centro de Custo é obrigatório.'); return; }
    if (!formData.payment_method) { toast.error('Método de pagamento é obrigatório.'); return; }
    if (!formData.description.trim()) { toast.error('Descrição/Motivo é obrigatório.'); return; }

    const amountStr = String(formData.amount).replace(',', '.');
    const amountValue = parseFloat(amountStr);
    if (amountStr.trim() === '' || isNaN(amountValue) || amountValue <= 0) {
      toast.error('O valor da retirada deve ser um número positivo.');
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = toast.loading('Verificando saldo e processando...');

    try {
      // Verificação de Saldo (como na mensagem #93)
      const { data: salePaymentsData, error: salePaymentsError } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Venda');
      if (salePaymentsError) throw new Error(`Saldo: Erro pag. vendas - ${salePaymentsError.message}`);
      const totalSalePayments = salePaymentsData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      const { data: purchasePaymentsData, error: purchasePaymentsError } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Compra');
      if (purchasePaymentsError) throw new Error(`Saldo: Erro pag. compras - ${purchasePaymentsError.message}`);
      const totalPurchasePayments = purchasePaymentsData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
      let existingWithdrawalsTotal = 0;
      let query = supabase.from('partner_withdrawals').select('amount');
      if (isEditing && currentWithdrawalId) {
        query = query.neq('withdrawal_id', currentWithdrawalId);
      }
      const { data: existingWithdrawalsData, error: existingWithdrawalsError } = await query;
      if (existingWithdrawalsError) throw new Error(`Saldo: Erro retiradas - ${existingWithdrawalsError.message}`);
      existingWithdrawalsTotal = existingWithdrawalsData?.reduce((sum, wd) => sum + parseFloat(wd.amount), 0) || 0;
      const currentCashBalance = totalSalePayments - (totalPurchasePayments + existingWithdrawalsTotal);

      if (currentCashBalance < amountValue) {
        toast.dismiss(loadingToastId);
        toast.error(`Saldo insuficiente! Saldo: R$ ${currentCashBalance.toFixed(2)} Retirada: R$ ${amountValue.toFixed(2)}.`);
        setIsSubmitting(false); return;
      }
      
      toast.dismiss(loadingToastId);
      
      const dataToSubmit = {
        partner_id: formData.partner_id,
        withdrawal_date: formData.withdrawal_date,
        amount: amountValue,
        payment_method: formData.payment_method,
        description: formData.description.trim(),
        observations: formData.observations.trim() === '' ? null : formData.observations.trim(),
        cost_center_id: formData.cost_center_id,
      };
      
      let savedWithdrawal = null;
      let successMessage = '';
      const selectString = `*, partner:partners(name), cost_center:cost_centers!cost_center_id(name)`;

      if (isEditing && currentWithdrawalId) {
        const { data: updatedWithdrawal, error: updateError } = await supabase
          .from('partner_withdrawals').update(dataToSubmit).eq('withdrawal_id', currentWithdrawalId)
          .select(selectString).single();
        if (updateError) throw updateError;
        savedWithdrawal = updatedWithdrawal;
        successMessage = 'Retirada atualizada com sucesso!';
      } else {
        const { data: newWithdrawal, error: insertError } = await supabase
          .from('partner_withdrawals').insert([dataToSubmit])
          .select(selectString).single();
        if (insertError) throw insertError;
        savedWithdrawal = newWithdrawal;
        successMessage = 'Retirada registrada com sucesso!';
      }

      if (savedWithdrawal) {
        await fetchWithdrawals();
        toast.success(successMessage);
        resetForm();
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'registrar'} retirada:`, err.message);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditWithdrawal = (withdrawalToEdit) => {
    setIsEditing(true);
    setCurrentWithdrawalId(withdrawalToEdit.withdrawal_id);
    const withdrawalDate = withdrawalToEdit.withdrawal_date 
      ? new Date(withdrawalToEdit.withdrawal_date + 'T00:00:00Z').toISOString().split('T')[0] 
      : '';
    setFormData({
      partner_id: withdrawalToEdit.partner_id || '',
      withdrawal_date: withdrawalDate,
      amount: withdrawalToEdit.amount !== null ? String(withdrawalToEdit.amount) : '',
      payment_method: withdrawalToEdit.payment_method || 'Transferência Bancária',
      description: withdrawalToEdit.description || '',
      observations: withdrawalToEdit.observations || '',
      cost_center_id: withdrawalToEdit.cost_center_id || '',
    });
    if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    toast.info(`Editando retirada: ${withdrawalToEdit.description || 'ID ' + String(withdrawalToEdit.withdrawal_id).substring(0,6)}...`);
  };

  // --- handleDeleteWithdrawal MODIFICADA para usar o ConfirmationModal ---
  const handleDeleteWithdrawal = (withdrawalId, withdrawalDesc) => {
    const displayDesc = withdrawalDesc || `ID ${String(withdrawalId).substring(0,6)}...`;
    setItemToDelete({ id: withdrawalId, identifier: displayDesc }); // Usa itemToDelete para consistência
    setShowDeleteModal(true); // Abre o modal de confirmação
  };

  const confirmDeleteWithdrawal = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true); // Ativa loading no botão do modal
    try {
      // Não há pagamentos diretamente associados a partner_withdrawals na tabela transactions
      // A exclusão é direta na tabela partner_withdrawals
      const { error } = await supabase.from('partner_withdrawals').delete().eq('withdrawal_id', itemToDelete.id);
      if (error) throw error;
      
      await fetchWithdrawals(); // Re-busca a lista para atualizar
      toast.success(`Retirada "${itemToDelete.identifier}" excluída com sucesso!`);
    } catch (err) { 
      console.error('Erro ao excluir retirada:', err.message); 
      toast.error(`Erro ao excluir retirada: ${err.message}`); 
    } finally {
      setShowDeleteModal(false); // Fecha o modal
      setItemToDelete(null);        // Limpa o estado
      setIsDeleting(false);     // Desativa loading
    }
  };
  // --- FIM DAS MODIFICAÇÕES EM handleDeleteWithdrawal ---


  if ((loadingWithdrawals && withdrawals.length === 0) || loadingFormSources) {
    return <p style={{ padding: '20px' }}>Carregando dados...</p>;
  }
  if (listError && withdrawals.length === 0) {
    return <p style={{ color: 'red', padding: '20px' }}>Erro ao carregar retiradas: {listError}</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      {/* CSS para a tabela responsiva de Retiradas de Sócios */}
      <style>{`
        .responsive-table-partnerwithdrawals { /* Classe específica */
          width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden;
        }
        .responsive-table-partnerwithdrawals thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-partnerwithdrawals th, 
        .responsive-table-partnerwithdrawals td {
          padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; 
        }
        .responsive-table-partnerwithdrawals th { font-weight: bold; }
        .responsive-table-partnerwithdrawals tbody tr { background-color: #fff; }
        .responsive-table-partnerwithdrawals tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-partnerwithdrawals tbody tr:hover { background-color: #e2e6ea; }
        .responsive-table-partnerwithdrawals .actions-cell { text-align: right; min-width: 160px; }
        .responsive-table-partnerwithdrawals .currency-cell { text-align: right; }

        @media screen and (max-width: 768px) {
          .responsive-table-partnerwithdrawals thead { display: none; }
          .responsive-table-partnerwithdrawals tr {
            display: block; margin-bottom: 15px; border: 1px solid #ccc; 
            border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .responsive-table-partnerwithdrawals td {
            display: block; text-align: right; padding-left: 45%; 
            position: relative; border-bottom: 1px dotted #eee; 
          }
          .responsive-table-partnerwithdrawals td:last-child { border-bottom: none; }
          .responsive-table-partnerwithdrawals td::before {
            content: attr(data-label); position: absolute; left: 10px; width: calc(45% - 20px); 
            padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; 
          }
          .responsive-table-partnerwithdrawals td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-partnerwithdrawals td.actions-cell::before { content: "Ações:"; }
          .responsive-table-partnerwithdrawals td.actions-cell div { justify-content: center; flex-wrap: wrap; }
          .responsive-table-partnerwithdrawals td.actions-cell div button { margin: 5px; }
          .responsive-table-partnerwithdrawals td.currency-cell { text-align: right; padding-left: 50%;}
          .responsive-table-partnerwithdrawals td.currency-cell::before { width: calc(50% - 20px); }
        }
      `}</style>

      <h1>Gerenciar Retiradas de Sócios</h1>
      
      <form onSubmit={handleSubmitWithdrawal} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? `Editar Retirada` : 'Registrar Nova Retirada'}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label htmlFor="partner_id" style={{ display: 'block', marginBottom: '5px' }}>Sócio: *</label>
            <select id="partner_id" name="partner_id" value={formData.partner_id} onChange={handleInputChange} required style={selectStyle} disabled={loadingFormSources || partners.length === 0}>
              <option value="">{loadingFormSources ? 'Carregando...' : (partners.length === 0 ? 'Nenhum sócio' : 'Selecione...')}</option>
              {partners.map(partner => ( <option key={partner.partner_id} value={partner.partner_id}>{partner.name}</option> ))}
            </select>
          </div>
          <div>
            <label htmlFor="withdrawal_date" style={{ display: 'block', marginBottom: '5px' }}>Data da Retirada: *</label>
            <input type="date" id="withdrawal_date" name="withdrawal_date" value={formData.withdrawal_date} onChange={handleInputChange} required style={inputStyle}/>
          </div>
          <div> 
            <label htmlFor="cost_center_id" style={{ display: 'block', marginBottom: '5px' }}>Centro de Custo: *</label>
            <select id="cost_center_id" name="cost_center_id" value={formData.cost_center_id} onChange={handleInputChange} required style={selectStyle} disabled={loadingFormSources || costCentersList.length === 0}>
              <option value="">{loadingFormSources ? 'Carregando...' : (costCentersList.length === 0 ? 'Nenhum CC' : 'Selecione...')}</option>
              {costCentersList.map(cc => (<option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>Valor (R$): *</label>
            <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleInputChange} required min="0.01" step="any" placeholder="0.00" style={inputStyle}/>
          </div>
          <div>
            <label htmlFor="payment_method" style={{ display: 'block', marginBottom: '5px' }}>Método de Pagamento: *</label>
            <select id="payment_method" name="payment_method" value={formData.payment_method} onChange={handleInputChange} required style={selectStyle}>
              {paymentMethods.map(method => ( <option key={method} value={method}>{method}</option> ))}
            </select>
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descrição/Motivo: *</label>
            <input type="text" id="description" name="description" value={formData.description} onChange={handleInputChange} required style={inputStyle} placeholder="Ex: Pró-labore, Adiantamento"/>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="observations" style={{ display: 'block', marginBottom: '5px' }}>Observações Adicionais:</label>
          <textarea id="observations" name="observations" value={formData.observations} onChange={handleInputChange} rows="3" style={textareaStyle}/>
        </div>
        
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button type="submit" disabled={isSubmitting || loadingFormSources} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1, fontSize: '1rem' }}>
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Registrando...') : (isEditing ? 'Salvar Alterações' : 'Registrar Retirada')}
            </button>
            {isEditing && (
            <button type="button" onClick={resetForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar Edição
            </button>
            )}
        </div>
      </form>

      <h2>Retiradas Registradas</h2>
      {loadingWithdrawals && withdrawals.length > 0 && <p>Atualizando lista...</p>}
      {withdrawals.length === 0 && !loadingWithdrawals ? (
        <p>Nenhuma retirada de sócio registrada ainda.</p>
      ) : (
        <table className="responsive-table-partnerwithdrawals">
          <thead>
            <tr>
              <th>Data</th>
              <th>Sócio</th>
              <th>Centro de Custo</th>
              <th>Descrição</th>
              <th>Método</th>
              <th className="currency-cell">Valor (R$)</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((wd) => (
              <tr key={wd.withdrawal_id}> 
                <td data-label="Data">{new Date(wd.withdrawal_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Sócio">{wd.partner?.name || 'N/A'}</td>
                <td data-label="Centro de Custo">{wd.cost_center?.name || 'N/A'}</td>
                <td data-label="Descrição">{wd.description}</td>
                <td data-label="Método">{wd.payment_method}</td>
                <td data-label="Valor (R$)" className="currency-cell">{parseFloat(wd.amount).toFixed(2)}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                    <button onClick={() => handleEditWithdrawal(wd)} style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Editar</button>
                    {/* MODIFICADO: Botão de excluir agora chama handleDeleteWithdrawal que abrirá o modal */}
                    <button onClick={() => handleDeleteWithdrawal(wd.withdrawal_id, wd.description || `Retirada de ${wd.partner?.name || 'Sócio Desconhecido'}`)} style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL DE CONFIRMAÇÃO PARA EXCLUIR RETIRADA */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteWithdrawal}
        title="Confirmar Exclusão de Retirada"
        message={
            itemToDelete ? 
            <>Deseja realmente excluir a retirada: <strong>{itemToDelete.identifier}</strong>? Esta ação não pode ser desfeita.</> 
            : "Deseja realmente excluir esta retirada?"
        }
        confirmText="Excluir Retirada"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PartnerWithdrawalsPage;