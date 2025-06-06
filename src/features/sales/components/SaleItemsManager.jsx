// src/features/sales/components/SaleItemsManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from '../css/SalesPage.module.css';

const initialItemState = { product_id: '', product_name: '', unit_price: '', quantity: '1', item_total_amount: 0 };

const SaleItemsManager = ({ items, setItems, productsList, loading, isEditing }) => {
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
      alert('Preencha todos os campos do item.');
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
  
  if (isEditing) {
    return (
      <div className={styles.itemsManager}>
        <h4>Itens da Venda (Modo de Edição)</h4>
        <p>Para alterar itens, cancele a edição e crie uma nova venda. A edição de itens em uma venda existente não é permitida para manter a integridade dos dados.</p>
        <table className={styles.itemsTable}>
          <thead><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Subtotal</th></tr></thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.product_name_at_sale}</td>
                <td style={{textAlign: 'right'}}>{item.quantity}</td>
                <td style={{textAlign: 'right'}}>R$ {parseFloat(item.unit_price_at_sale).toFixed(2)}</td>
                <td style={{textAlign: 'right'}}>R$ {parseFloat(item.item_total_amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.itemsManager}>
      <h4>Adicionar Item à Venda</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
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
          <input type="text" value={`R$ ${currentItem.item_total_amount.toFixed(2)}`} readOnly className={styles.readOnlyInput} />
        </div>
        <button type="button" onClick={handleAddItem}>Add</button>
      </div>
      
      {items.length > 0 && (
        <table className={styles.itemsTable}>
            <thead><tr><th>Produto</th><th>Qtd</th><th>Preço Unit.</th><th>Subtotal</th><th>Remover</th></tr></thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name_at_sale}</td>
                  <td style={{textAlign: 'right'}}>{item.quantity}</td>
                  <td style={{textAlign: 'right'}}>R$ {parseFloat(item.unit_price_at_sale).toFixed(2)}</td>
                  <td style={{textAlign: 'right'}}>R$ {parseFloat(item.item_total_amount).toFixed(2)}</td>
                  <td style={{textAlign: 'center'}}><button type="button" onClick={() => handleRemoveItem(index)}>X</button></td>
                </tr>
              ))}
            </tbody>
        </table>
      )}
    </div>
  );
};
export default SaleItemsManager;