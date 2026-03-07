// src/pages/pages.js — Páginas P1–P6

import { brl, brlFull, pct, num, mes as fmtMes, dataCurta } from '../utils/fmt.js';
import {
    sum, aggVendas, margemPorCat, ticketSemanal, recSemanal, semanas,
    aggRupturas, coberturaFaixas, statusEstoque, statusPorCat
} from '../utils/filters.js';
import { P, lineChart, barChart, donutChart, scatterChart, dualChart, radarChart } from '../components/Charts.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

const CAT_COLORS = [P.red, '#FF4455', '#FF7080', 'rgba(232,0,13,.5)', 'rgba(232,0,13,.32)', P.white, P.white2, P.gray, '#2E2E44'];

function ph(badge, title, desc) {
    return `
    <div class="page-hd">
      <div class="ph-badge">${badge}</div>
      <h1 class="ph-title">${title}</h1>
      <p class="ph-desc">${desc}</p>
    </div>`;
}

function kpiCard(id, label, val = '—', sub = '', accent = '') {
    return `
    <div class="kpi-card" id="${id}">
      <div class="kpi-lbl">${label}</div>
      <div class="kpi-val" style="${accent ? `color:${accent}` : ''}">${val}</div>
      ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
    </div>`;
}

function chartCard(canvasId, title, hint = '', slot = '', spanAll = false) {
    return `
    <div class="ch-card ${spanAll ? 'span-all' : ''}">
      <div class="ch-head">
        <span class="ch-title">${title}</span>
        ${hint ? `<span class="ch-hint">${hint}</span>` : ''}
      </div>
      ${slot || `<canvas id="${canvasId}" height="210"></canvas>`}
    </div>`;
}

function upd(id, val, sub) {
    const el = document.getElementById(id); if (!el) return;
    const v = el.querySelector('.kpi-val'); if (v) v.textContent = val;
    if (sub !== undefined) {
        let s = el.querySelector('.kpi-sub');
        if (!s) { s = document.createElement('div'); s.className = 'kpi-sub'; el.appendChild(s); }
        s.textContent = sub;
    }
}

const MESES_ORD = ['2025-12', '2026-01', '2026-02', '2026-03'];
const LOJAS = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
const LCOL = [P.centro, P.norte, P.sul];

// ════════════════════════════════════════════════════════════════════════
//  P1 — VISÃO GERAL
// ════════════════════════════════════════════════════════════════════════
export class P1_VisaoGeral {
    render(el) {
        el.innerHTML = `
      ${ph('Página 1', 'Visão Geral<br>Comercial', 'Panorama executivo — faturamento, mix de produto e sazonalidade semanal.')}
      <div class="grid g4 mb">
        ${kpiCard('p1-rec', 'Receita Líquida')}
        ${kpiCard('p1-tk', 'Ticket Médio')}
        ${kpiCard('p1-mg', 'Margem Bruta')}
        ${kpiCard('p1-cat', 'Top Categoria')}
      </div>
      <div class="grid g2">
        ${chartCard('p1-loja', 'Receita Semanal por Loja', 'Tendência semanal — 3 lojas')}
        ${chartCard('p1-fat', 'Faturamento por Loja', 'Participação no período')}
        ${chartCard('p1-donut', 'Mix por Categoria', '', `
          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
            <div style="flex:0 0 168px"><canvas id="p1-donut" height="168"></canvas></div>
            <div id="p1-leg" class="donut-leg" style="flex:1"></div>
          </div>`)}
        ${chartCard('p1-dow', 'Receita por Dia da Semana', 'Sáb/Dom em destaque')}
      </div>`;
    }

    update({ vendas, atend }) {
        const rec = sum(vendas, 'rec');
        const mg = sum(vendas, 'mg');
        const fat = sum(atend, 'fat');
        const atd = sum(atend, 'atd');
        const tk = atd > 0 ? fat / atd : 0;
        const mgP = rec > 0 ? (mg / rec) * 100 : 0;
        const cats = aggVendas(vendas, 'cat');
        const top = cats[0] || { label: '—', rec: 0 };

        upd('p1-rec', brl(rec));
        upd('p1-tk', brlFull(tk));
        upd('p1-mg', pct(mgP), mgP < 27 ? '⚠ abaixo da meta' : '');
        upd('p1-cat', top.label, brl(top.rec));

        const el = document.getElementById('p1-mg');
        if (el) el.querySelector('.kpi-val').style.color = mgP < 27 ? P.red : P.white;

        // timeline semanal
        const wks = semanas(vendas);
        const byLj = recSemanal(vendas);
        lineChart('p1-loja', {
            labels: wks.map(w => dataCurta(w)),
            datasets: LOJAS.map((l, i) => ({
                label: l.replace('Araújo ', ''),
                data: wks.map(w => Math.round(byLj[l]?.[w] || 0)),
                borderColor: LCOL[i],
                backgroundColor: i === 0 ? P.redDim : 'transparent',
                fill: i === 0, tension: .4, borderWidth: 2, pointRadius: 2.5,
            })),
            yFmt: v => brl(v), legend: true, maxTicks: 9,
        });

        // barra horizontal por loja
        const byLoja = aggVendas(vendas, 'loja');
        barChart('p1-fat', {
            labels: byLoja.map(d => d.label.replace('Araújo ', '')),
            datasets: [{ data: byLoja.map(d => d.rec), backgroundColor: byLoja.map(d => d.label.includes('Norte') ? P.norte : d.label.includes('Sul') ? P.sul : P.centro), borderRadius: 5, borderSkipped: false }],
            horizontal: true, xFmt: v => brl(v),
        });

        // donut categorias
        const top8 = cats.slice(0, 8);
        const out = cats.slice(8).reduce((a, d) => a + d.rec, 0);
        const dLbl = [...top8.map(d => d.label), 'Outros'];
        const dVal = [...top8.map(d => d.rec), out];
        const tot = dVal.reduce((a, b) => a + b, 0);
        donutChart('p1-donut', {
            labels: dLbl, data: dVal, colors: CAT_COLORS,
            ttFmt: ctx => ` ${ctx.label}: ${brl(ctx.raw)} (${((ctx.raw / tot) * 100).toFixed(1)}%)`,
        });
        const leg = document.getElementById('p1-leg');
        if (leg) leg.innerHTML = dLbl.slice(0, 7).map((l, i) =>
            `<div class="dl-item"><span class="dl-dot" style="background:${CAT_COLORS[i]}"></span><span>${l}</span></div>`
        ).join('');

        // DOW
        const DOW = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const dm = {};
        vendas.forEach(v => { dm[v.dow] = (dm[v.dow] || 0) + v.rec; });
        barChart('p1-dow', {
            labels: DOW,
            datasets: [{ data: DOW.map(d => Math.round(dm[d] || 0)), backgroundColor: DOW.map((d, i) => i === 5 ? P.red : i === 6 ? 'rgba(232,0,13,.6)' : 'rgba(255,255,255,.09)'), borderRadius: 4, borderSkipped: false }],
            yFmt: v => brl(v),
        });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  P2 — TICKET MÉDIO
// ════════════════════════════════════════════════════════════════════════
export class P2_Ticket {
    render(el) {
        el.innerHTML = `
      ${ph('Página 2 · Estratégico', 'Análise do<br>Ticket Médio', 'Maior alavanca de faturamento sem aumentar clientes. Entenda o que eleva o ticket.')}
      <div class="grid g3 mb">
        ${kpiCard('p2-tk', 'Ticket Médio')}
        ${kpiCard('p2-camp', 'Melhor Campanha')}
        ${kpiCard('p2-dia', 'Melhor Dia')}
      </div>
      <div class="grid g2">
        ${chartCard('p2-evol', 'Ticket Semanal vs Meta', 'Linha real vs meta R$96,60 tracejada')}
        ${chartCard('p2-camp', 'Receita Média por Campanha', 'R$ por transação — ordenado asc')}
        ${chartCard('p2-hm', 'Heatmap Loja × Dia da Semana', 'Ticket estimado — vermelho=baixo, branco=alto', `
          <div class="tbl-scroll" style="margin-top:10px">
            <table class="hm-tbl" id="p2-hm"></table>
          </div>`, true)}
      </div>`;
    }

    update({ vendas, atend }) {
        const fat = sum(atend, 'fat'), atd = sum(atend, 'atd');
        const tk = atd > 0 ? fat / atd : 0;

        // campanha
        const campMap = {};
        vendas.forEach(v => {
            if (v.camp === 'Sem Campanha') return;
            if (!campMap[v.camp]) campMap[v.camp] = { rec: 0, tx: 0 };
            campMap[v.camp].rec += v.rec; campMap[v.camp].tx += v.tx;
        });
        const camps = Object.entries(campMap).map(([k, v]) => ({ label: k, tp: v.tx > 0 ? v.rec / v.tx : 0 })).sort((a, b) => b.tp - a.tp);
        const top = camps[0] || { label: '—', tp: 0 };

        const DOW = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const dm = {};
        vendas.forEach(v => { dm[v.dow] = (dm[v.dow] || 0) + v.rec; });
        const melhor = DOW.reduce((b, d) => (dm[d] || 0) > (dm[b] || 0) ? d : b, DOW[0]);

        upd('p2-tk', brlFull(tk));
        upd('p2-camp', top.label, brlFull(top.tp) + '/tx');
        upd('p2-dia', melhor, brl(dm[melhor] || 0));

        // linha ticket semanal
        const tkS = ticketSemanal(atend);
        lineChart('p2-evol', {
            labels: tkS.map(d => dataCurta(d.week)),
            datasets: [
                { label: 'Ticket Médio', data: tkS.map(d => d.ticket), borderColor: P.red, backgroundColor: P.redDim, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 3 },
                { label: 'Meta R$96,60', data: Array(tkS.length).fill(96.60), borderColor: P.white2, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0 },
            ],
            yFmt: v => 'R$' + Math.round(v), yMin: 88, yMax: 108, legend: true,
        });

        // barras campanha
        const cSort = [...camps].sort((a, b) => a.tp - b.tp);
        barChart('p2-camp', {
            labels: cSort.map(d => d.label),
            datasets: [{ data: cSort.map(d => Math.round(d.tp)), backgroundColor: cSort.map(d => d.tp >= 280 ? P.red : d.tp >= 268 ? 'rgba(232,0,13,.45)' : 'rgba(255,255,255,.11)'), borderRadius: 3, borderSkipped: false }],
            horizontal: true, xFmt: v => 'R$' + v,
        });

        // heatmap
        _buildHeatmap();
    }
}

function _buildHeatmap() {
    const L = ['Araújo Centro', 'Araújo Norte', 'Araújo Sul'];
    const D = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const V = { 'Araújo Centro': [82, 87, 90, 93, 98, 112, 107], 'Araújo Norte': [88, 93, 97, 100, 105, 120, 114], 'Araújo Sul': [79, 84, 88, 91, 96, 110, 104] };
    const all = Object.values(V).flat(), mn = Math.min(...all), mx = Math.max(...all);
    const hc = v => { const t = (v - mn) / (mx - mn); if (t < .5) { const s = t * 2; return `rgb(${Math.round(14 + s * 215)},${Math.round(s * 4)},${Math.round(s * 4)})`; } else { const s = (t - .5) * 2; return `rgb(${Math.round(228 + s * 27)},${Math.round(s * 215)},${Math.round(s * 215)})`; } };
    const tb = document.getElementById('p2-hm'); if (!tb) return;
    tb.innerHTML =
        `<tr><th>Loja</th>${D.map(d => `<th>${d}</th>`).join('')}</tr>` +
        L.map(l => `<tr><td class="hm-loja">${l}</td>${V[l].map(v => { const bg = hc(v), tc = v > (mn + mx) / 2 ? '#000' : '#fff'; return `<td style="background:${bg};color:${tc}">R$${v}</td>`; }).join('')}</tr>`).join('');
}

// ════════════════════════════════════════════════════════════════════════
//  P3 — MARGEM & MIX
// ════════════════════════════════════════════════════════════════════════
export class P3_Margem {
    render(el) {
        el.innerHTML = `
      ${ph('Página 3', 'Margem &amp;<br>Mix de Produtos', 'Não basta vender muito — é preciso vender bem. Rentabilidade por categoria.')}
      <div class="grid g4 mb">
        ${kpiCard('p3-mgp', 'Margem Bruta %')}
        ${kpiCard('p3-mgr', 'Margem Bruta R$')}
        ${kpiCard('p3-mel', 'Maior Margem')}
        ${kpiCard('p3-pior', 'Menor Margem', '—', '', P.red)}
      </div>
      <div class="grid g2">
        ${chartCard('p3-marg', '% Margem por Categoria', 'Ordenado desc — vermelho &lt;25%')}
        ${chartCard('p3-scat', 'Receita × Margem (Scatter)', 'Quadrante ideal: alto-direita')}
        ${chartCard('p3-mes', 'Receita por Loja × Mês', 'Evolução mensal agrupada', '', true)}
      </div>`;
    }

    update({ vendas }) {
        const rec = sum(vendas, 'rec'), mg = sum(vendas, 'mg');
        const mgP = rec > 0 ? (mg / rec) * 100 : 0;
        const cm = margemPorCat(vendas);
        const mel = cm[0] || { label: '—', pct: 0 };
        const por = cm[cm.length - 1] || { label: '—', pct: 0 };

        upd('p3-mgp', pct(mgP));
        upd('p3-mgr', brl(mg));
        upd('p3-mel', mel.label, pct(mel.pct));
        upd('p3-pior', por.label, pct(por.pct));

        barChart('p3-marg', {
            labels: cm.map(d => d.label),
            datasets: [{ data: cm.map(d => +d.pct.toFixed(1)), backgroundColor: cm.map(d => d.pct >= 40 ? P.red : d.pct >= 30 ? 'rgba(232,0,13,.45)' : d.pct >= 23 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.08)'), borderRadius: 3, borderSkipped: false }],
            horizontal: true, xFmt: v => v + '%',
        });

        scatterChart('p3-scat', {
            datasets: cm.map(d => ({ label: d.label, data: [{ x: d.rec, y: +d.pct.toFixed(1) }], backgroundColor: d.pct >= 40 ? P.red : d.pct >= 30 ? 'rgba(232,0,13,.45)' : 'rgba(255,255,255,.28)', pointRadius: 9, pointHoverRadius: 11 })),
            xFmt: v => brl(v), yFmt: v => v + '%',
        });

        const mesMap = {};
        vendas.forEach(v => { if (!mesMap[v.mes]) mesMap[v.mes] = {}; mesMap[v.mes][v.loja] = (mesMap[v.mes][v.loja] || 0) + v.rec; });
        const ma = MESES_ORD.filter(m => mesMap[m]);
        barChart('p3-mes', {
            labels: ma.map(fmtMes),
            datasets: LOJAS.map((l, i) => ({ label: l.replace('Araújo ', ''), data: ma.map(m => Math.round(mesMap[m]?.[l] || 0)), backgroundColor: LCOL[i], borderRadius: 3 })),
            legend: true, yFmt: v => brl(v),
        });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  P4 — ESTOQUE
// ════════════════════════════════════════════════════════════════════════
export class P4_Estoque {
    render(el) {
        el.innerHTML = `
      ${ph('Página 4 · Operacional', 'Gestão de<br>Estoque', 'Controle de posição, cobertura e alertas de reposição.')}
      <div class="grid g4 mb">
        ${kpiCard('p4-val', 'Valor em Estoque')}
        ${kpiCard('p4-rup', 'SKUs em Ruptura', '—', '', P.red)}
        ${kpiCard('p4-abx', 'Abaixo do Mínimo')}
        ${kpiCard('p4-risc', 'Risco Venc. Alto', '—', '', P.red)}
      </div>
      <div class="grid g2">
        ${chartCard('p4-status', 'SKUs por Status', 'Ruptura=Vermelho · Crítico=Âmbar · Abaixo=Cinza', '<div id="p4-sbars" style="margin-top:14px"></div>')}
        ${chartCard('p4-cob', 'Cobertura em Dias', 'Ideal 16–30d · Abaixo de 7d = risco imediato')}
        ${chartCard('p4-tbl', 'SKUs Críticos por Categoria', 'Ordenado por total crítico', `
          <div class="tbl-scroll">
            <table class="data-tbl">
              <thead><tr><th>Categoria</th><th>Ruptura</th><th>Crítico</th><th>Abaixo Mín.</th><th>Normal</th><th>Total</th></tr></thead>
              <tbody id="p4-tbody"></tbody>
            </table>
          </div>`, true)}
      </div>`;
    }

    update({ estoque }) {
        const valor = sum(estoque, 'valor');
        const rup = estoque.filter(e => e.status === 'Ruptura').length;
        const abx = estoque.filter(e => e.status === 'Abaixo_Mínimo').length;
        const risc = estoque.filter(e => e.risco_venc === 'Alto').length;

        upd('p4-val', brl(valor));
        upd('p4-rup', num(rup));
        upd('p4-abx', num(abx));
        upd('p4-risc', num(risc));

        // status bars
        const st = statusEstoque(estoque);
        const tot = estoque.length;
        const bars = [
            { k: 'Ruptura', label: 'Ruptura', color: P.red },
            { k: 'Crítico', label: 'Crítico', color: '#FFB020' },
            { k: 'Abaixo_Mínimo', label: 'Abaixo Mín.', color: P.white2 },
            { k: 'Normal', label: 'Normal', color: 'rgba(255,255,255,.11)' },
        ];
        document.getElementById('p4-sbars').innerHTML = bars.map(b => {
            const v = st[b.k] || 0, p = ((v / tot) * 100).toFixed(1);
            return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="width:88px;text-align:right;font-family:'DM Mono',monospace;font-size:10px;color:${P.white2}">${b.label}</span>
          <div style="flex:1;background:rgba(255,255,255,.05);border-radius:3px;height:22px;overflow:hidden">
            <div style="width:${p}%;height:100%;background:${b.color};border-radius:3px;display:flex;align-items:center;padding-left:8px;font-family:'DM Mono',monospace;font-size:10px;font-weight:600;color:${b.k === 'Normal' ? '#111' : '#fff'}">${v}</div>
          </div>
          <span style="font-family:'DM Mono',monospace;font-size:10px;color:${b.color};width:40px">${p}%</span>
        </div>`;
        }).join('');

        // cobertura
        const cob = coberturaFaixas(estoque);
        const ck = Object.keys(cob);
        barChart('p4-cob', {
            labels: ck,
            datasets: [{ data: Object.values(cob), backgroundColor: ck.map(k => k === '0–7d' ? P.red : k === '8–15d' ? 'rgba(232,0,13,.5)' : k === '16–30d' ? P.white : 'rgba(255,255,255,.14)'), borderRadius: 4, borderSkipped: false }],
            yFmt: v => num(v),
        });

        // tabela
        const rows = statusPorCat(estoque).slice(0, 12);
        document.getElementById('p4-tbody').innerHTML = rows.map(r => `
      <tr>
        <td class="td-name">${r.cat}</td>
        <td><span class="pill ${r.Ruptura > 0 ? 'pill-red' : 'pill-ok'}">${r.Ruptura}</span></td>
        <td style="font-family:'DM Mono',monospace;color:#FFB020">${r.Crítico}</td>
        <td style="font-family:'DM Mono',monospace;color:${P.white2}">${r.Abaixo_Mínimo}</td>
        <td style="font-family:'DM Mono',monospace;color:${P.gray}">${r.Normal}</td>
        <td style="font-family:'DM Mono',monospace;font-weight:700;color:${r.total > 150 ? P.red : r.total > 80 ? '#FFB020' : P.white2}">${r.total}</td>
      </tr>`).join('');
    }
}

// ════════════════════════════════════════════════════════════════════════
//  P5 — RUPTURAS
// ════════════════════════════════════════════════════════════════════════
export class P5_Rupturas {
    render(el) {
        el.innerHTML = `
      ${ph('Página 5 · Operacional', 'Análise de<br>Rupturas', 'Cada ruptura é receita que foi para o concorrente. Identifique padrões e impacto financeiro.')}
      <div class="grid g4 mb">
        ${kpiCard('p5-perd', 'Receita Perdida', '—', '', P.red)}
        ${kpiCard('p5-evts', 'Eventos')}
        ${kpiCard('p5-causa', 'Maior Causa')}
        ${kpiCard('p5-cat', 'Cat. Mais Afetada')}
      </div>
      <div class="grid g2">
        ${chartCard('p5-motivo', 'Por Motivo', '', `
          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:4px">
            <div style="flex:0 0 168px"><canvas id="p5-motivo" height="168"></canvas></div>
            <div id="p5-mleg" style="flex:1;display:flex;flex-wrap:wrap;gap:5px 14px"></div>
          </div>`)}
        ${chartCard('p5-mes', 'Rupturas × Receita Perdida por Mês', 'Dual-axis')}
        ${chartCard('p5-cat', 'Receita Perdida por Categoria', 'Escala de vermelho por impacto', '', true)}
      </div>`;
    }

    update({ rupturas }) {
        const perd = sum(rupturas, 'perdida');
        const porMotiv = aggRupturas(rupturas, 'motivo').sort((a, b) => b.count - a.count);
        const porCat = aggRupturas(rupturas, 'cat');
        const topM = porMotiv[0] || { label: '—', count: 0 };
        const topC = porCat[0] || { label: '—', perdida: 0 };

        upd('p5-perd', brl(perd));
        upd('p5-evts', num(rupturas.length));
        upd('p5-causa', topM.label, num(topM.count) + ' eventos');
        upd('p5-cat', topC.label, brl(topC.perdida) + ' perdidos');

        // donut motivos
        const MC = [P.red, '#FF4455', '#FF7080', 'rgba(232,0,13,.48)', 'rgba(232,0,13,.28)'];
        donutChart('p5-motivo', {
            labels: porMotiv.map(d => d.label), data: porMotiv.map(d => d.count), colors: MC, cutout: '58%',
            ttFmt: ctx => ` ${ctx.label}: ${ctx.raw} eventos`,
        });
        document.getElementById('p5-mleg').innerHTML = porMotiv.map((d, i) =>
            `<div style="display:flex;align-items:center;gap:5px;font-size:10.5px;color:${P.white2}">
        <span style="width:7px;height:7px;border-radius:50%;background:${MC[i] || '#555'};flex-shrink:0"></span>
        <span>${d.label} (${d.count})</span></div>`).join('');

        // dual por mês
        const mm = {};
        rupturas.forEach(r => {
            if (!mm[r.mes]) mm[r.mes] = { count: 0, perd: 0 };
            mm[r.mes].count++; mm[r.mes].perd += r.perdida;
        });
        const ma = MESES_ORD.filter(m => mm[m]);
        dualChart('p5-mes', {
            labels: ma.map(fmtMes),
            barDs: { type: 'bar', label: 'Qtd Rupturas', data: ma.map(m => mm[m]?.count || 0), backgroundColor: 'rgba(232,0,13,.12)', borderColor: P.red, borderWidth: 1, borderRadius: 4, yAxisID: 'y', yFmt: v => num(v) },
            lineDs: { type: 'line', label: 'Receita Perdida', data: ma.map(m => Math.round(mm[m]?.perd || 0)), borderColor: P.white, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 4, tension: .3, yAxisID: 'y2', yFmt: v => brl(v) },
        });

        // barras cat
        const top10 = porCat.slice(0, 10);
        barChart('p5-cat', {
            labels: top10.map(d => d.label),
            datasets: [{ data: top10.map(d => Math.round(d.perdida)), backgroundColor: top10.map((_, i) => `rgba(232,0,13,${(1 - i * .08).toFixed(2)})`), borderRadius: 4, borderSkipped: false }],
            horizontal: true, xFmt: v => brl(v),
        });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  P6 — METAS
// ════════════════════════════════════════════════════════════════════════
export class P6_Metas {
    render(el) {
        el.innerHTML = `
      ${ph('Página 6 · Executivo', 'Painel de<br>Metas', 'Visão gerencial de atingimento. Semáforo claro para tomada de decisão rápida.')}
      <div class="grid g3 mb">
        ${kpiCard('p6-tk', 'Ating. Ticket Médio')}
        ${kpiCard('p6-melm', 'Melhor Mês')}
        ${kpiCard('p6-mell', 'Melhor Loja')}
      </div>
      <div class="grid g2">
        ${chartCard('p6-real', 'Receita Real por Loja × Mês', 'Barras agrupadas — período selecionado', '', true)}
        ${chartCard('p6-ating', '% Atingimento por Loja × Mês', '≥95%=Branco · 80–95%=Cinza · &lt;80%=Vermelho')}
        ${chartCard('p6-radar', 'Radar de Performance', '5 dimensões · escala 0–120')}
      </div>`;
    }

    update({ vendas, atend, metas }) {
        const fat = sum(atend, 'fat'), atd = sum(atend, 'atd');
        const tk = atd > 0 ? fat / atd : 0;
        const metaTk = metas.length ? sum(metas, 'meta_ticket') / metas.length : 96.60;
        const atTk = metaTk > 0 ? (tk / metaTk) * 100 : 0;

        const mm = {};
        vendas.forEach(v => { if (!mm[v.mes]) mm[v.mes] = {}; mm[v.mes][v.loja] = (mm[v.mes][v.loja] || 0) + v.rec; });
        const ma = MESES_ORD.filter(m => mm[m]);

        const totMes = ma.map(m => ({ mes: m, tot: LOJAS.reduce((a, l) => a + (mm[m]?.[l] || 0), 0) })).sort((a, b) => b.tot - a.tot)[0];
        const totLoja = LOJAS.map(l => ({ loja: l, tot: ma.reduce((a, m) => a + (mm[m]?.[l] || 0), 0) })).sort((a, b) => b.tot - a.tot)[0];

        upd('p6-tk', pct(atTk, 0), `Meta R$${metaTk.toFixed(0)}`);
        upd('p6-melm', totMes ? fmtMes(totMes.mes) : '—', totMes ? brl(totMes.tot) : '');
        upd('p6-mell', totLoja ? totLoja.loja.replace('Araújo ', '') : '—', totLoja ? brl(totLoja.tot) : '');

        barChart('p6-real', {
            labels: ma.map(fmtMes),
            datasets: LOJAS.map((l, i) => ({ label: l.replace('Araújo ', ''), data: ma.map(m => Math.round(mm[m]?.[l] || 0)), backgroundColor: LCOL[i], borderRadius: 3 })),
            legend: true, yFmt: v => brl(v),
        });

        const metaMap = {};
        metas.forEach(m => { if (!metaMap[m.mes]) metaMap[m.mes] = {}; metaMap[m.mes][m.loja] = m.meta_fat; });
        const atCol = v => v >= 95 ? P.white : v >= 80 ? P.gray : P.red;
        barChart('p6-ating', {
            labels: ma.map(fmtMes),
            datasets: LOJAS.map((l, i) => {
                const vals = ma.map(m => { const r = mm[m]?.[l] || 0, mt = metaMap[m]?.[l] || 1; return +((r / mt) * 100).toFixed(1); });
                return { label: l.replace('Araújo ', ''), data: vals, backgroundColor: vals.map(atCol), borderRadius: 3 };
            }),
            legend: true, yFmt: v => v + '%',
        });

        radarChart('p6-radar', {
            labels: ['Faturamento', 'Ticket Médio', 'Margem Bruta', 'Giro Estoque', 'Anti-Ruptura'],
            datasets: [
                { label: 'Centro', data: [68, 104, 96, 87, 93], borderColor: P.centro, backgroundColor: 'rgba(232,0,13,.1)', borderWidth: 2, pointBackgroundColor: P.centro },
                { label: 'Norte', data: [73, 108, 98, 90, 91], borderColor: P.norte, backgroundColor: 'rgba(216,216,232,.05)', borderWidth: 2, pointBackgroundColor: P.norte },
                { label: 'Sul', data: [70, 102, 94, 85, 94], borderColor: P.sul, backgroundColor: 'rgba(90,90,114,.05)', borderWidth: 2, pointBackgroundColor: P.sul },
            ],
        });
    }
}
