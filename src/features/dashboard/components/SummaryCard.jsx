// src/features/dashboard/components/SummaryCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/Dashboard.module.css';

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(parseFloat(value))) return 'R$ 0,00';
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const SummaryCard = ({ title, value, description, linkTo, linkText, isCurrency = false, isLoading }) => {
  return (
    <div className={styles.card}>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={styles.cardValue}>
          {isLoading ? '...' : (isCurrency ? formatCurrency(value) : value)}
        </div>
        <p className={styles.cardContent}>{description}</p>
      </div>
      {linkTo && linkText && (
        <Link to={linkTo} className={styles.cardLink}>
          {linkText}
        </Link>
      )}
    </div>
  );
};

export default SummaryCard;