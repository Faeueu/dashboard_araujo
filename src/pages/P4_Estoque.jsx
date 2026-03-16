import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, useChartColors } from '../components/Charts.jsx';
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
  const c = useChartColors();
  if (!data) return null;

  const { estoque } = data;

  const val = sum(estoque, 'valor');
  const rup = estoque.filter(e => e.status === 'Ruptura').length;
  const abx = estoque.filter(e => e.status === 'Abaixo_Mínimo').length;
  const risc = estoque.filter(e => e.risco_venc === 'Alto').length;

  const st = stE(estoque);
  const tot = estoque.length;
  const bars = [
    { k: 'Ruptura', l: 'Ruptura', c: c.red },
    { k: 'Crítico', l: 'Crítico', c: c.warning },
    { k: 'Abaixo_Mínimo', l: 'Abaixo Mín.', c: c.barAlt },
    { k: 'Normal', l: 'Normal', c: c.bar }
  ];

  const cob = cobF(estoque);
  const ck = Object.keys(cob);
  const barSeries = [{
    data: Object.values(cob),
    backgroundColor: ck.map(k => k === '0–7d' ? c.red : k === '8–15d' ? c.red2 : k === '16–30d' ? c.barAlt : c.bar),
    borderRadius: 6,
    borderSkipped: false,
    barThickness: 40
  }];

  const rows = stCat(estoque).slice(0, 12);

  return (
    <>
      <PageHeader
        badge="Página 4 · Operacional"
        title="Gestão de<br/>Estoque"
        description="Controle de posição, cobertura e alertas de ruptura iminente."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Valor Total em Estoque" value={brl(val)} />
        <KpiCard label="SKUs em Ruptura" value={num(rup)} sub={rup > 0 ? 'requer ação imediata' : ''} alert={rup > 0} />
        <KpiCard label="Abaixo do Mínimo" value={num(abx)} sub="SKUs abaixo do mínimo" />
        <KpiCard label="Risco de Vencimento" value={num(risc)} sub="produtos em risco" alert={risc > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Distribuição por Status de Estoque" hint="Posição atual — todos os SKUs e lojas filtradas">
          <div className="mt-4">
            {bars.map(b => {
              const v = st[b.k] || 0;
              const p = ((v / tot) * 100).toFixed(1);
              // Determine text color based on bar background
              const textColor = b.k === 'Normal' && !c.isDark ? '#334155' : '#fff';
              return (
                <div key={b.k} className="sbar-row">
                  <span className="sbar-lbl">{b.l}</span>
                  <div className="sbar-track">
                    <div
                      className="sbar-fill"
                      style={{ width: `${p}%`, background: b.c, color: textColor }}
                    >
                      {v}
                    </div>
                  </div>
                  <span className="sbar-pct" style={{ color: b.c }}>{p}%</span>
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
            height={300}
          />
        </ChartCard>

        <ChartCard title="SKUs Críticos por Categoria" hint="Ordenado por volume de alertas" span>
          <div className="tscroll mt-3">
            <table className="dt w-full">
              <thead>
                <tr>
                  <th className="text-left!">Categoria</th>
                  <th>Ruptura</th>
                  <th>Crítico</th>
                  <th>Abaixo Mín.</th>
                  <th>Normal</th>
                  <th>Total Alertas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.cat}>
                    <td className="dn text-left!">{r.cat}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] px-3 py-1 rounded-full font-bold ${r.Ruptura > 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-success/10 text-success border border-success/20'}`}>
                        {r.Ruptura}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-warning">{r.Crítico}</td>
                    <td className="font-mono font-bold text-text-3">{r.Abaixo_Mínimo}</td>
                    <td className="font-mono font-bold text-text-3">{r.Normal}</td>
                    <td className="font-mono font-extrabold" style={{ color: r.tot > 150 ? c.red : r.tot > 80 ? c.warning : 'var(--color-text-2)' }}>{r.tot}</td>
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
