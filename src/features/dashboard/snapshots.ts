import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type SnapshotCanal = {
  canal_id: string | null;
  slug: string | null;
  nome: string | null;
  estado: string | null;
  total_oport: number | null;
  contatados: number | null;
  reunioes: number | null;
  ganhos: number | null;
  investido: number | null;
  taxa_conversao: number | null;
  mrr_ganho: number | null;
  cac: number | null;
  roi: number | null;
};

export type Snapshot = {
  id: string;
  ref_date: string;
  capturado_em: string;
  total_contas: number;
  total_oport: number;
  contatados: number;
  reunioes: number;
  ganhos: number;
  perdidos: number;
  mrr_ganho: number;
  investido: number;
  conversao: number | null;
  por_canal: SnapshotCanal[];
  origem: string;
};

export const snapshotsKey = ["snapshots"] as const;

/** Histórico de snapshots (mais recente primeiro). */
export function useSnapshots() {
  return useQuery({
    queryKey: snapshotsKey,
    queryFn: async (): Promise<Snapshot[]> => {
      const { data, error } = await supabase
        .from("snapshots_semanais")
        .select("*")
        .order("ref_date", { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as unknown as Snapshot[];
    },
  });
}

/** Captura manual (mesma função do cron de sexta, com origem 'manual'). */
export function useCapturarSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("capturar_snapshot_semanal", {
        p_origem: "manual",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: snapshotsKey }),
  });
}
