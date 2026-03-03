import { useState } from 'react';
import { Layout, type ViewType } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { Obras } from '@/components/Obras';
import { ObraDetalhe } from '@/components/ObraDetalhe';
import { Cadastros } from '@/components/Cadastros';
import { Socios } from '@/components/Socios';
import { Lancamentos } from '@/components/Lancamentos';
import { Rateio } from '@/components/Rateio';
import { Relatorios } from '@/components/Relatorios';
import { Recibos } from '@/components/Recibos';
import { Composicoes } from '@/components/Composicoes';
import { Orcamentos } from '@/components/Orcamentos';
import { Reajustes } from '@/components/Reajustes';
import { Conciliacao } from '@/components/Conciliacao';
import { useStore } from '@/hooks/useStore';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [obraSelecionada, setObraSelecionada] = useState<string | null>(null);
  const store = useStore();

  const handleViewChange = (view: ViewType, params?: any) => {
    if (view === 'obra-detalhe' && params) {
      setObraSelecionada(params);
    }
    setCurrentView(view);
  };

  const handleBackFromObra = () => {
    setObraSelecionada(null);
    setCurrentView('obras');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard store={store} onViewChange={handleViewChange} />;
      case 'obras':
        return <Obras store={store} onViewChange={handleViewChange} />;
      case 'obra-detalhe':
        return obraSelecionada ? (
          <ObraDetalhe 
            store={store} 
            obraId={obraSelecionada} 
            onBack={handleBackFromObra}
            onViewChange={handleViewChange}
          />
        ) : (
          <Obras store={store} onViewChange={handleViewChange} />
        );
      case 'clientes':
        return <Cadastros store={store} type="clientes" />;
      case 'funcionarios':
        return <Cadastros store={store} type="funcionarios" />;
      case 'socios':
        return <Socios store={store} />;
      case 'fornecedores':
        return <Cadastros store={store} type="fornecedores" />;
      case 'entradas':
        return <Lancamentos store={store} type="entradas" />;
      case 'saidas':
        return <Lancamentos store={store} type="saidas" />;
      case 'rateio':
        return <Rateio store={store} />;
      case 'conciliacao':
        return <Conciliacao store={store} />;
      case 'relatorios':
        return <Relatorios store={store} />;
      case 'recibos':
        return <Recibos store={store} />;
      case 'composicoes':
        return <Composicoes store={store} />;
      case 'orcamentos':
        return <Orcamentos store={store} />;
      case 'reajustes':
        return <Reajustes store={store} />;
      default:
        return <Dashboard store={store} onViewChange={handleViewChange} />;
    }
  };

  const getObraNome = () => {
    if (obraSelecionada) {
      const obra = store.getObraById(obraSelecionada);
      return obra?.nome;
    }
    return null;
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={handleViewChange}
      obraSelecionada={getObraNome()}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
