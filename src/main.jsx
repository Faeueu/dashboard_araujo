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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-name">Supermercados <em>Araújo</em></div>
        <div className="loading-bar">
          <div className="loading-prog"></div>
        </div>
        <div className="loading-text">Carregando dataset…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div className="loading-name">Supermercados <em>Araújo</em></div>
        <div className="loading-text" style={{ color: '#DC2626' }}>
          Erro ao carregar dados. Recarregue a página.
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
