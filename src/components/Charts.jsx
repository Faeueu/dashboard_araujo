// src/components/Charts.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Scatter, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const font = "'Plus Jakarta Sans', system-ui, sans-serif";

export const COLORS = {
  red: '#E8000D',
  redD: 'rgba(232,0,13,.12)',
  red2: '#FF3344',
  white: '#F0F0F6',
  w2: '#8888A4',
  gray: '#484860',
  gray2: '#2A2A3A',
  centro: '#E8000D',
  norte: '#C8C8DC',
  sul: '#525270',
  grid: 'rgba(255,255,255,.04)',
};

ChartJS.defaults.font.family = font;
ChartJS.defaults.font.size = 11.5;
ChartJS.defaults.color = '#50506A';
ChartJS.defaults.plugins.legend.display = false;
ChartJS.defaults.plugins.tooltip.backgroundColor = '#14141C';
ChartJS.defaults.plugins.tooltip.borderColor = '#262636';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.displayColors = true;
ChartJS.defaults.plugins.tooltip.boxPadding = 5;
ChartJS.defaults.plugins.tooltip.titleColor = '#F0F0F6';
ChartJS.defaults.plugins.tooltip.bodyColor = '#8888A4';
ChartJS.defaults.plugins.tooltip.titleFont = { family: font, weight: '700', size: 12 };
ChartJS.defaults.plugins.tooltip.bodyFont = { family: font, size: 11 };

const legOpts = { display: true, labels: { color: COLORS.w2, boxWidth: 10, boxHeight: 10, padding: 18, font: { size: 11.5, family: font } } };
const gX = (cb, extra = {}) => ({ grid: { color: COLORS.grid }, ticks: { color: '#404058', font: { size: 10.5 }, maxRotation: 40, ...extra, callback: cb || undefined } });
const gY = (cb, mn, mx) => ({ grid: { color: COLORS.grid }, ticks: { color: '#404058', font: { size: 10.5 }, callback: cb || undefined }, min: mn, max: mx });
const gYr = (cb) => ({ grid: { display: false }, ticks: { color: COLORS.w2, font: { size: 10.5 }, callback: cb || undefined } });
const gXt = (cb) => ({ grid: { color: COLORS.grid }, ticks: { color: '#404058', font: { size: 10.5 }, callback: cb || undefined } });

export function LineChart({ labels, datasets, yFmt, yMin, yMax, legend = false, maxT = 10, height }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: legend ? legOpts : { display: false } },
    scales: {
      x: { ...gX(null, { maxTicksLimit: maxT }) },
      y: gY(yFmt, yMin, yMax),
    },
  };
  return (
    <div style={{ height: height || 215, width: '100%' }}>
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}

export function BarChart({ labels, datasets, horiz = false, yFmt, xFmt, legend = false, height }) {
  const options = {
    indexAxis: horiz ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: legend ? legOpts : { display: false } },
    scales: horiz
      ? { x: gXt(xFmt), y: gYr() }
      : {
          x: { grid: { display: false }, ticks: { color: COLORS.w2, font: { size: 10.5 } } },
          y: gY(yFmt),
        },
  };
  return (
    <div style={{ height: height || 215, width: '100%' }}>
      <Bar data={{ labels, datasets }} options={options} />
    </div>
  );
}

export function DonutChart({ labels, data, colors, cutout = '64%', ttFmt, height }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ttFmt ? (ctx) => ttFmt(ctx) : (ctx) => {
            const t = ctx.dataset.data.reduce((a, b) => a + b, 0);
            return ` ${ctx.label}: ${((ctx.raw / t) * 100).toFixed(1)}%`;
          },
        },
      },
    },
  };
  const cData = {
    labels,
    datasets: [{ data, backgroundColor: colors, borderWidth: 1.5, borderColor: '#14141C', hoverOffset: 5 }],
  };
  return (
    <div style={{ height: height || 170, width: '100%' }}>
      <Doughnut data={cData} options={options} />
    </div>
  );
}

export function ScatterChart({ datasets, xFmt, yFmt, height }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: Rec ${xFmt(ctx.raw.x)} · Mg ${yFmt(ctx.raw.y)}`,
        },
      },
    },
    scales: {
      x: gY(xFmt),
      y: gY(yFmt),
    },
  };
  return (
    <div style={{ height: height || 215, width: '100%' }}>
      <Scatter data={{ datasets }} options={options} />
    </div>
  );
}

export function DualChart({ labels, bDs, lDs, height }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: legOpts },
    scales: {
      x: { grid: { display: false }, ticks: { color: COLORS.w2, font: { size: 10.5 } } },
      y: gY(bDs.yFmt),
      y2: { position: 'right', grid: { display: false }, ticks: { color: COLORS.w2, font: { size: 10.5 }, callback: lDs.yFmt } },
    },
  };
  return (
    <div style={{ height: height || 215, width: '100%' }}>
      <Bar data={{ labels, datasets: [bDs, lDs] }} options={options} />
    </div>
  );
}

export function RadarChart({ labels, datasets, height }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: legOpts },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,.06)' },
        grid: { color: 'rgba(255,255,255,.09)' },
        pointLabels: { color: COLORS.w2, font: { size: 11, family: font } },
        ticks: { color: '#404058', backdropColor: 'transparent', stepSize: 25, font: { size: 9 } },
        min: 0,
        max: 120,
      },
    },
  };
  return (
    <div style={{ height: height || 215, width: '100%' }}>
      <Radar data={{ labels, datasets }} options={options} />
    </div>
  );
}
