// src/features/partnerWithdrawals/usePartnerWithdrawals.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export function usePartnerWithdrawals() {
  // Estados para a lista de retiradas
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [listError, setListError] = useState(null);

  // Estados para os dados dos formulários (dropdowns)
  const [partners, setPartners] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormSources, setLoadingFormSources] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setLoadingWithdrawals(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('partner_withdrawals')
        .select(`*, partner:partners(name), cost_center:cost_centers(name)`)
        .order('withdrawal_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      const errorMessage = 'Falha ao carregar retiradas.';
      console.error(errorMessage, err.message);
      setListError(err.message);
      toast.error(errorMessage);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, []);

  const fetchFormDataSources = useCallback(async () => {
    setLoadingFormSources(true);
    try {
      const [partnersRes, costCentersRes] = await Promise.all([
        supabase.from('partners').select('partner_id, name').eq('status', 'Ativo').order('name'),
        supabase.from('cost_centers').select('cost_center_id, name').eq('is_active', true).order('name'),
      ]);

      if (partnersRes.error) throw partnersRes.error;
      if (costCentersRes.error) throw costCentersRes.error;

      setPartners(partnersRes.data || []);
      setCostCentersList(costCentersRes.data || []);
    } catch (error) {
      toast.error("Falha ao carregar sócios ou centros de custo.");
      console.error("Erro carregando fontes de dados para retiradas:", error);
    } finally {
      setLoadingFormSources(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
    fetchFormDataSources();
  }, [fetchWithdrawals, fetchFormDataSources]);

  return {
    withdrawals,
    loadingWithdrawals,
    listError,
    partners,
    costCentersList,
    loadingFormSources,
    refetchWithdrawals: fetchWithdrawals,
  };
}