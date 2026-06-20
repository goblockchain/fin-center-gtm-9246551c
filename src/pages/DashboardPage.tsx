import { PageHeader } from "@/components/shared/PageHeader";
import { useRealtime } from "@/hooks/useRealtime";
import { FocoHoje } from "@/features/dashboard/FocoHoje";
import { VisaoExecutiva } from "@/features/dashboard/VisaoExecutiva";
import { PerformanceCanais } from "@/features/dashboard/PerformanceCanais";
import { Recomendacoes } from "@/features/dashboard/Recomendacoes";
import { HeatmapCanais } from "@/features/dashboard/HeatmapCanais";
import { Funil } from "@/features/dashboard/Funil";
import { FunilDistribuicao } from "@/features/dashboard/FunilDistribuicao";
import { FunilPorCanal } from "@/features/dashboard/FunilPorCanal";
import { AtividadeSemana } from "@/features/dashboard/AtividadeSemana";
import { EvolucaoSemanal } from "@/features/dashboard/EvolucaoSemanal";
import { TendenciasCanais } from "@/features/dashboard/TendenciasCanais";
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
  ["pipeline_semana"],
] as const;

export function DashboardPage() {
  useRealtime(RT_TABELAS, RT_KEYS);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Receita por canal, ao vivo. De onde vêm os clientes, qual canal rende mais e onde focar agora."
      />

      {/* Ação primeiro */}
      <FocoHoje />

      {/* Seção 1 — Visão executiva (receita + período + origem) */}
      <VisaoExecutiva />

      {/* Seção 2 — Performance por canal */}
      <PerformanceCanais />

      {/* Seção 10 — Recomendações · Seção 9 — Heatmap */}
      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
        <Recomendacoes />
        <HeatmapCanais />
      </div>

      {/* Saúde do pipeline: funil ao vivo + distribuição de contatos */}
      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
        <Funil />
        <FunilDistribuicao />
      </div>

      {/* Seção 3 — Funil por canal */}
      <FunilPorCanal />

      {/* Atividade semanal do pipe (contatos/reuniões/fechamentos) + filtro por canal */}
      <AtividadeSemana />

      {/* Rastreio semanal (grava toda sexta) + Seção 8 — Tendências */}
      <EvolucaoSemanal />
      <TendenciasCanais />

      {/* Projeção transparente */}
      <Projecao />
    </div>
  );
}
