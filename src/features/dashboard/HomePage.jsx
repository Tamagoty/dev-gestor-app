// src/features/dashboard/HomePage.jsx
import React from 'react';
import { useDashboardData } from './useDashboardData';

import styles from './css/Dashboard.module.css';
import SummaryCard from './components/SummaryCard';
import SalesChart from './components/SalesChart';

function HomePage({ session }) {
  const { counts, financialSummaries, monthlySalesChartData, loading } = useDashboardData(session);

  return (
    <div className={styles.pageContainer}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Painel Principal
      </h2>
      {session && (
        <p className={styles.welcomeMessage}>
          Bem-vindo(a) de volta, {session.user.email.split('@')[0]}!
        </p>
      )}

      <div className={styles.container}>
        {/* Cards Financeiros */}
        <SummaryCard 
          title="Vendas no Mês" 
          value={financialSummaries.monthlySalesTotal} 
          description="Total vendido no mês corrente." 
          linkTo="/vendas" 
          linkText="Ver Vendas" 
          isCurrency={true}
          isLoading={loading}
        />
        <SummaryCard 
          title="Compras no Mês" 
          value={financialSummaries.monthlyPurchasesTotal} 
          description="Total gasto em compras no mês corrente." 
          linkTo="/compras" 
          linkText="Ver Compras" 
          isCurrency={true}
          isLoading={loading}
        />
        <SummaryCard 
          title="Saldo de Caixa (Geral)" 
          value={financialSummaries.cashBalance} 
          description="Entradas - Saídas (compras + retiradas)." 
          isCurrency={true}
          isLoading={loading}
        />
        
        {/* Gráfico de Vendas */}
        <SalesChart data={monthlySalesChartData} isLoading={loading} />
        
        <hr style={{width: '100%', borderTop: '1px solid #eee', margin: '20px 0'}}/>

        {/* Cards de Contagem */}
        <SummaryCard title="Total de Clientes" value={counts.customers} description="Clientes ativos e potenciais." linkTo="/merchants" linkText="Gerenciar Clientes" isLoading={loading} />
        <SummaryCard title="Total de Vendedores" value={counts.salespeople} description="Equipe de vendas cadastrada." linkTo="/vendedores" linkText="Gerenciar Vendedores" isLoading={loading} />
        <SummaryCard title="Produtos Ativos" value={counts.products} description="Itens ativos no catálogo." linkTo="/produtos" linkText="Gerenciar Produtos" isLoading={loading} />
        {/* Adicione outros cards de contagem conforme necessário */}
      </div>
    </div>
  );
}

export default HomePage;