// src/components/Sidebar.js

import Store from '../core/Store.js';

const ROUTES = [
    { id: 'visao-geral', label: 'Visão Geral' },
    { id: 'ticket', label: 'Ticket Médio' },
    { id: 'margem', label: 'Margem & Mix' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'rupturas', label: 'Rupturas' },
    { id: 'metas', label: 'Metas' },
];

export class Sidebar {
    constructor(sbEl, hbgEl, ovEl) {
        this._sb = sbEl;
        this._hbg = hbgEl;
        this._ov = ovEl;

        this._sb.innerHTML = `
      <div class="sb-logo">
        <div class="sb-tag">Dashboard · v3</div>
        <div class="sb-name">Supermercados<br><em>Araújo</em></div>
      </div>
      <nav class="sb-nav">
        <span class="sb-sec">Análises</span>
        ${ROUTES.map(r => `
          <a class="sb-item" data-page="${r.id}" role="button" tabindex="0">
            <span class="sb-dot"></span><span>${r.label}</span>
          </a>`).join('')}
      </nav>
      <div class="sb-foot">Base v3 · Dez/2025–Mar/2026<br>3 Lojas · 4.400 SKUs</div>`;

        this._mark(Store.getPage());
        Store.on('page', id => this._mark(id));

        this._sb.addEventListener('click', e => {
            const item = e.target.closest('[data-page]');
            if (item) { Store.setPage(item.dataset.page); this._close(); }
        });

        this._hbg?.addEventListener('click', () => this._toggle());
        this._ov?.addEventListener('click', () => this._close());
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this._close(); });
        window.addEventListener('resize', () => { if (window.innerWidth > 860) this._close(); });
    }

    _mark(id) {
        this._sb.querySelectorAll('.sb-item').forEach(el =>
            el.classList.toggle('active', el.dataset.page === id));
    }

    _toggle() {
        const open = this._sb.classList.toggle('open');
        this._ov?.classList.toggle('on', open);
        this._hbg?.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    _close() {
        this._sb.classList.remove('open');
        this._ov?.classList.remove('on');
        this._hbg?.classList.remove('open');
        document.body.style.overflow = '';
    }
}
