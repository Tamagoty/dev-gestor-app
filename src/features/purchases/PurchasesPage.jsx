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

const initialFormData = { purchase_date: new Date().toISOString().split('T')[0], supplier_id: '', cost_center_id: '', product_id: '', product_name: '', unit_price: '', quantity: '', observations: '' };

function PurchasesPage() {
  const { purchases, loadingPurchases, suppliers, productsList, costCentersList, loadingFormDataSources, refetchPurchases } = usePurchases();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPurchaseId, setCurrentPurchaseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayTotalAmount, setDisplayTotalAmount] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formRef = useRef(null);

  useEffect(() => {
    const price = parseFloat(String(formData.unit_price).replace(',', '.'));
    const qty = parseFloat(String(formData.quantity).replace(',', '.'));
    setDisplayTotalAmount((!isNaN(price) && !isNaN(qty) && qty > 0) ? price * qty : 0);
  }, [formData.unit_price, formData.quantity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    if (name === 'product_id') {
      const product = productsList.find(p => p.product_id === value);
      if (product) {
        newFormData = { ...newFormData, product_name: product.name, unit_price: product.purchase_price ?? '' };
      }
    }
    setFormData(newFormData);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentPurchaseId(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
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
  
  const handleDelete = (id, name) => {
    setPurchaseToDelete({ id, name });
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!purchaseToDelete) return;
    setIsDeleting(true);
    try {
      // Deleta pagamentos associados primeiro
      await supabase.from('transactions').delete().eq('reference_id', purchaseToDelete.id).eq('transaction_type', 'Compra');
      // Deleta a compra
      await supabase.from('purchases').delete().eq('purchase_id', purchaseToDelete.id);
      
      toast.success(`Compra de "${purchaseToDelete.name}" excluída!`);
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
      <h1>Registro de Compras</h1>

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
        displayTotalAmount={displayTotalAmount}
        formRef={formRef}
      />

      {loadingPurchases ? <p>Carregando compras...</p> : (
        <PurchasesListTable
          purchases={purchases}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          openPaymentModal={openPaymentModal}
        />
      )}

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
        message={purchaseToDelete ? `Deseja realmente excluir a compra de ${purchaseToDelete.name}? Pagamentos associados também serão excluídos.` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PurchasesPage;