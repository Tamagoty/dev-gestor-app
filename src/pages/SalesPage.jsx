// src/pages/SalesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

// Estilos
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };
const readOnlyStyle = { ...inputStyle, backgroundColor: '#444', cursor: 'default' };

// --- ÍCONES SVG PARA AÇÕES ---
const PaymentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
// --- FIM DOS ÍCONES SVG ---

// --- COMPONENTE BARRA DE PROGRESSO DO PAGAMENTO ---
const PaymentProgressBar = ({ paid, total }) => {
  const paidValue = parseFloat(paid) || 0;
  const totalValue = parseFloat(total) || 0;
  let percentage = 0;
  let barColor = '#e9ecef'; 
  let borderColor = '#ced4da'; 
  let textColor = '#495057'; 

  if (totalValue > 0) {
    percentage = Math.min((paidValue / totalValue) * 100, 100);
    if (paidValue === 0) {
      borderColor = '#dc3545'; 
      barColor = 'transparent'; 
      textColor = '#dc3545'; 
    } else if (percentage >= 99.9) { 
      borderColor = '#28a745'; 
      barColor = '#28a745';    
      textColor = '#fff';       
    } else { 
      borderColor = '#007bff'; 
      barColor = '#007bff';    
      textColor = '#fff';       
    }
  } else if (totalValue === 0 && paidValue === 0) { 
    percentage = 100; 
    borderColor = '#28a745';
    barColor = '#28a745';
    textColor = '#fff';
  }

  const barContainerStyle = {
    width: '100%', height: '22px', backgroundColor: '#f8f9fa', 
    borderRadius: '4px', border: `1px solid ${borderColor}`,
    overflow: 'hidden', position: 'relative', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  };
  const barFillStyle = {
    height: '100%', width: `${percentage}%`, backgroundColor: barColor,
    transition: 'width 0.4s ease-in-out',
  };
  const textStyle = {
    position: 'absolute', width: '100%', textAlign: 'center',
    fontSize: '0.75rem', fontWeight: 'bold', color: textColor,
    lineHeight: '20px', padding: '0 3px', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
  };

  return (
    <div style={barContainerStyle} title={`Pago: R$ ${paidValue.toFixed(2)} de R$ ${totalValue.toFixed(2)}`}>
      <div style={barFillStyle}></div>
      <span style={textStyle}>
        R$ {paidValue.toFixed(2)} / R$ {totalValue.toFixed(2)}
      </span>
    </div>
  );
};
// --- FIM DA BARRA DE PROGRESSO ---

