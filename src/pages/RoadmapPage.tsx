import { CalendarRange } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export function RoadmapPage() {
  return (
    <div>
      <PageHeader
        title="Roadmap"
        description="Gantt da sprint (16/jun–24/ago) e gates de decisão com dias restantes."
      />
      <EmptyState
        icon={CalendarRange}
        title="A linha do tempo da sprint vem aqui"
        description="O Gantt das frentes e o painel dos 2 gates (18/jul e 22/ago) com contagem regressiva chegam no M6."
        milestone="Chega no M6 · depende do backend (M2)"
      />
    </div>
  );
}
