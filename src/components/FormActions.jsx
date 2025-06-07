// src/components/FormActions.jsx
import React from 'react';
import styles from './css/FormActions.module.css';

const FormActions = ({ isEditing, isSubmitting, onCancel }) => {
  return (
    <div className={styles.actionsContainer}>
      {/* O botão de cancelar só aparece se estiver no modo de edição */}
      {isEditing && (
        <button
          type="button"
          onClick={onCancel}
          className={`${styles.button} ${styles.cancel}`}
        >
          Cancelar Edição
        </button>
      )}

      {/* O botão principal muda de cor e texto dependendo do modo */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${styles.button} ${isEditing ? styles.submitEditing : styles.submit}`}
      >
        {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar')}
      </button>
    </div>
  );
};

export default FormActions;