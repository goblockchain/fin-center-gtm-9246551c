import { PageHeader } from "@/components/shared/PageHeader";
import { GatesPanel } from "@/features/roadmap/GatesPanel";
import { Gantt } from "@/features/roadmap/Gantt";
import { InvestimentosCanais } from "@/features/roadmap/InvestimentosCanais";
import { CustosCanais } from "@/features/economia/CustosCanais";
import { EconomiaCanais } from "@/features/economia/EconomiaCanais";
import { MetasMensais } from "@/features/economia/MetasMensais";

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
        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fin-dark">
              Custos por canal — economia itemizada
            </h2>
            <p className="text-xs text-muted-foreground">
              Lance horas, ferramentas, mídia, comissão e operacional. Alimentam
              CAC, MRR/hora, ARR, Payback e ROI por canal (calculados na view).
            </p>
          </div>
          <div className="space-y-4">
            <CustosCanais />
            <EconomiaCanais />
          </div>
        </section>
        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fin-dark">
              Metas mensais
            </h2>
            <p className="text-xs text-muted-foreground">
              A meta de MRR do mês alimenta o card “Meta do mês” no Dashboard (%
              atingido vs o realizado no mês).
            </p>
          </div>
          <MetasMensais />
        </section>
      </div>
    </div>
  );
}
