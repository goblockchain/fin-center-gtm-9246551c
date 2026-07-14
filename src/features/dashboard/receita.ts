import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Canal,
  CanalExecucao,
  CanalKpis,
  CanalEconomia,
  EstagioOport,
} from "@/types/db";

/**
 * Mapeamento de funil de RECEITA sobre os estágios canônicos do pipeline
 * (CLAUDE.md §6.1). Lead = toda oportunidade; Cliente = fechado_ganho.
 *   Lead     → todas
 *   MQL      → qualificado em diante
 *   SQL      → reunião em diante (sales-qualified = chegou em reunião)
 *   Proposta → proposta/negociação/ganho (chegou a proposta)
 *   Cliente  → fechado_ganho
 */
const APOS_QUALIFICADO: EstagioOport[] = [
  "qualificado",
  "reuniao",
  "proposta",
  "negociacao",
  "fechado_ganho",
];
const APOS_REUNIAO: EstagioOport[] = [
  "reuniao",
  "proposta",
  "negociacao",
  "fechado_ganho",
];
const APOS_PROPOSTA: EstagioOport[] = [
  "proposta",
  "negociacao",
  "fechado_ganho",
];
const ABERTO: EstagioOport[] = [
  "cadastrado",
  "contatado",
  "qualificado",
  "reuniao",
  "proposta",
  "negociacao",
];

/** Probabilidade default por estágio quando a oportunidade não tem uma. */
const PROB_ESTAGIO: Record<EstagioOport, number> = {
  cadastrado: 5,
  contatado: 10,
  qualificado: 20,
  reuniao: 40,
  proposta: 60,
  piloto: 70,
  envio_contrato: 90,
  setup_onboarding: 95,
  negociacao: 80,
  fechado_ganho: 100,
  // Pós-fechamento (cliente já ganho): tratados como 100% para fins de peso.
  ticket_aberto: 100,
  nps_recolhido: 100,
  indicacao: 100,
  up_cross_sell: 100,
  retencao: 100,
  fechado_perdido: 0,
};

export const ARR_MESES = 12;

export type OportReceita = {
  estagio: EstagioOport;
  valor_mrr: number;
  probabilidade: number | null;
  data_entrada_estagio: string;
  canal_id: string;
};

export function useOportunidadesReceita() {
  return useQuery({
    queryKey: ["oportunidades", "receita"],
    queryFn: async (): Promise<OportReceita[]> => {
      const { data, error } = await supabase
        .from("oportunidades")
        .select(
          "estagio, valor_mrr, probabilidade, data_entrada_estagio, canal_id",
        );
      if (error) throw error;
      return (data ?? []).map((o) => ({
        estagio: o.estagio as EstagioOport,
        valor_mrr: Number(o.valor_mrr ?? 0),
        probabilidade: o.probabilidade,
        data_entrada_estagio: o.data_entrada_estagio,
        canal_id: o.canal_id as string,
      }));
    },
  });
}

/** Data ISO (yyyy-mm-dd) de N dias atrás (meia-noite local). */
export function diasAtras(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Métricas de funil de receita de um conjunto de oportunidades. */
export function metricasReceita(ops: OportReceita[]) {
  const conta = (es: EstagioOport[]) =>
    ops.filter((o) => es.includes(o.estagio)).length;
  const ganhos = ops.filter((o) => o.estagio === "fechado_ganho");
  const mrr = ganhos.reduce((s, o) => s + o.valor_mrr, 0);
  const pipelinePonderado = ops
    .filter((o) => ABERTO.includes(o.estagio))
    .reduce(
      (s, o) =>
        s + o.valor_mrr * ((o.probabilidade ?? PROB_ESTAGIO[o.estagio]) / 100),
      0,
    );
  return {
    leads: ops.length,
    mql: conta(APOS_QUALIFICADO),
    sql: conta(APOS_REUNIAO),
    propostas: conta(APOS_PROPOSTA),
    clientes: ganhos.length,
    mrr,
    pipelinePonderado,
  };
}

export type ResumoJanela = { mrr: number; clientes: number };

/**
 * Compara os fechamentos do período atual (últimos `nDias`, incluindo hoje)
 * com o período imediatamente anterior de mesmo tamanho.
 */
export function janelaFechamentos(
  ops: OportReceita[],
  nDias: number,
): { atual: ResumoJanela; anterior: ResumoJanela } {
  const iniAtual = diasAtras(nDias - 1);
  const iniAnterior = diasAtras(2 * nDias - 1);
  const ganhos = ops.filter((o) => o.estagio === "fechado_ganho");
  const resumo = (arr: OportReceita[]): ResumoJanela => ({
    mrr: arr.reduce((s, o) => s + o.valor_mrr, 0),
    clientes: arr.length,
  });
  return {
    atual: resumo(ganhos.filter((o) => o.data_entrada_estagio >= iniAtual)),
    anterior: resumo(
      ganhos.filter(
        (o) =>
          o.data_entrada_estagio >= iniAnterior &&
          o.data_entrada_estagio < iniAtual,
      ),
    ),
  };
}

/** Payback em meses = investimento executado / MRR ganho (quanto leva p/ pagar). */
export function paybackMeses(investido: number, mrr: number): number | null {
  return mrr > 0 ? investido / mrr : null;
}

export type LinhaCanal = {
  canal_id: string;
  nome: string;
  tipo: string;
  estado: string;
  leads: number;
  sql: number;
  propostas: number;
  clientes: number;
  conv: number; // Lead → Cliente
  mrr: number;
  investido: number;
  cac: number | null;
  payback: number | null;
  roi: number | null;
};

/**
 * Linha consolidada de receita por canal — base ÚNICA da "Performance por canal"
 * e das recomendações. O custo do CAC vem dos custos itemizados (view
 * canal_economia) quando houver; senão cai no investimento executado. CAC, Payback
 * e ROI são todos derivados desse mesmo custo, mantendo a tabela coerente.
 */
export function linhasPorCanal(
  ops: OportReceita[],
  execucoes: CanalExecucao[],
  kpis: CanalKpis[],
  canais: Canal[],
  economia: CanalEconomia[] = [],
): LinhaCanal[] {
  const execPorId = new Map(execucoes.map((e) => [e.canal_id, e]));
  const kpiPorId = new Map(kpis.map((k) => [k.canal_id, k]));
  const econPorId = new Map(economia.map((e) => [e.canal_id, e]));
  return canais.map((c) => {
    const m = metricasReceita(ops.filter((o) => o.canal_id === c.id));
    const exec = execPorId.get(c.id);
    const kpi = kpiPorId.get(c.id);
    const econ = econPorId.get(c.id);
    const custoItem = Number(econ?.custo_total ?? 0);
    // Custo itemizado tem precedência; investimento executado é o fallback.
    const investido =
      custoItem > 0 ? custoItem : Number(exec?.investimento_executado ?? 0);
    const mrr = Number(kpi?.mrr_ganho ?? m.mrr);
    return {
      canal_id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      estado: String(exec?.estado ?? ""),
      leads: m.leads,
      sql: m.sql,
      propostas: m.propostas,
      clientes: m.clientes,
      conv: m.leads > 0 ? m.clientes / m.leads : 0,
      mrr,
      investido,
      // Sem custo registrado (investido = 0) => métricas de custo não fazem
      // sentido (evita "CAC R$0 / payback instantâneo").
      cac: investido > 0 && m.clientes > 0 ? investido / m.clientes : null,
      payback: investido > 0 ? paybackMeses(investido, mrr) : null,
      roi: investido > 0 ? (mrr - investido) / investido : null,
    };
  });
}
