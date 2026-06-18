import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ModeloMensagem, StatusMensagem, EstagioOport } from "@/types/db";

export type ModeloComCanal = ModeloMensagem & {
  canal: { nome: string; slug: string } | null;
};

export type LogComRefs = {
  id: string;
  status_manual: StatusMensagem;
  variante: string | null;
  enviado_em: string | null;
  observacao: string | null;
  autor: string | null;
  created_at: string;
  conta: { nome: string } | null;
  modelo: { titulo: string } | null;
  canal: { nome: string } | null;
};

export function useModelos(canalId: string | "all", estagio: string | "all") {
  return useQuery({
    queryKey: ["modelos", canalId, estagio],
    queryFn: async (): Promise<ModeloComCanal[]> => {
      let q = supabase
        .from("modelos_mensagem")
        .select("*, canal:canais(nome,slug)")
        .eq("ativo", true)
        .order("created_at");
      if (canalId !== "all") q = q.eq("canal_id", canalId);
      if (estagio !== "all") q = q.eq("estagio", estagio as EstagioOport);
      const { data, error } = await q.returns<ModeloComCanal[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMensagensLog() {
  return useQuery({
    queryKey: ["mensagens_log"],
    queryFn: async (): Promise<LogComRefs[]> => {
      const { data, error } = await supabase
        .from("mensagens_log")
        .select(
          "id,status_manual,variante,enviado_em,observacao,autor,created_at, conta:contas(nome), modelo:modelos_mensagem(titulo), canal:canais(nome)",
        )
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<LogComRefs[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBuscarContas(termo: string) {
  return useQuery({
    queryKey: ["contas", "busca-rapida", termo],
    enabled: termo.trim().length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("id,nome,bairro")
        .ilike("nome", `%${termo.trim()}%`)
        .order("nome")
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRegistrarLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      modelo_id: string;
      canal_id: string | null;
      conta_id: string | null;
      variante: string | null;
      status_manual: StatusMensagem;
      observacao: string | null;
      autor: string | null;
    }) => {
      const enviado_em =
        vars.status_manual === "enviado" || vars.status_manual === "respondido"
          ? new Date().toISOString()
          : null;
      const { error } = await supabase
        .from("mensagens_log")
        .insert({ ...vars, enviado_em });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mensagens_log"] });
    },
  });
}
