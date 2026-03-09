// src/components/PageHeader.jsx
export default function PageHeader({ badge, title, description }) {
  return (
    <div className="mb-6 pb-5 flex flex-col items-start font-sans animate-fade-up">
      <div className="font-mono text-[10px] tracking-[2px] uppercase text-primary mb-1.5 font-bold">
        {badge}
      </div>
      <h1
        className="text-[26px] lg:text-[32px] font-extrabold leading-tight mb-2 text-text-1"
        style={{ letterSpacing: '-0.7px' }}
        dangerouslySetInnerHTML={{ __html: title.replace('<br/>', ' ') }}
      />
      <p className="text-text-3 text-[14px] max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}
