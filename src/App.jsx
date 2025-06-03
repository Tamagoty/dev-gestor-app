// src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import { supabase } from './lib/supabaseClient';

import SalespeoplePage from './pages/SalespeoplePage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MerchantsPage from './pages/MerchantsPage';
import PartnersPage from './pages/PartnersPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import PartnerWithdrawalsPage from './pages/PartnerWithdrawalsPage';
import ProductsPage from './pages/ProductsPage';
import CostCentersPage from './pages/CostCentersPage';


function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const navigate = useNavigate(); // Hook para navegação programática

  useEffect(() => {
    setLoadingSession(true);
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        // Se o usuário deslogar ou a sessão expirar e ele estava em uma rota protegida,
        // pode ser útil redirecioná-lo, embora o ProtectedRoute já vá fazer isso.
        // Se _event === 'SIGNED_OUT' && !currentSession) navigate('/auth');
      }
    );
    return () => subscription?.unsubscribe();
  }, [navigate]); // Adicionado navigate como dependência, embora não seja estritamente necessário para esta lógica

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // O onAuthStateChange cuidará de setar a session para null.
    // O ProtectedRoute cuidará do redirecionamento se estiver em rota protegida.
    // Podemos forçar um redirecionamento para /auth se quisermos.
    navigate('/auth');
  };

  if (loadingSession) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Carregando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas Públicas e Layout Principal */}
      <Route element={<Layout session={session} />}>
        {/* Rota Inicial (Home/Dashboard) - Protegida */}
        <Route
          path="/"
          element={
            <ProtectedRoute session={session}>
              <HomePage session={session} />
            </ProtectedRoute>
          }
        />
        {/* Rota de Vendedores - Protegida */}
        <Route
          path="/vendedores"
          element={
            <ProtectedRoute session={session}>
              <SalespeoplePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/merchants" // Ou o caminho que preferir
          element={
            <ProtectedRoute session={session}>
              <MerchantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/socios" // Ou /partners
          element={
            <ProtectedRoute session={session}>
              <PartnersPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/vendas" // 2. Nova Rota
          element={
            <ProtectedRoute session={session}>
              <SalesPage />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/compras" // 2. Nova Rota
          element={
            <ProtectedRoute session={session}>
              <PurchasesPage />
            </ProtectedRoute>
          } 
        />
           <Route 
          path="/retiradas-socios" // 2. Nova Rota
          element={
            <ProtectedRoute session={session}>
              <PartnerWithdrawalsPage />
            </ProtectedRoute>
          } 
        />
          <Route 
          path="/produtos" // 2. Nova Rota
          element={
            <ProtectedRoute session={session}>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />
         <Route 
          path="/centros-de-custo" // 2. Nova Rota
          element={
            <ProtectedRoute session={session}>
              <CostCentersPage />
            </ProtectedRoute>
          } 
        />
        {/* Adicione mais rotas protegidas aqui dentro do Layout */}
      </Route>

      {/* Rota de Autenticação (Pública) - Fora do Layout Principal com Navbar */}
      <Route
        path="/auth"
        element={!session ? <AuthPage /> : <Navigate to="/" replace />} // Se logado, redireciona para home
      />

      {/* Rota Catch-all para páginas não encontradas (opcional) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;