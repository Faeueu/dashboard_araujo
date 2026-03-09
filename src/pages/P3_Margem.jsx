// src/pages/P3_Margem.jsx
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, ScatterChart, COLORS } from '../components/Charts.jsx';
import { sum, aggVendas, MORD } from '../utils/filters.js';
import { brl, pct, mes as fMes } from '../utils/fmt.js';

const LOJAS = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
const LCOL = [COLORS.centro, COLORS.norte, COLORS.sul];

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
  if (!data) return null;

  const { vendas } = data;

  const rec = sum(vendas, 'rec');
  const mg = sum(vendas, 'mg');
  const mgP = rec > 0 ? (mg / rec) * 100 : 0;
  
  const cm = mgCat(vendas);
  const mel = cm[0] || { label: '—', pct: 0 };
  const pior = cm[cm.length - 1] || { label: '—', pct: 0 };

  const barSeries = [{
    data: cm.map(d => +d.pct.toFixed(1)),
    backgroundColor: cm.map(d => d.pct >= 40 ? COLORS.red : d.pct >= 30 ? 'rgba(232,0,13,.44)' : d.pct >= 23 ? 'rgba(255,255,255,.17)' : 'rgba(255,255,255,.07)'),
    borderRadius: 4,
    borderSkipped: false,
    barThickness: 16
  }];

  const scatterSeries = cm.map(d => ({
    label: d.label,
    data: [{ x: d.rec, y: +d.pct.toFixed(1) }],
    backgroundColor: d.pct >= 40 ? COLORS.red : d.pct >= 30 ? 'rgba(232,0,13,.44)' : 'rgba(255,255,255,.26)',
    pointRadius: 10,
    pointHoverRadius: 12
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[14px]">
        <KpiCard label="% Margem Bruta" value={pct(mgP)} sub={mgP >= 29 ? '✓ acima do benchmark' : '⚠ atenção'} />
        <KpiCard label="Margem Bruta R$" value={brl(mg)} />
        <KpiCard label="Maior Margem" value={mel.label} sub={pct(mel.pct)} />
        <KpiCard label="Menor Margem" value={pior.label} sub={pct(pior.pct)} alert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        <ChartCard title="Margem Bruta % por Categoria" hint="Ordenado desc — vermelho = abaixo de 25%">
          <BarChart
            labels={cm.map(d => d.label)}
            datasets={barSeries}
            horiz
            xFmt={v => v + '%'}
          />
        </ChartCard>

        <ChartCard title="Receita vs Margem por Categoria" hint="Quadrante ideal: direita-alto (alto faturamento + alta margem)">
          <ScatterChart
            datasets={scatterSeries}
            xFmt={v => brl(v)}
            yFmt={v => v + '%'}
          />
        </ChartCard>

        <ChartCard title="Evolução de Receita por Loja e Mês" hint="Barras agrupadas — comparativo mensal entre unidades" span>
          <BarChart
            labels={ma.map(fMes)}
            datasets={LOJAS.map((l, i) => ({
              label: l.replace('Araújo ', ''),
              data: ma.map(m => Math.round(mm[m]?.[l] || 0)),
              backgroundColor: [COLORS.centro, COLORS.norte, COLORS.sul][i],
              borderRadius: 4,
              barPercentage: 0.7
            }))}
            legend
            yFmt={v => brl(v)}
          />
        </ChartCard>
      </div>
    </>
  );
}
