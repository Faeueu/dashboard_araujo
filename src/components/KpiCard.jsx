// src/components/KpiCard.jsx
export default function KpiCard({ label, value = '—', sub = '', alert = false, accent = '' }) {
  return (
    <div className={`
      relative bg-card border border-b1 rounded-xl p-[18px_20px] overflow-hidden
      transition-all duration-200 cursor-default group hover:border-b2 hover:-translate-y-[1px]
      ${alert ? 'border-primary' : ''}
    `}>
      <div className={`
        absolute top-0 left-0 right-0 h-[2px] bg-primary rounded-t-xl transition-opacity duration-200
        ${alert ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `} />
      <div className="font-mono text-[9px] tracking-[2px] uppercase text-text-3 mb-[10px]">
        {label}
      </div>
      <div
        className={`text-[24px] font-extrabold leading-none tracking-[-0.6px] mb-[5px] ${alert ? 'text-primary' : 'text-text-1'}`}
        style={accent && !alert ? { color: accent } : {}}
      >
        {value}
      </div>
      <div className="font-mono text-[9.5px] text-text-3">
        {sub}
      </div>
    </div>
  );
}
