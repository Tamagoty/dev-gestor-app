// src/features/partnerWithdrawals/PartnerWithdrawalsPage.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/PartnerWithdrawalsPage.module.css';
import { usePartnerWithdrawals } from './usePartnerWithdrawals';
import WithdrawalForm from './components/WithdrawalForm';
import WithdrawalsListTable from './components/WithdrawalsListTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const initialFormData = { partner_id: '', withdrawal_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'Transferência Bancária', description: '', observations: '', cost_center_id: '' };

function PartnerWithdrawalsPage() {
  const {
    withdrawals, loadingWithdrawals, refetchWithdrawals,
    partners, costCentersList, loadingFormSources,
    currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  } = usePartnerWithdrawals();

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

  const handleSubmit = async (event) => {
    // ... (sua lógica de submit com verificação de saldo) ...
  };

  const handleEdit = (withdrawal) => {
    setIsEditing(true);
    setCurrentWithdrawalId(withdrawal.withdrawal_id);
    setFormData({
      partner_id: withdrawal.partner_id || '',
      withdrawal_date: withdrawal.withdrawal_date || '',
      amount: String(withdrawal.amount) || '',
      payment_method: withdrawal.payment_method || 'Transferência Bancária',
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
      <h1 className={styles.pageTitle}>Gerenciar Retiradas de Sócios</h1>
      <WithdrawalForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        partners={partners}
        costCentersList={costCentersList}
        loading={loadingFormSources}
        formRef={formRef}
      />
      
      <hr style={{margin: '40px 0'}}/>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por descrição..."
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <WithdrawalsListTable
        withdrawals={withdrawals}
        isLoading={loadingWithdrawals}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        isLoading={loadingWithdrawals}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={itemToDelete ? `Deseja realmente excluir a retirada de ${itemToDelete.partner?.name || 'Sócio'}?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PartnerWithdrawalsPage;