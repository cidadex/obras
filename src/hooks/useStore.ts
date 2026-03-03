import { useState, useCallback, useEffect } from 'react';
import type {
  Obra,
  Cliente,
  Funcionario,
  Socio,
  MovimentacaoSocio,
  Fornecedor,
  LancamentoEntrada,
  LancamentoSaida,
  Recibo,
  ComposicaoServico,
  Orcamento,
  ExtratoBancario,
  HistoricoReajuste,
  ResumoObra,
  ResumoSocio,
  DashboardData,
  FiltroRelatorio,
} from '@/types';

// Dados iniciais de exemplo (usados apenas na primeira vez)
const obrasIniciais: Obra[] = [
  {
    id: '1',
    nome: 'Residencial Villa Verde',
    endereco: 'Rua das Flores, 123 - São Paulo',
    clienteId: '1',
    dataInicio: '2024-01-15',
    dataPrevisaoTermino: '2024-12-15',
    status: 'em_andamento',
    valorContrato: 2500000,
    orcamentoPrevisto: 2000000,
    responsavel: 'Carlos Silva',
    descricao: 'Condomínio residencial com 20 unidades',
    percentualConclusao: 65,
  },
  {
    id: '2',
    nome: 'Comercial Plaza Center',
    endereco: 'Av. Paulista, 1000 - São Paulo',
    clienteId: '2',
    dataInicio: '2024-03-01',
    dataPrevisaoTermino: '2025-06-30',
    status: 'em_andamento',
    valorContrato: 4500000,
    orcamentoPrevisto: 3800000,
    responsavel: 'Ana Paula',
    descricao: 'Centro comercial com 15 lojas',
    percentualConclusao: 40,
  },
  {
    id: '3',
    nome: 'Reforma Escola Municipal',
    endereco: 'Rua da Educação, 50 - Campinas',
    clienteId: '3',
    dataInicio: '2024-06-01',
    dataPrevisaoTermino: '2024-11-30',
    status: 'em_andamento',
    valorContrato: 800000,
    orcamentoPrevisto: 650000,
    responsavel: 'Pedro Henrique',
    descricao: 'Reforma completa de escola municipal',
    percentualConclusao: 80,
  },
];

const clientesIniciais: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpfCnpj: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'joao@email.com',
    endereco: 'Rua do Cliente, 100',
  },
  {
    id: '2',
    nome: 'Maria Empreendimentos LTDA',
    cpfCnpj: '12.345.678/0001-90',
    telefone: '(11) 97654-3210',
    email: 'maria@empresa.com',
    endereco: 'Av. Empresarial, 500',
  },
  {
    id: '3',
    nome: 'Prefeitura Municipal de Campinas',
    cpfCnpj: '46.214.351/0001-99',
    telefone: '(19) 3234-5678',
    email: 'obras@campinas.sp.gov.br',
    endereco: 'Praça das Bandeiras, 1',
  },
];

const funcionariosIniciais: Funcionario[] = [
  {
    id: '1',
    nome: 'Pedro Almeida',
    cpf: '111.222.333-44',
    cargo: 'Pedreiro',
    telefone: '(11) 91111-2222',
    email: 'pedro@email.com',
    dataAdmissao: '2023-05-10',
    valorDiaria: 350,
    valorHora: 43.75,
    ativo: true,
    obraId: '1',
  },
  {
    id: '2',
    nome: 'José Santos',
    cpf: '222.333.444-55',
    cargo: 'Servente',
    telefone: '(11) 92222-3333',
    email: 'jose@email.com',
    dataAdmissao: '2023-08-15',
    valorDiaria: 200,
    valorHora: 25,
    ativo: true,
    obraId: '1',
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    cpf: '333.444.555-66',
    cargo: 'Encarregado',
    telefone: '(11) 93333-4444',
    email: 'carlos@email.com',
    dataAdmissao: '2022-03-20',
    valorDiaria: 450,
    valorHora: 56.25,
    ativo: true,
    obraId: '2',
  },
];

