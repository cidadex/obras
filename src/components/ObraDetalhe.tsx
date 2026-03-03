import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  HardHat,
  FileText,
  Plus,
  Calendar,
  MapPin,
  User,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'recharts';
import type { StoreType } from '@/hooks/useStore';

interface ObraDetalheProps {
  store: StoreType;
  obraId: string;
  onBack: () => void;
  onViewChange: (view: any) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ObraDetalhe({ store, obraId, onBack, onViewChange }: ObraDetalheProps) {
  const [activeTab, setActiveTab] = useState('resumo');
  
  const obra = useMemo(() => store.getObraById(obraId), [store, obraId]);
  const resumo = useMemo(() => store.getResumoObra(obraId), [store, obraId]);
  const cliente = useMemo(() => obra ? store.getClienteById(obra.clienteId) : null, [store, obra]);
  const funcionarios = useMemo(() => store.getFuncionariosPorObra(obraId), [store, obraId]);
  
  const entradas = useMemo(() => 
    store.lancamentosEntrada.filter(l => l.obraId === obraId),
    [store.lancamentosEntrada, obraId]
  );
  
  const saidas = useMemo(() => 
    store.lancamentosSaida.filter(l => l.obraId === obraId),
    [store.lancamentosSaida, obraId]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!obra || !resumo) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/50">Obra não encontrada</p>
      </div>
    );
  }

  const custoPorCategoriaData = resumo.custoPorCategoria.map(c => ({
    name: c.categoria,
    value: c.total,
  }));

  const custoPorFuncionarioData = resumo.custoPorFuncionario.map(f => ({
    name: f.nome.split(' ')[0],
    valor: f.total,
  }));

  const percentualOrcamento = (resumo.totalSaidas / obra.orcamentoPrevisto) * 100;

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-white/60 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white">{obra.nome}</h1>
          <p className="text-white/50 text-sm">Centro de Custo</p>
        </div>
        <span className={`
          ml-auto px-3 py-1 rounded-full text-xs font-medium
          ${obra.status === 'em_andamento' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
          ${obra.status === 'concluida' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
          ${obra.status === 'pausada' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
        `}>
          {obra.status === 'em_andamento' && 'Em Andamento'}
          {obra.status === 'concluida' && 'Concluída'}
          {obra.status === 'pausada' && 'Pausada'}
        </span>
      </div>

      {/* Info da Obra */}
      <Card className="bg-[#15151c] border-white/5">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Cliente</p>
                <p className="text-white text-sm font-medium">{cliente?.nome}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Endereço</p>
                <p className="text-white text-sm font-medium truncate max-w-[200px]">{obra.endereco}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Previsão</p>
                <p className="text-white text-sm font-medium">
                  {new Date(obra.dataPrevisaoTermino).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <HardHat className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Responsável</p>
                <p className="text-white text-sm font-medium">{obra.responsavel}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#15151c] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Valor do Contrato</p>
                <p className="text-xl font-bold text-white">{formatCurrency(obra.valorContrato)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Orçamento Previsto</p>
                <p className="text-xl font-bold text-white">{formatCurrency(obra.orcamentoPrevisto)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Total Gasto</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(resumo.totalSaidas)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40">{percentualOrcamento.toFixed(1)}% do orçamento</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${percentualOrcamento > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(percentualOrcamento, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">Resultado</p>
                <p className={`text-xl font-bold ${resumo.resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(resumo.resultado)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-white/40 mt-2">
              Margem: {resumo.margemPercentual.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#15151c] border border-white/5 p-1">
          <TabsTrigger value="resumo" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Resumo
          </TabsTrigger>
          <TabsTrigger value="entradas" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Entradas
          </TabsTrigger>
          <TabsTrigger value="saidas" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Saídas
          </TabsTrigger>
          <TabsTrigger value="funcionarios" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Funcionários
          </TabsTrigger>
        </TabsList>

        {/* Tab Resumo */}
        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Custos por Categoria */}
            <Card className="bg-[#15151c] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base">Custos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={custoPorCategoriaData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {custoPorCategoriaData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
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
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {custoPorCategoriaData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-white/60 text-xs">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Custos por Funcionário */}
            <Card className="bg-[#15151c] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base">Custos por Funcionário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={custoPorFuncionarioData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
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
                      <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Entradas */}
        <TabsContent value="entradas">
          <Card className="bg-[#15151c] border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base">Entradas da Obra</CardTitle>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onViewChange('entradas')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrada
              </Button>
            </CardHeader>
            <CardContent>
              {entradas.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-white/20" />
                  <p>Nenhuma entrada registrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Descrição</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Tipo</th>
                        <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entradas.map((entrada) => (
                        <tr key={entrada.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white text-sm">
                            {new Date(entrada.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-white text-sm">{entrada.descricao}</td>
                          <td className="py-3 px-4 text-white/60 text-sm capitalize">
                            {entrada.tipo.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4 text-emerald-400 text-sm font-medium text-right">
                            {formatCurrency(entrada.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Saídas */}
        <TabsContent value="saidas">
          <Card className="bg-[#15151c] border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base">Saídas da Obra</CardTitle>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => onViewChange('saidas')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Saída
              </Button>
            </CardHeader>
            <CardContent>
              {saidas.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <TrendingDown className="h-12 w-12 mx-auto mb-3 text-white/20" />
                  <p>Nenhuma saída registrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Descrição</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Categoria</th>
                        <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saidas.map((saida) => (
                        <tr key={saida.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white text-sm">
                            {new Date(saida.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-white text-sm">{saida.descricao}</td>
                          <td className="py-3 px-4 text-white/60 text-sm">{saida.categoria}</td>
                          <td className="py-3 px-4 text-red-400 text-sm font-medium text-right">
                            {formatCurrency(saida.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Funcionários */}
        <TabsContent value="funcionarios">
          <Card className="bg-[#15151c] border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-base">Funcionários na Obra</CardTitle>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onViewChange('funcionarios')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar
              </Button>
            </CardHeader>
            <CardContent>
              {funcionarios.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <Users className="h-12 w-12 mx-auto mb-3 text-white/20" />
                  <p>Nenhum funcionário vinculado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {funcionarios.map((func) => {
                    const custoTotal = resumo.custoPorFuncionario.find(f => f.funcionarioId === func.id)?.total || 0;
                    return (
                      <Card key={func.id} className="bg-[#1a1a22] border-white/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <HardHat className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{func.nome}</p>
                              <p className="text-white/50 text-sm">{func.cargo}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-emerald-400 text-sm">{formatCurrency(func.valorDiaria)}/dia</span>
                              </div>
                              {custoTotal > 0 && (
                                <p className="text-white/40 text-xs mt-2">
                                  Total gasto: {formatCurrency(custoTotal)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
