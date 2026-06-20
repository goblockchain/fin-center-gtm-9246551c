import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { PipelineSemana } from "@/types/db";

/** Atividade do pipe por semana e canal (view pipeline_semana). */
export function usePipelineSemana() {
  return useQuery({
    queryKey: ["pipeline_semana"],
    queryFn: async (): Promise<PipelineSemana[]> => {
      const { data, error } = await supabase
        .from("pipeline_semana")
        .select("*")
        .order("semana", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
