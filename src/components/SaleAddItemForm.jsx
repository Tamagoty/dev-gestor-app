// src/components/SaleAddItemForm.jsx
import React from 'react';

// Os estilos são passados como props para manter este componente focado na lógica e JSX.
function SaleAddItemForm({
  currentItemFormData,
  handleItemInputChange,
  handleAddItemToSale,
  productsList,
  loadingFormDataSources,
  addItemFormRef,
  inputStyle,
  selectStyle,
  readOnlyStyle,
  // isEditing // Removido, pois a lógica de mostrar/esconder está na SalesPage.jsx
}) {
  return (
    <div ref={addItemFormRef} style={{padding: '15px', border: '1px dashed #007bff', borderRadius: '4px', marginBottom: '20px'}}>
      <h4>Adicionar Item à Venda</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
        <div>
          <label htmlFor="item_product_id" style={{ display: 'block', marginBottom: '5px' }}>Produto/Serviço: *</label>
          <select 
            id="item_product_id" 
            name="product_id" 
            value={currentItemFormData.product_id} 
            onChange={handleItemInputChange} 
            style={selectStyle} 
            disabled={loadingFormDataSources || productsList.length === 0}
          >
            <option value="">{loadingFormDataSources ? 'Carregando...' : (productsList.length === 0 ? 'Nenhum produto' : 'Selecione...')}</option>
            {productsList.map(p => (<option key={p.product_id} value={p.product_id}>{p.name} {p.sale_price ? `(R$ ${parseFloat(p.sale_price).toFixed(2)})` : ''}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="item_quantity" style={{ display: 'block', marginBottom: '5px' }}>Qtd: *</label>
          <input 
            type="number" 
            id="item_quantity" 
            name="quantity" 
            value={currentItemFormData.quantity} 
            onChange={handleItemInputChange} 
            min="0.01" 
            step="any" 
            style={inputStyle} 
          />
        </div>
        <div>
          <label htmlFor="item_unit_price" style={{ display: 'block', marginBottom: '5px' }}>Preço Unit.: *</label>
          <input 
            type="number" 
            id="item_unit_price" 
            name="unit_price" 
            value={currentItemFormData.unit_price} 
            onChange={handleItemInputChange} 
            min="0" 
            step="any" 
            style={inputStyle} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Subtotal Item:</label>
          <input 
            type="text" 
            value={`R$ ${currentItemFormData.item_total_amount.toFixed(2)}`} 
            readOnly 
            style={readOnlyStyle} 
          />
        </div>
        <button 
          type="button" 
          onClick={handleAddItemToSale} 
          style={{ padding: '10px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: 'max-content' }} 
          disabled={!currentItemFormData.product_id || String(currentItemFormData.quantity).trim() === '' || parseFloat(String(currentItemFormData.quantity).replace(',','.')) <= 0 || String(currentItemFormData.unit_price).trim() === '' || parseFloat(String(currentItemFormData.unit_price).replace(',','.')) < 0}
        >
          Add Item
        </button>
      </div>
      {/* Exibição do nome do produto do item (read-only) */}
      {currentItemFormData.product_id && currentItemFormData.product_name && (
          <div style={{marginTop: '10px'}}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Produto Selecionado (Item):</label>
              <input type="text" value={currentItemFormData.product_name} readOnly style={readOnlyStyle} />
          </div>
      )}
    </div>
  );
}

export default SaleAddItemForm;
