// src/main.jsx — Entry point React
import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { DashboardProvider } from './core/DashboardContext.jsx';
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

  if (loading) return null; // Let index.html handle the initial load

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg">
        <div className="text-[22px] font-extrabold text-text-1">Supermercados <em className="not-italic text-primary">Araújo</em></div>
        <div className="text-primary mt-4 font-mono text-[11px] uppercase tracking-wider">
          Erro ao carregar dados: {error}
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
    <Root />
  </StrictMode>
);
