import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { PipelineSemana } from "@/types/db";

export type SemanaAtividade = {
  semana: string;
  contatos: number;
  reunioes: number;
  fechamentos: number;
};

/**
 * Agrega as linhas da view por semana, filtrando por canal ("all" = todos).
 * Soma contatos/reuniões/fechamentos, ordena da semana mais recente e limita a 12.
 */
export function agregarSemanas(
  rows: PipelineSemana[],
  canalId: string,
): { semanas: SemanaAtividade[]; totais: Omit<SemanaAtividade, "semana"> } {
  const filtradas =
    canalId === "all" ? rows : rows.filter((r) => r.canal_id === canalId);
  const map = new Map<
    string,
    { contatos: number; reunioes: number; fechamentos: number }
  >();
  filtradas.forEach((r) => {
    if (!r.semana) return;
    const cur = map.get(r.semana) ?? { contatos: 0, reunioes: 0, fechamentos: 0 };
    cur.contatos += Number(r.contatos ?? 0);
    cur.reunioes += Number(r.reunioes ?? 0);
    cur.fechamentos += Number(r.fechamentos ?? 0);
    map.set(r.semana, cur);
  });
  const semanas = [...map.entries()]
    .map(([semana, v]) => ({ semana, ...v }))
    .sort((a, b) => b.semana.localeCompare(a.semana))
    .slice(0, 12);
  const totais = semanas.reduce(
    (a, s) => ({
      contatos: a.contatos + s.contatos,
      reunioes: a.reunioes + s.reunioes,
      fechamentos: a.fechamentos + s.fechamentos,
    }),
    { contatos: 0, reunioes: 0, fechamentos: 0 },
  );
  return { semanas, totais };
}

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
