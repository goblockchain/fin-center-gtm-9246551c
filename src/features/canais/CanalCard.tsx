import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RingProgress } from "@/components/shared/RingProgress";
import { brl, pct } from "@/lib/format";
import { relativo, dataCurta, urgencia, URGENCIA_TEXT } from "@/lib/datas";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { cn } from "@/lib/utils";
import { estadoMeta, geraDados } from "./estado";
import type { CanalExecucao, CanalKpis, Canal } from "@/types/db";

function Mini({ label, valor }: { label: string; valor: ReactNode }) {
  return (
    <div className="rounded-md bg-card p-2 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-semibold text-fin-dark">{valor}</p>
    </div>
  );
}

export function CanalCard({
  exec,
  kpi,
  canal,
}: {
  exec: CanalExecucao;
  kpi?: CanalKpis;
  canal?: Canal;
}) {
  const em = estadoMeta(exec.estado);
  const mostrarKpi = geraDados(exec.estado) && !!kpi;
  const variancia = Number(exec.variancia ?? 0);
  const u = urgencia(exec.gate_data);
  const taxa = kpi?.taxa_conversao != null ? Number(kpi.taxa_conversao) : null;
  const ganhos = Number(kpi?.ganhos ?? 0);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-fin-dark">{exec.nome}</h3>
              <Badge variant="outline" className="text-[11px]">
                P{exec.prioridade}
              </Badge>
            </div>
            {canal?.responsavel && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {canal.responsavel}
              </p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              em.chip,
            )}
          >
            {exec.estado}
          </span>
        </div>

        {/* Execução + gate */}
        <div className="flex items-center gap-4">
          <RingProgress
            value={Number(exec.pct_execucao ?? 0)}
            colorClass={em.ring}
          >
            <span className="text-lg font-bold text-fin-dark">
              {pct(Number(exec.pct_execucao ?? 0))}
            </span>
            <span className="text-[10px] text-muted-foreground">execução</span>
          </RingProgress>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Tarefas</p>
              <p className="font-medium text-fin-dark">
                {exec.tarefas_feitas}/{exec.total_tarefas} feitas
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gate de decisão</p>
              <p className={cn("font-medium", URGENCIA_TEXT[u])}>
                {relativo(exec.gate_data)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  · {dataCurta(exec.gate_data)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Investimento planejado × executado */}
        <div className="grid grid-cols-3 gap-2 rounded-md bg-secondary/50 p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Planejado</p>
            <p className="font-semibold text-fin-dark">
              {brl(exec.investimento_planejado)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Executado</p>
            <p className="font-semibold text-fin-dark">
              {brl(exec.investimento_executado)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Variância</p>
            <p
              className={cn(
                "font-semibold",
                variancia > 0 ? "text-warning" : "text-fin",
              )}
            >
              {variancia > 0 ? "+" : ""}
              {brl(variancia)}
            </p>
          </div>
        </div>

        {/* KPIs — SÓ em "Gerando dados" (nunca zeros disfarçados) */}
        {mostrarKpi ? (
          <div className="space-y-3 rounded-md border border-fin-light/70 bg-fin-light/10 p-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Contato → reunião
                </p>
                <p className="text-2xl font-bold text-fin-dark">
                  {pct(taxa, 1)}
                </p>
              </div>
              <Badge
                variant={
                  taxa != null && taxa >= BASELINE_CONVERSAO
                    ? "success"
                    : "danger"
                }
              >
                {kpi!.multiplo_vs_baseline != null
                  ? `${Number(kpi!.multiplo_vs_baseline).toFixed(1)}× a baseline (2%)`
                  : "vs. baseline 2%"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Mini label="Reuniões" valor={kpi!.reunioes ?? 0} />
              <Mini label="Ganhos" valor={ganhos} />
              <Mini label="MRR ganho" valor={brl(kpi!.mrr_ganho)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Mini label="CAC" valor={kpi!.cac != null ? brl(kpi!.cac) : "—"} />
              <Mini
                label="ROI"
                valor={
                  ganhos > 0 && kpi!.roi != null ? pct(Number(kpi!.roi)) : "—"
                }
              />
            </div>
          </div>
        ) : (
          <p className="rounded-md bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            KPIs aparecem quando o canal gera dado real de conversão (estado
            “Gerando dados”). Nunca mostramos zeros como métrica.
          </p>
        )}

        {canal?.hipotese && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            💡 {canal.hipotese}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
