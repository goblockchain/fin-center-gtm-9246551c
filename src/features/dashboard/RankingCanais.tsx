import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { brl, pct } from "@/lib/format";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { useCanalExecucao, useCanalKpis } from "@/features/canais/api";

type Reco = "Escalar" | "Iterar" | "Matar" | "Aguardando dado";

const RECO_META: Record<Reco, { chip: string }> = {
  Escalar: { chip: "bg-fin-light text-fin-dark" },
  Iterar: { chip: "bg-amber-100 text-amber-800" },
  Matar: { chip: "bg-destructive/15 text-destructive" },
  "Aguardando dado": { chip: "bg-muted text-muted-foreground" },
};

// Decisão de gate: forte (≥2× a baseline) escala, no nível do frio itera,
// abaixo dos 2% mata. Sem dado real, ainda não dá para decidir.
function recomendar(estado: string | null, taxa: number | null): Reco {
  if (estado !== "Gerando dados" || taxa == null) return "Aguardando dado";
  if (taxa >= 2 * BASELINE_CONVERSAO) return "Escalar";
  if (taxa >= BASELINE_CONVERSAO) return "Iterar";
  return "Matar";
}

export function RankingCanais() {
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();

  const linhas = useMemo(() => {
    const kpiPorId = new Map((kpis ?? []).map((k) => [k.canal_id, k]));
    const rows = (execucoes ?? []).map((e) => {
      const kpi = e.canal_id ? kpiPorId.get(e.canal_id) : undefined;
      const taxa =
        kpi?.taxa_conversao != null ? Number(kpi.taxa_conversao) : null;
      const mult =
        kpi?.multiplo_vs_baseline != null
          ? Number(kpi.multiplo_vs_baseline)
          : null;
      return {
        id: e.canal_id,
        nome: e.nome,
        estado: e.estado,
        taxa,
        mult,
        reunioes: Number(kpi?.reunioes ?? e.reunioes_ou_mais ?? 0),
        ganhos: Number(e.ganhos ?? 0),
        mrr: Number(kpi?.mrr_ganho ?? 0),
        pct: Number(e.pct_execucao ?? 0),
        reco: recomendar(e.estado, taxa),
      };
    });
    // Quem gera dado real vem primeiro (ordenado pelo múltiplo vs baseline);
    // os demais, por % de execução.
    const score = (r: (typeof rows)[number]) =>
      r.estado === "Gerando dados" ? 1000 + (r.mult ?? 0) : r.pct;
    return rows.sort((a, b) => score(b) - score(a));
  }, [execucoes, kpis]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Trophy className="h-4 w-4 text-fin" />
          <h3 className="text-sm font-semibold text-fin-dark">
            Ranking de canais — decisão de gate
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            vs baseline 2%
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">#</th>
                <th className="px-2 py-2 text-left font-medium">Canal</th>
                <th className="px-2 py-2 text-right font-medium">Conversão</th>
                <th className="px-2 py-2 text-right font-medium">Reuniões</th>
                <th className="px-2 py-2 text-right font-medium">Ganhos</th>
                <th className="px-2 py-2 text-right font-medium">MRR</th>
                <th className="px-4 py-2 text-right font-medium">Recomendação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linhas.map((r, i) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-2 py-2 font-medium text-fin-dark">
                    {r.nome}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {r.taxa != null ? (
                      <span className="text-fin-dark">
                        {pct(r.taxa, 1)}
                        {r.mult != null && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {r.mult.toFixed(1)}×
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right text-fin-dark">
                    {r.reunioes}
                  </td>
                  <td className="px-2 py-2 text-right text-fin-dark">
                    {r.ganhos}
                  </td>
                  <td className="px-2 py-2 text-right text-muted-foreground">
                    {r.mrr > 0 ? brl(r.mrr) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        RECO_META[r.reco].chip,
                      )}
                    >
                      {r.reco}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
