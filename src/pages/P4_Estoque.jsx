// src/pages/P4_Estoque.jsx
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, COLORS } from '../components/Charts.jsx';
import { sum } from '../utils/filters.js';
import { brl, num } from '../utils/fmt.js';

function cobF(e) {
  const f = { '0–7d': 0, '8–15d': 0, '16–30d': 0, '31–60d': 0, '60d+': 0 };
  for (const x of e) {
    const c = x.cob;
    if (c <= 7) f['0–7d']++;
    else if (c <= 15) f['8–15d']++;
    else if (c <= 30) f['16–30d']++;
    else if (c <= 60) f['31–60d']++;
    else f['60d+']++;
  }
  return f;
}

function stE(e) {
  const m = {};
  for (const x of e) m[x.status] = (m[x.status] || 0) + 1;
  return m;
}

function stCat(e) {
  const m = {};
  for (const x of e) {
    if (!m[x.cat]) m[x.cat] = { cat: x.cat, Ruptura: 0, Crítico: 0, Abaixo_Mínimo: 0, Normal: 0 };
    m[x.cat][x.status] = (m[x.cat][x.status] || 0) + 1;
  }
  return Object.values(m)
    .map(d => ({ ...d, tot: d.Ruptura + d.Crítico + d.Abaixo_Mínimo }))
    .sort((a, b) => b.tot - a.tot);
}

export default function P4_Estoque() {
  const data = useFilteredData();
  if (!data) return null;

  const { estoque } = data;

  const val = sum(estoque, 'valor');
  const rup = estoque.filter(e => e.status === 'Ruptura').length;
  const abx = estoque.filter(e => e.status === 'Abaixo_Mínimo').length;
  const risc = estoque.filter(e => e.risco_venc === 'Alto').length;

  const st = stE(estoque);
  const tot = estoque.length;
  const bars = [
    { k: 'Ruptura', l: 'Ruptura', c: COLORS.red },
    { k: 'Crítico', l: 'Crítico', c: '#FFB020' },
    { k: 'Abaixo_Mínimo', l: 'Abaixo Mín.', c: COLORS.w2 },
    { k: 'Normal', l: 'Normal', c: 'rgba(255,255,255,.1)' }
  ];

  const cob = cobF(estoque);
  const ck = Object.keys(cob);
  const barSeries = [{
    data: Object.values(cob),
    backgroundColor: ck.map(k => k === '0–7d' ? COLORS.red : k === '8–15d' ? 'rgba(232,0,13,.5)' : k === '16–30d' ? COLORS.white : 'rgba(255,255,255,.13)'),
    borderRadius: 5,
    borderSkipped: false,
    barThickness: 32
  }];

  const rows = stCat(estoque).slice(0, 12);

  return (
    <>
      <PageHeader
        badge="Página 4 · Operacional"
        title="Gestão de<br/>Estoque"
        description="Controle de posição, cobertura e alertas de ruptura iminente."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[14px]">
        <KpiCard label="Valor Total em Estoque" value={brl(val)} />
        <KpiCard label="SKUs em Ruptura" value={num(rup)} sub={rup > 0 ? 'requer ação imediata' : ''} alert={rup > 0} />
        <KpiCard label="Abaixo do Mínimo" value={num(abx)} sub="SKUs abaixo do mínimo" />
        <KpiCard label="Risco de Vencimento" value={num(risc)} sub="produtos em risco" alert={risc > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        <ChartCard title="Distribuição por Status de Estoque" hint="Posição atual — todos os SKUs e lojas filtradas">
          <div className="mt-[16px]">
            {bars.map(b => {
              const v = st[b.k] || 0;
              const p = ((v / tot) * 100).toFixed(1);
              return (
                <div key={b.k} className="sbar-row flex items-center gap-[12px] mb-[12px]">
                  <span className="sbar-lbl w-[90px] text-right font-mono text-[9.5px] text-text-2 shrink-0">{b.l}</span>
                  <div className="sbar-track flex-1 bg-[rgba(255,255,255,0.05)] rounded-[4px] h-[24px] overflow-hidden">
                    <div 
                      className="sbar-fill h-full rounded-[4px] flex items-center pl-[10px] font-mono text-[10px] font-semibold transition-all duration-700 ease-out"
                      style={{ width: `${p}%`, background: b.c, color: b.k === 'Normal' ? '#111' : '#fff' }}
                    >
                      {v}
                    </div>
                  </div>
                  <span className="sbar-pct font-mono text-[9.5px] w-[42px] shrink-0" style={{ color: b.c }}>{p}%</span>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Histograma de Cobertura em Dias" hint="Ideal: 16–30 dias · Abaixo de 7d = risco imediato">
          <BarChart
            labels={ck}
            datasets={barSeries}
            yFmt={v => num(v)}
          />
        </ChartCard>

        <ChartCard title="SKUs Críticos por Categoria" hint="Ordenado por volume de alertas" span>
          <div className="tscroll mt-[12px]">
            <table className="dt w-full border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="bg-black/45 text-text-3 font-mono text-[9px] tracking-[1.5px] uppercase p-[10px_13px] text-left border-b border-b2 font-normal whitespace-nowrap">Categoria</th>
                  <th className="bg-black/45 text-text-3 font-mono text-[9px] tracking-[1.5px] uppercase p-[10px_13px] text-left border-b border-b2 font-normal whitespace-nowrap">Ruptura</th>
                  <th className="bg-black/45 text-text-3 font-mono text-[9px] tracking-[1.5px] uppercase p-[10px_13px] text-left border-b border-b2 font-normal whitespace-nowrap">Crítico</th>
                  <th className="bg-black/45 text-text-3 font-mono text-[9px] tracking-[1.5px] uppercase p-[10px_13px] text-left border-b border-b2 font-normal whitespace-nowrap">Abaixo Mín.</th>
                  <th className="bg-black/45 text-text-3 font-mono text-[9px] tracking-[1.5px] uppercase p-[10px_13px] text-left border-b border-b2 font-normal whitespace-nowrap">Normal</th>
                  <th className="bg-black/45 text-text-3 font-mono text-[9px] tracking-[1.5px] uppercase p-[10px_13px] text-left border-b border-b2 font-normal whitespace-nowrap">Total Alertas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.cat} className="hover:bg-[rgba(255,255,255,0.025)]">
                    <td className="dn p-[10px_13px] border-b border-white/5 font-semibold text-text-1">{r.cat}</td>
                    <td className="p-[10px_13px] border-b border-white/5">
                      <span className={`pill inline-flex items-center gap-[4px] font-mono text-[9.5px] px-[9px] py-[2px] rounded-[20px] ${r.Ruptura > 0 ? 'bg-primary/10 text-primary border border-primary/25' : 'bg-[#00D250]/10 text-[#00C85A] border border-[#00D250]/18'}`}>
                        {r.Ruptura}
                      </span>
                    </td>
                    <td className="p-[10px_13px] border-b border-white/5 font-mono text-[#FFB020]">{r.Crítico}</td>
                    <td className="p-[10px_13px] border-b border-white/5 font-mono text-text-3">{r.Abaixo_Mínimo}</td>
                    <td className="p-[10px_13px] border-b border-white/5 font-mono text-text-3">{r.Normal}</td>
                    <td className="p-[10px_13px] border-b border-white/5 font-mono font-bold" style={{ color: r.tot > 150 ? COLORS.red : r.tot > 80 ? '#FFB020' : 'var(--color-text-2)' }}>{r.tot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </>
  );
}
