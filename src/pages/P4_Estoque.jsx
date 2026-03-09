// src/pages/P4_Estoque.jsx — Gestão de Estoque
import { useFilteredData } from '../core/DashboardContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { BarChart, COLORS } from '../components/Charts.jsx';
import { sum, coberturaFaixas, statusEstoque, statusPorCat } from '../utils/filters.js';
import { brl, num } from '../utils/fmt.js';

const STATUS_BARS = [
  { k: 'Ruptura', label: 'Ruptura', color: COLORS.primary },
  { k: 'Crítico', label: 'Crítico', color: COLORS.warning },
  { k: 'Abaixo_Mínimo', label: 'Abaixo Mín.', color: COLORS.text4 },
  { k: 'Normal', label: 'Normal', color: 'rgba(0,0,0,0.06)' },
];

export default function P4_Estoque() {
  const data = useFilteredData();
  if (!data) return null;

  const { estoque } = data;
  const valor = sum(estoque, 'valor');
  const rup = estoque.filter(e => e.status === 'Ruptura').length;
  const abx = estoque.filter(e => e.status === 'Abaixo_Mínimo').length;
  const risc = estoque.filter(e => e.risco_venc === 'Alto').length;
  const tot = estoque.length;
  const st = statusEstoque(estoque);

  // Cobertura
  const cob = coberturaFaixas(estoque);
  const cobKeys = Object.keys(cob);
  const cobColors = cobKeys.map(k =>
    k === '0–7d' ? COLORS.primary : k === '8–15d' ? COLORS.primarySoft : k === '16–30d' ? COLORS.text1 : 'rgba(15,23,42,0.12)'
  );

  // Table rows
  const rows = statusPorCat(estoque).slice(0, 12);

  return (
    <>
      <PageHeader
        badge="Página 4 · Operacional"
        title="Gestão de<br/>Estoque"
        description="Controle de posição, cobertura e alertas de reposição."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 stagger">
        <KpiCard label="Valor em Estoque" value={brl(valor)} />
        <KpiCard label="SKUs em Ruptura" value={num(rup)} accent={COLORS.primary} />
        <KpiCard label="Abaixo do Mínimo" value={num(abx)} />
        <KpiCard label="Risco Venc. Alto" value={num(risc)} accent={COLORS.primary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger">
        <ChartCard title="SKUs por Status" hint="Ruptura=Vermelho · Crítico=Âmbar · Abaixo=Cinza">
          <div className="space-y-2.5 mt-2">
            {STATUS_BARS.map(b => {
              const v = st[b.k] || 0;
              const p = tot > 0 ? ((v / tot) * 100).toFixed(1) : '0';
              return (
                <div key={b.k} className="flex items-center gap-2.5">
                  <span className="w-20 text-right font-mono text-[10px] text-text-3 shrink-0">{b.label}</span>
                  <div className="flex-1 bg-bg rounded h-5 overflow-hidden">
                    <div
                      className="h-full rounded flex items-center pl-2 font-mono text-[10px] font-semibold transition-all duration-500"
                      style={{
                        width: `${Math.max(Number(p), 2)}%`,
                        background: b.color,
                        color: b.k === 'Normal' ? COLORS.text1 : '#fff',
                      }}
                    >
                      {v}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] w-10 shrink-0" style={{ color: b.color }}>{p}%</span>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Cobertura em Dias" hint="Ideal 16–30d · Abaixo de 7d = risco imediato">
          <BarChart
            series={[{
              name: 'SKUs',
              data: Object.values(cob),
            }]}
            categories={cobKeys}
            yFormatter={v => num(v)}
            height={200}
          />
        </ChartCard>

        <ChartCard title="SKUs Críticos por Categoria" hint="Ordenado por total crítico" spanAll>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Ruptura</th>
                  <th>Crítico</th>
                  <th>Abaixo Mín.</th>
                  <th>Normal</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.cat}>
                    <td className="font-semibold text-text-1 text-left">{r.cat}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full ${
                        r.Ruptura > 0
                          ? 'bg-primary-dim text-primary border border-primary/25'
                          : 'bg-green-50 text-green-500 border border-green-200'
                      }`}>
                        {r.Ruptura}
                      </span>
                    </td>
                    <td className="font-mono" style={{ color: COLORS.warning }}>{r.Crítico}</td>
                    <td className="font-mono text-text-3">{r.Abaixo_Mínimo}</td>
                    <td className="font-mono text-text-4">{r.Normal}</td>
                    <td className="font-mono font-bold" style={{
                      color: r.total > 150 ? COLORS.primary : r.total > 80 ? COLORS.warning : COLORS.text3
                    }}>
                      {r.total}
                    </td>
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
