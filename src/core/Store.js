// src/core/Store.js
// Estado global reativo — Observer pattern
// Mantém filtros ativos e notifica subscribers em mudanças.

const Store = (() => {
  let _dataset = null;

  const _state = {
    filtros: { lojas: [], meses: [], cats: [] },
    page: 'visao-geral',
  };

  const _listeners = {};

  function on(ev, fn) {
    (_listeners[ev] = _listeners[ev] || []).push(fn);
    return () => off(ev, fn);
  }

  function off(ev, fn) {
    if (_listeners[ev]) _listeners[ev] = _listeners[ev].filter(f => f !== fn);
  }

  function emit(ev, data) {
    (_listeners[ev] || []).forEach(fn => fn(data));
  }

  function setDataset(data) {
    _dataset = data;
    emit('ready', data);
  }

  function getDataset() { return _dataset; }

  function getFiltros() { return { ..._state.filtros, lojas: [..._state.filtros.lojas], meses: [..._state.filtros.meses], cats: [..._state.filtros.cats] }; }

  function setFiltro(campo, val) {
    _state.filtros[campo] = Array.isArray(val) ? [...val] : val;
    emit('filtros', getFiltros());
  }

  function clearFiltros() {
    _state.filtros = { lojas: [], meses: [], cats: [] };
    emit('filtros', getFiltros());
  }

  function hasActiveFiltros() {
    const f = _state.filtros;
    return f.lojas.length > 0 || f.meses.length > 0 || f.cats.length > 0;
  }

  function setPage(id) {
    _state.page = id;
    emit('page', id);
  }

  function getPage() { return _state.page; }

  return { on, off, emit, setDataset, getDataset, getFiltros, setFiltro, clearFiltros, hasActiveFiltros, setPage, getPage };
})();

export default Store;
