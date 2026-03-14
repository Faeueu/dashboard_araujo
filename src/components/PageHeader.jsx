export default function PageHeader({ badge, title, description }) {
  return (
    <div className="relative mb-10 pb-6 border-b border-b1 text-center flex flex-col items-center">
      <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-[60px] h-[3px] bg-primary rounded-full" />

      <div className="font-mono text-[11px] tracking-[3px] uppercase text-primary mb-3 flex items-center gap-2 font-bold">
        <span className="inline-block w-[18px] h-[2px] bg-primary rounded-full" />
        {badge}
        <span className="inline-block w-[18px] h-[2px] bg-primary rounded-full" />
      </div>

      <h1
        className="text-[clamp(26px,3.5vw,36px)] font-extrabold leading-[1.15] mb-3 tracking-[-0.7px] text-text-1"
        dangerouslySetInnerHTML={{ __html: title }}
      />

      <p className="text-text-2 text-[14.5px] max-w-[560px] leading-[1.8] m-0 font-medium">
        {description}
      </p>
    </div>
  );
}
