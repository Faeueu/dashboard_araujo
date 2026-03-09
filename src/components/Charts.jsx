// src/components/Charts.jsx
// ApexCharts wrapper — Light theme, bigger charts, intuitive formatting
import ReactApexChart from 'react-apexcharts';

export const COLORS = {
  red: '#DC2626',
  redD: 'rgba(220,38,38,.08)',
  red2: '#EF4444',
  white: '#0F172A',
  w2: '#475569',
  gray: '#94A3B8',
  gray2: '#CBD5E1',
  centro: '#DC2626',
  norte: '#64748B',
  sul: '#1E293B',
  grid: 'rgba(0,0,0,.06)',
};

const font = "'Plus Jakarta Sans', system-ui, sans-serif";

const baseTheme = {
  chart: {
    fontFamily: font,
    foreColor: '#64748B',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 500 },
    background: 'transparent',
  },
  tooltip: {
    theme: 'light',
    style: { fontSize: '13px', fontFamily: font },
    x: { show: true },
    marker: { show: true },
  },
  grid: {
    borderColor: 'rgba(0,0,0,.06)',
    strokeDashArray: 0,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 4, bottom: 4, left: 8, right: 8 },
  },
  legend: {
    fontFamily: font,
    fontSize: '13px',
    fontWeight: 600,
    labels: { colors: '#334155' },
    markers: { size: 6, shape: 'circle', offsetX: -2 },
    itemMargin: { horizontal: 16, vertical: 8 },
  },
  states: {
    hover: { filter: { type: 'lighten', value: 0.04 } },
    active: { filter: { type: 'darken', value: 0.03 } },
  },
};

// ── LINE CHART ─────────────────────────────────────────────────
export function LineChart({ labels, datasets, yFmt, yMin, yMax, legend = false, maxT = 10, height }) {
  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data,
    type: 'line',
  }));

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'line', height: height || 300 },
    colors: datasets.map(ds => ds.borderColor || COLORS.red),
    stroke: {
      width: datasets.map(ds => ds.borderWidth || 3),
      curve: 'smooth',
      dashArray: datasets.map(ds => ds.borderDash ? 6 : 0),
    },
    fill: {
      type: datasets.map(ds => ds.fill ? 'gradient' : 'solid'),
      opacity: datasets.map(ds => ds.fill ? 0.15 : 0),
      gradient: { shadeIntensity: 0.3, opacityFrom: 0.2, opacityTo: 0.02, stops: [0, 90, 100] },
    },
    markers: {
      size: datasets.map(ds => ds.pointRadius != null ? ds.pointRadius + 1 : 4),
      colors: datasets.map(ds => ds.pointBackgroundColor || ds.borderColor || COLORS.red),
      strokeWidth: 2,
      strokeColors: '#fff',
      hover: { sizeOffset: 3 },
    },
    xaxis: {
      categories: labels,
      labels: { style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 }, rotate: -40 },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tickAmount: maxT,
    },
    yaxis: {
      min: yMin, max: yMax,
      labels: {
        style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 },
        formatter: yFmt || (v => v),
      },
    },
    legend: { ...baseTheme.legend, show: legend, position: 'top' },
    tooltip: {
      ...baseTheme.tooltip,
      y: { formatter: yFmt || (v => v) },
    },
    grid: baseTheme.grid,
  };

  return <ReactApexChart options={options} series={series} type="line" height={height || 300} />;
}

// ── BAR CHART ──────────────────────────────────────────────────
export function BarChart({ labels, datasets, horiz = false, yFmt, xFmt, legend = false, height }) {
  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data,
  }));

  const barColors = datasets.length === 1 && Array.isArray(datasets[0].backgroundColor)
    ? datasets[0].backgroundColor
    : undefined;

  const solidColor = datasets.length === 1 && typeof datasets[0].backgroundColor === 'string'
    ? [datasets[0].backgroundColor]
    : datasets.map(ds => typeof ds.backgroundColor === 'string' ? ds.backgroundColor : COLORS.red);

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'bar', height: height || 300, stacked: false },
    plotOptions: {
      bar: {
        horizontal: horiz,
        borderRadius: datasets[0]?.borderRadius || 6,
        columnWidth: '55%',
        barHeight: '65%',
        distributed: barColors ? true : false,
        dataLabels: {
          position: horiz ? 'center' : 'top',
        },
      },
    },
    colors: barColors || solidColor,
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: font,
        fontWeight: 700,
        colors: barColors ? barColors.map(() => '#334155') : ['#334155'],
      },
      offsetY: horiz ? 0 : -20,
      offsetX: horiz ? 0 : 0,
      formatter: horiz ? (xFmt || (v => v)) : (yFmt || (v => v)),
    },
    xaxis: {
      categories: labels,
      labels: {
        style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 },
        formatter: horiz ? (xFmt || (v => v)) : undefined,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 },
        formatter: horiz ? undefined : (yFmt || (v => v)),
      },
    },
    legend: { ...baseTheme.legend, show: legend, position: 'top' },
    tooltip: {
      ...baseTheme.tooltip,
      y: { formatter: horiz ? (xFmt || (v => v)) : (yFmt || (v => v)) },
    },
    grid: { ...baseTheme.grid, xaxis: { lines: { show: horiz } }, yaxis: { lines: { show: !horiz } } },
  };

  return <ReactApexChart options={options} series={series} type="bar" height={height || 300} />;
}

