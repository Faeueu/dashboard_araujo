import { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar.jsx';
import FilterBar from './components/FilterBar.jsx';
import Breadcrumb from './components/Breadcrumb.jsx';
import { useDashboard } from './core/DashboardContext.jsx';
import LoadingSkeleton from './components/Skeleton.jsx';

// Lazy load pages for code splitting
const P1_VisaoGeral = lazy(() => import('./pages/P1_VisaoGeral.jsx'));
const P2_TicketMedio = lazy(() => import('./pages/P2_Ticket.jsx'));
const P3_MargemMix = lazy(() => import('./pages/P3_Margem.jsx'));
const P4_Estoque = lazy(() => import('./pages/P4_Estoque.jsx'));
const P5_Rupturas = lazy(() => import('./pages/P5_Rupturas.jsx'));
const P6_Metas = lazy(() => import('./pages/P6_Metas.jsx'));

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { page } = useDashboard();

  const renderPage = () => {
    const pageComponent = (() => {
      switch (page) {
        case 'visao-geral':
          return <P1_VisaoGeral />;
        case 'ticket':
          return <P2_TicketMedio />;
        case 'margem':
          return <P3_MargemMix />;
        case 'estoque':
          return <P4_Estoque />;
        case 'rupturas':
          return <P5_Rupturas />;
        case 'metas':
          return <P6_Metas />;
        default:
          return <P1_VisaoGeral />;
      }
    })();

    return <Suspense fallback={<LoadingSkeleton />}>{pageComponent}</Suspense>;
  };

  return (
    <div id="shell" className="flex h-screen overflow-hidden bg-bg">
      {/* Overlay for mobile */}
      <div
        id="ov"
        className={`fixed inset-0 bg-black/30 z-150 backdrop-blur-[2px] transition-opacity duration-300 ${sidebarOpen ? 'block opacity-100' : 'hidden opacity-0'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div id="main" className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar (Mobile Only) */}
        <header
          id="topbar"
          className="lg:hidden flex items-center h-[56px] px-5 bg-surf border-b border-b1 shrink-0 gap-3"
        >
          <span className="text-[16px] font-extrabold text-text-1">
            Supermercados <em className="not-italic text-primary">Araújo</em>
          </span>
          <button
            id="hbg"
            aria-label="Menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-[36px] h-[36px] flex flex-col justify-center items-center gap-[5px] cursor-pointer border-none bg-transparent ml-auto group"
          >
            <span
              className={`block w-[18px] h-[2px] bg-text-2 rounded-[2px] transition-transform duration-200 ease-out ${sidebarOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}
            ></span>
            <span
              className={`block w-[18px] h-[2px] bg-text-2 rounded-[2px] transition-opacity duration-150 ${sidebarOpen ? 'opacity-0' : ''}`}
            ></span>
            <span
              className={`block w-[18px] h-[2px] bg-text-2 rounded-[2px] transition-transform duration-200 ease-out ${sidebarOpen ? '-translate-y-[6.5px] rotate-45' : ''}`}
            ></span>
          </button>
        </header>

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Filter Bar */}
        <FilterBar />

        {/* Dynamic Page Content */}
        <main id="outlet" className="flex-1 overflow-y-auto py-10 px-8 md:px-6 sm:px-4">
          <div className="max-w-[1400px] mx-auto stagger">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}

export default App;
