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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/data/dataset.json');
        if (!response.ok) throw new Error(`HTTP Erro: ${response.status}`);
        const data = await response.json();
        
        if (!isCancelled) {
          setDataset(data);
          setLoading(false);
          setRetryCount(0);
        }
      } catch (err) {
        if (isCancelled) return;
        
        console.error(`Falha no fetch (tentativa ${retryCount + 1}):`, err);
        
        if (retryCount < MAX_RETRIES) {
          // Exponential backoff: 1s, 2s, 4s...
          const timeout = Math.pow(2, retryCount) * 1000;
          console.log(`Re-tentando em ${timeout}ms...`);
          setTimeout(() => {
            if (!isCancelled) setRetryCount(prev => prev + 1);
          }, timeout);
        } else {
          setError(err.message || 'Falha de rede ao carregar o dataset');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [retryCount]);

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
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <h2 className="text-[18px] font-bold text-text-1 mb-2">Falha Crítica de Conexão</h2>
          <p className="text-[13px] text-text-2 mb-4 leading-relaxed">
            Não foi possível carregar o banco de dados do dashboard após múltiplas tentativas. 
            Verifique sua conexão ou a disponibilidade do servidor.
          </p>
          <div className="font-mono text-[11px] text-text-3 bg-bg rounded-lg p-3 mb-5 text-left border border-b1">
            <strong>Detalhe técnico:</strong> {error}
          </div>

          <button
            onClick={() => setRetryCount(0)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-[13px] cursor-pointer border-none hover:bg-primary-hover transition-colors duration-200"
          >
            Tentar Forçar Conexão
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
