import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Canal, CanalExecucao, CanalKpis } from "@/types/db";

export const canaisKeys = {
  all: ["canais"] as const,
  execucao: ["canal_execucao"] as const,
  kpis: ["canal_kpis"] as const,
};

export function useCanais() {
  return useQuery({
    queryKey: canaisKeys.all,
    queryFn: async (): Promise<Canal[]> => {
      const { data, error } = await supabase
        .from("canais")
        .select("*")
        .order("ordem");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000, // canais mudam pouco
  });
}

export function useCanalExecucao() {
  return useQuery({
    queryKey: canaisKeys.execucao,
    queryFn: async (): Promise<CanalExecucao[]> => {
      const { data, error } = await supabase
        .from("canal_execucao")
        .select("*")
        .order("ordem");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCanalKpis() {
  return useQuery({
    queryKey: canaisKeys.kpis,
    queryFn: async (): Promise<CanalKpis[]> => {
      const { data, error } = await supabase.from("canal_kpis").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Mapa id → nome de canal (útil para tabelas/labels). */
export function canalNomePorId(canais: Canal[] | undefined) {
  const m = new Map<string, string>();
  (canais ?? []).forEach((c) => m.set(c.id, c.nome));
  return m;
}
