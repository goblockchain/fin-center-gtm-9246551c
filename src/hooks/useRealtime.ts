import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Assina mudanças no Postgres (Supabase Realtime) e invalida os caches do
 * TanStack Query — a fonte da verdade é o banco; a UI só refaz o fetch.
 * Mover uma oportunidade p/ fechado_ganho em outra aba atualiza o Dashboard aqui.
 */
export function useRealtime(
  tabelas: string[],
  queryKeys: readonly (readonly unknown[])[],
) {
  const qc = useQueryClient();
  useEffect(() => {
    const canal = supabase.channel("fin-dashboard-rt");
    for (const t of tabelas) {
      canal.on(
        "postgres_changes",
        { event: "*", schema: "public", table: t },
        () => {
          for (const key of queryKeys) qc.invalidateQueries({ queryKey: key });
        },
      );
    }
    canal.subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
    // tabelas/queryKeys são constantes (módulo) — assina uma vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
