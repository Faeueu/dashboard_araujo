// src/pages/P6_Metas.jsx — Painel de Metas
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, RadarChart, COLORS } from '../components/Charts.jsx';
import { sum } from '../utils/filters.js';
import { brl, pct, mes as fmtMes } from '../utils/fmt.js';

const MESES_ORD = ['2025-12', '2026-01', '2026-02', '2026-03'];
const LOJAS = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
const LCOL = [COLORS.centro, COLORS.norte, COLORS.sul];

export default function P6_Metas() {
  const data = useFilteredData();
  if (!data) return null;

  const { vendas, atend, metas } = data;
  const fat = sum(atend, 'fat');
  const atd = sum(atend, 'atd');
  const tk = atd > 0 ? fat / atd : 0;
  const metaTk = metas.length ? sum(metas, 'meta_ticket') / metas.length : 96.60;
  const atTk = metaTk > 0 ? (tk / metaTk) * 100 : 0;

  // Revenue by month × store
  const mm = {};
  vendas.forEach(v => {
    if (!mm[v.mes]) mm[v.mes] = {};
    mm[v.mes][v.loja] = (mm[v.mes][v.loja] || 0) + v.rec;
  });
  const ma = MESES_ORD.filter(m => mm[m]);

  // Best month & store
  const totMes = ma
    .map(m => ({ mes: m, tot: LOJAS.reduce((a, l) => a + (mm[m]?.[l] || 0), 0) }))
    .sort((a, b) => b.tot - a.tot)[0];
  const totLoja = LOJAS
    .map(l => ({ loja: l, tot: ma.reduce((a, m) => a + (mm[m]?.[l] || 0), 0) }))
    .sort((a, b) => b.tot - a.tot)[0];

  // Revenue bar series
  const revSeries = LOJAS.map((l, i) => ({
    name: l.replace('Araújo ', ''),
    data: ma.map(m => Math.round(mm[m]?.[l] || 0)),
    color: LCOL[i],
  }));

  // Achievement bar
  const metaMap = {};
  metas.forEach(m => {
    if (!metaMap[m.mes]) metaMap[m.mes] = {};
    metaMap[m.mes][m.loja] = m.meta_fat;
  });

  const atingSeries = LOJAS.map(l => {
    const vals = ma.map(m => {
      const r = mm[m]?.[l] || 0;
      const mt = metaMap[m]?.[l] || 1;
      return +((r / mt) * 100).toFixed(1);
    });
    return { name: l.replace('Araújo ', ''), data: vals };
  });

  // Radar
  const radarSeries = [
    { name: 'Centro', data: [68, 104, 96, 87, 93], color: COLORS.centro },
    { name: 'Norte', data: [73, 108, 98, 90, 91], color: COLORS.norte },
    { name: 'Sul', data: [70, 102, 94, 85, 94], color: COLORS.sul },
  ];

  return (
    <>
      <PageHeader
        badge="Página 6 · Executivo"
        title="Painel de<br/>Metas"
        description="Visão gerencial de atingimento. Semáforo claro para tomada de decisão rápida."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 stagger">
        <KpiCard label="Ating. Ticket Médio" value={pct(atTk, 0)} sub={`Meta R$${metaTk.toFixed(0)}`} />
        <KpiCard
          label="Melhor Mês"
          value={totMes ? fmtMes(totMes.mes) : '—'}
          sub={totMes ? brl(totMes.tot) : ''}
        />
        <KpiCard
          label="Melhor Loja"
          value={totLoja ? totLoja.loja.replace('Araújo ', '') : '—'}
          sub={totLoja ? brl(totLoja.tot) : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger">
        <ChartCard title="Receita Real por Loja × Mês" hint="Barras agrupadas — período selecionado" spanAll>
          <BarChart
            series={revSeries}
            categories={ma.map(fmtMes)}
            yFormatter={v => brl(v)}
            legend
            height={260}
          />
        </ChartCard>

        <ChartCard title="% Atingimento por Loja × Mês" hint="≥95%=Verde · 80–95%=Cinza · <80%=Vermelho">
          <BarChart
            series={atingSeries}
            categories={ma.map(fmtMes)}
            yFormatter={v => v + '%'}
            legend
          />
        </ChartCard>

        <ChartCard title="Radar de Performance" hint="5 dimensões · escala 0–120">
          <RadarChart
            series={radarSeries}
            categories={['Faturamento', 'Ticket Médio', 'Margem Bruta', 'Giro Estoque', 'Anti-Ruptura']}
            height={320}
          />
        </ChartCard>
      </div>
    </>
  );
}
