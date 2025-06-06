// src/features/partnerWithdrawals/PartnerWithdrawalsPage.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/PartnerWithdrawalsPage.module.css';
import { usePartnerWithdrawals } from './usePartnerWithdrawals';
import WithdrawalForm from './components/WithdrawalForm';
import WithdrawalsListTable from './components/WithdrawalsListTable';
import ConfirmationModal from '../../components/ConfirmationModal';

const initialFormData = { partner_id: '', withdrawal_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'Transferência Bancária', description: '', observations: '', cost_center_id: '' };

function PartnerWithdrawalsPage() {
  const { withdrawals, loadingWithdrawals, partners, costCentersList, loadingFormSources, refetchWithdrawals } = usePartnerWithdrawals();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWithdrawalId, setCurrentWithdrawalId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentWithdrawalId(null);
  };

  const handleSubmitWithdrawal = async (event) => {
    event.preventDefault();
    if (!formData.partner_id || !formData.withdrawal_date || !formData.cost_center_id || !formData.payment_method || !formData.description.trim() || !formData.amount) {
      toast.error('Todos os campos com * são obrigatórios.');
      return;
    }
    const amountValue = parseFloat(String(formData.amount).replace(',', '.'));
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('O valor da retirada deve ser um número positivo.');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToastId = toast.loading('Verificando saldo e processando...');
    
    try {
      // A lógica de verificação de saldo, por ser uma regra de negócio crítica, permanece aqui
      // ... (código para buscar transações e calcular o saldo) ...
      const { data: salePaymentsData } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Venda');
      const { data: purchasePaymentsData } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Compra');
      let query = supabase.from('partner_withdrawals').select('amount');
      if (isEditing) {
        query = query.neq('withdrawal_id', currentWithdrawalId);
      }
      const { data: existingWithdrawalsData } = await query;
      
      const totalSalePayments = salePaymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalPurchasePayments = purchasePaymentsData?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const existingWithdrawalsTotal = existingWithdrawalsData?.reduce((sum, wd) => sum + wd.amount, 0) || 0;
      const currentCashBalance = totalSalePayments - (totalPurchasePayments + existingWithdrawalsTotal);
      
      if (currentCashBalance < amountValue) {
        throw new Error(`Saldo insuficiente! Saldo atual: R$ ${currentCashBalance.toFixed(2)}`);
      }

      toast.dismiss(loadingToastId);

      const dataToSubmit = { ...formData, amount: amountValue };
      let error;
      if (isEditing) {
        ({ error } = await supabase.from('partner_withdrawals').update(dataToSubmit).eq('withdrawal_id', currentWithdrawalId));
      } else {
        ({ error } = await supabase.from('partner_withdrawals').insert([dataToSubmit]));
      }
      if (error) throw error;

      toast.success(isEditing ? 'Retirada atualizada!' : 'Retirada registrada!');
      resetForm();
      refetchWithdrawals();
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWithdrawal = (withdrawal) => {
    setIsEditing(true);
    setCurrentWithdrawalId(withdrawal.withdrawal_id);
    setFormData({
      partner_id: withdrawal.partner_id || '',
      withdrawal_date: withdrawal.withdrawal_date || '',
      amount: String(withdrawal.amount) || '',
      payment_method: withdrawal.payment_method || '',
      description: withdrawal.description || '',
      observations: withdrawal.observations || '',
      cost_center_id: withdrawal.cost_center_id || '',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDelete = (withdrawal) => {
    setItemToDelete(withdrawal);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('partner_withdrawals').delete().eq('withdrawal_id', itemToDelete.withdrawal_id);
      if (error) throw error;
      toast.success("Retirada excluída com sucesso!");
      refetchWithdrawals();
    } catch (err) {
      toast.error(`Erro ao excluir: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gerenciar Retiradas de Sócios</h1>
      <WithdrawalForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmitWithdrawal}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        partners={partners}
        costCentersList={costCentersList}
        loading={loadingFormSources}
        formRef={formRef}
      />
      
      {loadingWithdrawals ? <p>Carregando retiradas...</p> : (
        <WithdrawalsListTable
          withdrawals={withdrawals}
          handleEdit={handleEditWithdrawal}
          handleDelete={handleDelete}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={itemToDelete ? `Deseja realmente excluir a retirada de ${itemToDelete.partner?.name || 'Sócio'} no valor de R$ ${itemToDelete.amount}?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PartnerWithdrawalsPage;