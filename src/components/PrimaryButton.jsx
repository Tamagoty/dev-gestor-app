// src/components/PrimaryButton.jsx
import React from 'react';
import styles from './css/FormActions.module.css'; // Reutilizaremos os estilos que já temos!

const PrimaryButton = ({ onClick, children, disabled = false, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles.submit}`} // Usa o estilo verde padrão
    >
      {children}
    </button>
  );
};

export default PrimaryButton;