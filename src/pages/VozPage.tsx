import { Quote } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export function VozPage() {
  return (
    <div>
      <PageHeader
        title="Voz do Cliente"
        description="Depoimentos, mensagens, narrativas e relatórios — prova vinculada à conta."
      />
      <EmptyState
        icon={Quote}
        title="As provas dos clientes vêm aqui"
        description="Registros com upload de imagem, tags de uso e “fixar como prova” chegam no M8 — e aparecem também na ficha da conta de origem."
        milestone="Chega no M8 · depende do backend (M2)"
      />
    </div>
  );
}
