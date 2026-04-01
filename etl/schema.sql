-- ═══════════════════════════════════════════════════════════════
-- SCHEMA SQL — Dashboard Supermercados Araújo
-- Banco: Supabase PostgreSQL
-- ═══════════════════════════════════════════════════════════════

-- Limpar tabelas existentes (ordem respeitando FK)
DROP TABLE IF EXISTS validade CASCADE;
DROP TABLE IF EXISTS movimentacao CASCADE;
DROP TABLE IF EXISTS estoque CASCADE;
DROP TABLE IF EXISTS dro CASCADE;
DROP TABLE IF EXISTS vendas_periodo CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS lojas CASCADE;

-- ── DIMENSÃO: LOJAS ────────────────────────────────────────────
CREATE TABLE lojas (
    id           SERIAL PRIMARY KEY,
    codigo       TEXT UNIQUE NOT NULL,        -- L01, L02, L03
    nome_interno TEXT UNIQUE NOT NULL,        -- PRIMAVERA L01
    nome_display TEXT NOT NULL                -- Primavera
);

-- ── DIMENSÃO: CATEGORIAS ───────────────────────────────────────
CREATE TABLE categorias (
    id                    SERIAL PRIMARY KEY,
    codigo_mercadologico  TEXT UNIQUE NOT NULL,  -- 032.006.003
    departamento          TEXT NOT NULL DEFAULT '',
    secao                 TEXT NOT NULL DEFAULT '',
    grupo                 TEXT NOT NULL DEFAULT ''
);

-- ── DIMENSÃO: PRODUTOS ─────────────────────────────────────────
CREATE TABLE produtos (
    id           SERIAL PRIMARY KEY,
    codigo       TEXT UNIQUE NOT NULL,           -- 917712
    descricao    TEXT NOT NULL DEFAULT '',
    embalagem    TEXT DEFAULT '',
    ncm          TEXT DEFAULT '',
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    situacao     TEXT DEFAULT 'ATIVO',
    curva        TEXT DEFAULT ''
);

CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_situacao ON produtos(situacao);

-- ── FATO: VENDAS POR PERÍODO ───────────────────────────────────
CREATE TABLE vendas_periodo (
    id                SERIAL PRIMARY KEY,
    loja_id           INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    produto_id        INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    mes               TEXT NOT NULL,              -- 2026-01
    quantidade        NUMERIC DEFAULT 0,
    venda             NUMERIC DEFAULT 0,          -- Receita
    custo_com_imposto NUMERIC DEFAULT 0,
    custo_sem_imposto NUMERIC DEFAULT 0,
    margem_bruta_pct  NUMERIC DEFAULT 0,
    lucro             NUMERIC DEFAULT 0,
    icms              NUMERIC DEFAULT 0,
    pis_cofins        NUMERIC DEFAULT 0,
    dias_efetivos     INTEGER DEFAULT 0,
    UNIQUE(loja_id, produto_id, mes)
);

CREATE INDEX idx_vendas_loja_mes ON vendas_periodo(loja_id, mes);
CREATE INDEX idx_vendas_produto ON vendas_periodo(produto_id);

-- ── FATO: DRO ──────────────────────────────────────────────────
CREATE TABLE dro (
    id              SERIAL PRIMARY KEY,
    loja_id         INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    mes             TEXT NOT NULL,
    descricao       TEXT NOT NULL,
    valor_realizado NUMERIC DEFAULT 0,
    percentual      NUMERIC DEFAULT 0,
    UNIQUE(loja_id, mes, descricao)
);

CREATE INDEX idx_dro_loja_mes ON dro(loja_id, mes);

-- ── FATO: ESTOQUE ──────────────────────────────────────────────
CREATE TABLE estoque (
    id                SERIAL PRIMARY KEY,
    loja_id           INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    produto_id        INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    data_snapshot     DATE NOT NULL,
    quantidade        NUMERIC DEFAULT 0,
    preco_venda       NUMERIC DEFAULT 0,
    custo_com_imposto NUMERIC DEFAULT 0,
    custo_sem_imposto NUMERIC DEFAULT 0,
    curva             TEXT DEFAULT '',
    UNIQUE(loja_id, produto_id, data_snapshot)
);

CREATE INDEX idx_estoque_loja ON estoque(loja_id);
CREATE INDEX idx_estoque_produto ON estoque(produto_id);

