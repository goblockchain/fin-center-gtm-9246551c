import { Radio } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export function CanaisPage() {
  return (
    <div>
      <PageHeader
        title="Canais"
        description="O canal é a unidade central: execução, investimento, KPI e prazo no mesmo card."
      />
      <EmptyState
        icon={Radio}
        title="Os 5 canais aparecem aqui"
        description="Cada card terá anel de % de execução, estado derivado e investimento planejado × executado. O bloco de KPIs só surge quando há dado real (estado “Gerando dados”)."
        milestone="Chega no M5 · depende do backend (M2)"
      />
    </div>
  );
}
