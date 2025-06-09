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
import ToggleSwitch from '../../components/ToggleSwitch';

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
    sortColumn, sortDirection, handleSort,
    showOnlyOpen, setShowOnlyOpen // Adicionado
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
    // Validações básicas no front-end
    if (!formData.supplier_id || !formData.cost_center_id) {
      toast.error("Preencha o Fornecedor e o Centro de Custo.");
      return;
    }
    if (formData.items.length === 0) {
      toast.error("Adicione pelo menos um item à compra.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepara os dados para a função RPC
      const header_data = {
        supplier_id: formData.supplier_id,
        cost_center_id: formData.cost_center_id,
        purchase_date: formData.purchase_date,
        observations: formData.observations,
        total_amount: purchaseTotalAmount // O total já calculado
      };

      const items_data = formData.items;

      // Chama a função RPC!
      const { error } = await supabase.rpc('create_purchase_with_items', {
        header_data,
        items_data
      });

      if (error) throw error;

      toast.success('Compra salva com sucesso!');
      resetForm();
      refetchPurchases(); // Atualiza a lista de compras na tela

    } catch (error) {
      toast.error(`Erro ao salvar compra: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (purchase) => {
    // A edição completa (cabeçalho + itens) é mais complexa.
    // Vamos implementar em um segundo momento.
    toast('A função de editar compras ainda não foi implementada.', { icon: '🚧' });
    
    /* Lógica futura:
    1. Buscar a compra e seus itens.
    2. Popular o formData com os dados do cabeçalho e da lista de itens.
    3. Mudar o formulário para o modo de edição.
    */
  };

  const handleDelete = (purchase) => {
    setPurchaseToDelete(purchase);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!purchaseToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Deleta as transações de pagamento associadas
      await supabase
        .from('transactions')
        .delete()
        .eq('reference_id', purchaseToDelete.purchase_id)
        .eq('transaction_type', 'Compra');
      
      // 2. Deleta o cabeçalho da compra. Os itens serão deletados em cascata pelo DB.
      await supabase
        .from('purchase_headers') // <-- MUDANÇA AQUI
        .delete()
        .eq('purchase_id', purchaseToDelete.purchase_id);
      
      toast.success(`Compra excluída!`);
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
  setFormData={setFormData} // Mantemos esta para o array de itens
  handleInputChange={handleInputChange} // <-- ADICIONE ESTA LINHA
  handleSubmit={handleSubmit}
  isEditing={isEditing}
  isSubmitting={isSubmitting}
  resetForm={resetForm}
  suppliers={suppliers}
  productsList={productsList}
  costCentersList={costCentersList}
  loading={loadingFormDataSources} // Corrigi aqui, antes estava 'loading'
  purchaseTotalAmount={purchaseTotalAmount}
  formRef={formRef}
/>
      
      <hr style={{margin: '40px 0'}}/>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por fornecedor ou centro de custo..." // Placeholder atualizado
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
        <ToggleSwitch 
          label="Mostrar apenas com saldo a pagar"
          checked={showOnlyOpen}
          onChange={() => {
            setShowOnlyOpen(!showOnlyOpen);
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