// src/components/KpiCard.jsx
export default function KpiCard({ label, value = '—', sub = '', accent = '' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 lg:p-6 text-center transition-all duration-200 hover:border-border-strong group animate-fade-up flex flex-col items-center justify-center">
      <div className="font-mono text-[9px] tracking-[2px] uppercase text-text-3 mb-3 font-semibold">
        {label}
      </div>
      <div
        className="text-[28px] font-extrabold leading-none tracking-tight mb-1.5 text-text-1 transition-colors"
        style={accent ? { color: accent } : {}}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[9px] uppercase tracking-[1px] text-text-4 font-semibold mt-2">
          {sub}
        </div>
      )}
    </div>
  );
}
