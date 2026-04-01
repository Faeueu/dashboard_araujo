/**
 * supabase.js — Cliente Supabase para o dashboard.
 * Usa variáveis de ambiente Vite (VITE_SUPABASE_*).
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠ Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env",
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Busca receita + margem por loja e mês (view agregada)
 */
export async function fetchReceitaLojaMes() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vw_receita_loja_mes")
    .select("*");
  if (error) {
    console.error("Erro ao buscar receita:", error);
    return [];
  }
  return data;
}

/**
 * Busca receita por categoria/mês
 */
export async function fetchReceitaCategoriaMes() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vw_receita_categoria_mes")
    .select("*");
  if (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
  return data;
}

/**
 * Busca DRO resumo
 */
export async function fetchDRO(loja, mes) {
  if (!supabase) return [];
  let query = supabase.from("vw_dro_resumo").select("*");
  if (loja) query = query.eq("loja", loja);
  if (mes) query = query.eq("mes", mes);
  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar DRO:", error);
    return [];
  }
  return data;
}

/**
 * Busca dados completos de vendas com join de produto + categoria
 * Para uso em páginas que precisam de drill-down
 */
export async function fetchVendasPeriodo(filtros = {}) {
  if (!supabase) return [];
  let query = supabase
    .from("vendas_periodo")
    .select(
      `
      *,
      produtos!inner (codigo, descricao, embalagem, curva,
        categorias (codigo_mercadologico, departamento, secao, grupo)
      ),
      lojas!inner (nome_display, codigo)
    `,
    )
    .order("venda", { ascending: false });

  if (filtros.loja_id) query = query.eq("loja_id", filtros.loja_id);
  if (filtros.mes) query = query.eq("mes", filtros.mes);

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar vendas:", error);
    return [];
  }
  return data;
}

/**
 * Busca status de estoque com alertas
 */
export async function fetchEstoqueStatus() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vw_estoque_status")
    .select("*");
  if (error) {
    console.error("Erro ao buscar estoque:", error);
    return [];
  }
  return data;
}

/**
 * Busca dados de validade
 */
export async function fetchValidade(filtros = {}) {
  if (!supabase) return [];
  let query = supabase
    .from("validade")
    .select(
      `
      *,
      produtos (codigo, descricao),
      lojas (nome_display)
    `,
    )
    .order("dias_restantes", { ascending: true });

  if (filtros.loja_id) query = query.eq("loja_id", filtros.loja_id);

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar validade:", error);
    return [];
  }
  return data;
}

/**
 * Busca lista de lojas
 */
export async function fetchLojas() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("lojas")
    .select("*")
    .order("id");
  if (error) {
    console.error("Erro ao buscar lojas:", error);
    return [];
  }
  return data;
}

/**
 * Busca movimentação (entrada/saída) por mês
 */
export async function fetchMovimentacao(filtros = {}) {
  if (!supabase) return [];
  let query = supabase
    .from("movimentacao")
    .select(
      `
      *,
      produtos (codigo, descricao),
      lojas (nome_display)
    `,
    )
    .order("valor_venda", { ascending: false });

  if (filtros.loja_id) query = query.eq("loja_id", filtros.loja_id);
  if (filtros.mes) query = query.eq("mes", filtros.mes);

  const { data, error } = await query;
  if (error) {
    console.error("Erro ao buscar movimentação:", error);
    return [];
  }
  return data;
}
