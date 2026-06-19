import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tarefa, StatusTarefa, Update, Insert } from "@/types/db";

export type TarefaComCanal = Tarefa & {
  canal: { nome: string; slug: string } | null;
};

export function useTarefas() {
  return useQuery({
    queryKey: ["tarefas"],
    queryFn: async (): Promise<TarefaComCanal[]> => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("*, canal:canais(nome,slug)")
        .order("ordem")
        .returns<TarefaComCanal[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAtualizarStatusTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: StatusTarefa }) => {
      const { error } = await supabase
        .from("tarefas")
        .update({ status: vars.status })
        .eq("id", vars.id);
      if (error) throw error;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["tarefas"] });
      const prev = qc.getQueryData<TarefaComCanal[]>(["tarefas"]);
      qc.setQueryData<TarefaComCanal[]>(["tarefas"], (old) =>
        old?.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tarefas"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] }); // % execução muda
    },
  });
}

/** Cria uma tarefa (frente/canal, prazos, dependência). */
export function useCriarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Insert<"tarefas">) => {
      const { error } = await supabase.from("tarefas").insert(t);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tarefas"] });
      qc.invalidateQueries({ queryKey: ["canal_execucao"] });
    },
  });
}

/** Edita os campos de uma tarefa (título, responsável, datas/prazo). */
export function useAtualizarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Update<"tarefas"> }) => {
      const { error } = await supabase
        .from("tarefas")
        .update(vars.patch)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tarefas"] });
    },
  });
}
