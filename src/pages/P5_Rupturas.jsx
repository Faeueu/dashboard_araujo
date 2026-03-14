import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { DonutChart, DualChart, BarChart, useChartColors } from '../components/Charts.jsx';
import { sum, MORD } from '../utils/filters.js';
import { brl, num, mes as fMes } from '../utils/fmt.js';

function aggR(rows, f) {
  const m = {};
  for (const r of rows) {
    const k = r[f] || '—';
    if (!m[k]) m[k] = { label: k, n: 0, p: 0 };
    m[k].n++;
    m[k].p += r.perdida;
  }
  return Object.values(m).sort((a, b) => b.p - a.p);
}

export default function P5_Rupturas() {
  const data = useFilteredData();
  const c = useChartColors();
  if (!data) return null;

  const { rupturas } = data;

  const perd = sum(rupturas, 'perdida');
  const itemsM = aggR(rupturas, 'motivo').sort((a, b) => b.n - a.n);
  const itemsC = aggR(rupturas, 'cat');
  const topM = itemsM[0] || { label: '—', n: 0 };
  const topC = itemsC[0] || { label: '—', p: 0 };

  const MC = [c.red, c.red2, c.red3, c.red4, c.red5];

  const mm = {};
  rupturas.forEach(r => {
    if (!mm[r.mes]) mm[r.mes] = { n: 0, p: 0 };
    mm[r.mes].n++;
    mm[r.mes].p += r.perdida;
  });
  const ma = MORD.filter(m => mm[m]);

  const top10 = itemsC.slice(0, 10);

  return (
    <>
      <PageHeader
        badge="Página 5 · Operacional"
        title="Análise de<br/>Rupturas"
        description="Cada ruptura é venda perdida — e venda que foi para o concorrente. Entenda onde e por quê."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard label="Receita Total Perdida" value={brl(perd)} sub="receita estimada" alert={perd > 0} />
        <KpiCard label="Eventos de Ruptura" value={num(rupturas.length)} sub="eventos registrados" />
        <KpiCard label="Principal Causa" value={topM.label} sub={num(topM.n) + ' ocorrências'} />
        <KpiCard label="Categoria Mais Afetada" value={topC.label} sub={brl(topC.p) + ' perdidos'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Rupturas por Motivo" hint="Distribuição de causas — quantidade de eventos">
          <div className="flex flex-col items-center gap-6 mt-2">
            <div className="w-[240px]">
              <DonutChart
                labels={itemsM.map(d => d.label)}
                data={itemsM.map(d => d.n)}
                colors={MC}
                cutout="58%"
                height={240}
                ttFmt={ctx => ` ${ctx.label}: ${ctx.raw} eventos`}
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {itemsM.map((d, i) => (
                <div key={d.label} className="flex items-center gap-2 text-[13px] text-text-2 font-medium">
                  <span className="w-[10px] h-[10px] rounded-full shrink-0 border-2 border-white shadow-sm" style={{ background: MC[i] || c.bar }}></span>
                  <span>{d.label} <span className="font-mono text-[11px] text-text-3 font-bold">({d.n})</span></span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Rupturas e Receita Perdida por Mês" hint="Barras = quantidade · Linha = impacto financeiro (R$)">
          <DualChart
            labels={ma.map(fMes)}
            bDs={{
              type: 'bar',
              label: 'Qtd Rupturas',
              data: ma.map(m => mm[m]?.n || 0),
              backgroundColor: c.redD,
              borderColor: c.red,
              borderWidth: 1,
              borderRadius: 6,
              yAxisID: 'y',
              yFmt: v => num(v)
            }}
            lDs={{
              type: 'line',
              label: 'Receita Perdida',
              data: ma.map(m => Math.round(mm[m]?.p || 0)),
              borderColor: c.text1,
              backgroundColor: 'transparent',
              borderWidth: 3,
              pointRadius: 5,
              tension: 0.3,
              yAxisID: 'y2',
              yFmt: v => brl(v)
            }}
            height={340}
          />
        </ChartCard>

        <ChartCard title="Impacto Financeiro por Categoria" hint="Receita perdida estimada — ordenado por impacto" span>
          <BarChart
            labels={top10.map(d => d.label)}
            datasets={[{
              data: top10.map(d => Math.round(d.p)),
              backgroundColor: top10.map((_, i) => {
                const opacity = (1 - i * 0.07).toFixed(2);
                return c.isDark
                  ? `rgba(239,68,68,${opacity})`
                  : `rgba(220,38,38,${opacity})`;
              }),
              borderRadius: 6,
              borderSkipped: false,
              barThickness: 26
            }]}
            horiz
            xFmt={v => brl(v)}
            height={400}
          />
        </ChartCard>
      </div>
    </>
  );
}
