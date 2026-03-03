// Tipos do Sistema de Gestão para Construtora - V2

export interface Obra {
  id: string;
  nome: string;
  endereco: string;
  clienteId: string;
  dataInicio: string;
  dataPrevisaoTermino: string;
  status: 'em_andamento' | 'concluida' | 'pausada' | 'cancelada';
  valorContrato: number;
  descricao?: string;
  // Centro de custo
  orcamentoPrevisto: number;
  responsavel: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  telefone: string;
  email: string;
  dataAdmissao: string;
  valorDiaria: number;
  valorHora: number;
  ativo: boolean;
  // Vinculo com obra
  obraId?: string;
}

export interface Socio {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  percentualParticipacao: number;
  dataEntrada: string;
  ativo: boolean;
}

export interface MovimentacaoSocio {
  id: string;
  socioId: string;
  data: string;
  tipo: 'aporte' | 'retirada' | 'emprestimo' | 'pagamento_emprestimo';
  valor: number;
  obraId?: string; // Opcional - se vinculado a obra específica
  descricao: string;
  formaPagamento: FormaPagamento;
  comprovante?: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  categoria: string;
}

export type TipoEntrada = 'parcela_contratual' | 'aditivo' | 'medicao' | 'pagamento_avulso' | 'receita_extra';
export type TipoSaida = 'funcionario' | 'fornecedor' | 'prestador_servico' | 'despesa_administrativa' | 'imposto' | 'material';
export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'cheque';
export type ClassificacaoFinanceira = 'receita_obra' | 'custo_obra' | 'despesa_administrativa' | 'aporte_socio' | 'emprestimo_socio' | 'retirada_lucro_socio';

export interface RateioItem {
  obraId: string;
  valor: number;
  percentual?: number;
}

export interface LancamentoEntrada {
  id: string;
  data: string;
  valor: number;
  tipo: TipoEntrada;
  obraId: string;
  clienteId: string;
  descricao: string;
  formaPagamento: FormaPagamento;
  classificacao: ClassificacaoFinanceira;
  observacao?: string;
  comprovante?: string;
  criadoPor: string;
  criadoEm: string;
}

export interface LancamentoSaida {
  id: string;
  data: string;
  valor: number;
  tipo: TipoSaida;
  obraId: string;
  funcionarioId?: string;
  fornecedorId?: string;
  prestadorNome?: string;
  categoria: string;
  formaPagamento: FormaPagamento;
  classificacao: ClassificacaoFinanceira;
  descricao: string;
  observacao?: string;
  comprovante?: string;
  rateios?: RateioItem[];
  criadoPor: string;
  criadoEm: string;
}

export interface ExtratoBancario {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  conciliado: boolean;
  lancamentoId?: string;
}

export interface Recibo {
  id: string;
  numero: number;
  data: string;
  funcionarioId: string;
  obraId: string;
  valor: number;
  tipo: 'alimentacao' | 'cafe_manha' | 'passagem' | 'pagamento_avulso' | 'adiantamento';
  descricao: string;
  assinatura?: string;
  geradoPor: string;
}

export interface ComposicaoServico {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  valorUnitario: number;
  custoMaterial: number;
  custoMaoObra: number;
  margem: number;
  descricao?: string;
  ativo: boolean;
  categoria: string;
}

export interface ItemOrcamento {
  composicaoId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Orcamento {
  id: string;
  numero: number;
  data: string;
  clienteId: string;
  obraId?: string;
  obraDescricao: string;
  itens: ItemOrcamento[];
  valorTotal: number;
  bdi: number;
  desconto: number;
  valorFinal: number;
  status: 'rascunho' | 'aprovado' | 'rejeitado' | 'enviado';
  validade: number; // dias
}

export interface HistoricoReajuste {
  id: string;
  data: string;
  percentual: number;
  composicoesAtualizadas: string[];
  aplicadoPor: string;
}

export interface FiltroRelatorio {
  obraId?: string;
  dataInicio?: string;
  dataFim?: string;
  categoria?: string;
  funcionarioId?: string;
  fornecedorId?: string;
  classificacao?: ClassificacaoFinanceira;
  socioId?: string;
}

export interface ResumoObra {
  obra: Obra;
  totalEntradas: number;
  totalSaidas: number;
  resultado: number;
  margemPercentual: number;
  custoPorFuncionario: { funcionarioId: string; nome: string; total: number }[];
  custoPorCategoria: { categoria: string; total: number }[];
}

export interface ResumoSocio {
  socio: Socio;
  totalAportes: number;
  totalRetiradas: number;
  totalEmprestimos: number;
  totalPagamentosEmprestimo: number;
  saldo: number;
}

export interface DashboardData {
  obrasAtivas: number;
  totalObras: number;
  totalReceitas: number;
  totalCustos: number;
  lucroTotal: number;
  saldoCaixa: number;
  aportesSocios: number;
  retiradasSocios: number;
  obras: ResumoObra[];
  socios: ResumoSocio[];
}

// View types para navegação
type ViewType = 
  | 'dashboard'
  | 'obras'
  | 'obra-detalhe'
  | 'clientes'
  | 'funcionarios'
  | 'socios'
  | 'fornecedores'
  | 'entradas'
  | 'saidas'
  | 'rateio'
  | 'conciliacao'
  | 'relatorios'
  | 'recibos'
  | 'composicoes'
  | 'orcamentos'
  | 'reajustes';

export type { ViewType };
