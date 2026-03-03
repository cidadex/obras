import { useState } from 'react';
import { Plus, Trash2, Search, Download, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import type { StoreType } from '@/hooks/useStore';
import type { Recibo } from '@/types';

interface RecibosProps {
  store: StoreType;
}

const tiposRecibo = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'cafe_manha', label: 'Café da Manhã' },
  { value: 'passagem', label: 'Passagem' },
  { value: 'pagamento_avulso', label: 'Pagamento Avulso' },
  { value: 'adiantamento', label: 'Adiantamento' },
];

export function Recibos({ store }: RecibosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Recibo>>({
    data: new Date().toISOString().split('T')[0],
  });
  const [assinatura, setAssinatura] = useState('');

  const filteredRecibos = store.recibos.filter(
    (recibo) => {
      const funcionario = store.funcionarios.find(f => f.id === recibo.funcionarioId);
      const obra = store.obras.find(o => o.id === recibo.obraId);
      return (
        funcionario?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recibo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    store.addRecibo({
      ...formData as Omit<Recibo, 'id' | 'numero'>,
      assinatura: assinatura || undefined,
      geradoPor: 'Admin',
    });
    
    setIsDialogOpen(false);
    setFormData({ data: new Date().toISOString().split('T')[0] });
    setAssinatura('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este recibo?')) {
      store.deleteRecibo(id);
    }
  };

  const handleNew = () => {
    setFormData({ data: new Date().toISOString().split('T')[0] });
    setAssinatura('');
    setIsDialogOpen(true);
  };

  const gerarPDF = (recibo: Recibo) => {
    const funcionario = store.funcionarios.find(f => f.id === recibo.funcionarioId);
    const obra = store.obras.find(o => o.id === recibo.obraId);
    
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('RECIBO', 105, 25, { align: 'center' });
    
    // Número do recibo
    doc.setFontSize(14);
    doc.text(`Nº ${String(recibo.numero).padStart(6, '0')}`, 190, 25, { align: 'right' });
    
    // Conteúdo
    doc.setTextColor(50, 50, 50);
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(recibo.valor);
    
    const tipoLabel = tiposRecibo.find(t => t.value === recibo.tipo)?.label || recibo.tipo;
    
    doc.setFontSize(12);
    const texto = `Eu, ${funcionario?.nome || '_____________________'}, portador do CPF ${funcionario?.cpf || '_____________________'}, declaro que RECEBI da empresa CONSTRUTORA PRO LTDA, a importância de ${valorFormatado} (${valorPorExtenso(recibo.valor)}), referente a ${tipoLabel.toUpperCase()} na obra ${obra?.nome || '_____________________'} em ${new Date(recibo.data).toLocaleDateString('pt-BR')}.`;
    
    const splitText = doc.splitTextToSize(texto, 170);
    doc.text(splitText, 20, 60);
    
    // Assinatura
    doc.text('_'.repeat(50), 105, 140, { align: 'center' });
    doc.text(funcionario?.nome || 'Assinatura do Recebedor', 105, 150, { align: 'center' });
    doc.text(`CPF: ${funcionario?.cpf || ''}`, 105, 158, { align: 'center' });
    
    // Rodapé
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Construtora Pro - Sistema de Gestão', 105, 280, { align: 'center' });
    
    doc.save(`recibo_${String(recibo.numero).padStart(6, '0')}.pdf`);
  };

  const valorPorExtenso = (valor: number): string => {
    return `${valor.toFixed(2).replace('.', ',')} reais`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar recibos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Recibo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a22] border-white/10 max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Novo Recibo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Data *</Label>
                  <Input
                    type="date"
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Valor (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor || ''}
                    onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Funcionário *</Label>
                  <Select
                    value={formData.funcionarioId}
                    onValueChange={(value) => setFormData({ ...formData, funcionarioId: value })}
                  >
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
                <div className="space-y-2">
                  <Label className="text-white/70">Obra *</Label>
                  <Select
                    value={formData.obraId}
                    onValueChange={(value) => setFormData({ ...formData, obraId: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione..." />
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
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Tipo de Recibo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a22] border-white/10">
                    {tiposRecibo.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Descrição/Observação</Label>
                <Input
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Assinatura (opcional)</Label>
                <Input
                  value={assinatura}
                  onChange={(e) => setAssinatura(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Nome para assinatura digital"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Criar Recibo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Recibos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecibos.map((recibo) => {
          const funcionario = store.funcionarios.find(f => f.id === recibo.funcionarioId);
          const obra = store.obras.find(o => o.id === recibo.obraId);
          const tipoLabel = tiposRecibo.find(t => t.value === recibo.tipo)?.label || recibo.tipo;

          return (
            <Card key={recibo.id} className="bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">Recibo Nº {String(recibo.numero).padStart(6, '0')}</CardTitle>
                      <p className="text-white/50 text-sm">{tipoLabel}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      onClick={() => gerarPDF(recibo)}
                      title="Baixar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(recibo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Funcionário:</span>
                  <span className="text-white/70">{funcionario?.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Obra:</span>
                  <span className="text-white/70">{obra?.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Data:</span>
                  <span className="text-white/70">
                    {new Date(recibo.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-white/50">Valor:</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {formatCurrency(recibo.valor)}
                  </span>
                </div>
                {recibo.descricao && (
                  <p className="text-white/40 text-sm mt-2">{recibo.descricao}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecibos.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhum recibo encontrado</p>
        </div>
      )}
    </div>
  );
}
