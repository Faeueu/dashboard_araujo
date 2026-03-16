/* ─── KPI Skeleton ──────────────────────────────────────────── */
export function KpiSkeleton({ delay = 0 }) {
  return (
    <div
      className="bg-card border border-b1 rounded-2xl p-6 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="skeleton-text w-[80px] h-[10px] mx-auto mb-4"
        style={{ animationDelay: `${delay}ms` }}
      />
      <div
        className="skeleton w-[120px] h-[30px] mx-auto mb-3 rounded-lg"
        style={{ animationDelay: `${delay + 50}ms` }}
      />
      <div
        className="skeleton-text w-[90px] h-[10px] mx-auto"
        style={{ animationDelay: `${delay + 100}ms` }}
      />
    </div>
  );
}

/* ─── Chart Skeleton ────────────────────────────────────────── */
export function ChartSkeleton({ height = 300, span = false, delay = 0 }) {
  return (
    <div
      className={`bg-card border border-b1 rounded-2xl p-6 ${span ? 'col-span-full' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center gap-2 mb-5 pb-4 border-b border-b1">
        <div
          className="skeleton-text w-[200px] h-[14px]"
          style={{ animationDelay: `${delay}ms` }}
        />
        <div
          className="skeleton-text w-[160px] h-[10px] mt-1"
          style={{ animationDelay: `${delay + 50}ms` }}
        />
      </div>
      <div
        className="skeleton w-full rounded-xl"
        style={{ height: `${height}px`, animationDelay: `${delay + 100}ms` }}
      />
    </div>
  );
}

/* ─── Table Skeleton ────────────────────────────────────────── */
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-card border border-b1 rounded-2xl p-6 col-span-full">
      <div className="flex flex-col items-center gap-2 mb-5 pb-4 border-b border-b1">
        <div className="skeleton-text w-[200px] h-[14px]" />
        <div className="skeleton-text w-[140px] h-[10px] mt-1" />
      </div>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-4">
          {[120, 80, 80, 80, 80].map((w, i) => (
            <div key={i} className="skeleton-text h-[10px]" style={{ width: `${w}px` }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {[120, 80, 80, 80, 80].map((w, j) => (
              <div key={j} className="skeleton-text h-[12px]" style={{ width: `${w}px` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Full Page Loading Layout ──────────────────────────────── */
export default function LoadingSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar skeleton */}
      <aside className="w-(--sidebar-w) shrink-0 bg-surf border-r border-b1 hidden lg:flex flex-col">
        <div className="px-6 py-7 pb-5 border-b border-b1">
          <div className="skeleton-text w-[100px] h-[10px] mb-3" />
          <div className="skeleton-text w-[140px] h-[18px] mb-1" />
          <div className="skeleton-text w-[80px] h-[18px]" />
        </div>
        <div className="px-3 py-5 flex-1 flex flex-col gap-2">
          <div className="skeleton-text w-[60px] h-[8px] mx-3 mb-3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton w-full h-[38px] rounded-xl" />
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Filter bar skeleton */}
        <div className="bg-surf border-b border-b1 px-7 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="skeleton-text w-[50px] h-[10px]" />
            {[100, 80, 110].map((w, i) => (
              <div
                key={i}
                className="skeleton w-[${w}px] h-[36px] rounded-xl"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <main className="flex-1 overflow-y-auto py-10 px-8 md:px-6 sm:px-4">
          <div className="max-w-[1400px] mx-auto">
            {/* Page header skeleton */}
            <div className="mb-10 pb-6 border-b border-b1 text-center flex flex-col items-center">
              <div className="skeleton-text w-[160px] h-[10px] mb-4" />
              <div className="skeleton w-[280px] h-[36px] rounded-lg mb-3" />
              <div className="skeleton-text w-[400px] h-[12px] max-w-full" />
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <KpiSkeleton key={i} delay={i * 100} />
              ))}
            </div>

            {/* Chart row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartSkeleton height={280} delay={400} />
              <ChartSkeleton height={280} delay={500} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
