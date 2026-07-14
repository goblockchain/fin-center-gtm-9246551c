import { PageHeader } from "@/components/shared/PageHeader";
import { GatesPanel } from "@/features/roadmap/GatesPanel";
import { Gantt } from "@/features/roadmap/Gantt";
import { ProjetosPanel } from "@/features/roadmap/ProjetosPanel";
import { CustosCanais } from "@/features/economia/CustosCanais";
import { MetasMensais } from "@/features/economia/MetasMensais";
import { TarefasList } from "@/features/tarefas/TarefasList";

export function RoadmapPage() {
  return (
    <div>
      <PageHeader
        title="Roadmap"
        description="Timeline da sprint, gates, tarefas e economia — tudo em um só lugar. Cálculos (conversão vs 2%, CAC, ROI) são automáticos."
      />
      <div className="space-y-8">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fin-dark">
            Gates de decisão
          </h2>
          <GatesPanel />
        </section>

        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fin-dark">
              Linha do tempo
            </h2>
            <p className="text-xs text-muted-foreground">
              Uma barra por projeto cadastrado. Cores: a fazer, fazendo, feito,
              perto do prazo (âmbar) e atrasado (vermelho). Edite os campos
              abaixo — a timeline acompanha.
            </p>
          </div>
          <div className="space-y-4">
            <Gantt />
            <ProjetosPanel />
          </div>
        </section>

        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fin-dark">
              Tarefas da sprint
            </h2>
            <p className="text-xs text-muted-foreground">
              Agrupadas por frente. A tarefa fica travada até a dependência ficar
              pronta. Importe um CSV para substituir toda a sprint de uma vez.
            </p>
          </div>
          <TarefasList />
        </section>

        <section>
          <div className="mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-fin-dark">
              Custos por canal — economia itemizada
            </h2>
            <p className="text-xs text-muted-foreground">
              Lance horas, ferramentas, mídia, comissão e operacional. Alimentam
              o CAC, Payback e ROI na tabela “Performance por canal” do Dashboard.
            </p>
          </div>
          <CustosCanais />
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
