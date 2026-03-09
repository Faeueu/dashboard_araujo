// src/components/Sidebar.jsx
import { useDashboard } from '../core/DashboardContext.jsx';

const ROUTES = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'ticket', label: 'Ticket Médio' },
  { id: 'margem', label: 'Margem & Mix' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'rupturas', label: 'Rupturas' },
  { id: 'metas', label: 'Metas' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { page, setPage } = useDashboard();

  const handleNav = (id) => {
    setPage(id);
    onClose();
  };

  return (
    <aside
      className={`
        w-[var(--sidebar-w)] shrink-0 bg-surface border-r border-border
        flex flex-col overflow-y-auto z-50 transition-transform duration-300
        fixed inset-y-0 left-0 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ transitionTimingFunction: 'var(--ease-out)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="font-mono text-[9.5px] tracking-[2.5px] uppercase text-text-4 font-semibold mb-1.5">
          Dashboard · V2
        </div>
        <div className="text-lg font-extrabold text-text-1 leading-tight tracking-tight">
          Supermercados<br />
          <em className="not-italic text-primary">Araújo</em>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 flex flex-col gap-1.5 mt-2">
        <span className="block font-mono text-[9px] tracking-[2px] uppercase text-text-4 px-2.5 mb-2 font-semibold">
          Análises
        </span>
        {ROUTES.map(r => {
          const isActive = page === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleNav(r.id)}
              className={`
                w-full flex items-center px-4 py-2.5 rounded-lg text-[13px] font-medium
                cursor-pointer border-none text-left transition-all duration-150
                ${isActive
                  ? 'bg-primary-soft text-primary font-bold'
                  : 'bg-transparent text-text-2 hover:bg-bg hover:text-text-1'
                }
              `}
            >
              <span className={`text-[10px] mr-3 ${isActive ? 'text-primary' : 'text-text-4'}`}>
                {isActive ? '▪' : '▸'}
              </span>
              <span>{r.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 font-mono text-[9.5px] text-text-3 leading-relaxed border-t border-border">
        Base v4 · Dez/2025–Mar/2026<br />
        3 Lojas · 4.400 SKUs
      </div>
    </aside>
  );
}
