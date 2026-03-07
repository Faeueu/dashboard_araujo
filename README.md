# Dashboard Comercial — Supermercados Araújo

Sistema de análise comercial e operacional com dados reais de Dez/2025–Mar/2026.
Construído com **Vite** + vanilla JS (ES modules), Chart.js para visualizações.

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
> erros de filesystem. Neste caso, copie o `package.json` para um disco local,
> rode `npm install` lá e copie o `node_modules` de volta.

---

## Estrutura do Projeto

```
Araújo/
├── index.html                  ← HTML limpo (~50 linhas, apenas estrutura + <script module>)
├── package.json                ← Scripts dev/build/preview, dependência: Vite
├── vite.config.js              ← Configuração Vite (root, publicDir, outDir)
├── vercel.json                 ← Deploy Vercel (build → dist/)
├── .gitignore                  ← node_modules/ + dist/
│
├── public/
│   └── data/
│       └── dataset.json        ← Dataset completo (~1.75MB — vendas, estoque, rupturas, metas)
│
└── src/
    ├── main.js                 ← Entry point (importa CSS, carrega dados, inicializa app)
    ├── styles/
    │   └── main.css            ← Todo o CSS do dashboard (design tokens, layout, componentes)
    ├── core/
    │   ├── Store.js            ← Estado global reativo (Observer pattern)
    │   └── Router.js           ← Roteador SPA (hash-based, lazy page init)
    ├── components/
    │   ├── Charts.js           ← Wrapper Chart.js com defaults e factory functions
    │   ├── FilterBar.js        ← Dropdowns multi-select (Loja, Mês, Categoria)
    │   └── Sidebar.js          ← Navegação lateral + menu mobile
    ├── pages/
    │   └── pages.js            ← 6 páginas (P1–P6) em um único módulo
    └── utils/
        ├── fmt.js              ← Formatadores (BRL, %, data, delta)
        └── filters.js          ← Funções puras de filtragem e agregação
```

---

## Arquitetura

### Padrão: MVC simplificado (Observable State + Page Controllers)

```
dataset.json (fetch)
     │
     ▼
  Store.js ──────────────► FilterBar.js (Controller)
     │                           │
     │ on('change')              │ setFiltro()
     ▼                           │
  Router.js                      │
     │                           ▼
     ▼                    filters.js (funções puras)
  Page.render()  ◄────────────┘
     │
     ▼
  Charts.js + DOM
```

### Fluxo de inicialização (`src/main.js`)

1. Importa `src/styles/main.css` (injetado pelo Vite)
2. Aplica defaults do Chart.js (carregado via CDN)
3. Carrega `dataset.json` via `fetch('/data/dataset.json')`
4. Registra dados no `Store`
5. Inicializa `Sidebar`, `FilterBar` e `Router`
6. Remove tela de loading

### Módulos

**Store** — singleton reativo. Mantém filtros ativos (`lojas`, `meses`, `categorias`) e emite eventos quando mudam. Qualquer componente se registra com `Store.on('change', cb)`.

**Router** — mapeia IDs de página (`visao-geral`, `ticket` …) para classes Page. Instancia cada página uma única vez (lazy) e chama `page.render()` / `page.update(filteredData)`.

**Filters** — funções puras sem efeitos colaterais. Recebem o dataset bruto + filtros, retornam subsets e agregações. Testáveis isoladamente.

**Pages** — cada classe exporta dois métodos:
- `render(el)` → monta o HTML estático da página
- `update(filteredData)` → atualiza KPIs e reconstrói os charts

**FilterBar** — lê valores únicos do dataset, renderiza dropdowns multi-select. Ao mudar, chama `Store.setFiltro()`, disparando o ciclo de atualização.

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
| Bundler      | Vite 6.x |
| Linguagem    | JavaScript (ES modules) |
| Estilos      | CSS puro (variáveis CSS, responsive) |
| Gráficos     | Chart.js 4.4 (CDN) |
| Fontes       | Figtree + DM Mono (Google Fonts) |
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
