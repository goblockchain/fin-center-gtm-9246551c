import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Projeto, Insert, Update } from "@/types/db";

const KEY = ["projetos"] as const;

export function useProjetos() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Projeto[]> => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .order("ordem", { ascending: true })
        .order("data_inicio", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCriarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Insert<"projetos">) => {
      const { error } = await supabase.from("projetos").insert(p);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAtualizarProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Update<"projetos"> }) => {
      const { error } = await supabase
        .from("projetos")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useExcluirProjeto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projetos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
