// src/pages/P5_Rupturas.jsx
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { DonutChart, DualChart, BarChart, COLORS } from '../components/Charts.jsx';
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
  if (!data) return null;

  const { rupturas } = data;

  const perd = sum(rupturas, 'perdida');
  const itemsM = aggR(rupturas, 'motivo').sort((a, b) => b.n - a.n);
  const itemsC = aggR(rupturas, 'cat');
  const topM = itemsM[0] || { label: '—', n: 0 };
  const topC = itemsC[0] || { label: '—', p: 0 };

  const MC = [COLORS.red, '#FF4455', '#FF7080', 'rgba(232,0,13,.5)', 'rgba(232,0,13,.28)'];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mb-[14px]">
        <KpiCard label="Receita Total Perdida" value={brl(perd)} sub="receita estimada" alert={perd > 0} />
        <KpiCard label="Eventos de Ruptura" value={num(rupturas.length)} sub="eventos registrados" />
        <KpiCard label="Principal Causa" value={topM.label} sub={num(topM.n) + ' ocorrências'} />
        <KpiCard label="Categoria Mais Afetada" value={topC.label} sub={brl(topC.p) + ' perdidos'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        <ChartCard title="Rupturas por Motivo" hint="Distribuição de causas — quantidade de eventos">
          <div className="flex items-center gap-[16px] flex-wrap mt-[6px]">
            <div className="flex-0 w-[170px]">
              <DonutChart
                labels={itemsM.map(d => d.label)}
                data={itemsM.map(d => d.n)}
                colors={MC}
                cutout="60%"
                ttFmt={ctx => ` ${ctx.label}: ${ctx.raw} eventos`}
              />
            </div>
            <div className="flex-1 flex flex-wrap gap-[6px_16px]">
              {itemsM.map((d, i) => (
                <div key={d.label} className="flex items-center gap-[6px] text-[11px] text-text-2">
                  <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: MC[i] || '#555' }}></span>
                  <span>{d.label} <span className="font-mono text-[9.5px] text-text-3">({d.n})</span></span>
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
              backgroundColor: 'rgba(232,0,13,.12)',
              borderColor: COLORS.red,
              borderWidth: 1,
              borderRadius: 5,
              yAxisID: 'y',
              yFmt: v => num(v)
            }}
            lDs={{
              type: 'line',
              label: 'Receita Perdida',
              data: ma.map(m => Math.round(mm[m]?.p || 0)),
              borderColor: COLORS.white,
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              pointRadius: 4,
              tension: 0.3,
              yAxisID: 'y2',
              yFmt: v => brl(v)
            }}
          />
        </ChartCard>

        <ChartCard title="Impacto Financeiro por Categoria" hint="Receita perdida estimada — ordenado por impacto" span>
          <BarChart
            labels={top10.map(d => d.label)}
            datasets={[{
              data: top10.map(d => Math.round(d.p)),
              backgroundColor: top10.map((_, i) => `rgba(232,0,13,${(1 - i * 0.08).toFixed(2)})`),
              borderRadius: 5,
              borderSkipped: false,
              barThickness: 20
            }]}
            horiz
            xFmt={v => brl(v)}
          />
        </ChartCard>
      </div>
    </>
  );
}
