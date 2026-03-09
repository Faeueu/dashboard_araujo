// src/components/ChartCard.jsx
export default function ChartCard({ title, hint = '', children, spanAll = false }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 lg:p-6 shadow-sm animate-fade-up ${spanAll ? 'col-span-full' : ''}`}>
      <div className="flex flex-col items-center text-center gap-1.5 mb-5 pb-4 border-b border-border">
        <h3 className="text-[15px] font-bold text-text-1 leading-snug">{title}</h3>
        {hint && (
          <span className="font-mono text-[10.5px] text-text-3 leading-relaxed font-medium">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
