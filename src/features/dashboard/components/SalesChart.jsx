// src/features/dashboard/components/SalesChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import styles from '../css/Dashboard.module.css';

const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

const SalesChart = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className={`${styles.card} ${styles.chartCard}`}><p>Carregando gráfico...</p></div>;
  }
  
  if (data.length === 0) {
    return <div className={`${styles.card} ${styles.chartCard}`}><p>Não há dados de vendas para exibir o gráfico.</p></div>;
  }

  return (
   <div className={`${styles.card} ${styles.chartCard}`}>
      <h3 className={styles.cardTitle}>Vendas Mensais</h3>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
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