import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  Users,
  Wallet,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import type { StoreType } from '@/hooks/useStore';

interface DashboardProps {
  store: StoreType;
  onViewChange: (view: any, params?: any) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard({ store, onViewChange }: DashboardProps) {
  const dashboardData = useMemo(() => store.getDashboardData(), [store]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const obraChartData = dashboardData.obras.map(o => ({
    name: o.obra.nome.split(' ').slice(0, 2).join(' '),
    receitas: o.totalEntradas,
    custos: o.totalSaidas,
    lucro: o.resultado,
  }));

  const statusData = [
    { name: 'Em Andamento', value: store.obras.filter(o => o.status === 'em_andamento').length },
    { name: 'Concluídas', value: store.obras.filter(o => o.status === 'concluida').length },
    { name: 'Pausadas', value: store.obras.filter(o => o.status === 'pausada').length },
  ].filter(d => d.value > 0);

  // Dados para gráfico de área (simulado)
  const fluxoCaixaData = [
    { mes: 'Jan', entrada: 150000, saida: 120000 },
    { mes: 'Fev', entrada: 180000, saida: 140000 },
    { mes: 'Mar', entrada: 220000, saida: 160000 },
    { mes: 'Abr', entrada: 200000, saida: 180000 },
    { mes: 'Mai', entrada: 280000, saida: 200000 },
    { mes: 'Jun', entrada: 320000, saida: 240000 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards - Modernos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Obras Ativas */}
        <Card className="bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer"
              onClick={() => onViewChange('obras')}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm">Obras Ativas</p>
                <p className="text-2xl font-bold text-white mt-1">{dashboardData.obrasAtivas}</p>
                <p className="text-xs text-white/40 mt-1">de {dashboardData.totalObras} cadastradas</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <Building2 className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +2
              </span>
              <span className="text-white/40 text-xs">este mês</span>
            </div>
          </CardContent>
        </Card>

        {/* Receitas */}
        <Card className="bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer"
              onClick={() => onViewChange('entradas')}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm">Receitas Totais</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(dashboardData.totalReceitas)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +12.5%
              </span>
              <span className="text-white/40 text-xs">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Custos */}
        <Card className="bg-[#15151c] border-white/5 hover:border-red-500/30 transition-all group cursor-pointer"
              onClick={() => onViewChange('saidas')}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm">Custos Totais</p>
                <p className="text-2xl font-bold text-red-400 mt-1">
                  {formatCurrency(dashboardData.totalCustos)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-red-400 text-xs flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +8.2%
              </span>
              <span className="text-white/40 text-xs">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* Lucro */}
        <Card className="bg-[#15151c] border-white/5 hover:border-blue-500/30 transition-all group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm">Lucro Total</p>
                <p className={`text-2xl font-bold mt-1 ${dashboardData.lucroTotal >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {formatCurrency(dashboardData.lucroTotal)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-xs flex items-center gap-1 ${dashboardData.lucroTotal >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {dashboardData.totalReceitas > 0 ? ((dashboardData.lucroTotal / dashboardData.totalReceitas) * 100).toFixed(1) : 0}% margem
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Caixa */}
        <Card className="bg-[#15151c] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Saldo em Caixa</p>
                <p className="text-xl font-bold text-white">{formatCurrency(dashboardData.saldoCaixa)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aportes Sócios */}
        <Card className="bg-[#15151c] border-white/5 cursor-pointer hover:border-emerald-500/30 transition-all"
              onClick={() => onViewChange('socios')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Aportes Sócios</p>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(dashboardData.aportesSocios)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retiradas Sócios */}
        <Card className="bg-[#15151c] border-white/5 cursor-pointer hover:border-amber-500/30 transition-all"
              onClick={() => onViewChange('socios')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Retiradas Sócios</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrency(dashboardData.retiradasSocios)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Resultado por Obra */}
        <Card className="bg-[#15151c] border-white/5 lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Resultado por Obra</h3>
              <button 
                onClick={() => onViewChange('relatorios')}
                className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center gap-1"
              >
                Ver detalhes <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={obraChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: '#1a1a22', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="custos" name="Custos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Status */}
        <Card className="bg-[#15151c] border-white/5">
          <CardContent className="p-5">
            <h3 className="text-white font-medium mb-4">Status das Obras</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a22', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-white/60 text-xs">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fluxo de Caixa */}
      <Card className="bg-[#15151c] border-white/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Fluxo de Caixa (Últimos 6 meses)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxoCaixaData}>
                <defs>
                  <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mes" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} 
                       tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: '#1a1a22', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="entrada" name="Entradas" stroke="#10b981" fillOpacity={1} fill="url(#colorEntrada)" />
                <Area type="monotone" dataKey="saida" name="Saídas" stroke="#ef4444" fillOpacity={1} fill="url(#colorSaida)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Obras - Cards */}
      <div>
        <h3 className="text-white font-medium mb-4">Obras em Andamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.obras.filter(o => o.obra.status === 'em_andamento').map((obra) => (
            <Card 
              key={obra.obra.id} 
              className="bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group"
              onClick={() => onViewChange('obra-detalhe', obra.obra.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                      {obra.obra.nome}
                    </h4>
                    <p className="text-white/40 text-sm">{obra.obra.responsavel}</p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-lg text-xs font-medium
                    ${obra.resultado >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}
                  `}>
                    {obra.margemPercentual.toFixed(1)}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Receitas:</span>
                    <span className="text-emerald-400">{formatCurrency(obra.totalEntradas)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Custos:</span>
                    <span className="text-red-400">{formatCurrency(obra.totalSaidas)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                    <span className="text-white/50">Resultado:</span>
                    <span className={obra.resultado >= 0 ? 'text-blue-400' : 'text-red-400'}>
                      {formatCurrency(obra.resultado)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Progresso</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
