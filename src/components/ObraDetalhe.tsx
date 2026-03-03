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
  History,
  Briefcase,
  Clock,
  Wallet,
  TrendingUp as TrendingUpIcon,
  AlertCircle,
  CheckCircle,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import type { StoreType } from '@/hooks/useStore';
import type { LancamentoEntrada, LancamentoSaida } from '@/types';

interface ObraDetalheProps {
  store: StoreType;
  obraId: string;
  onBack: () => void;
  onViewChange: (view: any) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ObraDetalhe({ store, obraId, onBack, onViewChange }: ObraDetalheProps) {
  const [activeTab, setActiveTab] = useState('resumo');
  const [editProgressOpen, setEditProgressOpen] = useState(false);
  const [novoPercentual, setNovoPercentual] = useState(0);
  
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleAtualizarProgresso = () => {
    store.updateObra(obraId, { percentualConclusao: novoPercentual });
    setEditProgressOpen(false);
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

  // Dados para o gráfico de evolução financeira
  const evolucaoFinanceiraData = useMemo(() => {
    const movimentacoes = [...entradas, ...saidas].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    
    let saldoAcumulado = 0;
    const dadosPorMes: Record<string, { mes: string; entradas: number; saidas: number; saldo: number }> = {};
    
    movimentacoes.forEach(mov => {
      const mes = mov.data.substring(0, 7); // YYYY-MM
      const mesFormatado = `${mes.substring(5, 7)}/${mes.substring(0, 4)}`;
      
      if (!dadosPorMes[mes]) {
        dadosPorMes[mes] = { mes: mesFormatado, entradas: 0, saidas: 0, saldo: 0 };
      }
      
      if ('clienteId' in mov) {
        dadosPorMes[mes].entradas += mov.valor;
      } else {
        dadosPorMes[mes].saidas += mov.valor;
      }
    });
    
    // Calcular saldo acumulado
    return Object.values(dadosPorMes).map(d => {
      saldoAcumulado += d.entradas - d.saidas;
      return { ...d, saldo: saldoAcumulado };
    });
  }, [entradas, saidas]);

  // Histórico de movimentações ordenado
  const historicoMovimentacoes = useMemo(() => {
    return [
      ...entradas.map(e => ({ ...e, tipoMov: 'entrada' as const })),
      ...saidas.map(s => ({ ...s, tipoMov: 'saida' as const })),
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [entradas, saidas]);

  // Próximos pagamentos previstos (simulação baseada em funcionários)
  const proximosPagamentos = useMemo(() => {
    const hoje = new Date();
    const pagamentos = funcionarios.map(func => ({
      funcionario: func.nome,
      valor: func.valorDiaria * 5, // 5 dias de trabalho
      data: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tipo: 'Diárias',
    }));
    return pagamentos;
  }, [funcionarios]);

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
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{obra.nome}</h1>
          <p className="text-white/50 text-sm">Centro de Custo</p>
        </div>
        <span className={`
          px-3 py-1 rounded-full text-xs font-medium
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
                <p className="text-white text-sm truncate max-w-[200px]">{obra.endereco}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">Previsão</p>
                <p className="text-white text-sm font-medium">
                  {formatDate(obra.dataPrevisaoTermino)}
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

      {/* Progresso da Obra */}
      <Card className="bg-[#15151c] border-white/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUpIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">Progresso da Obra</p>
                <p className="text-white/50 text-sm">Percentual de conclusão</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-emerald-400">{obra.percentualConclusao}%</span>
              <Dialog open={editProgressOpen} onOpenChange={setEditProgressOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-white/10 text-white hover:bg-white/5"
                    onClick={() => setNovoPercentual(obra.percentualConclusao)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a22] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Atualizar Progresso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Percentual de Conclusão (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={novoPercentual}
                        onChange={(e) => setNovoPercentual(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${novoPercentual}%` }}
                      />
                    </div>
                    <Button 
                      onClick={handleAtualizarProgresso}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Salvar Progresso
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${obra.percentualConclusao}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>Início: {formatDate(obra.dataInicio)}</span>
            <span>Previsão: {formatDate(obra.dataPrevisaoTermino)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#15151c] border border-white/5 p-1 flex-wrap h-auto">
          <TabsTrigger value="resumo" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Resumo
          </TabsTrigger>
          <TabsTrigger value="entradas" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Entradas
          </TabsTrigger>
          <TabsTrigger value="saidas" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            Saídas
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <History className="h-4 w-4 mr-1" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="funcionarios" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Briefcase className="h-4 w-4 mr-1" />
            Funcionários
          </TabsTrigger>
          <TabsTrigger value="cronograma" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-1" />
            Cronograma
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

          {/* Evolução Financeira */}
          {evolucaoFinanceiraData.length > 0 && (
            <Card className="bg-[#15151c] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base">Evolução Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolucaoFinanceiraData}>
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
                      <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" fillOpacity={1} fill="url(#colorEntrada)" />
                      <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" fillOpacity={1} fill="url(#colorSaida)" />
                      <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
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
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Forma Pagto</th>
                        <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((entrada) => (
                        <tr key={entrada.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white text-sm">{formatDate(entrada.data)}</td>
                          <td className="py-3 px-4 text-white text-sm">{entrada.descricao}</td>
                          <td className="py-3 px-4 text-white/60 text-sm capitalize">
                            {entrada.tipo.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4 text-white/60 text-sm uppercase">{entrada.formaPagamento}</td>
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
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Beneficiário</th>
                        <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saidas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((saida) => {
                        const funcionario = saida.funcionarioId ? store.funcionarios.find(f => f.id === saida.funcionarioId) : null;
                        const fornecedor = saida.fornecedorId ? store.fornecedores.find(f => f.id === saida.fornecedorId) : null;
                        const beneficiario = funcionario?.nome || fornecedor?.nome || saida.prestadorNome || '-';
                        
                        return (
                          <tr key={saida.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-white text-sm">{formatDate(saida.data)}</td>
                            <td className="py-3 px-4 text-white text-sm">{saida.descricao}</td>
                            <td className="py-3 px-4 text-white/60 text-sm">{saida.categoria}</td>
                            <td className="py-3 px-4 text-white/60 text-sm">{beneficiario}</td>
                            <td className="py-3 px-4 text-red-400 text-sm font-medium text-right">
                              {formatCurrency(saida.valor)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Histórico */}
        <TabsContent value="historico">
          <Card className="bg-[#15151c] border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-400" />
                Histórico Completo de Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historicoMovimentacoes.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <History className="h-12 w-12 mx-auto mb-3 text-white/20" />
                  <p>Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Data</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Descrição</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Classificação</th>
                        <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoMovimentacoes.map((mov) => (
                        <tr key={mov.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white text-sm">{formatDate(mov.data)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                              mov.tipoMov === 'entrada' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {mov.tipoMov === 'entrada' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {mov.tipoMov === 'entrada' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white text-sm">{mov.descricao}</td>
                          <td className="py-3 px-4 text-white/60 text-sm capitalize">
                            {mov.classificacao.replace(/_/g, ' ')}
                          </td>
                          <td className={`py-3 px-4 text-sm font-medium text-right ${
                            mov.tipoMov === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(mov.valor)}
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
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-400" />
                Funcionários na Obra
              </CardTitle>
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
                              <div className="mt-3 pt-3 border-t border-white/5">
                                <div className="flex justify-between text-sm">
                                  <span className="text-white/50">Admissão:</span>
                                  <span className="text-white/70">{formatDate(func.dataAdmissao)}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                  <span className="text-white/50">Total gasto:</span>
                                  <span className={custoTotal > 0 ? 'text-red-400' : 'text-white/70'}>
                                    {formatCurrency(custoTotal)}
                                  </span>
                                </div>
                              </div>
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

        {/* Tab Cronograma */}
        <TabsContent value="cronograma">
          <div className="space-y-4">
            {/* Resumo Financeiro */}
            <Card className="bg-[#15151c] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#0f0f16] p-4 rounded-lg">
                    <p className="text-white/50 text-sm">Receitas</p>
                    <p className="text-emerald-400 text-xl font-bold">{formatCurrency(resumo.totalEntradas)}</p>
                  </div>
                  <div className="bg-[#0f0f16] p-4 rounded-lg">
                    <p className="text-white/50 text-sm">Custos</p>
                    <p className="text-red-400 text-xl font-bold">{formatCurrency(resumo.totalSaidas)}</p>
                  </div>
                  <div className="bg-[#0f0f16] p-4 rounded-lg">
                    <p className="text-white/50 text-sm">Saldo</p>
                    <p className={`text-xl font-bold ${resumo.resultado >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(resumo.resultado)}
                    </p>
                  </div>
                  <div className="bg-[#0f0f16] p-4 rounded-lg">
                    <p className="text-white/50 text-sm">Orçamento Restante</p>
                    <p className={`text-xl font-bold ${obra.orcamentoPrevisto - resumo.totalSaidas >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(obra.orcamentoPrevisto - resumo.totalSaidas)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Pagamentos Previstos */}
            <Card className="bg-[#15151c] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400" />
                  Próximos Pagamentos Previstos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proximosPagamentos.length === 0 ? (
                  <div className="text-center py-8 text-white/50">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-white/20" />
                    <p>Nenhum pagamento previsto</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Funcionário</th>
                          <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Tipo</th>
                          <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Previsão</th>
                          <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor Estimado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proximosPagamentos.map((pag, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-white text-sm">{pag.funcionario}</td>
                            <td className="py-3 px-4 text-white/60 text-sm">{pag.tipo}</td>
                            <td className="py-3 px-4 text-amber-400 text-sm">{formatDate(pag.data)}</td>
                            <td className="py-3 px-4 text-white text-sm font-medium text-right">
                              {formatCurrency(pag.valor)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alertas */}
            {percentualOrcamento > 90 && (
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-amber-400 font-medium">Atenção: Orçamento Quase Esgotado</p>
                      <p className="text-amber-400/70 text-sm">
                        A obra já consumiu {percentualOrcamento.toFixed(1)}% do orçamento previsto.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {obra.percentualConclusao < (percentualOrcamento * 0.8) && percentualOrcamento > 50 && (
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-medium">Alerta: Desvio de Custos</p>
                      <p className="text-red-400/70 text-sm">
                        O gasto está acima do progresso da obra. Reveja os custos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
