// src/components/PageHeader.jsx
export default function PageHeader({ badge, title, description }) {
  return (
    <div className="mb-8 pb-6 relative text-center flex flex-col items-center justify-center animate-fade-up">
      <div className="font-mono text-[10.5px] tracking-[2.5px] uppercase text-primary mb-2.5 flex items-center gap-2 justify-center font-bold">
        <span className="inline-block w-4 h-[2px] bg-primary" />
        {badge}
      </div>
      <h1
        className="text-2xl lg:text-[28px] font-extrabold leading-tight mb-3 text-text-1"
        style={{ letterSpacing: '-0.5px' }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="text-text-3 text-[13px] max-w-xl leading-relaxed mb-5">
        {description}
      </p>
      <div className="w-8 h-[3px] bg-primary" />
    </div>
  );
}
