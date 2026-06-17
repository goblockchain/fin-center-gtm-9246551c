import { MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export function MensagensPage() {
  return (
    <div>
      <PageHeader
        title="Mensagens"
        description="Modelos por canal e estágio, com variáveis {nome}, {cafe}, {dor} e variante A/B."
      />
      <EmptyState
        icon={MessageSquareText}
        title="Biblioteca de modelos"
        description="Os modelos e o log manual chegam no M7. O Fin Center não envia WhatsApp — apenas registra o status manualmente."
        milestone="Chega no M7 · depende do backend (M2)"
      />
    </div>
  );
}
