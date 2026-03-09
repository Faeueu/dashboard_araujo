// src/components/FilterBar.jsx
import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../core/DashboardContext.jsx';
import { uniq } from '../utils/filters.js';
import { mes as fmtMes } from '../utils/fmt.js';

const CAMPO_MAP = { loja: 'lojas', mes: 'meses', cat: 'cats' };
const LABEL_MAP = { loja: 'Loja', mes: 'Mês', cat: 'Categoria' };
const FORMAT_MAP = { loja: v => v, mes: fmtMes, cat: v => v };

function Dropdown({ campo, opcoes, ativos, onToggle, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const fmt = FORMAT_MAP[campo];
  const hasActive = ativos.length > 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const label = hasActive
    ? (ativos.length === 1 ? fmt(ativos[0]) : `${ativos.length} selecionados`)
    : LABEL_MAP[campo];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer
          border transition-all duration-150 whitespace-nowrap
          ${hasActive
            ? 'border-primary text-primary bg-primary-dim hover:bg-primary-soft'
            : 'border-border-strong text-text-2 bg-surface hover:border-text-4 hover:text-text-1'
          }
        `}
      >
        <span>{label}</span>
        <svg
          className={`w-2.5 h-2.5 text-text-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 10"
          fill="none"
        >
          <path d="M2 3.8l3 2.8 3-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-surface border border-border-strong rounded-xl min-w-[220px] z-50 shadow-xl overflow-hidden animate-fade-up"
          style={{ animationDuration: '140ms' }}>
          <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-border">
            <span className="font-mono text-[9.5px] tracking-wider uppercase text-text-3 font-semibold">
              {LABEL_MAP[campo]}
            </span>
            {hasActive && (
              <button
                onClick={() => { onClear(campo); setOpen(false); }}
                className="font-mono text-[9px] text-primary bg-transparent border-none cursor-pointer hover:underline"
              >
                limpar
              </button>
            )}
          </div>
          <ul className="max-h-60 overflow-y-auto p-1.5 list-none">
            {opcoes.map(op => {
              const sel = ativos.includes(op);
              return (
                <li
                  key={op}
                  onClick={() => onToggle(campo, op)}
                  className={`
                    flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer text-[12.5px]
                    transition-all duration-100
                    ${sel
                      ? 'text-primary bg-primary-dim font-semibold'
                      : 'text-text-2 hover:bg-bg hover:text-text-1'
                    }
                  `}
                >
                  <span className="w-3.5 text-[10px] text-primary font-mono shrink-0 text-center">
                    {sel ? '✓' : ''}
                  </span>
                  <span>{fmt(op)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function FilterBar() {
  const { dataset, filtros, setFiltro, clearFiltros, hasActiveFiltros } = useDashboard();

  if (!dataset) return null;

  const lojas = uniq(dataset.vendas, 'loja');
  const meses = uniq(dataset.vendas, 'mes').sort();
  const cats = uniq(dataset.vendas, 'cat').sort();

  const handleToggle = (campo, val) => {
    const storeKey = CAMPO_MAP[campo];
    const cur = [...filtros[storeKey]];
    const idx = cur.indexOf(val);
    if (idx === -1) cur.push(val);
    else cur.splice(idx, 1);
    setFiltro(storeKey, cur);
  };

  const handleClear = (campo) => {
    setFiltro(CAMPO_MAP[campo], []);
  };

  return (
    <div className="bg-surface border-b border-border px-5 lg:px-7 py-2.5 shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[9.5px] tracking-[1.5px] uppercase text-text-3 mr-1 font-semibold">
          Filtrar
        </span>

        <Dropdown campo="loja" opcoes={lojas} ativos={filtros.lojas} onToggle={handleToggle} onClear={handleClear} />
        <Dropdown campo="mes" opcoes={meses} ativos={filtros.meses} onToggle={handleToggle} onClear={handleClear} />
        <Dropdown campo="cat" opcoes={cats} ativos={filtros.cats} onToggle={handleToggle} onClear={handleClear} />

        {hasActiveFiltros && (
          <button
            onClick={clearFiltros}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-dim border border-primary/25 rounded-lg text-primary text-[11.5px] font-medium cursor-pointer transition-colors hover:bg-primary-soft"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
