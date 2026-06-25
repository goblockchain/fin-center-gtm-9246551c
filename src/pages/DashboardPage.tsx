import { Link } from "react-router-dom";
import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRealtime } from "@/hooks/useRealtime";
import { FocoHoje } from "@/features/dashboard/FocoHoje";
import { VisaoExecutiva } from "@/features/dashboard/VisaoExecutiva";
import { PerformanceCanais } from "@/features/dashboard/PerformanceCanais";
import { Recomendacoes } from "@/features/dashboard/Recomendacoes";
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

/** Divisor de grupo — dá hierarquia/narrativa ao dashboard. */
function Grupo({ titulo, hint }: { titulo: string; hint?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-border pb-2 pt-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-fin-dark">
        {titulo}
      </h2>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

export function DashboardPage() {
  useRealtime(RT_TABELAS, RT_KEYS);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Receita por canal, ao vivo. De onde vêm os clientes, qual canal rende mais e onde focar agora."
        actions={
          <Link
            to="/relatorio"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-fin-dark transition-colors hover:bg-secondary"
          >
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Link>
        }
      />

      {/* Ação primeiro, depois os números do topo */}
      <FocoHoje />
      <VisaoExecutiva />

      {/* Decisão de receita: qual canal escalar */}
      <Grupo titulo="Desempenho por canal" hint="onde investir — CAC, MRR e ROI" />
      <PerformanceCanais />
      <Recomendacoes />

      {/* Saúde comercial: onde estão os negócios agora */}
      <Grupo titulo="Saúde do pipeline" hint="onde estão os negócios agora" />
      <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
        <Funil />
        <FunilDistribuicao />
      </div>
      <FunilPorCanal />
      <AtividadeSemana />

      {/* Trajetória: semana a semana e para onde vai */}
      <Grupo titulo="Evolução no tempo" hint="semana a semana e projeção" />
      <EvolucaoSemanal />
      <TendenciasCanais />
      <Projecao />
    </div>
  );
}