const sociosIniciais: Socio[] = [
  {
    id: '1',
    nome: 'Roberto Mendes',
    cpf: '444.555.666-77',
    telefone: '(11) 94444-5555',
    email: 'roberto@construtora.com',
    percentualParticipacao: 60,
    dataEntrada: '2020-01-01',
    ativo: true,
  },
  {
    id: '2',
    nome: 'Fernanda Lima',
    cpf: '555.666.777-88',
    telefone: '(11) 95555-6666',
    email: 'fernanda@construtora.com',
    percentualParticipacao: 40,
    dataEntrada: '2020-01-01',
    ativo: true,
  },
];

const fornecedoresIniciais: Fornecedor[] = [
  {
    id: '1',
    nome: 'Cimento Forte LTDA',
    cpfCnpj: '11.222.333/0001-44',
    telefone: '(11) 4444-5555',
    email: 'vendas@cimentoforte.com',
    endereco: 'Rod. Industrial, km 10',
    categoria: 'Material de Construção',
  },
  {
    id: '2',
    nome: 'Aço Brasil S.A.',
    cpfCnpj: '22.333.444/0001-55',
    telefone: '(11) 5555-6666',
    email: 'contato@acobrasil.com',
    endereco: 'Av. do Aço, 2000',
    categoria: 'Material de Construção',
  },
  {
    id: '3',
    nome: 'Elétrica Total',
    cpfCnpj: '33.444.555/0001-66',
    telefone: '(11) 6666-7777',
    email: 'eletrica@total.com',
    endereco: 'Rua dos Eletricistas, 300',
    categoria: 'Instalações Elétricas',
  },
];

const composicoesIniciais: ComposicaoServico[] = [
  {
    id: '1',
    codigo: 'CONT-001',
    nome: 'Contrapiso até 3cm',
    unidade: 'm²',
    valorUnitario: 50,
    custoMaterial: 30,
    custoMaoObra: 15,
    margem: 0.1,
    descricao: 'Contrapiso de regularização',
    ativo: true,
    categoria: 'Acabamento',
  },
  {
    id: '2',
    codigo: 'PINT-001',
    nome: 'Pintura Látex Padrão',
    unidade: 'm²',
    valorUnitario: 35,
    custoMaterial: 18,
    custoMaoObra: 12,
    margem: 0.1,
    descricao: 'Pintura com tinta látex',
    ativo: true,
    categoria: 'Pintura',
  },
  {
    id: '3',
    codigo: 'PORC-001',
    nome: 'Assentamento Porcelanato',
    unidade: 'm²',
    valorUnitario: 120,
    custoMaterial: 70,
    custoMaoObra: 40,
    margem: 0.08,
    descricao: 'Assentamento de porcelanato',
    ativo: true,
    categoria: 'Acabamento',
  },
  {
    id: '4',
    codigo: 'REBO-001',
    nome: 'Reboco Interno',
    unidade: 'm²',
    valorUnitario: 45,
    custoMaterial: 22,
    custoMaoObra: 18,
    margem: 0.1,
    descricao: 'Reboco interno em paredes',
    ativo: true,
    categoria: 'Alvenaria',
  },
];

// Helper para localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Erro ao salvar ${key}:`, error);
  }
};

