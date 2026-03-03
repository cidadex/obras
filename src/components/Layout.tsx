import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  Truck,
  Wallet,
  Receipt,
  Calculator,
  Menu,
  X,
  ChevronRight,
  HardHat,
  TrendingUp,
  FileBarChart,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType, params?: any) => void;
  obraSelecionada?: string | null;
}

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'obras', label: 'Obras', icon: Building2 },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'funcionarios', label: 'Funcionários', icon: HardHat },
  { id: 'socios', label: 'Sócios', icon: UserCog },
  { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
  { id: 'entradas', label: 'Entradas', icon: TrendingUp },
  { id: 'saidas', label: 'Saídas', icon: Wallet },
  { id: 'rateio', label: 'Rateio', icon: Calculator },
  { id: 'conciliacao', label: 'Conciliação', icon: FileBarChart },
  { id: 'relatorios', label: 'Relatórios', icon: FileBarChart },
  { id: 'recibos', label: 'Recibos', icon: Receipt },
  { id: 'composicoes', label: 'Composições', icon: Calculator },
  { id: 'orcamentos', label: 'Orçamentos', icon: FileBarChart },
  { id: 'reajustes', label: 'Reajustes', icon: TrendingUp },
];

export function Layout({ children, currentView, onViewChange, obraSelecionada }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getPageTitle = () => {
    const item = menuItems.find(item => item.id === currentView);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex font-sans">
      {/* Sidebar - Sem scroll, fixa */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-[#0f0f16] border-r border-white/5 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 flex-shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm tracking-wide">CONSTRUTORA</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white hover:bg-white/5 h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Menu - Sem scroll, todos os itens visíveis */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 text-emerald-400 border border-emerald-500/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                  !sidebarOpen && 'justify-center px-2'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-emerald-400" : "text-white/50 group-hover:text-white"
                )} />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 text-emerald-400" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer do menu */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all',
              !sidebarOpen && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Header Moderno */}
        <header className="h-16 bg-[#0f0f16]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">
              {getPageTitle()}
            </h1>
            {obraSelecionada && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                Obra: {obraSelecionada}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar..."
                className="w-64 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
              />
            </div>
            
            {/* Notificações */}
            <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/5">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            </Button>
            
            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-medium">
                AD
              </div>
              {sidebarOpen && (
                <div className="hidden lg:block">
                  <p className="text-sm text-white font-medium">Admin</p>
                  <p className="text-xs text-white/50">Gerente</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export type { ViewType };
