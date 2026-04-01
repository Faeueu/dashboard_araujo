"""
transform.py — Transforma dados brutos extraídos em registros prontos 
para inserção no Supabase. Gera tabelas de dimensão (lojas, categorias, produtos).
"""
from config import LOJAS, PASTA_LOJA


def build_lojas() -> list[dict]:
    """Gera registros da tabela `lojas`."""
    result = []
    for nome_interno, (codigo, display) in LOJAS.items():
        result.append({
            'codigo': codigo,
            'nome_interno': nome_interno,
            'nome_display': display,
        })
    return result


def build_categorias(cadastro_rows: list[dict]) -> list[dict]:
    """
    Extrai categorias únicas do campo mercadológico.
    Formato: '032.006.003' → departamento=032, secao=006, grupo=003
    """
    seen = set()
    result = []
    for row in cadastro_rows:
        merc = row.get('mercadologico', '').strip()
        if not merc or merc in seen:
            continue
        seen.add(merc)

        parts = merc.split('.')
        result.append({
            'codigo_mercadologico': merc,
            'departamento': parts[0] if len(parts) > 0 else '',
            'secao':        parts[1] if len(parts) > 1 else '',
            'grupo':        parts[2] if len(parts) > 2 else '',
        })

    return result


def build_produtos(cadastro_rows: list[dict], categorias_map: dict) -> list[dict]:
    """
    Gera registros de produtos normalizados.
    categorias_map: {codigo_merc: categoria_id}
    """
    seen = set()
    result = []
    for row in cadastro_rows:
        codigo = row.get('codigo', '').strip()
        if not codigo or codigo in seen:
            continue
        seen.add(codigo)

        merc = row.get('mercadologico', '').strip()
        cat_id = categorias_map.get(merc)

        # Limpa descrição (espaços iniciais do VR Master)
        descricao = row.get('descricao', '').strip()
        if descricao.startswith(' '):
            descricao = descricao.strip()

        result.append({
            'codigo':    codigo,
            'descricao': descricao,
            'embalagem': row.get('embalagem', '').split('/')[0] if row.get('embalagem') else '',
            'ncm':       row.get('ncm', ''),
            'categoria_id': cat_id,
            'situacao':  row.get('situacao', 'ATIVO'),
            'curva':     None,  # Será preenchido pelo estoque
        })

    return result


def resolve_loja_id(loja_raw: str, lojas_map: dict) -> int | None:
    """
    Resolve nome VR Master para ID do banco.
    lojas_map: {nome_interno: id} ex: {'PRIMAVERA L01': 1}
    """
    if not loja_raw:
        return None
    loja_upper = loja_raw.strip().upper()
    return lojas_map.get(loja_upper)


def resolve_loja_from_pasta(pasta: str, lojas_map: dict) -> int | None:
    """Resolve pasta (ex: 'primavera') para loja_id."""
    nome_interno = PASTA_LOJA.get(pasta)
    if nome_interno:
        return lojas_map.get(nome_interno)
    return None


def transform_vendas(vendas_raw: list[dict], produtos_map: dict, lojas_map: dict) -> list[dict]:
    """
    Transforma vendas brutas em registros prontos para INSERT.
    produtos_map: {codigo: produto_id}
    lojas_map: {nome_interno: loja_id}
    """
    result = []
    for row in vendas_raw:
        produto_id = produtos_map.get(row['codigo'])
        loja_id = resolve_loja_from_pasta(row['loja_pasta'], lojas_map)

        if not produto_id or not loja_id:
            continue

        result.append({
            'loja_id':           loja_id,
            'produto_id':        produto_id,
            'mes':               row['mes'],
            'quantidade':        row['quantidade'],
            'venda':             row['venda'],
            'custo_com_imposto': row['custo_com_imposto'],
            'custo_sem_imposto': row['custo_sem_imposto'],
            'margem_bruta_pct':  row['margem_bruta_pct'],
            'lucro':             row['lucro'],
            'icms':              row['icms'],
            'pis_cofins':        row['pis_cofins'],
            'dias_efetivos':     row['dias_efetivos'],
        })

    return result


def transform_dro(dro_raw: list[dict], lojas_map: dict) -> list[dict]:
    """Transforma DRO bruto."""
    result = []
    for row in dro_raw:
        loja_id = resolve_loja_from_pasta(row['loja_pasta'], lojas_map)
        if not loja_id:
            continue

        result.append({
            'loja_id':         loja_id,
            'mes':             row['mes'],
            'descricao':       row['descricao'],
            'valor_realizado': row['valor_realizado'],
            'percentual':      row['percentual'],
        })

    return result


def transform_estoque(estoque_raw: list[dict], produtos_map: dict, lojas_map: dict, data_snapshot: str) -> list[dict]:
    """Transforma estoque bruto."""
    result = []
    for row in estoque_raw:
        produto_id = produtos_map.get(row['codigo'])
        loja_id = lojas_map.get(row.get('loja_raw', ''))

        if not produto_id or not loja_id:
            continue

        result.append({
            'loja_id':           loja_id,
            'produto_id':        produto_id,
            'data_snapshot':     data_snapshot,
            'quantidade':        row['quantidade'],
            'preco_venda':       row['preco_venda'],
            'custo_com_imposto': row['custo_com_imposto'],
            'custo_sem_imposto': row['custo_sem_imposto'],
            'curva':             row['curva'],
        })

    return result


def transform_movimentacao(es_raw: list[dict], produtos_map: dict, lojas_map: dict) -> list[dict]:
    """Transforma entrada/saída."""
    result = []
    for row in es_raw:
        produto_id = produtos_map.get(row['codigo'])
        loja_id = resolve_loja_from_pasta(row['loja_pasta'], lojas_map)

        if not produto_id or not loja_id:
            continue

        result.append({
            'loja_id':       loja_id,
            'produto_id':    produto_id,
            'mes':           row['mes'],
            'qtd_entrada':   row['qtd_entrada'],
            'valor_entrada': row['valor_entrada'],
            'qtd_saida':     row['qtd_saida'],
            'valor_saida':   row['valor_saida'],
            'qtd_venda':     row['qtd_venda'],
            'valor_venda':   row['valor_venda'],
            'custo_venda':   row['custo_venda'],
        })

    return result


def transform_validade(val_raw: list[dict], produtos_map: dict, lojas_map: dict) -> list[dict]:
    """Transforma validade."""
    result = []
    for row in val_raw:
        produto_id = produtos_map.get(row['codigo'])
        loja_id = lojas_map.get(row.get('loja_raw', ''))

        if not produto_id or not loja_id:
            continue

        result.append({
            'loja_id':          loja_id,
            'produto_id':       produto_id,
            'data_validade':    row['data_validade'],
            'data_entrada':     row['data_entrada'],
            'quantidade':       row['quantidade'],
            'estoque_atual':    row['estoque_atual'],
            'media_venda':      row['media_venda'],
            'ddv':              row['ddv'],
            'dias_restantes':   row['dias_restantes'],
            'risco_vencer':     row['risco_vencer'],
            'custo_observacao': row['custo_observacao'],
            'venda_risco':      row['venda_risco'],
            'situacao':         row['situacao'],
        })

    return result