-- ── FATO: MOVIMENTAÇÃO (ENTRADA/SAÍDA) ─────────────────────────
CREATE TABLE movimentacao (
    id             SERIAL PRIMARY KEY,
    loja_id        INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    produto_id     INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    mes            TEXT NOT NULL,
    qtd_entrada    NUMERIC DEFAULT 0,
    valor_entrada  NUMERIC DEFAULT 0,
    qtd_saida      NUMERIC DEFAULT 0,
    valor_saida    NUMERIC DEFAULT 0,
    qtd_venda      NUMERIC DEFAULT 0,
    valor_venda    NUMERIC DEFAULT 0,
    custo_venda    NUMERIC DEFAULT 0,
    UNIQUE(loja_id, produto_id, mes)
);

CREATE INDEX idx_mov_loja_mes ON movimentacao(loja_id, mes);

-- ── FATO: VALIDADE ─────────────────────────────────────────────
CREATE TABLE validade (
    id               SERIAL PRIMARY KEY,
    loja_id          INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    produto_id       INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    data_validade    DATE,
    data_entrada     DATE,
    quantidade       NUMERIC DEFAULT 0,
    estoque_atual    NUMERIC DEFAULT 0,
    media_venda      NUMERIC DEFAULT 0,
    ddv              INTEGER DEFAULT 0,
    dias_restantes   INTEGER DEFAULT 0,
    risco_vencer     NUMERIC DEFAULT 0,
    custo_observacao NUMERIC DEFAULT 0,
    venda_risco      NUMERIC DEFAULT 0,
    situacao         TEXT DEFAULT 'ATIVO'
);

CREATE INDEX idx_validade_loja ON validade(loja_id);
CREATE INDEX idx_validade_produto ON validade(produto_id);
CREATE INDEX idx_validade_dias ON validade(dias_restantes);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
-- Habilita RLS mas permite leitura pública (anon key)
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_periodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE dro ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE validade ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (readonly para o dashboard)
CREATE POLICY "Leitura pública lojas" ON lojas FOR SELECT USING (true);
CREATE POLICY "Leitura pública categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Leitura pública produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Leitura pública vendas" ON vendas_periodo FOR SELECT USING (true);
CREATE POLICY "Leitura pública dro" ON dro FOR SELECT USING (true);
CREATE POLICY "Leitura pública estoque" ON estoque FOR SELECT USING (true);
CREATE POLICY "Leitura pública movimentacao" ON movimentacao FOR SELECT USING (true);
CREATE POLICY "Leitura pública validade" ON validade FOR SELECT USING (true);

-- ── VIEWS AGREGADAS (otimizam queries do dashboard) ────────────

-- Receita + margem por loja/mês
CREATE OR REPLACE VIEW vw_receita_loja_mes AS
SELECT
    l.nome_display AS loja,
    v.mes,
    SUM(v.venda) AS receita,
    SUM(v.lucro) AS lucro,
    SUM(v.custo_com_imposto) AS custo,
    CASE WHEN SUM(v.venda) > 0
        THEN ROUND((SUM(v.lucro) / SUM(v.venda)) * 100, 2)
        ELSE 0
    END AS margem_pct,
    SUM(v.quantidade) AS qtd_itens
FROM vendas_periodo v
JOIN lojas l ON l.id = v.loja_id
GROUP BY l.nome_display, v.mes
ORDER BY v.mes, l.nome_display;

-- Receita por categoria/mês (top categorias)
CREATE OR REPLACE VIEW vw_receita_categoria_mes AS
SELECT
    COALESCE(c.codigo_mercadologico, 'SEM_CAT') AS categoria,
    c.departamento,
    v.mes,
    SUM(v.venda) AS receita,
    SUM(v.lucro) AS lucro,
    SUM(v.quantidade) AS qtd_itens
FROM vendas_periodo v
JOIN produtos p ON p.id = v.produto_id
LEFT JOIN categorias c ON c.id = p.categoria_id
GROUP BY c.codigo_mercadologico, c.departamento, v.mes
ORDER BY SUM(v.venda) DESC;

-- Resumo DRO por loja/mês
CREATE OR REPLACE VIEW vw_dro_resumo AS
SELECT
    l.nome_display AS loja,
    d.mes,
    d.descricao,
    d.valor_realizado,
    d.percentual
FROM dro d
JOIN lojas l ON l.id = d.loja_id
ORDER BY d.mes, l.nome_display;

-- Status estoque (alertas)
CREATE OR REPLACE VIEW vw_estoque_status AS
SELECT
    l.nome_display AS loja,
    p.descricao AS produto,
    e.quantidade,
    e.preco_venda,
    e.curva,
    CASE
        WHEN e.quantidade <= 0 THEN 'Ruptura'
        WHEN e.quantidade <= 3 THEN 'Crítico'
        WHEN e.quantidade <= 10 THEN 'Baixo'
        ELSE 'Normal'
    END AS status
FROM estoque e
JOIN lojas l ON l.id = e.loja_id
JOIN produtos p ON p.id = e.produto_id
ORDER BY e.quantidade ASC;
