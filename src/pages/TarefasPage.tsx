import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export function TarefasPage() {
  return (
    <div>
      <PageHeader
        title="Tarefas"
        description="As 29 tarefas da sprint, por canal — com dependências e prazos coloridos."
      />
      <EmptyState
        icon={ListChecks}
        title="As tarefas chegam por canal"
        description="Cada tarefa mostra prazo em linguagem humana (“em 2 dias”, “atrasado há 1 dia”) e fica bloqueada enquanto a dependência não está “feito”."
        milestone="Chega no M6 · depende do backend (M2)"
      />
    </div>
  );
}
