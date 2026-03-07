// src/components/FilterBar.js
// Barra de filtros interativos multi-select (Loja, Mês, Categoria)

import Store from '../core/Store.js';
import { uniq } from '../utils/filters.js';
import { mes as fmtMes } from '../utils/fmt.js';

const CAMPO_MAP  = { loja: 'lojas', mes: 'meses', cat: 'cats' };
const LABEL_MAP  = { loja: 'Loja',  mes: 'Mês',   cat: 'Categoria' };
const FORMAT_MAP = { loja: v => v, mes: fmtMes, cat: v => v };

export class FilterBar {
  constructor(el) {
    this._el = el;
    this._open = null;
    this._build();

    // Rebuild quando dataset carregado
    Store.on('ready', () => this._build());
    // Sincroniza visual após filtros mudarem externamente
    Store.on('filtros', () => this._syncLabels());

    // Fechar ao clicar fora
    document.addEventListener('click', e => {
      if (!e.target.closest('.fb-group') && !e.target.closest('.fb-dd')) this._closeAll();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this._closeAll(); });
  }

  _build() {
    const ds = Store.getDataset();
    if (!ds) { this._el.innerHTML = '<div class="fb-empty">Carregando filtros…</div>'; return; }

    const lojas = uniq(ds.vendas, 'loja');
    const meses  = uniq(ds.vendas, 'mes').sort();
    const cats   = uniq(ds.vendas, 'cat').sort();
    const opts   = { loja: lojas, mes: meses, cat: cats };

    const f = Store.getFiltros();

    this._el.innerHTML = `
      <div class="fb-inner">
        <span class="fb-label">Filtrar</span>
        ${['loja','mes','cat'].map(c => this._ddHtml(c, opts[c], f[CAMPO_MAP[c]])).join('')}
        <button class="fb-clear ${Store.hasActiveFiltros() ? '' : 'hidden'}" id="fb-clear-all">
          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          Limpar
        </button>
      </div>`;

    this._el.addEventListener('click', e => {
      // toggle dropdown
      const btn = e.target.closest('[data-dd]');
      if (btn) { e.stopPropagation(); this._toggle(btn.dataset.dd); return; }
      // selecionar item
      const item = e.target.closest('[data-campo][data-val]');
      if (item) { e.stopPropagation(); this._pick(item.dataset.campo, item.dataset.val); return; }
      // limpar individual
      const clr = e.target.closest('[data-clear]');
      if (clr) { e.stopPropagation(); Store.setFiltro(CAMPO_MAP[clr.dataset.clear], []); this._build(); return; }
      // limpar todos
      if (e.target.closest('#fb-clear-all')) { Store.clearFiltros(); this._build(); }
    });
  }

  _ddHtml(campo, opcoes, ativos) {
    const hasActive = ativos.length > 0;
    const fmt       = FORMAT_MAP[campo];
    const label     = hasActive
      ? (ativos.length === 1 ? fmt(ativos[0]) : `${ativos.length} selecionados`)
      : LABEL_MAP[campo];

    return `
      <div class="fb-group ${hasActive ? 'active' : ''}" data-campo="${campo}">
        <button class="fb-btn" data-dd="${campo}">
          <span class="fb-btn-txt">${label}</span>
          <svg class="fb-chev" width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.8l3 2.8 3-2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>
        </button>
        <div class="fb-dd" id="dd-${campo}">
          <div class="fb-dd-head">
            <span>${LABEL_MAP[campo]}</span>
            ${hasActive ? `<button class="fb-dd-clr" data-clear="${campo}">limpar</button>` : ''}
          </div>
          <ul class="fb-list">
            ${opcoes.map(op => `
              <li class="fb-item ${ativos.includes(op) ? 'sel' : ''}" data-campo="${campo}" data-val="${op}">
                <span class="fb-check">${ativos.includes(op) ? '✓' : ''}</span>
                <span>${fmt(op)}</span>
              </li>`).join('')}
          </ul>
        </div>
      </div>`;
  }

  _toggle(campo) {
    const dd = document.getElementById(`dd-${campo}`);
    if (!dd) return;
    const isOpen = dd.classList.contains('open');
    this._closeAll();
    if (!isOpen) { dd.classList.add('open'); this._open = campo; }
  }

  _closeAll() {
    this._el.querySelectorAll('.fb-dd.open').forEach(d => d.classList.remove('open'));
    this._open = null;
  }

  _pick(campo, val) {
    const storeKey = CAMPO_MAP[campo];
    const cur      = [...Store.getFiltros()[storeKey]];
    const idx      = cur.indexOf(val);
    if (idx === -1) cur.push(val); else cur.splice(idx, 1);
    Store.setFiltro(storeKey, cur);
    // Atualizar só o item e label sem reconstruir tudo
    this._updateItem(campo, val, cur.includes(val));
    this._updateBtnLabel(campo, cur);
    // Botão limpar todos
    const clrAll = document.getElementById('fb-clear-all');
    if (clrAll) clrAll.classList.toggle('hidden', !Store.hasActiveFiltros());
  }

  _updateItem(campo, val, sel) {
    const li = this._el.querySelector(`[data-campo="${campo}"][data-val="${val}"]`);
    if (!li) return;
    li.classList.toggle('sel', sel);
    const chk = li.querySelector('.fb-check');
    if (chk) chk.textContent = sel ? '✓' : '';
  }

  _updateBtnLabel(campo, ativos) {
    const fmt  = FORMAT_MAP[campo];
    const btn  = this._el.querySelector(`[data-dd="${campo}"] .fb-btn-txt`);
    const grp  = this._el.querySelector(`[data-campo="${campo}"].fb-group`);
    if (!btn) return;
    if (ativos.length === 0) {
      btn.textContent = LABEL_MAP[campo];
      grp?.classList.remove('active');
    } else if (ativos.length === 1) {
      btn.textContent = fmt(ativos[0]);
      grp?.classList.add('active');
    } else {
      btn.textContent = `${ativos.length} selecionados`;
      grp?.classList.add('active');
    }
  }

  _syncLabels() {
    const f = Store.getFiltros();
    ['loja','mes','cat'].forEach(c => this._updateBtnLabel(c, f[CAMPO_MAP[c]]));
  }
}
