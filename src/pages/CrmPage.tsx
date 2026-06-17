import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export function CrmPage() {
  return (
    <div>
      <PageHeader
        title="CRM"
        description="Contas (cafeterias), contatos e interações — filtráveis por temperatura e canal."
      />
      <EmptyState
        icon={Users}
        title="Sua base ainda não foi importada"
        description="A tabela de contas, a ficha com contatos/interações e o botão Importar base (CSV) chegam no M3."
        milestone="Chega no M3 · depende do backend (M2)"
      />
    </div>
  );
}
