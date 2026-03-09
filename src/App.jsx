// src/App.jsx — Shell layout: sidebar + main (filter bar + page outlet)
import { useState, useCallback } from 'react';
import { useDashboard } from './core/DashboardContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import FilterBar from './components/FilterBar.jsx';
import P1_VisaoGeral from './pages/P1_VisaoGeral.jsx';
import P2_Ticket from './pages/P2_Ticket.jsx';
import P3_Margem from './pages/P3_Margem.jsx';
import P4_Estoque from './pages/P4_Estoque.jsx';
import P5_Rupturas from './pages/P5_Rupturas.jsx';
import P6_Metas from './pages/P6_Metas.jsx';

const PAGES = {
  'visao-geral': P1_VisaoGeral,
  'ticket': P2_Ticket,
  'margem': P3_Margem,
  'estoque': P4_Estoque,
  'rupturas': P5_Rupturas,
  'metas': P6_Metas,
};

export default function App() {
  const { page } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const PageComponent = PAGES[page] || P1_VisaoGeral;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <header className="flex lg:hidden items-center h-14 px-4 bg-surface border-b border-border shrink-0 gap-3">
          <span className="text-[15px] font-extrabold text-text-1">
            Supermercados <em className="not-italic text-primary">Araújo</em>
          </span>
          <button
            onClick={toggleSidebar}
            className="ml-auto w-8 h-8 flex flex-col justify-center items-center gap-[5px] rounded-md cursor-pointer border-none bg-transparent"
            aria-label="Menu"
          >
            <span className={`block w-[18px] h-[1.5px] bg-text-2 rounded transition-transform origin-center ${sidebarOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block w-[18px] h-[1.5px] bg-text-2 rounded transition-opacity ${sidebarOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-[18px] h-[1.5px] bg-text-2 rounded transition-transform origin-center ${sidebarOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </header>

        {/* Filter bar */}
        <FilterBar />

        {/* Page outlet */}
        <main className="flex-1 overflow-y-auto px-5 py-7 lg:px-8 lg:py-9" key={page}>
          <div className="animate-fade-up">
            <PageComponent />
          </div>
        </main>
      </div>
    </div>
  );
}
