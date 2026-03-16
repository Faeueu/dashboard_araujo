import ReactApexChart from 'react-apexcharts';
import { useTheme } from '../core/DashboardContext.jsx';
import { useMemo } from 'react';

/* ─── Luminance & Contrast Helpers ──────────────────────────── */
function getLuminance(hex) {
  if (!hex || hex.startsWith('rgba') || hex.startsWith('rgb(')) return 0.5;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const lr = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const lg = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const lb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function getContrastText(bgColor) {
  const lum = getLuminance(bgColor);
  return lum > 0.35 ? '#1E293B' : '#FFFFFF';
}

/* ─── Dynamic Colors Based on Theme ─────────────────────────── */
export function useChartColors() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return useMemo(
    () => ({
      // Brand — always strong red visibility
      red: isDark ? '#EF4444' : '#DC2626',
      redD: isDark ? 'rgba(239,68,68,.15)' : 'rgba(220,38,38,.08)',
      red2: isDark ? '#F87171' : '#EF4444',
      red3: isDark ? '#FCA5A5' : '#F87171',
      red4: isDark ? '#FECACA' : '#FCA5A5',
      red5: isDark ? '#FEE2E2' : '#FECACA',

      // Store colors — MUST contrast with bg in both themes
      centro: isDark ? '#EF4444' : '#DC2626',
      norte: isDark ? '#60A5FA' : '#64748B', // blue in dark for visibility
      sul: isDark ? '#A78BFA' : '#1E293B', // purple in dark for visibility

      // Text
      text1: isDark ? '#F1F5F9' : '#0F172A',
      text2: isDark ? '#CBD5E1' : '#475569',
      text3: isDark ? '#94A3B8' : '#64748B',

      // Neutral bars — visibility-first palette for charts
      bar: isDark ? '#60A5FA' : '#CBD5E1', // default muted bar
      barAlt: isDark ? '#818CF8' : '#94A3B8', // alternate neutral
      barDark: isDark ? '#A78BFA' : '#64748B', // darker neutral

      // Grid / bg
      grid: isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)',
      card: isDark ? '#1E293B' : '#FFFFFF',
      bg: isDark ? '#0B0F1A' : '#F5F6FA',

      // Tooltip
      tooltipBg: isDark ? '#1E293B' : '#FFFFFF',
      tooltipBorder: isDark ? '#475569' : '#E2E8F0',
      tooltipText: isDark ? '#F1F5F9' : '#0F172A',

      // Label colors
      labelColor: isDark ? '#CBD5E1' : '#3E3E58',
      axisColor: isDark ? '#94A3B8' : '#64748B',
      legendColor: isDark ? '#CBD5E1' : '#334155',
      dataLabelColor: isDark ? '#E2E8F0' : '#334155',

      // Status
      success: isDark ? '#34D399' : '#16A34A',
      warning: isDark ? '#FBBF24' : '#F59E0B',

      isDark,
    }),
    [isDark]
  );
}

const font = "'Plus Jakarta Sans', system-ui, sans-serif";

function useBaseTheme() {
  const c = useChartColors();

  return useMemo(
    () => ({
      chart: {
        fontFamily: font,
        foreColor: c.axisColor,
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 500 },
        background: 'transparent',
      },
      tooltip: {
        theme: c.isDark ? 'dark' : 'light',
        style: { fontSize: '13px', fontFamily: font },
        x: { show: true },
        marker: { show: true },
      },
      grid: {
        borderColor: c.grid,
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 4, bottom: 4, left: 8, right: 8 },
      },
      legend: {
        fontFamily: font,
        fontSize: '13px',
        fontWeight: 600,
        labels: { colors: c.legendColor },
        markers: { size: 6, shape: 'circle', offsetX: -2 },
        itemMargin: { horizontal: 16, vertical: 8 },
      },
      states: {
        hover: { filter: { type: 'lighten', value: 0.04 } },
        active: { filter: { type: 'darken', value: 0.03 } },
      },
    }),
    [c]
  );
}

