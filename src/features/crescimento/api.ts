import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  ComunidadeMetrica,
  Parceiro,
  Evento,
  Insert,
  Update,
} from "@/types/db";

/* ---------------- Comunidade (métricas mensais) ---------------- */

export function useComunidade() {
  return useQuery({
    queryKey: ["comunidade_metricas"],
    queryFn: async (): Promise<ComunidadeMetrica[]> => {
      const { data, error } = await supabase
        .from("comunidade_metricas")
        .select("*")
        .order("competencia", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertComunidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: Insert<"comunidade_metricas">) => {
      const { error } = await supabase
        .from("comunidade_metricas")
        .upsert(m, { onConflict: "competencia" });
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["comunidade_metricas"] }),
  });
}

/* ---------------- Parceiros ---------------- */

export function useParceiros() {
  return useQuery({
    queryKey: ["parceiros"],
    queryFn: async (): Promise<Parceiro[]> => {
      const { data, error } = await supabase
        .from("parceiros")
        .select("*")
        .order("receita", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCriarParceiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Insert<"parceiros">) => {
      const { error } = await supabase.from("parceiros").insert(p);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parceiros"] }),
  });
}

export function useAtualizarParceiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Update<"parceiros"> }) => {
      const { error } = await supabase
        .from("parceiros")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parceiros"] }),
  });
}

export function useExcluirParceiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parceiros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parceiros"] }),
  });
}

/* ---------------- Eventos ---------------- */

export function useEventos() {
  return useQuery({
    queryKey: ["eventos"],
    queryFn: async (): Promise<Evento[]> => {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .order("data", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCriarEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (e: Insert<"eventos">) => {
      const { error } = await supabase.from("eventos").insert(e);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["eventos"] }),
  });
}

export function useExcluirEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("eventos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["eventos"] }),
  });
}
