"""
config.py — Constantes e mapeamentos centrais do ETL
"""
import os

# ── Diretórios ──────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DADOS_DIR = os.path.join(BASE_DIR, '..', 'dados')

# ── Lojas ───────────────────────────────────────────────────────
# Mapa: nome interno do VR Master → (codigo, nome_display)
LOJAS = {
    'PRIMAVERA L01': ('L01', 'Primavera'),
    'ARAUJO L02':    ('L02', 'Araújo'),
    'MARAUTO L03':   ('L03', 'Marauto'),
}

# Pastas internas → nome_interno do VR
PASTA_LOJA = {
    'primavera': 'PRIMAVERA L01',
    'araujo':    'ARAUJO L02',
    'marauto':   'MARAUTO L03',
}

# ── Meses disponíveis ───────────────────────────────────────────
MESES_ARQUIVOS = {
    '2026-01': 'janeiro2026.xlsx',
    '2026-02': 'fevereiro2026.xlsx',
    '2026-03': 'março2026.xlsx',
}

# Mapeamento mês VR (01/2026) → formato ISO (2026-01)
def mes_vr_to_iso(mes_vr: str) -> str:
    """
    Converte '01/2026' → '2026-01'
    """
    parts = mes_vr.strip().split('/')
    if len(parts) == 2:
        return f"{parts[1]}-{parts[0].zfill(2)}"
    return mes_vr

# ── Fontes de dados (pastas relativas a DADOS_DIR) ─────────────
FONTES = {
    'vendas':        'vendaPediodo',
    'dro':           'DRO',
    'estoque':       'estoqueLoja',
    'cadastro':      'cadastroProduto',
    'entrada_saida': 'entrada_saida',
    'inventario':    'inventario',
    'validade':      'validade',
}

# ── Colunas das planilhas ───────────────────────────────────────
# Vendas Período — colunas relevantes e seus tipos esperados
COLS_VENDAS = {
    'Produto':               'codigo',
    'Descrição':             'descricao',
    'Código de Barras':      'cod_barras',
    'Quantidade':            'quantidade',
    'Custo c/ Imposto':      'custo_com_imposto',
    'Venda':                 'venda',
    'Margem Bruta':          'margem_bruta_pct',
    'Lucro':                 'lucro',
    'ICMS':                  'icms',
    'PIS/COFINS':            'pis_cofins',
    'Custo s/ Imposto':      'custo_sem_imposto',
    'Dias Efetivos Venda':   'dias_efetivos',
}

# DRO — formato especial (linhas = contas contábeis)
COLS_DRO = {
    'Descrição':  'descricao',
    'Valor':      'valor_realizado',
    'Percentual': 'percentual',
}

# Estoque Loja — colunas relevantes
COLS_ESTOQUE = {
    'Produto':               'produto_raw',  # "917712 -  CALDO MAGGI..."
    'Embalagem':             'embalagem',
    'Código de Barras':      'cod_barras',
    'Preço Venda':           'preco_venda',
    'Custo c/ Imposto':      'custo_com_imposto',
    'Custo s/ Imposto':      'custo_sem_imposto',
    'Curva':                 'curva',
    'Estoque':               'quantidade',
}

# Cadastro de Produtos
COLS_CADASTRO = {
    'Código':        'codigo',
    'Descrição':     'descricao',  # primeira coluna "Descrição"
    'Embalagem':     'embalagem',
    'NCM':           'ncm',
    'Mercadológico': 'mercadologico',
    'Situação':      'situacao',
    'Família':       'familia',
}

# Entrada/Saída
COLS_ENTRADA_SAIDA = {
    'Produto':          'codigo',
    'Descrição':        'descricao',
    'Qtd. Entrada':     'qtd_entrada',
    'Entrada':          'valor_entrada',
    'Qtd. Saída':       'qtd_saida',
    'Saída':            'valor_saida',
    'Qtd. Venda':       'qtd_venda',
    'Venda':            'valor_venda',
    'Custo Venda':      'custo_venda',
    'Estoque Atual':    'estoque_atual',
}

# Inventário
COLS_INVENTARIO = {
    'Código':            'codigo',
    'Descrição':         'descricao',
    'Data':              'data_ref',
    'Embalagem':         'embalagem',
    'Quantidade':        'quantidade',
    'Preço Venda':       'preco_venda',
    'Custo c/ Imposto':  'custo_com_imposto',
    'Custo s/ Imposto':  'custo_sem_imposto',
    'Loja':              'loja_raw',
}

# Validade
COLS_VALIDADE = {
    'Produto':               'codigo',
    'Descrição':             'descricao',
    'Data Validade':         'data_validade',
    'Data Entrada':          'data_entrada',
    'Quantidade':            'quantidade',
    'Estoque Atual':         'estoque_atual',
    'Média':                 'media_venda',
    'DDV':                   'ddv',
    'Dias Restantes':        'dias_restantes',
    'Risco de Vencer':       'risco_vencer',
    'Custo em Observação':   'custo_observacao',
    'Venda em Risco':        'venda_risco',
    'Estoque em Alerta':     'estoque_alerta',
    'Situação':              'situacao',
    'Loja':                  'loja_raw',
}
