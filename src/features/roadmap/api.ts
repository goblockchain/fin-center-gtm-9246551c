import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Gate, Investimento, Insert, Update } from "@/types/db";

/** Janela padrão da sprint — fallback quando não há datas cadastradas. */
export const SPRINT_INICIO = "2026-06-16";
export const SPRINT_FIM = "2026-08-24";

export function useGates() {
  return useQuery({
    queryKey: ["gates"],
    queryFn: async (): Promise<Gate[]> => {
      const { data, error } = await supabase
        .from("gates")
        .select("*")
        .order("data");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCriarGate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (g: Insert<"gates">) => {
      const { error } = await supabase.from("gates").insert(g);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gates"] }),
  });
}

export function useAtualizarGate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Update<"gates"> }) => {
      const { error } = await supabase
        .from("gates")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gates"] }),
  });
}

export function useExcluirGate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gates"] }),
  });
}

/** Investimento por canal (modelo do canal) — alimenta o CAC nas views. */
export function useInvestimentos() {
  return useQuery({
    queryKey: ["investimentos"],
    queryFn: async (): Promise<Investimento[]> => {
      const { data, error } = await supabase
        .from("investimentos")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAtualizarInvestimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Update<"investimentos"> }) => {
      const { error } = await supabase
        .from("investimentos")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investimentos"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
      qc.invalidateQueries({ queryKey: ["canal_kpis"] }); // CAC/ROI recalculam
    },
  });
}
