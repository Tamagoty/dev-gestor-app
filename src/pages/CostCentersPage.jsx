// src/pages/CostCentersPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

// Estilos (reutilizados)
const inputStyle = {
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px',
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem',
};
const textareaStyle = { ...inputStyle, height: 'auto', minHeight: '80px', resize: 'vertical' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '10px', color: '#333', margin: '10px 0' };
const checkboxStyle = { width: 'auto', height: 'auto', accentColor: '#007bff' };

const initialFormData = {
  name: '',
  description: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  is_active: true,
};

function CostCentersPage() {
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCostCenterId, setCurrentCostCenterId] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Gestor App - Centros de Custo';
    fetchCostCenters();
  }, []);

  async function fetchCostCenters() {
    setLoading(true);
    try {
      setListError(null);
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setCostCenters(data || []);
    } catch (err) {
      console.error('Erro ao buscar centros de custo:', err.message);
      setListError(err.message);
      setCostCenters([]);
      toast.error('Falha ao carregar centros de custo.');
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

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setCurrentCostCenterId(null);
  };

  const handleSubmitCostCenter = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error('O Nome do centro de custo é obrigatório.');
      return;
    }
    if (!formData.start_date) {
      toast.error('A Data de Início é obrigatória.');
      return;
    }
    let endDateToSubmit = formData.end_date.trim() === '' ? null : formData.end_date;
    if (!formData.is_active && !endDateToSubmit) {
        endDateToSubmit = new Date().toISOString().split('T')[0];
    }
    if (formData.is_active) {
        endDateToSubmit = null;
    }
    if (endDateToSubmit && formData.start_date && new Date(endDateToSubmit) < new Date(formData.start_date)) {
        toast.error('A Data de Finalização não pode ser anterior à Data de Início.');
        return;
    }
    if (endDateToSubmit) {
        const today = new Date(); today.setHours(0, 0, 0, 0); 
        const [year, month, day] = endDateToSubmit.split('-').map(Number);
        const parsedEndDate = new Date(Date.UTC(year, month - 1, day));
        if (parsedEndDate > today) {
            toast.error('A Data de Finalização não pode ser uma data futura.');
            return;
        }
    }
    setIsSubmitting(true);
    const dataToSubmit = {
      name: formData.name.trim(),
      description: formData.description.trim() === '' ? null : formData.description.trim(),
      start_date: formData.start_date,
      end_date: endDateToSubmit,
      is_active: formData.is_active,
    };
    try {
      let savedCostCenter = null;
      let successMessage = '';
      if (isEditing && currentCostCenterId) {
        const { data: updatedCostCenter, error: updateError } = await supabase
          .from('cost_centers').update(dataToSubmit).eq('cost_center_id', currentCostCenterId)
          .select().single();
        if (updateError) {
            if (updateError.message.includes('unique constraint "cost_centers_name_key"')) {
                toast.error('Erro: Já existe um centro de custo com este nome.');
            } else { throw updateError; }
        } else { savedCostCenter = updatedCostCenter; successMessage = 'Centro de Custo atualizado!'; }
      } else {
        const { data: newCostCenter, error: insertError } = await supabase
          .from('cost_centers').insert([dataToSubmit]).select().single();
        if (insertError) {
            if (insertError.message.includes('unique constraint "cost_centers_name_key"')) {
                toast.error('Erro: Já existe um centro de custo com este nome.');
            } else { throw insertError; }
        } else { savedCostCenter = newCostCenter; successMessage = 'Centro de Custo adicionado!'; }
      }
      if (savedCostCenter) {
        await fetchCostCenters(); 
        toast.success(successMessage);
        resetForm();
      }
    } catch (err) {
      if (!(err.message.includes('unique constraint "cost_centers_name_key"'))) {
        console.error(`Erro:`, err.message); toast.error(`Erro: ${err.message}`);
      }
    } finally { setIsSubmitting(false); }
  };
  
  const handleEditCostCenter = (ccToEdit) => {
    setIsEditing(true);
    setCurrentCostCenterId(ccToEdit.cost_center_id);
    setFormData({
      name: ccToEdit.name || '',
      description: ccToEdit.description || '',
      start_date: ccToEdit.start_date ? new Date(ccToEdit.start_date + 'T00:00:00Z').toISOString().split('T')[0] : '',
      end_date: ccToEdit.end_date ? new Date(ccToEdit.end_date + 'T00:00:00Z').toISOString().split('T')[0] : '',
      is_active: ccToEdit.is_active === null ? true : ccToEdit.is_active,
    });
    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    toast.info(`Editando: ${ccToEdit.name}`);
  };

  const handleDeleteCostCenter = async (ccId, ccName) => {
    if (!window.confirm(`Excluir "${ccName}"?`)) return;
    try {
      const tablesToCheck = ['sales', 'purchases', 'partner_withdrawals'];
      let isInUse = false;
      for (const table of tablesToCheck) {
          const { count, error } = await supabase.from(table).select('cost_center_id', {count: 'exact', head: true}).eq('cost_center_id', ccId);
          if (error) { console.warn(`Aviso: Não foi possível verificar uso em ${table}`); }
          else if (count > 0) {
              isInUse = true;
              toast.error(`Este CC não pode ser excluído pois está em uso em ${table}.`);
              break;
          }
      }
      if (isInUse) return;
      const { error: deleteError } = await supabase.from('cost_centers').delete().eq('cost_center_id', ccId);
      if (deleteError) throw deleteError;
      setCostCenters(prev => prev.filter(cc => cc.cost_center_id !== ccId));
      toast.success(`"${ccName}" excluído com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir CC:', err.message);
      if (err.message.includes('violates foreign key constraint')) {
          toast.error('Este CC não pode ser excluído pois está em uso.');
      } else { toast.error(`Erro ao excluir: ${err.message}`); }
    }
  };

  if (loading && costCenters.length === 0) return <p style={{ padding: '20px' }}>Carregando...</p>;
  if (listError && costCenters.length === 0) return <p style={{ color: 'red', padding: '20px' }}>Erro: {listError}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      {/* CSS para a tabela responsiva de Centros de Custo */}
      <style>{`
        .responsive-table-costcenters {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .responsive-table-costcenters thead tr {
          background-color: #e9ecef;
          color: #333;
          text-align: left;
        }
        .responsive-table-costcenters th, 
        .responsive-table-costcenters td {
          padding: 12px 15px;
          border-bottom: 1px solid #ddd;
          text-align: left;
          color: #333; 
        }
        .responsive-table-costcenters th {
          font-weight: bold;
        }
        .responsive-table-costcenters tbody tr {
            background-color: #fff;
            border-bottom: 1px solid #eee;
        }
        .responsive-table-costcenters tbody tr:nth-of-type(even) {
            background-color: #f8f9fa;
        }
        .responsive-table-costcenters tbody tr:hover {
            background-color: #e9ecef;
        }
        .responsive-table-costcenters .actions-cell {
          text-align: right; 
          min-width: 160px;
        }

        @media screen and (max-width: 768px) {
          .responsive-table-costcenters thead {
            display: none; 
          }
          .responsive-table-costcenters tr {
            display: block;
            margin-bottom: 15px; 
            border: 1px solid #ccc; 
            border-radius: 4px;
            background-color: #fff !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .responsive-table-costcenters td {
            display: block;
            text-align: right; 
            padding-left: 50%; 
            position: relative;
            border-bottom: 1px dotted #eee; 
          }
          .responsive-table-costcenters td:last-child {
            border-bottom: none; 
          }
          .responsive-table-costcenters td::before {
            content: attr(data-label); 
            position: absolute;
            left: 15px; 
            width: calc(50% - 25px); 
            padding-right: 10px;
            white-space: normal; 
            text-align: left;
            font-weight: bold;
            color: #495057; 
          }
          .responsive-table-costcenters td.actions-cell {
            text-align: center; 
            padding-left: 15px; 
          }
          .responsive-table-costcenters td.actions-cell::before {
            content: "Ações:"; 
          }
          .responsive-table-costcenters td.actions-cell div {
            justify-content: center; 
            flex-wrap: wrap;
          }
           .responsive-table-costcenters td.actions-cell div button {
            margin: 5px; 
          }
        }
      `}</style>

      <h1>Gerenciar Centros de Custo</h1>
      
      <form onSubmit={handleSubmitCostCenter} ref={formRef} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', color: '#333' }}>
        <h2>{isEditing ? `Editar Centro de Custo` : 'Adicionar Novo Centro de Custo'}</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Nome do Centro de Custo: *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required style={inputStyle}/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descrição:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" style={textareaStyle}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label htmlFor="start_date" style={{ display: 'block', marginBottom: '5px' }}>Data de Início: *</label>
            <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleInputChange} required style={inputStyle}/>
          </div>
          <div>
            <label htmlFor="end_date" style={{ display: 'block', marginBottom: '5px' }}>Data de Finalização:</label>
            <input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleInputChange} style={inputStyle} disabled={formData.is_active}/>
            {formData.is_active && <small style={{display: 'block', marginTop: '5px'}}>A data final só pode ser definida se o centro de custo estiver inativo.</small>}
          </div>
        </div>
        <div style={checkboxLabelStyle}>
          <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleInputChange} style={checkboxStyle} />
          <label htmlFor="is_active" style={{cursor: 'pointer'}}>Ativo</label>
        </div>
        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', backgroundColor: isEditing ? '#ffc107' : '#007bff', color: isEditing ? '#333' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexGrow: 1, fontSize: '1rem' }}>
            {isSubmitting ? (isEditing ? 'Salvando...' : 'Adicionando...') : (isEditing ? 'Salvar Alterações' : 'Adicionar Centro de Custo')}
            </button>
            {isEditing && (
            <button type="button" onClick={resetForm} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar Edição
            </button>
            )}
        </div>
      </form>

      <h2>Centros de Custo Cadastrados</h2>
      {loading && costCenters.length > 0 && <p>Atualizando lista...</p>}
      {costCenters.length === 0 && !loading && <p>Nenhum centro de custo cadastrado ainda.</p>}
      
      {costCenters.length > 0 && (
        <table className="responsive-table-costcenters">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Data Início</th>
              <th>Data Fim</th>
              <th>Status</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {costCenters.map((cc) => (
              <tr key={cc.cost_center_id}> 
                <td data-label="Nome">{cc.name}</td>
                <td data-label="Descrição">{cc.description || '-'}</td>
                <td data-label="Data Início">{cc.start_date ? new Date(cc.start_date + 'T00:00:00Z').toLocaleDateString() : '-'}</td>
                <td data-label="Data Fim">{cc.end_date ? new Date(cc.end_date + 'T00:00:00Z').toLocaleDateString() : (cc.is_active ? 'Em aberto' : '-')}</td>
                <td data-label="Status" style={{color: cc.is_active ? 'green' : 'red', fontWeight: 'bold'}}>{cc.is_active ? 'Ativo' : 'Inativo'}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button 
                      onClick={() => handleEditCostCenter(cc)}
                      style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteCostCenter(cc.cost_center_id, cc.name)} 
                      style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
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

export default CostCentersPage;