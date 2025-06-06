// src/components/SaleItemsTable.jsx
import React from 'react';

// Assumindo que os estilos da tabela (.item-list-table, .action-cell) 
// estão definidos no CSS global ou no SalesPage.jsx
// Ou podemos passar os estilos como props se necessário.

function SaleItemsTable({ 
    currentSaleItems, 
    isEditing, 
    handleRemoveItem, // Renomeado de handleRemoveItemFromSale para ser mais genérico se usado em outros contextos
    sales, // Passado para encontrar o sale_display_id para o título
    currentSaleId // Passado para encontrar o sale_display_id para o título
}) {

  if (!currentSaleItems || currentSaleItems.length === 0) {
    return null; // Não renderiza nada se não houver itens
  }

  return (
    <div style={{marginBottom: '20px'}}>
      <h4>
        Itens da Venda 
        {isEditing && currentSaleId 
          ? ` #${(sales.find(s => s.sale_id === currentSaleId)?.sale_display_id || String(currentSaleId).substring(0,6) + '...')}` 
          : ''}
      </h4>
      <table className="item-list-table"> {/* Certifique-se que esta classe está definida no SalesPage.jsx ou globalmente */}
        <thead>
          <tr>
            <th>Produto</th>
            <th style={{textAlign: 'right'}}>Qtd</th>
            <th style={{textAlign: 'right'}}>Preço Unit.</th>
            <th style={{textAlign: 'right'}}>Subtotal</th>
            {/* Mostrar coluna "Remover" apenas se NÃO estiver editando uma venda existente E houver itens */}
            {/* A lógica original era '!isEditing', o que significava que ao CRIAR uma nova venda, podia remover. */}
            {/* Se ao EDITAR uma venda, os itens são carregados e podem ser removidos da lista local ANTES de salvar, então a coluna deve aparecer também no modo de edição. */}
            {/* Vou assumir que a remoção é permitida tanto na criação quanto na edição da lista de itens *antes* de salvar. */}
            <th className="action-cell">Remover</th>
          </tr>
        </thead>
        <tbody>
          {currentSaleItems.map((item, index) => (
            <tr key={item.product_id + '-' + index + '-' + (item.sale_item_id || Math.random())}> {/* Chave melhorada */}
              <td>{item.product_name_at_sale || item.product_name}</td>
              <td style={{textAlign: 'right'}}>{item.quantity}</td>
              <td style={{textAlign: 'right'}}>R$ {parseFloat(item.unit_price_at_sale || item.unit_price || 0).toFixed(2)}</td>
              <td style={{textAlign: 'right'}}>R$ {parseFloat(item.item_total_amount || 0).toFixed(2)}</td>
              <td className="action-cell">
                {/* O botão de remover agora sempre chama handleRemoveItem, que pode ter lógica condicional baseada em isEditing na SalesPage se necessário */}
                <button 
                  type="button" 
                  onClick={() => handleRemoveItem(index)} 
                  style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                  title="Remover Item"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isEditing && 
        <p style={{fontSize: '0.9em', color: '#777', marginTop: '5px'}}>
          Para alterar itens de uma venda existente, modifique-os na lista (se a edição de campos for implementada aqui) ou remova e adicione novamente. A lógica atual de salvar a edição de uma venda deleta todos os itens antigos e salva os itens listados aqui.
        </p>
      }
    </div>
  );
}

export default SaleItemsTable;