export function useStore() {
  // Estados com persistência
  const [obras, setObras] = useState<Obra[]>(() => 
    loadFromStorage('obras', obrasIniciais)
  );
  const [clientes, setClientes] = useState<Cliente[]>(() => 
    loadFromStorage('clientes', clientesIniciais)
  );
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => 
    loadFromStorage('funcionarios', funcionariosIniciais)
  );
  const [socios, setSocios] = useState<Socio[]>(() => 
    loadFromStorage('socios', sociosIniciais)
  );
  const [movimentacoesSocios, setMovimentacoesSocios] = useState<MovimentacaoSocio[]>(() => 
    loadFromStorage('movimentacoesSocios', [])
  );
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => 
    loadFromStorage('fornecedores', fornecedoresIniciais)
  );
  const [lancamentosEntrada, setLancamentosEntrada] = useState<LancamentoEntrada[]>(() => 
    loadFromStorage('lancamentosEntrada', [])
  );
  const [lancamentosSaida, setLancamentosSaida] = useState<LancamentoSaida[]>(() => 
    loadFromStorage('lancamentosSaida', [])
  );
  const [recibos, setRecibos] = useState<Recibo[]>(() => 
    loadFromStorage('recibos', [])
  );
  const [composicoes, setComposicoes] = useState<ComposicaoServico[]>(() => 
    loadFromStorage('composicoes', composicoesIniciais)
  );
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => 
    loadFromStorage('orcamentos', [])
  );
  const [extratoBancario, setExtratoBancario] = useState<ExtratoBancario[]>(() => 
    loadFromStorage('extratoBancario', [])
  );
  const [historicoReajustes, setHistoricoReajustes] = useState<HistoricoReajuste[]>(() => 
    loadFromStorage('historicoReajustes', [])
  );
  const [nextReciboNumero, setNextReciboNumero] = useState<number>(() => 
    loadFromStorage('nextReciboNumero', 1)
  );
  const [nextOrcamentoNumero, setNextOrcamentoNumero] = useState<number>(() => 
    loadFromStorage('nextOrcamentoNumero', 1)
  );

  // Persistir automaticamente quando os dados mudam
  useEffect(() => saveToStorage('obras', obras), [obras]);
  useEffect(() => saveToStorage('clientes', clientes), [clientes]);
  useEffect(() => saveToStorage('funcionarios', funcionarios), [funcionarios]);
  useEffect(() => saveToStorage('socios', socios), [socios]);
  useEffect(() => saveToStorage('movimentacoesSocios', movimentacoesSocios), [movimentacoesSocios]);
  useEffect(() => saveToStorage('fornecedores', fornecedores), [fornecedores]);
  useEffect(() => saveToStorage('lancamentosEntrada', lancamentosEntrada), [lancamentosEntrada]);
  useEffect(() => saveToStorage('lancamentosSaida', lancamentosSaida), [lancamentosSaida]);
  useEffect(() => saveToStorage('recibos', recibos), [recibos]);
  useEffect(() => saveToStorage('composicoes', composicoes), [composicoes]);
  useEffect(() => saveToStorage('orcamentos', orcamentos), [orcamentos]);
  useEffect(() => saveToStorage('extratoBancario', extratoBancario), [extratoBancario]);
  useEffect(() => saveToStorage('historicoReajustes', historicoReajustes), [historicoReajustes]);
  useEffect(() => saveToStorage('nextReciboNumero', nextReciboNumero), [nextReciboNumero]);
  useEffect(() => saveToStorage('nextOrcamentoNumero', nextOrcamentoNumero), [nextOrcamentoNumero]);

  // Helpers
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const now = () => new Date().toISOString();

  // Obras
  const addObra = useCallback((obra: Omit<Obra, 'id'>) => {
    const newObra = { ...obra, id: generateId() };
    setObras(prev => [...prev, newObra]);
    return newObra;
  }, []);

  const updateObra = useCallback((id: string, obra: Partial<Obra>) => {
    setObras(prev => prev.map(o => o.id === id ? { ...o, ...obra } : o));
  }, []);

  const deleteObra = useCallback((id: string) => {
    setObras(prev => prev.filter(o => o.id !== id));
  }, []);

  const getObraById = useCallback((id: string) => {
    return obras.find(o => o.id === id);
  }, [obras]);

  const getClienteById = useCallback((id: string) => {
    return clientes.find(c => c.id === id);
  }, [clientes]);

  // Clientes
  const addCliente = useCallback((cliente: Omit<Cliente, 'id'>) => {
    const newCliente = { ...cliente, id: generateId() };
    setClientes(prev => [...prev, newCliente]);
    return newCliente;
  }, []);

  const updateCliente = useCallback((id: string, cliente: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...cliente } : c));
  }, []);

  const deleteCliente = useCallback((id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  }, []);

  // Funcionários
  const addFuncionario = useCallback((funcionario: Omit<Funcionario, 'id'>) => {
    const newFuncionario = { ...funcionario, id: generateId() };
    setFuncionarios(prev => [...prev, newFuncionario]);
    return newFuncionario;
  }, []);

  const updateFuncionario = useCallback((id: string, funcionario: Partial<Funcionario>) => {
    setFuncionarios(prev => prev.map(f => f.id === id ? { ...f, ...funcionario } : f));
  }, []);

  const deleteFuncionario = useCallback((id: string) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
  }, []);

  const getFuncionariosPorObra = useCallback((obraId: string) => {
    return funcionarios.filter(f => f.obraId === obraId && f.ativo);
  }, [funcionarios]);

  // Sócios
  const addSocio = useCallback((socio: Omit<Socio, 'id'>) => {
    const newSocio = { ...socio, id: generateId() };
    setSocios(prev => [...prev, newSocio]);
    return newSocio;
  }, []);

  const updateSocio = useCallback((id: string, socio: Partial<Socio>) => {
    setSocios(prev => prev.map(s => s.id === id ? { ...s, ...socio } : s));
  }, []);

  const deleteSocio = useCallback((id: string) => {
    setSocios(prev => prev.filter(s => s.id !== id));
  }, []);

  // Movimentações de Sócios
  const addMovimentacaoSocio = useCallback((mov: Omit<MovimentacaoSocio, 'id'>) => {
    const newMov = { ...mov, id: generateId() };
    setMovimentacoesSocios(prev => [...prev, newMov]);
    return newMov;
  }, []);

  const deleteMovimentacaoSocio = useCallback((id: string) => {
    setMovimentacoesSocios(prev => prev.filter(m => m.id !== id));
  }, []);

  const getMovimentacoesPorSocio = useCallback((socioId: string) => {
    return movimentacoesSocios.filter(m => m.socioId === socioId);
  }, [movimentacoesSocios]);

  // Fornecedores
  const addFornecedor = useCallback((fornecedor: Omit<Fornecedor, 'id'>) => {
    const newFornecedor = { ...fornecedor, id: generateId() };
    setFornecedores(prev => [...prev, newFornecedor]);
    return newFornecedor;
  }, []);

  const updateFornecedor = useCallback((id: string, fornecedor: Partial<Fornecedor>) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ...fornecedor } : f));
  }, []);

  const deleteFornecedor = useCallback((id: string) => {
    setFornecedores(prev => prev.filter(f => f.id !== id));
  }, []);

  // Lançamentos de Entrada
  const addLancamentoEntrada = useCallback((lancamento: Omit<LancamentoEntrada, 'id' | 'criadoEm'>) => {
    const newLancamento = { 
      ...lancamento, 
      id: generateId(),
      criadoEm: now(),
    };
    setLancamentosEntrada(prev => [...prev, newLancamento]);
    return newLancamento;
  }, []);

  const updateLancamentoEntrada = useCallback((id: string, lancamento: Partial<LancamentoEntrada>) => {
    setLancamentosEntrada(prev => prev.map(l => l.id === id ? { ...l, ...lancamento } : l));
  }, []);

  const deleteLancamentoEntrada = useCallback((id: string) => {
    setLancamentosEntrada(prev => prev.filter(l => l.id !== id));
  }, []);

  // Lançamentos de Saída
  const addLancamentoSaida = useCallback((lancamento: Omit<LancamentoSaida, 'id' | 'criadoEm'>) => {
    const newLancamento = { 
      ...lancamento, 
      id: generateId(),
      criadoEm: now(),
    };
    setLancamentosSaida(prev => [...prev, newLancamento]);
    return newLancamento;
  }, []);

  const updateLancamentoSaida = useCallback((id: string, lancamento: Partial<LancamentoSaida>) => {
    setLancamentosSaida(prev => prev.map(l => l.id === id ? { ...l, ...lancamento } : l));
  }, []);

  const deleteLancamentoSaida = useCallback((id: string) => {
    setLancamentosSaida(prev => prev.filter(l => l.id !== id));
  }, []);

  // Recibos
  const addRecibo = useCallback((recibo: Omit<Recibo, 'id' | 'numero'>) => {
    const newRecibo = { 
      ...recibo, 
      id: generateId(),
      numero: nextReciboNumero 
    };
    setRecibos(prev => [...prev, newRecibo]);
    setNextReciboNumero(prev => prev + 1);
    return newRecibo;
  }, [nextReciboNumero]);

  const deleteRecibo = useCallback((id: string) => {
    setRecibos(prev => prev.filter(r => r.id !== id));
  }, []);

  // Composições
  const addComposicao = useCallback((composicao: Omit<ComposicaoServico, 'id'>) => {
    const newComposicao = { ...composicao, id: generateId() };
    setComposicoes(prev => [...prev, newComposicao]);
    return newComposicao;
  }, []);

  const updateComposicao = useCallback((id: string, composicao: Partial<ComposicaoServico>) => {
    setComposicoes(prev => prev.map(c => c.id === id ? { ...c, ...composicao } : c));
  }, []);

  const deleteComposicao = useCallback((id: string) => {
    setComposicoes(prev => prev.filter(c => c.id !== id));
  }, []);

  const aplicarReajuste = useCallback((percentual: number, aplicadoPor: string) => {
    const composicoesAtualizadas: string[] = [];
    
    setComposicoes(prev => prev.map(c => {
      if (c.ativo) {
        composicoesAtualizadas.push(c.id);
        return {
          ...c,
          valorUnitario: c.valorUnitario * (1 + percentual / 100),
          custoMaterial: c.custoMaterial * (1 + percentual / 100),
          custoMaoObra: c.custoMaoObra * (1 + percentual / 100),
        };
      }
      return c;
    }));

    const novoHistorico: HistoricoReajuste = {
      id: generateId(),
      data: now().split('T')[0],
      percentual,
      composicoesAtualizadas,
      aplicadoPor,
    };

    setHistoricoReajustes(prev => [...prev, novoHistorico]);
  }, []);

  // Orçamentos
  const addOrcamento = useCallback((orcamento: Omit<Orcamento, 'id' | 'numero'>) => {
    const newOrcamento = { 
      ...orcamento, 
      id: generateId(),
      numero: nextOrcamentoNumero 
    };
    setOrcamentos(prev => [...prev, newOrcamento]);
    setNextOrcamentoNumero(prev => prev + 1);
    return newOrcamento;
  }, [nextOrcamentoNumero]);

  const updateOrcamento = useCallback((id: string, orcamento: Partial<Orcamento>) => {
    setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, ...orcamento } : o));
  }, []);

  const deleteOrcamento = useCallback((id: string) => {
    setOrcamentos(prev => prev.filter(o => o.id !== id));
  }, []);

  // Extrato Bancário
  const addExtratoItem = useCallback((item: Omit<ExtratoBancario, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    setExtratoBancario(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const conciliarExtrato = useCallback((extratoId: string, lancamentoId: string) => {
    setExtratoBancario(prev => prev.map(e => 
      e.id === extratoId ? { ...e, conciliado: true, lancamentoId } : e
    ));
  }, []);

  // Relatórios - Centro de Custo por Obra
  const getResumoObra = useCallback((obraId: string): ResumoObra | null => {
    const obra = obras.find(o => o.id === obraId);
    if (!obra) return null;

    // Todas as entradas e saídas da obra (sem filtro de classificação)
    const entradas = lancamentosEntrada.filter(l => l.obraId === obraId);
    const saidas = lancamentosSaida.filter(l => l.obraId === obraId);

    const totalEntradas = entradas.reduce((sum, l) => sum + l.valor, 0);
    const totalSaidas = saidas.reduce((sum, l) => sum + l.valor, 0);
    const resultado = totalEntradas - totalSaidas;
    const margemPercentual = totalEntradas > 0 ? (resultado / totalEntradas) * 100 : 0;

    // Custo por funcionário
    const custoPorFuncionarioMap = new Map<string, { nome: string; total: number }>();
    saidas.forEach(s => {
      if (s.funcionarioId) {
        const func = funcionarios.find(f => f.id === s.funcionarioId);
        if (func) {
          const atual = custoPorFuncionarioMap.get(s.funcionarioId);
          if (atual) {
            atual.total += s.valor;
          } else {
            custoPorFuncionarioMap.set(s.funcionarioId, { nome: func.nome, total: s.valor });
          }
        }
      }
    });

    // Custo por categoria
    const custoPorCategoriaMap = new Map<string, number>();
    saidas.forEach(s => {
      const atual = custoPorCategoriaMap.get(s.categoria) || 0;
      custoPorCategoriaMap.set(s.categoria, atual + s.valor);
    });

    // Histórico de movimentações (entradas e saídas ordenadas por data)
    const historicoMovimentacoes = [
      ...entradas.map(e => ({ ...e, tipo: 'entrada' as const })),
      ...saidas.map(s => ({ ...s, tipo: 'saida' as const })),
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return {
      obra,
      totalEntradas,
      totalSaidas,
      resultado,
      margemPercentual,
      custoPorFuncionario: Array.from(custoPorFuncionarioMap.entries()).map(([id, data]) => ({
        funcionarioId: id,
        nome: data.nome,
        total: data.total,
      })),
      custoPorCategoria: Array.from(custoPorCategoriaMap.entries()).map(([categoria, total]) => ({
        categoria,
        total,
      })),
      historicoMovimentacoes,
    };
  }, [obras, lancamentosEntrada, lancamentosSaida, funcionarios]);

  // Resumo de Sócios
  const getResumoSocio = useCallback((socioId: string): ResumoSocio | null => {
    const socio = socios.find(s => s.id === socioId);
    if (!socio) return null;

    const movs = movimentacoesSocios.filter(m => m.socioId === socioId);
    
    const totalAportes = movs
      .filter(m => m.tipo === 'aporte')
      .reduce((sum, m) => sum + m.valor, 0);
    
    const totalRetiradas = movs
      .filter(m => m.tipo === 'retirada')
      .reduce((sum, m) => sum + m.valor, 0);
    
    const totalEmprestimos = movs
      .filter(m => m.tipo === 'emprestimo')
      .reduce((sum, m) => sum + m.valor, 0);
    
    const totalPagamentosEmprestimo = movs
      .filter(m => m.tipo === 'pagamento_emprestimo')
      .reduce((sum, m) => sum + m.valor, 0);

    const saldo = totalAportes + totalPagamentosEmprestimo - totalRetiradas - totalEmprestimos;

    return {
      socio,
      totalAportes,
      totalRetiradas,
      totalEmprestimos,
      totalPagamentosEmprestimo,
      saldo,
    };
  }, [socios, movimentacoesSocios]);

  // Dashboard
  const getDashboardData = useCallback((): DashboardData => {
    const obrasAtivas = obras.filter(o => o.status === 'em_andamento').length;
    
    const totalReceitas = lancamentosEntrada
      .filter(l => l.classificacao === 'receita_obra')
      .reduce((sum, l) => sum + l.valor, 0);

    const totalCustos = lancamentosSaida
      .filter(l => l.classificacao === 'custo_obra')
      .reduce((sum, l) => sum + l.valor, 0);

    const lucroTotal = totalReceitas - totalCustos;
    
    const saldoCaixa = lancamentosEntrada.reduce((sum, l) => sum + l.valor, 0) -
                      lancamentosSaida.reduce((sum, l) => sum + l.valor, 0);

    const aportesSocios = movimentacoesSocios
      .filter(m => m.tipo === 'aporte')
      .reduce((sum, m) => sum + m.valor, 0);

    const retiradasSocios = movimentacoesSocios
      .filter(m => m.tipo === 'retirada')
      .reduce((sum, m) => sum + m.valor, 0);

    const resumoObras = obras.map(obra => getResumoObra(obra.id)).filter(Boolean) as ResumoObra[];
    const resumoSocios = socios.map(socio => getResumoSocio(socio.id)).filter(Boolean) as ResumoSocio[];

    return {
      obrasAtivas,
      totalObras: obras.length,
      totalReceitas,
      totalCustos,
      lucroTotal,
      saldoCaixa,
      aportesSocios,
      retiradasSocios,
      obras: resumoObras,
      socios: resumoSocios,
    };
  }, [obras, lancamentosEntrada, lancamentosSaida, movimentacoesSocios, socios, getResumoObra, getResumoSocio]);

  // Filtrar lançamentos
  const filtrarLancamentos = useCallback((filtro: FiltroRelatorio) => {
    let entradas = [...lancamentosEntrada];
    let saidas = [...lancamentosSaida];

    if (filtro.obraId) {
      entradas = entradas.filter(l => l.obraId === filtro.obraId);
      saidas = saidas.filter(l => l.obraId === filtro.obraId);
    }

    if (filtro.dataInicio) {
      entradas = entradas.filter(l => l.data >= filtro.dataInicio!);
      saidas = saidas.filter(l => l.data >= filtro.dataInicio!);
    }

    if (filtro.dataFim) {
      entradas = entradas.filter(l => l.data <= filtro.dataFim!);
      saidas = saidas.filter(l => l.data <= filtro.dataFim!);
    }

    if (filtro.categoria) {
      saidas = saidas.filter(l => l.categoria === filtro.categoria);
    }

    if (filtro.funcionarioId) {
      saidas = saidas.filter(l => l.funcionarioId === filtro.funcionarioId);
    }

    if (filtro.fornecedorId) {
      saidas = saidas.filter(l => l.fornecedorId === filtro.fornecedorId);
    }

    if (filtro.classificacao) {
      entradas = entradas.filter(l => l.classificacao === filtro.classificacao);
      saidas = saidas.filter(l => l.classificacao === filtro.classificacao);
    }

    if (filtro.socioId) {
      // Para movimentações de sócios, filtramos separadamente
    }

    return { entradas, saidas };
  }, [lancamentosEntrada, lancamentosSaida]);

  // Limpar todos os dados
  const clearAllData = useCallback(() => {
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
      setObras([]);
      setClientes([]);
      setFuncionarios([]);
      setSocios([]);
      setMovimentacoesSocios([]);
      setFornecedores([]);
      setLancamentosEntrada([]);
      setLancamentosSaida([]);
      setRecibos([]);
      setComposicoes([]);
      setOrcamentos([]);
      setExtratoBancario([]);
      setHistoricoReajustes([]);
      setNextReciboNumero(1);
      setNextOrcamentoNumero(1);
    }
  }, []);

  // Reset para dados iniciais
  const resetToInitialData = useCallback(() => {
    if (confirm('Tem certeza que deseja restaurar os dados iniciais de exemplo?')) {
      setObras(obrasIniciais);
      setClientes(clientesIniciais);
      setFuncionarios(funcionariosIniciais);
      setSocios(sociosIniciais);
      setMovimentacoesSocios([]);
      setFornecedores(fornecedoresIniciais);
      setLancamentosEntrada([]);
      setLancamentosSaida([]);
      setRecibos([]);
      setComposicoes(composicoesIniciais);
      setOrcamentos([]);
      setExtratoBancario([]);
      setHistoricoReajustes([]);
      setNextReciboNumero(1);
      setNextOrcamentoNumero(1);
    }
  }, []);

  return {
    // Dados
    obras,
    clientes,
    funcionarios,
    socios,
    movimentacoesSocios,
    fornecedores,
    lancamentosEntrada,
    lancamentosSaida,
    recibos,
    composicoes,
    orcamentos,
    extratoBancario,
    historicoReajustes,
    
    // Ações - Obras
    addObra,
    updateObra,
    deleteObra,
    getObraById,
    getClienteById,
    
    // Ações - Clientes
    addCliente,
    updateCliente,
    deleteCliente,
    
    // Ações - Funcionários
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
    getFuncionariosPorObra,
    
    // Ações - Sócios
    addSocio,
    updateSocio,
    deleteSocio,
    addMovimentacaoSocio,
    deleteMovimentacaoSocio,
    getMovimentacoesPorSocio,
    getResumoSocio,
    
    // Ações - Fornecedores
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    
    // Ações - Lançamentos
    addLancamentoEntrada,
    updateLancamentoEntrada,
    deleteLancamentoEntrada,
    addLancamentoSaida,
    updateLancamentoSaida,
    deleteLancamentoSaida,
    
    // Ações - Recibos
    addRecibo,
    deleteRecibo,
    
    // Ações - Composições
    addComposicao,
    updateComposicao,
    deleteComposicao,
    aplicarReajuste,
    
    // Ações - Orçamentos
    addOrcamento,
    updateOrcamento,
    deleteOrcamento,
    
    // Ações - Extrato
    addExtratoItem,
    conciliarExtrato,
    
    // Relatórios
    getResumoObra,
    getDashboardData,
    filtrarLancamentos,

    // Utilitários
    clearAllData,
    resetToInitialData,
  };
}

export type StoreType = ReturnType<typeof useStore>;
