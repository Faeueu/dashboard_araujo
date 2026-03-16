import { useState } from 'react';

export default function ChartCard({ title, hint, children, span = false }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`
        bg-card border border-b1 rounded-2xl p-6
        transition-all duration-200 hover:border-b2 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]
        ${span ? 'col-span-full' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-b1">
        <div className="flex-1 flex flex-col items-center gap-1 text-center">
          <h3 className="text-[16px] font-bold text-text-1 leading-snug m-0">{title}</h3>
          {hint && (
            <span className="font-mono text-[10.5px] text-text-3 leading-relaxed font-medium">
              {hint}
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? 'Expandir gráfico' : 'Recolher gráfico'}
          aria-expanded={!collapsed}
          className="w-[28px] h-[28px] rounded-lg flex items-center justify-center bg-bg border border-b1 cursor-pointer transition-all duration-200 hover:border-b2 hover:bg-card-h shrink-0"
        >
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            className={`collapse-chevron text-text-3 ${collapsed ? 'rotated' : ''}`}
          >
            <path d="M2.5 4.5l3.5 3 3.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className={`chart-body ${collapsed ? 'collapsed' : ''}`}
        style={collapsed ? {} : { maxHeight: '2000px', opacity: 1 }}
      >
        {children}
      </div>

      {/* Indicador visual de conteúdo colapsado */}
      {collapsed && (
        <div className="chart-collapsed-indicator">
          <span className="text-text-3 text-[11px] font-medium">Clique para expandir o gráfico</span>
        </div>
      )}
    </div>
  );
}
