// src/features/reports/components/CommissionReportDisplay.jsx
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import toast from 'react-hot-toast';
import styles from '../css/ReportsPage.module.css';
import PrimaryButton from '../../../components/PrimaryButton';

const CommissionReportDisplay = ({ data, filters, onPaymentSuccess }) => {
  const { summary, sales_details, payment_details } = data;
  
  const [paymentAmount, setPaymentAmount] = useState(summary.balance > 0 ? summary.balance.toFixed(2) : '0.00');
  const [paymentObs, setPaymentObs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterPayment = async () => {
    setIsSubmitting(true);
    try {
      const amountToPay = parseFloat(paymentAmount);
      if (isNaN(amountToPay) || amountToPay <= 0 || amountToPay > summary.balance + 0.001) {
        throw new Error("Valor de pagamento inválido ou maior que o saldo devedor.");
      }

      const { error } = await supabase.from('commission_payments').insert([{
        salesperson_id: filters.salesperson,
        payment_date: new Date().toISOString().slice(0, 10),
        amount: amountToPay,
        period_start: filters.start,
        period_end: filters.end,
        observations: paymentObs
      }]);

      if (error) throw error;
      
      toast.success("Pagamento de comissão registrado!");
      onPaymentSuccess(); // Recarrega o relatório
    } catch (error) {
      toast.error(`Erro ao registrar pagamento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Resumo Financeiro */}
      <div className={styles.summary}>
        <span>Comissão Gerada: {summary.earned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        <span>Total Pago: {summary.paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        <span style={{ color: summary.balance > 0 ? '#dc3545' : '#28a745' }}>
          Saldo a Pagar: {summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* Formulário de Pagamento (só aparece se houver saldo) */}
      {summary.balance > 0 && (
        <div className={styles.paymentForm}>
          <h4>Registrar Pagamento de Comissão</h4>
          <div className={styles.formGrid}>
            <div>
              <label>Valor a Pagar:</label>
              <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} step="any" />
            </div>
            <div style={{flexGrow: 2}}><label>Observações:</label><input type="text" value={paymentObs} onChange={e => setPaymentObs(e.target.value)} /></div>
            <PrimaryButton onClick={handleRegisterPayment} disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Pagamento'}
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Detalhes (Vendas e Pagamentos) */}
      <div className={styles.detailsGrid}>
        <div>
          <h4>Vendas que Geraram Comissão</h4>
          <table className={styles.reportTable}>
            <thead><tr><th>Data</th><th>Venda #</th><th>Cliente</th><th style={{textAlign: 'right'}}>Comissão (R$)</th></tr></thead>
            <tbody>
              {sales_details.map((sale, i) => (
                <tr key={`s-${i}`}>
                  <td>{new Date(sale.date + 'T00:00:00Z').toLocaleDateString()}</td>
                  <td>{sale.display_id}</td>
                  <td>{sale.customer_name}</td>
                  <td style={{textAlign: 'right'}}>{sale.commission_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Pagamentos Realizados no Período</h4>
          <table className={styles.reportTable}>
            <thead><tr><th>Data</th><th>Observações</th><th style={{textAlign: 'right'}}>Valor Pago (R$)</th></tr></thead>
            <tbody>
              {payment_details.length > 0 ? payment_details.map((p, i) => (
                <tr key={`p-${i}`}>
                  <td>{new Date(p.date + 'T00:00:00Z').toLocaleDateString()}</td>
                  <td>{p.observations}</td>
                  <td style={{textAlign: 'right'}}>{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              )) : <tr><td colSpan="3" style={{textAlign: 'center'}}>Nenhum pagamento neste período.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CommissionReportDisplay;