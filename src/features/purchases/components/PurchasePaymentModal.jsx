// src/features/purchases/components/PurchasePaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import toast from 'react-hot-toast';

const initialPaymentState = { payment_date: new Date().toISOString().split('T')[0], payment_method: 'Transferência Bancária', amount: '', observations: '' };
const paymentMethods = ["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária", "Boleto"];

const PurchasePaymentModal = ({ isOpen, onClose, purchaseData, onSuccess }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialPaymentState);

  useEffect(() => {
    if (isOpen && purchaseData?.purchase_id) {
      fetchPayments(purchaseData.purchase_id);
    }
  }, [isOpen, purchaseData]);

  const fetchPayments = async (purchaseId) => {
    setLoading(true);
    const { data } = await supabase.from('transactions').select('*').eq('reference_id', purchaseId).eq('transaction_type', 'Compra').order('payment_date', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        reference_id: purchaseData.purchase_id,
        transaction_type: 'Compra',
        ...formData
      }]);
      if (error) throw error;

      toast.success("Pagamento registrado!");
      setFormData(initialPaymentState);
      fetchPayments(purchaseData.purchase_id);
      onSuccess(); // Recarrega a lista de compras na página principal
    } catch (error) {
      toast.error(`Erro ao registrar pagamento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = (purchaseData.total_amount || 0) - totalPaid;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#fff', color: '#333', padding: '20px', borderRadius: '8px', width: '600px' }}>
        <h3 style={{marginTop: 0}}>Pagamentos da Compra: {purchaseData.product_name}</h3>
        <form onSubmit={handleSubmit}>{/*... form de pagamento ...*/}</form>
        <h4>Pagamentos Registrados</h4>
        {loading ? <p>Carregando...</p> : <ul>{payments.map(p => <li key={p.transaction_id}>{p.payment_method}: R$ {p.amount.toFixed(2)}</li>)}</ul>}
        <strong>Saldo a Pagar: R$ {balance.toFixed(2)}</strong>
        <button onClick={onClose} style={{marginTop: '20px', float: 'right'}}>Fechar</button>
      </div>
    </div>
  );
};

export default PurchasePaymentModal;