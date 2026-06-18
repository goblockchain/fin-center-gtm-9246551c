import { useMemo } from "react";
import { Telescope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { pct } from "@/lib/format";
import { BASELINE_CONVERSAO } from "@/lib/baseline";
import { diasAte } from "@/lib/datas";
import { useFunil, resumoFunil } from "./api";
import { SPRINT_FIM } from "@/features/roadmap/api";

export function Projecao() {
  const { data: funil } = useFunil("all");
  const r = useMemo(() => resumoFunil(funil ?? []), [funil]);

  const usandoBaseline = r.taxaContatoReuniao <= 0;
  const taxa = usandoBaseline ? BASELINE_CONVERSAO : r.taxaContatoReuniao;
  const projReunioes = Math.round(r.ativos * taxa);
  const projBaseline = Math.round(r.ativos * BASELINE_CONVERSAO);
  const taxaGanho = r.reunioes > 0 ? r.ganhos / r.reunioes : 0;
  const projGanhos = Math.round(projReunioes * taxaGanho);
  const semanas = Math.max(0, Math.ceil((diasAte(SPRINT_FIM) ?? 0) / 7));

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <Telescope className="h-4 w-4 text-fin" />
          <h2 className="text-sm font-semibold text-fin-dark">
            Projeção transparente
          </h2>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
            projeção, não fato
          </span>
        </div>

        <p className="text-sm text-fin-dark">
          Até 24/ago ({semanas} semanas): <strong>~{projReunioes} reuniões</strong>
          {taxaGanho > 0 && <> e ~{projGanhos} fechamentos</>}.
        </p>
        <p className="text-xs text-muted-foreground">
          Base: {r.ativos} oportunidades ativas × {pct(taxa, 1)}{" "}
          {usandoBaseline
            ? "(usando a baseline — sem dado próprio ainda)"
            : "(sua conversão atual)"}
          .
        </p>
        <p className="text-xs text-muted-foreground">
          Cenário baseline (2%): ~{projBaseline} reuniões — mostrado ao lado para
          transparência.
        </p>
      </CardContent>
    </Card>
  );
}
