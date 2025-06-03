// src/components/ConfirmationModal.jsx
import React from 'react';

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Ação",
  message = "Você tem certeza que deseja prosseguir com esta ação?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonClass = "bg-red-600 hover:bg-red-700", // Mantido para customização, mas usaremos estilos base
  isLoading = false,
}) {
  if (!isOpen) {
    return null;
  }

  // Estilos base para os botões (podem ser sobrescritos/complementados por confirmButtonClass se necessário)
  const baseButtonStyles = {
    padding: '0.5rem 1rem', // px-4 py-2
    borderRadius: '0.375rem', // rounded-md
    fontSize: '0.875rem', // text-sm
    fontWeight: 500, // font-medium
    transition: 'background-color 0.2s ease-in-out, opacity 0.2s ease-in-out',
    cursor: 'pointer',
    border: 'none',
  };

  const cancelButtonStyles = {
    ...baseButtonStyles,
    backgroundColor: '#e5e7eb', // bg-gray-200
    color: '#374151', // text-gray-700
  };
  
  const confirmButtonBaseStyles = {
    ...baseButtonStyles,
    color: 'white',
  };
  
  // Tenta aplicar a cor de fundo da classe Tailwind, se possível, ou usa um padrão
  // Esta parte é uma tentativa, pode não funcionar 100% para todas as classes Tailwind
  let finalConfirmButtonStyles = { ...confirmButtonBaseStyles };
  if (confirmButtonClass.includes('bg-red-600')) {
    finalConfirmButtonStyles.backgroundColor = '#dc2626'; // Cor exata para bg-red-600
  } else if (confirmButtonClass.includes('bg-blue-600')) {
    finalConfirmButtonStyles.backgroundColor = '#2563eb'; // Cor exata para bg-blue-600
  } else {
    finalConfirmButtonStyles.backgroundColor = '#dc2626'; // Fallback para vermelho
  }


  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1050,
    opacity: 1,
    transition: 'opacity 300ms ease-in-out',
  };

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: '28rem', // max-w-md
    transform: 'scale(1)',
    transition: 'transform 300ms ease-in-out',
    overflow: 'hidden', // Para garantir que o padding interno não quebre o layout
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem', // mb-4
    padding: '1.5rem 1.5rem 0 1.5rem', // p-6, mas só no topo por enquanto
  };

  const titleStyle = {
    fontSize: '1.25rem', // text-xl
    fontWeight: 600, // font-semibold
    color: '#1f2937', // text-gray-800
    margin: 0,
  };

  const closeButtonStyle = {
    color: '#9ca3af', // text-gray-400
    fontSize: '1.875rem', // text-2xl (para o '×')
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    lineHeight: 1,
  };
  
  const messageStyle = {
    color: '#4b5563', // text-gray-600
    marginBottom: '1.5rem', // mb-6
    fontSize: '0.875rem', // text-sm
    padding: '0 1.5rem', // Adiciona padding horizontal à mensagem
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem', // gap-3
    padding: '0 1.5rem 1.5rem 1.5rem', // p-6, mas só embaixo
  };


  return (
    <div 
      style={overlayStyle}
      onClick={onClose} 
    >
      <div 
        style={contentStyle}
        onClick={(e) => e.stopPropagation()} 
      >
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <button 
            onClick={onClose} 
            style={closeButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.color = '#4b5563'} // hover:text-gray-600
            onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>
        
        <div style={messageStyle}>
            {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        <div style={footerStyle}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{...cancelButtonStyles, opacity: isLoading ? 0.5 : 1}}
            onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.backgroundColor = '#d1d5db'; }} // hover:bg-gray-300
            onMouseOut={(e) => { if(!isLoading) e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{...finalConfirmButtonStyles, opacity: isLoading ? 0.5 : 1}}
            // Adicionar hover para confirmButtonClass é mais complexo com JS puro
            // Se confirmButtonClass for 'bg-red-600 hover:bg-red-700', o hover não será aplicado pelo style
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
