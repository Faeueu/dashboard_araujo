import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { DashboardProvider, ThemeProvider } from './core/DashboardContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingSkeleton from './components/Skeleton.jsx';
import App from './App.jsx';

function Root() {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/dataset.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setDataset(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Falha ao carregar dataset:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg gap-5">
        <div className="text-[24px] font-extrabold text-text-1">
          Supermercados <em className="not-italic text-primary">Araújo</em>
        </div>

        <div className="bg-card border border-b1 rounded-2xl p-8 max-w-[440px] w-full mx-4 text-center">
          <div className="w-[48px] h-[48px] rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 className="text-[18px] font-bold text-text-1 mb-2">Falha no carregamento</h2>
          <p className="text-[13px] text-text-2 mb-4 leading-relaxed">
            Não foi possível carregar os dados do dashboard.
          </p>
          <div className="font-mono text-[11px] text-text-3 bg-bg rounded-lg p-3 mb-5 text-left">
            {error}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-[13px] cursor-pointer border-none hover:bg-primary-hover transition-colors duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider dataset={dataset}>
      <App />
    </DashboardProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>
);
