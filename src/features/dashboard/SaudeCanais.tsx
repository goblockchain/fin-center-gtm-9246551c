import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { pct } from "@/lib/format";
import { relativo, type Urgencia, URGENCIA_TEXT } from "@/lib/datas";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { useCanalExecucao, useCanalKpis } from "@/features/canais/api";
import { estadoMeta } from "@/features/canais/estado";
import type { CanalExecucao, CanalKpis } from "@/types/db";

function frase(
  exec: CanalExecucao,
  kpi?: CanalKpis,
): { texto: string; urgencia: Urgencia } {
  if (exec.estado !== "Gerando dados") {
    return {
      texto: `${exec.estado} — ${pct(Number(exec.pct_execucao ?? 0))} executado. Gate ${relativo(exec.gate_data)}.`,
      urgencia: "ok",
    };
  }
  const taxa = kpi?.taxa_conversao != null ? Number(kpi.taxa_conversao) : 0;
  const mult =
    kpi?.multiplo_vs_baseline != null
      ? Number(kpi.multiplo_vs_baseline)
      : taxa / BASELINE_CONVERSAO;
  if (taxa < BASELINE_CONVERSAO)
    return {
      texto: `⚠️ Risco: conversão ${pct(taxa, 1)} (abaixo dos 2%). Candidato a matar no gate (${relativo(exec.gate_data)}).`,
      urgencia: "vencido",
    };
  if (taxa < 2 * BASELINE_CONVERSAO)
    return {
      texto: `No nível do frio (${pct(taxa, 1)}). Iterar a mensagem antes do gate.`,
      urgencia: "perto",
    };
  return {
    texto: `✅ Forte: ${pct(taxa, 1)} (${mult.toFixed(1)}× a baseline). Candidato a escalar.`,
    urgencia: "ok",
  };
}

export function SaudeCanais() {
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const kpiPorId = useMemo(
    () => new Map((kpis ?? []).map((k) => [k.canal_id, k])),
    [kpis],
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-fin-dark">
            Saúde dos canais
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {(execucoes ?? []).map((e) => {
            const kpi = e.canal_id ? kpiPorId.get(e.canal_id) : undefined;
            const f = frase(e, kpi);
            const em = estadoMeta(e.estado);
            return (
              <li key={e.canal_id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-fin-dark">{e.nome}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      em.chip,
                    )}
                  >
                    {e.estado}
                  </span>
                </div>
                <p className={cn("mt-1 text-sm", URGENCIA_TEXT[f.urgencia])}>
                  {f.texto}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pct(Number(e.pct_execucao ?? 0))} executado ·{" "}
                  {e.estado === "Gerando dados" && kpi?.taxa_conversao != null
                    ? `conversão ${pct(Number(kpi.taxa_conversao), 1)} (vs 2%)`
                    : "sem conversão medível"}{" "}
                  · gate {relativo(e.gate_data)}
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
