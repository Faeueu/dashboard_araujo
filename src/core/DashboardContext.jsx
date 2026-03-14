import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';

const DashboardContext = createContext(null);
const ThemeContext = createContext(null);

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

/* ─── Theme Provider ────────────────────────────────────────── */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('araujo-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDOM(theme) {
  const html = document.documentElement;
  html.classList.add('theme-transition');
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  // Remove transition class after animation completes to avoid affecting other transitions
  setTimeout(() => html.classList.remove('theme-transition'), 350);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem('araujo-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/* ─── Dashboard Provider ────────────────────────────────────── */
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
