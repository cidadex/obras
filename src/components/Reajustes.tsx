import { useState } from 'react';
import { TrendingUp, History, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { StoreType } from '@/hooks/useStore';

interface ReajustesProps {
  store: StoreType;
}

export function Reajustes({ store }: ReajustesProps) {
  const [percentual, setPercentual] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAplicarReajuste = () => {
    const perc = parseFloat(percentual);
    if (isNaN(perc) || perc <= 0) {
      alert('Informe um percentual válido');
      return;
    }
    setShowConfirm(true);
  };

  const confirmarReajuste = () => {
    const perc = parseFloat(percentual);
    store.aplicarReajuste(perc, 'Admin');
    setShowConfirm(false);
    setShowSuccess(true);
    setPercentual('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularImpacto = () => {
    const perc = parseFloat(percentual) || 0;
    const totalAtual = store.composicoes
      .filter(c => c.ativo)
      .reduce((sum, c) => sum + c.valorUnitario, 0);
    const totalReajustado = totalAtual * (1 + perc / 100);
    return {
      totalAtual,
      totalReajustado,
      diferenca: totalReajustado - totalAtual,
      composicoesAfetadas: store.composicoes.filter(c => c.ativo).length,
    };
  };

  const impacto = calcularImpacto();

  return (
    <div className="space-y-6">
      {/* Card de Reajuste */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Reajuste Percentual Global
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-400">
              <p className="font-medium">Atenção!</p>
              <p>Esta ação irá reajustar todos os valores das composições ativas. O reajuste será aplicado sobre:</p>
              <ul className="list-disc list-inside mt-1 ml-1">
                <li>Valor unitário de venda</li>
                <li>Custo de material</li>
                <li>Custo de mão de obra</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Percentual de Reajuste (%)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={percentual}
                    onChange={(e) => setPercentual(e.target.value)}
                    placeholder="Ex: 5.5"
                    className="text-lg bg-white/5 border-white/10 text-white"
                  />
                  <span className="flex items-center text-lg font-medium text-white/50">%</span>
                </div>
              </div>

              <Button
                onClick={handleAplicarReajuste}
                disabled={!percentual || parseFloat(percentual) <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Aplicar Reajuste
              </Button>
            </div>

            <div className="bg-[#0f0f16] rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-white flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Simulação de Impacto
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Composições afetadas:</span>
                  <span className="text-white font-medium">{impacto.composicoesAfetadas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Valor total atual:</span>
                  <span className="text-white font-medium">{formatCurrency(impacto.totalAtual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Valor após reajuste:</span>
                  <span className="text-emerald-400 font-medium">
                    {formatCurrency(impacto.totalReajustado)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/5">
                  <span className="text-white/50">Diferença:</span>
                  <span className="text-emerald-400 font-medium">
                    +{formatCurrency(impacto.diferenca)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showSuccess && (
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Reajuste aplicado com sucesso! Todas as composições ativas foram atualizadas.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Reajustes */}
      <Card className="bg-[#15151c] border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-400" />
            Histórico de Reajustes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {store.historicoReajustes.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <History className="h-12 w-12 mx-auto mb-3 text-white/20" />
              <p>Nenhum reajuste aplicado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Data</th>
                    <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Percentual</th>
                    <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Composições Atualizadas</th>
                    <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Aplicado Por</th>
                  </tr>
                </thead>
                <tbody>
                  {[...store.historicoReajustes]
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((hist) => (
                      <tr key={hist.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white text-sm">
                          {new Date(hist.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                          +{hist.percentual.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-white text-sm">
                          {hist.composicoesAtualizadas.length}
                        </td>
                        <td className="py-3 px-4 text-white/60 text-sm">
                          {hist.aplicadoPor}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-[#1a1a22] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Reajuste</DialogTitle>
            <DialogDescription className="text-white/60">
              Você está prestes a aplicar um reajuste de <strong>{percentual}%</strong> em{' '}
              <strong>{impacto.composicoesAfetadas}</strong> composições ativas.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#0f0f16] p-4 rounded-lg space-y-2 my-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Valor total atual:</span>
              <span className="text-white">{formatCurrency(impacto.totalAtual)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Valor após reajuste:</span>
              <span className="text-emerald-400 font-medium">
                {formatCurrency(impacto.totalReajustado)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/5">
              <span className="text-white/50">Diferença:</span>
              <span className="text-emerald-400">+{formatCurrency(impacto.diferenca)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="border-white/10 text-white hover:bg-white/5">
              Cancelar
            </Button>
            <Button onClick={confirmarReajuste} className="bg-emerald-600 hover:bg-emerald-700">
              Confirmar Reajuste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
