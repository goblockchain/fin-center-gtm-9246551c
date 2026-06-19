import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { brl, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { relativo } from "@/lib/datas";
import { useCanais, useCanalExecucao, useCanalKpis } from "@/features/canais/api";

function Metrica({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-md bg-secondary/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-lg font-bold",
          destaque ? "text-fin" : "text-fin-dark",
        )}
      >
        {valor}
      </p>
    </div>
  );
}

export function EfetividadeCanal() {
  const { data: canais } = useCanais();
  const { data: execucoes } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();
  const [canalId, setCanalId] = useState<string>("");

  useEffect(() => {
    if (canais?.length && !canalId) setCanalId(canais[0].id);
  }, [canais, canalId]);

  const exec = useMemo(
    () => execucoes?.find((e) => e.canal_id === canalId),
    [execucoes, canalId],
  );
  const kpi = useMemo(
    () => kpis?.find((k) => k.canal_id === canalId),
    [kpis, canalId],
  );

  const taxa = kpi?.taxa_conversao != null ? Number(kpi.taxa_conversao) : null;
  const ganhos = Number(kpi?.ganhos ?? 0);
  const mult = kpi?.multiplo_vs_baseline != null ? Number(kpi.multiplo_vs_baseline) : null;
  const gerandoDados = exec?.estado === "Gerando dados";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-fin-dark">
            Efetividade por canal
          </h2>
          <Select value={canalId} onValueChange={setCanalId}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              {(canais ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!exec ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Selecione um canal.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{exec.estado}</Badge>
              <span className="text-xs text-muted-foreground">
                {pct(Number(exec.pct_execucao ?? 0))} executado · gate{" "}
                {relativo(exec.gate_data)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metrica label="Leads" valor={Number(exec.total_oport ?? 0)} />
              <Metrica label="Contatados" valor={Number(exec.contatados ?? 0)} />
              <Metrica label="Reuniões" valor={Number(kpi?.reunioes ?? 0)} />
              <Metrica label="Ganhos" valor={ganhos} />
            </div>

            {/* Bloco de efetividade — só com dado real */}
            {gerandoDados ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metrica
                  label="Contato → reunião"
                  valor={
                    <span className="flex items-baseline gap-1">
                      {pct(taxa, 1)}
                      {mult != null && (
                        <span
                          className={cn(
                            "text-xs font-medium",
                            taxa != null && taxa >= BASELINE_CONVERSAO
                              ? "text-fin"
                              : "text-destructive",
                          )}
                        >
                          {mult.toFixed(1)}× vs 2%
                        </span>
                      )}
                    </span>
                  }
                  destaque
                />
                <Metrica
                  label="CAC"
                  valor={kpi?.cac != null && ganhos > 0 ? brl(kpi.cac) : "—"}
                />
                <Metrica
                  label="ROI"
                  valor={
                    ganhos > 0 && kpi?.roi != null ? pct(Number(kpi.roi)) : "—"
                  }
                />
                <Metrica label="MRR ganho" valor={brl(kpi?.mrr_ganho)} />
              </div>
            ) : (
              <p className="rounded-md bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                CAC, ROI e conversão aparecem quando o canal gera dado real
                (estado “Gerando dados”).
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Metrica
                label="Investimento planejado"
                valor={brl(exec.investimento_planejado)}
              />
              <Metrica
                label="Investimento executado"
                valor={brl(exec.investimento_executado)}
              />
              <Metrica
                label="Variância"
                valor={brl(Number(exec.variancia ?? 0))}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
