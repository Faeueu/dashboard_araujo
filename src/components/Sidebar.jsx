import { useDashboard } from '../core/DashboardContext.jsx';
import { useTheme } from '../core/DashboardContext.jsx';

const ROUTES = [
  {
    id: 'visao-geral',
    label: 'Visão Geral',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1',
  },
  {
    id: 'ticket',
    label: 'Ticket Médio',
    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  },
  {
    id: 'margem',
    label: 'Margem & Mix',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    id: 'estoque',
    label: 'Estoque',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    id: 'rupturas',
    label: 'Rupturas',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
  },
  {
    id: 'metas',
    label: 'Metas',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
];

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { page, setPage } = useDashboard();
  const { theme, toggleTheme } = useTheme();

  const handleNav = id => {
    setPage(id);
    onClose();
  };

  return (
    <aside
      id="sidebar"
      className={`
        w-(--sidebar-w) shrink-0 bg-surf border-r border-b1
        flex flex-col overflow-y-auto z-50 transition-transform duration-280 ease-out
        fixed inset-y-0 left-0 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0 shadow-[8px_0_40px_rgba(0,0,0,0.08)]' : '-translate-x-[110%]'}
      `}
    >
      <div className="px-6 py-7 pb-5 border-b border-b1">
        <div className="font-mono text-[11px] font-bold tracking-[3px] uppercase text-primary mb-2">
          Dashboard · v4
        </div>
        <div className="text-[20px] font-extrabold leading-[1.15] tracking-[-0.4px] text-text-1">
          Supermercados
          <br />
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
                text-[14px] font-medium cursor-pointer border-none text-left transition-all duration-140
                mb-[2px] select-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
                ${
                  isActive
                    ? 'bg-primary-dim text-primary font-bold'
                    : 'bg-transparent text-text-2 hover:bg-bg hover:text-text-1'
                }
              `}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-colors duration-140 ${isActive ? 'text-primary' : 'text-text-3'}`}
              >
                <path d={r.icon} />
              </svg>
              <span>{r.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle + Footer */}
      <div className="px-4 py-4 border-t border-b1">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none bg-bg text-text-2 hover:text-text-1 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
        >
          <span className="text-text-3 group-hover:text-text-1 transition-colors duration-200">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </span>
          <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
        </button>
      </div>

      <div className="px-6 py-5 font-mono text-[10px] text-text-3 leading-[1.9] border-t border-b1 font-medium">
        Base v4 · Dez/2025–Mar/2026
        <br />3 Lojas · 4.400 SKUs
      </div>
    </aside>
  );
}
