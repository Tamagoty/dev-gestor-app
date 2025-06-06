// src/features/dashboard/components/SalesChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import styles from '../css/Dashboard.module.css';

const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

// MUDANÇA 2: Função para formatar o eixo Y como R$ sem decimais
const formatYAxis = (tickItem) => {
  // Formata para o padrão monetário brasileiro e remove as casas decimais e o espaço
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(tickItem).replace(/\s/g, ''); // Remove o espaço entre "R$" e o número
};


const SalesChart = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className={`${styles.card} ${styles.chartCard}`}><p>Carregando gráfico...</p></div>;
  }
  
  if (data.length === 0) {
    return <div className={`${styles.card} ${styles.chartCard}`}><p>Não há dados de vendas para exibir o gráfico.</p></div>;
  }

  return (
    <div className={`${styles.card} ${styles.chartCard}`}>
      <h3 className={styles.cardTitle}>Vendas Mensais (Últimos 6 meses)</h3>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          
          {/* MUDANÇA 1 e 2 aplicadas aqui */}
          <YAxis 
            width={80} // 1. Aumenta a largura para dar espaço aos labels
            tickFormatter={formatYAxis} // 2. Aplica a nova formatação
          />
          
          <Tooltip formatter={(value) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), "Total Vendido"]} />
          <Legend />
          <Bar dataKey="Vendas" name="Total Vendido" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;