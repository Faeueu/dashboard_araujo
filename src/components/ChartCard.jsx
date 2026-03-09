// src/components/ChartCard.jsx
export default function ChartCard({ title, hint = '', children, spanAll = false }) {
  return (
    <div className={`bg-card rounded-xl p-5 lg:p-6 border border-border animate-fade-up ${spanAll ? 'col-span-full' : ''}`}>
      <div className="flex flex-col items-center text-center gap-1.5 mb-5 pb-4">
        <h3 className="text-[14px] font-bold text-text-1 leading-snug tracking-tight">{title}</h3>
        {hint && (
          <span className="font-mono text-[9px] uppercase tracking-[1px] text-text-4 leading-relaxed font-semibold">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
