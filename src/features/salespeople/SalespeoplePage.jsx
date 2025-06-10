// src/features/salespeople/SalespeoplePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import { useSalespeople } from './useSalespeople';
import styles from './css/SalespeoplePage.module.css';
import SalespersonForm from './components/SalespersonForm';
import SalespeopleTable from './components/SalespeopleTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const initialFormData = { name: '', email: '', phone: '', is_active: true };

function SalespeoplePage() {
  const { 
    salespeople, loading, error, refetch, filterText, setFilterText,
    sortColumn, sortDirection, handleSort,
    currentPage, totalPages, setCurrentPage, itemsPerPage, totalItems
  } = useSalespeople();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSalespersonId, setCurrentSalespersonId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [salespersonToDelete, setSalespersonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (e) => {
    setFormData(prev => ({...prev, is_active: e.target.checked }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentSalespersonId(null);
  };

  const handleEditSalesperson = (person) => {
    setIsEditing(true);
    setCurrentSalespersonId(person.salesperson_id);
    setFormData({
      name: person.name || '',
      email: person.email || '',
      phone: person.phone || '',
      is_active: person.is_active,
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

 const handleSubmit = async (event) => {
  event.preventDefault();
  if (!formData.name.trim()) {
    toast.error('O nome do vendedor é um campo obrigatório.');
    return;
  }
  
  setIsSubmitting(true);
  try {
    // Objeto base com os dados do formulário
    const dataToSubmit = { ...formData };

    // =================================================================
    // LÓGICA CORRIGIDA AQUI
    // =================================================================
    // Se estivermos editando, adicionamos o ID ao objeto a ser salvo.
    // Se estivermos criando, o campo 'salesperson_id' não é enviado,
    // permitindo que o banco de dados gere o UUID automaticamente.
    if (isEditing) {
      dataToSubmit.salesperson_id = currentSalespersonId;
    }

    const { error } = await supabase
      .from('salespeople')
      .upsert(dataToSubmit); // O upsert agora recebe o objeto montado corretamente

    if (error) {
      throw error;
    }

    toast.success(`Vendedor ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
    resetForm();
    refetch();
  } catch (err) {
    toast.error(`Erro ao salvar: ${err.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDeleteSalesperson = (person) => {
    setSalespersonToDelete(person);
    setShowDeleteModal(true);
  };

  const confirmDeleteSalesperson = async () => {
    if (!salespersonToDelete) return;
    setIsDeleting(true);
    try {
      const { count } = await supabase.from('sales').select('salesperson_id', { count: 'exact', head: true }).eq('salesperson_id', salespersonToDelete.salesperson_id);
      if (count > 0) throw new Error(`Vendedor está associado a ${count} venda(s).`);

      const { error } = await supabase.from('salespeople').delete().eq('salesperson_id', salespersonToDelete.salesperson_id);
      if (error) throw error;
      
      toast.success(`Vendedor "${salespersonToDelete.name}" excluído!`);
      refetch();
    } catch (err) {
      toast.error(`Falha ao excluir: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSalespersonToDelete(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gerenciar Vendedores</h1>

      <SalespersonForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleToggleChange={handleToggleChange}
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        formRef={formRef}
      />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por nome ou email..."
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      
      <SalespeopleTable
        salespeople={salespeople}
        handleEditSalesperson={handleEditSalesperson}
        handleDeleteSalesperson={handleDeleteSalesperson}
        isLoading={loading}
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
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSalesperson}
        title="Confirmar Exclusão"
        message={salespersonToDelete ? `Deseja realmente excluir ${salespersonToDelete.name}?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default SalespeoplePage;