// src/components/IconButton.jsx
import React from 'react';
import styles from './css/IconButton.module.css';

const IconButton = ({ onClick, title, variant = 'info', children }) => {
  // Concatena a classe base com a classe da variante
  const buttonClass = `${styles.iconButton} ${styles[variant]}`;

  return (
    <button
      onClick={onClick}
      title={title}
      className={buttonClass}
    >
      {children}
    </button>
  );
};

export default IconButton;