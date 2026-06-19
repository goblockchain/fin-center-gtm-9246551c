import { PageHeader } from "@/components/shared/PageHeader";
import { useRealtime } from "@/hooks/useRealtime";
import { FocoHoje } from "@/features/dashboard/FocoHoje";
import { VisaoExecutiva } from "@/features/dashboard/VisaoExecutiva";
import { PerformanceCanais } from "@/features/dashboard/PerformanceCanais";
import { Recomendacoes } from "@/features/dashboard/Recomendacoes";
import { HeatmapCanais } from "@/features/dashboard/HeatmapCanais";
import { SaudeCanais } from "@/features/dashboard/SaudeCanais";
import { Funil } from "@/features/dashboard/Funil";
import { FunilDistribuicao } from "@/features/dashboard/FunilDistribuicao";
import { EvolucaoSemanal } from "@/features/dashboard/EvolucaoSemanal";
import { TendenciasCanais } from "@/features/dashboard/TendenciasCanais";
import { EfetividadeCanal } from "@/features/dashboard/EfetividadeCanal";
import { RankingCanais } from "@/features/dashboard/RankingCanais";
import { EficienciaCanais } from "@/features/dashboard/EficienciaCanais";
import { FunilPorCanal } from "@/features/dashboard/FunilPorCanal";
import { ProjecaoPorCanal } from "@/features/dashboard/ProjecaoPorCanal";
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

      {/* Visão executiva — receita primeiro (seção 1 do Centro de Receita) */}
      <VisaoExecutiva />

      {/* Performance por canal (seção 2) — qual canal gera mais receita */}
      <PerformanceCanais />

      {/* Recomendações automáticas (seção 10) · Heatmap (seção 9) */}
      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
        <Recomendacoes />
        <HeatmapCanais />
      </div>

      {/* 2. Saúde dos canais · 3. Funil ao vivo */}
      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
        <SaudeCanais />
        <Funil />
      </div>

      {/* Distribuição de contatos (pizza + números) */}
      <FunilDistribuicao />

      {/* Rastreio semanal — grava toda sexta na base; compara a evolução */}
      <EvolucaoSemanal />

      {/* Tendências por canal (seção 8) — séries dos snapshots semanais */}
      <TendenciasCanais />

      {/* ===== Demonstrativos por canal ===== */}
      <div className="pt-2">
        <h2 className="text-base font-semibold text-fin-dark">
          Demonstrativos por canal
        </h2>
        <p className="text-xs text-muted-foreground">
          Comparações para a decisão de gate — tudo ao vivo, conversões sempre
          contra a baseline de 2%.
        </p>
      </div>

      {/* Ranking matar / iterar / escalar */}
      <RankingCanais />

      {/* Eficiência do investimento · Funil por canal */}
      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
        <EficienciaCanais />
        <FunilPorCanal />
      </div>

      {/* Efetividade + CAC por canal (filtro) */}
      <EfetividadeCanal />

      {/* Projeção por canal até o gate */}
      <ProjecaoPorCanal />

      {/* 4. Investimento & ROI */}
      <InvestimentoRoi />

      {/* 5. Projeção transparente */}
      <Projecao />
    </div>
  );
}
