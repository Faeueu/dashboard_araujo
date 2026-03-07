// src/components/Charts.js
// Wrapper Chart.js — defaults do sistema + factory functions
// Gerencia instâncias para evitar memory leak ao re-renderizar.

export const P = {
  red:     '#dc2626',
  redDim:  'rgba(220,38,38,.08)',
  red2:    '#ef4444',
  white:   '#0F172A', // Changed to dark for contrast in light theme
  white2:  '#475569', // Changed to dark gray
  gray:    '#94A3B8',
  gray2:   '#CBD5E1',
  centro:  '#dc2626',
  norte:   '#cbd5e1', 
  sul:     '#334155',
  grid:    'rgba(0,0,0,0.06)', // Dark grid lines with low opacity
};

const _inst = new Map();

export function applyDefaults(Chart) {
  const font = "'Figtree', system-ui, sans-serif";
  Chart.defaults.font.family                            = font;
  Chart.defaults.font.size                              = 12.5;
  Chart.defaults.color                                  = '#64748b'; // Slate 500
  Chart.defaults.plugins.legend.display                 = false;
  Chart.defaults.plugins.tooltip.backgroundColor        = '#ffffff'; // Light tooltip
  Chart.defaults.plugins.tooltip.borderColor            = '#e2e8f0';
  Chart.defaults.plugins.tooltip.borderWidth            = 1;
  Chart.defaults.plugins.tooltip.padding                = 12;
  Chart.defaults.plugins.tooltip.cornerRadius           = 8;
  Chart.defaults.plugins.tooltip.displayColors          = true;
  Chart.defaults.plugins.tooltip.boxPadding             = 6;
  Chart.defaults.plugins.tooltip.titleColor             = '#0f172a';
  Chart.defaults.plugins.tooltip.bodyColor              = '#334155';
  Chart.defaults.plugins.tooltip.titleFont              = { family: font, weight: '700', size: 13.5 };
  Chart.defaults.plugins.tooltip.bodyFont               = { family: font, size: 12.5 };
  Chart.defaults.plugins.tooltip.bodySpacing            = 6;
}

function mk(id, cfg) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  if (_inst.has(id)) { _inst.get(id).destroy(); _inst.delete(id); }
  const c = new Chart(canvas, cfg);
  _inst.set(id, c);
  return c;
}

export function destroyAll() {
  _inst.forEach(c => c.destroy());
  _inst.clear();
}

// ── Factory helpers ──────────────────────────────────────────────

const scaleX = (cb) => ({ grid: { color: P.grid }, ticks: { color: '#44445A', font: { size: 10.5 }, maxRotation: 40, callback: cb } });
const scaleY = (cb, min, max) => ({ grid: { color: P.grid }, ticks: { color: '#44445A', font: { size: 10.5 }, callback: cb }, min, max });
const scaleYClean = (cb) => ({ grid: { display: false }, ticks: { color: P.white2, font: { size: 10.5 }, callback: cb } });
const scaleXClean = (cb) => ({ grid: { color: P.grid }, ticks: { color: '#44445A', font: { size: 10.5 }, callback: cb } });
const legendOpts = { display: true, labels: { color: P.white2, boxWidth: 10, boxHeight: 10, padding: 16, font: { size: 11 } } };

export function lineChart(id, { labels, datasets, yFmt, yMin, yMax, legend = false, maxTicks = 10 }) {
  return mk(id, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: legend ? legendOpts : { display: false } },
      scales: {
        x: { ...scaleX(), ticks: { ...scaleX().ticks, maxTicksLimit: maxTicks } },
        y: scaleY(yFmt, yMin, yMax),
      },
    },
  });
}

export function barChart(id, { labels, datasets, horizontal = false, yFmt, xFmt, legend = false }) {
  return mk(id, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true, maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: legend ? legendOpts : { display: false } },
      scales: horizontal
        ? { x: scaleXClean(xFmt), y: scaleYClean() }
        : { x: { grid: { display: false }, ticks: { color: P.white2, font: { size: 10.5 } } }, y: scaleY(yFmt) },
    },
  });
}

export function donutChart(id, { labels, data, colors, cutout = '64%', ttFmt }) {
  return mk(id, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 1.5, borderColor: '#16161E', hoverOffset: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: true,
      cutout,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const p     = ((ctx.raw / total) * 100).toFixed(1);
              return ttFmt ? ttFmt(ctx) : ` ${ctx.label}: ${p}%`;
            },
          },
        },
      },
    },
  });
}

export function scatterChart(id, { datasets, xFmt, yFmt }) {
  return mk(id, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: { x: scaleY(xFmt), y: scaleY(yFmt) },
    },
  });
}

export function dualChart(id, { labels, barDs, lineDs }) {
  return mk(id, {
    type: 'bar',
    data: { labels, datasets: [barDs, lineDs] },
    options: {
      responsive: true, maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: legendOpts },
      scales: {
        x:  { grid: { display: false }, ticks: { color: P.white2, font: { size: 10.5 } } },
        y:  scaleY(barDs.yFmt),
        y2: { position: 'right', grid: { display: false }, ticks: { color: P.white2, font: { size: 10.5 }, callback: lineDs.yFmt } },
      },
    },
  });
}

export function radarChart(id, { labels, datasets }) {
  return mk(id, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: legendOpts },
      scales: {
        r: {
          angleLines: { color: 'rgba(255,255,255,.07)' },
          grid:        { color: 'rgba(255,255,255,.1)' },
          pointLabels: { color: P.white2, font: { size: 11, family: "'Figtree','DM Sans',system-ui,sans-serif" } },
          ticks:       { color: '#44445A', backdropColor: 'transparent', stepSize: 25, font: { size: 9 } },
          min: 0, max: 120,
        },
      },
    },
  });
}
