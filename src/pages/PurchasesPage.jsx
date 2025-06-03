// src/pages/PurchasesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal'; // 1. Importar o modal

// Estilos (do seu código da mensagem #117)
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };
const readOnlyStyle = { ...inputStyle, backgroundColor: '#444', cursor: 'default' };

// initialPurchaseFormData (do seu código da mensagem #117)
const initialPurchaseFormData = {
  purchase_date: new Date().toISOString().split('T')[0],
  supplier_id: '',
  cost_center_id: '',
  product_id: '', 
  product_name: '', 
  unit_price: '',   
  quantity: '',
  observations: '',
};

// initialPaymentFormData e paymentMethods (do seu código da mensagem #117)
const initialPaymentFormData = {
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Transferência Bancária',
    amount: '',
    observations: ''
};
const paymentMethods = ["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária", "Boleto"];


function PurchasesPage() {
  // Todos os seus estados como estavam na mensagem #117
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [listError, setListError] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormDataSources, setLoadingFormDataSources] = useState(true);

  const [formData, setFormData] = useState(initialPurchaseFormData);
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPurchaseId, setCurrentPurchaseId] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchaseForPayment, setSelectedPurchaseForPayment] = useState(null);
  const [paymentsForSelectedPurchase, setPaymentsForSelectedPurchase] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFormData, setPaymentFormDataState] = useState(initialPaymentFormData);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // --- NOVOS ESTADOS PARA O MODAL DE EXCLUSÃO DE COMPRA ---
  const [showDeletePurchaseModal, setShowDeletePurchaseModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null); // Guarda {id, identifier}
  const [isDeletingPurchase, setIsDeletingPurchase] = useState(false);
  // --- FIM DOS NOVOS ESTADOS ---

  const [displayTotalAmount, setDisplayTotalAmount] = useState(0);
  const formRef = useRef(null);

  useEffect(() => { // Como no seu código #117
    document.title = 'Gestor App - Compras';
    async function loadPageData() {
      setLoadingFormDataSources(true);
      fetchPurchases(); 
      const suppliersDataPromise = fetchSuppliers();
      const productsDataPromise = fetchProductsForSelect();
      const costCentersDataPromise = fetchCostCentersForSelect();
      try {
        await Promise.all([suppliersDataPromise, productsDataPromise, costCentersDataPromise]);
      } catch (e) { console.error("Erro ao aguardar dados dos selects (Compras):", e); }
      finally { setLoadingFormDataSources(false); }
    }
    loadPageData();
  }, []);

  useEffect(() => { // Como no seu código #117
    const priceStr = String(formData.unit_price).replace(',', '.');
    const qtyStr = String(formData.quantity).replace(',', '.');
    const price = parseFloat(priceStr);
    const qty = parseFloat(qtyStr);
    let total = 0;
    if (!isNaN(price) && !isNaN(qty) && price > 0 && qty > 0) {
      total = price * qty;
    }
    setDisplayTotalAmount(total);
  }, [formData.unit_price, formData.quantity]);

  async function fetchPurchases() { // Como no seu código #117
    setLoadingPurchases(true);
    try {
      setListError(null);
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`*, supplier:merchants!supplier_id(name), product:products!product_id(name), cost_center:cost_centers!cost_center_id(name)`)
        .order('purchase_date', { ascending: false }).order('created_at', { ascending: false });
      if (purchasesError) throw purchasesError;
      if (purchasesData) {
        const purchasesWithPaymentInfo = await Promise.all(
          purchasesData.map(async (purchase) => {
            const { data: payments, error: paymentsError } = await supabase.from('transactions').select('amount').eq('reference_id', purchase.purchase_id).eq('transaction_type', 'Compra');
            if (paymentsError) { console.error(`Erro pagamentos compra ${purchase.purchase_id}:`, paymentsError.message); return { ...purchase, total_paid: 0, payment_status: 'Erro pagamentos' }; }
            const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            let paymentStatus = 'A Pagar';
            const purchaseTotalAmount = parseFloat(purchase.total_amount) || 0;
            if (totalPaid >= purchaseTotalAmount - 0.001 && purchaseTotalAmount > 0) { paymentStatus = 'Pago'; } 
            else if (totalPaid > 0) { paymentStatus = 'Parcial'; }
            return { ...purchase, total_paid: totalPaid, payment_status: paymentStatus };
          })
        );
        setPurchases(purchasesWithPaymentInfo);
      } else { setPurchases([]); }
    } catch (err) { console.error('Erro ao buscar compras:', err.message); setListError(err.message); setPurchases([]);
    } finally { setLoadingPurchases(false); }
  };
  async function fetchSuppliers() { // Como no seu código #117
    try {
      const { data, error } = await supabase.from('merchants').select('merchant_id, name').or('merchant_type.eq.Fornecedor,merchant_type.eq.Ambos').order('name', { ascending: true });
      if (error) throw error; if (data) setSuppliers(data); else setSuppliers([]);
    } catch (err) { console.error('Erro ao buscar fornecedores:', err.message); toast.error('Falha ao carregar fornecedores.'); setSuppliers([]); }
  };
  async function fetchProductsForSelect() { // Como no seu código #117
    try {
      const { data, error } = await supabase.from('products').select('product_id, name, purchase_price').or('product_type.eq.Compra,product_type.eq.Ambos').eq('is_active', true).order('name', { ascending: true });
      if (error) throw error; setProductsList(data || []);
    } catch (err) { console.error('Erro ao buscar produtos:', err.message); toast.error('Falha ao carregar lista de produtos.'); setProductsList([]); }
  };
  async function fetchCostCentersForSelect() { // Como no seu código #117
    try {
      const { data, error } = await supabase.from('cost_centers').select('cost_center_id, name').eq('is_active', true).order('name', { ascending: true });
      if (error) throw error; setCostCentersList(data || []);
    } catch (err) { console.error('Erro ao buscar Centros de Custo:', err.message); toast.error('Falha ao carregar Centros de Custo.'); setCostCentersList([]); }
  };
  const handleInputChange = (event) => { // Como no seu código #117
    const { name, value } = event.target;
    let newFormData = { ...formData, [name]: value };
    if (name === 'product_id') {
      const selectedProduct = productsList.find(p => p.product_id === value);
      if (selectedProduct) { newFormData = { ...newFormData, product_name: selectedProduct.name, unit_price: selectedProduct.purchase_price !== null && selectedProduct.purchase_price !== undefined ? String(selectedProduct.purchase_price) : '',};
      } else { newFormData = { ...newFormData, product_name: '', unit_price: '' };}
    }
    setFormData(newFormData);
  };
  const handlePaymentInputChange = (event) => { // Como no seu código #122 (corrigido)
    const { name, value } = event.target;
    setPaymentFormDataState(prev => ({ ...prev, [name]: value }));
  };
  const resetPurchaseForm = () => { // Como no seu código #117
    const currentCostCenterId = formData.cost_center_id;
    setFormData(initialPurchaseFormData);
    if (currentCostCenterId !== undefined && currentCostCenterId !== '') {
        setFormData(prev => ({ ...initialPurchaseFormData, cost_center_id: currentCostCenterId }));
    }
    setDisplayTotalAmount(0); setIsEditing(false); setCurrentPurchaseId(null);
  };
  const resetPaymentForm = () => { setPaymentFormDataState(initialPaymentFormData); }; // Como no seu código #117
  
  const handleSubmitPurchase = async (event) => { // Como no seu código #117
    event.preventDefault();
    if (!formData.purchase_date) { toast.error('Data da compra é obrigatória.'); return; }
    if (!formData.supplier_id) { toast.error('Fornecedor é obrigatório.'); return; }
    if (!formData.cost_center_id) { toast.error('Centro de Custo é obrigatório.'); return; }
    if (!formData.product_id) { toast.error('Produto do catálogo é obrigatório.'); return; }
    const unitPriceStr = String(formData.unit_price).replace(',', '.');
    const quantityStr = String(formData.quantity).replace(',', '.');
    const unitPrice = parseFloat(unitPriceStr);
    if (unitPriceStr === '' || isNaN(unitPrice) || unitPrice <= 0) { toast.error('Preço unitário deve ser positivo.'); return; }
    const quantity = parseFloat(quantityStr);
    if (quantityStr === '' || isNaN(quantity) || quantity <= 0) { toast.error('Quantidade deve ser positiva.'); return; }
    setIsSubmittingPurchase(true);
    const finalTotalAmount = unitPrice * quantity;
    const dataToSubmit = {
      purchase_date: formData.purchase_date, supplier_id: formData.supplier_id,
      cost_center_id: formData.cost_center_id, product_id: formData.product_id,
      product_name: formData.product_name, unit_price: unitPrice, quantity: quantity,
      total_amount: finalTotalAmount,
      observations: formData.observations.trim() === '' ? null : formData.observations.trim(),
    };
    try {
        let savedPurchase = null; let successMessage = '';
        const selectString = `*, supplier:merchants!supplier_id(name), product:products!product_id(name), cost_center:cost_centers!cost_center_id(name)`;
        if (isEditing && currentPurchaseId) {
            const { data: updated, error } = await supabase.from('purchases').update(dataToSubmit).eq('purchase_id', currentPurchaseId).select(selectString).single();
            if (error) throw error; savedPurchase = updated; successMessage = 'Compra atualizada!';
        } else {
            const { data: created, error } = await supabase.from('purchases').insert([dataToSubmit]).select(selectString).single();
            if (error) throw error; savedPurchase = created; successMessage = 'Compra registrada!';
        }
        if (savedPurchase) { await fetchPurchases(); toast.success(successMessage); resetPurchaseForm(); }
    } catch (err) { console.error(`Erro:`, err.message); toast.error(`Erro: ${err.message}`);
    } finally { setIsSubmittingPurchase(false); }
  };
  const handleEditPurchase = (purchaseToEdit) => { // Como no seu código #117
    setIsEditing(true); setCurrentPurchaseId(purchaseToEdit.purchase_id);
    const purchaseDate = purchaseToEdit.purchase_date ? new Date(purchaseToEdit.purchase_date + 'T00:00:00Z').toISOString().split('T')[0] : '';
    setFormData({
        purchase_date: purchaseDate, supplier_id: purchaseToEdit.supplier_id || '',
        cost_center_id: purchaseToEdit.cost_center_id || '', product_id: purchaseToEdit.product_id || '',
        product_name: purchaseToEdit.product_name || '',
        unit_price: purchaseToEdit.unit_price !== null ? String(purchaseToEdit.unit_price) : '',
        quantity: purchaseToEdit.quantity !== null ? String(purchaseToEdit.quantity) : '',
        observations: purchaseToEdit.observations || '',
    });
    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    toast.info(`Editando compra: ${purchaseToEdit.product_name || 'ID: ' + String(purchaseToEdit.purchase_id).substring(0,6)}...`);
  };
  
  // --- handleDeletePurchase MODIFICADA para usar o ConfirmationModal ---
  const handleDeletePurchase = (purchaseId, purchaseIdentifier) => {
    setPurchaseToDelete({ id: purchaseId, identifier: purchaseIdentifier });
    setShowDeletePurchaseModal(true);
  };

  const confirmDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    setIsDeletingPurchase(true);
    try {
      const { error: deleteTransError } = await supabase
        .from('transactions').delete().eq('reference_id', purchaseToDelete.id).eq('transaction_type', 'Compra');
      if (deleteTransError) {
        toast.error(`Aviso: Pagamentos não excluídos: ${deleteTransError.message}.`);
      }
      const { error } = await supabase.from('purchases').delete().eq('purchase_id', purchaseToDelete.id);
      if (error) throw error;
      
      await fetchPurchases();
      toast.success(`Compra "${purchaseToDelete.identifier}" e pagamentos associados excluídos!`);
    } catch (err) { 
      console.error('Erro ao excluir compra:', err.message); 
      toast.error(`Erro ao excluir compra: ${err.message}`); 
    } finally {
      setShowDeletePurchaseModal(false);
      setPurchaseToDelete(null);
      setIsDeletingPurchase(false);
    }
  };
  // --- FIM DAS MODIFICAÇÕES EM handleDeletePurchase ---
  
  const openPaymentModal = async (purchase) => { setSelectedPurchaseForPayment(purchase); setShowPaymentModal(true); await fetchPaymentsForPurchase(purchase.purchase_id); };
  const closePaymentModal = () => { setShowPaymentModal(false); setSelectedPurchaseForPayment(null); setPaymentsForSelectedPurchase([]); resetPaymentForm();};
  async function fetchPaymentsForPurchase(purchaseId) { 
    if (!purchaseId) return; setLoadingPayments(true);
    try {
      const { data, error } = await supabase.from('transactions').select('*')
        .eq('reference_id', purchaseId).eq('transaction_type', 'Compra')
        .order('payment_date', { ascending: false });
      if (error) throw error; setPaymentsForSelectedPurchase(data || []);
    } catch (err) { console.error('Erro pagamentos compra:', err.message); toast.error('Falha carregar pagamentos.');
    } finally { setLoadingPayments(false); }
  }
  const handleSubmitPayment = async (event) => { // Como no seu código #117
    event.preventDefault(); if (!selectedPurchaseForPayment) return;
    const paymentAmountStr = String(paymentFormData.amount).replace(',', '.');
    const paymentAmount = parseFloat(paymentAmountStr);
    if (paymentAmountStr === '' || isNaN(paymentAmount) || paymentAmount <= 0) { toast.error('Valor positivo obrigatório.'); return; }
    if (!paymentFormData.payment_date) { toast.error('Data do pagamento obrigatória.'); return; }
    if (!paymentFormData.payment_method) { toast.error('Método de pagamento obrigatório.'); return; }
    setIsSubmittingPayment(true);
    const paymentDataToSubmit = {
      reference_id: selectedPurchaseForPayment.purchase_id, transaction_type: 'Compra',
      payment_date: paymentFormData.payment_date, payment_method: paymentFormData.payment_method,
      amount: paymentAmount,
      observations: paymentFormData.observations.trim() === '' ? null : paymentFormData.observations.trim(),
    };
    try {
      const { data: newPayment, error } = await supabase.from('transactions').insert([paymentDataToSubmit]).select().single();
      if (error) throw error;
      if (newPayment) {
        toast.success('Pagamento (compra) registrado!');
        await fetchPaymentsForPurchase(selectedPurchaseForPayment.purchase_id); 
        resetPaymentForm();
        await fetchPurchases(); 
      }
    } catch (err) { console.error('Erro pag. compra:', err.message); toast.error(`Erro pag.: ${err.message}`);
    } finally { setIsSubmittingPayment(false); }
  };
  const getPaymentStatusStyle = (status) => { // Como no seu código #117
    let style = { marginLeft: '10px', padding: '3px 8px', fontSize: '0.8em', borderRadius: '4px', color: 'white', border: '1px solid' };
    switch (status) {
      case 'Pago': style.backgroundColor = '#28a745'; style.borderColor = '#1e7e34'; break;
      case 'Parcial': style.backgroundColor = '#ffc107'; style.color = '#333'; style.borderColor = '#e0a800'; break;
      case 'A Pagar': style.backgroundColor = '#dc3545'; style.borderColor = '#b02a37'; break;
      default: style.backgroundColor = '#6c757d'; style.borderColor = '#545b62';
    }
    return style;
  };

  if ((loadingPurchases && purchases.length === 0) || loadingFormDataSources) {
    return <p style={{ padding: '20px' }}>Carregando dados da página de compras...</p>;
  }
  if (listError && purchases.length === 0) { 
    return <p style={{ color: 'red', padding: '20px' }}>Erro ao carregar compras: {listError}</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* CSS PARA A TABELA RESPONSIVA DE COMPRAS (do seu código #117) */}
      <style>{`
        .responsive-table-purchases { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; }
        .responsive-table-purchases thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-purchases th, .responsive-table-purchases td { padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; }
        .responsive-table-purchases th { font-weight: bold; }
        .responsive-table-purchases tbody tr { background-color: #fff; }
        .responsive-table-purchases tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-purchases tbody tr:hover { background-color: #e2e6ea; }
        .responsive-table-purchases .actions-cell { text-align: center; min-width: 220px; }
        .responsive-table-purchases .actions-cell div { justify-content: center; }
        .responsive-table-purchases .currency-cell { text-align: right; }
        @media screen and (max-width: 900px) {
          .responsive-table-purchases thead { display: none; }
          .responsive-table-purchases tr { display: block; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .responsive-table-purchases td { display: block; text-align: right; padding-left: 45%; position: relative; border-bottom: 1px dotted #eee; }
          .responsive-table-purchases td:last-child { border-bottom: none; }
          .responsive-table-purchases td::before { content: attr(data-label); position: absolute; left: 10px; width: calc(45% - 20px); padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; }
          .responsive-table-purchases td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-purchases td.actions-cell::before { content: "Ações:"; }
          .responsive-table-purchases td.actions-cell div { flex-direction: row; gap: 5px !important; }
          .responsive-table-purchases td.currency-cell { text-align: right; padding-left: 50%; }
          .responsive-table-purchases td.currency-cell::before { width: calc(50% - 20px); }
        }
      `}</style>

      <h1>Registro de Compras</h1>
      
      {/* Formulário (JSX como no seu código #117, com o input de product_name ajustado para readOnly) */}
      <form onSubmit={handleSubmitPurchase} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? `Editar Compra #${currentPurchaseId ? String(currentPurchaseId).substring(0,6)+'...' : ''}` : 'Nova Compra'}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="purchase_date">Data Compra: *</label><input type="date" id="purchase_date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} required style={inputStyle}/></div>
          <div><label htmlFor="supplier_id">Fornecedor: *</label><select id="supplier_id" name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} required style={selectStyle} disabled={loadingFormDataSources || suppliers.length === 0}><option value="">{loadingFormDataSources ? 'Carregando...' : (suppliers.length === 0 ? 'Nenhum fornecedor' : 'Selecione Fornecedor...')}</option>{suppliers.map(s=><option key={s.merchant_id} value={s.merchant_id}>{s.name}</option>)}</select></div>
          <div><label htmlFor="cost_center_id">Centro de Custo: *</label><select id="cost_center_id" name="cost_center_id" value={formData.cost_center_id} onChange={handleInputChange} required style={selectStyle} disabled={loadingFormDataSources || costCentersList.length === 0}><option value="">{loadingFormDataSources ? 'Carregando...' : (costCentersList.length === 0 ? 'Nenhum CC' : 'Selecione CC...')}</option>{costCentersList.map(cc=><option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}</select></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label htmlFor="product_id">Produto/Serviço (Catálogo): *</label>
            <select id="product_id" name="product_id" value={formData.product_id} onChange={handleInputChange} required style={selectStyle} disabled={loadingFormDataSources || productsList.length === 0}>
              <option value="">{loadingFormDataSources ? 'Carregando...' : (productsList.length === 0 ? 'Nenhum produto' : 'Selecione Produto...')}</option>
              {productsList.map(product => ( <option key={product.product_id} value={product.product_id}>{product.name} {product.purchase_price ? `(Custo: R$ ${parseFloat(product.purchase_price).toFixed(2)})` : ''}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="product_name_display_purchase">Nome Produto/Serviço (nesta compra):</label>
            <input type="text" id="product_name_display_purchase" value={formData.product_name} readOnly style={readOnlyStyle} placeholder="Selecione um produto do catálogo" />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="unit_price">Preço Unit. (nesta compra): *</label><input type="number" id="unit_price" name="unit_price" value={formData.unit_price} onChange={handleInputChange} required min="0.01" step="any" placeholder="0.00" style={inputStyle}/></div>
          <div><label htmlFor="quantity">Quantidade: *</label><input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0.01" step="any" placeholder="0.00" style={inputStyle}/></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div><label>Valor Total da Compra:</label><input type="text" value={`R$ ${displayTotalAmount.toFixed(2)}`} readOnly style={readOnlyStyle}/></div>
            <div></div>
        </div>
        
        <div style={{ marginBottom: '20px' }}><label htmlFor="observations">Observações:</label><textarea id="observations" name="observations" value={formData.observations} onChange={handleInputChange} rows="3" style={textareaStyle}/></div>
        
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button type="submit" disabled={isSubmittingPurchase || loadingFormDataSources} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1, fontSize: '1rem' }}>
            {isSubmittingPurchase ? (isEditing ? 'Salvando...' : 'Registrando...') : (isEditing ? 'Salvar Alterações' : 'Registrar Compra')}
            </button>
            {isEditing && (
            <button type="button" onClick={resetPurchaseForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar Edição
            </button>
            )}
        </div>
      </form>

      <h2>Compras Registradas</h2>
      {loadingPurchases && purchases.length > 0 && <p>Atualizando lista de compras...</p>}
      {purchases.length === 0 && !loadingPurchases ? ( <p>Nenhuma compra registrada ainda.</p> ) : (
        <table className="responsive-table-purchases">
          <thead>
            <tr>
              <th>Data</th><th>Fornecedor</th><th>Produto</th><th className="currency-cell">Total</th><th>Status Pag.</th><th className="currency-cell">Saldo</th><th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => {
              const saldoAPagar = parseFloat(purchase.total_amount) - (purchase.total_paid || 0);
              const purchaseIdentifier = `${purchase.product_name} (${new Date(purchase.purchase_date + 'T00:00:00Z').toLocaleDateString()})`;
              return (
              <tr key={purchase.purchase_id}>
                <td data-label="Data">{new Date(purchase.purchase_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Fornecedor">{purchase.supplier?.name || 'N/A'}</td>
                <td data-label="Produto">{purchase.product_name} {purchase.cost_center?.name && <span style={{fontSize: '0.8em', color: '#777'}}> (CC: {purchase.cost_center.name})</span>}</td>
                <td data-label="Total" className="currency-cell">R$ {parseFloat(purchase.total_amount).toFixed(2)}</td>
                <td data-label="Status Pag."><span style={getPaymentStatusStyle(purchase.payment_status)}>{purchase.payment_status}</span></td>
                <td data-label="Saldo" className="currency-cell" style={{color: saldoAPagar > 0.005 ? '#dc3545' : '#28a745', fontWeight: 'bold'}}>R$ {saldoAPagar.toFixed(2)}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap'}}>
                      <button onClick={() => openPaymentModal(purchase)} style={{ padding: '6px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Pagamentos</button>
                      <button onClick={() => handleEditPurchase(purchase)} style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Editar</button>
                      {/* MODIFICADO: Botão de excluir agora chama handleDeletePurchase que abrirá o modal */}
                      <button onClick={() => handleDeletePurchase(purchase.purchase_id, purchaseIdentifier)} style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', marginBottom: '5px' }}>Excluir</button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      )}

      {/* Modal de Pagamentos para Compras (COMO NO SEU CÓDIGO DA MENSAGEM #117) */}
      {showPaymentModal && selectedPurchaseForPayment && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', color: '#333' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3 style={{margin: 0}}>Pagamentos da Compra: {selectedPurchaseForPayment.product_name} (Total: R$ {parseFloat(selectedPurchaseForPayment.total_amount).toFixed(2)})</h3>
                <button onClick={closePaymentModal} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#333'}}>&times;</button>
            </div>
            <form onSubmit={handleSubmitPayment} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h4>Registrar Novo Pagamento (Compra)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div><label>Data Pag.: *</label><input type="date" name="payment_date" value={paymentFormData.payment_date} onChange={handlePaymentInputChange} required style={inputStyle}/></div>
                <div><label>Valor Pago: *</label><input type="number" name="amount" value={paymentFormData.amount} onChange={handlePaymentInputChange} required min="0.01" step="any" placeholder="0.00" style={inputStyle}/></div>
              </div>
              <div><label>Método Pag.: *</label><select name="payment_method" value={paymentFormData.payment_method} onChange={handlePaymentInputChange} required style={selectStyle}>{paymentMethods.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
              <div style={{marginTop: '10px'}}><label>Obs. Pagamento:</label><textarea name="observations" value={paymentFormData.observations} onChange={handlePaymentInputChange} rows="2" style={textareaStyle}/></div>
              <button type="submit" disabled={isSubmittingPayment} style={{ marginTop: '15px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {isSubmittingPayment ? 'Registrando...' : 'Registrar Pagamento'}
              </button>
            </form>
            <h4>Pagamentos Registrados</h4>
            {loadingPayments && <p>Carregando pagamentos...</p>}
            {!loadingPayments && paymentsForSelectedPurchase.length === 0 && <p>Nenhum pagamento.</p>}
            {paymentsForSelectedPurchase.length > 0 && ( <ul style={{listStyle: 'none', padding: 0}}>{paymentsForSelectedPurchase.map(p => (<li key={p.transaction_id} style={{padding: '8px 0', borderBottom: '1px solid #eee'}}> Data: {new Date(p.payment_date + 'T00:00:00Z').toLocaleDateString()} | Método: {p.payment_method} | Valor: R$ {parseFloat(p.amount).toFixed(2)}{p.observations && <em style={{display: 'block', fontSize: '0.9em', color: '#666'}}>Obs: {p.observations}</em>}</li>))}</ul>)}
            <hr style={{margin: '20px 0'}}/>
            <strong style={{fontSize: '1.1em'}}>Saldo a Pagar: R$ {(parseFloat(selectedPurchaseForPayment.total_amount) - paymentsForSelectedPurchase.reduce((sum, p) => sum + parseFloat(p.amount), 0)).toFixed(2)}</strong>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO PARA EXCLUIR COMPRA */}
      <ConfirmationModal
        isOpen={showDeletePurchaseModal}
        onClose={() => setShowDeletePurchaseModal(false)}
        onConfirm={confirmDeletePurchase}
        title="Confirmar Exclusão de Compra"
        message={
            purchaseToDelete ? 
            <>Deseja realmente excluir a Compra de <strong>{purchaseToDelete.identifier}</strong>? Pagamentos associados também serão excluídos.</> 
            : "Deseja realmente excluir esta compra?"
        }
        confirmText="Excluir Compra"
        cancelText="Cancelar"
        isLoading={isDeletingPurchase}
      />
    </div>
  );
}

export default PurchasesPage;