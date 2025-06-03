// src/pages/ProductsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

// Estilos
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const selectStyle = { ...inputStyle };
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '10px', color: '#333', margin: '10px 0' };
const checkboxStyle = { width: 'auto', height: 'auto', accentColor: '#007bff' };

const initialFormData = {
  name: '',
  description: '',
  unit_of_measure: '',
  purchase_price: '',
  sale_price: '',
  category: '',
  product_type: 'Ambos',
  is_active: true,
};

const productTypeOptions = ['Ambos', 'Compra', 'Venda'];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [listError, setListError] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Gestor App - Produtos/Serviços';
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos/serviços:', err.message);
      setListError(err.message);
      setProducts([]);
      toast.error('Falha ao carregar produtos/serviços.');
    } finally {
      setLoadingProducts(false);
    }
  }

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentProductId(null);
  };

  const handleSubmitProduct = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error('O Nome do produto/serviço é obrigatório.');
      return;
    }
    if (!formData.product_type) {
        toast.error('O Tipo de Produto/Serviço é obrigatório.');
        return;
    }
    const purchasePriceStr = String(formData.purchase_price).replace(',', '.');
    const salePriceStr = String(formData.sale_price).replace(',', '.');
    let purchasePrice = null;
    let salePrice = null;
    if (purchasePriceStr.trim() !== '') {
        purchasePrice = parseFloat(purchasePriceStr);
        if (isNaN(purchasePrice) || purchasePrice < 0) {
            toast.error('Preço de Compra inválido. Deve ser um número não negativo ou vazio.');
            return;
        }
    }
    if (salePriceStr.trim() !== '') {
        salePrice = parseFloat(salePriceStr);
        if (isNaN(salePrice) || salePrice < 0) {
            toast.error('Preço de Venda inválido. Deve ser um número não negativo ou vazio.');
            return;
        }
    }
    setIsSubmitting(true);
    const dataToSubmit = {
      name: formData.name.trim(),
      description: formData.description.trim() === '' ? null : formData.description.trim(),
      unit_of_measure: formData.unit_of_measure.trim() === '' ? null : formData.unit_of_measure.trim(),
      purchase_price: purchasePrice,
      sale_price: salePrice,
      category: formData.category.trim() === '' ? null : formData.category.trim(),
      product_type: formData.product_type,
      is_active: formData.is_active,
    };
    try {
      let savedProduct = null;
      let successMessage = '';
      if (isEditing && currentProductId) {
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products').update(dataToSubmit).eq('product_id', currentProductId)
          .select().single();
        if (updateError) {
            if (updateError.message.includes('unique constraint "products_name_key"')) {
                toast.error('Erro: Já existe um produto/serviço com este nome.');
            } else { throw updateError; }
        } else { savedProduct = updatedProduct; successMessage = 'Produto/Serviço atualizado!'; }
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products').insert([dataToSubmit]).select().single();
        if (insertError) {
            if (insertError.message.includes('unique constraint "products_name_key"')) {
                toast.error('Erro: Já existe um produto/serviço com este nome.');
            } else { throw insertError; }
        } else { savedProduct = newProduct; successMessage = 'Produto/Serviço adicionado!'; }
      }
      if (savedProduct) {
        await fetchProducts(); toast.success(successMessage); resetForm();
      }
    } catch (err) {
      if (!(err.message.includes('unique constraint "products_name_key"'))) {
        console.error(`Erro:`, err.message); toast.error(`Erro: ${err.message}`);
      }
    } finally { setIsSubmitting(false); }
  };
  
  const handleEditProduct = (productToEdit) => {
    setIsEditing(true);
    setCurrentProductId(productToEdit.product_id);
    setFormData({
      name: productToEdit.name || '',
      description: productToEdit.description || '',
      unit_of_measure: productToEdit.unit_of_measure || '',
      purchase_price: productToEdit.purchase_price !== null ? String(productToEdit.purchase_price) : '',
      sale_price: productToEdit.sale_price !== null ? String(productToEdit.sale_price) : '',
      category: productToEdit.category || '',
      product_type: productToEdit.product_type || 'Ambos',
      is_active: productToEdit.is_active === null ? true : productToEdit.is_active,
    });
    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    toast.info(`Editando: ${productToEdit.name}`);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Excluir "${productName}"?`)) return;
    try {
      const tablesToCheck = ['sales', 'purchases'];
      let isInUse = false;
      for (const table of tablesToCheck) {
          const { count, error } = await supabase.from(table).select('product_id', {count: 'exact', head: true}).eq('product_id', productId);
          if (error) { console.warn(`Aviso: Não foi possível verificar uso em ${table}`); }
          else if (count > 0) {
              isInUse = true;
              toast.error(`Este item não pode ser excluído pois está em uso em ${table === 'sales' ? 'Vendas' : 'Compras'}.`);
              break;
          }
      }
      if (isInUse) return;
      const { error: deleteError } = await supabase.from('products').delete().eq('product_id', productId);
      if (deleteError) throw deleteError;
      setProducts(prev => prev.filter(p => p.product_id !== productId));
      toast.success(`"${productName}" excluído!`);
    } catch (err) {
      console.error('Erro ao excluir:', err.message);
      if (err.message.includes('violates foreign key constraint')) {
          toast.error('Este item não pode ser excluído pois está em uso.');
      } else { toast.error(`Erro ao excluir: ${err.message}`); }
    }
  };

  if (loadingProducts && products.length === 0) return <p style={{ padding: '20px' }}>Carregando...</p>;
  if (listError && products.length === 0) return <p style={{ color: 'red', padding: '20px' }}>Erro: {listError}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <style>{`
        .responsive-table-products {
          width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden;
        }
        .responsive-table-products thead tr { background-color: #e9ecef; color: #333; text-align: left; }
        .responsive-table-products th, .responsive-table-products td {
          padding: 10px 12px; border-bottom: 1px solid #ddd; text-align: left; color: #333; 
        }
        .responsive-table-products th { font-weight: bold; }
        .responsive-table-products tbody tr { background-color: #fff; border-bottom: 1px solid #eee; }
        .responsive-table-products tbody tr:nth-of-type(even) { background-color: #f8f9fa; }
        .responsive-table-products tbody tr:hover { background-color: #e9ecef; }
        .responsive-table-products .actions-cell { text-align: right; min-width: 160px; }
        .responsive-table-products .price-cell { text-align: right; min-width: 100px; }

        @media screen and (max-width: 768px) {
          .responsive-table-products thead { display: none; }
          .responsive-table-products tr {
            display: block; margin-bottom: 15px; border: 1px solid #ccc; 
            border-radius: 4px; background-color: #fff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .responsive-table-products td {
            display: block; text-align: right; padding-left: 45%; 
            position: relative; border-bottom: 1px dotted #eee; 
          }
          .responsive-table-products td:last-child { border-bottom: none; }
          .responsive-table-products td::before {
            content: attr(data-label); position: absolute; left: 10px; width: calc(45% - 20px); 
            padding-right: 10px; white-space: normal; text-align: left; font-weight: bold; color: #495057; 
          }
          .responsive-table-products td.actions-cell { text-align: center; padding-left: 10px; }
          .responsive-table-products td.actions-cell::before { content: "Ações:"; }
          .responsive-table-products td.actions-cell div { justify-content: center; flex-wrap: wrap; }
          .responsive-table-products td.actions-cell div button { margin: 5px; }
          .responsive-table-products td.price-cell { text-align: right; padding-left: 50%; }
          .responsive-table-products td.price-cell::before { width: calc(50% - 20px); }
        }
      `}</style>

      <h1>Gerenciar Produtos e Serviços</h1>
      
      <form onSubmit={handleSubmitProduct} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? `Editar Produto/Serviço` : 'Adicionar Novo Produto/Serviço'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Nome: *</label><input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle}/></div>
          <div><label htmlFor="category" style={{ display: 'block', marginBottom: '5px' }}>Categoria:</label><input type="text" id="category" name="category" value={formData.category} onChange={handleInputChange} style={inputStyle}/></div>
          <div><label htmlFor="product_type" style={{ display: 'block', marginBottom: '5px' }}>Tipo: *</label><select id="product_type" name="product_type" value={formData.product_type} onChange={handleInputChange} required style={selectStyle}>{productTypeOptions.map(type => (<option key={type} value={type}>{type}</option>))}</select></div>
        </div>
        <div style={{ marginBottom: '15px' }}><label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descrição:</label><textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" style={textareaStyle}/></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div><label htmlFor="unit_of_measure" style={{ display: 'block', marginBottom: '5px' }}>Un. Medida:</label><input type="text" id="unit_of_measure" name="unit_of_measure" value={formData.unit_of_measure} onChange={handleInputChange} placeholder="un, kg, L, hr" style={inputStyle}/></div>
          <div><label htmlFor="purchase_price" style={{ display: 'block', marginBottom: '5px' }}>Preço Compra (R$):</label><input type="number" id="purchase_price" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange} min="0" step="any" placeholder="0.00" style={inputStyle}/></div>
          <div><label htmlFor="sale_price" style={{ display: 'block', marginBottom: '5px' }}>Preço Venda (R$):</label><input type="number" id="sale_price" name="sale_price" value={formData.sale_price} onChange={handleInputChange} min="0" step="any" placeholder="0.00" style={inputStyle}/></div>
        </div>
        <div style={checkboxLabelStyle}><input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleInputChange} style={checkboxStyle} /><label htmlFor="is_active" style={{cursor: 'pointer'}}>Ativo</label></div>
        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1, fontSize: '1rem' }}>
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Produto/Serviço')}
            </button>
            {isEditing && (<button type="button" onClick={resetForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar Edição</button>)}
        </div>
      </form>

      <h2>Produtos/Serviços Cadastrados</h2>
      {loadingProducts && products.length > 0 && <p>Atualizando lista...</p>}
      {products.length === 0 && !loadingProducts && (<p>Nenhum produto ou serviço cadastrado.</p>)}
      
      {products.length > 0 && (
        <table className="responsive-table-products">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Un. Med.</th>
              <th className="price-cell">P. Compra</th>
              <th className="price-cell">P. Venda</th>
              <th>Status</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}> 
                <td data-label="Nome">{product.name}</td>
                <td data-label="Tipo">{product.product_type}</td>
                <td data-label="Categoria">{product.category || '-'}</td>
                <td data-label="Un. Med.">{product.unit_of_measure || '-'}</td>
                <td data-label="P. Compra" className="price-cell">{product.purchase_price !== null ? `R$ ${parseFloat(product.purchase_price).toFixed(2)}` : '-'}</td>
                <td data-label="P. Venda" className="price-cell">{product.sale_price !== null ? `R$ ${parseFloat(product.sale_price).toFixed(2)}` : '-'}</td>
                <td data-label="Status" style={{color: product.is_active ? 'green' : 'red', fontWeight: 'bold'}}>{product.is_active ? 'Ativo' : 'Inativo'}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    {/* BOTÕES COM ESTILO DEFINIDO */}
                    <button 
                      onClick={() => handleEditProduct(product)}
                      style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.product_id, product.name)} 
                      style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductsPage;