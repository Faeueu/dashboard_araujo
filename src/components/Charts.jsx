// src/components/Charts.jsx
// ApexCharts wrapper components with dashboard theme defaults

import { useMemo } from 'react';
import Chart from 'react-apexcharts';

// ── Theme Colors ──
export const COLORS = {
  primary: '#DC2626',
  primaryDim: 'rgba(220, 38, 38, 0.08)',
  primarySoft: 'rgba(220, 38, 38, 0.45)',
  text1: '#0F172A',
  text2: '#334155',
  text3: '#64748B',
  text4: '#94A3B8',
  grid: 'rgba(0, 0, 0, 0.05)',
  border: '#E2E8F0',
  white: '#FFFFFF',
  centro: '#DC2626',
  norte: '#6366F1',
  sul: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
};

const FONT = "'Inter', system-ui, sans-serif";
const MONO = "'JetBrains Mono', monospace";

// ── Base options builder ──
function baseOpts({ chart, grid, tooltip, legend, ...rest } = {}) {
  return {
    ...rest,
    chart: {
      fontFamily: FONT,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 600,
        dynamicAnimation: { speed: 400 },
      },
      ...chart,
    },
    grid: {
      borderColor: COLORS.grid,
      strokeDashArray: 3,
      padding: { left: 8, right: 8 },
      ...grid,
    },
    dataLabels: {
      enabled: false,
      ...(rest.dataLabels || {})
    },
    tooltip: {
      theme: 'light',
      style: { fontSize: '12.5px', fontFamily: FONT },
      ...tooltip,
    },
    legend: {
      show: false,
      fontFamily: FONT,
      fontSize: '12px',
      labels: { colors: COLORS.text2 },
      markers: { size: 5, shape: 'circle' },
      ...legend,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
//  LINE CHART
// ═══════════════════════════════════════════════════════════════
export function LineChart({ type = 'line', series, categories, yFormatter, yMin, yMax, height = 240, legend = false }) {
  const options = useMemo(() => baseOpts({
    chart: { type, height },
    stroke: { curve: 'smooth', width: 2.5 },
    markers: { size: 3, hover: { size: 5 } },
    fill: type === 'area' ? { type: 'solid', opacity: 0.1 } : { type: 'solid', opacity: 1 },
    xaxis: {
      categories,
      labels: { style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 },
        formatter: yFormatter,
      },
      min: yMin,
      max: yMax,
    },
    legend: { show: legend, position: 'top' },
  }), [type, categories, yFormatter, yMin, yMax, height, legend]);

  return <Chart options={options} series={series} type={type} height={height} />;
}

// ═══════════════════════════════════════════════════════════════
//  BAR CHART
// ═══════════════════════════════════════════════════════════════
export function BarChart({ series, categories, horizontal = false, yFormatter, xFormatter, height = 240, legend = false, stacked = false, colors }) {
  const options = useMemo(() => baseOpts({
    chart: { type: 'bar', height, stacked },
    colors: colors || undefined,
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 4,
        borderRadiusApplication: 'end',
        columnWidth: horizontal ? '100%' : '55%',
        barHeight: horizontal ? '85%' : '55%',
        distributed: !!colors, // Necessary for different colors per bar when using single series
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 },
        formatter: horizontal ? xFormatter : undefined,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 },
        formatter: horizontal ? undefined : yFormatter,
      },
    },
    legend: { show: legend, position: 'top' },
    grid: horizontal ? { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } } : undefined,
  }), [categories, horizontal, yFormatter, xFormatter, height, legend, stacked, colors]);

  return <Chart options={options} series={series} type="bar" height={height} />;
}

