// src/components/PageHeader.jsx
export default function PageHeader({ badge, title, description }) {
  return (
    <div className="mb-8 pb-6 border-b border-border relative text-center flex flex-col items-center animate-fade-up">
      <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-15 h-[3px] bg-primary rounded-full" />
      <div className="font-mono text-[10.5px] tracking-[2.5px] uppercase text-primary mb-2.5 flex items-center gap-2 justify-center font-semibold">
        <span className="inline-block w-4 h-0.5 bg-primary rounded-full" />
        {badge}
      </div>
      <h1
        className="text-2xl lg:text-3xl font-extrabold leading-tight mb-3 text-text-1"
        style={{ letterSpacing: '-0.5px' }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="text-text-2 text-sm max-w-xl leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
