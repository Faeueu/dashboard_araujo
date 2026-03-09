# Dashboard Comercial — Supermercados Araújo

Sistema de análise comercial e operacional com dados de Dez/2025–Mar/2026.
Construído com **React** + **ApexCharts** + **Tailwind CSS v4** + **Vite**.

---

## Como rodar

```bash
# Instalar dependências (apenas na primeira vez)
npm install

# Iniciar servidor de desenvolvimento com HMR
npm run dev
```

Abrir `http://localhost:5173` no navegador.

### Outros comandos

```bash
# Build de produção (gera pasta dist/)
npm run build

# Preview do build de produção
npm run preview
```

> **Nota**: como o projeto está no Google Drive, `npm install` pode apresentar
> erros de filesystem (EBADF/EPERM). Neste caso, copie o `package.json` para um
> disco local, rode `npm install` lá e copie o `node_modules` de volta.

---

## Estrutura do Projeto

```
Araújo/
├── index.html                  ← HTML com <div id="root"> + fontes Inter/JetBrains Mono
├── package.json                ← React, ApexCharts, Tailwind CSS, Vite
├── vite.config.js              ← Plugins: @vitejs/plugin-react + @tailwindcss/vite
├── vercel.json                 ← Deploy Vercel (build → dist/)
├── .gitignore
│
├── public/
│   └── data/
│       └── dataset.json        ← Dataset completo (~1.75MB — vendas, estoque, rupturas, metas)
│
└── src/
    ├── main.jsx                ← Entry point React (loading screen, fetch dataset, render <App/>)
    ├── App.jsx                 ← Shell layout (sidebar + filterbar + page outlet)
    ├── index.css               ← Tailwind v4 @theme tokens, reset, animações, overrides ApexCharts
    │
    ├── core/
    │   └── DashboardContext.jsx ← React Context + hooks (dataset, filtros, dados filtrados memoizados)
    │
    ├── components/
    │   ├── Sidebar.jsx         ← Navegação lateral com ícones + menu mobile responsivo
    │   ├── FilterBar.jsx       ← Filtros multi-select reativos (Loja, Mês, Categoria)
    │   ├── Charts.jsx          ← 6 wrappers ApexCharts (Line, Bar, Donut, Scatter, Radar, Mixed)
    │   ├── KpiCard.jsx         ← Card de KPI reutilizável (label, valor, subtítulo, cor)
    │   ├── ChartCard.jsx       ← Wrapper para gráficos com título e hint
    │   └── PageHeader.jsx      ← Cabeçalho padronizado (badge, título, descrição)
    │
    ├── pages/
    │   ├── P1_VisaoGeral.jsx   ← Visão Geral Comercial (receita, ticket, margem, mix)
    │   ├── P2_Ticket.jsx       ← Análise do Ticket Médio (semanal, campanhas, heatmap)
    │   ├── P3_Margem.jsx       ← Margem & Mix de Produtos (scatter, mensal por loja)
    │   ├── P4_Estoque.jsx      ← Gestão de Estoque (status bars, cobertura, tabela críticos)
    │   ├── P5_Rupturas.jsx     ← Análise de Rupturas (motivo donut, dual-axis, categorias)
    │   └── P6_Metas.jsx        ← Painel de Metas (atingimento, radar de performance)
    │
    └── utils/
        ├── fmt.js              ← Formatadores (BRL, %, data, delta)
        └── filters.js          ← Funções puras de filtragem e agregação
```

---

## Arquitetura

### Padrão: React Context + Componentes Reativos

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
     └── Page Outlet
           ├── P1_VisaoGeral ← useFilteredData()
           ├── P2_Ticket     ← useFilteredData()
           ├── P3_Margem     ← useFilteredData()
           ├── P4_Estoque    ← useFilteredData()
           ├── P5_Rupturas   ← useFilteredData()
           └── P6_Metas      ← useFilteredData()