// ── DONUT CHART ────────────────────────────────────────────────
export function DonutChart({ labels, data, colors, cutout = '64%', ttFmt, height }) {
  const cutoutNum = parseInt(cutout) || 64;

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'donut', height: height || 220 },
    labels,
    colors: colors || [COLORS.red, COLORS.red2, '#FF7080', 'rgba(220,38,38,.52)', 'rgba(220,38,38,.32)'],
    stroke: { width: 2, colors: ['#fff'] },
    plotOptions: {
      pie: {
        donut: {
          size: `${cutoutNum}%`,
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', fontFamily: font, fontWeight: 700, color: '#0F172A' },
            value: { show: true, fontSize: '20px', fontFamily: font, fontWeight: 800, color: '#0F172A' },
            total: { show: false },
          },
        },
        expandOnClick: false,
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      ...baseTheme.tooltip,
      y: {
        formatter: (val, { seriesIndex, w }) => {
          const total = w.globals.series.reduce((a, b) => a + b, 0);
          const pct = ((val / total) * 100).toFixed(1);
          return `${val.toLocaleString('pt-BR')} (${pct}%)`;
        },
      },
    },
  };

  return <ReactApexChart options={options} series={data} type="donut" height={height || 220} />;
}

// ── SCATTER CHART ──────────────────────────────────────────────
export function ScatterChart({ datasets, xFmt, yFmt, height }) {
  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data.map(p => [p.x, p.y]),
  }));

  const colors = datasets.map(ds =>
    typeof ds.backgroundColor === 'string' ? ds.backgroundColor : COLORS.red
  );

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'scatter', height: height || 300, zoom: { enabled: false } },
    colors,
    markers: {
      size: datasets.map(ds => ds.pointRadius || 10),
      strokeWidth: 2,
      strokeColors: '#fff',
      hover: { sizeOffset: 4 },
    },
    xaxis: {
      type: 'numeric',
      labels: {
        style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 },
        formatter: xFmt || (v => v),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 },
        formatter: yFmt || (v => v),
      },
    },
    legend: { show: false },
    tooltip: {
      ...baseTheme.tooltip,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const pt = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const name = w.globals.seriesNames[seriesIndex];
        return `<div style="padding:10px 14px;font-family:${font};font-size:13px;background:#fff;border:1px solid #E2E8F0;border-radius:8px;color:#0F172A;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          <strong>${name}</strong><br/>
          <span style="color:#475569">Rec: ${xFmt ? xFmt(pt[0]) : pt[0]} · Mg: ${yFmt ? yFmt(pt[1]) : pt[1]}</span>
        </div>`;
      },
    },
    grid: baseTheme.grid,
  };

  return <ReactApexChart options={options} series={series} type="scatter" height={height || 300} />;
}

// ── DUAL-AXIS CHART ────────────────────────────────────────────
export function DualChart({ labels, bDs, lDs, height }) {
  const series = [
    { name: bDs.label || 'Barras', type: 'bar', data: bDs.data },
    { name: lDs.label || 'Linha', type: 'line', data: lDs.data },
  ];

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'line', height: height || 320, stacked: false },
    colors: [bDs.borderColor || COLORS.red, lDs.borderColor || COLORS.white],
    stroke: { width: [0, 3], curve: 'smooth' },
    fill: { opacity: [0.15, 1] },
    plotOptions: {
      bar: { borderRadius: bDs.borderRadius || 6, columnWidth: '50%' },
    },
    markers: { size: [0, 5], strokeWidth: 2, strokeColors: '#fff' },
    dataLabels: { enabled: false },
    xaxis: {
      categories: labels,
      labels: { style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: { text: '' },
        labels: {
          style: { colors: '#64748B', fontSize: '12px', fontWeight: 500 },
          formatter: bDs.yFmt || (v => v),
        },
      },
      {
        opposite: true,
        title: { text: '' },
        labels: {
          style: { colors: '#475569', fontSize: '12px', fontWeight: 500 },
          formatter: lDs.yFmt || (v => v),
        },
      },
    ],
    legend: { ...baseTheme.legend, show: true, position: 'top' },
    tooltip: { ...baseTheme.tooltip, shared: true, intersect: false },
    grid: { ...baseTheme.grid, yaxis: { lines: { show: true } } },
  };

  return <ReactApexChart options={options} series={series} type="line" height={height || 320} />;
}

// ── RADAR CHART ────────────────────────────────────────────────
export function RadarChart({ labels, datasets, height }) {
  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data,
  }));

  const colors = datasets.map(ds => ds.borderColor || COLORS.red);

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'radar', height: height || 340 },
    colors,
    stroke: { width: datasets.map(ds => ds.borderWidth || 2.5) },
    fill: { opacity: 0.1 },
    markers: {
      size: 5,
      colors: datasets.map(ds => ds.pointBackgroundColor || ds.borderColor || COLORS.red),
      strokeWidth: 2,
      strokeColors: '#fff',
    },
    xaxis: {
      categories: labels,
      labels: {
        style: { colors: '#334155', fontSize: '13px', fontFamily: font, fontWeight: 600 },
      },
    },
    yaxis: {
      min: 0, max: 120,
      stepSize: 25,
      labels: {
        style: { colors: '#94A3B8', fontSize: '10px' },
      },
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: 'rgba(0,0,0,.08)',
          fill: { colors: ['transparent'] },
          connectorColors: 'rgba(0,0,0,.05)',
        },
      },
    },
    legend: { ...baseTheme.legend, show: true, position: 'top' },
  };

  return <ReactApexChart options={options} series={series} type="radar" height={height || 340} />;
}
