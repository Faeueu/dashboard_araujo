export default function KpiCard({ label, value = '—', sub = '', alert = false, accent = '' }) {
  return (
    <div
      role={alert ? 'status' : undefined}
      aria-label={`${label}: ${value}${sub ? `, ${sub}` : ''}`}
      className={`
        relative bg-card border border-b1 rounded-2xl p-6 overflow-hidden text-center
        transition-all duration-200 cursor-default group
        hover:border-b2 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-px
        ${alert ? 'border-primary/30' : ''}
      `}
    >
      <div
        className={`
        absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-2xl transition-opacity duration-200
        ${alert ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}
      `}
      />
      <div className="font-mono text-[10.5px] tracking-[2px] uppercase text-text-3 mb-3 font-semibold">
        {label}
      </div>
      <div
        className={`text-[28px] font-extrabold leading-tight tracking-[-0.6px] mb-2 ${alert ? 'text-primary' : 'text-text-1'}`}
        style={accent && !alert ? { color: accent } : {}}
      >
        {value}
      </div>
      {sub && <div className="font-mono text-[11px] text-text-3 font-medium">{sub}</div>}
    </div>
  );
}
