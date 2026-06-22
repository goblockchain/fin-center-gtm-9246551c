import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useCanais,
  useCanalExecucao,
  useCanalKpis,
} from "@/features/canais/api";
import { CanalCard } from "@/features/canais/CanalCard";
import { CanaisResumo } from "@/features/canais/CanaisResumo";

export function CanaisPage() {
  const { data: canais } = useCanais();
  const { data: execucoes, isLoading } = useCanalExecucao();
  const { data: kpis } = useCanalKpis();

  const canalById = useMemo(
    () => new Map((canais ?? []).map((c) => [c.id, c])),
    [canais],
  );
  const kpiById = useMemo(
    () => new Map((kpis ?? []).map((k) => [k.canal_id, k])),
    [kpis],
  );

  return (
    <div>
      <PageHeader
        title="Canais"
        description="Cada canal em um card só: o que já foi feito, quanto custou, o resultado e o prazo."
      />

      <CanaisResumo />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando canais…
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(execucoes ?? []).map((exec, i) => (
            <CanalCard
              key={exec.canal_id ?? i}
              exec={exec}
              kpi={exec.canal_id ? kpiById.get(exec.canal_id) : undefined}
              canal={exec.canal_id ? canalById.get(exec.canal_id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
