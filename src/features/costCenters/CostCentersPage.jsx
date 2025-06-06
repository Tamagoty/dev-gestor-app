// src/features/costCenters/CostCentersPage.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/CostCentersPage.module.css';
import { useCostCenters } from './useCostCenters';
import CostCenterForm from './components/CostCenterForm';
import CostCentersListTable from './components/CostCentersListTable';
import ConfirmationModal from '../../components/ConfirmationModal';

const initialFormData = { name: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '', is_active: true };

function CostCentersPage() {
  const { costCenters, loading, refetchCostCenters } = useCostCenters();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCostCenterId, setCurrentCostCenterId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função dedicada para o ToggleSwitch
  const handleToggleChange = (e) => {
    setFormData(prev => ({...prev, is_active: e.target.checked }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentCostCenterId(null);
  };
  
  const handleEdit = (cc) => {
    setIsEditing(true);
    setCurrentCostCenterId(cc.cost_center_id);
    setFormData({
      name: cc.name || '',
      description: cc.description || '',
      start_date: cc.start_date ? new Date(cc.start_date + 'T00:00:00Z').toISOString().split('T')[0] : '',
      end_date: cc.end_date ? new Date(cc.end_date + 'T00:00:00Z').toISOString().split('T')[0] : '',
      is_active: cc.is_active,
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) { toast.error('O Nome é obrigatório.'); return; }
    // ... (outras validações) ...

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('cost_centers').upsert({ cost_center_id: currentCostCenterId, ...formData });
      if (error) throw error;

      toast.success(isEditing ? 'Centro de Custo atualizado!' : 'Centro de Custo adicionado!');
      resetForm();
      refetchCostCenters();
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (cc) => {
    setItemToDelete(cc);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      // ... (Lógica de verificação de uso) ...

      const { error } = await supabase.from('cost_centers').delete().eq('cost_center_id', itemToDelete.cost_center_id);
      if (error) throw error;

      toast.success(`"${itemToDelete.name}" excluído com sucesso!`);
      refetchCostCenters();
    } catch (err) {
      toast.error(`Erro ao excluir: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gerenciar Centros de Custo</h1>
      <CostCenterForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleToggleChange={handleToggleChange} // <-- Passando a nova função
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        formRef={formRef}
      />
      {loading ? <p>Carregando...</p> : (
        <CostCentersListTable
          costCenters={costCenters}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={itemToDelete ? `Deseja realmente excluir "${itemToDelete.name}"?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default CostCentersPage;