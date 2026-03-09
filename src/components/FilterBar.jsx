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
    <div className={`fb-group ${hasActive ? 'active' : ''} relative`} ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="fb-btn flex items-center gap-[7px] px-[12px] py-[7px] bg-card border border-b2 rounded-[8px] color-text-2 font-sans text-[12px] font-medium cursor-pointer whitespace-nowrap transition-all duration-[140ms] hover:border-b3 hover:text-text-1"
        style={hasActive ? { borderColor: 'var(--color-primary)', color: 'var(--color-text-1)', backgroundColor: 'var(--color-primary-dim)' } : {}}
      >
        <span className="fb-btxt truncate max-w-[140px]">{label}</span>
        <svg
          className={`fb-chev w-[10px] h-[10px] text-text-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 10"
          fill="none"
        >
          <path d="M2 3.8l3 2.8 3-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`fb-dd ${open ? 'open block' : 'hidden'} absolute top-[calc(100%+7px)] left-0 bg-card-h border border-b2 rounded-[10px] min-w-[220px] z-[400] shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden animate-[ddIn_140ms_var(--ease-out)_both]`}>
        <div className="fb-dd-head flex justify-between items-center px-[14px] py-[11px] pb-[9px] border-b border-b1 font-mono text-[9px] tracking-[1.5px] uppercase text-text-3">
          <span>{LABEL_MAP[campo]}</span>
          {hasActive && (
            <button
              onClick={() => { onClear(campo); setOpen(false); }}
              className="fb-dd-clr font-mono text-[9px] text-primary bg-none border-none cursor-pointer p-0"
            >
              limpar
            </button>
          )}
        </div>
        <ul className="fb-list list-none max-h-[250px] overflow-y-auto p-[5px]">
          {opcoes.map(op => {
            const sel = ativos.includes(op);
            return (
              <li
                key={op}
                onClick={() => onToggle(campo, op)}
                className={`
                  fb-item flex items-center gap-[10px] px-[10px] py-[8px] rounded-[6px] cursor-pointer text-[12.5px] transition-all duration-[100ms]
                  ${sel
                    ? 'sel text-text-1 bg-primary-dim'
                    : 'text-text-2 hover:bg-[rgba(255,255,255,0.05)] hover:text-text-1'
                  }
                `}
              >
                <span className="fb-check w-[14px] text-[10px] text-primary font-mono shrink-0 text-center">
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
    <div id="filterbar" className="bg-surf border-b border-b1 px-[28px] py-[11px] shrink-0">
      <div className="fb-wrap flex items-center gap-[8px] flex-wrap">
        <span className="fb-lbl font-mono text-[9px] tracking-[2px] uppercase text-text-3 mr-[6px]">
          Filtrar por
        </span>

        <Dropdown campo="loja" opcoes={lojas} ativos={filtros.lojas} onToggle={handleToggle} onClear={handleClear} />
        <Dropdown campo="mes" opcoes={meses} ativos={filtros.meses} onToggle={handleToggle} onClear={handleClear} />
        <Dropdown campo="cat" opcoes={cats} ativos={filtros.cats} onToggle={handleToggle} onClear={handleClear} />

        {hasActiveFiltros && (
          <button
            onClick={clearFiltros}
            className="fb-clear flex items-center gap-[6px] px-[12px] py-[7px] bg-[rgba(232,0,13,0.08)] border border-[rgba(232,0,13,0.22)] rounded-[8px] text-[#FF4455] font-sans text-[11.5px] font-medium cursor-pointer transition-all duration-[140ms] hover:bg-[rgba(232,0,13,0.16)]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
