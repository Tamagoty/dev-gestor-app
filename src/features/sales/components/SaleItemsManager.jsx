// src/features/sales/components/SaleItemsManager.jsx (VERSÃO CORRIGIDA)
import React, { useState, useEffect, useRef } from 'react';
import styles from '../css/SalesPage.module.css';
import toast from 'react-hot-toast'; // Adicionado para melhor feedback

const initialItemState = { product_id: '', product_name: '', unit_price: '', quantity: '1', item_total_amount: 0 };

const SaleItemsManager = ({ items, setItems, productsList, loading }) => {
  const [currentItem, setCurrentItem] = useState(initialItemState);
  const productSelectRef = useRef(null);

  useEffect(() => {
    const price = parseFloat(String(currentItem.unit_price).replace(',', '.'));
    const qty = parseFloat(String(currentItem.quantity).replace(',', '.'));
    const total = !isNaN(price) && !isNaN(qty) && qty > 0 ? price * qty : 0;
    setCurrentItem(prev => ({ ...prev, item_total_amount: total }));
  }, [currentItem.unit_price, currentItem.quantity]);

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...currentItem, [name]: value };
    if (name === 'product_id') {
      const product = productsList.find(p => p.product_id === value);
      if (product) {
        newFormData = { ...newFormData, product_name: product.name, unit_price: product.sale_price ?? '0' };
      } else {
        newFormData = { ...newFormData, product_name: '', unit_price: '' };
      }
    }
    setCurrentItem(newFormData);
  };

  const handleAddItem = () => {
    if (!currentItem.product_id || !currentItem.quantity || currentItem.unit_price === '') {
      toast.error('Preencha todos os campos do item antes de adicionar.');
      return;
    }
    const newItem = {
      product_id: currentItem.product_id,
      product_name_at_sale: currentItem.product_name,
      unit_price_at_sale: parseFloat(String(currentItem.unit_price).replace(',', '.')),
      quantity: parseFloat(String(currentItem.quantity).replace(',', '.')),
      item_total_amount: currentItem.item_total_amount,
    };
    setItems(prevItems => [...prevItems, newItem]);
    setCurrentItem(initialItemState);
    productSelectRef.current?.focus();
  };

  const handleRemoveItem = (indexToRemove) => {
    setItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };
  
  // O bloco 'if (isEditing)' foi removido. O componente agora sempre renderiza a UI interativa.
  return (
    <div className={styles.itemsManager}>
      <h4>Itens da Venda</h4>
      
      {/* Formulário para adicionar um novo item */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <label>Produto/Serviço: *</label>
          <select name="product_id" value={currentItem.product_id} onChange={handleItemInputChange} className={styles.select} disabled={loading} ref={productSelectRef}>
            <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
            {productsList.map(p => (<option key={p.product_id} value={p.product_id}>{p.name}</option>))}
          </select>
        </div>
        <div>
          <label>Qtd: *</label>
          <input type="number" name="quantity" value={currentItem.quantity} onChange={handleItemInputChange} min="0.01" step="any" className={styles.input} />
        </div>
        <div>
          <label>Preço Unit.: *</label>
          <input type="number" name="unit_price" value={currentItem.unit_price} onChange={handleItemInputChange} min="0" step="any" className={styles.input} />
        </div>
        <div>
          <label>Subtotal Item:</label>
          <input type="text" value={currentItem.item_total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} readOnly className={styles.readOnlyInput} />
        </div>
        <button type="button" onClick={handleAddItem} className={styles.addButton}>Add</button>
      </div>
      
      {/* Tabela de itens já adicionados */}
      {items.length > 0 && (
        <table className={styles.itemsTable}>
            <thead><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Subtotal</th><th>Remover</th></tr></thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{item.product_name_at_sale}</td>
                  <td style={{textAlign: 'right'}}>{item.quantity}</td>
                  <td style={{textAlign: 'right'}}>{parseFloat(item.unit_price_at_sale).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td style={{textAlign: 'right'}}>{parseFloat(item.item_total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td style={{textAlign: 'center'}}><button type="button" onClick={() => handleRemoveItem(index)} className={styles.removeButton}>X</button></td>
                </tr>
              ))}
            </tbody>
        </table>
      )}
    </div>
  );
};

export default SaleItemsManager;