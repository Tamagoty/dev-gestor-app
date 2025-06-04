// src/pages/SalespeoplePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

// Estilos
const inputStyle = { 
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', 
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem' 
};
const toggleContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '15px 0',
  color: '#333', 
};

// Ícones SVG para ordenação e ações
const SortAscIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);
const SortDescIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M19 12l-7 7-7-7"/>
  </svg>
);
const SortNeutralIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
    <path d="M12 19V5M5 12l7-7 7 7M12 5v14M19 12l-7 7-7-7" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);


function SalespeoplePage() {
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', is_active: true });
  const [isEditing, setIsEditing] = useState(false);
  const [currentSalespersonId, setCurrentSalespersonId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [salespersonToDelete, setSalespersonToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); 

  const [sortColumn, setSortColumn] = useState('name'); 
  const [sortDirection, setSortDirection] = useState('asc'); 
  const [filterText, setFilterText] = useState(''); // << NOVO ESTADO PARA FILTRO

  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Gestor App - Vendedores';
    fetchSalespeople();
  }, [sortColumn, sortDirection, filterText]); // << ADICIONADO filterText como dependência

  async function fetchSalespeople() {
    setLoading(true);
    try {
      setError(null);
      let query = supabase
        .from('salespeople')
        .select('*');

      // Aplica filtro se houver texto
      if (filterText.trim() !== '') {
        query = query.or(`name.ilike.%${filterText.trim()}%,email.ilike.%${filterText.trim()}%`);
      }

      query = query.order(sortColumn, { ascending: sortDirection === 'asc' }); 
      
      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setSalespeople(data || []);
    } catch (err) {
      console.error('Erro ao buscar vendedores:', err.message);
      setError(err.message);
      setSalespeople([]);
      toast.error('Falha ao carregar vendedores.');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // << NOVA FUNÇÃO PARA O FILTRO >>
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', is_active: true });
    setIsEditing(false);
    setCurrentSalespersonId(null);
  };

  const handleEditSalesperson = (personToEdit) => {
    setIsEditing(true);
    setCurrentSalespersonId(personToEdit.salesperson_id);
    setFormData({
      name: personToEdit.name || '',
      email: personToEdit.email || '',
      phone: personToEdit.phone || '',
      is_active: personToEdit.is_active === null ? true : personToEdit.is_active,
    });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    toast(`Editando vendedor: ${personToEdit.name}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) { 
      toast.error('O nome do vendedor não pode conter apenas espaços em branco.'); 
      return;
    }
    
    const cleanName = formData.name.trim();
    const dataToSubmit = {
        name: cleanName,
        email: formData.email.trim() === '' ? null : formData.email.trim(),
        phone: formData.phone.trim() === '' ? null : formData.phone.trim(),
        is_active: formData.is_active,
    };
    setIsSubmitting(true);
    try {
      let savedPerson = null;
      let successMessage = '';
      if (isEditing) {
        const { data: updatedPerson, error: updateError } = await supabase
          .from('salespeople').update(dataToSubmit).eq('salesperson_id', currentSalespersonId)
          .select().single();
        if (updateError) {
            if (updateError.message.includes('unique constraint') && updateError.message.includes('salespeople_email_key')) {
                toast.error('Erro: Email já cadastrado para outro vendedor.');
            } else { throw updateError; }
        } else { savedPerson = updatedPerson; successMessage = 'Vendedor atualizado!'; }
      } else {
        const { data: newPerson, error: insertError } = await supabase
          .from('salespeople').insert([dataToSubmit])
          .select().single();
        if (insertError) {
            if (insertError.message.includes('unique constraint') && insertError.message.includes('salespeople_email_key')) {
                toast.error('Erro: Email já cadastrado para outro vendedor.');
            } else { throw insertError; }
        } else { savedPerson = newPerson; successMessage = 'Vendedor adicionado!'; }
      }
      if (savedPerson){
        await fetchSalespeople(); 
        toast.success(successMessage);
        resetForm();
      }
    } catch (err) {
      if (!(err.message.includes('unique constraint') && err.message.includes('salespeople_email_key'))) {
        console.error(`Erro:`, err.message); toast.error(`Erro: ${err.message}`);
      }
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteSalesperson = (person) => { 
    setSalespersonToDelete(person); 
    setShowDeleteModal(true); 
  };

  const confirmDeleteSalesperson = async () => {
    if (!salespersonToDelete) return;
    setIsDeleting(true); 
    try {
      const { count, error: checkError } = await supabase
        .from('sales')
        .select('salesperson_id', { count: 'exact', head: true })
        .eq('salesperson_id', salespersonToDelete.salesperson_id);
      if (checkError) {
        console.error("Erro ao verificar uso do vendedor:", checkError.message);
        toast.error("Erro ao verificar se o vendedor está em uso. Exclusão não realizada.");
        setIsDeleting(false); setShowDeleteModal(false); setSalespersonToDelete(null); return;
      }
      if (count > 0) {
        toast.error(`O vendedor "${salespersonToDelete.name}" não pode ser excluído pois está associado a ${count} venda(s).`);
        setIsDeleting(false); setShowDeleteModal(false); setSalespersonToDelete(null); return;
      }
      const { error: deleteError } = await supabase
        .from('salespeople').delete().eq('salesperson_id', salespersonToDelete.salesperson_id);
      if (deleteError) {
        console.error('Erro Supabase ao excluir vendedor:', deleteError.message);
        throw deleteError; 
      }
      await fetchSalespeople();
      toast.success(`Vendedor "${salespersonToDelete.name}" excluído com sucesso!`);
    } catch (err) {
      console.error('Erro CATCH ao excluir vendedor:', err);
      toast.error(`Falha ao excluir: ${err.message || 'Permissão negada.'}`);
    } finally {
      setShowDeleteModal(false); setSalespersonToDelete(null); setIsDeleting(false); 
    }
  };

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prevDir => prevDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (columnName) => {
    if (sortColumn !== columnName) { return <SortNeutralIcon />; }
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  if (loading && salespeople.length === 0 && !filterText) return <p style={{padding: '20px'}}>Carregando vendedores...</p>;
  if (error && salespeople.length === 0 && !filterText) return <p style={{ color: 'red', padding: '20px' }}>Erro ao carregar vendedores: {error}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <style>{`
        .responsive-table-salespeople { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; }
        .responsive-table-salespeople thead { background-color: #f0f0f0; color: #333; }
        .responsive-table-salespeople th, .responsive-table-salespeople td { border: 1px solid #ddd; padding: 10px; text-align: left; color: #333; }
        .responsive-table-salespeople th { font-weight: bold; cursor: pointer; user-select: none; }
        .responsive-table-salespeople th:hover { background-color: #d8dcdf; }
        .responsive-table-salespeople .sort-icon { margin-left: 5px; display: inline-block; vertical-align: middle; }
        .responsive-table-salespeople tbody tr { background-color: #fff; }
        .responsive-table-salespeople tbody tr:nth-of-type(even) { background-color: #f9f9f9; }
        .responsive-table-salespeople tbody tr:hover { background-color: #f1f1f1; }
        .responsive-table-salespeople .actions-cell { text-align: center; min-width: 120px; } /* Ajustado para 2 botões com ícone */
        @media screen and (max-width: 768px) {
          .responsive-table-salespeople thead { display: none; }
          .responsive-table-salespeople tr { display: block; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff !important; }
          .responsive-table-salespeople td { display: block; text-align: right; padding-left: 50%; position: relative; border-bottom: 1px dotted #eee; }
          .responsive-table-salespeople td:last-child { border-bottom: none; }
          .responsive-table-salespeople td::before { content: attr(data-label); position: absolute; left: 10px; width: calc(50% - 20px); padding-right: 10px; white-space: nowrap; text-align: left; font-weight: bold; color: #555; }
          .responsive-table-salespeople td.actions-cell { text-align: left; padding-left: 10px; }
          .responsive-table-salespeople td.actions-cell::before { content: "Ações:"; }
          .responsive-table-salespeople td.actions-cell div { justify-content: flex-start; flex-wrap: wrap; }
          .responsive-table-salespeople td.actions-cell div button { margin-bottom: 5px; }
        }
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 28px; }
        .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .toggle-slider { background-color: #28a745; }
        input:focus + .toggle-slider { box-shadow: 0 0 1px #28a745; }
        input:checked + .toggle-slider:before { transform: translateX(22px); }
        .filter-container { margin-bottom: 20px; margin-top: 10px; } /* Adicionado margin-top */
        .filter-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          color: #333; 
          background-color: #fff; 
        }
      `}</style>

      <h1>Gerenciar Vendedores</h1>

      <form onSubmit={handleSubmit} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? `Editar Vendedor` : 'Adicionar Novo Vendedor'}</h2>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Nome: *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>Telefone:</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle}/>
        </div>
        <div style={toggleContainerStyle}>
          <label htmlFor="is_active_salesperson" style={{ cursor: 'pointer', marginRight: '10px' }}>Status:</label> {/* ID único para o input */}
          <label className="toggle-switch">
            <input type="checkbox" id="is_active_salesperson" name="is_active" checked={formData.is_active} onChange={handleInputChange}/>
            <span className="toggle-slider"></span>
          </label>
          <span style={{ marginLeft: '10px', fontWeight: formData.is_active ? 'bold' : 'normal', color: formData.is_active ? 'green' : '#777' }}>
            {formData.is_active ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#28a745', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1 }}>
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Vendedor')}
            </button>
            {isEditing && (
            <button type="button" onClick={resetForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar Edição
            </button>
            )}
        </div>
      </form>

      <h2>Vendedores Cadastrados</h2>
      
      {/* --- CAMPO DE FILTRO --- */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filtrar por nome ou email..."
          className="filter-input"
          value={filterText}
          onChange={handleFilterChange}
        />
      </div>
      {/* --- FIM DO CAMPO DE FILTRO --- */}

      {!loading && <p style={{ color: '#333', fontWeight: 'bold', marginTop: '0px', marginBottom: '10px' }}>Total de Vendedores: {salespeople.length} (Exibindo)</p>}
      {loading && salespeople.length === 0 && !filterText && <p>Carregando vendedores...</p>}
      {salespeople.length === 0 && !loading && <p>Nenhum vendedor encontrado {filterText ? `para "${filterText}"` : 'cadastrado ainda.'}</p>}
      {loading && salespeople.length > 0 && <p>Atualizando lista...</p>}
      
      {salespeople.length > 0 && (
        <table className="responsive-table-salespeople">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>Nome <span className="sort-icon">{renderSortIcon('name')}</span></th>
              <th onClick={() => handleSort('email')}>Email <span className="sort-icon">{renderSortIcon('email')}</span></th>
              <th onClick={() => handleSort('phone')}>Telefone <span className="sort-icon">{renderSortIcon('phone')}</span></th>
              <th onClick={() => handleSort('is_active')}>Status <span className="sort-icon">{renderSortIcon('is_active')}</span></th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {salespeople.map((person) => (
              <tr key={person.salesperson_id}> 
                <td data-label="Nome">{person.name}</td>
                <td data-label="Email">{person.email || '-'}</td>
                <td data-label="Telefone">{person.phone || '-'}</td>
                <td data-label="Status" style={{ color: person.is_active ? 'green' : 'red', fontWeight: 'bold' }}>
                  {person.is_active ? 'Ativo' : 'Inativo'}
                </td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    {/* BOTÕES COM ÍCONES */}
                    <button 
                      onClick={() => handleEditSalesperson(person)}
                      title="Editar"
                      style={{ padding: '6px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <EditIcon />
                    </button>
                    <button 
                      onClick={() => handleDeleteSalesperson(person)} 
                      title="Excluir"
                      style={{ padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteSalesperson}
        title="Confirmar Exclusão de Vendedor"
        message={ salespersonToDelete ? <>Deseja realmente excluir o vendedor <strong>{salespersonToDelete.name}</strong>? Esta ação não pode ser desfeita.</> : "Deseja realmente excluir este item?" }
        confirmText="Excluir Vendedor"
        cancelText="Cancelar"
        isLoading={isDeleting}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

export default SalespeoplePage;
