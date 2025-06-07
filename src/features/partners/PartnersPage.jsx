// src/features/partners/PartnersPage.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/PartnersPage.module.css';
import { usePartners } from './usePartners';
import PartnerForm from './components/PartnerForm';
import PartnersListTable from './components/PartnersListTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const initialFormData = { name: '', cpf_cnpj: '', email: '', phone: '', address: '', equity_percentage: '', entry_date: '', status_form: true, observations: '' };

function PartnersPage() {
  const {
    partners, loading, refetchPartners,
    currentPage, totalPages, setCurrentPage, itemsPerPage, totalItems,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  } = usePartners();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartnerId, setCurrentPartnerId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef(null);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const handleMaskedValueChange = (value, name) => setFormData(prev => ({ ...prev, [name]: value }));
  const resetForm = () => { setFormData(initialFormData); setIsEditing(false); setCurrentPartnerId(null); };

  const handleEdit = (partner) => {
    setIsEditing(true);
    setCurrentPartnerId(partner.partner_id);
    setFormData({
      name: partner.name || '',
      cpf_cnpj: partner.cpf_cnpj || '',
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      equity_percentage: partner.equity_percentage ?? '',
      entry_date: partner.entry_date || '',
      status_form: partner.status === 'Ativo',
      observations: partner.observations || '',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) { toast.error('O Nome é obrigatório.'); return; }
    
    setIsSubmitting(true);
    try {
      const { status_form, ...dataFields } = formData;
      const dataToSubmit = { ...dataFields, status: status_form ? 'Ativo' : 'Inativo' };
      
      const { error } = await supabase.from('partners').upsert({ partner_id: currentPartnerId, ...dataToSubmit });
      if (error) throw error;
      
      toast.success('Sócio salvo com sucesso!');
      resetForm();
      refetchPartners();
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (partner) => {
    setPartnerToDelete(partner);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!partnerToDelete) return;
    setIsDeleting(true);
    try {
      const { count } = await supabase.from('partner_withdrawals').select('partner_id', { count: 'exact', head: true }).eq('partner_id', partnerToDelete.partner_id);
      if (count > 0) throw new Error(`Sócio possui ${count} retirada(s) e não pode ser excluído.`);

      const { error } = await supabase.from('partners').delete().eq('partner_id', partnerToDelete.partner_id);
      if (error) throw error;
      
      toast.success(`Sócio "${partnerToDelete.name}" excluído!`);
      refetchPartners();
    } catch (err) {
      toast.error(`Falha ao excluir: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPartnerToDelete(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Gerenciar Sócios</h1>
      <PartnerForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleMaskedValueChange={handleMaskedValueChange}
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        formRef={formRef}
      />
      <hr style={{margin: '40px 0'}}/>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por nome ou CPF/CNPJ..."
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <PartnersListTable
        partners={partners}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        isLoading={loading}
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
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão de Sócio"
        message={partnerToDelete ? `Deseja realmente excluir o sócio ${partnerToDelete.name}?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PartnersPage;