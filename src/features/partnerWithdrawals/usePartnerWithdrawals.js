// src/features/partnerWithdrawals/usePartnerWithdrawals.js (VERSÃO ATUALIZADA)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 15;

export function usePartnerWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [listError, setListError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState('withdrawal_date');
  const [sortDirection, setSortDirection] = useState('desc');

  const [partners, setPartners] = useState([]);
  const [costCentersList, setCostCentersList] = useState([]);
  const [loadingFormSources, setLoadingFormSources] = useState(true);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const fetchWithdrawals = useCallback(async () => {
    setLoadingWithdrawals(true);
    try {
      setListError(null);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // MUDANÇA: Consultando a nova VIEW
      let query = supabase
        .from('partner_withdrawals_view')
        .select(`*`, { count: 'exact' });

      // MUDANÇA: O filtro agora pode buscar na descrição OU no nome do sócio
      if (filterText.trim() !== '') {
        query = query.or(`description.ilike.%${filterText.trim()}%,partner_name.ilike.%${filterText.trim()}%`);
      }

      query = query
        .order(sortColumn, { ascending: sortDirection === 'asc' })
        .range(from, to);
      
      const { data, error, count } = await query;
      if (error) throw error;

      setWithdrawals(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Erro ao buscar retiradas:', err.message);
      setListError(err.message);
    } finally {
      setLoadingWithdrawals(false);
    }
  }, [currentPage, filterText, sortColumn, sortDirection]);
  
  const fetchFormDataSources = useCallback(async () => {
    setLoadingFormSources(true);
    try {
      const [partnersRes, costCentersRes] = await Promise.all([
        supabase.from('partners').select('partner_id, name').eq('status', 'Ativo').order('name'),
        supabase.from('cost_centers').select('cost_center_id, name').eq('is_active', true).order('name'),
      ]);
      setPartners(partnersRes.data || []);
      setCostCentersList(costCentersRes.data || []);
    } catch (error) {
      toast.error("Falha ao carregar sócios ou centros de custo.");
    } finally {
      setLoadingFormSources(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  useEffect(() => {
    fetchFormDataSources();
  }, [fetchFormDataSources]);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return {
    withdrawals,
    loadingWithdrawals,
    listError,
    partners,
    costCentersList,
    loadingFormSources,
    refetchWithdrawals: fetchWithdrawals,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage,
    filterText,
    setFilterText,
    sortColumn,
    sortDirection,
    handleSort,
  };
}