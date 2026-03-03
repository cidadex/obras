import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Building2, MapPin, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Obra } from '@/types';

interface ObrasProps {
  store: StoreType;
  onViewChange: (view: any, params?: any) => void;
}

const statusOptions = [
  { value: 'em_andamento', label: 'Em Andamento', color: 'emerald' },
  { value: 'concluida', label: 'Concluída', color: 'blue' },
  { value: 'pausada', label: 'Pausada', color: 'amber' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' },
];

export function Obras({ store, onViewChange }: ObrasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [formData, setFormData] = useState<Partial<Obra>>({
    status: 'em_andamento',
    orcamentoPrevisto: 0,
  });

  const filteredObras = store.obras.filter(
    (obra) =>
      obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.clienteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingObra) {
      store.updateObra(editingObra.id, formData);
    } else {
      store.addObra(formData as Omit<Obra, 'id'>);
    }
    
    setIsDialogOpen(false);
    setEditingObra(null);
    setFormData({ status: 'em_andamento', orcamentoPrevisto: 0 });
  };

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setFormData(obra);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta obra?')) {
      store.deleteObra(id);
    }
  };

  const handleNew = () => {
    setEditingObra(null);
    setFormData({ status: 'em_andamento', orcamentoPrevisto: 0 });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(o => o.value === status);
    return option?.color || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar obras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Obra
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a22] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingObra ? 'Editar Obra' : 'Nova Obra'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Nome da Obra *</Label>
                  <Input
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                <Label className="text-white/70">Endereço *</Label>
                <Input
                  value={formData.endereco || ''}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Data de Início *</Label>
                  <Input
                    type="date"
                    value={formData.dataInicio || ''}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Previsão de Término *</Label>
                  <Input
                    type="date"
                    value={formData.dataPrevisaoTermino || ''}
                    onChange={(e) => setFormData({ ...formData, dataPrevisaoTermino: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Obra['status'] })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a22] border-white/10">
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Valor do Contrato *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valorContrato || ''}
                    onChange={(e) => setFormData({ ...formData, valorContrato: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Orçamento Previsto *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.orcamentoPrevisto || ''}
                    onChange={(e) => setFormData({ ...formData, orcamentoPrevisto: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Responsável *</Label>
                  <Input
                    value={formData.responsavel || ''}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">% Conclusão</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentualConclusao || 0}
                    onChange={(e) => setFormData({ ...formData, percentualConclusao: parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Descrição</Label>
                <Input
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
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
                  {editingObra ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Obras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredObras.map((obra) => {
          const cliente = store.getClienteById(obra.clienteId);
          const statusColor = getStatusColor(obra.status);
          
          return (
            <Card 
              key={obra.id} 
              className="bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer"
              onClick={() => onViewChange('obra-detalhe', obra.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${statusColor}-500/10 flex items-center justify-center`}>
                      <Building2 className={`h-5 w-5 text-${statusColor}-400`} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                        {obra.nome}
                      </h3>
                      <p className="text-white/50 text-sm">{cliente?.nome}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${statusColor}-500/10 text-${statusColor}-400 border border-${statusColor}-500/20`}>
                    {statusOptions.find(o => o.value === obra.status)?.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-white/40" />
                    <span className="text-white/60 truncate">{obra.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-white/40" />
                    <span className="text-white/60">
                      Término: {new Date(obra.dataPrevisaoTermino).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-white/40" />
                    <span className="text-white/60">{obra.responsavel}</span>
                  </div>
                </div>

                {/* Progresso da obra */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Progresso</span>
                    <span>{obra.percentualConclusao}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all" 
                      style={{ width: `${obra.percentualConclusao}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="text-white/40 text-xs">Valor do Contrato</p>
                    <p className="text-emerald-400 font-medium">{formatCurrency(obra.valorContrato)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(obra);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(obra.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredObras.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhuma obra encontrada</p>
        </div>
      )}
    </div>
  );
}
