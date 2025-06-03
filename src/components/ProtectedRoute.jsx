import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Este componente recebe a sessão do usuário como prop
const ProtectedRoute = ({ session, children }) => {
  if (!session) {
    // Se não houver sessão (usuário não logado), redireciona para a página de autenticação
    return <Navigate to="/auth" replace />;
  }

  // Se houver sessão, renderiza o conteúdo da rota (ou <Outlet /> se for um layout)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;