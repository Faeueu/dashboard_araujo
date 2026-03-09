// src/components/PageHeader.jsx
export default function PageHeader({ badge, title, description }) {
  return (
    <div className="relative mb-[28px] pb-[22px] border-b border-b1">
      <div className="absolute bottom-[-1px] left-0 w-[36px] h-[2px] bg-primary rounded-[2px]" />
      
      <div className="font-mono text-[9px] tracking-[3px] uppercase text-primary mb-[10px] flex items-center gap-[8px]">
        <span className="inline-block w-[16px] h-[1.5px] bg-primary rounded-[2px]" />
        {badge}
      </div>
      
      <h1 
        className="text-[clamp(22px,3vw,30px)] font-extrabold leading-[1.1] mb-[8px] tracking-[-0.6px] text-text-1"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      
      <p className="text-text-2 text-[12.5px] max-w-[480px] leading-[1.8] m-0">
        {description}
      </p>
    </div>
  );
}
