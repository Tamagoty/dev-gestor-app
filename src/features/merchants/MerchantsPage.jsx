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

const initialFormData = { name: '', nickname: '', phone: '', email: '', merchant_type: 'Cliente', pix_type: '', pix_key: '', zip_code: '', address_street: '', address_number: '', address_district: '', address_city: '', address_state: '', status_toggle: true, observations: '' };

function MerchantsPage() {
  const { merchants, loading, refetchMerchants } = useMerchants();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMerchantId, setCurrentMerchantId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formRef = useRef(null);

  // Lógica de manipulação do formulário (handleInputChange, handleMaskedValueChange, resetForm)
  // ...
  
  const handleSubmit = async (event) => { /* Sua lógica de submit aqui */ };
  const handleEdit = (merchant) => { /* Sua lógica de edição aqui */ };
  const handleDelete = (merchant) => { setMerchantToDelete(merchant); setShowDeleteModal(true); };
  const confirmDelete = async () => { /* Sua lógica de exclusão com verificação de uso aqui */ };

  const openDetailsModal = (merchant) => {
    setSelectedMerchant(merchant);
    setShowDetailsModal(true);
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gerenciar Clientes e Fornecedores</h1>
      
      <MerchantForm
        formData={formData}
        // ... outras props
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        resetForm={() => setFormData(initialFormData)}
        formRef={formRef}
      />
      
      {loading ? <p>Carregando...</p> : (
        <MerchantsListTable
          merchants={merchants}
          openDetailsModal={openDetailsModal}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}

      <MerchantDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        merchant={selectedMerchant}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={merchantToDelete ? `Deseja realmente excluir ${merchantToDelete.name}?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MerchantsPage;