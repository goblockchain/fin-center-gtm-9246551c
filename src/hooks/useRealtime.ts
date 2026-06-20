import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Assina mudanças no Postgres (Supabase Realtime) e invalida os caches do
 * TanStack Query — a fonte da verdade é o banco; a UI só refaz o fetch.
 * Mover uma oportunidade p/ fechado_ganho em outra aba atualiza o Dashboard aqui.
 *
 * `queryKeys` é lido por ref (o callback sempre usa o valor mais recente, sem
 * re-assinar a cada render — mesmo que o caller passe arrays inline). A assinatura
 * só é refeita quando o CONJUNTO de tabelas muda.
 */
export function useRealtime(
  tabelas: string[],
  queryKeys: readonly (readonly unknown[])[],
) {
  const qc = useQueryClient();
  const keysRef = useRef(queryKeys);
  keysRef.current = queryKeys;

  const tabelasKey = tabelas.join(",");
  useEffect(() => {
    const canal = supabase.channel(`fin-rt-${tabelasKey}`);
    for (const t of tabelasKey.split(",").filter(Boolean)) {
      canal.on(
        "postgres_changes",
        { event: "*", schema: "public", table: t },
        () => {
          for (const key of keysRef.current)
            qc.invalidateQueries({ queryKey: key });
        },
      );
    }
    canal.subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [tabelasKey, qc]);
}
