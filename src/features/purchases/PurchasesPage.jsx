// src/features/purchases/PurchasesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/PurchasesPage.module.css';
import { usePurchases } from './usePurchases';
import PurchaseForm from './components/PurchaseForm';
import PurchasesListTable from './components/PurchasesListTable';
import PurchasePaymentModal from './components/PurchasePaymentModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const initialFormData = {
  purchase_date: new Date().toISOString().split('T')[0],
  supplier_id: '',
  cost_center_id: '',
  observations: '',
  items: [], // Array para guardar os itens da compra
};

function PurchasesPage() {
  const {
    purchases, loadingPurchases, refetchPurchases,
    suppliers, productsList, costCentersList, loadingFormDataSources,
    currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  } = usePurchases();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPurchaseId, setCurrentPurchaseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formRef = useRef(null);
  const purchaseTotalAmount = formData.items.reduce((total, item) => {
    return total + (Number(item.quantity) * Number(item.unit_price));
  }, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value // Atualiza campos como purchase_date, supplier_id, etc.
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentPurchaseId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.supplier_id || !formData.cost_center_id || !formData.unit_price || !formData.quantity) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = { ...formData, total_amount: displayTotalAmount };
      const { error } = await supabase.from('purchases').upsert({ purchase_id: currentPurchaseId, ...dataToSubmit });
      if (error) throw error;
      toast.success('Compra salva com sucesso!');
      resetForm();
      refetchPurchases();
    } catch (error) {
      toast.error(`Erro ao salvar compra: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (purchase) => {
    setIsEditing(true);
    setCurrentPurchaseId(purchase.purchase_id);
    setFormData({
      purchase_date: purchase.purchase_date,
      supplier_id: purchase.supplier_id,
      cost_center_id: purchase.cost_center_id,
      product_id: purchase.product_id,
      product_name: purchase.product_name,
      unit_price: purchase.unit_price,
      quantity: purchase.quantity,
      observations: purchase.observations || '',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleDelete = (purchase) => {
    setPurchaseToDelete(purchase);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!purchaseToDelete) return;
    setIsDeleting(true);
    try {
      await supabase.from('transactions').delete().eq('reference_id', purchaseToDelete.purchase_id).eq('transaction_type', 'Compra');
      await supabase.from('purchases').delete().eq('purchase_id', purchaseToDelete.purchase_id);
      
      toast.success(`Compra de "${purchaseToDelete.product_name}" excluída!`);
      refetchPurchases();
    } catch (error) {
      toast.error(`Erro ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPurchaseToDelete(null);
    }
  };
  
  const openPaymentModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowPaymentModal(true);
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Registro de Compras</h1>
      <PurchaseForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        suppliers={suppliers}
        productsList={productsList}
        costCentersList={costCentersList}
        loading={loadingFormDataSources}
        purchaseTotalAmount={purchaseTotalAmount}
        formRef={formRef}
      />
      
      <hr style={{margin: '40px 0'}}/>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por produto..."
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <PurchasesListTable
        purchases={purchases}
        isLoading={loadingPurchases}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        openPaymentModal={openPaymentModal}
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
        isLoading={loadingPurchases}
      />
      
      <PurchasePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        purchaseData={selectedPurchase}
        onSuccess={refetchPurchases}
      />
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={purchaseToDelete ? `Deseja realmente excluir a compra de ${purchaseToDelete.product_name}?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PurchasesPage;