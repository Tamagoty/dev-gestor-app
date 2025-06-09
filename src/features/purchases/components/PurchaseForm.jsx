// src/features/purchases/components/PurchaseForm.jsx (VERSÃO CORRIGIDA)
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; // Importar o toast
import styles from '../css/PurchasesPage.module.css';
import FormActions from '../../../components/FormActions';
import PrimaryButton from '../../../components/PrimaryButton';

const initialCurrentItem = {
  product_id: '',
  product_name_at_purchase: '',
  quantity: '',
  unit_price: '',
  item_total_amount: 0,
};

const PurchaseForm = ({
  formData,
  setFormData,
  handleInputChange, // Agora recebemos o handler do pai
  handleSubmit,
  isEditing,
  isSubmitting,
  resetForm,
  suppliers,
  productsList,
  costCentersList,
  loading,
  purchaseTotalAmount,
  formRef
}) => {
  const [currentItem, setCurrentItem] = useState(initialCurrentItem);

  useEffect(() => {
    if (currentItem.product_id) {
      const product = productsList.find(p => p.product_id === currentItem.product_id);
      if (product) {
        setCurrentItem(prev => ({
          ...prev,
          product_name_at_purchase: product.name,
          unit_price: product.purchase_price ?? ''
        }));
      }
    }
  }, [currentItem.product_id, productsList]);

  const handleCurrentItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    // VALIDAÇÃO CORRIGIDA com toast
    if (!currentItem.product_id || !currentItem.quantity || !currentItem.unit_price) {
      toast.error("Selecione um produto e preencha a quantidade e o preço.");
      return;
    }
    const itemToAdd = {
      ...currentItem,
      item_total_amount: Number(currentItem.quantity) * Number(currentItem.unit_price)
    };
    setFormData(prevData => ({
      ...prevData,
      items: [...prevData.items, itemToAdd]
    }));
    setCurrentItem(initialCurrentItem);
  };

  const handleRemoveItem = (indexToRemove) => {
    setFormData(prevData => ({
      ...prevData,
      items: prevData.items.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef} className={styles.formSection}>
      <h2>{isEditing ? 'Editar Compra' : 'Nova Compra'}</h2>

      {/* SEÇÃO 1: CABEÇALHO DA COMPRA (AGORA USANDO handleInputChange) */}
      <div className={styles.formGrid}>
        <div>
          <label>Data Compra: *</label>
          <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} required className={styles.input} />
        </div>
        <div>
          <label>Fornecedor: *</label>
          <select name="supplier_id" value={formData.supplier_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {suppliers.map(s => <option key={s.merchant_id} value={s.merchant_id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label>Centro de Custo: *</label>
          <select name="cost_center_id" value={formData.cost_center_id} onChange={handleInputChange} required className={styles.select} disabled={loading}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {costCentersList.map(cc => <option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}
          </select>
        </div>
      </div>

      {/* ... O resto do arquivo continua exatamente igual ... */}

      <hr style={{ margin: '25px 0', border: '1px solid #eee' }} />
      <fieldset>
          <legend>Adicionar Item</legend>
          <div className={styles.formGrid}>
             <div style={{gridColumn: 'span 2'}}>
                <label>Produto/Serviço: *</label>
                <select name="product_id" value={currentItem.product_id} onChange={handleCurrentItemChange} className={styles.select} disabled={loading}>
                    <option value="">{loading ? 'Carregando...' : 'Selecione um produto...'}</option>
                    {productsList.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                </select>
            </div>
             <div>
                <label>Quantidade: *</label>
                <input type="number" name="quantity" value={currentItem.quantity} onChange={handleCurrentItemChange} min="0.01" step="any" className={styles.input} />
            </div>
            <div>
                <label>Preço Unitário: *</label>
                <input type="number" name="unit_price" value={currentItem.unit_price} onChange={handleCurrentItemChange} min="0.01" step="any" className={styles.input} />
            </div>
          </div>
          <div style={{textAlign: 'right', marginTop: '10px'}}>
             <PrimaryButton type="button" onClick={handleAddItem}>
                Adicionar Item à Compra
             </PrimaryButton>
          </div>
      </fieldset>
      <h3 style={{marginTop: '30px'}}>Itens na Compra</h3>
      <table className={styles.listTable} style={{fontSize: '0.85rem'}}>
        <thead>
          <tr>
            <th>Produto</th>
            <th style={{textAlign: 'right'}}>Qtd.</th>
            <th style={{textAlign: 'right'}}>Preço Unit.</th>
            <th style={{textAlign: 'right'}}>Subtotal</th>
            <th style={{textAlign: 'center'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {formData.items.length === 0 ? (
            <tr><td colSpan="5" style={{textAlign: 'center'}}>Nenhum item adicionado.</td></tr>
          ) : (
            formData.items.map((item, index) => (
              <tr key={index}>
                <td>{item.product_name_at_purchase}</td>
                <td style={{textAlign: 'right'}}>{Number(item.quantity).toFixed(2)}</td>
                <td style={{textAlign: 'right'}}>{Number(item.unit_price).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</td>
                <td style={{textAlign: 'right'}}>{(item.quantity * item.unit_price).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</td>
                <td style={{textAlign: 'center'}}>
                  <button type="button" onClick={() => handleRemoveItem(index)} className={styles.removeButton}>Remover</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
            <tr>
                <td colSpan="3" style={{textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem'}}>TOTAL DA COMPRA:</td>
                <td style={{textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem'}}>{purchaseTotalAmount.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</td>
                <td></td>
            </tr>
        </tfoot>
      </table>
      <hr style={{ margin: '25px 0' }} />
      <FormActions
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onCancel={resetForm}
      />
    </form>
  );
};

export default PurchaseForm;