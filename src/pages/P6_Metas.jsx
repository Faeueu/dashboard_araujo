// src/pages/P6_Metas.jsx
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, RadarChart, COLORS } from '../components/Charts.jsx';
import { sum, MORD } from '../utils/filters.js';
import { brl, pct, mes as fMes } from '../utils/fmt.js';

const LOJAS = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
const LCOL = [COLORS.centro, COLORS.norte, COLORS.sul];

export default function P6_Metas() {
  const data = useFilteredData();
  if (!data) return null;

  const { vendas, atend, metas } = data;

  const fat = sum(atend, 'fat');
  const atd = sum(atend, 'atd');
  const tk = atd > 0 ? fat / atd : 0;
  const mTk = metas.length ? sum(metas, 'meta_ticket') / metas.length : 96.60;
  const atTk = mTk > 0 ? (tk / mTk) * 100 : 0;

  const mm = {};
  vendas.forEach(v => {
    if (!mm[v.mes]) mm[v.mes] = {};
    mm[v.mes][v.loja] = (mm[v.mes][v.loja] || 0) + v.rec;
  });
  const ma = MORD.filter(m => mm[m]);

  const totM = ma.map(m => ({ mes: m, tot: LOJAS.reduce((a, l) => a + (mm[m]?.[l] || 0), 0) })).sort((a, b) => b.tot - a.tot)[0];
  const totL = LOJAS.map(l => ({ l, tot: ma.reduce((a, m) => a + (mm[m]?.[l] || 0), 0) })).sort((a, b) => b.tot - a.tot)[0];

  const metaM = {};
  metas.forEach(m => {
    if (!metaM[m.mes]) metaM[m.mes] = {};
    metaM[m.mes][m.loja] = m.meta_fat;
  });

  const atCol = v => v >= 95 ? '#16A34A' : v >= 80 ? '#F59E0B' : COLORS.red;

  return (
    <>
      <PageHeader
        badge="Página 6 · Executivo"
        title="Painel de<br/>Metas e Performance"
        description="Visão consolidada de atingimento. Identifique onde agir antes do mês fechar."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard label="Atingimento de Ticket" value={pct(atTk, 0) + ' ating.'} sub={`Meta: R$ ${Math.round(mTk)}`} />
        <KpiCard label="Melhor Mês" value={totM ? fMes(totM.mes) : '—'} sub={totM ? brl(totM.tot) : ''} />
        <KpiCard label="Melhor Loja" value={totL ? totL.l.replace('Araújo ', '') : '—'} sub={totL ? brl(totL.tot) : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Receita Real por Loja e Mês" hint="Comparativo entre unidades — período selecionado" span>
          <BarChart
            labels={ma.map(fMes)}
            datasets={LOJAS.map((l, i) => ({
              label: l.replace('Araújo ', ''),
              data: ma.map(m => Math.round(mm[m]?.[l] || 0)),
              backgroundColor: LCOL[i],
              borderRadius: 6,
              barPercentage: 0.8
            }))}
            legend
            yFmt={v => brl(v)}
            height={360}
          />
        </ChartCard>

        <ChartCard title="% Atingimento da Meta de Faturamento" hint="Verde ≥95% · Amarelo 80–94% · Vermelho <80%">
          <BarChart
            labels={ma.map(fMes)}
            datasets={LOJAS.map((l, i) => {
              const vs = ma.map(m => {
                const r = mm[m]?.[l] || 0;
                const mt = metaM[m]?.[l] || 1;
                return +((r / mt) * 100).toFixed(1);
              });
              return {
                label: l.replace('Araújo ', ''),
                data: vs,
                backgroundColor: vs.map(atCol),
                borderRadius: 6
              };
            })}
            legend
            yFmt={v => v + '%'}
            height={340}
          />
        </ChartCard>

        <ChartCard title="Radar de Performance — 5 Dimensões" hint="Centro vs Norte vs Sul · escala 0–120">
          <RadarChart
            labels={['Faturamento', 'Ticket Médio', 'Margem Bruta', 'Giro de Estoque', 'Anti-Ruptura']}
            datasets={[
              { label: 'Centro', data: [68, 104, 96, 87, 93], borderColor: COLORS.centro, backgroundColor: 'rgba(220,38,38,.08)', borderWidth: 2.5, pointBackgroundColor: COLORS.centro },
              { label: 'Norte', data: [73, 108, 98, 90, 91], borderColor: COLORS.norte, backgroundColor: 'rgba(100,116,139,.06)', borderWidth: 2.5, pointBackgroundColor: COLORS.norte },
              { label: 'Sul', data: [70, 102, 94, 85, 94], borderColor: COLORS.sul, backgroundColor: 'rgba(30,41,59,.06)', borderWidth: 2.5, pointBackgroundColor: COLORS.sul }
            ]}
            height={380}
          />
        </ChartCard>
      </div>
    </>
  );
}
