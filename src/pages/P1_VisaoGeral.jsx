// src/pages/P1_VisaoGeral.jsx
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
const CCAT = [COLORS.red, '#FF4455', '#FF7080', 'rgba(232,0,13,.52)', 'rgba(232,0,13,.32)', COLORS.white, COLORS.w2, COLORS.gray, '#2E2E46'];

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

  // Timeline
  const wks = semanas(vendas);
  const byLj = recSemanal(vendas);
  const lineSeries = LOJAS.map((l, i) => ({
    label: l.replace('Araújo ', ''),
    data: wks.map(w => Math.round(byLj[l]?.[w] || 0)),
    borderColor: LCOL[i],
    backgroundColor: i === 0 ? COLORS.redD : 'transparent',
    fill: i === 0,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 2.5,
    pointHoverRadius: 5,
    pointBackgroundColor: LCOL[i]
  }));

  // Revenue by store (horizontal bar)
  const byLoja = aggVendas(vendas, 'loja');
  const barSeries = [{
    data: byLoja.map(d => d.rec),
    backgroundColor: byLoja.map(d => d.label.includes('Norte') ? COLORS.norte : d.label.includes('Sul') ? COLORS.sul : COLORS.red),
    borderRadius: 6,
    borderSkipped: false,
    barThickness: 28
  }];

  // Donut - mix by category
  const top8 = cats.slice(0, 8);
  const outRec = cats.slice(8).reduce((a, d) => a + d.rec, 0);
  const dLbl = [...top8.map(d => d.label), 'Outros'];
  const dVal = [...top8.map(d => d.rec), outRec];
  const tot = dVal.reduce((a, b) => a + b, 0);

  // DOW
  const DOW_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const dm = {};
  vendas.forEach(v => { dm[v.dow] = (dm[v.dow] || 0) + v.rec; });
  const dowData = DOW_LABELS.map(d => Math.round(dm[d] || 0));
  const dowSeries = [{
    data: dowData,
    backgroundColor: DOW_LABELS.map((_, i) => i === 5 ? COLORS.red : i === 6 ? 'rgba(232,0,13,.55)' : 'rgba(255,255,255,.08)'),
    borderRadius: 5,
    borderSkipped: false
  }];

  return (
    <>
      <PageHeader
        badge="Página 1 · Visão Executiva"
        title="Visão Geral<br/>Comercial"
        description="Panorama de faturamento, mix de categorias e sazonalidade do período selecionado."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[14px]">
        <KpiCard label="Receita Líquida" value={brl(rec)} />
        <KpiCard label="Ticket Médio" value={brlFull(tk)} sub="por atendimento" />
        <KpiCard
          label="Margem Bruta"
          value={pct(mgP)}
          sub={mgP < 27 ? '⚠ abaixo do benchmark' : ''}
          alert={mgP < 27}
        />
        <KpiCard label="Top Categoria" value={top.label} sub={brl(top.rec) + ' em receita'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        <ChartCard title="Receita Semanal por Loja" hint="Tendência — semana a semana por unidade">
          <LineChart
            labels={wks.map(w => dataCurta(w))}
            datasets={lineSeries}
            yFmt={v => brl(v)}
            legend
          />
        </ChartCard>

        <ChartCard title="Participação por Loja" hint="Receita total acumulada no período">
          <BarChart
            labels={byLoja.map(d => d.label.replace('Araújo ', ''))}
            datasets={barSeries}
            horiz
            xFmt={v => brl(v)}
          />
        </ChartCard>

        <ChartCard title="Mix de Receita por Categoria" hint="Distribuição proporcional do faturamento">
          <div className="flex items-center gap-[16px] flex-wrap">
            <div className="flex-0 w-[170px]">
              <DonutChart
                labels={dLbl}
                data={dVal}
                colors={CCAT}
                ttFmt={ctx => ` ${ctx.label}: ${brl(ctx.raw)} (${((ctx.raw / tot) * 100).toFixed(1)}%)`}
              />
            </div>
            <div className="flex-1 flex flex-wrap gap-x-[16px] gap-y-[6px]">
              {dLbl.slice(0, 7).map((l, i) => (
                <div key={l} className="flex items-center gap-[6px] text-[11px] text-text-2">
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: CCAT[i] }}
                  />
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Receita por Dia da Semana" hint="Sábado e domingo destacados em vermelho">
          <BarChart
            labels={DOW_LABELS}
            datasets={dowSeries}
            yFmt={v => brl(v)}
          />
        </ChartCard>
      </div>
    </>
  );
}
