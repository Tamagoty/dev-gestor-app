// src/features/purchases/components/PurchasePaymentModal.jsx (VERSÃO FINAL COM CRUD DE PAGAMENTOS)
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import toast from 'react-hot-toast';

// Importando componentes que vamos usar
import ConfirmationModal from '../../../components/ConfirmationModal';
import IconButton from '../../../components/IconButton';
import EditIcon from '../../../components/icons/EditIcon';
import DeleteIcon from '../../../components/icons/DeleteIcon';

// Estilos
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 };
const modalContentStyle = { backgroundColor: '#fff', color: '#333', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' };
const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' };

const initialPaymentState = { payment_date: new Date().toISOString().split('T')[0], payment_method: 'Transferência Bancária', amount: '', observations: '' };
const paymentMethods = ["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária", "Boleto"];

const PurchasePaymentModal = ({ isOpen, onClose, purchaseData, onSuccess }) => {
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialPaymentState);
  
  // Estados para gerenciar edição e exclusão
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const balance = (purchaseData?.total_amount || 0) - totalPaid;

  const fetchPayments = async (purchaseId) => {
    if (!purchaseId) return;
    setLoadingPayments(true);
    // MUDANÇA: Apontando para a tabela 'purchase_payments'
    const { data, error } = await supabase.from('purchase_payments').select('*').eq('purchase_id', purchaseId).order('payment_date', { ascending: false });
    if (error) toast.error("Falha ao buscar pagamentos.");
    else setPayments(data || []);
    setLoadingPayments(false);
  };

  useEffect(() => {
    if (isOpen && purchaseData) {
      fetchPayments(purchaseData.purchase_id);
      const currentBalance = purchaseData.balance || 0;
      setFormData(prev => ({ ...initialPaymentState, amount: currentBalance > 0 ? currentBalance.toFixed(2) : '' }));
      setEditingPaymentId(null);
    }
  }, [isOpen, purchaseData]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const paymentAmount = parseFloat(String(formData.amount).replace(',', '.'));
      if (isNaN(paymentAmount) || paymentAmount <= 0) throw new Error("O valor do pagamento deve ser positivo.");
      if (!formData.payment_date || !formData.payment_method) throw new Error("Data e Método são obrigatórios.");
      
      const balanceForValidation = editingPaymentId 
        ? balance + parseFloat(payments.find(p => p.payment_id === editingPaymentId)?.amount || 0)
        : balance;
        
      if (paymentAmount > balanceForValidation + 0.001) {
        throw new Error(`O valor do pagamento (R$ ${paymentAmount.toFixed(2)}) não pode ser maior que o saldo devedor (R$ ${balanceForValidation.toFixed(2)}).`);
      }

      const dataToSubmit = {
        purchase_id: purchaseData.purchase_id, // MUDANÇA: usando 'purchase_id'
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        amount: paymentAmount,
        observations: formData.observations || null,
      };

      let error;
      if (editingPaymentId) {
        ({ error } = await supabase.from('purchase_payments').update(dataToSubmit).eq('payment_id', editingPaymentId));
      } else {
        ({ error } = await supabase.from('purchase_payments').insert([dataToSubmit]));
      }
      
      if (error) throw error;
      
      toast.success(`Pagamento ${editingPaymentId ? 'atualizado' : 'registrado'}!`);
      setFormData(initialPaymentState);
      setEditingPaymentId(null);
      await fetchPayments(purchaseData.purchase_id);
      onSuccess();
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPaymentId(payment.payment_id);
    setFormData({
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      amount: parseFloat(payment.amount).toFixed(2),
      observations: payment.observations || ''
    });
  };

  const cancelEdit = () => {
    setEditingPaymentId(null);
    setFormData(initialPaymentState);
  };
  
  const handleDelete = (payment) => setPaymentToDelete(payment);

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    const { error } = await supabase.from('purchase_payments').delete().eq('payment_id', paymentToDelete.payment_id);
    if (error) {
      toast.error("Falha ao excluir pagamento.");
    } else {
      toast.success("Pagamento excluído.");
      setPayments(prev => prev.filter(p => p.payment_id !== paymentToDelete.payment_id));
      onSuccess();
    }
    setPaymentToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={modalOverlayStyle} onClick={onClose}>
        <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>Pagamentos da Compra (Fornecedor: {purchaseData.supplier_name})</h3>
              <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
          </div>
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4>{editingPaymentId ? 'Editar Pagamento' : 'Registrar Novo Pagamento'}</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{flex: 1}}><label>Data Pag.: *</label><input type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} required style={inputStyle}/></div>
              <div style={{flex: 1}}><label>Valor Pago: *</label><input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required min="0.01" step="any" placeholder="0.00" style={inputStyle}/></div>
            </div>
            <div><label>Método Pag.: *</label><select name="payment_method" value={formData.payment_method} onChange={handleInputChange} required style={{...inputStyle, width: '100%'}}>{paymentMethods.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
            <div style={{marginTop: '10px'}}><label>Obs. Pagamento:</label><textarea name="observations" value={formData.observations} onChange={handleInputChange} rows="2" style={{...inputStyle, width: '100%'}}/></div>
            <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
              <button type="submit" disabled={isSubmitting} style={{padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {isSubmitting ? 'Salvando...' : (editingPaymentId ? 'Salvar Alterações' : 'Registrar Pagamento')}
              </button>
              {editingPaymentId && (
                <button type="button" onClick={cancelEdit} style={{padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar Edição</button>
              )}
            </div>
          </form>

          <h4>Pagamentos Já Registrados</h4>
          <ul style={{listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto'}}>
            {loadingPayments ? <p>Carregando...</p> : payments.length === 0 ? <p>Nenhum pagamento registrado.</p> : payments.map(p => (
              <li key={p.payment_id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee'}}>
                <div>
                  Data: {new Date(p.payment_date + 'T00:00:00Z').toLocaleDateString()} | Método: {p.payment_method} | Valor: <strong>{parseFloat(p.amount).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>
                  {p.observations && <em style={{display: 'block', fontSize: '0.9em', color: '#666'}}>Obs: {p.observations}</em>}
                </div>
                <div style={{display: 'flex', gap: '5px'}}>
                   <IconButton variant="warning" onClick={() => handleEdit(p)} title="Editar Pagamento"><EditIcon /></IconButton>
                   <IconButton variant="danger" onClick={() => handleDelete(p)} title="Excluir Pagamento"><DeleteIcon /></IconButton>
                </div>
              </li>
            ))}
          </ul>
          <hr style={{margin: '20px 0'}}/>
          <strong style={{fontSize: '1.1em'}}>Saldo a Pagar: {balance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>
        </div>
      </div>
      <ConfirmationModal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={`Deseja realmente excluir este pagamento de ${paymentToDelete ? parseFloat(paymentToDelete.amount).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : ''}?`}
      />
    </>
  );
};

export default PurchasePaymentModal;