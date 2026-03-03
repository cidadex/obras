import { useState, useMemo } from 'react';
import { Filter, Download, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
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
} from 'recharts';
import type { StoreType } from '@/hooks/useStore';
import type { FiltroRelatorio } from '@/types';

interface RelatoriosProps {
  store: StoreType;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Relatorios({ store }: RelatoriosProps) {
  const [filtro, setFiltro] = useState<FiltroRelatorio>({});

  const { entradas, saidas } = useMemo(() => {
    return store.filtrarLancamentos(filtro);
  }, [store, filtro]);

  const totalEntradas = entradas.reduce((sum, e) => sum + e.valor, 0);
  const totalSaidas = saidas.reduce((sum, s) => sum + s.valor, 0);
  const resultado = totalEntradas - totalSaidas;

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const limparFiltros = () => {
    setFiltro({});
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-emerald-400" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <Label className="text-white/70">Data Início</Label>
              <Input
                type="date"
                value={filtro.dataInicio || ''}
                onChange={(e) => setFiltro({ ...filtro, dataInicio: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Data Fim</Label>
              <Input
                type="date"
                value={filtro.dataFim || ''}
                onChange={(e) => setFiltro({ ...filtro, dataFim: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
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

          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={limparFiltros} className="border-white/10 text-white hover:bg-white/5">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Tabela de Lançamentos */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Lançamentos
          </CardTitle>
          <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
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
