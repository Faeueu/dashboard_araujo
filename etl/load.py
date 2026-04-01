"""
load.py — Carrega dados transformados no Supabase via API.
Usa upsert para idempotência (pode re-rodar sem duplicar).
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Carrega .env do diretório etl/
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Service key para escrita

_client = None

def get_client():
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError(
                "❌ SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar no .env!\n"
                "   Copie etl/.env.example para etl/.env e preencha."
            )
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def _batch_upsert(table: str, rows: list[dict], conflict_cols: list[str] = None, batch_size: int = 500):
    """
    Insere/atualiza registros em lotes.
    conflict_cols: colunas para ON CONFLICT (upsert)
    """
    if not rows:
        print(f"  ⏭ {table}: nenhum registro para inserir")
        return []

    client = get_client()
    all_ids = []

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        try:
            if conflict_cols:
                result = (
                    client.table(table)
                    .upsert(batch, on_conflict=','.join(conflict_cols))
                    .execute()
                )
            else:
                result = client.table(table).insert(batch).execute()

            if result.data:
                all_ids.extend(result.data)
            print(f"  ✅ {table}: lote {i//batch_size + 1} — {len(batch)} registros")
        except Exception as e:
            print(f"  ❌ {table}: erro no lote {i//batch_size + 1} — {e}")

    return all_ids


def load_lojas(lojas: list[dict]) -> dict:
    """
    Carrega lojas no Supabase. Retorna mapa {nome_interno: id}
    """
    print("\n📦 Carregando lojas...")
    results = _batch_upsert('lojas', lojas, conflict_cols=['codigo'])

    lojas_map = {}
    for r in results:
        lojas_map[r['nome_interno']] = r['id']
    print(f"  → Mapa lojas: {lojas_map}")
    return lojas_map


def load_categorias(categorias: list[dict]) -> dict:
    """
    Carrega categorias. Retorna mapa {codigo_merc: id}
    """
    print("\n📦 Carregando categorias...")
    results = _batch_upsert('categorias', categorias, conflict_cols=['codigo_mercadologico'])

    cat_map = {}
    for r in results:
        cat_map[r['codigo_mercadologico']] = r['id']
    print(f"  → {len(cat_map)} categorias carregadas")
    return cat_map


def load_produtos(produtos: list[dict]) -> dict:
    """
    Carrega produtos. Retorna mapa {codigo: id}
    """
    print("\n📦 Carregando produtos...")
    results = _batch_upsert('produtos', produtos, conflict_cols=['codigo'])

    prod_map = {}
    for r in results:
        prod_map[r['codigo']] = r['id']
    print(f"  → {len(prod_map)} produtos carregados")
    return prod_map


def load_vendas(vendas: list[dict]):
    """Carrega vendas do período."""
    print(f"\n📦 Carregando vendas ({len(vendas)} registros)...")
    _batch_upsert('vendas_periodo', vendas, conflict_cols=['loja_id', 'produto_id', 'mes'])


def load_dro(dro: list[dict]):
    """Carrega DRO."""
    print(f"\n📦 Carregando DRO ({len(dro)} registros)...")
    _batch_upsert('dro', dro, conflict_cols=['loja_id', 'mes', 'descricao'])


def load_estoque(estoque: list[dict]):
    """Carrega estoque."""
    print(f"\n📦 Carregando estoque ({len(estoque)} registros)...")
    _batch_upsert('estoque', estoque, conflict_cols=['loja_id', 'produto_id', 'data_snapshot'])


def load_movimentacao(mov: list[dict]):
    """Carrega movimentação."""
    print(f"\n📦 Carregando movimentação ({len(mov)} registros)...")
    _batch_upsert('movimentacao', mov, conflict_cols=['loja_id', 'produto_id', 'mes'])


def load_validade(val: list[dict]):
    """Carrega validade."""
    print(f"\n📦 Carregando validade ({len(val)} registros)...")
    # Validade não tem constraint UNIQUE simples — insert direto
    # Limpa antes de reinserir
    client = get_client()
    try:
        client.table('validade').delete().neq('id', 0).execute()
        print("  🗑 Tabela validade limpa")
    except Exception as e:
        print(f"  ⚠ Erro ao limpar validade: {e}")
    _batch_upsert('validade', val)
