import { useState } from 'react';
import { Plus, Trash2, Search, FileText, Calculator, Download, Eye } from 'lucide-react';
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
import type { Orcamento, ItemOrcamento } from '@/types';

interface OrcamentosProps {
  store: StoreType;
}

export function Orcamentos({ store }: OrcamentosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewOrcamento, setViewOrcamento] = useState<Orcamento | null>(null);
  const [formData, setFormData] = useState<Partial<Orcamento>>({
    data: new Date().toISOString().split('T')[0],
    bdi: 0,
    desconto: 0,
    itens: [],
    status: 'rascunho',
    validade: 30,
  });
  const [itens, setItens] = useState<ItemOrcamento[]>([]);

  const filteredOrcamentos = store.orcamentos.filter(
    (orc) => {
      const cliente = store.clientes.find(c => c.id === orc.clienteId);
      return (
        String(orc.numero).includes(searchTerm) ||
        cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const calcularTotalItens = () => {
    return itens.reduce((sum, item) => sum + item.valorTotal, 0);
  };

  const calcularValorFinal = () => {
    const total = calcularTotalItens();
    const bdi = formData.bdi || 0;
    const desconto = formData.desconto || 0;
    const comBdi = total * (1 + bdi / 100);
    return comBdi * (1 - desconto / 100);
  };

  const addItem = (composicaoId: string, quantidade: number) => {
    const composicao = store.composicoes.find(c => c.id === composicaoId);
    if (!composicao) return;

    const novoItem: ItemOrcamento = {
      composicaoId,
      quantidade,
      valorUnitario: composicao.valorUnitario,
      valorTotal: composicao.valorUnitario * quantidade,
    };

    setItens([...itens, novoItem]);
  };

  const removeItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const total = calcularTotalItens();
    const valorFinal = calcularValorFinal();

    store.addOrcamento({
      ...formData as Omit<Orcamento, 'id' | 'numero'>,
      itens,
      valorTotal: total,
      valorFinal,
    });

    setIsDialogOpen(false);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      bdi: 0,
      desconto: 0,
      itens: [],
      status: 'rascunho',
      validade: 30,
    });
    setItens([]);
  };

  const handleNew = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      bdi: 0,
      desconto: 0,
      itens: [],
      status: 'rascunho',
      validade: 30,
    });
    setItens([]);
    setIsDialogOpen(true);
  };

  const gerarPDF = (orcamento: Orcamento) => {
    const cliente = store.clientes.find(c => c.id === orcamento.clienteId);
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('PROPOSTA COMERCIAL', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Nº ${String(orcamento.numero).padStart(6, '0')}`, 190, 25, { align: 'right' });
    
    // Dados do cliente
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text('CLIENTE:', 20, 55);
    doc.text(cliente?.nome || 'Não informado', 50, 55);
    doc.text(`Data: ${new Date(orcamento.data).toLocaleDateString('pt-BR')}`, 150, 55);
    
    // Descrição da obra
    doc.text('OBRA:', 20, 65);
    const descricaoSplit = doc.splitTextToSize(orcamento.obraDescricao || 'Não informada', 130);
    doc.text(descricaoSplit, 50, 65);
    
    // Itens
    let y = 90;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setFontSize(10);
    doc.text('Item', 25, y);
    doc.text('Descrição', 45, y);
    doc.text('Un', 110, y);
    doc.text('Qtd', 125, y);
    doc.text('Unitário', 145, y);
    doc.text('Total', 175, y);
    
    y += 10;
    
    orcamento.itens.forEach((item, index) => {
      const comp = store.composicoes.find(c => c.id === item.composicaoId);
      if (comp) {
        doc.text(String(index + 1), 25, y);
        const nomeSplit = doc.splitTextToSize(comp.nome, 60);
        doc.text(nomeSplit, 45, y);
        doc.text(comp.unidade, 110, y);
        doc.text(String(item.quantidade), 125, y);
        doc.text(formatCurrency(item.valorUnitario), 145, y);
        doc.text(formatCurrency(item.valorTotal), 175, y);
        y += 8;
      }
    });
    
    // Totais
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(120, y - 5, 190, y - 5);
    
    doc.text('Subtotal:', 130, y);
    doc.text(formatCurrency(orcamento.valorTotal), 175, y);
    y += 7;
    
    if (orcamento.bdi > 0) {
      doc.text(`BDI (${orcamento.bdi}%):`, 130, y);
      doc.text(formatCurrency(orcamento.valorTotal * (orcamento.bdi / 100)), 175, y);
      y += 7;
    }
    
    if (orcamento.desconto > 0) {
      doc.text(`Desconto (${orcamento.desconto}%):`, 130, y);
      doc.text(formatCurrency(orcamento.valorTotal * (1 + orcamento.bdi / 100) * (orcamento.desconto / 100)), 175, y);
      y += 7;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('TOTAL:', 130, y + 5);
    doc.text(formatCurrency(orcamento.valorFinal), 175, y + 5);
    
    // Rodapé
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Construtora Pro - Sistema de Gestão', 105, 280, { align: 'center' });
    doc.text(`Esta proposta é válida por ${orcamento.validade} dias.`, 105, 285, { align: 'center' });
    
    doc.save(`proposta_${String(orcamento.numero).padStart(6, '0')}.pdf`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const [novoItem, setNovoItem] = useState({ composicaoId: '', quantidade: '' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'emerald';
      case 'rejeitado': return 'red';
      case 'enviado': return 'blue';
      default: return 'amber';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'rejeitado': return 'Rejeitado';
      case 'enviado': return 'Enviado';
      default: return 'Rascunho';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar orçamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a22] border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Novo Orçamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Básicos */}
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
                  <Label className="text-white/70">Cliente *</Label>
                  <Select
                    value={formData.clienteId}
                    onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a22] border-white/10">
                      {store.clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id} className="text-white">
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Descrição da Obra/Serviço *</Label>
                <Input
                  value={formData.obraDescricao || ''}
                  onChange={(e) => setFormData({ ...formData, obraDescricao: e.target.value })}
                  placeholder="Descreva a obra ou serviço..."
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              {/* Adicionar Itens */}
              <Card className="bg-[#0f0f16] border-white/5">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Adicionar Itens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Select
                        value={novoItem.composicaoId}
                        onValueChange={(value) => setNovoItem({ ...novoItem, composicaoId: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione a composição..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a22] border-white/10">
                          {store.composicoes.filter(c => c.ativo).map(comp => (
                            <SelectItem key={comp.id} value={comp.id} className="text-white">
                              {comp.codigo} - {comp.nome} ({formatCurrency(comp.valorUnitario)}/{comp.unidade})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Qtd"
                        value={novoItem.quantidade}
                        onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        if (novoItem.composicaoId && novoItem.quantidade) {
                          addItem(novoItem.composicaoId, parseFloat(novoItem.quantidade));
                          setNovoItem({ composicaoId: '', quantidade: '' });
                        }
                      }}
                      disabled={!novoItem.composicaoId || !novoItem.quantidade}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {itens.length > 0 && (
                    <div className="border border-white/5 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="text-left py-2 px-3 text-white/50">Item</th>
                            <th className="text-left py-2 px-3 text-white/50">Un</th>
                            <th className="text-right py-2 px-3 text-white/50">Qtd</th>
                            <th className="text-right py-2 px-3 text-white/50">Unitário</th>
                            <th className="text-right py-2 px-3 text-white/50">Total</th>
                            <th className="py-2 px-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {itens.map((item, index) => {
                            const comp = store.composicoes.find(c => c.id === item.composicaoId);
                            return (
                              <tr key={index} className="border-t border-white/5">
                                <td className="py-2 px-3 text-white">{comp?.nome}</td>
                                <td className="py-2 px-3 text-white/60">{comp?.unidade}</td>
                                <td className="py-2 px-3 text-right text-white">{item.quantidade}</td>
                                <td className="py-2 px-3 text-right text-white/60">{formatCurrency(item.valorUnitario)}</td>
                                <td className="py-2 px-3 text-right text-white font-medium">{formatCurrency(item.valorTotal)}</td>
                                <td className="py-2 px-3">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-400 hover:text-red-300"
                                    onClick={() => removeItem(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
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

              {/* BDI e Desconto */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">BDI (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.bdi || ''}
                    onChange={(e) => setFormData({ ...formData, bdi: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Desconto (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.desconto || ''}
                    onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Resumo */}
              <Card className="bg-[#0f0f16] border-white/5">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Subtotal:</span>
                    <span className="text-white">{formatCurrency(calcularTotalItens())}</span>
                  </div>
                  {(formData.bdi || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">BDI ({formData.bdi}%):</span>
                      <span className="text-white">{formatCurrency(calcularTotalItens() * ((formData.bdi || 0) / 100))}</span>
                    </div>
                  )}
                  {(formData.desconto || 0) > 0 && (
                    <div className="flex justify-between text-sm text-red-400">
                      <span>Desconto ({formData.desconto}%):</span>
                      <span>-{formatCurrency(calcularTotalItens() * (1 + (formData.bdi || 0) / 100) * ((formData.desconto || 0) / 100))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
                    <span className="text-white">TOTAL:</span>
                    <span className="text-emerald-400">{formatCurrency(calcularValorFinal())}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={itens.length === 0 || !formData.clienteId}
                >
                  Criar Orçamento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrcamentos.map((orcamento) => {
          const cliente = store.clientes.find(c => c.id === orcamento.clienteId);
          const statusColor = getStatusColor(orcamento.status);
          
          return (
            <Card key={orcamento.id} className="bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">Orçamento Nº {String(orcamento.numero).padStart(6, '0')}</CardTitle>
                      <p className="text-white/50 text-sm">
                        {new Date(orcamento.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${statusColor}-500/10 text-${statusColor}-400 border border-${statusColor}-500/20`}>
                    {getStatusLabel(orcamento.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Cliente:</span>
                  <span className="text-white/70">{cliente?.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Itens:</span>
                  <span className="text-white/70">{orcamento.itens.length}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-white/50">Valor Total:</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {formatCurrency(orcamento.valorFinal)}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                    onClick={() => setViewOrcamento(orcamento)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => gerarPDF(orcamento)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de Visualização */}
      <Dialog open={!!viewOrcamento} onOpenChange={() => setViewOrcamento(null)}>
        <DialogContent className="bg-[#1a1a22] border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Orçamento Nº {viewOrcamento && String(viewOrcamento.numero).padStart(6, '0')}
            </DialogTitle>
          </DialogHeader>
          {viewOrcamento && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/50">Cliente:</span>{' '}
                  <span className="text-white">{store.clientes.find(c => c.id === viewOrcamento.clienteId)?.nome}</span>
                </div>
                <div>
                  <span className="text-white/50">Data:</span>{' '}
                  <span className="text-white">{new Date(viewOrcamento.data).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              
              <div className="border border-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left py-3 px-4 text-white/50">Item</th>
                      <th className="text-left py-3 px-4 text-white/50">Un</th>
                      <th className="text-right py-3 px-4 text-white/50">Qtd</th>
                      <th className="text-right py-3 px-4 text-white/50">Unitário</th>
                      <th className="text-right py-3 px-4 text-white/50">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrcamento.itens.map((item, index) => {
                      const comp = store.composicoes.find(c => c.id === item.composicaoId);
                      return (
                        <tr key={index} className="border-t border-white/5">
                          <td className="py-3 px-4 text-white">{comp?.nome}</td>
                          <td className="py-3 px-4 text-white/60">{comp?.unidade}</td>
                          <td className="py-3 px-4 text-right text-white">{item.quantidade}</td>
                          <td className="py-3 px-4 text-right text-white/60">{formatCurrency(item.valorUnitario)}</td>
                          <td className="py-3 px-4 text-right text-white font-medium">{formatCurrency(item.valorTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#0f0f16] p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Subtotal:</span>
                  <span className="text-white">{formatCurrency(viewOrcamento.valorTotal)}</span>
                </div>
                {(viewOrcamento.bdi || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">BDI ({viewOrcamento.bdi}%):</span>
                    <span className="text-white">{formatCurrency(viewOrcamento.valorTotal * ((viewOrcamento.bdi || 0) / 100))}</span>
                  </div>
                )}
                {(viewOrcamento.desconto || 0) > 0 && (
                  <div className="flex justify-between text-sm text-red-400">
                    <span>Desconto ({viewOrcamento.desconto}%):</span>
                    <span>-{formatCurrency(viewOrcamento.valorTotal * (1 + (viewOrcamento.bdi || 0) / 100) * ((viewOrcamento.desconto || 0) / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/5">
                  <span className="text-white">TOTAL:</span>
                  <span className="text-emerald-400">{formatCurrency(viewOrcamento.valorFinal)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredOrcamentos.length === 0 && (
        <div className="text-center py-12">
          <Calculator className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhum orçamento encontrado</p>
        </div>
      )}
    </div>
  );
}
