// src/components/ToggleSwitch.jsx (VERSÃO CORRIGIDA)
import React from 'react';
import styles from './css/ToggleSwitch.module.css';

const ToggleSwitch = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label className={styles.switchContainer}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.switch}>
        <input 
          type="checkbox" 
          checked={checked}
          // Lógica corrigida: se não houver onChange, o campo é apenas de leitura
          onChange={onChange || (() => {})}
          readOnly={!onChange}
          disabled={disabled}
          className={styles.checkbox}
        />
        <span className={styles.slider}></span>
      </div>
    </label>
  );
};

export default ToggleSwitch;