```

### Fluxo de inicialização (`src/main.jsx`)

1. Importa `src/index.css` (Tailwind v4 + design tokens)
2. Exibe tela de loading animada
3. Carrega `dataset.json` via `fetch('/data/dataset.json')`
4. Renderiza `<DashboardProvider>` com dataset
5. `<App>` monta sidebar, filterbar e page outlet
6. Remove tela de loading

### Módulos

**DashboardContext** — React Context com `useMemo` para dados filtrados. Expõe hooks `useDashboard()` e `useFilteredData()`. Substitui o antigo Store.js (Observer pattern) por reatividade nativa do React.

**App.jsx** — Shell layout que mapeia IDs de página (`visao-geral`, `ticket` …) para componentes React. A página ativa é renderizada dentro do outlet com animação `fadeUp`.

**FilterBar** — Lê valores únicos do dataset, renderiza dropdowns multi-select com checkmarks. Ao mudar, chama `setFiltro()` no Context, disparando re-render de toda a árvore com dados filtrados atualizados via `useMemo`.

**Charts.jsx** — 6 componentes wrapper para `react-apexcharts` com tema padrão do dashboard: `LineChart`, `BarChart`, `DonutChart`, `ScatterChart`, `RadarChart`, `MixedChart`. Opções são memoizadas via `useMemo`.

**Filters** (`utils/filters.js`) — Funções puras sem efeitos colaterais. Recebem arrays e retornam agregações. Preservadas integralmente da versão anterior.

**Pages** — Cada página é um componente React que:
1. Consome `useFilteredData()` para obter dados filtrados
2. Calcula KPIs e séries de gráficos
3. Renderiza `KpiCard`, `ChartCard` e componentes de gráfico

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

## Stack Técnica

| Camada       | Tecnologia |
|--------------|------------|
| Framework    | React 19.x |
| Bundler      | Vite 6.x |
| Linguagem    | JavaScript (JSX, ES modules) |
| Estilos      | Tailwind CSS 4.x (plugin Vite, `@theme` tokens) |
| Gráficos     | ApexCharts 4.x + react-apexcharts |
| Fontes       | Inter + JetBrains Mono (Google Fonts) |
| Deploy       | Vercel (static build) |

---

## Deploy (Vercel)

O `vercel.json` já está configurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

Para deploy manual:

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

## Implantação no Power BI

### 1 — Conectar o Excel
Home → Obter Dados → Excel → marcar todas as abas de dados (excluir 📋 Início e 📐 Dicionário).

### 2 — Power Query
- Prefixar tabelas: `f` = fato, `d` = dimensão
- Em **fVendas**: remover colunas `Dia_Semana` e `Categoria` (redundantes — estão nas dimensões)
- Converter coluna `Data` para tipo **Data** em todas as tabelas

### 3 — Criar dCalendario via DAX
Modelagem → Nova Tabela:

```dax
dCalendario = ADDCOLUMNS(
  CALENDAR(DATE(2025,12,1), DATE(2026,3,31)),
  "Ano",         YEAR([Date]),
  "Mes",         MONTH([Date]),
  "Mes_Ano",     FORMAT([Date], "MMM/YYYY"),
  "Dia_Semana",  FORMAT([Date], "DDDD"),
  "Nr_DiaSem",   WEEKDAY([Date], 2),
  "FimSemana",   IF(WEEKDAY([Date],2) >= 6, "Sim", "Não")
)
```

Depois: **Modelagem → Marcar como Tabela de Datas → coluna Date**.

### 4 — Criar dCampanhas
Modelagem → Inserir Dados → tabela: `Campanha | Tipo | Tem_Desconto`.

### 5 — Relacionamentos
Aba Modelo: arrastar chaves. Confirmar direção Dimensão → Fato, cardinalidade 1→*.

### 6 — Tabela _Medidas
Modelagem → Nova Tabela → `_Medidas = {}`. Organizar medidas em pastas: Financeiro, Estoque, Metas, Auxiliares.

### 7 — Sincronizar Slicers
Exibição → Sincronizar Segmentações → habilitar **Loja** e **Período** para todas as páginas.
