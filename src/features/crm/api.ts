import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Conta,
  Contato,
  Interacao,
  Temperatura,
  Update,
  Oportunidade,
} from "@/types/db";
import type { ImportPayload } from "./import";

export type ContaFilters = {
  temperatura: Temperatura | "all";
  canalId: string | "all";
  busca: string;
};

export const crmKeys = {
  contas: (f: ContaFilters) => ["contas", "list", f] as const,
  contatos: (id: string) => ["contatos", id] as const,
  interacoes: (id: string) => ["interacoes", id] as const,
};

export function useContas(filters: ContaFilters) {
  return useQuery({
    queryKey: crmKeys.contas(filters),
    queryFn: async (): Promise<Conta[]> => {
      let q = supabase.from("contas").select("*").order("nome");
      if (filters.temperatura !== "all")
        q = q.eq("temperatura", filters.temperatura);
      if (filters.canalId !== "all")
        q = q.eq("canal_origem_id", filters.canalId);
      const busca = filters.busca.trim();
      if (busca) q = q.or(`nome.ilike.%${busca}%,bairro.ilike.%${busca}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useContatos(contaId?: string) {
  return useQuery({
    queryKey: crmKeys.contatos(contaId ?? ""),
    enabled: !!contaId,
    queryFn: async (): Promise<Contato[]> => {
      const { data, error } = await supabase
        .from("contatos")
        .select("*")
        .eq("conta_id", contaId!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInteracoes(contaId?: string) {
  return useQuery({
    queryKey: crmKeys.interacoes(contaId ?? ""),
    enabled: !!contaId,
    queryFn: async (): Promise<Interacao[]> => {
      const { data, error } = await supabase
        .from("interacoes")
        .select("*")
        .eq("conta_id", contaId!)
        .order("data", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

export function useImportContas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ImportPayload) => {
      for (const c of chunk(payload.contas, 500)) {
        const { error } = await supabase.from("contas").insert(c);
        if (error) throw error;
      }
      for (const o of chunk(payload.oportunidades, 500)) {
        const { error } = await supabase.from("oportunidades").insert(o);
        if (error) throw error;
      }
      for (const c of chunk(payload.contatos, 500)) {
        if (c.length) {
          const { error } = await supabase.from("contatos").insert(c);
          if (error) throw error;
        }
      }
      for (const i of chunk(payload.interacoes, 500)) {
        if (i.length) {
          const { error } = await supabase.from("interacoes").insert(i);
          if (error) throw error;
        }
      }
      return { inseridas: payload.contas.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
    },
  });
}

/** Atualiza os dados de um lead (temperatura, responsável, contato, obs…). */
export function useAtualizarConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Update<"contas"> }) => {
      const { error } = await supabase
        .from("contas")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
    },
  });
}

/** A oportunidade (1:1) da conta — usada para editar o plano (valor_mrr). */
export function useContaOportunidade(contaId?: string) {
  return useQuery({
    queryKey: ["oportunidade", "por-conta", contaId ?? ""],
    enabled: !!contaId,
    queryFn: async (): Promise<Oportunidade | null> => {
      const { data, error } = await supabase
        .from("oportunidades")
        .select("*")
        .eq("conta_id", contaId!)
        .order("created_at")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Troca o plano de uma oportunidade (valor_mrr = 250 ou 850). */
export function useAtualizarPlano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { oportId: string; valor: number }) => {
      const { error } = await supabase
        .from("oportunidades")
        .update({ valor_mrr: vars.valor })
        .eq("id", vars.oportId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oportunidade", "por-conta"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
    },
  });
}
