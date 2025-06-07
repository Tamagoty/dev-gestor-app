// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Toaster } from 'react-hot-toast';


const NAVBAR_HEIGHT = '70px';

function Layout({ session }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    navigate('/auth');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkStyles = ({ isActive }) => ({
    color: isActive ? '#61dafb' : '#ddd',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
  });

  const mobileNavLinkStyles = ({ isActive }) => ({
    ...navLinkStyles({ isActive }),
    display: 'block',
    padding: '12px 20px',
    borderBottom: '1px solid #444',
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <div>
      <style>{`
        .desktop-nav-links { display: flex; align-items: center; gap: 20px; }
        .mobile-menu-button { display: none; background: none; border: none; color: white; font-size: 2rem; cursor: pointer; }
        .mobile-nav-menu { display: none; position: absolute; top: ${NAVBAR_HEIGHT}; left: 0; right: 0; background-color: #282c34; z-index: 999; border-top: 1px solid #444; }
        .mobile-nav-menu.open { display: block; }
        
        @media (max-width: 768px) {
          .desktop-nav-links > a, .desktop-nav-links > span { display: none; }
          .user-info-desktop .logout-button-desktop { display: none; }
          .mobile-menu-button { display: block; }
          .app-title-link { margin-right: auto; }
        }
      `}</style>

      <div><Toaster position="top-right" reverseOrder={false} /></div>

      <nav style={{
        backgroundColor: '#20232a',
        padding: '0 1rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: NAVBAR_HEIGHT,
        zIndex: 1000,
      }}>
        <NavLink to="/" className="app-title-link" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textDecoration: 'none' }} onClick={closeMobileMenu}>
          Gestor App
        </NavLink>

        <div className="desktop-nav-links">
          {session && (
            <>
              <NavLink to="/" style={navLinkStyles} onClick={closeMobileMenu}>Início</NavLink>
              <NavLink to="/vendedores" style={navLinkStyles} onClick={closeMobileMenu}>Vendedores</NavLink>
              <NavLink to="/merchants" style={navLinkStyles} onClick={closeMobileMenu}>Clientes Fornecedores</NavLink>
              <NavLink to="/socios" style={navLinkStyles} onClick={closeMobileMenu}>Sócios</NavLink>
              <NavLink to="/vendas" style={navLinkStyles} onClick={closeMobileMenu}>Vendas</NavLink>
              <NavLink to="/compras" style={navLinkStyles} onClick={closeMobileMenu}>Compras</NavLink>
              <NavLink to="/retiradas-socios" style={navLinkStyles} onClick={closeMobileMenu}>Retiradas Sócios</NavLink>
              <NavLink to="/produtos" style={navLinkStyles} onClick={closeMobileMenu}>Produtos Serviços</NavLink>
              <NavLink to="/centros-de-custo" style={navLinkStyles} onClick={closeMobileMenu}>Centros Custo</NavLink>
              {/* ====================================================== */}
              {/* ========= LINK PARA RELATÓRIOS ADICIONADO AQUI ========= */}
              {/* ====================================================== */}
              <NavLink to="/relatorios" style={navLinkStyles} onClick={closeMobileMenu}>Relatórios</NavLink>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!session ? (
            <NavLink to="/auth" className="desktop-nav-links" style={navLinkStyles} onClick={closeMobileMenu}>
              Login
            </NavLink>
          ) : (
            <span className="desktop-nav-links user-info-desktop" style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontStyle: 'italic', marginRight: '10px' }}>
                Olá, {session.user.email.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="logout-button-desktop" style={{ background: '#61dafb', border: 'none', color: '#20232a', cursor: 'pointer', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
                Sair
              </button>
            </span>
          )}
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            ☰
          </button>
        </div>
      </nav>

      {session && (
        <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <NavLink to="/" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Início</NavLink>
          <NavLink to="/vendedores" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Vendedores</NavLink>
          <NavLink to="/merchants" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Clientes Fornecedores</NavLink>
          <NavLink to="/socios" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Sócios</NavLink>
          <NavLink to="/vendas" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Vendas</NavLink>
          <NavLink to="/compras" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Compras</NavLink>
          <NavLink to="/retiradas-socios" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Retiradas Sócios</NavLink>
          <NavLink to="/produtos" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Produtos Serviços</NavLink>
          <NavLink to="/centros-de-custo" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Centros Custo</NavLink>
          {/* ====================================================== */}
          {/* ====== LINK PARA RELATÓRIOS ADICIONADO AQUI TAMBÉM ===== */}
          {/* ====================================================== */}
          <NavLink to="/relatorios" style={mobileNavLinkStyles} onClick={closeMobileMenu}>Relatórios</NavLink>
          
          <div style={{ padding: '10px 20px', borderTop: '1px solid #444', marginTop: '10px' }}>
            <span style={{ display: 'block', marginBottom: '10px', fontStyle: 'italic' }}>
              Olá, {session.user.email.split('@')[0]}
            </span>
            <button onClick={handleLogout} style={{ background: '#61dafb', width: '100%', border: 'none', color: '#20232a', cursor: 'pointer', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
              Sair
            </button>
          </div>
        </div>
      )}

      <main style={{
        padding: '20px',
        paddingTop: `calc(${NAVBAR_HEIGHT} + 20px)`
      }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;