// src/features/purchases/usePurchases.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function usePurchases() {
  // Estados para a lista de compras
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [listError, setListError] = useState(null);

  // Estados para os dados dos formulários (dropdowns)
  const [suppliers, setSuppliers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormDataSources, setLoadingFormDataSources] = useState(true);

  const fetchPurchases = useCallback(async () => {
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
            if (paymentsError) {
              console.error(`Erro pagamentos compra ${purchase.purchase_id}:`, paymentsError.message);
              return { ...purchase, total_paid: 0, payment_status: 'Erro' };
            }
            const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const purchaseTotal = parseFloat(purchase.total_amount) || 0;
            let paymentStatus = 'A Pagar';
            if (purchaseTotal > 0 && totalPaid >= purchaseTotal - 0.001) {
              paymentStatus = 'Pago';
            } else if (totalPaid > 0) {
              paymentStatus = 'Parcial';
            }
            return { ...purchase, total_paid: totalPaid, payment_status: paymentStatus };
          })
        );
        setPurchases(purchasesWithPaymentInfo);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.error('Erro ao buscar compras:', err.message);
      setListError(err.message);
      setPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  }, []);

  const fetchFormDataSources = useCallback(async () => {
    setLoadingFormDataSources(true);
    try {
      const [suppliersRes, productsRes, costCentersRes] = await Promise.all([
        supabase.from('merchants').select('merchant_id, name').or('merchant_type.eq.Fornecedor,merchant_type.eq.Ambos').order('name'),
        supabase.from('products').select('product_id, name, purchase_price').or('product_type.eq.Compra,product_type.eq.Ambos').eq('is_active', true).order('name'),
        supabase.from('cost_centers').select('cost_center_id, name').eq('is_active', true).order('name'),
      ]);
      
      if (suppliersRes.error) throw suppliersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (costCentersRes.error) throw costCentersRes.error;

      setSuppliers(suppliersRes.data || []);
      setProductsList(productsRes.data || []);
      setCostCentersList(costCentersRes.data || []);

    } catch (error) {
      toast.error("Falha ao carregar dados para o formulário de compras.");
      console.error("Erro carregando fontes de dados:", error);
    } finally {
      setLoadingFormDataSources(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
    fetchFormDataSources();
  }, [fetchPurchases, fetchFormDataSources]);

  return {
    purchases,
    loadingPurchases,
    listError,
    suppliers,
    productsList,
    costCentersList,
    loadingFormDataSources,
    refetchPurchases: fetchPurchases
  };
}