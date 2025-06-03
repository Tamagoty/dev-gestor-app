// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Estilos
const dashboardStyles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '20px 0',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxSizing: 'border-box',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexGrow: 1, 
    flexBasis: '300px', 
    minWidth: '280px', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    boxSizing: 'border-box',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexBasis: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    margin: '0 0 10px 0',
    fontSize: '1.15rem',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  cardValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '15px 0',
    textAlign: 'center',
    lineHeight: '1.1'
  },
  cardContent: {
    fontSize: '0.95rem',
    color: '#555',
    flexGrow: 1,
    marginBottom: '15px',
  },
  cardLink: {
    display: 'block',
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    textAlign: 'center',
    transition: 'background-color 0.2s ease',
    alignSelf: 'stretch'
  },
};

const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

function HomePage({ session }) {
  const [counts, setCounts] = useState({
    sales: 0, customers: 0, salespeople: 0,
    partners: 0, products: 0, costCenters: 0,
  });
  const [financialSummaries, setFinancialSummaries] = useState({
    monthlySalesTotal: 0, monthlyPurchasesTotal: 0, cashBalance: 0,
  });
  const [monthlySalesChartData, setMonthlySalesChartData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Helper para converter nome do mês abreviado para número (0-11)
  const getMonthNumber = (monthNameAbbrev) => {
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return months.indexOf(monthNameAbbrev.toLowerCase().substring(0, 3));
  };

  useEffect(() => {
    document.title = 'Gestor App - Painel Principal';

    async function fetchDashboardData() {
      setLoadingData(true);
      try {
        const [
          salesCountRes, customersCountRes, salespeopleCountRes,
          partnersCountRes, productsCountRes, costCentersCountRes
        ] = await Promise.all([
          supabase.from('sales').select('*', { count: 'exact', head: true }),
          supabase.from('merchants').select('*', { count: 'exact', head: true }).or('merchant_type.eq.Cliente,merchant_type.eq.Ambos'),
          supabase.from('salespeople').select('*', { count: 'exact', head: true }),
          supabase.from('partners').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('cost_centers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        ]);
        
        const getCountLocal = (res, name) => { // Renomeado para evitar conflito se getCount fosse global
          if (res.error) { console.error(`Erro contagem ${name}:`, res.error.message); toast.error(`Falha total ${name}.`); return 'N/A'; }
          return res.count || 0;
        };

        setCounts({
          sales: getCountLocal(salesCountRes, 'Vendas'),
          customers: getCountLocal(customersCountRes, 'Clientes'),
          salespeople: getCountLocal(salespeopleCountRes, 'Vendedores'),
          partners: getCountLocal(partnersCountRes, 'Sócios'),
          products: getCountLocal(productsCountRes, 'Produtos Ativos'),
          costCenters: getCountLocal(costCentersCountRes, 'CCs Ativos'),
        });

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
        const endOfMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

        const { data: monthlySalesData, error: monthlySalesError } = await supabase.from('sales').select('overall_total_amount').gte('sale_date', firstDayOfMonth).lte('sale_date', endOfMonthStr);
        if (monthlySalesError) throw new Error(`Vendas Mês: ${monthlySalesError.message}`);
        const monthlySalesTotal = monthlySalesData?.reduce((sum, sale) => sum + parseFloat(sale.overall_total_amount || 0), 0) || 0;

        const { data: monthlyPurchasesData, error: monthlyPurchasesError } = await supabase.from('purchases').select('total_amount').gte('purchase_date', firstDayOfMonth).lte('purchase_date', endOfMonthStr);
        if (monthlyPurchasesError) throw new Error(`Compras Mês: ${monthlyPurchasesError.message}`);
        const monthlyPurchasesTotal = monthlyPurchasesData?.reduce((sum, purchase) => sum + parseFloat(purchase.total_amount || 0), 0) || 0;

        const { data: salePaymentsData, error: salePaymentsError } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Venda');
        if (salePaymentsError) throw new Error(`Pag. Vendas: ${salePaymentsError.message}`);
        const totalSalePayments = salePaymentsData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

        const { data: purchasePaymentsData, error: purchasePaymentsError } = await supabase.from('transactions').select('amount').eq('transaction_type', 'Compra');
        if (purchasePaymentsError) throw new Error(`Pag. Compras: ${purchasePaymentsError.message}`);
        const totalPurchasePayments = purchasePaymentsData?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

        const { data: withdrawalData, error: withdrawalError } = await supabase.from('partner_withdrawals').select('amount');
        if (withdrawalError) throw new Error(`Retiradas: ${withdrawalError.message}`);
        const totalWithdrawals = withdrawalData?.reduce((sum, wd) => sum + parseFloat(wd.amount), 0) || 0;
        
        const cashBalance = totalSalePayments - (totalPurchasePayments + totalWithdrawals);
        setFinancialSummaries({ monthlySalesTotal, monthlyPurchasesTotal, cashBalance });

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5); 
        sixMonthsAgo.setDate(1);
        const firstDaySixMonthsAgo = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`;

        const { data: salesForChart, error: salesChartError } = await supabase
          .from('sales').select('sale_date, overall_total_amount')
          .gte('sale_date', firstDaySixMonthsAgo).lte('sale_date', endOfMonthStr)
          .order('sale_date', { ascending: true });
        if (salesChartError) throw new Error(`Vendas Gráfico: ${salesChartError.message}`);
        
        if (salesForChart) {
          const monthlyData = salesForChart.reduce((acc, sale) => {
            // Usar YYYY-MM para agrupar e ordenar, depois formatar para exibição
            const yearMonth = sale.sale_date.substring(0, 7); // "YYYY-MM"
            acc[yearMonth] = (acc[yearMonth] || 0) + parseFloat(sale.overall_total_amount || 0);
            return acc;
          }, {});

          const chartData = Object.keys(monthlyData).sort().map(yearMonthKey => { // Ordena por YYYY-MM
            const [year, month] = yearMonthKey.split('-');
            // Formata para "MêsAbrev/Ano" para exibição no gráfico
            const dateForLabel = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthLabel = dateForLabel.toLocaleDateString('pt-BR', { month: 'short' });
            const yearLabel = dateForLabel.toLocaleDateString('pt-BR', { year: 'numeric' });
            return {
              name: `${monthLabel}/${yearLabel}`,
              Vendas: parseFloat(monthlyData[yearMonthKey].toFixed(2)),
            };
          });
          setMonthlySalesChartData(chartData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados para o dashboard:", error);
        toast.error(`Não foi possível carregar dados do dashboard: ${error.message}`);
        // Mantém os que funcionaram, N/A para os que falharam (se a lógica de getCountLocal for usada)
        // Ou reseta tudo para N/A se for um erro geral
        setFinancialSummaries({ monthlySalesTotal: 'N/A', monthlyPurchasesTotal: 'N/A', cashBalance: 'N/A' });
        setMonthlySalesChartData([]);
      } finally {
        setLoadingData(false);
      }
    }

    if (session) {
        fetchDashboardData();
    } else {
        setLoadingData(false); 
    }
  }, [session]);

  // --- FUNÇÕES COMPLETAS ---
  const formatCurrency = (value) => {
    if (value === 'N/A' || value === null || value === undefined || isNaN(parseFloat(value))) return 'N/A';
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderCard = (title, count, description, linkTo, linkText, isCurrency = false) => (
    <div style={dashboardStyles.card}>
      <div>
        <h3 style={dashboardStyles.cardTitle}>{title}</h3>
        <div style={dashboardStyles.cardValue}>{loadingData ? '...' : (isCurrency ? formatCurrency(count) : count)}</div>
        <p style={dashboardStyles.cardContent}>{description}</p>
      </div>
      {linkTo && linkText && (
        <Link to={linkTo} style={dashboardStyles.cardLink} className="card-link-hover">
          {linkText}
        </Link>
      )}
    </div>
  );
  // --- FIM DAS FUNÇÕES COMPLETAS ---

  return (
    <div>
      <h2 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Painel Principal
      </h2>
      {session && ( 
        <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '20px' }}>
          Bem-vindo(a) de volta, {session.user.email.split('@')[0]}!
        </p>
      )}

      <div style={dashboardStyles.container}>
        {renderCard("Vendas no Mês", financialSummaries.monthlySalesTotal, "Total vendido no mês corrente.", "/vendas", "Ver Vendas", true)}
        {renderCard("Compras no Mês", financialSummaries.monthlyPurchasesTotal, "Total gasto em compras no mês corrente.", "/compras", "Ver Compras", true)}
        {renderCard("Saldo de Caixa (Geral)", financialSummaries.cashBalance, "Entradas (vendas) - Saídas (compras + retiradas).", null, null, true)}
        
        <hr style={{width: '100%', borderTop: '1px solid #eee', margin: '10px 0 20px 0'}}/>

        <div style={dashboardStyles.chartCard}>
            <h3 style={dashboardStyles.cardTitle}>Vendas Mensais (Últimos 6 Meses)</h3>
            {loadingData && <p style={{textAlign: 'center', marginTop: '20px'}}>Carregando dados do gráfico...</p>}
            {!loadingData && monthlySalesChartData.length === 0 && <p style={{textAlign: 'center', marginTop: '20px'}}>Não há dados de vendas suficientes para exibir o gráfico.</p>}
            {!loadingData && monthlySalesChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={360}> {/* Altura fixa para o container do gráfico */}
                    <BarChart 
                        data={monthlySalesChartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }} 
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} />
                        <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{fontSize: 11}} width={70}/>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend wrapperStyle={{fontSize: 13, paddingTop: '10px'}}/>
                        <Bar dataKey="Vendas" name="Total Vendido" radius={[4, 4, 0, 0]}>
                            {monthlySalesChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>

        <hr style={{width: '100%', borderTop: '1px solid #eee', margin: '20px 0'}}/>

        {renderCard("Total de Vendas (Geral)", counts.sales, "Vendas totais registradas.", "/vendas", "Ver Vendas")}
        {renderCard("Total de Clientes", counts.customers, "Clientes ativos e potenciais.", "/merchants", "Gerenciar Clientes")}
        {renderCard("Total de Vendedores", counts.salespeople, "Equipe de vendas cadastrada.", "/vendedores", "Gerenciar Vendedores")}
        {renderCard("Total de Sócios", counts.partners, "Sócios registrados na empresa.", "/socios", "Gerenciar Sócios")}
        {renderCard("Produtos Ativos", counts.products, "Itens ativos no catálogo.", "/produtos", "Gerenciar Produtos")}
        {renderCard("Centros de Custo Ativos", counts.costCenters, "Centros de custo operacionais.", "/centros-de-custo", "Gerenciar CCs")}
      </div>
    </div>
  );
}

export default HomePage;