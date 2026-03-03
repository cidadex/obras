import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';
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
import type { LancamentoEntrada, LancamentoSaida, TipoEntrada, TipoSaida, FormaPagamento } from '@/types';

type LancamentoType = 'entradas' | 'saidas';

interface LancamentosProps {
  store: StoreType;
  type: LancamentoType;
}

const tiposEntrada = [
  { value: 'parcela_contratual', label: 'Parcela Contratual' },
  { value: 'aditivo', label: 'Aditivo' },
  { value: 'medicao', label: 'Medição' },
  { value: 'pagamento_avulso', label: 'Pagamento Avulso' },
  { value: 'receita_extra', label: 'Receita Extra' },
];

const tiposSaida = [
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'fornecedor', label: 'Fornecedor' },
  { value: 'prestador_servico', label: 'Prestador de Serviço' },
  { value: 'despesa_administrativa', label: 'Despesa Administrativa' },
  { value: 'imposto', label: 'Imposto' },
  { value: 'material', label: 'Material' },
];

const formasPagamento = [
  { value: 'pix', label: 'PIX' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
];

const classificacoesEntrada = [
  { value: 'receita_obra', label: 'Receita de Obra' },
  { value: 'aporte_socio', label: 'Aporte de Sócio' },
  { value: 'emprestimo_socio', label: 'Empréstimo de Sócio' },
];

const classificacoesSaida = [
  { value: 'custo_obra', label: 'Custo de Obra' },
  { value: 'despesa_administrativa', label: 'Despesa Administrativa' },
  { value: 'retirada_lucro_socio', label: 'Retirada de Lucro do Sócio' },
];

export function Lancamentos({ store, type }: LancamentosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroObra, setFiltroObra] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntrada, setEditingEntrada] = useState<LancamentoEntrada | null>(null);
  const [editingSaida, setEditingSaida] = useState<LancamentoSaida | null>(null);
  const [formEntrada, setFormEntrada] = useState<Partial<LancamentoEntrada>>({
    data: new Date().toISOString().split('T')[0],
  });
  const [formSaida, setFormSaida] = useState<Partial<LancamentoSaida>>({
    data: new Date().toISOString().split('T')[0],
  });

  const isEntrada = type === 'entradas';
  const data = isEntrada ? store.lancamentosEntrada : store.lancamentosSaida;
  const Icon = isEntrada ? ArrowUpCircle : ArrowDownCircle;

  const filteredData = data.filter(
    (item) => {
      const desc = ('descricao' in item && item.descricao) ? item.descricao : '';
      const matchSearch = desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.getObraById(item.obraId)?.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchObra = !filtroObra || item.obraId === filtroObra;
      return matchSearch && matchObra;
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEntrada) {
      if (editingEntrada) {
        store.updateLancamentoEntrada(editingEntrada.id, formEntrada);
      } else {
        store.addLancamentoEntrada({
          ...formEntrada as Omit<LancamentoEntrada, 'id' | 'criadoEm'>,
          criadoPor: 'Admin',
        });
      }
      setEditingEntrada(null);
      setFormEntrada({ data: new Date().toISOString().split('T')[0] });
    } else {
      if (editingSaida) {
        store.updateLancamentoSaida(editingSaida.id, formSaida);
      } else {
        store.addLancamentoSaida({
          ...formSaida as Omit<LancamentoSaida, 'id' | 'criadoEm'>,
          criadoPor: 'Admin',
        });
      }
      setEditingSaida(null);
      setFormSaida({ data: new Date().toISOString().split('T')[0] });
    }

    setIsDialogOpen(false);
  };

  const handleEdit = (item: LancamentoEntrada | LancamentoSaida) => {
    if (isEntrada) {
      setEditingEntrada(item as LancamentoEntrada);
      setFormEntrada(item as LancamentoEntrada);
    } else {
      setEditingSaida(item as LancamentoSaida);
      setFormSaida(item as LancamentoSaida);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      if (isEntrada) {
        store.deleteLancamentoEntrada(id);
      } else {
        store.deleteLancamentoSaida(id);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const total = data.reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Buscar lançamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Select
            value={filtroObra}
            onValueChange={setFiltroObra}
          >
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <Filter className="h-4 w-4 mr-2 text-white/40" />
              <SelectValue placeholder="Todas as obras" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a22] border-white/10">
              <SelectItem value="" className="text-white">Todas as obras</SelectItem>
              {store.obras.map(obra => (
                <SelectItem key={obra.id} value={obra.id} className="text-white">
                  {obra.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/50 text-sm">Total</p>
            <p className={`text-xl font-bold ${isEntrada ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(total)}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  if (isEntrada) {
                    setEditingEntrada(null);
                    setFormEntrada({ data: new Date().toISOString().split('T')[0] });
                  } else {
                    setEditingSaida(null);
                    setFormSaida({ data: new Date().toISOString().split('T')[0] });
                  }
                }}
                className={`${isEntrada ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a22] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {isEntrada 
                    ? (editingEntrada ? 'Editar Entrada' : 'Nova Entrada')
                    : (editingSaida ? 'Editar Saída' : 'Nova Saída')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Data *</Label>
                    <Input
                      type="date"
                      value={isEntrada ? formEntrada.data || '' : formSaida.data || ''}
                      onChange={(e) => {
                        if (isEntrada) {
                          setFormEntrada({ ...formEntrada, data: e.target.value });
                        } else {
                          setFormSaida({ ...formSaida, data: e.target.value });
                        }
                      }}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Valor (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={isEntrada ? formEntrada.valor || '' : formSaida.valor || ''}
                      onChange={(e) => {
                        if (isEntrada) {
                          setFormEntrada({ ...formEntrada, valor: parseFloat(e.target.value) });
                        } else {
                          setFormSaida({ ...formSaida, valor: parseFloat(e.target.value) });
                        }
                      }}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Tipo *</Label>
                    <Select
                      value={isEntrada ? formEntrada.tipo : formSaida.tipo}
                      onValueChange={(value) => {
                        if (isEntrada) {
                          setFormEntrada({ ...formEntrada, tipo: value as TipoEntrada });
                        } else {
                          setFormSaida({ ...formSaida, tipo: value as TipoSaida });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a22] border-white/10">
                        {(isEntrada ? tiposEntrada : tiposSaida).map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-white">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Obra *</Label>
                    <Select
                      value={isEntrada ? formEntrada.obraId : formSaida.obraId}
                      onValueChange={(value) => {
                        if (isEntrada) {
                          setFormEntrada({ ...formEntrada, obraId: value });
                        } else {
                          setFormSaida({ ...formSaida, obraId: value });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
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

                {isEntrada ? (
                  <div className="space-y-2">
                    <Label className="text-white/70">Cliente *</Label>
                    <Select
                      value={formEntrada.clienteId}
                      onValueChange={(value) => setFormEntrada({ ...formEntrada, clienteId: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
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
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-white/70">Beneficiário</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={formSaida.funcionarioId || ''}
                          onValueChange={(value) => setFormSaida({ 
                            ...formSaida, 
                            funcionarioId: value || undefined,
                            fornecedorId: undefined,
                            prestadorNome: undefined
                          })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Funcionário" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a22] border-white/10">
                            {store.funcionarios.filter(f => f.ativo).map(func => (
                              <SelectItem key={func.id} value={func.id} className="text-white">
                                {func.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={formSaida.fornecedorId || ''}
                          onValueChange={(value) => setFormSaida({ 
                            ...formSaida, 
                            fornecedorId: value || undefined,
                            funcionarioId: undefined,
                            prestadorNome: undefined
                          })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Fornecedor" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a22] border-white/10">
                            {store.fornecedores.map(forn => (
                              <SelectItem key={forn.id} value={forn.id} className="text-white">
                                {forn.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Prestador de Serviço"
                          value={formSaida.prestadorNome || ''}
                          onChange={(e) => setFormSaida({ 
                            ...formSaida, 
                            prestadorNome: e.target.value || undefined,
                            funcionarioId: undefined,
                            fornecedorId: undefined
                          })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/70">Categoria *</Label>
                      <Input
                        value={formSaida.categoria || ''}
                        onChange={(e) => setFormSaida({ ...formSaida, categoria: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Ex: Mão de Obra, Material, etc."
                        required
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Forma de Pagamento *</Label>
                    <Select
                      value={isEntrada ? formEntrada.formaPagamento : formSaida.formaPagamento}
                      onValueChange={(value) => {
                        if (isEntrada) {
                          setFormEntrada({ ...formEntrada, formaPagamento: value as FormaPagamento });
                        } else {
                          setFormSaida({ ...formSaida, formaPagamento: value as FormaPagamento });
                        }
                      }}
                    >
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
                    <Label className="text-white/70">Classificação *</Label>
                    <Select
                      value={isEntrada ? formEntrada.classificacao : formSaida.classificacao}
                      onValueChange={(value) => {
                        if (isEntrada) {
                          setFormEntrada({ ...formEntrada, classificacao: value as any });
                        } else {
                          setFormSaida({ ...formSaida, classificacao: value as any });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a22] border-white/10">
                        {(isEntrada ? classificacoesEntrada : classificacoesSaida).map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-white">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Descrição *</Label>
                  <Input
                    value={isEntrada ? formEntrada.descricao || '' : formSaida.descricao || ''}
                    onChange={(e) => {
                      if (isEntrada) {
                        setFormEntrada({ ...formEntrada, descricao: e.target.value });
                      } else {
                        setFormSaida({ ...formSaida, descricao: e.target.value });
                      }
                    }}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Observação</Label>
                  <Input
                    value={isEntrada ? formEntrada.observacao || '' : formSaida.observacao || ''}
                    onChange={(e) => {
                      if (isEntrada) {
                        setFormEntrada({ ...formEntrada, observacao: e.target.value });
                      } else {
                        setFormSaida({ ...formSaida, observacao: e.target.value });
                      }
                    }}
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
                  <Button 
                    type="submit" 
                    className={isEntrada ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {isEntrada 
                      ? (editingEntrada ? 'Salvar' : 'Criar')
                      : (editingSaida ? 'Salvar' : 'Criar')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabela */}
      <Card className="bg-[#15151c] border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Data</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Descrição</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Obra</th>
                  <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Tipo</th>
                  <th className="text-right py-3 px-4 text-white/50 text-sm font-medium">Valor</th>
                  <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white text-sm">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white text-sm">
                        {'descricao' in item ? item.descricao : '-'}
                      </div>
                      {item.observacao && (
                        <div className="text-white/40 text-xs">{item.observacao}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white/60 text-sm">
                      {store.getObraById(item.obraId)?.nome || 'Obra não encontrada'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-white/60 text-sm">
                        <Icon className={`h-4 w-4 ${isEntrada ? 'text-emerald-400' : 'text-red-400'}`} />
                        <span className="capitalize">{item.tipo.replace(/_/g, ' ')}</span>
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${isEntrada ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(item.valor)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Icon className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhum lançamento encontrado</p>
        </div>
      )}
    </div>
  );
}