// ═══════════════════════════════════════════════════════════════
//  DONUT CHART
// ═══════════════════════════════════════════════════════════════
export function DonutChart({ series, labels, colors, height = 200, tooltipFormatter, valueFormatter }) {
  const options = useMemo(() => ({
    chart: {
      type: 'donut',
      fontFamily: FONT,
      animations: { enabled: true, speed: 600 },
    },
    labels,
    colors,
    stroke: { width: 2, colors: ['#FFFFFF'] },
    plotOptions: {
      pie: {
        donut: {
          size: '64%',
          labels: {
            show: true,
            name: { fontSize: '13px', fontFamily: FONT, color: COLORS.text1 },
            value: { fontSize: '18px', fontFamily: FONT, fontWeight: 700, color: COLORS.text1, formatter: valueFormatter || ((val) => Number(val).toLocaleString('pt-BR')) },
            total: { show: true, fontSize: '11px', fontFamily: MONO, color: COLORS.text3, label: 'Total', formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return valueFormatter ? valueFormatter(total) : Number(total).toLocaleString('pt-BR');
              }
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      y: { formatter: tooltipFormatter },
    },
  }), [labels, colors, height, tooltipFormatter, valueFormatter]);

  return <Chart options={options} series={series} type="donut" height={height} />;
}

// ═══════════════════════════════════════════════════════════════
//  SCATTER CHART
// ═══════════════════════════════════════════════════════════════
export function ScatterChart({ series, xFormatter, yFormatter, height = 240 }) {
  const options = useMemo(() => baseOpts({
    chart: { type: 'scatter', height },
    markers: { size: 10, hover: { size: 13 } },
    xaxis: {
      labels: {
        style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 },
        formatter: xFormatter,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 },
        formatter: yFormatter,
      },
    },
    legend: { show: true, position: 'top', fontSize: '11px' },
  }), [xFormatter, yFormatter, height]);

  return <Chart options={options} series={series} type="scatter" height={height} />;
}

// ═══════════════════════════════════════════════════════════════
//  RADAR CHART
// ═══════════════════════════════════════════════════════════════
export function RadarChart({ series, categories, height = 300 }) {
  const options = useMemo(() => ({
    chart: {
      type: 'radar',
      fontFamily: FONT,
      toolbar: { show: false },
      animations: { enabled: true, speed: 600 },
    },
    xaxis: {
      categories,
      labels: { style: { fontSize: '11px', fontFamily: FONT, colors: COLORS.text2 } },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 120,
      tickAmount: 5,
    },
    plotOptions: {
      radar: {
        size: undefined,
        polygons: {
          strokeColors: 'rgba(0, 0, 0, 0.06)',
          fill: { colors: ['transparent', 'rgba(0, 0, 0, 0.01)'] },
        },
      },
    },
    stroke: { width: 2 },
    markers: { size: 4, hover: { size: 6 } },
    fill: { opacity: 0.1 },
    legend: {
      show: true,
      position: 'bottom',
      fontFamily: FONT,
      fontSize: '12px',
      labels: { colors: COLORS.text2 },
      markers: { size: 5 },
    },
    tooltip: { theme: 'light' },
  }), [categories, height]);

  return <Chart options={options} series={series} type="radar" height={height} />;
}

// ═══════════════════════════════════════════════════════════════
//  MIXED CHART (bar + line, dual axis)
// ═══════════════════════════════════════════════════════════════
export function MixedChart({ series, categories, yFormatter, y2Formatter, height = 240 }) {
  const options = useMemo(() => baseOpts({
    chart: { type: 'line', height, stacked: false },
    stroke: { width: [0, 2.5], curve: 'smooth' },
    plotOptions: {
      bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '45%' },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        labels: {
          style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 },
          formatter: yFormatter,
        },
      },
      {
        opposite: true,
        labels: {
          style: { fontSize: '10.5px', fontFamily: FONT, colors: COLORS.text3 },
          formatter: y2Formatter,
        },
      },
    ],
    legend: { show: true, position: 'top', fontFamily: FONT, fontSize: '12px', labels: { colors: COLORS.text2 } },
  }), [categories, yFormatter, y2Formatter, height]);

  return <Chart options={options} series={series} type="line" height={height} />;
}
