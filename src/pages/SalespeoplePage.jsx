// src/pages/SalespeoplePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

// Estilos para o formulário (mantidos do seu código anterior)
const inputStyle = { 
  width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', 
  border: '1px solid #555', backgroundColor: '#333', color: 'white', fontSize: '1rem' 
};

function SalespeoplePage() {
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentSalespersonId, setCurrentSalespersonId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);

  async function fetchSalespeople() {
    setLoading(true);
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('salespeople')
        .select('*')
        .order('name', { ascending: true });
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

  useEffect(() => {
    document.title = 'Gestor App - Vendedores';
    fetchSalespeople();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
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
        } else {
            savedPerson = updatedPerson;
            successMessage = 'Vendedor atualizado com sucesso!';
        }
      } else {
        const { data: newPerson, error: insertError } = await supabase
          .from('salespeople').insert([dataToSubmit])
          .select().single();
        if (insertError) {
            if (insertError.message.includes('unique constraint') && insertError.message.includes('salespeople_email_key')) {
                toast.error('Erro: Email já cadastrado para outro vendedor.');
            } else { throw insertError; }
        } else {
            savedPerson = newPerson;
            successMessage = 'Vendedor adicionado com sucesso!';
        }
      }
      if (savedPerson){
        await fetchSalespeople(); 
        toast.success(successMessage);
        resetForm();
      }
    } catch (err) {
      if (!(err.message.includes('unique constraint') && err.message.includes('salespeople_email_key'))) {
        console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} vendedor:`, err.message);
        toast.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} vendedor: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSalesperson = async (salespersonId, personName) => {
    if (!window.confirm(`Você tem certeza que deseja excluir o vendedor "${personName}"?`)) return;
    try {
      const { error: deleteError } = await supabase
        .from('salespeople').delete().eq('salesperson_id', salespersonId);
      if (deleteError) throw deleteError;
      setSalespeople(prev => prev.filter(p => p.salesperson_id !== salespersonId));
      toast.success(`Vendedor "${personName}" excluído com sucesso!`);
    } catch (err) {
      console.error('Erro ao excluir vendedor:', err.message);
      toast.error(`Erro ao excluir vendedor: ${err.message}`);
    }
  };

  if (loading && salespeople.length === 0) return <p style={{padding: '20px'}}>Carregando vendedores...</p>;
  if (error && salespeople.length === 0) return <p style={{ color: 'red', padding: '20px' }}>Erro ao carregar vendedores: {error}</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      {/* Estilos para a tabela responsiva */}
      <style>{`
        .responsive-table-salespeople {
          width: 100%;
          border-collapse: collapse; /* Remove espaços entre bordas das células */
          margin-top: 20px;
          font-size: 0.9rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Sombra suave na tabela */
          border-radius: 4px; /* Cantos arredondados para a tabela toda */
          overflow: hidden; /* Garante que o box-shadow e border-radius funcionem bem */
        }
        .responsive-table-salespeople thead tr { /* Linha do cabeçalho */
          background-color: #e9ecef; /* Cinza claro para o fundo do cabeçalho */
          color: #333; /* Texto escuro para o cabeçalho */
          text-align: left;
        }
        .responsive-table-salespeople th,
        .responsive-table-salespeople td {
          padding: 12px 15px; /* Padding uniforme */
          border-bottom: 1px solid #ddd; /* Linha separadora apenas horizontal */
          text-align: left;
          color: #333; 
        }
        .responsive-table-salespeople th {
          font-weight: bold;
        }
        /* Estilo padrão para todas as linhas do corpo da tabela (linhas ímpares) */
        .responsive-table-salespeople tbody tr {
            background-color: #fff; /* Fundo BRANCO para linhas ímpares */
            border-bottom: 1px solid #eee; /* Linha separadora mais suave */
        }
        /* Efeito zebra para linhas pares */
        .responsive-table-salespeople tbody tr:nth-of-type(even) {
            background-color: #f8f9fa; /* Cinza BEM claro para linhas pares */
        }
        .responsive-table-salespeople tbody tr:hover {
            background-color: #e9ecef; /* Um cinza um pouco mais escuro no hover */
        }
        .responsive-table-salespeople .actions-cell {
          text-align: right; 
          min-width: 160px;
        }

        /* Media Query para tornar a tabela responsiva */
        @media screen and (max-width: 768px) {
          .responsive-table-salespeople {
            box-shadow: none; /* Remove sombra no mobile se os cards já tiverem a sua */
            border-radius: 0;
          }
          .responsive-table-salespeople thead {
            display: none; 
          }
          .responsive-table-salespeople tr {
            display: block;
            margin-bottom: 15px; 
            border: 1px solid #ddd; 
            border-radius: 4px; /* Cada linha vira um card */
            background-color: #fff !important; /* Garante fundo branco para os cards */
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .responsive-table-salespeople td {
            display: block;
            text-align: right; 
            padding-left: 50%; 
            position: relative;
            border-bottom: 1px dotted #eee; 
            /* Cor do texto já é #333, o que é bom para fundo branco */
          }
          .responsive-table-salespeople td:last-child {
            border-bottom: none; 
          }
          .responsive-table-salespeople td::before {
            content: attr(data-label); 
            position: absolute;
            left: 15px; /* Ajuste o padding */
            width: calc(50% - 25px); /* Ajuste a largura */
            padding-right: 10px;
            white-space: normal; /* Permite quebra de linha nos labels */
            text-align: left;
            font-weight: bold;
            color: #495057; /* Cor do label um pouco mais suave */
          }
          .responsive-table-salespeople td.actions-cell {
            text-align: center; /* Centraliza botões no mobile */
            padding-left: 15px; /* Reset padding */
            padding-top: 10px;
            padding-bottom: 10px;
          }
          .responsive-table-salespeople td.actions-cell::before {
            content: ""; /* Remove o "Ações:" se não quiser */
          }
          .responsive-table-salespeople td.actions-cell div {
            justify-content: center; /* Centraliza botões */
            flex-wrap: wrap; 
          }
           .responsive-table-salespeople td.actions-cell div button {
            margin: 5px; /* Espaço entre botões se quebrarem linha */
          }
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
          {/* Se quiser máscara para telefone aqui, precisaria do IMaskInput e handleMaskedValueChange */}
        </div>
        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
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
       {!loading && <p style={{ color: '#f0f0f0', fontWeight: 'bold', marginTop: '-10px', marginBottom: '10px' }}>Total de Vendedores: {salespeople.length}</p>}
      {loading && salespeople.length > 0 && <p>Atualizando lista...</p>}
      {salespeople.length === 0 && !loading && <p>Nenhum vendedor cadastrado ainda.</p>}
      
      {salespeople.length > 0 && (
        <table className="responsive-table-salespeople"> {/* Adicionada classe aqui */}
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {salespeople.map((person) => (
              <tr key={person.salesperson_id}> 
                <td data-label="Nome">{person.name}</td>
                <td data-label="Email">{person.email || '-'}</td>
                <td data-label="Telefone">{person.phone || '-'}</td>
                <td className="actions-cell" data-label="Ações">
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button 
                      onClick={() => handleEditSalesperson(person)}
                      style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteSalesperson(person.salesperson_id, person.name)} 
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

export default SalespeoplePage;