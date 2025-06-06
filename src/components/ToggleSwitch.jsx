// src/components/ToggleSwitch.jsx
import React from 'react';
import styles from './css/ToggleSwitch.module.css';

const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <label className={styles.toggleSwitch}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.slider}></span>
    </label>
  );
};

export default ToggleSwitch;