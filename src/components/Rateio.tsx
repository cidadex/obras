import { useState } from 'react';
import { Plus, Trash2, Calculator, Split, AlertCircle, CheckCircle, Percent, DollarSign } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { StoreType } from '@/hooks/useStore';
import type { RateioItem } from '@/types';

interface RateioProps {
  store: StoreType;
}

interface RateioCompleto extends RateioItem {
  categoria: string;
  percentual: number;
}

const categoriasSaida = [
  'Mão de Obra',
  'Material',
  'Equipamento',
  'Serviço Terceirizado',
  'Despesa Administrativa',
  'Transporte',
  'Outros',
];

const formasPagamento = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
];

export function Rateio({ store }: RateioProps) {
  const [activeTab, setActiveTab] = useState('valor');
  const [valorTotal, setValorTotal] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [funcionarioId, setFuncionarioId] = useState('');
  const [rateios, setRateios] = useState<RateioCompleto[]>([]);
  const [showResult, setShowResult] = useState(false);

  const addRateio = () => {
    setRateios([...rateios, { obraId: '', valor: 0, categoria: 'Mão de Obra', percentual: 0 }]);
  };

  const removeRateio = (index: number) => {
    setRateios(rateios.filter((_, i) => i !== index));
  };

  const updateRateio = (index: number, field: keyof RateioCompleto, value: any) => {
    const newRateios = [...rateios];
    newRateios[index] = { ...newRateios[index], [field]: value };
    
    // Se mudou o percentual e estamos no modo percentual, atualiza o valor
    if (field === 'percentual' && activeTab === 'percentual') {
      const total = parseFloat(valorTotal) || 0;
      newRateios[index].valor = (total * value) / 100;
    }
    
    // Se mudou o valor e estamos no modo valor, atualiza o percentual
    if (field === 'valor' && activeTab === 'valor') {
      const total = parseFloat(valorTotal) || 0;
      newRateios[index].percentual = total > 0 ? (value / total) * 100 : 0;
    }
    
    setRateios(newRateios);
  };

  const calcularTotalRateio = () => {
    return rateios.reduce((sum, r) => sum + (r.valor || 0), 0);
  };

  const calcularTotalPercentual = () => {
    return rateios.reduce((sum, r) => sum + (r.percentual || 0), 0);
  };

  const distribuirIgualmente = () => {
    const total = parseFloat(valorTotal) || 0;
    if (total === 0 || rateios.length === 0) return;
    
    const valorPorObra = total / rateios.length;
    const percentualPorObra = 100 / rateios.length;
    
    setRateios(rateios.map(r => ({
      ...r,
      valor: valorPorObra,
      percentual: percentualPorObra,
    })));
  };

  const handleSubmit = () => {
    const total = parseFloat(valorTotal);
    const totalRateio = calcularTotalRateio();

    if (total !== totalRateio) {
      alert(`O valor total (${total.toFixed(2)}) não corresponde à soma dos rateios (${totalRateio.toFixed(2)})`);
      return;
    }

    // Criar lançamentos para cada rateio
    rateios.forEach((rateio) => {
      store.addLancamentoSaida({
        data,
        valor: rateio.valor,
        tipo: 'funcionario',
        obraId: rateio.obraId,
        funcionarioId: funcionarioId || undefined,
        categoria: rateio.categoria,
        formaPagamento: formaPagamento as any,
        classificacao: 'custo_obra',
        descricao: `${descricao} (Rateio)`,
        observacao: `Rateio: ${rateio.percentual.toFixed(2)}% do valor total - ${rateio.categoria}`,
        criadoPor: 'Admin',
      } as any);
    });

    setShowResult(true);
    setTimeout(() => {
      setValorTotal('');
      setDescricao('');
      setFuncionarioId('');
      setRateios([]);
      setShowResult(false);
    }, 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalRateio = calcularTotalRateio();
  const totalPercentual = calcularTotalPercentual();
  const valorTotalNum = parseFloat(valorTotal) || 0;
  const isBalanced = Math.abs(totalRateio - valorTotalNum) < 0.01 && totalPercentual === 100;

  return (
    <div className="space-y-6">
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Split className="h-5 w-5 text-emerald-400" />
            Rateio de Pagamentos entre Obras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados do Pagamento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Data *</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Valor Total (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                placeholder="0,00"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Forma de Pagamento *</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  {formasPagamento.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Funcionário</Label>
              <Select value={funcionarioId} onValueChange={setFuncionarioId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  {store.funcionarios.filter(f => f.ativo).map(func => (
                    <SelectItem key={func.id} value={func.id} className="text-white">
                      {func.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Descrição do Pagamento *</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Pagamento de diárias - Semana 10"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          {/* Tabs de Rateio */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#0f0f16] border border-white/5">
              <TabsTrigger value="valor" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <DollarSign className="h-4 w-4 mr-1" />
                Por Valor
              </TabsTrigger>
              <TabsTrigger value="percentual" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Percent className="h-4 w-4 mr-1" />
                Por Percentual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="valor" className="mt-4">
              <p className="text-white/50 text-sm mb-4">
                Informe o valor fixo para cada obra. O percentual será calculado automaticamente.
              </p>
            </TabsContent>

            <TabsContent value="percentual" className="mt-4">
              <p className="text-white/50 text-sm mb-4">
                Informe o percentual para cada obra. O valor será calculado automaticamente.
              </p>
            </TabsContent>
          </Tabs>

          {/* Rateios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Distribuição entre Obras</h3>
              <div className="flex gap-2">
                {rateios.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={distribuirIgualmente}
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Percent className="h-4 w-4 mr-2" />
                    Distribuir Igualmente
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRateio}
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Obra
                </Button>
              </div>
            </div>

            {rateios.length === 0 && (
              <div className="text-center py-8 bg-[#0f0f16] rounded-lg border border-white/5">
                <Split className="h-8 w-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/50">Adicione obras para distribuir o valor</p>
              </div>
            )}

            {rateios.map((rateio, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-[#0f0f16] rounded-lg border border-white/5">
                <div className="flex-1">
                  <Label className="text-white/50 text-xs mb-1 block">Obra *</Label>
                  <Select
                    value={rateio.obraId}
                    onValueChange={(value) => updateRateio(index, 'obraId', value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione a obra..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a22] border-white/10">
                      {store.obras.map(obra => (
                        <SelectItem key={obra.id} value={obra.id} className="text-white">
                          {obra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-white/50 text-xs mb-1 block">Categoria *</Label>
                  <Select
                    value={rateio.categoria}
                    onValueChange={(value) => updateRateio(index, 'categoria', value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a22] border-white/10">
                      {categoriasSaida.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label className="text-white/50 text-xs mb-1 block">
                    {activeTab === 'valor' ? 'Valor (R$) *' : '% *'}
                  </Label>
                  {activeTab === 'valor' ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={rateio.valor || ''}
                      onChange={(e) => updateRateio(index, 'valor', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  ) : (
                    <Input
                      type="number"
                      step="0.01"
                      value={rateio.percentual || ''}
                      onChange={(e) => updateRateio(index, 'percentual', parseFloat(e.target.value) || 0)}
                      placeholder="0%"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  )}
                </div>
                <div className="w-28">
                  <Label className="text-white/50 text-xs mb-1 block">
                    {activeTab === 'valor' ? '%' : 'Valor'}
                  </Label>
                  <div className="h-10 flex items-center text-sm font-medium text-white/60">
                    {activeTab === 'valor' 
                      ? `${rateio.percentual.toFixed(2)}%`
                      : formatCurrency(rateio.valor)
                    }
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-5"
                  onClick={() => removeRateio(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Resumo */}
          {rateios.length > 0 && (
            <div className="bg-[#0f0f16] p-4 rounded-lg border border-white/5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-white/50 text-sm">Valor Total do Pagamento</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(valorTotalNum)}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Total Rateado</p>
                  <p className={`text-xl font-bold ${Math.abs(totalRateio - valorTotalNum) < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formatCurrency(totalRateio)}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Total Percentual</p>
                  <p className={`text-xl font-bold ${totalPercentual === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {totalPercentual.toFixed(2)}%
                  </p>
                </div>
              </div>
              {!isBalanced && (
                <p className="text-sm text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {Math.abs(totalRateio - valorTotalNum) >= 0.01 
                    ? 'O valor rateado não corresponde ao valor total do pagamento'
                    : 'O percentual total deve ser 100%'
                  }
                </p>
              )}
            </div>
          )}

          {/* Botão de Salvar */}
          <Button
            onClick={handleSubmit}
            disabled={!valorTotal || !descricao || rateios.length === 0 || !isBalanced}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Registrar Rateio
          </Button>

          {showResult && (
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg text-center">
              <CheckCircle className="h-5 w-5 inline mr-2" />
              Rateio registrado com sucesso! {rateios.length} lançamentos criados.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explicação */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Como funciona o rateio?
          </h4>
          <ul className="text-sm text-blue-400/80 space-y-1 list-disc list-inside">
            <li>Informe o valor total do pagamento e a forma de pagamento</li>
            <li>Adicione as obras que receberão parte do valor</li>
            <li>Defina a categoria de cada rateio (Mão de Obra, Material, etc.)</li>
            <li>Use o modo "Por Valor" ou "Por Percentual"</li>
            <li>Clique em "Distribuir Igualmente" para dividir automaticamente</li>
            <li>O sistema criará automaticamente um lançamento para cada obra</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
