import { PageHeader } from "@/components/shared/PageHeader";
import { useRealtime } from "@/hooks/useRealtime";
import { ComunidadeSecao } from "@/features/crescimento/ComunidadeSecao";
import { ParceirosSecao } from "@/features/crescimento/ParceirosSecao";
import { EventosSecao } from "@/features/crescimento/EventosSecao";

export function CrescimentoPage() {
  // Mantém o funil derivado da comunidade ao vivo quando o pipeline muda.
  useRealtime(["oportunidades"], [["canal_economia"], ["canal_execucao"]]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Crescimento"
        description="Comunidade, parcerias e eventos. Dados próprios de cada frente — o funil de receita segue vindo das oportunidades por canal."
      />
      <ComunidadeSecao />
      <ParceirosSecao />
      <EventosSecao />
    </div>
  );
}
