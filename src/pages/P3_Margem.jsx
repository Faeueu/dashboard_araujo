// src/pages/P3_Margem.jsx — Margem & Mix de Produtos
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, ScatterChart, COLORS } from '../components/Charts.jsx';
import { sum, margemPorCat, aggVendas } from '../utils/filters.js';
import { brl, pct, mes as fmtMes } from '../utils/fmt.js';

const MESES_ORD = ['2025-12', '2026-01', '2026-02', '2026-03'];
const LOJAS = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
const LCOL = [COLORS.centro, COLORS.norte, COLORS.sul];

export default function P3_Margem() {
  const data = useFilteredData();
  if (!data) return null;

  const { vendas } = data;
  const rec = sum(vendas, 'rec');
  const mg = sum(vendas, 'mg');
  const mgP = rec > 0 ? (mg / rec) * 100 : 0;
  const cm = margemPorCat(vendas);
  const mel = cm[0] || { label: '—', pct: 0 };
  const por = cm[cm.length - 1] || { label: '—', pct: 0 };

  // Margin bar colors
  const marginBarColors = cm.map(d =>
    d.pct >= 40 ? COLORS.primary : d.pct >= 30 ? COLORS.primarySoft : d.pct >= 23 ? 'rgba(15,23,42,0.15)' : 'rgba(15,23,42,0.06)'
  );

  // Scatter data
  const scatterSeries = cm.map(d => ({
    name: d.label,
    data: [[d.rec, +d.pct.toFixed(1)]],
    color: d.pct >= 40 ? COLORS.primary : d.pct >= 30 ? COLORS.primarySoft : 'rgba(15,23,42,0.25)',
  }));

  // Month × Store grouped bar
  const mesMap = {};
  vendas.forEach(v => {
    if (!mesMap[v.mes]) mesMap[v.mes] = {};
    mesMap[v.mes][v.loja] = (mesMap[v.mes][v.loja] || 0) + v.rec;
  });
  const ma = MESES_ORD.filter(m => mesMap[m]);
  const mesBarSeries = LOJAS.map((l, i) => ({
    name: l.replace('Araújo ', ''),
    data: ma.map(m => Math.round(mesMap[m]?.[l] || 0)),
    color: LCOL[i],
  }));

  return (
    <>
      <PageHeader
        badge="Página 3"
        title="Margem &amp;<br/>Mix de Produtos"
        description="Não basta vender muito — é preciso vender bem. Rentabilidade por categoria."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 stagger">
        <KpiCard label="Margem Bruta %" value={pct(mgP)} />
        <KpiCard label="Margem Bruta R$" value={brl(mg)} />
        <KpiCard label="Maior Margem" value={mel.label} sub={pct(mel.pct)} />
        <KpiCard label="Menor Margem" value={por.label} sub={pct(por.pct)} accent={COLORS.primary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger">
        <ChartCard title="% Margem por Categoria" hint="Ordenado desc — vermelho <25%">
          <BarChart
            series={[{
              name: 'Margem %',
              data: cm.map(d => +d.pct.toFixed(1)),
            }]}
            categories={cm.map(d => d.label)}
            horizontal
            xFormatter={v => v + '%'}
            height={Math.max(200, cm.length * 28)}
          />
        </ChartCard>

        <ChartCard title="Receita × Margem (Scatter)" hint="Quadrante ideal: alto-direita">
          <ScatterChart
            series={scatterSeries}
            xFormatter={v => brl(v)}
            yFormatter={v => v + '%'}
          />
        </ChartCard>

        <ChartCard title="Receita por Loja × Mês" hint="Evolução mensal agrupada" spanAll>
          <BarChart
            series={mesBarSeries}
            categories={ma.map(fmtMes)}
            yFormatter={v => brl(v)}
            legend
            height={260}
          />
        </ChartCard>
      </div>
    </>
  );
}
