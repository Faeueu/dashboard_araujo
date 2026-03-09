// src/components/ChartCard.jsx
export default function ChartCard({ title, hint, children, span = false }) {
  return (
    <div className={`
      bg-card border border-b1 rounded-xl p-[20px_22px]
      transition-colors duration-200 hover:border-b2
      ${span ? 'col-span-full' : ''}
    `}>
      <div className="flex justify-between items-start gap-[12px] mb-[16px] pb-[14px] border-b border-b1">
        <h3 className="text-[13px] font-bold text-text-1 leading-[1.3] m-0">{title}</h3>
        {hint && (
          <span className="font-mono text-[9px] text-text-3 text-right shrink-0 max-w-[180px] leading-[1.6] mt-[1px]">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
