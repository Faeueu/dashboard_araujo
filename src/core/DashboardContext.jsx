// src/core/DashboardContext.jsx
// React Context replacing Store.js — manages dataset, filters, active page, and filtered data.

import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const DashboardContext = createContext(null);

// ── Filter logic (reuses same logic from old Router.js applyFilters) ──
function applyFilters(ds, f) {
  const vendas = ds.vendas.filter(v => {
    if (f.lojas.length && !f.lojas.includes(v.loja)) return false;
    if (f.meses.length && !f.meses.includes(v.mes)) return false;
    if (f.cats.length && !f.cats.includes(v.cat)) return false;
    return true;
  });
  const atend = ds.atend.filter(a => {
    if (f.lojas.length && !f.lojas.includes(a.loja)) return false;
    if (f.meses.length && !f.meses.includes(a.mes)) return false;
    return true;
  });
  const estoque = ds.estoque.filter(e => {
    if (f.lojas.length && !f.lojas.includes(e.loja)) return false;
    return true;
  });
  const rupturas = ds.rupturas.filter(r => {
    if (f.lojas.length && !f.lojas.includes(r.loja)) return false;
    if (f.meses.length && !f.meses.includes(r.mes)) return false;
    if (f.cats.length && !f.cats.includes(r.cat)) return false;
    return true;
  });
  const metas = ds.metas.filter(m => {
    if (f.lojas.length && !f.lojas.includes(m.loja)) return false;
    if (f.meses.length && !f.meses.includes(m.mes)) return false;
    return true;
  });
  return { vendas, atend, estoque, rupturas, metas };
}

export function DashboardProvider({ dataset, children }) {
  const [page, setPage] = useState('visao-geral');
  const [filtros, setFiltros] = useState({ lojas: [], meses: [], cats: [] });

  const setFiltro = useCallback((campo, val) => {
    setFiltros(prev => ({ ...prev, [campo]: Array.isArray(val) ? [...val] : val }));
  }, []);

  const clearFiltros = useCallback(() => {
    setFiltros({ lojas: [], meses: [], cats: [] });
  }, []);

  const hasActiveFiltros = filtros.lojas.length > 0 || filtros.meses.length > 0 || filtros.cats.length > 0;

  const filteredData = useMemo(
    () => (dataset ? applyFilters(dataset, filtros) : null),
    [dataset, filtros]
  );

  const value = useMemo(() => ({
    dataset,
    page,
    setPage,
    filtros,
    setFiltro,
    clearFiltros,
    hasActiveFiltros,
    filteredData,
  }), [dataset, page, filtros, setFiltro, clearFiltros, hasActiveFiltros, filteredData]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}

export function useFilteredData() {
  const { filteredData } = useDashboard();
  return filteredData;
}
