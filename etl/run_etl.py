"""
run_etl.py — Orquestrador do pipeline ETL completo.

Uso:
    py -3.13 etl/run_etl.py --loja primavera --meses 2026-01,2026-02,2026-03
    py -3.13 etl/run_etl.py --test   (somente extração, sem carregar no Supabase)
"""
import argparse
import sys
import os
import time

# Garante que o módulo etl/ está no path
sys.path.insert(0, os.path.dirname(__file__))

from extract import (
    extrair_vendas, extrair_dro, extrair_cadastro, extrair_estoque,
    extrair_entrada_saida, extrair_inventario, extrair_validade,
)
from transform import (
    build_lojas, build_categorias, build_produtos,
    transform_vendas, transform_dro, transform_estoque,
    transform_movimentacao, transform_validade,
)


def run(loja: str, meses: list[str], test_only: bool = False):
    t0 = time.time()

    print("=" * 60)
    print(f"🚀 ETL Dashboard Araújo")
    print(f"   Loja: {loja}")
    print(f"   Meses: {', '.join(meses)}")
    print(f"   Modo: {'TESTE (sem Supabase)' if test_only else 'PRODUÇÃO (com Supabase)'}")
    print("=" * 60)

    # ── EXTRACT ─────────────────────────────────────────────────
    print("\n📥 FASE 1: EXTRAÇÃO")
    print("-" * 40)

    # Cadastro (uma vez — não depende de mês)
    print("\n🏷️ Cadastro de produtos...")
    cadastro = extrair_cadastro(loja)

    # Estoque (snapshot atual — não depende de mês)
    print("\n📦 Estoque atual...")
    estoque_raw = extrair_estoque(loja)

    # Validade (arquivo único global)
    print("\n📅 Validade...")
    validade_raw = extrair_validade()

    # Dados mensais
    all_vendas = []
    all_dro = []
    all_es = []
    all_inv = []

    for mes in meses:
        print(f"\n📆 Mês: {mes}")
        print("─" * 30)

        vendas = extrair_vendas(loja, mes)
        all_vendas.extend(vendas)

        dro = extrair_dro(loja, mes)
        all_dro.extend(dro)

        es = extrair_entrada_saida(loja, mes)
        all_es.extend(es)

        inv = extrair_inventario(loja, mes)
        all_inv.extend(inv)

    # ── TRANSFORM ───────────────────────────────────────────────
    print("\n\n🔄 FASE 2: TRANSFORMAÇÃO")
    print("-" * 40)

    # Dimensões
    lojas_data = build_lojas()
    print(f"  Lojas: {len(lojas_data)}")

    categorias_data = build_categorias(cadastro)
    print(f"  Categorias: {len(categorias_data)}")

    # ── RESUMO ──────────────────────────────────────────────────
    print("\n\n📊 RESUMO DA EXTRAÇÃO")
    print("-" * 40)
    print(f"  Cadastro:       {len(cadastro):>8} produtos")
    print(f"  Categorias:     {len(categorias_data):>8} únicas")
    print(f"  Vendas:         {len(all_vendas):>8} linhas ({len(meses)} meses)")
    print(f"  DRO:            {len(all_dro):>8} linhas")
    print(f"  Estoque:        {len(estoque_raw):>8} posições")
    print(f"  Entrada/Saída:  {len(all_es):>8} movimentações")
    print(f"  Inventário:     {len(all_inv):>8} itens")
    print(f"  Validade:       {len(validade_raw):>8} registros")

    # Receita bruta: soma das vendas
    receita_total = sum(v['venda'] for v in all_vendas)
    print(f"\n  💰 Receita total extraída: R$ {receita_total:,.2f}")

    # DRO Receita Bruta (primeira linha = RECEITA BRUTA)
    dro_receita = [d for d in all_dro if 'RECEITA BRUTA' in d.get('descricao', '')]
    if dro_receita:
        dro_total = sum(d['valor_realizado'] for d in dro_receita)
        print(f"  💰 DRO Receita Bruta:      R$ {dro_total:,.2f}")
        diff = abs(receita_total - dro_total)
        print(f"  📐 Diferença:              R$ {diff:,.2f} ({diff/dro_total*100:.2f}%)" if dro_total > 0 else "")

    if test_only:
        elapsed = time.time() - t0
        print(f"\n⏱ Tempo: {elapsed:.1f}s")
        print("✅ TESTE CONCLUÍDO — nada foi carregado no Supabase")
        return

    # ── LOAD ────────────────────────────────────────────────────
    print("\n\n📤 FASE 3: CARGA NO SUPABASE")
    print("-" * 40)

    from load import (
        load_lojas, load_categorias, load_produtos,
        load_vendas, load_dro, load_estoque,
        load_movimentacao, load_validade,
    )

    # 1. Dimensões
    lojas_map = load_lojas(lojas_data)
    cat_map = load_categorias(categorias_data)

    # 2. Produtos (precisa de cat_map)
    produtos_data = build_produtos(cadastro, cat_map)
    print(f"  Produtos prontos: {len(produtos_data)}")
    prod_map = load_produtos(produtos_data)

    # 3. Fatos (precisam de lojas_map e prod_map)
    vendas_t = transform_vendas(all_vendas, prod_map, lojas_map)
    load_vendas(vendas_t)

    dro_t = transform_dro(all_dro, lojas_map)
    load_dro(dro_t)

    estoque_t = transform_estoque(estoque_raw, prod_map, lojas_map, '2026-04-01')
    load_estoque(estoque_t)

    mov_t = transform_movimentacao(all_es, prod_map, lojas_map)
    load_movimentacao(mov_t)

    val_t = transform_validade(validade_raw, prod_map, lojas_map)
    load_validade(val_t)

    elapsed = time.time() - t0
    print(f"\n⏱ Tempo total: {elapsed:.1f}s")
    print("🎉 ETL COMPLETO!")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='ETL Dashboard Araújo')
    parser.add_argument('--loja', default='primavera', help='Pasta da loja (primavera, araujo, marauto)')
    parser.add_argument('--meses', default='2026-01,2026-02,2026-03', help='Meses separados por vírgula')
    parser.add_argument('--test', action='store_true', help='Apenas testa extração sem carregar')
    args = parser.parse_args()

    meses = [m.strip() for m in args.meses.split(',')]
    run(loja=args.loja, meses=meses, test_only=args.test)
