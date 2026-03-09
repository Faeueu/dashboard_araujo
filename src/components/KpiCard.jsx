// src/components/KpiCard.jsx
export default function KpiCard({ label, value = '—', sub = '', accent = '' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 lg:p-6 transition-all duration-200 hover:border-border-strong group animate-fade-up flex flex-col items-start justify-center shadow-sm">
      <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-text-3 mb-2 font-bold">
        {label}
      </div>
      <div
        className="text-[28px] font-extrabold leading-none tracking-tight mb-2 text-text-1 transition-colors"
        style={accent ? { color: accent } : {}}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[9.5px] uppercase tracking-[1px] text-text-4 font-semibold mt-auto">
          {sub}
        </div>
      )}
    </div>
  );
}
