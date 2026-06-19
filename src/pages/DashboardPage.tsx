import { PageHeader } from "@/components/shared/PageHeader";
import { useRealtime } from "@/hooks/useRealtime";
import { FocoHoje } from "@/features/dashboard/FocoHoje";
import { SaudeCanais } from "@/features/dashboard/SaudeCanais";
import { Funil } from "@/features/dashboard/Funil";
import { FunilDistribuicao } from "@/features/dashboard/FunilDistribuicao";
import { InvestimentoRoi } from "@/features/dashboard/InvestimentoRoi";
import { Projecao } from "@/features/dashboard/Projecao";

// Tabelas assinadas no Realtime e as query keys invalidadas a cada evento.
const RT_TABELAS = [
  "oportunidades",
  "tarefas",
  "gates",
  "investimentos",
  "voz_do_cliente",
  "contas",
];
const RT_KEYS = [
  ["canal_execucao"],
  ["canal_kpis"],
  ["funil"],
  ["tarefas"],
  ["gates"],
  ["oportunidades"],
] as const;

export function DashboardPage() {
  useRealtime(RT_TABELAS, RT_KEYS);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="O dia começa pela ação. Tudo ao vivo — muda sozinho quando o pipeline muda."
      />

      {/* 1. Foco de hoje (ação antes de qualquer gráfico) */}
      <FocoHoje />

      {/* 2. Saúde dos canais · 3. Funil ao vivo */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SaudeCanais />
        <Funil />
      </div>

      {/* Distribuição de contatos (pizza + números) */}
      <FunilDistribuicao />

      {/* 4. Investimento & ROI */}
      <InvestimentoRoi />

      {/* 5. Projeção transparente */}
      <Projecao />
    </div>
  );
}