// ── LINE CHART ─────────────────────────────────────────────────
export function LineChart({
  labels,
  datasets,
  yFmt,
  yMin,
  yMax,
  legend = false,
  maxT = 6,
  height,
}) {
  const baseTheme = useBaseTheme();
  const c = useChartColors();

  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data,
  }));

  const options = {
    ...baseTheme,
    chart: {
      ...baseTheme.chart,
      type: 'line',
      height: height || 300,
      zoom: { enabled: false, type: 'x', autoScaleYaxis: false },
      selection: { enabled: false },
      pan: { enabled: false },
      toolbar: { show: false },
    },

    colors: datasets.map(ds => ds.borderColor || c.red),

    stroke: {
      curve: 'smooth',
      width: datasets.map(ds => (ds.borderDash ? 1.8 : 2.5)),
      dashArray: datasets.map(ds => (ds.borderDash ? 6 : 0)),
    },

    fill: {
      type: datasets.map(ds => (ds.fill ? 'gradient' : 'solid')),
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: c.isDark ? 3 : 5,
        opacityTo: 1,
        stops: [0, 85, 100],
        inverseColors: false,
      },
    },

    markers: {
      size: datasets.map(ds => (ds.borderDash ? 0 : 4)),
      colors: datasets.map(ds => ds.pointBackgroundColor || ds.borderColor || c.red),
      strokeWidth: 0,
      hover: { sizeOffset: 2 },
    },

    xaxis: {
      categories: labels,
      tickAmount: 10, // Maintain high density for x-axis time series
      labels: {
        style: { colors: c.labelColor, fontSize: '11px', fontWeight: 500 },
        rotate: -35,
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      min: yMin,
      max: yMax,
      tickAmount: maxT, // FIX: Control y-axis density to prevent overlap (default 6 instead of 10)
      decimalsInFloat: 0,
      labels: {
        style: { colors: c.labelColor, fontSize: '11px', fontWeight: 500 },
        formatter: yFmt || (v => v),
      },
    },

    grid: {
      ...baseTheme.grid,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },

    legend: {
      ...baseTheme.legend,
      show: legend,
      position: 'top',
      markers: { width: 16, height: 3, radius: 2 },
      itemMargin: { horizontal: 14 },
    },

    tooltip: {
      ...baseTheme.tooltip,
      shared: true,
      intersect: false,
      y: { formatter: yFmt || (v => v) },
    },

    dataLabels: { enabled: false },
  };

  return (
    <div role="img" aria-label="Gráfico de linhas">
      <ReactApexChart options={options} series={series} type="line" height={height || 300} />
    </div>
  );
}

// ── BAR CHART ──────────────────────────────────────────────────
export function BarChart({
  labels,
  datasets,
  horiz = false,
  yFmt,
  xFmt,
  legend = false,
  height,
  stacked = false,
}) {
  const baseTheme = useBaseTheme();
  const c = useChartColors();

  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data,
  }));

  const barColors =
    datasets.length === 1 && Array.isArray(datasets[0].backgroundColor)
      ? datasets[0].backgroundColor
      : undefined;

  const solidColor =
    datasets.length === 1 && typeof datasets[0].backgroundColor === 'string'
      ? [datasets[0].backgroundColor]
      : datasets.map(ds => (typeof ds.backgroundColor === 'string' ? ds.backgroundColor : c.red));

  let dlColors;
  if (barColors) {
    dlColors = horiz
      ? barColors.map(bg => getContrastText(bg))
      : barColors.map(() => c.dataLabelColor);
  } else {
    dlColors = [c.dataLabelColor];
  }

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'bar', height: height || 300, stacked: stacked },
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
        fontSize: '11px',
        fontFamily: font,
        fontWeight: 700,
        colors: dlColors,
      },
      offsetY: horiz ? 0 : -20,
      offsetX: 0,
      formatter: horiz ? xFmt || (v => v) : yFmt || (v => v),
    },
    xaxis: {
      categories: labels,
      labels: {
        style: { colors: c.axisColor, fontSize: '11px', fontWeight: 500 },
        formatter: horiz ? xFmt || (v => v) : undefined,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: c.axisColor, fontSize: '11px', fontWeight: 500 },
        formatter: horiz ? undefined : yFmt || (v => v),
      },
      tickAmount: horiz ? undefined : 6, // Prevents overlap in vertical bars
    },
    legend: { ...baseTheme.legend, show: legend, position: 'top' },
    tooltip: {
      ...baseTheme.tooltip,
      y: { formatter: horiz ? xFmt || (v => v) : yFmt || (v => v) },
    },
    grid: {
      ...baseTheme.grid,
      xaxis: { lines: { show: horiz } },
      yaxis: { lines: { show: !horiz } },
    },
  };

  return (
    <div role="img" aria-label="Gráfico de barras">
      <ReactApexChart options={options} series={series} type="bar" height={height || 300} />
    </div>
  );
}

