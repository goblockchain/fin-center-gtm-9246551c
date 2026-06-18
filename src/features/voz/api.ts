import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { VozDoCliente, Insert, TipoVoz } from "@/types/db";

export type VozComConta = VozDoCliente & { conta: { nome: string } | null };

export type VozFiltro = { tipo: TipoVoz | "all"; soFixadas: boolean };

export function useVozes(filtro: VozFiltro) {
  return useQuery({
    queryKey: ["voz", "lista", filtro],
    queryFn: async (): Promise<VozComConta[]> => {
      let q = supabase
        .from("voz_do_cliente")
        .select("*, conta:contas(nome)")
        .order("created_at", { ascending: false });
      if (filtro.tipo !== "all") q = q.eq("tipo", filtro.tipo);
      if (filtro.soFixadas) q = q.eq("fixado_como_prova", true);
      const { data, error } = await q.returns<VozComConta[]>();
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Provas vinculadas a uma conta (aparecem na ficha). */
export function useVozesDaConta(contaId?: string) {
  return useQuery({
    queryKey: ["voz", "por-conta", contaId ?? ""],
    enabled: !!contaId,
    queryFn: async (): Promise<VozDoCliente[]> => {
      const { data, error } = await supabase
        .from("voz_do_cliente")
        .select("*")
        .eq("conta_id", contaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCriarVoz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      dados: Insert<"voz_do_cliente">;
      imagem?: File | null;
    }) => {
      let imagem_url = vars.dados.imagem_url ?? null;
      if (vars.imagem) {
        const ext = vars.imagem.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("voz")
          .upload(path, vars.imagem, { upsert: false });
        if (upErr) throw upErr;
        imagem_url = path;
      }
      const { error } = await supabase
        .from("voz_do_cliente")
        .insert({ ...vars.dados, imagem_url });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voz"] }),
  });
}

export function useToggleProva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; fixado: boolean }) => {
      const { error } = await supabase
        .from("voz_do_cliente")
        .update({ fixado_como_prova: vars.fixado })
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voz"] }),
  });
}

/** URL assinada (bucket privado) para exibir a imagem. */
export function useSignedUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["voz", "signed", path],
    enabled: !!path,
    staleTime: 50 * 60_000,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase.storage
        .from("voz")
        .createSignedUrl(path!, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}
