import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Oportunidade,
  EstagioOport,
  Conta,
  PapelContato,
} from "@/types/db";

export type OportunidadeCard = Oportunidade & {
  conta:
    | (Conta & { contatos: { nome: string; papel: PapelContato }[] })
    | null;
  canal: { nome: string; slug: string } | null;
};

const boardKey = (canalId: string) => ["oportunidades", "board", canalId] as const;

export function useOportunidades(canalId: string | "all") {
  return useQuery({
    queryKey: boardKey(canalId),
    queryFn: async (): Promise<OportunidadeCard[]> => {
      let q = supabase
        .from("oportunidades")
        .select(
          "*, conta:contas(*, contatos(nome, papel)), canal:canais(nome, slug)",
        )
        .order("data_entrada_estagio", { ascending: false });
      if (canalId !== "all") q = q.eq("canal_id", canalId);
      const { data, error } = await q.returns<OportunidadeCard[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMoverEstagio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; estagio: EstagioOport }) => {
      const { error } = await supabase
        .from("oportunidades")
        .update({
          estagio: vars.estagio,
          data_entrada_estagio: new Date().toISOString().slice(0, 10),
        })
        .eq("id", vars.id);
      if (error) throw error;
    },
    // Atualização otimista: o card pula de coluna na hora.
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["oportunidades", "board"] });
      const prev = qc.getQueriesData<OportunidadeCard[]>({
        queryKey: ["oportunidades", "board"],
      });
      qc.setQueriesData<OportunidadeCard[]>(
        { queryKey: ["oportunidades", "board"] },
        (old) =>
          old?.map((o) =>
            o.id === vars.id ? { ...o, estagio: vars.estagio } : o,
          ),
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      // funil e KPIs recalculam (mover p/ fechado_ganho muda canal_kpis)
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
    },
  });
}
