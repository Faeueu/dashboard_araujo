import { useDashboard } from '../core/DashboardContext.jsx';

const PAGE_MAP = {
  'visao-geral': 'Visão Geral',
  'ticket':      'Ticket Médio',
  'margem':      'Margem & Mix',
  'estoque':     'Estoque',
  'rupturas':    'Rupturas',
  'metas':       'Metas',
};

export default function Breadcrumb() {
  const { page } = useDashboard();
  const label = PAGE_MAP[page] || 'Dashboard';

  return (
    <nav
      aria-label="Breadcrumb"
      className="px-7 py-2.5 bg-surf border-b border-b0 text-[12px] font-medium text-text-3 flex items-center gap-1.5 shrink-0"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span className="text-text-3">Dashboard</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-40">
        <path d="M3.5 2l3.5 3-3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-text-1 font-semibold">{label}</span>
    </nav>
  );
}