const initialSaleHeaderFormData = {
  sale_date: new Date().toISOString().split('T')[0],
  customer_id: '',
  salesperson_id: '',
  cost_center_id: '', 
  commission_percentage: '',
  observations: '',
};
const initialSaleItemFormData = {
  product_id: '',
  product_name: '', 
  unit_price: '',   
  quantity: '1',    
  item_total_amount: 0,
};
const initialPaymentFormData = {
    payment_date: new Date().toISOString().split('T')[0], payment_method: 'Dinheiro',
    amount: '', observations: ''
};
const paymentMethods = ["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Transferência Bancária", "Boleto"];

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [listError, setListError] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormDataSources, setLoadingFormDataSources] = useState(true);

  const [saleHeaderFormData, setSaleHeaderFormData] = useState(initialSaleHeaderFormData);
  const [currentItemFormData, setCurrentItemFormData] = useState(initialSaleItemFormData);
  const [currentSaleItems, setCurrentSaleItems] = useState([]);
  
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSaleId, setCurrentSaleId] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState(null);
  const [paymentsForSelectedSale, setPaymentsForSelectedSale] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFormData, setPaymentFormDataState] = useState(initialPaymentFormData);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [showDeleteSaleModal, setShowDeleteSaleModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [isDeletingSale, setIsDeletingSale] = useState(false);

  const [displayOverallTotalAmount, setDisplayOverallTotalAmount] = useState(0);
  const [displayOverallCommissionValue, setDisplayOverallCommissionValue] = useState(0);
  const [filterTextSales, setFilterTextSales] = useState('');

  const saleHeaderFormRef = useRef(null); 
  const addItemFormRef = useRef(null); 

  useEffect(() => { 
    document.title = 'Gestor App - Vendas';
    async function loadPageData() {
      setLoadingFormDataSources(true);
      const customersDataPromise = fetchCustomers();
      const salespeopleDataPromise = fetchSalespeople();
      const productsDataPromise = fetchProductsForSelect();
      const costCentersDataPromise = fetchCostCentersForSelect();
      try {
        await Promise.all([customersDataPromise, salespeopleDataPromise, productsDataPromise, costCentersDataPromise]);
      } catch (e) { console.error("Erro ao carregar dados para selects:", e); }
      finally { 
        setLoadingFormDataSources(false); 
      }
    }
    loadPageData();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [filterTextSales]); 

  useEffect(() => { 
    const priceStr = String(currentItemFormData.unit_price).replace(',', '.');
    const qtyStr = String(currentItemFormData.quantity).replace(',', '.');
    const price = parseFloat(priceStr);
    const qty = parseFloat(qtyStr);
    let itemTotal = 0;
    if (!isNaN(price) && !isNaN(qty) && price >= 0 && qty > 0) { itemTotal = price * qty; }
    setCurrentItemFormData(prev => ({ ...prev, item_total_amount: itemTotal }));
  }, [currentItemFormData.unit_price, currentItemFormData.quantity]);

  useEffect(() => { 
    const overallTotal = currentSaleItems.reduce((sum, item) => sum + parseFloat(item.item_total_amount || 0), 0);
    setDisplayOverallTotalAmount(overallTotal);
    const commissionPercStr = String(saleHeaderFormData.commission_percentage).replace(',', '.');
    const commissionPerc = parseFloat(commissionPercStr);
    let commissionVal = 0;
    if (!isNaN(commissionPerc) && commissionPerc >= 0 && commissionPerc <= 100 && overallTotal > 0) {
      commissionVal = (overallTotal * commissionPerc) / 100;
    }
    setDisplayOverallCommissionValue(commissionVal);
  }, [currentSaleItems, saleHeaderFormData.commission_percentage]);

  const saleHeaderBaseSelectString = `
    sale_id, sale_date, overall_total_amount, observations, 
    sale_display_id, sale_year, sale_number_in_year, 
    customer_id, salesperson_id, cost_center_id, 
    commission_percentage, commission_value, created_at,
    customer:merchants(name), 
    salesperson:salespeople(name),
    cost_center:cost_centers(name)
  `;

  async function fetchSales() {
    setLoadingSales(true);
    try {
      setListError(null);
      let query = supabase
        .from('sales')
        .select(saleHeaderBaseSelectString);

      if (filterTextSales.trim() !== '') {
        const searchTerm = `%${filterTextSales.trim()}%`;
        query = query.or(
          `sale_display_id.ilike.${searchTerm},` + 
          `observations.ilike.${searchTerm},` +
          `merchants.name.ilike.${searchTerm},` + 
          `cost_centers.name.ilike.${searchTerm}`
        );
      }

      query = query
        .order('sale_year', { ascending: false })
        .order('sale_number_in_year', { ascending: false })
        .order('sale_date', { ascending: false }) 
        .order('created_at', { ascending: false });

      const { data: salesData, error: salesError } = await query;
      if (salesError) throw salesError;

      if (salesData) {
        const salesWithDetails = await Promise.all(
          salesData.map(async (sale) => {
            const { data: payments, error: paymentsError } = await supabase
              .from('transactions').select('amount').eq('reference_id', sale.sale_id).eq('transaction_type', 'Venda');
            if (paymentsError) console.error(`Erro pagamentos venda ${sale.sale_id}:`, paymentsError.message);
            const totalPaid = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
            
            const { data: items, error: itemsError } = await supabase
              .from('sale_items').select('product_name_at_sale').eq('sale_id', sale.sale_id).limit(1);
            if(itemsError) console.error(`Erro ao buscar item para venda ${sale.sale_id}:`, itemsError.message);
            const firstProductName = items && items.length > 0 ? items[0].product_name_at_sale : 'Itens Diversos';
            
            return { ...sale, total_paid: totalPaid, first_product_name: firstProductName };
          })
        );
        setSales(salesWithDetails);
      } else { setSales([]); }
    } catch (err) { 
      console.error('Erro ao buscar vendas:', err.message); 
      setListError(err.message); 
      setSales([]);
    } finally { setLoadingSales(false); }
  }

  async function fetchCustomers() {
    try {
      const { data, error } = await supabase.from('merchants').select('merchant_id, name').or('merchant_type.eq.Cliente,merchant_type.eq.Ambos').order('name', { ascending: true });
      if (error) throw error; if (data) setCustomers(data); else setCustomers([]);
    } catch (err) { console.error('Erro ao buscar clientes:', err.message); toast.error('Falha ao carregar clientes.'); setCustomers([]); }
  }
  async function fetchSalespeople() {
    try {
      const { data, error } = await supabase
        .from('salespeople')
        .select('salesperson_id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error; 
      setSalespeople(data || []);
    } catch (err) { 
      console.error('Erro ao buscar vendedores:', err.message); 
      toast.error('Falha ao carregar vendedores.'); 
      setSalespeople([]); 
    }
  }
  async function fetchProductsForSelect() {
    try {
      const { data, error } = await supabase
        .from('products').select('product_id, name, sale_price')
        .or('product_type.eq.Venda,product_type.eq.Ambos')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      setProductsList(data || []);
    } catch (err) { console.error('Erro ao buscar produtos:', err.message); toast.error('Falha ao carregar produtos.'); setProductsList([]); }
  }
  async function fetchCostCentersForSelect() {
    try {
      const { data, error } = await supabase
        .from('cost_centers').select('cost_center_id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      setCostCentersList(data || []);
    } catch (err) { console.error('Erro ao buscar Centros de Custo:', err.message); toast.error('Falha ao carregar Centros de Custo.'); setCostCentersList([]); }
  }
  
  const handleHeaderInputChange = (event) => {
    const { name, value } = event.target;
    setSaleHeaderFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemInputChange = (event) => {
    const { name, value } = event.target;
    let newFormData = { ...currentItemFormData, [name]: value };
    if (name === 'product_id') {
      const selectedProduct = productsList.find(p => p.product_id === value);
      if (selectedProduct) {
        newFormData = { ...newFormData, product_name: selectedProduct.name, unit_price: selectedProduct.sale_price !== null && selectedProduct.sale_price !== undefined ? String(selectedProduct.sale_price) : '0', quantity: '1'};
      } else { newItemData = { ...initialSaleItemFormData };}
    }
    setCurrentItemFormData(newFormData);
  };
  
  const handleAddItemToSale = () => {
    if (!currentItemFormData.product_id) { toast.error('Selecione um produto para o item.'); return; }
    const quantity = parseFloat(String(currentItemFormData.quantity).replace(',','.'));
    if (isNaN(quantity) || quantity <= 0) { toast.error('Quantidade do item deve ser um número positivo.'); return; }
    const unitPrice = parseFloat(String(currentItemFormData.unit_price).replace(',','.'));
    if (String(currentItemFormData.unit_price).trim() === '' || isNaN(unitPrice) || unitPrice < 0) { 
      toast.error('Preço unitário do item deve ser um número válido (pode ser zero).'); return; 
    }
    const newItem = {
      product_id: currentItemFormData.product_id,
      product_name_at_sale: currentItemFormData.product_name,
      unit_price_at_sale: unitPrice, quantity: quantity,
      item_total_amount: parseFloat((unitPrice * quantity).toFixed(2))
    };
    setCurrentSaleItems(prevItems => [...prevItems, newItem]);
    setCurrentItemFormData(initialSaleItemFormData); 
    if (addItemFormRef.current) addItemFormRef.current.querySelector('select[name="product_id"]')?.focus();
  };

  const handleRemoveItemFromSale = (indexToRemove) => {
    setCurrentSaleItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };
  
  const resetAllForms = () => { 
    const currentCostCenterId = saleHeaderFormData.cost_center_id;
    setSaleHeaderFormData(initialSaleHeaderFormData);
    if (currentCostCenterId !== undefined && currentCostCenterId !== '') {
        setSaleHeaderFormData(prev => ({ ...initialSaleHeaderFormData, cost_center_id: currentCostCenterId }));
    }
    setCurrentSaleItems([]); 
    setCurrentItemFormData(initialSaleItemFormData); 
    setIsEditing(false);
    setCurrentSaleId(null);
  };
  
  const handlePaymentInputChange = (event) => {
    const { name, value } = event.target;
    setPaymentFormDataState(prev => ({ ...prev, [name]: value }));
  };
  
  const resetPaymentForm = () => { setPaymentFormDataState(initialPaymentFormData); };

  // << FUNÇÃO handleFilterSalesChange DEFINIDA >>
  const handleFilterSalesChange = (event) => {
    setFilterTextSales(event.target.value);
  };

  const handleSubmitSale = async (event) => {
    event.preventDefault();
    if (!saleHeaderFormData.sale_date) { toast.error('Data da venda é obrigatória.'); return; }
    if (!saleHeaderFormData.customer_id) { toast.error('Cliente é obrigatório.'); return; }
    if (!saleHeaderFormData.salesperson_id) { toast.error('Vendedor é obrigatório.'); return; }
    if (!saleHeaderFormData.cost_center_id) { toast.error('Centro de Custo é obrigatório.'); return; }
    if (currentSaleItems.length === 0 && !isEditing) { toast.error('Adicione pelo menos um produto à venda.'); return; }

    let commissionPercentage = null;
    const commissionPercentageStr = String(saleHeaderFormData.commission_percentage).replace(',', '.');
    if (commissionPercentageStr !== '') {
        commissionPercentage = parseFloat(commissionPercentageStr);
        if (isNaN(commissionPercentage) || commissionPercentage < 0 || commissionPercentage > 100) {
            toast.error('Percentual de comissão deve ser entre 0 e 100, ou vazio.'); return;
        }
    }

    setIsSubmittingSale(true);
    const finalOverallTotal = displayOverallTotalAmount;
    const finalCommissionValue = displayOverallCommissionValue;

    const saleHeaderDataToSubmit = {
      sale_date: saleHeaderFormData.sale_date,
      customer_id: saleHeaderFormData.customer_id,
      salesperson_id: saleHeaderFormData.salesperson_id,
      cost_center_id: saleHeaderFormData.cost_center_id,
      overall_total_amount: finalOverallTotal,
      commission_percentage: commissionPercentage,
      commission_value: commissionPercentage !== null ? finalCommissionValue : null,
      observations: saleHeaderFormData.observations.trim() === '' ? null : saleHeaderFormData.observations.trim(),
    };

    try {
      let saleIdToUse = currentSaleId;
      let successMessage = '';
      let saleDisplayIdForToast = '';
      const selectReturnString = `sale_id, sale_display_id`;

      if (isEditing && currentSaleId) {
        const { data: updatedSaleHeader, error: updateHeaderError } = await supabase
          .from('sales').update(saleHeaderDataToSubmit).eq('sale_id', currentSaleId)
          .select(selectReturnString).single();
        if (updateHeaderError) throw updateHeaderError;
        
        saleIdToUse = updatedSaleHeader.sale_id;
        saleDisplayIdForToast = updatedSaleHeader.sale_display_id;
        successMessage = `Venda #${saleDisplayIdForToast} atualizada!`;
        
        const { error: deleteItemsError } = await supabase.from('sale_items').delete().eq('sale_id', currentSaleId);
        if (deleteItemsError) throw deleteItemsError;
      } else {
        const { data: newSaleHeader, error: insertHeaderError } = await supabase
          .from('sales').insert([saleHeaderDataToSubmit]).select(selectReturnString).single();
        if (insertHeaderError) throw insertHeaderError;
        saleIdToUse = newSaleHeader.sale_id;
        saleDisplayIdForToast = newSaleHeader.sale_display_id;
        successMessage = `Venda #${saleDisplayIdForToast} registrada!`;
      }

      if (saleIdToUse) {
        const saleItemsToSubmit = currentSaleItems.map(item => ({
          sale_id: saleIdToUse, product_id: item.product_id,
          product_name_at_sale: item.product_name_at_sale, unit_price_at_sale: item.unit_price_at_sale,
          quantity: item.quantity, item_total_amount: item.item_total_amount,
        }));

        if (saleItemsToSubmit.length > 0) {
          const { error: insertItemsError } = await supabase.from('sale_items').insert(saleItemsToSubmit);
          if (insertItemsError) {
            if (!isEditing) { await supabase.from('sales').delete().eq('sale_id', saleIdToUse); }
            throw new Error(`Falha ao salvar itens: ${insertItemsError.message}.${!isEditing ? ' Venda revertida.' : ''}`);
          }
        }
        await fetchSales(); 
        toast.success(successMessage);
        resetAllForms();
      }
    } catch (err) {
        console.error(`Erro ao salvar venda:`, err.message);
        toast.error(`Erro: ${err.message}`);
    } finally {
        setIsSubmittingSale(false);
    }
  };
  
  const handleEditSale = async (saleToEdit) => {
    setIsEditing(true); setCurrentSaleId(saleToEdit.sale_id);
    const saleDate = saleToEdit.sale_date ? new Date(saleToEdit.sale_date + 'T00:00:00Z').toISOString().split('T')[0] : '';
    setSaleHeaderFormData({
        sale_date: saleDate, customer_id: saleToEdit.customer_id || '',
        salesperson_id: saleToEdit.salesperson_id || '', cost_center_id: saleToEdit.cost_center_id || '',
        commission_percentage: saleToEdit.commission_percentage !== null ? String(saleToEdit.commission_percentage) : '',
        observations: saleToEdit.observations || '',
    });
    toast.loading('Carregando itens da venda...');
    const { data: items, error: itemsError } = await supabase.from('sale_items').select('*').eq('sale_id', saleToEdit.sale_id);
    toast.dismiss();
    if (itemsError) { toast.error('Falha ao carregar itens para edição.'); setCurrentSaleItems([]); }
    else { setCurrentSaleItems(items.map(item => ({ product_id: item.product_id, product_name_at_sale: item.product_name_at_sale, unit_price: String(item.unit_price_at_sale), quantity: String(item.quantity), item_total_amount: item.item_total_amount, sale_item_id: item.sale_item_id }))); }
    if (saleHeaderFormRef.current) { saleHeaderFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    toast(`Editando Venda ${saleToEdit.sale_display_id || ('#' + String(saleToEdit.sale_id).substring(0,6))}...`);
  };

  const handleDeleteSale = (saleId, saleIdentifier) => {
    setSaleToDelete({ id: saleId, identifier: saleIdentifier });
    setShowDeleteSaleModal(true);
  };

  const confirmDeleteSale = async () => {
    if (!saleToDelete) return;
    setIsDeletingSale(true);
    try {
      const { error: deleteTransError } = await supabase.from('transactions').delete().eq('reference_id', saleToDelete.id).eq('transaction_type', 'Venda');
      if (deleteTransError) {
        toast.error(`Aviso: Não foi possível excluir pagamentos: ${deleteTransError.message}.`);
      }
      const { error } = await supabase.from('sales').delete().eq('sale_id', saleToDelete.id);
      if (error) throw error;
      await fetchSales(); 
      toast.success(`Venda "${saleToDelete.identifier}" e dados associados foram excluídos!`);
    } catch (err) { 
      console.error('Erro excluir venda:', err.message); 
      toast.error(`Erro ao excluir venda: ${err.message}`); 
    } finally {
      setShowDeleteSaleModal(false);
      setSaleToDelete(null);
      setIsDeletingSale(false);
    }
  };
  
  const openPaymentModal = async (sale) => { setSelectedSaleForPayment(sale); setShowPaymentModal(true); await fetchPaymentsForSaleInternal(sale.sale_id); };
  const closePaymentModal = () => { setShowPaymentModal(false); setSelectedSaleForPayment(null); setPaymentsForSelectedSale([]); resetPaymentForm();};
  async function fetchPaymentsForSaleInternal(saleId) { 
    if (!saleId) return; setLoadingPayments(true);
    try {
      const { data, error } = await supabase.from('transactions').select('*').eq('reference_id', saleId).eq('transaction_type', 'Venda').order('payment_date', { ascending: false });
      if (error) throw error; setPaymentsForSelectedSale(data || []);
    } catch (err) { console.error('Erro pagamentos:', err.message); toast.error('Falha carregar pagamentos.');
    } finally { setLoadingPayments(false); }
  }
  const handleSubmitPayment = async (event) => { 
    event.preventDefault(); if (!selectedSaleForPayment) return;
    const paymentAmountStr = String(paymentFormData.amount).replace(',', '.');
    const paymentAmount = parseFloat(paymentAmountStr);
    if (paymentAmountStr === '' || isNaN(paymentAmount) || paymentAmount <= 0) { toast.error('Valor do pagamento deve ser positivo.'); return; }
    if (!paymentFormData.payment_date) { toast.error('Data do pagamento é obrigatória.'); return; }
    if (!paymentFormData.payment_method) { toast.error('Método de pagamento é obrigatório.'); return; }
    setIsSubmittingPayment(true);
    const paymentDataToSubmit = {
      reference_id: selectedSaleForPayment.sale_id, transaction_type: 'Venda',
      payment_date: paymentFormData.payment_date, payment_method: paymentFormData.payment_method,
      amount: paymentAmount,
      observations: paymentFormData.observations.trim() === '' ? null : paymentFormData.observations.trim(),
    };
    try {
      const { data: newPayment, error } = await supabase.from('transactions').insert([paymentDataToSubmit]).select().single();
      if (error) throw error;
      if (newPayment) {
        toast.success('Pagamento registrado!');
        await fetchPaymentsForSaleInternal(selectedSaleForPayment.sale_id); 
        resetPaymentForm();
        await fetchSales(); 
      }
    } catch (err) { console.error('Erro pag.:', err.message); toast.error(`Erro pag.: ${err.message}`);
    } finally { setIsSubmittingPayment(false); }
  };
  // getPaymentStatusStyle não é mais necessária

  if ((loadingSales && sales.length === 0 && !filterTextSales) || loadingFormDataSources) {
    return <p style={{ padding: '20px' }}>Carregando dados da página de vendas...</p>;
  }
  if (listError && sales.length === 0 && !filterTextSales) { 
    return <p style={{ color: 'red', padding: '20px' }}>Erro ao carregar vendas: {listError}</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .responsive-table-sales { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; }
        .responsive-table-sales thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-sales th, .responsive-table-sales td { padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; vertical-align: middle; }
        .responsive-table-sales th { font-weight: bold; }
        .responsive-table-sales tbody tr { background-color: #fff; }
        .responsive-table-sales tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-sales tbody tr:hover { background-color: #e2e6ea; }
        .responsive-table-sales .actions-cell { text-align: center; min-width: 180px; }
        .responsive-table-sales .actions-cell div { display: flex; justify-content: center; gap: 8px; }
        .responsive-table-sales .currency-cell { text-align: right; }
        .responsive-table-sales .status-cell { min-width: 150px; }
        @media screen and (max-width: 900px) {
          .responsive-table-sales thead { display: none; }
          .responsive-table-sales tr { display: block; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .responsive-table-sales td { display: block; text-align: right; padding-left: 45%; position: relative; border-bottom: 1px dotted #eee; }
          .responsive-table-sales td:last-child { border-bottom: none; }
          .responsive-table-sales td::before { content: attr(data-label); position: absolute; left: 10px; width: calc(45% - 20px); padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; }
          .responsive-table-sales td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-sales td.actions-cell::before { content: "Ações:"; }
          .responsive-table-sales td.actions-cell div { flex-direction: row; gap: 8px !important; justify-content: flex-end; }
          .responsive-table-sales td.currency-cell { text-align: right; padding-left: 50%; }
          .responsive-table-sales td.currency-cell::before { width: calc(50% - 20px); }
          .responsive-table-sales td.status-cell { padding-left: 10px; text-align: left; }
          .responsive-table-sales td.status-cell::before { width: auto; position: static; font-weight: bold; display: block; margin-bottom: 5px; text-align: left;}
        }
        .item-list-table { width: 100%; margin-top: 15px; border-collapse: collapse; margin-bottom: 20px; }
        .item-list-table th, .item-list-table td { border: 1px solid #ccc; padding: 8px; text-align: left; color: #333; }
        .item-list-table th { background-color: #f0f0f0; }
        .item-list-table input[type="number"] { width: 80px; padding: 5px; font-size: 0.9em; }
        .item-list-table .action-cell { width: 80px; text-align: center; }
        .filter-container-sales { margin-bottom: 20px; margin-top: 10px; }
        .filter-input-sales { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; color: #333; background-color: #fff; }
      `}</style>

      <h1>Registro de Vendas</h1>
      
      <form onSubmit={handleSubmitSale} ref={saleHeaderFormRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? `Editar Venda ${currentSaleId ? `#${(sales.find(s=>s.sale_id === currentSaleId)?.sale_display_id || String(currentSaleId).substring(0,6)+'...')}` : ''}` : 'Nova Venda'}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="sale_date_header">Data Venda: *</label><input type="date" id="sale_date_header" name="sale_date" value={saleHeaderFormData.sale_date} onChange={handleHeaderInputChange} required style={inputStyle}/></div>
          <div><label htmlFor="cost_center_id_header">Centro de Custo: *</label><select id="cost_center_id_header" name="cost_center_id" value={saleHeaderFormData.cost_center_id} onChange={handleHeaderInputChange} required style={selectStyle} disabled={loadingFormDataSources || costCentersList.length === 0}><option value="">{loadingFormDataSources ? 'Carregando...' : (costCentersList.length === 0 ? 'Nenhum CC' : 'Selecione CC...')}</option>{costCentersList.map(cc=><option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}</select></div>
          <div><label htmlFor="customer_id_header">Cliente: *</label><select id="customer_id_header" name="customer_id" value={saleHeaderFormData.customer_id} onChange={handleHeaderInputChange} required style={selectStyle} disabled={loadingFormDataSources || customers.length === 0}><option value="">{loadingFormDataSources ? 'Carregando...' : (customers.length === 0 ? 'Nenhum cliente' : 'Selecione...')}</option>{customers.map(c=><option key={c.merchant_id} value={c.merchant_id}>{c.name}</option>)}</select></div>
          <div><label htmlFor="salesperson_id_header">Vendedor: *</label><select id="salesperson_id_header" name="salesperson_id" value={saleHeaderFormData.salesperson_id} onChange={handleHeaderInputChange} required style={selectStyle} disabled={loadingFormDataSources || salespeople.length === 0}><option value="">{loadingFormDataSources ? 'Carregando...' : (salespeople.length === 0 ? 'Nenhum vendedor' : 'Selecione...')}</option>{salespeople.map(s=><option key={s.salesperson_id} value={s.salesperson_id}>{s.name}</option>)}</select></div>
        </div>

        {!isEditing && ( 
            <div ref={addItemFormRef} style={{padding: '15px', border: '1px dashed #007bff', borderRadius: '4px', marginBottom: '20px'}}>
                <h4>Adicionar Item à Venda</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                    <div>
                        <label htmlFor="item_product_id">Produto/Serviço: *</label>
                        <select id="item_product_id" name="product_id" value={currentItemFormData.product_id} onChange={handleItemInputChange} style={selectStyle} disabled={loadingFormDataSources || productsList.length === 0}>
                            <option value="">{loadingFormDataSources ? 'Carregando...' : (productsList.length === 0 ? 'Nenhum produto' : 'Selecione...')}</option>
                            {productsList.map(p => (<option key={p.product_id} value={p.product_id}>{p.name} {p.sale_price ? `(R$ ${parseFloat(p.sale_price).toFixed(2)})` : ''}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="item_quantity">Qtd: *</label>
                        <input type="number" id="item_quantity" name="quantity" value={currentItemFormData.quantity} onChange={handleItemInputChange} min="0.01" step="any" style={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="item_unit_price">Preço Unit.: *</label>
                        <input type="number" id="item_unit_price" name="unit_price" value={currentItemFormData.unit_price} onChange={handleItemInputChange} min="0" step="any" style={inputStyle} />
                    </div>
                    <div>
                        <label>Subtotal Item:</label>
                        <input type="text" value={`R$ ${currentItemFormData.item_total_amount.toFixed(2)}`} readOnly style={readOnlyStyle} />
                    </div>
                    <button type="button" onClick={handleAddItemToSale} style={{ padding: '10px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: 'max-content' }} disabled={!currentItemFormData.product_id || String(currentItemFormData.quantity).trim() === '' || parseFloat(String(currentItemFormData.quantity).replace(',','.')) <= 0 || String(currentItemFormData.unit_price).trim() === '' || parseFloat(String(currentItemFormData.unit_price).replace(',','.')) < 0}>
                        Add Item
                    </button>
                </div>
                {currentItemFormData.product_id && currentItemFormData.product_name && (
                    <div style={{marginTop: '10px'}}>
                        <label>Produto Selecionado (Item):</label>
                        <input type="text" value={currentItemFormData.product_name} readOnly style={readOnlyStyle} />
                    </div>
                )}
            </div>
        )}

        {(currentSaleItems.length > 0 ) && (
            <div style={{marginBottom: '20px'}}>
                <h4>Itens da Venda {isEditing && currentSaleId ? `#${(sales.find(s=>s.sale_id === currentSaleId)?.sale_display_id || String(currentSaleId).substring(0,6)+'...')}` : ''}</h4>
                <table className="item-list-table">
                    <thead><tr><th>Produto</th><th style={{textAlign: 'right'}}>Qtd</th><th style={{textAlign: 'right'}}>Preço Unit.</th><th style={{textAlign: 'right'}}>Subtotal</th>{!isEditing && <th className="action-cell">Remover</th>}</tr></thead>
                    <tbody>
                        {currentSaleItems.map((item, index) => (
                            <tr key={item.product_id + '-' + index + '-' + Math.random()}>
                                <td>{item.product_name_at_sale}</td>
                                <td style={{textAlign: 'right'}}>{item.quantity}</td>
                                <td style={{textAlign: 'right'}}>R$ {parseFloat(item.unit_price_at_sale).toFixed(2)}</td>
                                <td style={{textAlign: 'right'}}>R$ {parseFloat(item.item_total_amount).toFixed(2)}</td>
                                {!isEditing && (<td className="action-cell"><button type="button" onClick={() => handleRemoveItemFromSale(index)} style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>X</button></td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isEditing && <p style={{fontSize: '0.9em', color: '#777'}}>Para alterar itens de uma venda existente, modifique-os na lista e clique "Salvar Alterações". A lógica atual deleta os itens antigos e salva os novos.</p>}
            </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '15px' }}>
            <div><label style={{ display: 'block', marginBottom: '5px', fontSize: '1.1em', fontWeight: 'bold' }}>TOTAL GERAL DA VENDA:</label><input type="text" value={`R$ ${displayOverallTotalAmount.toFixed(2)}`} readOnly style={{...readOnlyStyle, fontSize: '1.2em', fontWeight: 'bold'}}/></div>
            <div><label htmlFor="commission_percentage_header">% Comissão (total):</label><input type="number" id="commission_percentage_header" name="commission_percentage" value={saleHeaderFormData.commission_percentage} onChange={handleHeaderInputChange} min="0" max="100" step="any" placeholder="0-100" style={inputStyle}/></div>
        </div>
        {(saleHeaderFormData.commission_percentage !== '' && parseFloat(String(saleHeaderFormData.commission_percentage).replace(',','.')) > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}><div></div><div><label>Valor Comissão Calculada:</label><input type="text" value={`R$ ${displayOverallCommissionValue.toFixed(2)}`} readOnly style={readOnlyStyle}/></div></div>
        )}
        <div style={{ marginBottom: '20px' }}><label htmlFor="observations_header">Observações Gerais:</label><textarea id="observations_header" name="observations" value={saleHeaderFormData.observations} onChange={handleHeaderInputChange} rows="3" style={textareaStyle}/></div>
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
            <button type="submit" disabled={isSubmittingSale || loadingFormDataSources || (currentSaleItems.length === 0 && !isEditing) } style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1, fontSize: '1rem' }}>
            {isSubmittingSale ? (isEditing ? 'Salvando Venda...' : 'Registrando Venda...') : (isEditing ? 'Salvar Alterações na Venda' : 'Finalizar e Registrar Venda')}
            </button>
            {isEditing && (<button type="button" onClick={resetAllForms} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar Edição</button>)}
        </div>
      </form>

      <h2>Vendas Registradas</h2>
      <div className="filter-container-sales">
        <input
          type="text"
          placeholder="Filtrar vendas (ID, Cliente, CC, Observações...)"
          className="filter-input-sales"
          value={filterTextSales}
          onChange={handleFilterSalesChange}
        />
      </div>
      {!loadingSales && <p style={{ color: '#333', fontWeight: 'bold', marginTop: '0px', marginBottom: '10px' }}>Total de Vendas: {sales.length} (Exibindo)</p>}
      {loadingSales && sales.length === 0 && !filterTextSales && <p>Carregando vendas...</p>}
      {sales.length === 0 && !loadingSales && <p>Nenhuma venda encontrada {filterTextSales ? `para "${filterTextSales}"` : 'registrada ainda.'}</p>}
      {loadingSales && sales.length > 0 && <p>Atualizando lista de vendas...</p>}
      
      {sales.length > 0 && (
        <table className="responsive-table-sales">
          <thead>
            <tr>
              <th>Venda #</th><th>Data</th><th>Cliente</th><th>1º Produto/CC</th>
              <th className="currency-cell">Total</th><th className="status-cell">Status Pag.</th>
              <th className="currency-cell">Saldo</th><th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const saldoAReceber = parseFloat(sale.overall_total_amount) - (sale.total_paid || 0);
              const saleIdentifier = `${sale.sale_display_id || `ID ${String(sale.sale_id).substring(0,6)}...`} - ${sale.first_product_name || 'Venda'}`;
              return (
              <tr key={sale.sale_id}>
                <td data-label="Venda #">{sale.sale_display_id || String(sale.sale_id).substring(0,6)+'...'}</td>
                <td data-label="Data">{new Date(sale.sale_date + 'T00:00:00Z').toLocaleDateString()}</td>
                <td data-label="Cliente">{sale.customer?.name || 'N/A'}</td>
                <td data-label="Detalhes">
                    {sale.first_product_name || 'Itens da Venda'}
                    {sale.cost_center?.name && <span style={{fontSize: '0.8em', color: '#777', display: 'block'}}> (CC: {sale.cost_center.name})</span>}
                </td>
                <td data-label="Total" className="currency-cell">R$ {parseFloat(sale.overall_total_amount).toFixed(2)}</td>
                <td data-label="Status Pag." className="status-cell">
                  <PaymentProgressBar paid={sale.total_paid} total={sale.overall_total_amount} />
                </td>
                <td data-label="Saldo" className="currency-cell" style={{color: saldoAReceber > 0.005 ? '#dc3545' : '#28a745', fontWeight: 'bold'}}>R$ {saldoAReceber.toFixed(2)}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap'}}>
                      <button onClick={() => openPaymentModal(sale)} title="Pagamentos" style={{ padding: '6px', backgroundColor: 'transparent', color: '#17a2b8', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><PaymentsIcon /></button>
                      <button onClick={() => handleEditSale(sale)} title="Editar" style={{ padding: '6px', backgroundColor: 'transparent', color: '#ffc107', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'  }}><EditIcon /></button>
                      <button onClick={() => handleDeleteSale(sale.sale_id, saleIdentifier)} title="Excluir" style={{ padding: '6px', backgroundColor: 'transparent', color: '#dc3545', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><DeleteIcon /></button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      )}

      {/* Modal de Pagamentos */}
      {showPaymentModal && selectedSaleForPayment && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', color: '#333' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3 style={{margin: 0}}>Pagamentos da Venda #{selectedSaleForPayment.sale_display_id || String(selectedSaleForPayment.sale_id).substring(0,6)} (Total: R$ {parseFloat(selectedSaleForPayment.overall_total_amount || selectedSaleForPayment.total_amount).toFixed(2)})</h3>
                <button onClick={closePaymentModal} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#333'}}>&times;</button>
            </div>
            <form onSubmit={handleSubmitPayment} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h4>Registrar Novo Pagamento</h4>
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
            {!loadingPayments && paymentsForSelectedSale.length === 0 && <p>Nenhum pagamento.</p>}
            {paymentsForSelectedSale.length > 0 && ( <ul style={{listStyle: 'none', padding: 0}}>{paymentsForSelectedSale.map(p => (<li key={p.transaction_id} style={{padding: '8px 0', borderBottom: '1px solid #eee'}}> Data: {new Date(p.payment_date + 'T00:00:00Z').toLocaleDateString()} | Método: {p.payment_method} | Valor: R$ {parseFloat(p.amount).toFixed(2)}{p.observations && <em style={{display: 'block', fontSize: '0.9em', color: '#666'}}>Obs: {p.observations}</em>}</li>))}</ul>)}
            <hr style={{margin: '20px 0'}}/>
            <strong style={{fontSize: '1.1em'}}>Saldo a Receber: R$ {(parseFloat(selectedSaleForPayment.overall_total_amount || selectedSaleForPayment.total_amount) - paymentsForSelectedSale.reduce((sum, p) => sum + parseFloat(p.amount), 0)).toFixed(2)}</strong>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteSaleModal}
        onClose={() => setShowDeleteSaleModal(false)}
        onConfirm={confirmDeleteSale}
        title="Confirmar Exclusão de Venda"
        message={ saleToDelete ? <>Deseja realmente excluir a Venda <strong>{saleToDelete.identifier}</strong>? Esta ação também excluirá pagamentos e itens associados e não pode ser desfeita.</> : "Deseja realmente excluir esta venda?" }
        confirmText="Excluir Venda"
        cancelText="Cancelar"
        isLoading={isDeletingSale}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

export default SalesPage;
