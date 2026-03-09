// src/pages/P5_Rupturas.jsx — Análise de Rupturas
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { DonutChart, BarChart, MixedChart, COLORS } from '../components/Charts.jsx';
import { sum, aggRupturas } from '../utils/filters.js';
import { brl, num, mes as fmtMes } from '../utils/fmt.js';

const MESES_ORD = ['2025-12', '2026-01', '2026-02', '2026-03'];
const MOTIVO_COLORS = [COLORS.primary, '#EF4444', '#F87171', 'rgba(232,0,13,0.48)', 'rgba(232,0,13,0.28)'];

export default function P5_Rupturas() {
  const data = useFilteredData();
  if (!data) return null;

  const { rupturas } = data;
  const perd = sum(rupturas, 'perdida');
  const porMotiv = aggRupturas(rupturas, 'motivo').sort((a, b) => b.count - a.count);
  const porCat = aggRupturas(rupturas, 'cat');
  const topM = porMotiv[0] || { label: '—', count: 0 };
  const topC = porCat[0] || { label: '—', perdida: 0 };

  // Monthly dual axis
  const mm = {};
  rupturas.forEach(r => {
    if (!mm[r.mes]) mm[r.mes] = { count: 0, perd: 0 };
    mm[r.mes].count++;
    mm[r.mes].perd += r.perdida;
  });
  const ma = MESES_ORD.filter(m => mm[m]);

  const mixedSeries = [
    {
      name: 'Qtd Rupturas',
      type: 'bar',
      data: ma.map(m => mm[m]?.count || 0),
      color: 'rgba(220,38,38,0.12)',
    },
    {
      name: 'Receita Perdida',
      type: 'line',
      data: ma.map(m => Math.round(mm[m]?.perd || 0)),
      color: COLORS.text1,
    },
  ];

  // Category bar (top 10)
  const top10 = porCat.slice(0, 10);

  return (
    <>
      <PageHeader
        badge="Página 5 · Operacional"
        title="Análise de<br/>Rupturas"
        description="Cada ruptura é receita que foi para o concorrente. Identifique padrões e impacto financeiro."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 stagger">
        <KpiCard label="Receita Perdida" value={brl(perd)} accent={COLORS.primary} />
        <KpiCard label="Eventos" value={num(rupturas.length)} />
        <KpiCard label="Maior Causa" value={topM.label} sub={num(topM.count) + ' eventos'} />
        <KpiCard label="Cat. Mais Afetada" value={topC.label} sub={brl(topC.perdida) + ' perdidos'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger">
        <ChartCard title="Por Motivo">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-shrink-0" style={{ width: 180 }}>
              <DonutChart
                series={porMotiv.map(d => d.count)}
                labels={porMotiv.map(d => d.label)}
                colors={MOTIVO_COLORS}
                height={180}
                tooltipFormatter={(val) => `${val} eventos`}
              />
            </div>
            <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1.5">
              {porMotiv.map((d, i) => (
                <div key={d.label} className="flex items-center gap-1.5 text-[10.5px] text-text-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: MOTIVO_COLORS[i] || '#555' }}
                  />
                  <span>{d.label} ({d.count})</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Rupturas × Receita Perdida por Mês" hint="Dual-axis">
          <MixedChart
            series={mixedSeries}
            categories={ma.map(fmtMes)}
            yFormatter={v => num(v)}
            y2Formatter={v => brl(v)}
          />
        </ChartCard>

        <ChartCard title="Receita Perdida por Categoria" hint="Escala de vermelho por impacto" spanAll>
          <BarChart
            series={[{
              name: 'R$ Perdidos',
              data: top10.map(d => Math.round(d.perdida)),
            }]}
            categories={top10.map(d => d.label)}
            horizontal
            xFormatter={v => brl(v)}
            height={Math.max(200, top10.length * 30)}
          />
        </ChartCard>
      </div>
    </>
  );
}
