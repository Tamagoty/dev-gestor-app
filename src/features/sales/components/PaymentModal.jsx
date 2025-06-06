// src/features/sales/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import toast from 'react-hot-toast';

// Estilos definidos aqui para manter o componente autocontido
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 };
const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', color: '#333' };
const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#fff', color: '#333' };
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, minHeight: '60px' };

const initialPaymentState = { payment_date: new Date().toISOString().split('T')[0], payment_method: 'Dinheiro', amount: '', observations: '' };
const paymentMethods = ["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária", "Boleto"];

const PaymentModal = ({ isOpen, onClose, saleData, onSuccess }) => {
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialPaymentState);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = (saleData?.overall_total_amount || 0) - totalPaid;

  const fetchPayments = async (saleId) => {
    if (!saleId) return;
    setLoadingPayments(true);
    const { data, error } = await supabase.from('transactions').select('*').eq('reference_id', saleId).eq('transaction_type', 'Venda').order('payment_date', { ascending: false });
    if (error) toast.error("Falha ao buscar pagamentos.");
    else setPayments(data || []);
    setLoadingPayments(false);
  };

  // Efeito para buscar pagamentos quando o modal abre
  useEffect(() => {
    if (isOpen && saleData) {
      fetchPayments(saleData.sale_id);
      // Sugere o valor restante no campo de pagamento
      setFormData(prev => ({ ...prev, amount: balance > 0 ? balance.toFixed(2) : '' }));
    }
  }, [isOpen, saleData]); // Removido `balance` para evitar loops

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const paymentAmount = parseFloat(String(formData.amount).replace(',', '.'));
      if (isNaN(paymentAmount) || paymentAmount <= 0) throw new Error("Valor do pagamento inválido.");
      
      const { error } = await supabase.from('transactions').insert([{
        reference_id: saleData.sale_id,
        transaction_type: 'Venda',
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        amount: paymentAmount,
        observations: formData.observations || null,
      }]);

      if (error) throw error;
      
      toast.success("Pagamento registrado!");
      setFormData(initialPaymentState); // Reseta o formulário
      await fetchPayments(saleData.sale_id); // Atualiza a lista de pagamentos no modal
      onSuccess(); // Atualiza a lista de vendas na página principal
    } catch (error) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{margin: 0}}>Pagamentos da Venda #{saleData.sale_display_id}</h3>
            <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h4>Registrar Novo Pagamento</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div><label>Data Pag.: *</label><input type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} required style={inputStyle}/></div>
            <div><label>Valor Pago: *</label><input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required min="0.01" step="any" placeholder="0.00" style={inputStyle}/></div>
          </div>
          <div><label>Método Pag.: *</label><select name="payment_method" value={formData.payment_method} onChange={handleInputChange} required style={selectStyle}>{paymentMethods.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
          <div style={{marginTop: '10px'}}><label>Obs. Pagamento:</label><textarea name="observations" value={formData.observations} onChange={handleInputChange} rows="2" style={textareaStyle}/></div>
          <button type="submit" disabled={isSubmitting} style={{ marginTop: '15px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isSubmitting ? 'Registrando...' : 'Registrar Pagamento'}
          </button>
        </form>

        <h4>Pagamentos Já Registrados</h4>
        {loadingPayments ? <p>Carregando...</p> : (
          <ul style={{listStyle: 'none', padding: 0, maxHeight: '150px', overflowY: 'auto'}}>
            {payments.length === 0 ? <p>Nenhum pagamento registrado.</p> : payments.map(p => (
              <li key={p.transaction_id} style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                Data: {new Date(p.payment_date + 'T00:00:00Z').toLocaleDateString()} | Método: {p.payment_method} | Valor: R$ {parseFloat(p.amount).toFixed(2)}
                {p.observations && <em style={{display: 'block', fontSize: '0.9em', color: '#666'}}>Obs: {p.observations}</em>}
              </li>
            ))}
          </ul>
        )}
        <hr style={{margin: '20px 0'}}/>
        <strong style={{fontSize: '1.1em'}}>Saldo a Receber: R$ {balance.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default PaymentModal;