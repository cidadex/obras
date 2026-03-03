import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, Truck, HardHat } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import type { StoreType } from '@/hooks/useStore';
import type { Cliente, Funcionario, Fornecedor } from '@/types';

type CadastroType = 'clientes' | 'funcionarios' | 'fornecedores';

interface CadastrosProps {
  store: StoreType;
  type: CadastroType;
}

export function Cadastros({ store, type }: CadastrosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cliente | Funcionario | Fornecedor | null>(null);
  const [formData, setFormData] = useState<Partial<Cliente | Funcionario | Fornecedor>>({});

  const getData = () => {
    switch (type) {
      case 'clientes':
        return store.clientes;
      case 'funcionarios':
        return store.funcionarios;
      case 'fornecedores':
        return store.fornecedores;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'clientes':
        return 'Clientes';
      case 'funcionarios':
        return 'Funcionários';
      case 'fornecedores':
        return 'Fornecedores';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'clientes':
        return Users;
      case 'funcionarios':
        return HardHat;
      case 'fornecedores':
        return Truck;
    }
  };

  const data = getData();
  const Icon = getIcon();

  const filteredData = data.filter(
    (item) =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ('cpfCnpj' in item && item.cpfCnpj.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ('cpf' in item && item.cpf.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      switch (type) {
        case 'clientes':
          store.updateCliente(editingItem.id, formData);
          break;
        case 'funcionarios':
          store.updateFuncionario(editingItem.id, formData);
          break;
        case 'fornecedores':
          store.updateFornecedor(editingItem.id, formData);
          break;
      }
    } else {
      switch (type) {
        case 'clientes':
          store.addCliente(formData as Omit<Cliente, 'id'>);
          break;
        case 'funcionarios':
          store.addFuncionario(formData as Omit<Funcionario, 'id'>);
          break;
        case 'fornecedores':
          store.addFornecedor(formData as Omit<Fornecedor, 'id'>);
          break;
      }
    }

    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleEdit = (item: Cliente | Funcionario | Fornecedor) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Tem certeza que deseja excluir?`)) {
      switch (type) {
        case 'clientes':
          store.deleteCliente(id);
          break;
        case 'funcionarios':
          store.deleteFuncionario(id);
          break;
        case 'fornecedores':
          store.deleteFornecedor(id);
          break;
      }
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setFormData(type === 'funcionarios' ? { ativo: true, dataAdmissao: new Date().toISOString().split('T')[0], valorDiaria: 0, valorHora: 0 } : {});
    setIsDialogOpen(true);
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
            placeholder={`Buscar ${getTitle().toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo {type === 'funcionarios' ? 'Funcionário' : type === 'fornecedores' ? 'Fornecedor' : 'Cliente'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a22] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingItem ? 'Editar' : 'Novo'} {type === 'funcionarios' ? 'Funcionário' : type === 'fornecedores' ? 'Fornecedor' : 'Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Nome *</Label>
                  <Input
                    value={(formData as any).nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">
                    {type === 'funcionarios' ? 'CPF *' : 'CPF/CNPJ *'}
                  </Label>
                  <Input
                    value={(formData as any).cpfCnpj || (formData as any).cpf || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [type === 'funcionarios' ? 'cpf' : 'cpfCnpj']: e.target.value 
                    })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Telefone *</Label>
                  <Input
                    value={(formData as any).telefone || ''}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Email *</Label>
                  <Input
                    type="email"
                    value={(formData as any).email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              {type === 'funcionarios' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Cargo *</Label>
                      <Input
                        value={(formData as any).cargo || ''}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Data de Admissão *</Label>
                      <Input
                        type="date"
                        value={(formData as any).dataAdmissao || ''}
                        onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/70">Valor da Diária (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(formData as any).valorDiaria || ''}
                        onChange={(e) => setFormData({ ...formData, valorDiaria: parseFloat(e.target.value) })}
                        className="bg-white/5 border-white/10 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Valor da Hora (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={(formData as any).valorHora || ''}
                        onChange={(e) => setFormData({ ...formData, valorHora: parseFloat(e.target.value) })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Obra Vinculada</Label>
                    <Select
                      value={(formData as any).obraId || ''}
                      onValueChange={(value) => setFormData({ ...formData, obraId: value || undefined })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Selecione uma obra..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a22] border-white/10">
                        <SelectItem value="" className="text-white">Nenhuma</SelectItem>
                        {store.obras.map(obra => (
                          <SelectItem key={obra.id} value={obra.id} className="text-white">
                            {obra.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={(formData as any).ativo ?? true}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                    />
                    <Label className="text-white/70">Ativo</Label>
                  </div>
                </>
              )}

              {type === 'fornecedores' && (
                <div className="space-y-2">
                  <Label className="text-white/70">Categoria *</Label>
                  <Input
                    value={(formData as any).categoria || ''}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white/70">Endereço *</Label>
                <Input
                  value={(formData as any).endereco || ''}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
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
        {filteredData.map((item) => {
          const obra = type === 'funcionarios' && (item as any).obraId 
            ? store.getObraById((item as any).obraId) 
            : null;
          
          return (
            <Card key={item.id} className="bg-[#15151c] border-white/5 hover:border-emerald-500/30 transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{item.nome}</CardTitle>
                      <p className="text-white/50 text-xs">
                        {'cpfCnpj' in item ? item.cpfCnpj : item.cpf}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Telefone:</span>
                  <span className="text-white/70">{item.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/40">Email:</span>
                  <span className="text-white/70 truncate">{item.email}</span>
                </div>
                {'endereco' in item && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/40">Endereço:</span>
                    <span className="text-white/70 truncate">{item.endereco}</span>
                  </div>
                )}
                {type === 'funcionarios' && 'cargo' in item && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/40">Cargo:</span>
                      <span className="text-white/70">{item.cargo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/40">Diária:</span>
                      <span className="text-emerald-400 font-medium">{formatCurrency(item.valorDiaria)}</span>
                    </div>
                    {obra && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/40">Obra:</span>
                        <span className="text-blue-400">{obra.nome}</span>
                      </div>
                    )}
                    {!(item as any).ativo && (
                      <span className="inline-block px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs">
                        Inativo
                      </span>
                    )}
                  </>
                )}
                {type === 'fornecedores' && 'categoria' in item && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/40">Categoria:</span>
                    <span className="text-white/70">{(item as any).categoria}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Icon className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhum registro encontrado</p>
        </div>
      )}
    </div>
  );
}
