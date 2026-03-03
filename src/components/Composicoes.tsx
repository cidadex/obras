import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Calculator, TrendingUp } from 'lucide-react';
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
import type { StoreType } from '@/hooks/useStore';
import type { ComposicaoServico } from '@/types';

interface ComposicoesProps {
  store: StoreType;
}

const categorias = [
  'Alvenaria',
  'Concreto',
  'Acabamento',
  'Pintura',
  'Elétrica',
  'Hidráulica',
  'Estrutura',
  'Carpintaria',
];

export function Composicoes({ store }: ComposicoesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComposicaoServico | null>(null);
  const [formData, setFormData] = useState<Partial<ComposicaoServico>>({
    ativo: true,
    margem: 0.1,
    categoria: 'Acabamento',
  });

  const filteredComposicoes = store.composicoes.filter(
    (comp) =>
      comp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valorUnitario = (formData.custoMaterial || 0) + (formData.custoMaoObra || 0);
    const valorComMargem = valorUnitario * (1 + (formData.margem || 0));

    const dataToSave = {
      ...formData,
      valorUnitario: valorComMargem,
    };

    if (editingItem) {
      store.updateComposicao(editingItem.id, dataToSave);
    } else {
      store.addComposicao(dataToSave as Omit<ComposicaoServico, 'id'>);
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({ ativo: true, margem: 0.1, categoria: 'Acabamento' });
  };

  const handleEdit = (item: ComposicaoServico) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta composição?')) {
      store.deleteComposicao(id);
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData({ ativo: true, margem: 0.1, categoria: 'Acabamento' });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularValorSugerido = () => {
    const material = formData.custoMaterial || 0;
    const maoObra = formData.custoMaoObra || 0;
    const margem = formData.margem || 0;
    return (material + maoObra) * (1 + margem);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar composições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Composição
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a22] border-white/10 max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingItem ? 'Editar Composição' : 'Nova Composição'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Código *</Label>
                  <Input
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: CONT-001"
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Unidade *</Label>
                  <Input
                    value={formData.unidade || ''}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    placeholder="Ex: m²"
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Nome do Serviço *</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Contrapiso até 3cm"
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a22] border-white/10">
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Custo Material (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.custoMaterial || ''}
                    onChange={(e) => setFormData({ ...formData, custoMaterial: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Custo Mão de Obra (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.custoMaoObra || ''}
                    onChange={(e) => setFormData({ ...formData, custoMaoObra: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Margem (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={((formData.margem || 0) * 100)}
                    onChange={(e) => setFormData({ ...formData, margem: parseFloat(e.target.value) / 100 })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Valor Unitário Calculado</Label>
                  <div className="h-10 flex items-center text-lg font-bold text-emerald-400">
                    {formatCurrency(calcularValorSugerido())}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Descrição</Label>
                <Input
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Detalhes do serviço..."
                  className="bg-white/5 border-white/10 text-white"
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
                  {editingItem ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComposicoes.map((comp) => (
          <Card key={comp.id} className={`bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all ${!comp.ativo ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">{comp.codigo}</CardTitle>
                    <p className="text-white/50 text-xs">{comp.unidade}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5"
                    onClick={() => handleEdit(comp)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDelete(comp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="font-medium text-white">{comp.nome}</div>
              {comp.descricao && (
                <div className="text-white/50 text-sm">{comp.descricao}</div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/40">Categoria:</span>
                <span className="text-white/70">{comp.categoria}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                <div>
                  <span className="text-white/40">Material:</span>{' '}
                  <span className="text-white/70">{formatCurrency(comp.custoMaterial)}</span>
                </div>
                <div>
                  <span className="text-white/40">Mão de Obra:</span>{' '}
                  <span className="text-white/70">{formatCurrency(comp.custoMaoObra)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 text-sm text-white/50">
                  <TrendingUp className="h-4 w-4" />
                  Margem: {(comp.margem * 100).toFixed(0)}%
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  {formatCurrency(comp.valorUnitario)}
                </div>
              </div>
              {!comp.ativo && (
                <span className="inline-block px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs">
                  Inativo
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComposicoes.length === 0 && (
        <div className="text-center py-12">
          <Calculator className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhuma composição encontrada</p>
        </div>
      )}
    </div>
  );
}
