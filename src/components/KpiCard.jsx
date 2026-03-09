// src/components/KpiCard.jsx
export default function KpiCard({ label, value = '—', sub = '', accent = '' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 text-center transition-all duration-200 hover:border-border-strong hover:shadow-md group animate-fade-up">
      <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-text-3 mb-3 font-semibold">
        {label}
      </div>
      <div
        className="text-[26px] font-extrabold leading-tight tracking-tight mb-1.5 transition-colors"
        style={{ color: accent || 'var(--color-text-1)', letterSpacing: '-0.5px' }}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-text-3 font-medium">
          {sub}
        </div>
      )}
    </div>
  );
}
