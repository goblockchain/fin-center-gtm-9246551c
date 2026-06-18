import { PageHeader } from "@/components/shared/PageHeader";
import { GatesPanel } from "@/features/roadmap/GatesPanel";
import { Gantt } from "@/features/roadmap/Gantt";

export function RoadmapPage() {
  return (
    <div>
      <PageHeader
        title="Roadmap"
        description="Sprint de Validação de Canais (16/jun–24/ago) e os 2 gates de decisão."
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
      </div>
    </div>
  );
}
