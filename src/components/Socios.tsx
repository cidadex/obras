import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  UserCog,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Wallet,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
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
import type { Socio, MovimentacaoSocio } from '@/types';

interface SociosProps {
  store: StoreType;
}

const tiposMovimentacao = [
  { value: 'aporte', label: 'Aporte de Capital', color: 'emerald' },
  { value: 'retirada', label: 'Retirada de Lucro', color: 'red' },
  { value: 'emprestimo', label: 'Empréstimo', color: 'amber' },
  { value: 'pagamento_emprestimo', label: 'Pagamento de Empréstimo', color: 'blue' },
];

export function Socios({ store }: SociosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovDialogOpen, setIsMovDialogOpen] = useState(false);
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);
  const [formData, setFormData] = useState<Partial<Socio>>({});
  const [movFormData, setMovFormData] = useState<Partial<MovimentacaoSocio>>({
    data: new Date().toISOString().split('T')[0],
  });

  const filteredSocios = store.socios.filter(
    (socio) =>
      socio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSocio) {
      store.updateSocio(editingSocio.id, formData);
    } else {
      store.addSocio({ ...formData, ativo: true, dataEntrada: new Date().toISOString().split('T')[0] } as Omit<Socio, 'id'>);
    }
    
    setIsDialogOpen(false);
    setEditingSocio(null);
    setFormData({});
  };

  const handleMovSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSocio) {
      store.addMovimentacaoSocio({
        ...movFormData as Omit<MovimentacaoSocio, 'id'>,
        socioId: selectedSocio.id,
      });
    }
    
    setIsMovDialogOpen(false);
    setSelectedSocio(null);
    setMovFormData({ data: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (socio: Socio) => {
    setEditingSocio(socio);
    setFormData(socio);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este sócio?')) {
      store.deleteSocio(id);
    }
  };

  const handleNew = () => {
    setEditingSocio(null);
    setFormData({ percentualParticipacao: 0 });
    setIsDialogOpen(true);
  };

  const handleNewMovimentacao = (socio: Socio) => {
    setSelectedSocio(socio);
    setMovFormData({ data: new Date().toISOString().split('T')[0] });
    setIsMovDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMovimentacoesSocio = (socioId: string) => {
    return store.movimentacoesSocios.filter(m => m.socioId === socioId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Buscar sócios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Sócio
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a22] border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingSocio ? 'Editar Sócio' : 'Novo Sócio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70">Nome *</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">CPF *</Label>
                  <Input
                    value={formData.cpf || ''}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">% Participação *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.percentualParticipacao || ''}
                    onChange={(e) => setFormData({ ...formData, percentualParticipacao: parseFloat(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Telefone</Label>
                  <Input
                    value={formData.telefone || ''}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
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
                  {editingSocio ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Sócios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSocios.map((socio) => {
          const resumo = store.getResumoSocio(socio.id);
          const movimentacoes = getMovimentacoesSocio(socio.id);
          
          return (
            <Card key={socio.id} className="bg-[#15151c] border-white/5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                      <UserCog className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{socio.nome}</CardTitle>
                      <p className="text-white/50 text-sm">{socio.percentualParticipacao}% de participação</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5"
                      onClick={() => handleEdit(socio)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(socio.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10">
                    <p className="text-emerald-400 text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Aportes
                    </p>
                    <p className="text-white font-medium">{formatCurrency(resumo?.totalAportes || 0)}</p>
                  </div>
                  <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" /> Retiradas
                    </p>
                    <p className="text-white font-medium">{formatCurrency(resumo?.totalRetiradas || 0)}</p>
                  </div>
                  <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                    <p className="text-amber-400 text-xs flex items-center gap-1">
                      <ArrowRightLeft className="h-3 w-3" /> Empréstimos
                    </p>
                    <p className="text-white font-medium">{formatCurrency(resumo?.totalEmprestimos || 0)}</p>
                  </div>
                  <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
                    <p className="text-blue-400 text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Pagamentos
                    </p>
                    <p className="text-white font-medium">{formatCurrency(resumo?.totalPagamentosEmprestimo || 0)}</p>
                  </div>
                </div>

                {/* Saldo */}
                <div className={`p-4 rounded-xl ${(resumo?.saldo || 0) >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className={`h-5 w-5 ${(resumo?.saldo || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                      <span className="text-white/70">Saldo</span>
                    </div>
                    <span className={`text-xl font-bold ${(resumo?.saldo || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(resumo?.saldo || 0)}
                    </span>
                  </div>
                </div>

                {/* Botão de Movimentação */}
                <Button 
                  onClick={() => handleNewMovimentacao(socio)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Movimentação
                </Button>

                {/* Histórico de Movimentações */}
                {movimentacoes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-white/50 text-sm mb-2">Últimas movimentações</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {movimentacoes.slice(-5).reverse().map((mov) => {
                        const tipoInfo = tiposMovimentacao.find(t => t.value === mov.tipo);
                        return (
                          <div key={mov.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                            <div>
                              <p className="text-white text-sm">{tipoInfo?.label}</p>
                              <p className="text-white/40 text-xs">{new Date(mov.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <span className={`font-medium ${
                              mov.tipo === 'aporte' || mov.tipo === 'pagamento_emprestimo' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {mov.tipo === 'aporte' || mov.tipo === 'pagamento_emprestimo' ? '+' : '-'}
                              {formatCurrency(mov.valor)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSocios.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">Nenhum sócio encontrado</p>
        </div>
      )}

      {/* Dialog de Movimentação */}
      <Dialog open={isMovDialogOpen} onOpenChange={setIsMovDialogOpen}>
        <DialogContent className="bg-[#1a1a22] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              Nova Movimentação - {selectedSocio?.nome}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMovSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">Tipo *</Label>
              <Select
                value={movFormData.tipo}
                onValueChange={(value) => setMovFormData({ ...movFormData, tipo: value as any })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  {tiposMovimentacao.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value} className="text-white">
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Data *</Label>
                <Input
                  type="date"
                  value={movFormData.data || ''}
                  onChange={(e) => setMovFormData({ ...movFormData, data: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={movFormData.valor || ''}
                  onChange={(e) => setMovFormData({ ...movFormData, valor: parseFloat(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Forma de Pagamento *</Label>
              <Select
                value={movFormData.formaPagamento}
                onValueChange={(value) => setMovFormData({ ...movFormData, formaPagamento: value as any })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a22] border-white/10">
                  <SelectItem value="pix" className="text-white">PIX</SelectItem>
                  <SelectItem value="transferencia" className="text-white">Transferência</SelectItem>
                  <SelectItem value="dinheiro" className="text-white">Dinheiro</SelectItem>
                  <SelectItem value="cheque" className="text-white">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Descrição</Label>
              <Input
                value={movFormData.descricao || ''}
                onChange={(e) => setMovFormData({ ...movFormData, descricao: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Observações sobre a movimentação..."
              />
            </div>
            
            {/* Alerta importante */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400 text-xs">
                <strong>Atenção:</strong> Retiradas de sócio não afetam o lucro da obra. 
                Aportes não entram como receita de obra.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMovDialogOpen(false)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Registrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
