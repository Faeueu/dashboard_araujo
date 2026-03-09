// src/components/ChartCard.jsx
export default function ChartCard({ title, hint = '', children, spanAll = false }) {
  return (
    <div className={`bg-card rounded-xl p-5 lg:p-6 border border-border animate-fade-up ${spanAll ? 'col-span-full' : ''}`}>
      <div className="flex justify-between items-start gap-3 mb-5 pb-3">
        <h3 className="text-[14px] font-bold text-text-1 leading-snug tracking-tight">{title}</h3>
        {hint && (
          <span className="font-mono text-[9.5px] uppercase tracking-[1px] text-text-4 font-semibold text-right">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
