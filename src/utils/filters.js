// src/utils/filters.js — Funções puras de agregação (sem efeitos colaterais)

// Soma um campo numérico
export const sum = (rows, k) => rows.reduce((a, r) => a + (r[k] || 0), 0);

// Agrupa por campo → Map<key, rows[]>
export function groupBy(rows, k) {
  const m = new Map();
  for (const r of rows) {
    const key = r[k];
    if (!m.has(key)) m.set(key, []);
    m.get(key).push(r);
  }
  return m;
}

// Valores únicos de um campo, ordenados
export function uniq(rows, k) {
  return [...new Set(rows.map(r => r[k]).filter(Boolean))].sort();
}

// Agrega vendas por campo → [{label, rec, mg, tx}] ordenado desc por rec
export function aggVendas(rows, campo) {
  const m = {};
  for (const r of rows) {
    const k = r[campo] || '—';
    if (!m[k]) m[k] = { label: k, rec: 0, mg: 0, tx: 0 };
    m[k].rec += r.rec;
    m[k].mg  += r.mg;
    m[k].tx  += r.tx;
  }
  return Object.values(m).sort((a, b) => b.rec - a.rec);
}

// Margem % por categoria → [{label, pct, rec}] ordenado desc por pct
export function margemPorCat(vendas) {
  const m = {};
  for (const v of vendas) {
    const k = v.cat;
    if (!m[k]) m[k] = { label: k, rec: 0, mg: 0 };
    m[k].rec += v.rec;
    m[k].mg  += v.mg;
  }
  return Object.values(m)
    .map(d => ({ ...d, pct: d.rec > 0 ? (d.mg / d.rec) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct);
}

// Ticket médio semanal de atendimentos → [{week, ticket}]
export function ticketSemanal(atend) {
  const m = {};
  for (const a of atend) {
    const w = wk(a.data);
    if (!m[w]) m[w] = { fat: 0, atd: 0 };
    m[w].fat += a.fat;
    m[w].atd += a.atd;
  }
  return Object.entries(m)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([w, d]) => ({ week: w, ticket: d.atd > 0 ? d.fat / d.atd : 0 }));
}

// Receita semanal por loja → { loja: { week: valor } }
export function recSemanal(vendas) {
  const m = {};
  for (const v of vendas) {
    const w = wk(v.data);
    if (!m[v.loja]) m[v.loja] = {};
    m[v.loja][w] = (m[v.loja][w] || 0) + v.rec;
  }
  return m;
}

// Semanas únicas de vendas → string[] sorted
export function semanas(vendas) {
  return [...new Set(vendas.map(v => wk(v.data)))].sort();
}

// Rupturas por campo → [{label, count, perdida}] desc por perdida
export function aggRupturas(rows, campo) {
  const m = {};
  for (const r of rows) {
    const k = r[campo] || 'Outros';
    if (!m[k]) m[k] = { label: k, count: 0, perdida: 0 };
    m[k].count++;
    m[k].perdida += r.perdida;
  }
  return Object.values(m).sort((a, b) => b.perdida - a.perdida);
}

// Distribuição de cobertura em faixas
export function coberturaFaixas(estoque) {
  const f = { '0–7d': 0, '8–15d': 0, '16–30d': 0, '31–60d': 0, '60d+': 0 };
  for (const e of estoque) {
    const c = e.cob;
    if      (c <=  7) f['0–7d']++;
    else if (c <= 15) f['8–15d']++;
    else if (c <= 30) f['16–30d']++;
    else if (c <= 60) f['31–60d']++;
    else              f['60d+']++;
  }
  return f;
}

// Contagem de status do estoque
export function statusEstoque(estoque) {
  const m = {};
  for (const e of estoque) m[e.status] = (m[e.status] || 0) + 1;
  return m;
}

// Status por categoria → [{cat, Ruptura, Crítico, Abaixo_Mínimo, Normal, total}]
export function statusPorCat(estoque) {
  const m = {};
  for (const e of estoque) {
    if (!m[e.cat]) m[e.cat] = { cat: e.cat, Ruptura: 0, Crítico: 0, Abaixo_Mínimo: 0, Normal: 0 };
    m[e.cat][e.status] = (m[e.cat][e.status] || 0) + 1;
  }
  return Object.values(m)
    .map(d => ({ ...d, total: d.Ruptura + d.Crítico + d.Abaixo_Mínimo }))
    .sort((a, b) => b.total - a.total);
}

// Data → domingo da semana seguinte (agrupa semanas)
export function wk(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const rem = 7 - d.getDay();
  d.setDate(d.getDate() + rem);
  return d.toISOString().slice(0, 10);
}

// Ordem dos meses para o dashboard
export const MORD = ['2025-12', '2026-01', '2026-02', '2026-03'];

