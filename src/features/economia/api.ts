import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  Custo,
  Meta,
  CanalEconomia,
  TipoCusto,
  Insert,
  Update,
} from "@/types/db";

export const TIPOS_CUSTO: { value: TipoCusto; label: string }[] = [
  { value: "horas", label: "Horas" },
  { value: "ferramentas", label: "Ferramentas" },
  { value: "midia", label: "Mídia" },
  { value: "comissao", label: "Comissão" },
  { value: "operacional", label: "Operacional" },
];

export const TIPO_CUSTO_LABEL = Object.fromEntries(
  TIPOS_CUSTO.map((t) => [t.value, t.label]),
) as Record<TipoCusto, string>;

/** 1º dia do mês informado (ou atual) — competência ISO yyyy-mm-01. */
export function competencia(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function useCustos() {
  return useQuery({
    queryKey: ["custos"],
    queryFn: async (): Promise<Custo[]> => {
      const { data, error } = await supabase
        .from("custos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCanalEconomia() {
  return useQuery({
    queryKey: ["canal_economia"],
    queryFn: async (): Promise<CanalEconomia[]> => {
      const { data, error } = await supabase.from("canal_economia").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCriarCusto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: Insert<"custos">) => {
      const { error } = await supabase.from("custos").insert(c);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custos"] });
      qc.invalidateQueries({ queryKey: ["canal_economia"] });
    },
  });
}

export function useAtualizarCusto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Update<"custos"> }) => {
      const { error } = await supabase
        .from("custos")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custos"] });
      qc.invalidateQueries({ queryKey: ["canal_economia"] });
    },
  });
}

export function useExcluirCusto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custos"] });
      qc.invalidateQueries({ queryKey: ["canal_economia"] });
    },
  });
}

export function useMetas() {
  return useQuery({
    queryKey: ["metas"],
    queryFn: async (): Promise<Meta[]> => {
      const { data, error } = await supabase
        .from("metas")
        .select("*")
        .order("competencia", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: Insert<"metas">) => {
      const { error } = await supabase
        .from("metas")
        .upsert(m, { onConflict: "competencia" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["metas"] }),
  });
}
