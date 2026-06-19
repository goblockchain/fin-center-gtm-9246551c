import { PageHeader } from "@/components/shared/PageHeader";
import { GatesPanel } from "@/features/roadmap/GatesPanel";
import { Gantt } from "@/features/roadmap/Gantt";
import { InvestimentosCanais } from "@/features/roadmap/InvestimentosCanais";

export function RoadmapPage() {
  return (
    <div>
      <PageHeader
        title="Roadmap"
        description="A linha do tempo se molda aos gates e tarefas que você cadastrar. As fórmulas (baseline 2%, CAC, ROI) seguem fixas."
      />
      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fin-dark">
            Gates de decisão
          </h2>
          <GatesPanel />
        </section>
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fin-dark">
            Linha do tempo
          </h2>
          <Gantt />
        </section>
        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fin-dark">
              Modelo dos canais — investimento → CAC
            </h2>
            <p className="text-xs text-muted-foreground">
              O que você ajustar aqui entra direto no CAC (executado ÷ ganhos).
              Ex.: R$100/lead × nº de leads = investimento executado.
            </p>
          </div>
          <InvestimentosCanais />
        </section>
      </div>
    </div>
  );
}
