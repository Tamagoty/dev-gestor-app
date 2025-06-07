// src/features/sales/SalesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/SalesPage.module.css';
import { useSales } from './useSales';
import SaleHeaderForm from './components/SaleHeaderForm';
import SaleItemsManager from './components/SaleItemsManager';
import SalesListTable from './components/SalesListTable';
import PaymentModal from './components/PaymentModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const initialHeaderState = { sale_date: new Date().toISOString().split('T')[0], customer_id: '', salesperson_id: '', cost_center_id: '', commission_percentage: '', observations: '' };

function SalesPage() {
  // O Hook busca os dados para a lista e para os dropdowns
  const {
    sales, loadingSales, refetchSales,
    customers, salespeople, productsList, costCentersList, loadingFormDataSources,
    currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  } = useSales();

  // =================================================================
  // ===== INÍCIO DA LÓGICA E ESTADOS RESTAURADOS ======================
  // =================================================================

  const [headerData, setHeaderData] = useState(initialHeaderState);
  const [currentItems, setCurrentItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const overallTotal = currentItems.reduce((sum, item) => sum + (item.item_total_amount || 0), 0);
  const commissionValue = overallTotal * (parseFloat(String(headerData.commission_percentage).replace(',', '.')) / 100 || 0);

  const handleHeaderChange = (e) => {
    setHeaderData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetAllForms = () => {
    setHeaderData(initialHeaderState);
    setCurrentItems([]);
    setIsEditing(false);
    setCurrentSaleId(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmitSale = async (e) => {
    e.preventDefault();
    if (currentItems.length === 0 && !isEditing) {
      toast.error("Adicione pelo menos um item à venda.");
      return;
    }
    // ...outras validações...
    
    setIsSubmitting(true);
    try {
      const saleHeaderDataToSubmit = { 
        ...headerData, 
        overall_total_amount: overallTotal, 
        commission_value: commissionValue,
        commission_percentage: headerData.commission_percentage || null,
      };

      if (isEditing) {
        const { error } = await supabase.from('sales').update(saleHeaderDataToSubmit).eq('sale_id', currentSaleId);
        if (error) throw error;
        toast.success(`Venda atualizada com sucesso!`);
      } else {
        const { data: newSale, error: saleError } = await supabase.from('sales').insert([saleHeaderDataToSubmit]).select().single();
        if (saleError) throw saleError;

        const itemsToInsert = currentItems.map(item => ({
            sale_id: newSale.sale_id,
            product_id: item.product_id,
            product_name_at_sale: item.product_name_at_sale,
            unit_price_at_sale: item.unit_price_at_sale,
            quantity: item.quantity,
            item_total_amount: item.item_total_amount,
        }));
        
        const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;

        toast.success(`Venda #${newSale.sale_display_id} registrada!`);
      }
      
      resetAllForms();
      refetchSales();
    } catch (error) {
      toast.error(`Erro ao salvar venda: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSale = async (saleToEdit) => {
    setIsEditing(true);
    setCurrentSaleId(saleToEdit.sale_id);
    setHeaderData({
      sale_date: saleToEdit.sale_date,
      customer_id: saleToEdit.customer_id,
      salesperson_id: saleToEdit.salesperson_id,
      cost_center_id: saleToEdit.cost_center_id,
      commission_percentage: saleToEdit.commission_percentage ?? '',
      observations: saleToEdit.observations || '',
    });
    
    const { data: items } = await supabase.from('sale_items').select('*').eq('sale_id', saleToEdit.sale_id);
    setCurrentItems(items || []);
    
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteSale = (id, displayId) => {
    setSaleToDelete({ id, displayId });
    setShowDeleteModal(true);
  };
  
  const confirmDeleteSale = async () => {
    if (!saleToDelete) return;
    setIsDeleting(true);
    try {
      await supabase.from('transactions').delete().eq('reference_id', saleToDelete.id);
      await supabase.from('sale_items').delete().eq('sale_id', saleToDelete.id);
      const { error } = await supabase.from('sales').delete().eq('sale_id', saleToDelete.id);
      if (error) throw error;
      
      toast.success(`Venda #${saleToDelete.displayId} e seus dados foram excluídos!`);
      refetchSales();
    } catch (error) {
      toast.error(`Erro ao deletar: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const openPaymentModal = (sale) => {
    setSelectedSaleForPayment(sale);
    setShowPaymentModal(true);
  };
  // ==============================================================
  // ===== FIM DA LÓGICA E ESTADOS RESTAURADOS ====================
  // ==============================================================

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Registro de Vendas</h1>
      <form onSubmit={handleSubmitSale} className={styles.formSection} ref={formRef}>
        <h2>{isEditing ? `Editando Venda #${currentSaleId?.substring(0,6)}...` : 'Nova Venda'}</h2>
        <SaleHeaderForm
          formData={headerData}
          handleInputChange={handleHeaderChange}
          customers={customers}
          salespeople={salespeople}
          costCentersList={costCentersList}
          loading={loadingFormDataSources}
        />
        <SaleItemsManager
          items={currentItems}
          setItems={setCurrentItems}
          productsList={productsList}
          loading={loadingFormDataSources}
          isEditing={isEditing}
        />
        <div className={styles.summarySection}>
          <div>
            <label>TOTAL GERAL DA VENDA:</label>
            <input type="text" value={`R$ ${overallTotal.toFixed(2)}`} readOnly className={styles.readOnlyInput} />
          </div>
          <div className={styles.formGroup}>
            <label>% Comissão:</label>
            <input type="number" name="commission_percentage" value={headerData.commission_percentage} onChange={handleHeaderChange} className={styles.input} />
          </div>
        </div>
        <div style={{display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end'}}>
          {isEditing && (<button type="button" onClick={resetAllForms}>Cancelar Edição</button>)}
          <button type="submit" disabled={isSubmitting || (currentItems.length === 0 && !isEditing)}>
            {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Finalizar e Registrar Venda')}
          </button>
        </div>
      </form>
      
      <hr style={{margin: '40px 0'}}/>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por ID ou Observações..."
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <SalesListTable
        sales={sales}
        loading={loadingSales}
        handleEdit={handleEditSale}
        handleDelete={handleDeleteSale}
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
        isLoading={loadingSales}
      />
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        saleData={selectedSaleForPayment}
        onSuccess={refetchSales}
      />
      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSale}
        title="Confirmar Exclusão"
        message={saleToDelete ? `Deseja excluir a venda #${saleToDelete.displayId}?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default SalesPage;