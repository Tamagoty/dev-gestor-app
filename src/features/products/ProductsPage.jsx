// src/features/products/ProductsPage.jsx
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

import styles from './css/ProductsPage.module.css';
import { useProducts } from './useProducts';
import ProductForm from './components/ProductForm';
import ProductsListTable from './components/ProductsListTable';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const initialFormData = { name: '', description: '', unit_of_measure: '', purchase_price: '', sale_price: '', category: '', product_type: 'Ambos', is_active: true };

function ProductsPage() {
  const { 
    products, loading, refetchProducts,
    currentPage, totalPages, setCurrentPage, itemsPerPage, totalItems,
    filterText, setFilterText,
    sortColumn, sortDirection, handleSort
  } = useProducts();

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
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
    setCurrentProductId(null);
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.product_id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      unit_of_measure: product.unit_of_measure || '',
      purchase_price: product.purchase_price ?? '',
      sale_price: product.sale_price ?? '',
      category: product.category || '',
      product_type: product.product_type || 'Ambos',
      is_active: product.is_active,
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) { toast.error('O Nome é obrigatório.'); return; }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('products').upsert({ product_id: currentProductId, ...formData });
      if(error) {
        if (error.message.includes('unique constraint')) throw new Error('Já existe um produto com este nome.');
        throw error;
      }
      toast.success('Produto salvo com sucesso!');
      resetForm();
      refetchProducts();
    } catch(err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = (product) => {
    setItemToDelete(product);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const { count: salesCount } = await supabase.from('sale_items').select('product_id', { count: 'exact', head: true }).eq('product_id', itemToDelete.product_id);
      if (salesCount > 0) throw new Error('Produto em uso em Vendas.');
      
      const { count: purchasesCount } = await supabase.from('purchases').select('product_id', { count: 'exact', head: true }).eq('product_id', itemToDelete.product_id);
      if (purchasesCount > 0) throw new Error('Produto em uso em Compras.');
      
      const { error: deleteError } = await supabase.from('products').delete().eq('product_id', itemToDelete.product_id);
      if (deleteError) throw deleteError;
      
      toast.success(`"${itemToDelete.name}" excluído com sucesso!`);
      refetchProducts();
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
      <h1>Gerenciar Produtos e Serviços</h1>
      <ProductForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleToggleChange={handleToggleChange}
        handleSubmit={handleSubmit}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        resetForm={resetForm}
        formRef={formRef}
      />
      
      <hr style={{margin: '40px 0'}} />

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar por nome ou categoria..."
          className={styles.input}
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <ProductsListTable
        products={products}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
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
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={itemToDelete ? `Deseja realmente excluir "${itemToDelete.name}"?` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ProductsPage;