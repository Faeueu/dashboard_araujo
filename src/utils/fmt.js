// src/utils/fmt.js  — Formatadores de exibição

const _brl  = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:2, maximumFractionDigits:2 });
const _n0   = new Intl.NumberFormat('pt-BR', { minimumFractionDigits:0, maximumFractionDigits:0 });
const _n1   = new Intl.NumberFormat('pt-BR', { minimumFractionDigits:1, maximumFractionDigits:1 });

export const MES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// R$ compacto: 1.23M / 456k / R$ 99,00
export function brl(v) {
  if (v == null || isNaN(v)) return '—';
  if (v >= 1_000_000) return 'R$ ' + _n1.format(v / 1_000_000) + 'M';
  if (v >= 10_000)    return 'R$ ' + _n0.format(v / 1_000) + 'k';
  return _brl.format(v);
}

// R$ completo
export function brlFull(v) {
  if (v == null || isNaN(v)) return '—';
  return _brl.format(v);
}

const _n2   = new Intl.NumberFormat('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 });

// Percentual  29.61 → "29,61%"
export function pct(v) {
  if (v == null || isNaN(v)) return '—';
  return _n2.format(v) + '%';
}

// Número inteiro  4716 → "4.716"
export function num(v) {
  if (v == null || isNaN(v)) return '—';
  return _n0.format(v);
}

// Mês legível  "2025-12" → "Dez/2025"
export function mes(s) {
  if (!s) return s;
  const [y, m] = s.split('-');
  return `${MES[+m - 1]}/${y}`;
}

// Data curta  "2025-12-15" → "15/12"
export function dataCurta(s) {
  if (!s) return s;
  return s.slice(8) + '/' + s.slice(5, 7);
}

// Delta  3.2 → "<span class='pos'>▲ +3,2%</span>"
export function delta(v, invert = false) {
  if (v == null || isNaN(v)) return '—';
  const good = invert ? v < 0 : v > 0;
  const sign = v > 0 ? '+' : '';
  return `<span class="delta ${good ? 'pos' : 'neg'}">${v > 0 ? '▲' : '▼'} ${sign}${_n1.format(v)}%</span>`;
}
