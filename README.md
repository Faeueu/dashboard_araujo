# Dashboard Comercial — Supermercados Araújo

Sistema de análise comercial e operacional com dados de Dez/2025–Mar/2026.
Construído com **React 19** + **ApexCharts** + **Tailwind CSS v4** + **Vite 6**.

> **Tema claro** com uso de branco, preto para texto e vermelho para destaques e ações.

---

## Tecnologias Utilizadas

| Camada       | Tecnologia                    | Versão  |
|--------------|-------------------------------|---------|
| Framework    | React                         | 19.x    |
| Bundler/Dev  | Vite                          | 6.x     |
| Linguagem    | JavaScript (JSX, ES Modules)  | ES2022  |
| Estilos      | Tailwind CSS (plugin Vite)    | 4.x     |
| Gráficos     | ApexCharts + react-apexcharts | 4.5+    |
| Fontes       | Plus Jakarta Sans + JetBrains Mono (Google Fonts) | — |
| Deploy       | Vercel (static build)         | —       |

---

## Como Rodar

```bash
# Instalar dependências (apenas na primeira vez)
npm install

# Iniciar servidor de desenvolvimento com HMR
npm run dev
```

Abrir `http://localhost:5173` no navegador.

### Outros Comandos

```bash
# Build de produção (gera pasta dist/)
npm run build

# Preview do build de produção
npm run preview
```

> **Nota Google Drive**: como o projeto está no Google Drive, `npm install` pode
> apresentar erros de filesystem (EBADF/EPERM). Neste caso, copie o `package.json`
> para um disco local, rode `npm install` lá e copie o `node_modules` de volta.

---

## Estrutura do Projeto

```
Araújo/
├── index.html                  ← HTML raiz com <div id="root"> + Google Fonts
├── package.json                ← React, ApexCharts, Tailwind CSS, Vite
├── vite.config.js              ← Plugins: @vitejs/plugin-react + @tailwindcss/vite
├── vercel.json                 ← Deploy Vercel (build → dist/)
├── .gitignore
│
├── public/
│   └── data/
│       └── dataset.json        ← Dataset completo (~1.75MB)
│
└── src/
    ├── main.jsx                ← Entry point React (loading, fetch dataset, render)
    ├── App.jsx                 ← Shell layout (sidebar + filterbar + page outlet)
    ├── index.css               ← Tailwind v4 @theme (design tokens, tema claro)
    │
    ├── core/
    │   └── DashboardContext.jsx ← React Context + hooks (dataset, filtros, memo)
    │
    ├── components/
    │   ├── Sidebar.jsx         ← Navegação lateral responsiva com menu mobile
    │   ├── FilterBar.jsx       ← Filtros reativos multi-select (Loja, Mês, Categoria)
    │   ├── Charts.jsx          ← 6 wrappers ApexCharts (Line, Bar, Donut, Scatter, Dual, Radar)
    │   ├── KpiCard.jsx         ← Card de KPI centralizado (label, valor, subtítulo)
    │   ├── ChartCard.jsx       ← Wrapper para gráficos com título e hint centralizados
    │   └── PageHeader.jsx      ← Cabeçalho centralizado com badge decorativo
    │
    ├── pages/
    │   ├── P1_VisaoGeral.jsx   ← Visão Geral Comercial (receita, ticket, margem, mix)
    │   ├── P2_Ticket.jsx       ← Análise do Ticket Médio (semanal, campanhas, heatmap)
    │   ├── P3_Margem.jsx       ← Margem & Mix (barras, scatter, grouped bars)
    │   ├── P4_Estoque.jsx      ← Gestão de Estoque (status bars, histograma, tabela)
    │   ├── P5_Rupturas.jsx     ← Rupturas (donut com legendas, dual-axis, barras)
    │   └── P6_Metas.jsx        ← Metas e Performance (grouped bars, %, radar)
    │
    └── utils/
        ├── fmt.js              ← Formatadores (BRL, %, data, abreviações)
        └── filters.js          ← Funções puras de filtragem e agregação
```

---

## Arquitetura

### React Context + Componentes Reativos

```
dataset.json (fetch)
     │
     ▼
 DashboardProvider (Context)
     │
     ├─── filtros (lojas, meses, cats)
     ├─── filteredData (useMemo)
     │
     ▼
   App.jsx
     ├── Sidebar ────── setPage()
     ├── FilterBar ──── setFiltro() → re-render automático
     └── Page Outlet (max-width 1400px, centralizado)
           ├── P1_VisaoGeral ← useFilteredData()
           ├── P2_Ticket     ← useFilteredData()
           ├── P3_Margem     ← useFilteredData()
           ├── P4_Estoque    ← useFilteredData()
           ├── P5_Rupturas   ← useFilteredData()
           └── P6_Metas      ← useFilteredData()
```

### Fluxo de Inicialização (`src/main.jsx`)

1. Importa `src/index.css` (Tailwind v4 + design tokens do tema claro)
2. Exibe tela de loading animada (fundo claro, barra vermelha)
3. Carrega `dataset.json` via `fetch('/data/dataset.json')`
4. Renderiza `<DashboardProvider>` com dataset
5. `<App>` monta sidebar, filterbar e page outlet
6. Remove tela de loading com transição de opacidade

---

## Design System

### Tema Claro

| Token          | Valor     | Uso                        |
|----------------|-----------|----------------------------|
| `--color-bg`   | `#F5F6FA` | Fundo geral                |
| `--color-surf` | `#FFFFFF` | Sidebar, topbar            |
| `--color-card` | `#FFFFFF` | Cards, chart wrappers      |
| `--color-primary` | `#DC2626` | Vermelho — destaques, alertas |
| `--color-text-1` | `#0F172A` | Texto principal (quase preto) |
| `--color-text-2` | `#475569` | Texto secundário           |
| `--color-text-3` | `#94A3B8` | Labels, hints              |

