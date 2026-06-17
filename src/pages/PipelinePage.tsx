import { KanbanSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export function PipelinePage() {
  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Kanban de oportunidades — de cadastrado a fechado, com filtro por canal."
      />
      <EmptyState
        icon={KanbanSquare}
        title="Pipeline ainda sem oportunidades"
        description="O quadro arrastável (cadastrado → … → fechado-ganho/perdido) chega no M4, depois que a base for importada no CRM."
        milestone="Chega no M4 · depende do backend (M2)"
      />
    </div>
  );
}
