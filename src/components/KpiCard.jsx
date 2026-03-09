// src/components/KpiCard.jsx
export default function KpiCard({ label, value = '—', sub = '', accent = '' }) {
  return (
    <div className="relative bg-card border border-border rounded-xl p-5 lg:p-6 transition-all duration-300 hover:border-border-strong group animate-fade-up flex flex-col items-start justify-center shadow-sm hover:shadow-md overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
      <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-text-3 mb-2 font-bold z-10">
        {label}
      </div>
      <div
        className="text-[24px] font-bold leading-none tracking-tight mb-2.5 text-text-1 transition-colors z-10"
        style={accent ? { color: accent } : {}}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10.5px] text-text-4 mt-auto font-medium z-10">
          {sub}
        </div>
      )}
    </div>
  );
}
