// src/features/partners/components/PartnerDetailsModal.jsx (VERSÃO CORRIGIDA)
import React from 'react';
import styles from '../css/PartnersPage.module.css';

const PartnerDetailsModal = ({ isOpen, onClose, partner }) => {
  if (!isOpen || !partner) {
    return null;
  }

  return (
    <div className={styles.detailsModalOverlay} onClick={onClose}>
      <div className={styles.detailsModalContent} onClick={(e) => e.stopPropagation()}>
        <h3>Detalhes de: {partner.name}</h3>
        <p><strong>ID do Sócio:</strong> {partner.partner_id}</p>
        <p><strong>Nome Completo:</strong> {partner.name}</p>
        <p><strong>CPF/CNPJ:</strong> {partner.cpf_cnpj || 'Não informado'}</p>
        <p><strong>Email:</strong> {partner.email || 'Não informado'}</p>
        <p><strong>Telefone:</strong> {partner.phone || 'Não informado'}</p>
        <p><strong>Endereço:</strong> {partner.address || 'Não informado'}</p>
        <p><strong>Participação Societária:</strong> {partner.equity_percentage !== null ? `${partner.equity_percentage}%` : 'Não informado'}</p>
        <p><strong>Data de Entrada:</strong> {partner.entry_date ? new Date(partner.entry_date + 'T00:00:00Z').toLocaleDateString() : 'Não informada'}</p>
        <p><strong>Status:</strong> <span style={{ color: partner.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>{partner.status}</span></p>
        {partner.observations && <p><strong>Observações:</strong> {partner.observations}</p>}
        
        <button onClick={onClose} className={styles.detailsModalCloseButton}>Fechar</button>
      </div>
    </div>
  );
};

// A LINHA QUE FALTAVA:
export default PartnerDetailsModal;