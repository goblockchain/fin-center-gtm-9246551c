import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ESTAGIOS } from "@/features/pipeline/estagios";
import type { EstagioOport } from "@/types/db";

export type FunilItem = { estagio: EstagioOport; n: number; valor: number };

export function useFunil(canalId: string | "all" = "all") {
  return useQuery({
    queryKey: ["funil", canalId],
    queryFn: async (): Promise<FunilItem[]> => {
      let q = supabase.from("oportunidades").select("estagio, valor_mrr");
      if (canalId !== "all") q = q.eq("canal_id", canalId);
      const { data, error } = await q;
      if (error) throw error;
      const map = new Map<EstagioOport, { n: number; valor: number }>();
      ESTAGIOS.forEach((e) => map.set(e, { n: 0, valor: 0 }));
      (data ?? []).forEach((o) => {
        const m = map.get(o.estagio as EstagioOport);
        if (m) {
          m.n += 1;
          m.valor += Number(o.valor_mrr ?? 0);
        }
      });
      return ESTAGIOS.map((e) => ({ estagio: e, ...map.get(e)! }));
    },
  });
}

const AVANCADOS: EstagioOport[] = [
  "reuniao",
  "proposta",
  "negociacao",
  "fechado_ganho",
];

/** Métricas agregadas do funil para gargalo, conversão e projeção. */
export function resumoFunil(funil: FunilItem[]) {
  const por = (e: EstagioOport) => funil.find((f) => f.estagio === e)?.n ?? 0;
  const total = funil.reduce((s, f) => s + f.n, 0);
  const cadastrado = por("cadastrado");
  const contatados = total - cadastrado;
  const reunioes = AVANCADOS.reduce((s, e) => s + por(e), 0);
  const ganhos = por("fechado_ganho");
  const perdidos = por("fechado_perdido");
  const ativos = total - ganhos - perdidos;
  const taxaContatoReuniao = contatados > 0 ? reunioes / contatados : 0;

  // Gargalo: menor taxa de passagem entre etapas com volume relevante (n[i] ≥ 5).
  const fluxo: EstagioOport[] = [
    "cadastrado",
    "contatado",
    "qualificado",
    "reuniao",
    "proposta",
    "negociacao",
    "fechado_ganho",
  ];
  let gargalo: { de: EstagioOport; para: EstagioOport; taxa: number } | null =
    null;
  for (let i = 0; i < fluxo.length - 1; i++) {
    const ni = por(fluxo[i]);
    const nj = por(fluxo[i + 1]);
    if (ni < 5) continue;
    const taxa = nj / ni;
    if (!gargalo || taxa < gargalo.taxa)
      gargalo = { de: fluxo[i], para: fluxo[i + 1], taxa };
  }

  return {
    total,
    contatados,
    reunioes,
    ganhos,
    perdidos,
    ativos,
    taxaContatoReuniao,
    gargalo,
    por,
  };
}
