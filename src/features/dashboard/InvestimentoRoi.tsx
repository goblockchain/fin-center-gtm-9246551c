import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { brl, pct } from "@/lib/format";
import { useCanalExecucao, useCanalKpis } from "@/features/canais/api";

export function InvestimentoRoi() {
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const kpiPorId = useMemo(
    () => new Map((kpis ?? []).map((k) => [k.canal_id, k])),
    [kpis],
  );

  const totais = useMemo(() => {
    const ex = execucoes ?? [];
    return {
      planejado: ex.reduce((s, e) => s + Number(e.investimento_planejado ?? 0), 0),
      executado: ex.reduce((s, e) => s + Number(e.investimento_executado ?? 0), 0),
      mrr: (kpis ?? []).reduce((s, k) => s + Number(k.mrr_ganho ?? 0), 0),
    };
  }, [execucoes, kpis]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-fin-dark">
            Investimento &amp; ROI ao vivo
          </h2>
          <div className="text-right text-xs text-muted-foreground">
            <span>
              Sprint: {brl(totais.executado)} / {brl(totais.planejado)}
            </span>
            <span className="ml-2 text-fin">MRR ganho {brl(totais.mrr)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Canal</th>
                <th className="px-2 py-2 text-right font-medium">Planej.</th>
                <th className="px-2 py-2 text-right font-medium">Execut.</th>
                <th className="px-2 py-2 text-right font-medium">Variância</th>
                <th className="px-2 py-2 text-right font-medium">CAC</th>
                <th className="px-4 py-2 text-right font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(execucoes ?? []).map((e) => {
                const kpi = e.canal_id ? kpiPorId.get(e.canal_id) : undefined;
                const variancia = Number(e.variancia ?? 0);
                const ganhos = Number(kpi?.ganhos ?? 0);
                return (
                  <tr key={e.canal_id}>
                    <td className="px-4 py-2 font-medium text-fin-dark">
                      {e.nome}
                    </td>
                    <td className="px-2 py-2 text-right text-muted-foreground">
                      {brl(e.investimento_planejado)}
                    </td>
                    <td className="px-2 py-2 text-right text-fin-dark">
                      {brl(e.investimento_executado)}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-2 text-right",
                        variancia > 0 ? "text-warning" : "text-muted-foreground",
                      )}
                    >
                      {variancia > 0 ? "+" : ""}
                      {brl(variancia)}
                    </td>
                    <td className="px-2 py-2 text-right text-fin-dark">
                      {kpi?.cac != null && ganhos > 0 ? brl(kpi.cac) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {ganhos > 0 && kpi?.roi != null ? (
                        <span
                          className={cn(
                            Number(kpi.roi) >= 0 ? "text-fin" : "text-destructive",
                          )}
                        >
                          {pct(Number(kpi.roi))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground" title="sem fechamento ainda neste canal">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
