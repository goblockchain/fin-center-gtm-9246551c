import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Canal } from "@/types/db";

export const canaisKeys = {
  all: ["canais"] as const,
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

/** Mapa id → nome de canal (útil para tabelas/labels). */
export function canalNomePorId(canais: Canal[] | undefined) {
  const m = new Map<string, string>();
  (canais ?? []).forEach((c) => m.set(c.id, c.nome));
  return m;
}
