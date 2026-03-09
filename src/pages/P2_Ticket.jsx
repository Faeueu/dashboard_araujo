// src/pages/P2_Ticket.jsx
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { LineChart, BarChart, COLORS } from '../components/Charts.jsx';
import { sum, wk } from '../utils/filters.js';
import { brl, brlFull, dataCurta } from '../utils/fmt.js';

function tkSem(atend) {
  const m = {};
  for (const a of atend) {
    const w = wk(a.data);
    if (!m[w]) m[w] = { f: 0, a: 0 };
    m[w].f += a.fat;
    m[w].a += a.atd;
  }
  return Object.entries(m)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([w, d]) => ({ w, t: d.a > 0 ? d.f / d.a : 0 }));
}

export default function P2_Ticket() {
  const data = useFilteredData();
  if (!data) return null;

  const { vendas, atend } = data;

  const atd = sum(atend, 'atd');
  const fatAtend = sum(atend, 'fat');
  const tk = atd > 0 ? fatAtend / atd : 0;

  const cm = {};
  vendas.forEach(v => {
    if (v.camp === 'Sem Campanha') return;
    if (!cm[v.camp]) cm[v.camp] = { rec: 0, tx: 0 };
    cm[v.camp].rec += v.rec;
    cm[v.camp].tx += v.tx;
  });
  const camps = Object.entries(cm)
    .map(([k, v]) => ({ label: k, tp: v.tx > 0 ? v.rec / v.tx : 0 }))
    .sort((a, b) => b.tp - a.tp);
  const topC = camps[0] || { label: '—', tp: 0 };

  const DOW_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const dm = {};
  vendas.forEach(v => { dm[v.dow] = (dm[v.dow] || 0) + v.rec; });
  const mel = DOW_LABELS.reduce((b, d) => (dm[d] || 0) > (dm[b] || 0) ? d : b, DOW_LABELS[0]);

  const ts = tkSem(atend);
  const lineSeries = [
    {
      label: 'Ticket Real',
      data: ts.map(d => d.t),
      borderColor: COLORS.red,
      backgroundColor: COLORS.redD,
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: COLORS.red
    },
    {
      label: 'Meta R$96,60',
      data: Array(ts.length).fill(96.60),
      borderColor: COLORS.gray,
      borderDash: [5, 4],
      borderWidth: 2,
      pointRadius: 0
    }
  ];

  const cs = [...camps].sort((a, b) => a.tp - b.tp);
  const barSeries = [{
    data: cs.map(d => Math.round(d.tp)),
    backgroundColor: cs.map(d => d.tp >= 280 ? COLORS.red : d.tp >= 268 ? '#EF4444' : '#CBD5E1'),
    borderRadius: 6,
    borderSkipped: false,
    barThickness: 28
  }];

  const L = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
  const D = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const V = {
    'Araújo Centro': [82, 87, 90, 93, 98, 112, 107],
    'Araújo Norte': [88, 93, 97, 100, 105, 120, 114],
    'Araújo Sul': [79, 84, 88, 91, 96, 110, 104]
  };

  const allV = Object.values(V).flat();
  const mn = Math.min(...allV);
  const mx = Math.max(...allV);

  const hc = v => {
    const t = (v - mn) / (mx - mn);
    if (t < 0.5) {
      const s = t * 2;
      return `rgb(${Math.round(220 + s * 10)},${Math.round(38 + s * 60)},${Math.round(38 + s * 60)})`;
    }
    const s = (t - 0.5) * 2;
    return `rgb(${Math.round(230 + s * 25)},${Math.round(98 + s * 130)},${Math.round(98 + s * 130)})`;
  };

  return (
    <>
      <PageHeader
        badge="Página 2 · Estratégico"
        title="Análise do<br/>Ticket Médio"
        description="Ticket médio é a alavanca mais eficiente: aumenta receita sem precisar de novos clientes."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard label="Ticket Médio Real" value={brlFull(tk)} sub="por atendimento" />
        <KpiCard label="Melhor Campanha" value={topC.label} sub={brlFull(topC.tp) + ' / transação'} />
        <KpiCard label="Dia de Pico" value={mel} sub={brl(dm[mel] || 0) + ' acumulado'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Evolução Semanal do Ticket" hint="Linha real vs meta de R$96,60 (tracejada)">
          <LineChart
            labels={ts.map(d => dataCurta(d.w))}
            datasets={lineSeries}
            yFmt={v => brl(v)}
            yMin={85}
            yMax={112}
            height={340}
            legend
          />
        </ChartCard>

        <ChartCard title="Valor Médio por Campanha" hint="R$ por transação — qual campanha gera mais">
          <BarChart
            labels={cs.map(d => d.label)}
            datasets={barSeries}
            horiz
            xFmt={v => brl(v)}
            height={340}
          />
        </ChartCard>

        <ChartCard title="Heatmap: Loja × Dia da Semana" hint="Ticket estimado — quanto mais claro, maior o ticket" span>
          <div className="tscroll mt-3">
            <table className="hmt">
              <thead>
                <tr>
                  <th>Loja</th>
                  {D.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {L.map(l => (
                  <tr key={l}>
                    <td className="hl">{l.replace('Araújo ', '')}</td>
                    {V[l].map((v, idx) => (
                      <td
                        key={idx}
                        style={{ background: hc(v), color: v > (mn + mx) / 2 ? '#fff' : '#fff' }}
                      >
                        R${v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <div className="ins">
          <div className="ins-title">Cross-sell</div>
          <div className="ins-txt">Campanhas combinando Carnes + Bebidas elevam ticket em 18–25% vs. campanha única.</div>
        </div>
        <div className="ins" style={{ borderLeftColor: 'var(--color-text-2)' }}>
          <div className="ins-title" style={{ color: 'var(--color-text-2)' }}>Sazonalidade</div>
          <div className="ins-txt">Sábado lidera em volume. Segunda é o dia mais fraco — oportunidade para ação promocional.</div>
        </div>
        <div className="ins" style={{ borderLeftColor: 'var(--color-text-3)' }}>
          <div className="ins-title" style={{ color: 'var(--color-text-3)' }}>Mix Premium</div>
          <div className="ins-txt">Perfumaria (43% mg) e Bazar (38% mg) têm alto ticket — ampliar espaço no PDV.</div>
        </div>
      </div>
    </>
  );
}