### Tipografia

- **Fonte principal**: Plus Jakarta Sans (300–800)
- **Fonte mono**: JetBrains Mono (400–700)
- **Tamanho base**: 15px
- **Títulos de página**: `clamp(26px, 3.5vw, 36px)` — responsivo
- **Valores KPI**: 28px extrabold, centralizado
- **Labels de gráfico**: 12–13px, peso 500–600

### Gráficos (ApexCharts)

- **Alturas padrão**: 280–400px (variável por tipo)
- **Data labels**: habilitados em gráficos de barras
- **Marcadores de linha**: 4–5px com borda branca
- **Tooltips**: tema claro com sombra suave
- **Legendas**: posição top, 13px bold
- **Cores**: vermelho (#DC2626), cinza (#64748B, #94A3B8), preto (#1E293B)

---

## Dataset (`public/data/dataset.json`)

| Tabela     | Registros | Granularidade |
|------------|-----------|---------------|
| `vendas`   | 4.716     | Dia × Loja × Categoria × Campanha |
| `atend`    | 363       | Dia × Loja (Faturamento + Atendimentos) |
| `estoque`  | 6.000     | Snapshot Loja × SKU |
| `rupturas` | 612       | Evento × Loja × SKU |
| `metas`    | 12        | Mês × Loja |

---

## Páginas do Dashboard

### P1 — Visão Geral Comercial
4 KPIs (Receita, Ticket, Margem, Top Categoria) + 4 gráficos (linha semanal, barras por loja, donut mix, barras DOW).

### P2 — Análise do Ticket Médio
3 KPIs + linha semanal vs meta + barras campanhas + heatmap loja×dia.

### P3 — Margem & Mix de Produtos
4 KPIs + barras horizontais margem% + scatter receita×margem + barras agrupadas por loja/mês.

### P4 — Gestão de Estoque
4 KPIs + status bars animadas + histograma cobertura + tabela SKUs críticos com pills.

### P5 — Análise de Rupturas
4 KPIs + donut por motivo com legendas + dual-axis (barras qtd + linha R$) + barras impacto por categoria.

### P6 — Metas e Performance
3 KPIs + barras agrupadas receita + barras % atingimento (semáforo) + radar 5 dimensões.

---

## Deploy (Vercel)

O `vercel.json` já está configurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

Deploy manual:

```bash
npm run build        # Gera dist/
npx vercel --prod    # Publica
```

---

## Modelo de Dados Power BI

### Relacionamentos (Star Schema)

```
dCalendario ──┐
dLojas      ──┼──► fVendas   (central)
dSKUs       ──┤
dCampanhas  ──┘

dLojas  + dSKUs       ──► fEstoque
dLojas  + dCalendario ──► fRupturas
dLojas  + dCalendario ──► fMetas
```

Regras:
- Direção: sempre **Dimensão → Fato** (sentido único)
- Cardinalidade: **1 para Muitos** em todos os relacionamentos
- Nunca bidirecional sem necessidade explícita

---

## Medidas DAX Essenciais

Organizar todas em uma tabela vazia `_Medidas`. Nunca soltar medidas em tabelas de dados.

### Faturamento

```dax
Receita Líquida = SUM(fVendas[Receita_Liquida])

Receita MoM = CALCULATE([Receita Líquida], DATEADD(dCalendario[Data], -1, MONTH))

Δ% MoM = DIVIDE([Receita Líquida] - [Receita MoM], [Receita MoM])

Receita MTD = TOTALMTD([Receita Líquida], dCalendario[Data])
```

### Ticket Médio

```dax
-- Usar fAtendimentos, NUNCA média de Margem_Bruta_Pct direto
Ticket Médio = DIVIDE(
    SUM(fAtendimentos[Faturamento_Dia]),
    SUM(fAtendimentos[Atendimentos])
)

% Ating. Ticket = DIVIDE([Ticket Médio], AVERAGE(fMetas[Meta_Ticket_Medio]))
```

### Margem

```dax
-- NUNCA: AVERAGE(fVendas[Margem_Bruta_Pct]) — resultado incorreto
% Margem Bruta = DIVIDE(SUM(fVendas[Margem_Bruta]), [Receita Líquida])
```

### Estoque e Rupturas

```dax
SKUs em Ruptura =
    CALCULATE(COUNTROWS(fEstoque), fEstoque[Status_Estoque] = "Ruptura")

Ruptura Curva A =
    CALCULATE([SKUs em Ruptura], dSKUs[Curva_ABC] = "A")

Cobertura Média =
    AVERAGEX(
        FILTER(fEstoque, fEstoque[Venda_Media_Dia] > 0),
        fEstoque[Cobertura_Dias]
    )
```

### Metas e Semáforo

```dax
% Ating. Fat = DIVIDE([Receita Líquida], SUM(fMetas[Meta_Faturamento]))

Semáforo =
    SWITCH(TRUE(),
        [% Ating. Fat] >= 0.95, "🟢",
        [% Ating. Fat] >= 0.80, "🟡",
        "🔴"
    )
```

---

## Histórico de Versões

| Versão | Data       | Mudanças Principais |
|--------|------------|---------------------|
| v4.0   | Mar/2026   | Tema claro, ApexCharts, gráficos maiores, UI refinada |
| v3.0   | Mar/2026   | Migração para React + Tailwind v4 + Vite |
| v2.0   | Mar/2026   | Refatoração para módulos ES (vanilla JS) |
| v1.0   | Fev/2026   | Versão inicial monolítica (HTML + CSS + JS inline) |
