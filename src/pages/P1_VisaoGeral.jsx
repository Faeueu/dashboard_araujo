// src/pages/P1_VisaoGeral.jsx — Visão Geral Comercial
import { useMemo } from 'react';
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { LineChart, BarChart, DonutChart, COLORS } from '../components/Charts.jsx';
import { sum, aggVendas, semanas, recSemanal } from '../utils/filters.js';
import { brl, brlFull, pct, dataCurta } from '../utils/fmt.js';

const LOJAS = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
const LCOL = [COLORS.centro, COLORS.norte, COLORS.sul];
const CAT_COLORS = [
  '#0F172A', // Preto
  COLORS.centro, // Vermelho
  COLORS.sul, // Cinza Escuro
  COLORS.norte, // Cinza Claro
  '#64748B', // Slate
  '#B91C1C', // Vermelho Escuro
  '#94A3B8', // Slate Claro
  '#FCA5A5', // Vermelho Claro
  '#E2E8F0', // Cinza Gelo
];
const DOW_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function P1_VisaoGeral() {
  const data = useFilteredData();
  if (!data) return null;

  const { vendas, atend } = data;

  const rec = sum(vendas, 'rec');
  const mg = sum(vendas, 'mg');
  const fat = sum(atend, 'fat');
  const atd = sum(atend, 'atd');
  const tk = atd > 0 ? fat / atd : 0;
  const mgP = rec > 0 ? (mg / rec) * 100 : 0;
  const cats = aggVendas(vendas, 'cat');
  const top = cats[0] || { label: '—', rec: 0 };

  // Weekly timeline by store
  const wks = semanas(vendas);
  const byLj = recSemanal(vendas);
  const lineSeries = LOJAS.map((l, i) => ({
    name: l.replace('Araújo ', ''),
    data: wks.map(w => Math.round(byLj[l]?.[w] || 0)),
  }));
  const lineColors = LCOL;

  // Revenue by store (horizontal bar)
  const byLoja = aggVendas(vendas, 'loja');
  const barSeries = [{ name: 'Receita', data: byLoja.map(d => d.rec) }];
  const barColors = byLoja.map(d =>
    d.label.includes('Norte') ? COLORS.norte : d.label.includes('Sul') ? COLORS.sul : COLORS.centro
  );

  // Donut - mix by category
  const top8 = cats.slice(0, 8);
  const outRec = cats.slice(8).reduce((a, d) => a + d.rec, 0);
  const dLbl = [...top8.map(d => d.label), 'Outros'];
  const dVal = [...top8.map(d => d.rec), outRec];
  const tot = dVal.reduce((a, b) => a + b, 0);

  // DOW
  const dm = {};
  vendas.forEach(v => { dm[v.dow] = (dm[v.dow] || 0) + v.rec; });
  const dowData = DOW_LABELS.map(d => Math.round(dm[d] || 0));
  const dowColors = DOW_LABELS.map((_, i) =>
    i === 5 ? COLORS.primary : i === 6 ? COLORS.primarySoft : 'rgba(15,23,42,0.08)'
  );

  return (
    <>
      <PageHeader
        badge="Página 1"
        title="Visão Geral<br/>Comercial"
        description="Panorama executivo — faturamento, mix de produto e sazonalidade semanal."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 stagger">
        <KpiCard label="Receita Líquida" value={brl(rec)} />
        <KpiCard label="Ticket Médio" value={brlFull(tk)} />
        <KpiCard
          label="Margem Bruta"
          value={pct(mgP)}
          sub={mgP < 27 ? '⚠ abaixo da meta' : ''}
          accent={mgP < 27 ? COLORS.primary : ''}
        />
        <KpiCard label="Top Categoria" value={top.label} sub={brl(top.rec)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger">
        <ChartCard title="Receita Semanal por Loja" hint="Tendência semanal — 3 lojas">
          <LineChart
            type="area"
            series={lineSeries.map((s, i) => ({
              ...s,
              color: lineColors[i],
            }))}
            categories={wks.map(w => dataCurta(w))}
            yFormatter={v => brl(v)}
            legend
          />
        </ChartCard>

        <ChartCard title="Faturamento por Loja" hint="Participação no período">
          <BarChart
            series={[{
              name: 'Receita',
              data: byLoja.map(d => d.rec),
            }]}
            categories={byLoja.map(d => d.label.replace('Araújo ', ''))}
            horizontal
            colors={barColors}
            xFormatter={v => brl(v)}
            height={200}
          />
        </ChartCard>

        <ChartCard title="Mix por Categoria">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-shrink-0" style={{ width: 180 }}>
              <DonutChart
                series={dVal}
                labels={dLbl}
                colors={CAT_COLORS}
                height={180}
                valueFormatter={(val) => brl(val)}
                tooltipFormatter={(val) => `${brl(val)} (${((val / tot) * 100).toFixed(1)}%)`}
              />
            </div>
            <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1.5">
              {dLbl.slice(0, 7).map((l, i) => (
                <div key={l} className="flex items-center gap-1.5 text-[11px] text-text-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: CAT_COLORS[i] }}
                  />
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Receita por Dia da Semana" hint="Sáb/Dom em destaque">
          <BarChart
            series={[{
              name: 'Receita',
              data: dowData,
            }]}
            categories={DOW_LABELS}
            colors={dowColors}
            yFormatter={v => brl(v)}
            height={200}
          />
        </ChartCard>
      </div>
    </>
  );
}
