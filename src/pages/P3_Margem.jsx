import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, ScatterChart, useChartColors } from '../components/Charts.jsx';
import { sum, MORD } from '../utils/filters.js';
import { brl, pct, mes as fMes } from '../utils/fmt.js';

const LOJAS = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];

function mgCat(v) {
  const m = {};
  for (const r of v) {
    const k = r.cat;
    if (!m[k]) m[k] = { label: k, rec: 0, mg: 0 };
    m[k].rec += r.rec;
    m[k].mg += r.mg;
  }
  return Object.values(m)
    .map(d => ({ ...d, pct: d.rec > 0 ? (d.mg / d.rec) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct);
}

export default function P3_Margem() {
  const data = useFilteredData();
  const c = useChartColors();
  if (!data) return null;

  const LCOL = [c.centro, c.norte, c.sul];
  const { vendas } = data;

  const rec = sum(vendas, 'rec');
  const mg = sum(vendas, 'mg');
  const mgP = rec > 0 ? (mg / rec) * 100 : 0;

  const cm = mgCat(vendas);
  const mel = cm[0] || { label: '—', pct: 0 };
  const pior = cm[cm.length - 1] || { label: '—', pct: 0 };

  const barSeries = [
    {
      data: cm.map(d => +d.pct.toFixed(1)),
      backgroundColor: cm.map(d =>
        d.pct >= 40 ? c.red : d.pct >= 30 ? c.red2 : d.pct >= 23 ? c.barAlt : c.bar
      ),
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 22,
    },
  ];

  const scatterSeries = cm.map(d => ({
    label: d.label,
    data: [{ x: d.rec, y: +d.pct.toFixed(1) }],
    backgroundColor: d.pct >= 40 ? c.red : d.pct >= 30 ? c.red2 : c.barAlt,
    pointRadius: 12,
    pointHoverRadius: 15,
  }));

  const mm = {};
  vendas.forEach(v => {
    if (!mm[v.mes]) mm[v.mes] = {};
    mm[v.mes][v.loja] = (mm[v.mes][v.loja] || 0) + v.rec;
  });
  const ma = MORD.filter(m => mm[m]);

  return (
    <>
      <PageHeader
        badge="Página 3 · Rentabilidade"
        title="Margem &amp;<br/>Mix de Produtos"
        description="Quem vende mais nem sempre ganha mais. Aqui o foco é na qualidade do faturamento."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard
          label="% Margem Bruta"
          value={pct(mgP)}
          sub={mgP >= 29 ? '✓ acima do benchmark' : '⚠ atenção'}
        />
        <KpiCard label="Margem Bruta R$" value={brl(mg)} />
        <KpiCard label="Maior Margem" value={mel.label} sub={pct(mel.pct)} />
        <KpiCard label="Menor Margem" value={pior.label} sub={pct(pior.pct)} alert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Margem Bruta % por Categoria"
          hint="Ordenado desc — vermelho = acima de 30%"
        >
          <BarChart
            labels={cm.map(d => d.label)}
            datasets={barSeries}
            horiz
            xFmt={v => v + '%'}
            height={380}
          />
        </ChartCard>

        <ChartCard
          title="Receita vs Margem por Categoria"
          hint="Quadrante ideal: direita-alto (alto faturamento + alta margem)"
        >
          <ScatterChart
            datasets={scatterSeries}
            xFmt={v => brl(v)}
            yFmt={v => v + '%'}
            height={380}
          />
        </ChartCard>

        <ChartCard
          title="Evolução de Receita por Loja e Mês"
          hint="Barras agrupadas — comparativo mensal entre unidades"
          span
        >
          <BarChart
            labels={ma.map(fMes)}
            datasets={LOJAS.map((l, i) => ({
              label: l.replace('Araújo ', ''),
              data: ma.map(m => Math.round(mm[m]?.[l] || 0)),
              backgroundColor: LCOL[i],
              borderRadius: 6,
              barPercentage: 0.7,
            }))}
            legend
            yFmt={v => brl(v)}
            height={360}
          />
        </ChartCard>
      </div>
    </>
  );
}
