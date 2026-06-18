import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Gate } from "@/types/db";

export function useGates() {
  return useQuery({
    queryKey: ["gates"],
    queryFn: async (): Promise<Gate[]> => {
      const { data, error } = await supabase
        .from("gates")
        .select("*")
        .order("ordem");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Janela da sprint (CLAUDE.md): 16/jun → 24/ago/2026. */
export const SPRINT_INICIO = "2026-06-16";
export const SPRINT_FIM = "2026-08-24";
