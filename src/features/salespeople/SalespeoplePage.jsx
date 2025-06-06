// src/features/salespeople/SalespeoplePage.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import { useSalespeople } from './useSalespeople';
import SalespersonForm from './components/SalespersonForm';
import SalespeopleTable from './components/SalespeopleTable';
import ConfirmationModal from '../../components/ConfirmationModal';

const initialFormData = { name: '', email: '', phone: '', is_active: true };

function SalespeoplePage() {
  // O hook gerencia os dados da tabela
  const { salespeople, loading, error, refetch, filterText, setFilterText, sortColumn, sortDirection, handleSort } = useSalespeople();

  // Estados relacionados à UI (formulário e modal)
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSalespersonId, setCurrentSalespersonId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [salespersonToDelete, setSalespersonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    toast.info(`Editando vendedor: ${person.name}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) { toast.error('O nome é obrigatório.'); return; }
    
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        is_active: formData.is_active,
      };
      const { error } = await supabase.from('salespeople').upsert({ salesperson_id: currentSalespersonId, ...dataToSubmit });
      if (error) throw error;

      toast.success(isEditing ? 'Vendedor atualizado!' : 'Vendedor adicionado!');
      resetForm();
      refetch();
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
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
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Gerenciar Vendedores</h1>

      <SalespersonForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        formRef={formRef}
      />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Carregando vendedores...</p>}
      
      {!loading && !error && (
        <SalespeopleTable
          salespeople={salespeople}
          handleEditSalesperson={handleEditSalesperson}
          handleDeleteSalesperson={handleDeleteSalesperson}
          // Passando explicitamente as props que a tabela precisa
          filterText={filterText}
          setFilterText={setFilterText}
          handleSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      )}

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