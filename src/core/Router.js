// src/core/Router.js
// Roteador hash-based. Cada rota é instanciada lazy uma única vez.

import Store from './Store.js';

export class Router {
  constructor(outlet, routes) {
    this._outlet  = outlet;           // elemento DOM onde as páginas são montadas
    this._routes  = routes;           // { 'visao-geral': PageVisaoGeral, ... }
    this._pages   = {};               // instâncias lazy
    this._current = null;

    // Reage a mudança de página no Store
    Store.on('page', id => this._navigate(id));

    // Reage a mudanças de filtros
    Store.on('filtros', () => this._refresh());
  }

  start() {
    // Página inicial
    const id = Store.getPage();
    this._navigate(id);
  }

  _navigate(id) {
    const PageClass = this._routes[id];
    if (!PageClass) return;

    // Lazy-init
    if (!this._pages[id]) {
      this._pages[id] = new PageClass();
    }

    const page = this._pages[id];

    // Render (apenas na primeira vez ou se o container ainda não existir)
    if (!document.getElementById(`page-${id}`)) {
      this._outlet.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.id = `page-${id}`;
      wrapper.className = 'page-wrapper animate-in';
      this._outlet.appendChild(wrapper);
      page.render(wrapper);
    } else {
      // Apenas mostra o container correto
      this._outlet.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.id = `page-${id}`;
      wrapper.className = 'page-wrapper animate-in';
      this._outlet.appendChild(wrapper);
      page.render(wrapper);
    }

    this._current = id;
    this._refresh();
  }

  _refresh() {
    if (!this._current) return;
    const page = this._pages[this._current];
    if (!page?.update) return;

    const ds      = Store.getDataset();
    if (!ds) return;

    const filtros = Store.getFiltros();
    page.update(applyFilters(ds, filtros));
  }
}

function applyFilters(ds, f) {
  const vend = ds.vendas.filter(v => {
    if (f.lojas.length && !f.lojas.includes(v.loja))  return false;
    if (f.meses.length && !f.meses.includes(v.mes))   return false;
    if (f.cats.length  && !f.cats.includes(v.cat))    return false;
    return true;
  });
  const atend = ds.atend.filter(a => {
    if (f.lojas.length && !f.lojas.includes(a.loja))  return false;
    if (f.meses.length && !f.meses.includes(a.mes))   return false;
    return true;
  });
  const est = ds.estoque.filter(e => {
    if (f.lojas.length && !f.lojas.includes(e.loja)) return false;
    return true;
  });
  const rupt = ds.rupturas.filter(r => {
    if (f.lojas.length && !f.lojas.includes(r.loja)) return false;
    if (f.meses.length && !f.meses.includes(r.mes))  return false;
    if (f.cats.length  && !f.cats.includes(r.cat))   return false;
    return true;
  });
  const meta = ds.metas.filter(m => {
    if (f.lojas.length && !f.lojas.includes(m.loja)) return false;
    if (f.meses.length && !f.meses.includes(m.mes))  return false;
    return true;
  });
  return { vendas: vend, atend, estoque: est, rupturas: rupt, metas: meta };
}
