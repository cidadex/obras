import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage na montagem
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
    } catch (error) {
      console.warn(`Erro ao carregar ${key} do localStorage:`, error);
    }
    setIsLoaded(true);
  }, [key]);

  // Função para atualizar o valor (salva no localStorage)
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
    }
  }, [key]);

  // Função para limpar/remover do localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Erro ao remover ${key} do localStorage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Hook específico para o store da aplicação
export function useStorePersistence() {
  const [obras, setObras] = useLocalStorage('obras', []);
  const [clientes, setClientes] = useLocalStorage('clientes', []);
  const [funcionarios, setFuncionarios] = useLocalStorage('funcionarios', []);
  const [socios, setSocios] = useLocalStorage('socios', []);
  const [movimentacoesSocios, setMovimentacoesSocios] = useLocalStorage('movimentacoesSocios', []);
  const [fornecedores, setFornecedores] = useLocalStorage('fornecedores', []);
  const [lancamentosEntrada, setLancamentosEntrada] = useLocalStorage('lancamentosEntrada', []);
  const [lancamentosSaida, setLancamentosSaida] = useLocalStorage('lancamentosSaida', []);
  const [recibos, setRecibos] = useLocalStorage('recibos', []);
  const [composicoes, setComposicoes] = useLocalStorage('composicoes', []);
  const [orcamentos, setOrcamentos] = useLocalStorage('orcamentos', []);
  const [extratoBancario, setExtratoBancario] = useLocalStorage('extratoBancario', []);
  const [historicoReajustes, setHistoricoReajustes] = useLocalStorage('historicoReajustes', []);
  const [nextReciboNumero, setNextReciboNumero] = useLocalStorage('nextReciboNumero', 1);
  const [nextOrcamentoNumero, setNextOrcamentoNumero] = useLocalStorage('nextOrcamentoNumero', 1);

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
  }, [setObras, setClientes, setFuncionarios, setSocios, setMovimentacoesSocios, 
      setFornecedores, setLancamentosEntrada, setLancamentosSaida, setRecibos, 
      setComposicoes, setOrcamentos, setExtratoBancario, setHistoricoReajustes,
      setNextReciboNumero, setNextOrcamentoNumero]);

  return {
    obras, setObras,
    clientes, setClientes,
    funcionarios, setFuncionarios,
    socios, setSocios,
    movimentacoesSocios, setMovimentacoesSocios,
    fornecedores, setFornecedores,
    lancamentosEntrada, setLancamentosEntrada,
    lancamentosSaida, setLancamentosSaida,
    recibos, setRecibos,
    composicoes, setComposicoes,
    orcamentos, setOrcamentos,
    extratoBancario, setExtratoBancario,
    historicoReajustes, setHistoricoReajustes,
    nextReciboNumero, setNextReciboNumero,
    nextOrcamentoNumero, setNextOrcamentoNumero,
    clearAllData,
  };
}
