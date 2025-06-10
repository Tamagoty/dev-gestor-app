// src/features/merchants/MerchantsPage.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/MerchantsPage.module.css';
import { useMerchants } from './useMerchants';
import MerchantForm from './components/MerchantForm';
import MerchantsListTable from './components/MerchantsListTable';
import MerchantDetailsModal from './components/MerchantDetailsModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const initialFormData = { name: '', nickname: '', phone: '', email: '', merchant_type: 'Cliente', pix_type: '', pix_key: '', zip_code: '', address_street: '', address_number: '', address_district: '', address_city: '', address_state: '', status_toggle: true, observations: '' };

function MerchantsPage() {
  // O Hook cuida da lista principal, paginação e filtros
  const { 
    merchants, loading, refetchMerchants,
    currentPage, totalPages, setCurrentPage, itemsPerPage, totalItems,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  } = useMerchants();

  // ======================================================================
  // ===== INÍCIO DA LÓGICA E ESTADOS RESTAURADOS DO ARQUIVO ORIGINAL =====
  // ======================================================================

  // Estados e handlers do formulário
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMerchantId, setCurrentMerchantId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // Estados para os modais
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMaskedValueChange = (value, fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentMerchantId(null);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error('O Nome é obrigatório.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Primeiro, preparamos o objeto de dados a partir do formulário
      const { status_toggle, ...dataFields } = formData;
      const dataToSubmit = { 
        ...dataFields, 
        status: status_toggle ? 'Ativo' : 'Inativo' 
      };

      // =================================================================
      // LÓGICA CORRIGIDA AQUI
      // =================================================================
      // Se estivermos editando, adicionamos o ID ao objeto a ser salvo.
      // Se estivermos criando, não enviamos o ID, deixando o banco criá-lo.
      if (isEditing) {
        dataToSubmit.merchant_id = currentMerchantId;
      }
      
      const { error } = await supabase
        .from('merchants')
        .upsert(dataToSubmit);

      if (error) throw error;

      toast.success(isEditing ? 'Dados atualizados!' : 'Adicionado com sucesso!');
      resetForm();
      refetchMerchants();
    } catch (err) {
      toast.error(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (merchantToEdit) => {
    setIsEditing(true);
    setCurrentMerchantId(merchantToEdit.merchant_id);
    setFormData({
      name: merchantToEdit.name || '',
      nickname: merchantToEdit.nickname || '',
      phone: merchantToEdit.phone || '',
      email: merchantToEdit.email || '',
      merchant_type: merchantToEdit.merchant_type || 'Cliente',
      pix_type: merchantToEdit.pix_type || '',
      pix_key: merchantToEdit.pix_key || '',
      zip_code: merchantToEdit.zip_code || '',
      address_street: merchantToEdit.address_street || '',
      address_number: merchantToEdit.address_number || '',
      address_district: merchantToEdit.address_district || '',
      address_city: merchantToEdit.address_city || '',
      address_state: merchantToEdit.address_state || '',
      status_toggle: merchantToEdit.status === 'Ativo',
      observations: merchantToEdit.observations || '',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (merchant) => {
    setMerchantToDelete(merchant); 
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!merchantToDelete) return; 
    setIsDeleting(true);
    try {
      const tablesToCheck = [{ table: 'sales', column: 'customer_id' }, { table: 'purchases', column: 'supplier_id' }];
      for (const { table, column } of tablesToCheck) {
        const { count } = await supabase.from(table).select(column, { count: 'exact', head: true }).eq(column, merchantToDelete.merchant_id);
        if (count > 0) throw new Error(`Este item está associado a ${table} e não pode ser excluído.`);
      }
      
      await supabase.from('merchants').delete().eq('merchant_id', merchantToDelete.merchant_id);
      toast.success(`"${merchantToDelete.name}" excluído!`);
      refetchMerchants();
    } catch (err) { 
      toast.error(`Erro ao excluir: ${err.message}`);
    } finally { 
      setShowDeleteModal(false); 
      setMerchantToDelete(null); 
      setIsDeleting(false); 
    }
  };

  const openDetailsModal = (merchant) => {
    setSelectedMerchant(merchant);
    setShowDetailsModal(true);
  };
  
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedMerchant(null);
  };

  // ================================================================
  // ===== FIM DA LÓGICA E ESTADOS RESTAURADOS ======================
  // ================================================================

  return (
    <div className={styles.pageContainer}>
      <h1>Gerenciar Clientes e Fornecedores</h1>
      <MerchantForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleMaskedValueChange={handleMaskedValueChange}
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        formRef={formRef}
      />
      
      <hr style={{margin: '40px 0'}} />

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por nome ou apelido..."
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <MerchantsListTable
        merchants={merchants}
        openDetailsModal={openDetailsModal}
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
      
      <MerchantDetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        merchant={selectedMerchant}
      />
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={merchantToDelete ? <>Deseja realmente excluir <strong>{merchantToDelete.name}</strong>?</> : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MerchantsPage;