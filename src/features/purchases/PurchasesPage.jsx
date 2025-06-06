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

  const formRef = useRef(null);

  useEffect(() => {
    const price = parseFloat(String(formData.unit_price).replace(',', '.'));
    const qty = parseFloat(String(formData.quantity).replace(',', '.'));
    setDisplayTotalAmount((price && qty) ? price * qty : 0);
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
  
  const handleSubmit = async (e) => { /* ... sua lógica de submit aqui ... */ };
  const handleEdit = (purchase) => { /* ... sua lógica de edição aqui ... */ };
  const handleDelete = (id, name) => { setPurchaseToDelete({ id, name }); setShowDeleteModal(true); };
  const confirmDelete = async () => { /* ... sua lógica de exclusão aqui ... */ refetchPurchases(); };
  const openPaymentModal = (purchase) => { setSelectedPurchase(purchase); setShowPaymentModal(true); };
  
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
        message={purchaseToDelete ? `Deseja realmente excluir a compra de ${purchaseToDelete.name}?` : ""}
      />
    </div>
  );
}

export default PurchasesPage;