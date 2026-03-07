// src/main.js — Entry point do Dashboard Araújo
// Importa CSS, carrega dataset e inicializa componentes.

import './styles/main.css';

import Store from './core/Store.js';
import { Router } from './core/Router.js';
import { applyDefaults } from './components/Charts.js';
import { FilterBar } from './components/FilterBar.js';
import { Sidebar } from './components/Sidebar.js';
import { P1_VisaoGeral, P2_Ticket, P3_Margem, P4_Estoque, P5_Rupturas, P6_Metas } from './pages/pages.js';

// ── Chart.js defaults (Chart.js é carregado via CDN no HTML) ──
applyDefaults(Chart);

// ── Mapa de rotas ──
const ROUTES = {
    'visao-geral': P1_VisaoGeral,
    'ticket': P2_Ticket,
    'margem': P3_Margem,
    'estoque': P4_Estoque,
    'rupturas': P5_Rupturas,
    'metas': P6_Metas,
};

// ── Bootstrap ──
(async () => {
    const ldEl = document.getElementById('loading');

    try {
        // Carrega dataset via fetch (antes estava inline no HTML)
        const resp = await fetch('/data/dataset.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        // Registra no Store
        Store.setDataset(data);

        // Inicializa componentes
        new Sidebar(
            document.getElementById('sidebar'),
            document.getElementById('hamburger'),
            document.getElementById('overlay'),
        );

        new FilterBar(document.getElementById('filterbar'));

        const router = new Router(
            document.getElementById('outlet'),
            ROUTES,
        );
        router.start();

        // Remove tela de loading
        ldEl?.classList.add('hide');
        setTimeout(() => ldEl?.remove(), 500);

    } catch (err) {
        console.error('Falha ao carregar dataset:', err);
        if (ldEl) {
            const txt = ldEl.querySelector('.ld-txt');
            if (txt) txt.textContent = 'Erro ao carregar dados. Recarregue a página.';
        }
    }
})();
