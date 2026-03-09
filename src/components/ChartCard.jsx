// src/components/ChartCard.jsx
export default function ChartCard({ title, hint, children, span = false }) {
  return (
    <div className={`
      bg-card border border-b1 rounded-2xl p-6
      transition-all duration-200 hover:border-b2 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]
      ${span ? 'col-span-full' : ''}
    `}>
      <div className="flex flex-col items-center gap-2 mb-5 pb-4 border-b border-b1 text-center">
        <h3 className="text-[16px] font-bold text-text-1 leading-snug m-0">{title}</h3>
        {hint && (
          <span className="font-mono text-[10.5px] text-text-3 leading-relaxed font-medium">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
