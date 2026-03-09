// src/pages/P2_Ticket.jsx — Análise do Ticket Médio
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { LineChart, BarChart, COLORS } from '../components/Charts.jsx';
import { sum, ticketSemanal } from '../utils/filters.js';
import { brl, brlFull, dataCurta } from '../utils/fmt.js';

const DOW = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HEATMAP_DATA = {
  'Araújo Centro': [82, 87, 90, 93, 98, 112, 107],
  'Araújo Norte': [88, 93, 97, 100, 105, 120, 114],
  'Araújo Sul': [79, 84, 88, 91, 96, 110, 104],
};

function buildHeatmapColor(v, mn, mx) {
  const t = (v - mn) / (mx - mn);
  if (t < 0.5) {
    const s = t * 2;
    return `rgb(${Math.round(14 + s * 215)}, ${Math.round(s * 4)}, ${Math.round(s * 4)})`;
  } else {
    const s = (t - 0.5) * 2;
    return `rgb(${Math.round(228 + s * 27)}, ${Math.round(s * 215)}, ${Math.round(s * 215)})`;
  }
}

export default function P2_Ticket() {
  const data = useFilteredData();
  if (!data) return null;

  const { vendas, atend } = data;
  const fat = sum(atend, 'fat');
  const atd = sum(atend, 'atd');
  const tk = atd > 0 ? fat / atd : 0;

  // Campaign analysis
  const campMap = {};
  vendas.forEach(v => {
    if (v.camp === 'Sem Campanha') return;
    if (!campMap[v.camp]) campMap[v.camp] = { rec: 0, tx: 0 };
    campMap[v.camp].rec += v.rec;
    campMap[v.camp].tx += v.tx;
  });
  const camps = Object.entries(campMap)
    .map(([k, v]) => ({ label: k, tp: v.tx > 0 ? v.rec / v.tx : 0 }))
    .sort((a, b) => b.tp - a.tp);
  const topCamp = camps[0] || { label: '—', tp: 0 };

  // Best day
  const dm = {};
  vendas.forEach(v => { dm[v.dow] = (dm[v.dow] || 0) + v.rec; });
  const melhor = DOW.reduce((b, d) => (dm[d] || 0) > (dm[b] || 0) ? d : b, DOW[0]);

  // Weekly ticket line chart
  const tkS = ticketSemanal(atend);
  const lineSeries = [
    {
      name: 'Ticket Médio',
      data: tkS.map(d => +d.ticket.toFixed(2)),
      color: COLORS.primary,
    },
    {
      name: 'Meta R$96,60',
      data: Array(tkS.length).fill(96.60),
      color: COLORS.text4,
    },
  ];

  // Campaign bar chart (sorted asc)
  const cSort = [...camps].sort((a, b) => a.tp - b.tp);

  // Heatmap
  const allVals = Object.values(HEATMAP_DATA).flat();
  const mn = Math.min(...allVals);
  const mx = Math.max(...allVals);

  return (
    <>
      <PageHeader
        badge="Página 2 · Estratégico"
        title="Análise do<br/>Ticket Médio"
        description="Maior alavanca de faturamento sem aumentar clientes. Entenda o que eleva o ticket."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 stagger">
        <KpiCard label="Ticket Médio" value={brlFull(tk)} />
        <KpiCard label="Melhor Campanha" value={topCamp.label} sub={brlFull(topCamp.tp) + '/tx'} />
        <KpiCard label="Melhor Dia" value={melhor} sub={brl(dm[melhor] || 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger">
        <ChartCard title="Ticket Semanal vs Meta" hint="Linha real vs meta R$96,60 tracejada">
          <LineChart
            series={lineSeries}
            categories={tkS.map(d => dataCurta(d.week))}
            yFormatter={v => brl(v)}
            yMin={88}
            yMax={108}
            legend
          />
        </ChartCard>

        <ChartCard title="Receita Média por Campanha" hint="R$ por transação — ordenado asc">
          <BarChart
            series={[{
              name: 'R$/tx',
              data: cSort.map(d => Math.round(d.tp)),
            }]}
            categories={cSort.map(d => d.label)}
            horizontal
            xFormatter={v => brl(v)}
            height={220}
          />
        </ChartCard>

        <ChartCard title="Heatmap Loja × Dia da Semana" hint="Ticket estimado — vermelho=baixo, branco=alto" spanAll>
          <div className="overflow-x-auto mt-2">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>Loja</th>
                  {DOW.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(HEATMAP_DATA).map(([loja, vals]) => (
                  <tr key={loja}>
                    <td className="heatmap-loja">{loja}</td>
                    {vals.map((v, i) => {
                      const bg = buildHeatmapColor(v, mn, mx);
                      const tc = v > (mn + mx) / 2 ? '#000' : '#fff';
                      return (
                        <td key={i} style={{ background: bg, color: tc }}>
                          R${v}
                        </td>
                      );
                    })}
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
