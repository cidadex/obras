import { useState } from 'react';
import { Upload, Link2, CheckCircle, FileText, AlertTriangle } from 'lucide-react';
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
import type { StoreType } from '@/hooks/useStore';
import type { ExtratoBancario } from '@/types';

interface ConciliacaoProps {
  store: StoreType;
}

export function Conciliacao({ store }: ConciliacaoProps) {
  const [importando, setImportando] = useState(false);
  const [selectedExtrato, setSelectedExtrato] = useState<string | null>(null);
  const [selectedLancamento, setSelectedLancamento] = useState<string | null>(null);

  // Simulação de dados de extrato
  const extratosSimulados: ExtratoBancario[] = [
    {
      id: 'ext-1',
      data: '2024-03-01',
      descricao: 'PIX RECEBIDO - JOAO SILVA',
      valor: 50000,
      tipo: 'entrada',
      conciliado: false,
    },
    {
      id: 'ext-2',
      data: '2024-03-02',
      descricao: 'PAGAMENTO FORNECEDOR - CIMENTO FORTE',
      valor: 15000,
      tipo: 'saida',
      conciliado: false,
    },
    {
      id: 'ext-3',
      data: '2024-03-03',
      descricao: 'TRANSFERENCIA RECEBIDA - MARIA EMPREEND',
      valor: 75000,
      tipo: 'entrada',
      conciliado: false,
    },
    {
      id: 'ext-4',
      data: '2024-03-04',
      descricao: 'PAGAMENTO FUNCIONARIO - PEDRO ALMEIDA',
      valor: 3500,
      tipo: 'saida',
      conciliado: true,
      lancamentoId: '1',
    },
  ];

  const [extratos, setExtratos] = useState<ExtratoBancario[]>(extratosSimulados);

  const handleImportar = () => {
    setImportando(true);
    setTimeout(() => {
      setImportando(false);
      alert('Extrato importado com sucesso! (Simulação)');
    }, 1500);
  };

  const handleConciliar = () => {
    if (!selectedExtrato || !selectedLancamento) {
      alert('Selecione um item do extrato e um lançamento para conciliar');
      return;
    }

    store.conciliarExtrato(selectedExtrato, selectedLancamento);
    setExtratos(prev => prev.map(e => 
      e.id === selectedExtrato 
        ? { ...e, conciliado: true, lancamentoId: selectedLancamento }
        : e
    ));
    
    setSelectedExtrato(null);
    setSelectedLancamento(null);
    alert('Item conciliado com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const naoConciliados = extratos.filter(e => !e.conciliado);
  const conciliados = extratos.filter(e => e.conciliado);

  return (
    <div className="space-y-6">
      {/* Importação */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-400" />
            Importar Extrato Bancário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv,.ofx,.txt"
                className="bg-white/5 border-white/10 text-white file:text-white file:bg-white/10"
              />
            </div>
            <Button 
              onClick={handleImportar}
              disabled={importando}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {importando ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-white/40 mt-2">
            Formatos suportados: CSV, OFX, TXT. O arquivo deve conter data, descrição e valor.
          </p>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#15151c] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Movimentações Não Conciliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {naoConciliados.length}
            </div>
            <p className="text-xs text-white/40">
              Total: {formatCurrency(naoConciliados.reduce((sum, e) => sum + e.valor, 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Movimentações Conciliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {conciliados.length}
            </div>
            <p className="text-xs text-white/40">
              Total: {formatCurrency(conciliados.reduce((sum, e) => sum + e.valor, 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#15151c] border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Total do Extrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {extratos.length}
            </div>
            <p className="text-xs text-white/40">
              Total: {formatCurrency(extratos.reduce((sum, e) => sum + e.valor, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Não Conciliados */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Movimentações Não Conciliadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {naoConciliados.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white/60">Todas as movimentações estão conciliadas!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {naoConciliados.map((extrato) => (
                <div
                  key={extrato.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedExtrato === extrato.id
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-white/5 bg-[#0f0f16] hover:border-white/10'
                  }`}
                  onClick={() => setSelectedExtrato(extrato.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={selectedExtrato === extrato.id}
                        onChange={() => setSelectedExtrato(extrato.id)}
                        className="h-4 w-4 text-emerald-500"
                      />
                      <div>
                        <p className="font-medium text-white">{extrato.descricao}</p>
                        <p className="text-sm text-white/50">
                          {new Date(extrato.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right font-bold ${
                      extrato.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {extrato.tipo === 'entrada' ? '+' : '-'}{formatCurrency(extrato.valor)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Seleção de Lançamento */}
              {selectedExtrato && (
                <div className="mt-6 p-4 bg-[#0f0f16] rounded-lg border border-white/5">
                  <Label className="text-white/70 mb-2 block">Vincular a um lançamento:</Label>
                  <Select
                    value={selectedLancamento || ''}
                    onValueChange={setSelectedLancamento}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione o lançamento correspondente..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a22] border-white/10">
                      {store.lancamentosEntrada.map(lanc => (
                        <SelectItem key={lanc.id} value={lanc.id} className="text-white">
                          {new Date(lanc.data).toLocaleDateString('pt-BR')} - {lanc.descricao} ({formatCurrency(lanc.valor)})
                        </SelectItem>
                      ))}
                      {store.lancamentosSaida.map(lanc => (
                        <SelectItem key={lanc.id} value={lanc.id} className="text-white">
                          {new Date(lanc.data).toLocaleDateString('pt-BR')} - {lanc.categoria} ({formatCurrency(lanc.valor)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleConciliar}
                    disabled={!selectedLancamento}
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Conciliar
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Conciliados */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            Movimentações Conciliadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conciliados.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <FileText className="h-12 w-12 mx-auto mb-3 text-white/20" />
              <p>Nenhuma movimentação conciliada ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Descrição</th>
                    <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                    <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {conciliados.map((extrato) => (
                    <tr key={extrato.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white text-sm">
                        {new Date(extrato.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{extrato.descricao}</td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        extrato.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {extrato.tipo === 'entrada' ? '+' : '-'}{formatCurrency(extrato.valor)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Conciliado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
