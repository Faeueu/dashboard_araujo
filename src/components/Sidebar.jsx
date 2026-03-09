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
      id="sidebar"
      className={`
        w-[var(--sidebar-w)] flex-shrink-0 bg-surf border-r border-b1
        flex flex-col overflow-y-auto z-50 transition-transform duration-[280ms] ease-out
        fixed inset-y-0 left-0 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-[8px_0_40px_rgba(0,0,0,0.08)]' : '-translate-x-[110%]'}
      `}
    >
      <div className="px-6 py-7 pb-5 border-b border-b1">
        <div className="font-mono text-[11px] font-bold tracking-[3px] uppercase text-primary mb-2">
          Dashboard · v4
        </div>
        <div className="text-[20px] font-extrabold leading-[1.15] tracking-[-0.4px] text-text-1">
          Supermercados<br />
          <em className="not-italic text-primary">Araújo</em>
        </div>
      </div>

      <nav className="px-3 py-5 flex-1 flex flex-col gap-0.5">
        <span className="block font-mono text-[9.5px] tracking-[2.5px] uppercase text-text-3 px-3 mb-2 mt-1 font-semibold">
          Análises
        </span>
        {ROUTES.map(r => {
          const isActive = page === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleNav(r.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-[10px] rounded-xl
                text-[14px] font-medium cursor-pointer border-none text-left transition-all duration-[140ms]
                mb-[2px] select-none
                ${isActive
                  ? 'bg-primary-dim text-primary font-bold'
                  : 'bg-transparent text-text-2 hover:bg-bg hover:text-text-1'
                }
              `}
            >
              <span className={`
                w-[6px] h-[6px] rounded-full shrink-0 transition-colors duration-[140ms]
                ${isActive ? 'bg-primary shadow-[0_0_8px_var(--color-primary)]' : 'bg-b2'}
              `} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-5 font-mono text-[10px] text-text-3 leading-[1.9] border-t border-b1 font-medium">
        Base v4 · Dez/2025–Mar/2026<br />
        3 Lojas · 4.400 SKUs
      </div>
    </aside>
  );
}
