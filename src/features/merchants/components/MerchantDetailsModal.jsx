// src/features/merchants/components/MerchantDetailsModal.jsx
import React from 'react';
import styles from '../css/MerchantsPage.module.css';

const MerchantDetailsModal = ({ isOpen, onClose, merchant }) => {
  if (!isOpen || !merchant) {
    return null;
  }

  return (
    <div className={styles.detailsModalOverlay} onClick={onClose}>
      <div className={styles.detailsModalContent} onClick={(e) => e.stopPropagation()}>
        <h3>Detalhes de: {merchant.name}</h3>
        <p><strong>ID:</strong> {merchant.merchant_id}</p>
        <p><strong>Nome/Razão Social:</strong> {merchant.name}</p>
        {merchant.nickname && <p><strong>Apelido/Nome Fantasia:</strong> {merchant.nickname}</p>}
        {/* ... etc ... */}
        <button onClick={onClose} className={styles.detailsModalCloseButton}>Fechar</button>
      </div>
    </div>
  );
};

export default MerchantDetailsModal;