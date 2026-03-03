import { useState, useMemo } from 'react';
import { Filter, Download, TrendingUp, TrendingDown, DollarSign, FileText, Calendar, X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
} from 'recharts';
import type { StoreType } from '@/hooks/useStore';
import type { FiltroRelatorio } from '@/types';

interface RelatoriosProps {
  store: StoreType;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const periodosPredefinidos = [
  { value: 'custom', label: 'Personalizado' },
  { value: 'este_mes', label: 'Este Mês' },
  { value: 'mes_passado', label: 'Mês Passado' },
  { value: 'ultimos_3_meses', label: 'Últimos 3 Meses' },
  { value: 'ultimos_6_meses', label: 'Últimos 6 Meses' },
  { value: 'este_ano', label: 'Este Ano' },
  { value: 'ano_passado', label: 'Ano Passado' },
];

export function Relatorios({ store }: RelatoriosProps) {
  const [filtro, setFiltro] = useState<FiltroRelatorio>({});
  const [periodo, setPeriodo] = useState('custom');

  const aplicarPeriodoPredefinido = (valor: string) => {
    setPeriodo(valor);
    const hoje = new Date();
    let dataInicio = '';
    let dataFim = '';

    switch (valor) {
      case 'este_mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'mes_passado':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().split('T')[0];
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'ultimos_3_meses':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1).toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
        break;
      case 'ultimos_6_meses':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1).toISOString().split('T')[0];
        dataFim = hoje.toISOString().split('T')[0];
        break;
      case 'este_ano':
        dataInicio = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
        dataFim = new Date(hoje.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      case 'ano_passado':
        dataInicio = new Date(hoje.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        dataFim = new Date(hoje.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFiltro(prev => ({ ...prev, dataInicio, dataFim }));
  };

  const { entradas, saidas } = useMemo(() => {
    return store.filtrarLancamentos(filtro);
  }, [store, filtro]);

  const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0);
  const totalSaidas = saidas.reduce((sum, s) => sum + s.valor, 0);
  const resultado = totalEntradas - totalSaidas;

  // Dados por categoria
  const dadosPorCategoria = useMemo(() => {
    const categorias: Record<string, number> = {};
    saidas.forEach(s => {
      categorias[s.categoria] = (categorias[s.categoria] || 0) + s.valor;
    });
    return Object.entries(categorias)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [saidas]);

  // Dados por obra
  const dadosPorObra = useMemo(() => {
    const obras: Record<string, { entradas: number; saidas: number }> = {};
    
    entradas.forEach(e => {
      if (!obras[e.obraId]) obras[e.obraId] = { entradas: 0, saidas: 0 };
      obras[e.obraId].entradas += e.valor;
    });
    
    saidas.forEach(s => {
      if (!obras[s.obraId]) obras[s.obraId] = { entradas: 0, saidas: 0 };
      obras[s.obraId].saidas += s.valor;
    });

    return Object.entries(obras).map(([obraId, valores]) => ({
      name: store.getObraById(obraId)?.nome.split(' ')[0] || 'Desconhecida',
      receitas: valores.entradas,
      custos: valores.saidas,
      lucro: valores.entradas - valores.saidas,
    }));
  }, [entradas, saidas, store]);

  // Dados por mês (evolução temporal)
  const dadosPorMes = useMemo(() => {
    const meses: Record<string, { mes: string; entradas: number; saidas: number }> = {};
    
    [...entradas, ...saidas].forEach(lanc => {
      const mes = lanc.data.substring(0, 7); // YYYY-MM
      const mesFormatado = `${mes.substring(5, 7)}/${mes.substring(2, 4)}`;
      
      if (!meses[mes]) {
        meses[mes] = { mes: mesFormatado, entradas: 0, saidas: 0 };
      }
      
      if ('clienteId' in lanc) {
        meses[mes].entradas += lanc.valor;
      } else {
        meses[mes].saidas += lanc.valor;
      }
    });

    return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [entradas, saidas]);

  // Dados por tipo de entrada
  const dadosPorTipoEntrada = useMemo(() => {
    const tipos: Record<string, number> = {};
    entradas.forEach(e => {
      tipos[e.tipo] = (tipos[e.tipo] || 0) + e.valor;
    });
    return Object.entries(tipos)
      .map(([name, value]) => ({ 
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        value 
      }))
      .sort((a, b) => b.value - a.value);
  }, [entradas]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const limparFiltros = () => {
    setFiltro({});
    setPeriodo('custom');
  };

  const exportarCSV = () => {
    const dados = [
      ...entradas.map(e => ({
        tipo: 'Entrada',
        data: e.data,
        descricao: e.descricao,
        obra: store.getObraById(e.obraId)?.nome || '-',
        categoria: e.tipo,
        classificacao: e.classificacao,
        valor: e.valor,
      })),
      ...saidas.map(s => ({
        tipo: 'Saída',
        data: s.data,
        descricao: s.descricao,
        obra: store.getObraById(s.obraId)?.nome || '-',
        categoria: s.categoria,
        classificacao: s.classificacao,
        valor: s.valor,
      })),
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const csv = [
      ['Tipo', 'Data', 'Descrição', 'Obra', 'Categoria', 'Classificação', 'Valor'].join(';'),
      ...dados.map(d => [
        d.tipo,
        d.data,
        d.descricao,
        d.obra,
        d.categoria,
        d.classificacao,
        d.valor.toFixed(2).replace('.', ','),
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const filtrosAtivos = Object.entries(filtro).filter(([_, v]) => v).length;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-emerald-400" />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                {filtrosAtivos}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Período Predefinido */}
          <div className="mb-4">
            <Label className="text-white/70 mb-2 block">Período Rápido</Label>
            <div className="flex flex-wrap gap-2">
              {periodosPredefinidos.map(p => (
                <Button
                  key={p.value}
                  type="button"
                  variant={periodo === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => aplicarPeriodoPredefinido(p.value)}
                  className={periodo === p.value 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'border-white/10 text-white hover:bg-white/5'
                  }
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Data Início</Label>
              <Input
                type="date"
                value={filtro.dataInicio || ''}
                onChange={(e) => {
                  setFiltro({ ...filtro, dataInicio: e.target.value });
                  setPeriodo('custom');
                }}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Data Fim</Label>
              <Input
                type="date"
                value={filtro.dataFim || ''}
                onChange={(e) => {
                  setFiltro({ ...filtro, dataFim: e.target.value });
                  setPeriodo('custom');
                }}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Obra</Label>
              <Select
                value={filtro.obraId || ''}
                onValueChange={(value) => setFiltro({ ...filtro, obraId: value || undefined })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  <SelectItem value="" className="text-white">Todas</SelectItem>
                  {store.obras.map(obra => (
                    <SelectItem key={obra.id} value={obra.id} className="text-white">
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Categoria</Label>
              <Select
                value={filtro.categoria || ''}
                onValueChange={(value) => setFiltro({ ...filtro, categoria: value || undefined })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  <SelectItem value="" className="text-white">Todas</SelectItem>
                  {['Mão de Obra', 'Material', 'Equipamento', 'Serviço Terceirizado', 'Despesa Administrativa', 'Transporte'].map(cat => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Funcionário</Label>
              <Select
                value={filtro.funcionarioId || ''}
                onValueChange={(value) => setFiltro({ ...filtro, funcionarioId: value || undefined })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  <SelectItem value="" className="text-white">Todos</SelectItem>
                  {store.funcionarios.filter(f => f.ativo).map(func => (
                    <SelectItem key={func.id} value={func.id} className="text-white">
                      {func.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Fornecedor</Label>
              <Select
                value={filtro.fornecedorId || ''}
                onValueChange={(value) => setFiltro({ ...filtro, fornecedorId: value || undefined })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  <SelectItem value="" className="text-white">Todos</SelectItem>
                  {store.fornecedores.map(forn => (
                    <SelectItem key={forn.id} value={forn.id} className="text-white">
                      {forn.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={limparFiltros} 
                className="border-white/10 text-white hover:bg-white/5"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={imprimirRelatorio}
                className="border-white/10 text-white hover:bg-white/5"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button 
                variant="outline" 
                onClick={exportarCSV}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#15151c] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Total de Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {formatCurrency(totalEntradas)}
            </div>
            <p className="text-xs text-white/40">{entradas.length} lançamentos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Total de Custos
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(totalSaidas)}
            </div>
            <p className="text-xs text-white/40">{saidas.length} lançamentos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Resultado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(resultado)}
            </div>
            <p className="text-xs text-white/40">
              Margem: {totalEntradas > 0 ? ((resultado / totalEntradas) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Total de Lançamentos
            </CardTitle>
            <FileText className="h-4 w-4 text-white/40" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {entradas.length + saidas.length}
            </div>
            <p className="text-xs text-white/40">
              {entradas.length} entradas / {saidas.length} saídas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resultado por Obra */}
        <Card className="bg-[#15151c] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Resultado por Obra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosPorObra}>
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
                  <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="custos" name="Custos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Custos por Categoria */}
        <Card className="bg-[#15151c] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Custos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPorCategoria.map((_, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Evolução Temporal */}
      {dadosPorMes.length > 0 && (
        <Card className="bg-[#15151c] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Evolução Temporal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosPorMes}>
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
                  <Line type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                  <Line type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receitas por Tipo */}
      {dadosPorTipoEntrada.length > 0 && (
        <Card className="bg-[#15151c] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Receitas por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPorTipoEntrada}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dadosPorTipoEntrada.map((_, index) => (
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
          </CardContent>
        </Card>
      )}

      {/* Tabela de Lançamentos */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Lançamentos
          </CardTitle>
          <span className="text-white/50 text-sm">
            {entradas.length + saidas.length} registros
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Data</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Descrição</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Obra</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Categoria</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Classificação</th>
                  <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {[...entradas.map(e => ({ ...e, tipoLancamento: 'entrada' })), 
                  ...saidas.map(s => ({ ...s, tipoLancamento: 'saida' }))]
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((item: any) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white text-sm">
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          item.tipoLancamento === 'entrada' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {item.tipoLancamento === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{item.descricao || item.categoria}</td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {store.getObraById(item.obraId)?.nome || '-'}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {item.categoria || item.tipo}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm capitalize">
                        {item.classificacao.replace(/_/g, ' ')}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        item.tipoLancamento === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(item.valor)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