// ── DONUT CHART ────────────────────────────────────────────────
export function DonutChart({ labels, data, colors, cutout = '64%', height }) {
  const baseTheme = useBaseTheme();
  const c = useChartColors();

  const cutoutNum = parseInt(cutout) || 64;

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'donut', height: height || 220 },
    labels,
    colors: colors || [c.red, c.red2, c.red3, c.red4, c.red5],
    stroke: { width: 3, colors: [c.card] },
    plotOptions: {
      pie: {
        donut: {
          size: `${cutoutNum}%`,
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              fontFamily: font,
              fontWeight: 700,
              color: c.text2,
              offsetY: -8,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: font,
              fontWeight: 800,
              color: c.text1,
              offsetY: 4,
              formatter: val => Number(val).toLocaleString('pt-BR'),
            },
            total: { show: false },
          },
        },
        expandOnClick: false,
      },
    },
    dataLabels: { enabled: false }, // FIX: Force remove internal slice data labels that broke the UI
    legend: { show: false }, // FIX: Removing apexcharts default legend completely since we use custom HTML
    tooltip: {
      ...baseTheme.tooltip,
      y: {
        formatter: (val, { w }) => {
          const total = w.globals.series.reduce((a, b) => a + b, 0);
          const pct = ((val / total) * 100).toFixed(1);
          return `${val.toLocaleString('pt-BR')} (${pct}%)`;
        },
      },
    },
  };

  return (
    <div role="img" aria-label="Gráfico de rosca">
      <ReactApexChart options={options} series={data} type="donut" height={height || 220} />
    </div>
  );
}

// ── SCATTER CHART ──────────────────────────────────────────────
export function ScatterChart({ datasets, xFmt, yFmt, height }) {
  const baseTheme = useBaseTheme();
  const c = useChartColors();

  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data.map(p => [p.x, p.y]),
  }));

  const colors = datasets.map(ds =>
    typeof ds.backgroundColor === 'string' ? ds.backgroundColor : c.red
  );

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'scatter', height: height || 300, zoom: { enabled: false } },
    colors,
    markers: {
      size: datasets.map(ds => ds.pointRadius || 10),
      strokeWidth: 2,
      strokeColors: c.card,
      hover: { sizeOffset: 4 },
    },
    xaxis: {
      type: 'numeric',
      labels: {
        style: { colors: c.axisColor, fontSize: '11px', fontWeight: 500 },
        formatter: xFmt || (v => v),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: c.axisColor, fontSize: '11px', fontWeight: 500 },
        formatter: yFmt || (v => v),
      },
      tickAmount: 5,
    },
    legend: { show: false },
    tooltip: {
      ...baseTheme.tooltip,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const pt = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const name = w.globals.seriesNames[seriesIndex];
        return `<div style="padding:10px 14px;font-family:${font};font-size:13px;background:${c.tooltipBg};border:1px solid ${c.tooltipBorder};border-radius:8px;color:${c.tooltipText};box-shadow:0 4px 12px rgba(0,0,0,0.12)">
          <strong>${name}</strong><br/>
          <span style="color:${c.text2}">Rec: ${xFmt ? xFmt(pt[0]) : pt[0]} · Mg: ${yFmt ? yFmt(pt[1]) : pt[1]}</span>
        </div>`;
      },
    },
    grid: baseTheme.grid,
  };

  return (
    <div role="img" aria-label="Gráfico de dispersão">
      <ReactApexChart options={options} series={series} type="scatter" height={height || 300} />
    </div>
  );
}

