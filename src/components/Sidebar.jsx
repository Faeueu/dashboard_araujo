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
        ${isOpen ? 'translate-x-0 open shadow-[8px_0_40px_rgba(0,0,0,0.6)]' : '-translate-x-[110%]'}
      `}
    >
      <div className="sb-logo px-[22px] py-[26px] pb-[22px] border-b border-b1">
        <div className="sb-brand font-mono text-[11px] font-semibold tracking-[3px] uppercase text-primary mb-[10px]">
          Dashboard · v3
        </div>
        <div className="sb-name text-[19px] font-extrabold leading-[1.15] tracking-[-0.4px] text-text-1">
          Supermercados<br />
          <em className="not-italic text-primary">Araújo</em>
        </div>
      </div>

      <nav className="sb-nav px-[12px] py-[18px] flex-1 flex flex-col gap-0.5">
        <span className="sb-section block font-mono text-[9px] tracking-[2.5px] uppercase text-text-3 px-[10px] mb-[8px] mt-[4px]">
          Análises
        </span>
        {ROUTES.map(r => {
          const isActive = page === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleNav(r.id)}
              className={`
                sb-item w-full flex items-center gap-[11px] px-[12px] py-[9px] rounded-[8px]
                text-[13px] font-medium cursor-pointer border-none text-left transition-all duration-[140ms]
                mb-[2px] select-none
                ${isActive
                  ? 'active bg-primary-dim text-text-1 font-semibold'
                  : 'bg-transparent text-text-2 hover:bg-[rgba(255,255,255,0.05)] hover:text-text-1'
                }
              `}
            >
              <span className={`
                sb-pip w-[5px] h-[5px] rounded-full shrink-0 transition-colors duration-[140ms]
                ${isActive ? 'bg-primary shadow-[0_0_8px_var(--color-primary)]' : 'bg-b3'}
              `} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sb-foot px-[22px] py-[18px] font-mono text-[9px] text-text-3 leading-[1.9] border-t border-b1">
        Base v3 · Dez/2025–Mar/2026<br />
        3 Lojas · 4.400 SKUs
      </div>
    </aside>
  );
}
