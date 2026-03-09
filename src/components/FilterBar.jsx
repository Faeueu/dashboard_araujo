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

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const label = hasActive
    ? (ativos.length === 1 ? fmt(ativos[0]) : `${ativos.length} selecionados`)
    : LABEL_MAP[campo];

  return (
    <div className={`relative`} ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-[140ms]
          ${hasActive
            ? 'border-primary text-primary bg-primary-dim'
            : 'bg-card border-b1 text-text-2 hover:border-b3 hover:text-text-1'
          }`}
      >
        <span className="truncate max-w-[140px]">{label}</span>
        <svg
          className={`w-[10px] h-[10px] text-text-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 10"
          fill="none"
        >
          <path d="M2 3.8l3 2.8 3-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`${open ? 'block' : 'hidden'} absolute top-[calc(100%+7px)] left-0 bg-card border border-b1 rounded-xl min-w-[230px] z-[400] shadow-[0_8px_30px_rgba(0,0,0,0.1)] overflow-hidden animate-[ddIn_140ms_var(--ease-out)_both]`}>
        <div className="flex justify-between items-center px-4 py-3 border-b border-b1 font-mono text-[10px] tracking-[1.5px] uppercase text-text-3 font-semibold">
          <span>{LABEL_MAP[campo]}</span>
          {hasActive && (
            <button
              onClick={() => { onClear(campo); setOpen(false); }}
              className="font-mono text-[10px] text-primary bg-none border-none cursor-pointer p-0 font-bold hover:underline"
            >
              limpar
            </button>
          )}
        </div>
        <ul className="list-none max-h-[260px] overflow-y-auto p-1.5">
          {opcoes.map(op => {
            const sel = ativos.includes(op);
            return (
              <li
                key={op}
                onClick={() => onToggle(campo, op)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[13.5px] transition-all duration-[100ms] font-medium
                  ${sel
                    ? 'text-primary bg-primary-dim font-bold'
                    : 'text-text-2 hover:bg-bg hover:text-text-1'
                  }
                `}
              >
                <span className="w-[16px] text-[11px] text-primary font-mono shrink-0 text-center font-bold">
                  {sel ? '✓' : ''}
                </span>
                <span>{fmt(op)}</span>
              </li>
            );
          })}
        </ul>
      </div>
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
    <div id="filterbar" className="bg-surf border-b border-b1 px-7 py-3 shrink-0">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="font-mono text-[10px] tracking-[2px] uppercase text-text-3 mr-2 font-semibold">
          Filtrar
        </span>

        <Dropdown campo="loja" opcoes={lojas} ativos={filtros.lojas} onToggle={handleToggle} onClear={handleClear} />
        <Dropdown campo="mes" opcoes={meses} ativos={filtros.meses} onToggle={handleToggle} onClear={handleClear} />
        <Dropdown campo="cat" opcoes={cats} ativos={filtros.cats} onToggle={handleToggle} onClear={handleClear} />

        {hasActiveFiltros && (
          <button
            onClick={clearFiltros}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/5 border border-primary/20 rounded-xl text-primary font-sans text-[12.5px] font-bold cursor-pointer transition-all duration-[140ms] hover:bg-primary/10"
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
