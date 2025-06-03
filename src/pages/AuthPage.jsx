// src/pages/AuthPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ajuste o caminho se necessário

function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true); // Controla qual formulário mostrar
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // Para feedback

   useEffect(() => {
    document.title = `Gestor App - ${isLoginView ? 'Login' : 'Cadastro'}`;
  }, [isLoginView]); 
  
  const handleAuthAction = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' }); // Limpa mensagens anteriores

    try {
      let error;
      if (isLoginView) {
        // Tentativa de Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        error = signInError;
      } else {
        // Tentativa de Cadastro
        const { error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        error = signUpError;
        if (!error) {
          setMessage({ type: 'success', text: 'Cadastro realizado! Verifique seu email para confirmar a conta.' });
        }
      }

      if (error) {
        throw error;
      }
      // Se o login for bem-sucedido, o listener onAuthStateChange no App.jsx
      // cuidará de atualizar a sessão e redirecionar.
      // Para o cadastro, mostramos a mensagem de confirmação.

    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
    } finally {
      setLoading(false);
      // Não limpamos email/senha aqui para o caso de erro de digitação no login,
      // mas limpamos se for um cadastro bem-sucedido (já feito pela mensagem).
      if (!isLoginView && !message.text.startsWith('Erro')) {
          // setEmail(''); // Opcional: limpar campos após cadastro bem-sucedido
          // setPassword('');
      }
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setMessage({ type: '', text: '' }); // Limpa mensagens ao trocar de formulário
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
        {isLoginView ? 'Login no Sistema' : 'Crie sua Conta'}
      </h2>
      
      <form onSubmit={handleAuthAction}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="seuemail@exemplo.com"
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold' }}>Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="Sua senha"
          />
        </div>
        
        {message.text && (
          <p style={{ 
            color: message.type === 'error' ? '#D8000C' : '#4F8A10', 
            backgroundColor: message.type === 'error' ? '#FFD2D2' : '#DFF2BF',
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {message.text}
          </p>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#ccc' : (isLoginView ? '#007bff' : '#28a745'), 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processando...' : (isLoginView ? 'Entrar' : 'Cadastrar')}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#555' }}>
        {isLoginView ? "Não tem uma conta? " : "Já tem uma conta? "}
        <button 
          onClick={toggleView} 
          style={{ 
            color: '#007bff', 
            background: 'none', 
            border: 'none', 
            padding: 0, 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontWeight: 'bold'
          }}
        >
          {isLoginView ? 'Cadastre-se' : 'Faça Login'}
        </button>
      </p>
    </div>
  );
}

export default AuthPage;