// ── DUAL-AXIS CHART ────────────────────────────────────────────
export function DualChart({ labels, bDs, lDs, height }) {
  const baseTheme = useBaseTheme();
  const c = useChartColors();

  const series = [
    { name: bDs.label || 'Barras', type: 'bar', data: bDs.data },
    { name: lDs.label || 'Linha', type: 'line', data: lDs.data },
  ];

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'line', height: height || 320, stacked: false },
    colors: [bDs.borderColor || c.red, lDs.borderColor || c.text1],
    stroke: { width: [0, 3], curve: 'smooth' },
    fill: { opacity: [0.15, 1] },
    plotOptions: {
      bar: { borderRadius: bDs.borderRadius || 6, columnWidth: '50%' },
    },
    markers: { size: [0, 5], strokeWidth: 2, strokeColors: c.card },
    dataLabels: { enabled: false },
    xaxis: {
      categories: labels,
      labels: { style: { colors: c.axisColor, fontSize: '11px', fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        title: { text: '' },
        tickAmount: 5,
        labels: {
          style: { colors: c.axisColor, fontSize: '11px', fontWeight: 500 },
          formatter: bDs.yFmt || (v => v),
        },
      },
      {
        opposite: true,
        title: { text: '' },
        tickAmount: 5,
        labels: {
          style: { colors: c.text2, fontSize: '11px', fontWeight: 500 },
          formatter: lDs.yFmt || (v => v),
        },
      },
    ],
    legend: { ...baseTheme.legend, show: true, position: 'top' },
    tooltip: { ...baseTheme.tooltip, shared: true, intersect: false },
    grid: { ...baseTheme.grid, yaxis: { lines: { show: true } } },
  };

  return (
    <div role="img" aria-label="Gráfico de eixo duplo">
      <ReactApexChart options={options} series={series} type="line" height={height || 320} />
    </div>
  );
}

// ── RADAR CHART ────────────────────────────────────────────────
export function RadarChart({ labels, datasets, height }) {
  const baseTheme = useBaseTheme();
  const c = useChartColors();

  const series = datasets.map(ds => ({
    name: ds.label || '',
    data: ds.data,
  }));

  const colors = datasets.map(ds => ds.borderColor || c.red);

  const options = {
    ...baseTheme,
    chart: { ...baseTheme.chart, type: 'radar', height: height || 340 },
    colors,
    stroke: { width: datasets.map(ds => ds.borderWidth || 2.5) },
    fill: { opacity: 0.1 },
    markers: {
      size: 5,
      colors: datasets.map(ds => ds.pointBackgroundColor || ds.borderColor || c.red),
      strokeWidth: 2,
      strokeColors: c.card,
    },
    xaxis: {
      categories: labels,
      labels: {
        style: { colors: c.legendColor, fontSize: '13px', fontFamily: font, fontWeight: 600 },
      },
    },
    yaxis: {
      min: 0,
      max: 120,
      stepSize: 25,
      labels: { style: { colors: c.text3, fontSize: '10px' } },
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: c.grid,
          fill: { colors: ['transparent'] },
          connectorColors: c.isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)',
        },
      },
    },
    legend: { ...baseTheme.legend, show: true, position: 'top' },
  };

  return (
    <div role="img" aria-label="Gráfico radar de performance">
      <ReactApexChart options={options} series={series} type="radar" height={height || 340} />
    </div>
  );
}
