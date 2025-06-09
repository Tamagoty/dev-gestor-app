// src/components/ToggleSwitch.jsx

import React from 'react';
import styles from './css/ToggleSwitch.module.css'; // Vamos criar este arquivo de estilo a seguir

const ToggleSwitch = ({ label, checked, onChange }) => {
  return (
    // Usamos a tag <label> para que clicar no texto também ative o switch
    <label className={styles.switchContainer}>
      
      {/* O texto do rótulo que estava faltando */}
      {label && <span className={styles.label}>{label}</span>}
      
      {/* O switch visual */}
      <div className={styles.switch}>
        <input 
          type="checkbox" 
          checked={checked}
          onChange={onChange}
          className={styles.checkbox}
        />
        <span className={styles.slider}></span>
      </div>

    </label>
  );
};

export default ToggleSwitch;