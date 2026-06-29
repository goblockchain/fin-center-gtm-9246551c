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
import type { Json } from "@/types/database";
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
      if (busca) {
        // Remove caracteres que o PostgREST interpreta na sintaxe do filtro
        // (vírgula, parênteses, *, :, ., aspas, %) — evita injeção de filtro.
        const t = busca.replace(/[,()*:."'\\%]/g, " ").trim();
        if (t) q = q.or(`nome.ilike.%${t}%,bairro.ilike.%${t}%`);
      }
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

export function useImportContas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ImportPayload) => {
      // Insert atômico via RPC: se algo falhar, nada é gravado (sem órfãos).
      const { error } = await supabase.rpc("importar_base", {
        p_contas: payload.contas as unknown as Json,
        p_oportunidades: payload.oportunidades as unknown as Json,
        p_contatos: payload.contatos as unknown as Json,
        p_interacoes: payload.interacoes as unknown as Json,
      });
      if (error) throw error;
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

/** Reatribui a oportunidade da conta a outro canal (a "fonte" do lead). */
export function useAtualizarCanalDaOport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { oportId: string; canalId: string }) => {
      const { error } = await supabase
        .from("oportunidades")
        .update({ canal_id: vars.canalId })
        .eq("id", vars.oportId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oportunidade", "por-conta"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
    },
  });
}

/** Vincula a oportunidade a um parceiro OU evento (conforme o tipo do canal). */
export function useAtualizarVinculoOport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      oportId: string;
      parceiroId: string | null;
      eventoId: string | null;
    }) => {
      const { error } = await supabase
        .from("oportunidades")
        .update({ parceiro_id: vars.parceiroId, evento_id: vars.eventoId })
        .eq("id", vars.oportId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["oportunidade", "por-conta"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["parceiro_kpis"] });
      qc.invalidateQueries({ queryKey: ["evento_kpis"] });
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

/** Exclui um lead (conta). Cascade remove contatos/interações/oportunidade. */
export function useExcluirConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
      qc.invalidateQueries({ queryKey: ["parceiro_kpis"] });
      qc.invalidateQueries({ queryKey: ["evento_kpis"] });
    },
  });
}

/** Lista contas sem telefone (preview da exclusão em massa). */
export function useContasSemTelefone() {
  return useQuery({
    queryKey: ["contas", "sem-telefone"],
    queryFn: async (): Promise<Conta[]> => {
      const { data, error } = await supabase
        .from("contas")
        .select("*")
        .or("telefone.is.null,telefone.eq.")
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Exclui em massa todas as contas sem telefone. */
export function useExcluirContasSemTelefone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return 0;
      const { error } = await supabase.from("contas").delete().in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["oportunidades"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
      qc.invalidateQueries({ queryKey: ["parceiro_kpis"] });
      qc.invalidateQueries({ queryKey: ["evento_kpis"] });
    },
  });
}
